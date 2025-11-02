from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('manager', 'Manager'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    storage_quota = models.BigIntegerField(default=5368709120)  # 5GB in bytes
    storage_used = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    @property
    def storage_percentage(self):
        return (self.storage_used / self.storage_quota) * 100 if self.storage_quota > 0 else 0