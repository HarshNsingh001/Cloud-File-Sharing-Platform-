from django.urls import path
from .views import (FileListView, upload_file, download_file, delete_file,
                    create_share, access_shared_file, SharedFilesListView)

urlpatterns = [
    path('', FileListView.as_view(), name='file-list'),
    path('upload/', upload_file, name='file-upload'),
    path('/download/', download_file, name='file-download'),
    path('/delete/', delete_file, name='file-delete'),
    path('share/', create_share, name='create-share'),
    path('share//', access_shared_file, name='access-share'),
    path('shared/', SharedFilesListView.as_view(), name='shared-files'),
]