from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import AuditLog
from .serializers import AuditLogSerializer
from users.permissions import IsAdmin

class AuditLogListView(generics.ListAPIView):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['action', 'user', 'resource_type']
    search_fields = ['description', 'user__username']
    ordering_fields = ['timestamp', 'action']
    ordering = ['-timestamp']

class UserAuditLogView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AuditLog.objects.filter(user=self.request.user)