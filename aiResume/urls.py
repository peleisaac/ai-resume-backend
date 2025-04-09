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
from api.views import sign_up, get_all_users, get_user_by_user_id, update_user, delete_user, deactivate_user, activate_user, get_inactive_users, get_active_users, get_all_jobs, get_job_by_job_id, add_new_job, delete_job, activate_job, deactivate_job, update_job, get_inactive_jobs, get_active_jobs, get_all_applications, get_application_by_application_id, add_new_application, get_applications_by_user_id, get_applications_by_job_id, update_application_status, index_view, get_employer_dashboard_metrics, get_jobseeker_dashboard_metrics, file_upload, save_job, return_saved_jobs, get_saved_jobs_by_user, get_all_jobs_by_employer, remove_saved_job

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', index_view),
    path('api/v1/protected/', protected_view),
    path('api/v1/login', obtain_auth_token, name='api_token_auth'),
    path('api/v1/signup', sign_up, name='sign_up'),
    path('api/v1/users', get_all_users, name='get_all_users'),
    path('api/v1/users/<str:user_id>', get_user_by_user_id, name='get_user_by_user_id'),
    path('api/v1/users/active/', get_active_users, name='get_active_users'),
    path('api/v1/users/inactive/', get_inactive_users, name='get_inactive_users'),
    path('api/v1/user/<str:user_id>', update_user, name='update_user'),
    path('api/v1/user/delete/<str:user_id>', delete_user, name='delete_user'),
    path('api/v1/user/deactivate/<str:user_id>', deactivate_user, name='deactivate_user'),
    path('api/v1/user/activate/<str:user_id>', activate_user, name='activate_user'),

    # Jobs APIs
    path('api/v1/jobs', get_all_jobs, name='get_all_jobs'),
    path('api/v1/jobs-by-employer/<str:employer_id>', get_all_jobs_by_employer, name='get_all_jobs_by_employer'),
    path('api/v1/jobs/<str:job_id>', get_job_by_job_id, name='get_job_by_job_id'),
    path('api/v1/job/add', add_new_job, name='add_new_job'),
    path('api/v1/job/delete/<str:job_id>', delete_job, name='delete_job'),
    path('api/v1/job/deactivate/<str:job_id>', deactivate_job, name='deactivate_job'),
    path('api/v1/job/activate/<str:job_id>', activate_job, name='activate_job'),
    path('api/v1/jobs/saved/<str:user_id>', get_saved_jobs_by_user, name='get_saved_jobs_by_user'),
    path('api/v1/job/save', save_job, name='save_job'),
    path('api/v1/jobs/saved/all/', return_saved_jobs, name='return_saved_jobs'),
    path('api/v1/job/<str:job_id>', update_job, name='update_job'),
    path('api/v1/jobs/active/', get_active_jobs, name='get_active_jobs'),
    path('api/v1/jobs/inactive/', get_inactive_jobs, name='get_inactive_jobs'),
    path('api/v1/saved-job/remove', remove_saved_job, name='remove_saved_job'),


    # Applications APIs
    path('api/v1/applications', get_all_applications, name='get_all_applications'),
    path('api/v1/applications/<str:application_id>', get_application_by_application_id, name='get_application_by_application_id'),
    path('api/v1/application/add', add_new_application, name='add_new_application'),
    path('api/v1/applications/by-user/<str:user_id>', get_applications_by_user_id, name='get_applications_by_user_id'),
    path('api/v1/applications/by-job/<str:job_id>', get_applications_by_job_id, name='get_applications_by_job_id'),
    path('api/v1/application/status/<str:application_id>', update_application_status, name='update_application_status'),

    # Dashboard Metrics
    path('api/v1/employer/dashboard-metrics', get_employer_dashboard_metrics, name='employer_dashboard_metrics'),
    path('api/v1/jobseekers/dashboard-metrics', get_jobseeker_dashboard_metrics, name='jobseeker_dashboard_metrics'),

    #Resume Upload
    path('api/v1/user/<str:user_id>/resume/upload', file_upload, name='resume_upload'),

]
