from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import uuid
import os

from .models import File, SharedFile
from .serializers import (FileSerializer, FileUploadSerializer, 
                          SharedFileSerializer, CreateShareSerializer)
from .storage import AzureBlobStorage
from users.permissions import IsOwnerOrAdmin
from audit.utils import log_action
from utils.encryption import encrypt_file, decrypt_file

class FileListView(generics.ListAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return File.objects.filter(owner=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    serializer = FileUploadSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    file = serializer.validated_data['file']
    file_name = serializer.validated_data.get('name', file.name)
    
    # Check file size
    if file.size > settings.MAX_UPLOAD_SIZE:
        return Response({'error': 'File too large'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check storage quota
    user = request.user
    if user.storage_used + file.size > user.storage_quota:
        return Response({'error': 'Storage quota exceeded'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            # Generate unique file path
            file_extension = os.path.splitext(file.name)[1]
            blob_name = f"{user.id}/{uuid.uuid4()}{file_extension}"
            
            # Encrypt file
            encrypted_data = encrypt_file(file.read())
            
            # Upload to Azure Blob
            storage = AzureBlobStorage()
            if not storage.upload_file(encrypted_data, blob_name):
                return Response({'error': 'Upload failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Save to database
            file_obj = File.objects.create(
                owner=user,
                name=file_name,
                file_path=blob_name,
                file_size=file.size,
                file_type=file.content_type,
                is_encrypted=True
            )
            
            # Update storage usage
            user.storage_used += file.size
            user.save()
            
            # Log action
            log_action(user, 'upload', file_obj, f"Uploaded file: {file_name}")
            
            return Response(FileSerializer(file_obj).data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_file(request, file_id):
    file = get_object_or_404(File, id=file_id)
    
    # Check permissions
    if file.owner != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        storage = AzureBlobStorage()
        download_url = storage.generate_download_url(file.file_path, expiry_hours=1)
        
        if not download_url:
            return Response({'error': 'Failed to generate download URL'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Log action
        log_action(request.user, 'download', file, f"Downloaded file: {file.name}")
        
        return Response({'download_url': download_url, 'file_name': file.name})
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_file(request, file_id):
    file = get_object_or_404(File, id=file_id)
    
    # Check permissions
    if file.owner != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        with transaction.atomic():
            # Delete from Azure
            storage = AzureBlobStorage()
            storage.delete_file(file.file_path)
            
            # Update storage usage
            user = file.owner
            user.storage_used -= file.file_size
            user.save()
            
            # Log action
            log_action(request.user, 'delete', file, f"Deleted file: {file.name}")
            
            # Delete from database
            file.delete()
            
            return Response({'message': 'File deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_share(request):
    serializer = CreateShareSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    file = get_object_or_404(File, id=serializer.validated_data['file_id'])
    
    # Check ownership
    if file.owner != request.user:
        return Response({'error': 'You can only share your own files'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Create share
    share_link = str(uuid.uuid4())
    expires_in = serializer.validated_data.get('expires_in_hours')
    expires_at = timezone.now() + timedelta(hours=expires_in) if expires_in else None
    
    shared_file = SharedFile.objects.create(
        file=file,
        shared_by=request.user,
        shared_with_id=serializer.validated_data.get('shared_with_id'),
        permission=serializer.validated_data['permission'],
        share_link=share_link,
        expires_at=expires_at
    )
    
    # Log action
    log_action(request.user, 'share', file, f"Shared file: {file.name}")
    
    return Response(SharedFileSerializer(shared_file).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def access_shared_file(request, share_link):
    shared_file = get_object_or_404(SharedFile, share_link=share_link, is_active=True)
    
    # Check expiration
    if shared_file.is_expired():
        return Response({'error': 'Share link has expired'}, status=status.HTTP_410_GONE)
    
    # Increment access count
    shared_file.access_count += 1
    shared_file.save()
    
    # Generate download URL if permission allows
    download_url = None
    if shared_file.permission == 'download':
        storage = AzureBlobStorage()
        download_url = storage.generate_download_url(shared_file.file.file_path)
    
    return Response({
        'file': FileSerializer(shared_file.file).data,
        'permission': shared_file.permission,
        'download_url': download_url
    })

class SharedFilesListView(generics.ListAPIView):
    serializer_class = SharedFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SharedFile.objects.filter(shared_by=self.request.user)