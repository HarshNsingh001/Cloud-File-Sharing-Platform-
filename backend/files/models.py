from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=50)
    is_encrypted = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.name} - {self.owner.username}"

class SharedFile(models.Model):
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('download', 'Download'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_files')
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_files', null=True, blank=True)
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default='view')
    share_link = models.CharField(max_length=100, unique=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    access_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Share: {self.file.name} by {self.shared_by.username}"
    
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False