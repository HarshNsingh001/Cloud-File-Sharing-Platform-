from django.urls import path
from .views import AuditLogListView, UserAuditLogView

urlpatterns = [
    path('logs/', AuditLogListView.as_view(), name='audit-logs'),
    path('my-logs/', UserAuditLogView.as_view(), name='my-audit-logs'),
]