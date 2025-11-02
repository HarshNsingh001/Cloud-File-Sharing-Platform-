from rest_framework import serializers
from .models import AuditLog
from users.serializers import UserSerializer

class AuditLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'action', 'resource_type', 'resource_id', 
                  'description', 'ip_address', 'user_agent', 'timestamp']
        read_only_fields = ['id', 'timestamp']