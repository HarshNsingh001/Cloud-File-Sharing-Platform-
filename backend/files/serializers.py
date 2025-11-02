from rest_framework import serializers
from .models import File, SharedFile
from users.serializers import UserSerializer

class FileSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = File
        fields = ['id', 'owner', 'name', 'file_path', 'file_size', 'file_type', 
                  'is_encrypted', 'uploaded_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'file_path', 'uploaded_at', 'updated_at']

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    name = serializers.CharField(max_length=255, required=False)

class SharedFileSerializer(serializers.ModelSerializer):
    file = FileSerializer(read_only=True)
    shared_by = UserSerializer(read_only=True)
    shared_with = UserSerializer(read_only=True)
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = SharedFile
        fields = ['id', 'file', 'shared_by', 'shared_with', 'permission', 
                  'share_link', 'expires_at', 'is_active', 'access_count', 
                  'is_expired', 'created_at']
        read_only_fields = ['id', 'share_link', 'access_count', 'created_at']

class CreateShareSerializer(serializers.Serializer):
    file_id = serializers.UUIDField()
    shared_with_id = serializers.IntegerField(required=False, allow_null=True)
    permission = serializers.ChoiceField(choices=['view', 'download'], default='view')
    expires_in_hours = serializers.IntegerField(required=False, allow_null=True)