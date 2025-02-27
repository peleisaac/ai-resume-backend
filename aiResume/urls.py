"""
URL configuration for aiResume project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from api.views import protected_view
from rest_framework.authtoken.views import obtain_auth_token
from api.views import sign_up, get_all_users, get_user_by_user_id, update_user

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/protected/', protected_view),
    path('api/v1/login', obtain_auth_token, name='api_token_auth'),
    path('api/v1/signup', sign_up, name='sign_up'),
    path('api/v1/users', get_all_users, name='get_all_users'),
    path('api/v1/users/<str:user_id>', get_user_by_user_id, name='get_user_by_user_id'),
    path('api/v1/user/<str:user_id>', update_user, name='update_user'),
]
