from django.urls import path
from .views import RegisterView, UserProfileView, UserListView, logout_view

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', logout_view, name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('list/', UserListView.as_view(), name='user-list'),
]