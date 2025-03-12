from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import uuid
from uuid import UUID
from api.models import Users
from api.models import Jobs
from api.models import Applications
from rest_framework import status
from api.status_codes import StatusCode
from .serializers import UserSerializer, JobSerializer

# Create your views here.
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "You have access to this view!"})

@api_view(['POST'])
def sign_up(request):
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        email = request.data.get("email", "")
        msisdn = request.data.get("msisdn", "")
        gender = request.data.get("gender", "")
        password = request.data.get("password", "")
        dob = request.data.get("dob", "")
        region = request.data.get("region", "")
        city = request.data.get("city", "")
        socials = request.data.get("socials", "")
        user_role = request.data.get("user_role", "")
        category_of_interest = request.data.get("category_of_interest", "")
        job_notifications = request.data.get("job_notifications", "")

        user_id = str(uuid.uuid4().hex)
        # Check if the user already exists
        if Users.user_exists(email, msisdn):
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": "User with this email or phone number already exists"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create and save the new user
        user = Users(
            user_id = user_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            msisdn=msisdn,
            gender=gender,
            dob=dob,
            region=region,
            city=city,
            socials=socials,
            user_role=user_role,
            category_of_interest=category_of_interest,
            job_notifications=job_notifications
        )
        user.set_password(password)  # Hash password before saving
        user.save()

        if user:
            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "User created successfully"
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "status_code": StatusCode.INVALID_CREDENTIALS,
                "message": "Failed To Create User"
            }, status=status.HTTP_401_UNAUTHORIZED) 

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_new_job(request):
        title = request.data.get("title")
        description = request.data.get("description")
        category = request.data.get("category")
        contract_type = request.data.get("contract_type")
        experience = request.data.get("experience")
        education_level = request.data.get("education_level")
        region = request.data.get("region")
        city = request.data.get("city")
        no_of_vacancies = request.data.get("no_of_vacancies")
        salary = request.data.get("salary")



        job_id = str(uuid.uuid4().hex)
        # if Job.job_exist(email, msisdn):
        #     return Response({
        #         "status_code": StatusCode.BAD_REQUEST,
        #         "message": "User with this email or phone number already exists"
        #     }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create and save the new job
        job = Jobs(
            job_id = job_id,
            title = title,
            description = description,
            category = category,
            contract_type = contract_type,
            experience = experience,
            education_level = education_level,
            region = region,
            city = city,
            no_of_vacancies = no_of_vacancies,
            salary = salary
        )

        job.save()

        if job:
            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "Job created successfully"
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "status_code": StatusCode.INVALID_CREDENTIALS,
                "message": "Failed To Create Job"
            }, status=status.HTTP_401_UNAUTHORIZED) 


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_new_application(request):
        user_id = request.data.get("user_id")
        job_id = request.data.get("job_id")
        application_status = request.data.get("application_status")


        application_id = str(uuid.uuid4().hex)
        if Applications.application_exists(user_id, job_id):
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": "Application already exists"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create and save the new job
        job = Applications(
            application_id = application_id,
            job_id = job_id,
            user_id = user_id,
            status = application_status
        )

        job.save()

        if job:
            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "Application sent successfully"
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "status_code": StatusCode.INVALID_CREDENTIALS,
                "message": "Failed To send Application"
            }, status=status.HTTP_401_UNAUTHORIZED) 

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = Users.get_all_users()
    users_list = [
        {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "msisdn": user.msisdn,
            "gender": user.gender,
            "dob": user.dob,
            "region": user.region,
            "city": user.city,
            "socials": user.socials,
            "user_role": user.user_role,
            "category_of_interest": user.category_of_interest,
            "job_notifications": user.job_notifications
        }
        for user in users
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Users Retrieved successfully",
                "users": users_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_jobs(request):
    jobs = Jobs.get_all_jobs()
    jobs_list = [
        {
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "education_level": job.education_level,
            "region": job.region,
            "city": job.city,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active
        }
        for job in jobs
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Jobs Retrieved successfully",
                "jobs": jobs_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_applications(request):
    applications = Applications.get_all_applications()
    applications_list = [
        {
            "application_id": application.application_id,
            "user_details": Users.get_user_by_user_id_json_format(application.user_id),
            "job_details": Jobs.get_job_by_job_id_json_format(application.job_id),
            "status": application.status,
            "created_at": application.created_at,
            "updated_at": application.updated_at,
        }
        for application in applications
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Applications Retrieved successfully",
                "applications": applications_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_active_users(request):
    users = Users.get_active_users()
    users_list = [
        {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "msisdn": user.msisdn,
            "gender": user.gender,
            "dob": user.dob,
            "region": user.region,
            "city": user.city,
            "socials": user.socials,
            "user_role": user.user_role,
            "category_of_interest": user.category_of_interest,
            "job_notifications": user.job_notifications
        }
        for user in users
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Active Users Retrieved successfully",
                "users": users_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_active_jobs(request):
    jobs = Jobs.get_active_jobs()
    jobs_list = [
        {
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "education_level": job.education_level,
            "region": job.region,
            "city": job.city,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active
        }
        for job in jobs
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Active Jobs Retrieved successfully",
                "jobs": jobs_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_inactive_users(request):
    users = Users.get_inactive_users()
    users_list = [
        {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "msisdn": user.msisdn,
            "gender": user.gender,
            "dob": user.dob,
            "region": user.region,
            "city": user.city,
            "socials": user.socials,
            "user_role": user.user_role,
            "category_of_interest": user.category_of_interest,
            "job_notifications": user.job_notifications
        }
        for user in users
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Inactive Users Retrieved successfully",
                "users": users_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_inactive_jobs(request):
    jobs = Jobs.get_inactive_jobs()
    jobs_list = [
        {
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "education_level": job.education_level,
            "region": job.region,
            "city": job.city,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active
        }
        for job in jobs
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Inactive Jobs Retrieved successfully",
                "jobs": jobs_list}, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_by_user_id(request, user_id):
    try:
        user_id = user_id # Convert to UUID
    except ValueError:
        return Response({"status_code": status.HTTP_400_BAD_REQUEST, "message": "Invalid user ID format"}, status=status.HTTP_400_BAD_REQUEST)

    user = Users.get_user_by_user_id(user_id)  # Fetch user
    if not user:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    user_data = {
        "user_id": str(user.user_id),  # Ensure UUID is serialized as a string
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "msisdn": user.msisdn,
        "gender": user.gender,
        "dob": user.dob,
        "region": user.region,
        "city": user.city,
        "socials": user.socials,
        "user_role": user.user_role,
        "category_of_interest": user.category_of_interest,
        "job_notifications": user.job_notifications
    }
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "User Details Retrieved successfully",
                     "user": user_data}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_job_by_job_id(request, job_id):
    try:
        job_id = job_id # Convert to UUID
    except ValueError:
        return Response({"status_code": status.HTTP_400_BAD_REQUEST, "message": "Invalid Job ID format"}, status=status.HTTP_400_BAD_REQUEST)
    
    job = Jobs.get_job_by_job_id(job_id)  # Fetch user
    if not job:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    
    job_data = {
         "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "education_level": job.education_level,
            "region": job.region,
            "city": job.city,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active
    }

    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "Job Details Retrieved successfully",
                     "job": job_data}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_application_by_application_id(request, application_id):
    try:
        application_id = application_id # Convert to UUID
    except ValueError:
        return Response({"status_code": status.HTTP_400_BAD_REQUEST, "message": "Invalid Application ID format"}, status=status.HTTP_400_BAD_REQUEST)
    
    application = Applications.get_application_by_application_id(application_id)  # Fetch Application
    if not application:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
    
    application_data = {
            "application_id": application.application_id,
            "user_id": application.user_id,
            "job_id": application.job_id,
            "status": application.status,
            "created_at": application.created_at,
            "updated_at": application.updated_at,
    }

    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "Application Details Retrieved successfully",
                     "application": application_data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_applications_by_user_id(request, user_id):
    try:
        user_id = user_id # Convert to UUID
    except ValueError:
        return Response({"status_code": status.HTTP_400_BAD_REQUEST, "message": "Invalid User ID format"}, status=status.HTTP_400_BAD_REQUEST)
    
    applications = Applications.get_applications_by_user_id(user_id)  # Fetch Application By the user_id
    
    application_list = [{
            "application_id": application.application_id,
            "user_details": Users.get_user_by_user_id_json_format(application.user_id),
            "job_details": Jobs.get_job_by_job_id_json_format(application.job_id),
            "status": application.status,
            "created_at": application.created_at,
            "updated_at": application.updated_at,
    } for application in applications
    ]

    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "Applications Retrieved successfully",
                     "applications": application_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_applications_by_job_id(request, job_id):
    try:
        job_id = job_id # Convert to UUID
    except ValueError:
        return Response({"status_code": status.HTTP_400_BAD_REQUEST, "message": "Invalid Job ID format"}, status=status.HTTP_400_BAD_REQUEST)
    
    applications = Applications.get_applications_by_job_id(job_id)  # Fetch Application By the job_id
    
    application_list = [{
            "application_id": application.application_id,
            "user_details": Users.get_user_by_user_id_json_format(application.user_id),
            "job_details": Jobs.get_job_by_job_id_json_format(application.job_id),
            "status": application.status,
            "created_at": application.created_at,
            "updated_at": application.updated_at,
    } for application in applications]

    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "Applications Retrieved successfully",
                     "applications": application_list}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    user = Users.get_user_by_user_id(user_id)  # Fetch user
    if not user:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Instantiate the serializer with the current user instance and the incoming data.
    # Using partial=True allows for partial updates. If you require all fields, you can remove partial=True.
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "status_code": StatusCode.SUCCESS,
            "message": "User updated successfully",
            "user": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            "status_code": StatusCode.INVALID_CREDENTIALS,
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_job(request, job_id):
    job = Jobs.get_job_by_job_id(job_id)  # Fetch job
    if not job:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Instantiate the serializer with the current job instance and the incoming data.
    # Using partial=True allows for partial updates. If you require all fields, you can remove partial=True.
    serializer = JobSerializer(job, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "status_code": StatusCode.SUCCESS,
            "message": "Job updated successfully",
            "job": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            "status_code": StatusCode.INVALID_CREDENTIALS,
            "message": "Invalid data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    application = Applications.get_application_by_application_id(application_id)  # Fetch application
    if not application:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
    
    application_status = request.data.get('application_status')
    
    application.status = application_status
    application.save()
    
    return Response({
        "status_code": StatusCode.SUCCESS,
        "message": "Application Status updated successfully."
    }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    user = Users.get_user_by_user_id(user_id)  # Fetch user
    if not user:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    # Soft delete: set record_status to 0
    user.record_status = 0
    user.save()
    
    return Response({
        "status_code": StatusCode.SUCCESS,
        "message": "User deleted successfully."
    }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_job(request, job_id):
    job = Jobs.get_job_by_job_id(job_id)  # Fetch job
    if not job:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    # Soft delete: set record_status to 0
    job.record_status = 0
    job.save()
    
    return Response({
        "status_code": StatusCode.SUCCESS,
        "message": "Job deleted successfully."
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def deactivate_user(request, user_id):
    user = Users.get_user_by_user_id(user_id)  # Fetch user
    if not user:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    # Soft delete: set record_status to 0
    user.is_active = 0
    user.save()
    
    return Response({
        "status_code": StatusCode.SUCCESS,
        "message": "User deactivated successfully."
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def deactivate_job(request, job_id):
    job = Jobs.get_job_by_job_id(job_id)  # Fetch job
    if not job:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    # Soft delete: set record_status to 0
    job.is_active = 0
    job.save()
    
    return Response({
        "status_code": StatusCode.SUCCESS,
        "message": "Job deactivated successfully."
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def activate_user(request, user_id):
    user = Users.get_user_by_user_id(user_id)  # Fetch user
    if not user:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    # Soft delete: set record_status to 0
    user.is_active = 1
    user.save()
    
    return Response({
        "status_code": StatusCode.SUCCESS,
        "message": "User activated successfully."
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def activate_job(request, job_id):
    job = Jobs.get_job_by_job_id(job_id)  # Fetch job
    if not job:
        return Response({"status_code": StatusCode.NOT_FOUND, "message": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    
    
    # Soft delete: set record_status to 0
    job.is_active = 1
    job.save()
    
    return Response({
        "status_code": StatusCode.SUCCESS,
        "message": "Job activated successfully."
    }, status=status.HTTP_200_OK)
    
    
