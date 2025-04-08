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
from api.models import SavedJobs
from rest_framework import status
from api.status_codes import StatusCode
from .serializers import UserSerializer, JobSerializer, JSONListField, FileUploadSerializer
import json
from rest_framework.parsers import MultiPartParser, FormParser
from azure.storage.blob import BlobServiceClient
from django.conf import settings

# Create your views here.
@api_view(['GET'])
def index_view(request):
    return Response({"message": "Welcome to AI Resume backend!"})


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "You have access to this view!"})

@api_view(['POST'])
def file_upload(request, user_id):
    try:
        parser_classes = (MultiPartParser, FormParser)
        serializer = FileUploadSerializer(data=request.data)

        user = Users.get_user_by_user_id(user_id)  # Fetch user

        if not user:
            return Response({"status_code": StatusCode.NOT_FOUND, "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if serializer.is_valid():
            file = serializer.validated_data["file"]
            file_name = file.name

            try:
                # Connect to Azure Storage
                blob_service_client = BlobServiceClient.from_connection_string(
                    settings.AZURE_STORAGE_CONNECTION_STRING
                )
                blob_client = blob_service_client.get_blob_client(
                    container=settings.AZURE_CONTAINER_NAME, blob=file_name
                )

                # Upload the file
                blob_client.upload_blob(file.read(), overwrite=True)

                # Get the file URL
                file_url = blob_client.url

                # Update the user's resume URL
                user.resume_url = file_url

                # Save the user
                user.save()

                return Response({
                    "status_code": StatusCode.SUCCESS,
                    "message": "Resume Upload successfully",
                    "file_url": file_url,  # Return the file URL
                    "user_details": Users.get_user_by_user_id_json_format(user_id),

                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def sign_up(request):
    try:
        # Required fields
        if request.data.get("user_role") == "jobseeker":
            required_fields = ["first_name", "last_name", "email", "password"]
        elif request.data.get("user_role") == "employer":
            required_fields = ["company_name", "contact_name", "email", "password"]
        else:
            required_fields = []
        
        missing_fields = [field for field in required_fields if not request.data.get(field)]

        if missing_fields:
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
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
        category_of_interest = json.dumps(request.data.get("category_of_interest", ""))
        contact_name = request.data.get("contact_name")
        company_name = request.data.get("company_name")
        address = request.data.get("address")
        industry = request.data.get("industry")
        company_description = request.data.get("company_description")
        job_notifications = request.data.get("job_notifications", "")

        # category_of_interest = JSONListField(required=False)


        user_id = str(uuid.uuid4().hex)
        # Check if the user already exists
        if Users.user_exists(email):
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": "User with this email already exists"
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
            job_notifications=job_notifications,
            contact_name=contact_name,
            company_name=company_name,
            address=address,
            industry=industry,
            company_description=company_description
        )
        user.set_password(password)  # Hash password before saving
        user.save()

        signed_up_user = user.get_user_by_user_id(user_id)

        if user:
            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "User created successfully",
                "data": signed_up_user
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "status_code": StatusCode.INVALID_CREDENTIALS,
                "message": "Failed To Create User"
            }, status=status.HTTP_401_UNAUTHORIZED) 
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_new_job(request):
    try:
        required_fields = ["employer_id", "title", "description", "category", "contract_type", "experience", "education_level", "requirements", "required_skills", "benefits", "region", "city", "company_name", "no_of_vacancies", "salary"]

        missing_fields = [field for field in required_fields if not request.data.get(field)]

        if missing_fields:
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        employer_id = request.data.get("employer_id", "")
        title = request.data.get("title", "")
        description = request.data.get("description", "")
        category = request.data.get("category", "")
        contract_type = request.data.get("contract_type", "")
        experience = request.data.get("experience", "")
        education_level = request.data.get("education_level", "")
        requirements = json.dumps(request.data.get("requirements"))
        required_skills = json.dumps(request.data.get("required_skills"))
        benefits = json.dumps(request.data.get("benefits"))
        region = request.data.get("region", "")
        city = request.data.get("city", "")
        company_name = request.data.get("company_name", "")
        no_of_vacancies = request.data.get("no_of_vacancies", "")
        salary = request.data.get("salary", "")



        job_id = str(uuid.uuid4().hex)
        # if Job.job_exist(email, msisdn):
        #     return Response({
        #         "status_code": StatusCode.BAD_REQUEST,
        #         "message": "User with this email or phone number already exists"
        #     }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create and save the new job
        job = Jobs(
            employer_id = employer_id,
            job_id = job_id,
            title = title,
            description = description,
            category = category,
            contract_type = contract_type,
            experience = experience,
            education_level = education_level,
            requirements = requirements,
            required_skills = required_skills,
            benefits = benefits,
            region = region,
            city = city,
            no_of_vacancies = no_of_vacancies,
            salary = salary,
            company_name = company_name
        )

        job.save()

        added_job = job.get_job_by_job_id(job_id)

        if job:
            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "Job created successfully",
                "data": added_job
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "status_code": StatusCode.INVALID_CREDENTIALS,
                "message": "Failed To Create Job"
            }, status=status.HTTP_401_UNAUTHORIZED) 
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_new_application(request):
    try:
        required_fields = ["user_id", "job_id", "employer_id", "application_status"]

        missing_fields = [field for field in required_fields if not request.data.get(field)]

        if missing_fields:
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        

        user_id = request.data.get("user_id")
        job_id = request.data.get("job_id")
        employer_id = request.data.get("employer_id")
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
            employer_id = employer_id,
            status = application_status
        )

        job.save()

        added_application = Applications.get_application_by_application_id(application_id) 

        if job:
            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "Application sent successfully",
                "data": added_application
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "status_code": StatusCode.INVALID_CREDENTIALS,
                "message": "Failed To send Application"
            }, status=status.HTTP_401_UNAUTHORIZED) 
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            'resume_url': user.resume_url,
            "is_active": user.is_active,
            "company_name": user.company_name,
            "contact_name": user.contact_name,
            "address": user.address,
            "industry": user.industry,
            "resume_url": user.resume_url,
            "company_description": user.company_description,
            "profile_complete": Users.is_profile_complete(user.user_id, user.user_role),
            "category_of_interest": json.loads(user.category_of_interest) if user.category_of_interest else [],
            "job_notifications": user.job_notifications,
        }
        for user in users
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Users Retrieved successfully",
                "users": users_list}, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_employer_dashboard_metrics(request):
    employer_id = request.data.get("employer_id", "")

    active_jobs = Jobs.get_active_jobs_by_employer(employer_id=employer_id)
    all_applications_count = Applications.get_all_applications_count_for_employer(employer_id=employer_id)
    
    dashboard_metrics_data = {
        "active_jobs": len(active_jobs),
        "all_applications_count": all_applications_count
    }
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "Employer Dashboard Metrics Retrieved successfully",
                "data": dashboard_metrics_data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_jobseeker_dashboard_metrics(request):
    user_id = request.data.get("user_id", "")

    all_applications_count = Applications.get_applications_by_user_id(user_id)
    saved_jobs_count = SavedJobs.get_saved_jobs_by_user_id(user_id)
    
    dashboard_metrics_data = {
        "all_applications_count": len(all_applications_count),
        "saved_jobs_count": len(saved_jobs_count)
    }
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "Job Seeker Dashboard Metrics Retrieved successfully",
                "data": dashboard_metrics_data}, status=status.HTTP_200_OK)

@api_view(['GET'])
# @authentication_classes([TokenAuthentication])
# @permission_classes([IsAuthenticated])
def get_all_jobs(request):
    jobs = Jobs.get_all_jobs()
    jobs_list = [
        {
            "employer_id": job.employer_id,
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "requirements": json.loads(job.requirements) if job.requirements else [],
            "required_skills": json.loads(job.required_skills) if job.required_skills else [],
            "benefits": json.loads(job.benefits) if job.benefits else [],
            "region": job.region,
            "city": job.city,
            "company_name": job.company_name,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active,
            "no_of_applications": Applications.get_number_of_applications_by_job_id(job.job_id)
        }
        for job in jobs
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Jobs Retrieved successfully",
                "jobs": jobs_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
# @authentication_classes([TokenAuthentication])
# @permission_classes([IsAuthenticated])
def get_all_jobs_by_employer(request, employer_id):
    jobs = Jobs.get_active_jobs_by_employer(employer_id)
    jobs_list = [
        {
            "employer_id": job.employer_id,
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "requirements": json.loads(job.requirements) if job.requirements else [],
            "required_skills": json.loads(job.required_skills) if job.required_skills else [],
            "benefits": json.loads(job.benefits) if job.benefits else [],
            "region": job.region,
            "city": job.city,
            "company_name": job.company_name,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active,
            "no_of_applications": Applications.get_number_of_applications_by_job_id(job.job_id)
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
            "is_active": user.is_active,
            "company_name": user.company_name,
            "contact_name": user.contact_name,
            "address": user.address,
            "industry": user.industry,
            "resume_url": user.resume_url,
            "company_description": user.company_description,
            "profile_complete": Users.is_profile_complete(user.user_id, user.user_role),
            "category_of_interest": json.loads(user.category_of_interest) if user.category_of_interest else [],
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
            "employer_id": job.employer_id,
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "education_level": job.education_level,
            "requirements": json.loads(job.requirements) if job.requirements else [],
            "required_skills": json.loads(job.required_skills) if job.required_skills else [],
            "benefits": json.loads(job.benefits) if job.benefits else [],
            "region": job.region,
            "city": job.city,
            "company_name": job.company_name,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active,
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
            'resume_url': user.resume_url,
            "is_active": user.is_active,
            "company_name": user.company_name,
            "contact_name": user.contact_name,
            "address": user.address,
            "industry": user.industry,
            "resume_url": user.resume_url,
            "company_description": user.company_description,
            "profile_complete": Users.is_profile_complete(user.user_id, user.user_role),
            "category_of_interest": json.loads(user.category_of_interest) if user.category_of_interest else [],
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
            "employer_id": job.employer_id,
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "education_level": job.education_level,
            "requirements": json.loads(job.requirements) if job.requirements else [],
            "required_skills": json.loads(job.required_skills) if job.required_skills else [],
            "benefits": json.loads(job.benefits) if job.benefits else [],
            "region": job.region,
            "city": job.city,
            "company_name": job.company_name,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active,
        }
        for job in jobs
    ]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Inactive Jobs Retrieved successfully",
                "jobs": jobs_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def return_saved_jobs(request):
    saved_jobs = SavedJobs.get_all_saved_jobs()

    saved_jobs_list = [
        {
            "saved_job_id": saved_job.saved_job_id,
            "user_id": saved_job.user_id,
            "job_id": Jobs.get_job_by_job_id_json_format(saved_job.job_id),
            "created_at": saved_job.created_at,
            "updated_at": saved_job.updated_at,
        }
        for saved_job in saved_jobs
    ]

    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Saved Jobs Retrieved successfully",
                "saved_jobs": saved_jobs_list}, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_saved_jobs_by_user(request, user_id):
    try:
        user_id = user_id # Convert to UUID
    except ValueError:
        return Response({"status_code": status.HTTP_400_BAD_REQUEST, "message": "Invalid user ID format"}, status=status.HTTP_400_BAD_REQUEST)
    
    saved_jobs = SavedJobs.get_saved_jobs_by_user_id(user_id)



    saved_jobs_list = [
        {
            "saved_job_id": saved_job.saved_job_id,
            "user_id": saved_job.user_id,
            "job_details": Jobs.get_job_by_job_id_json_format(saved_job.job_id),
            "created_at": saved_job.created_at,
            "updated_at": saved_job.updated_at,
        }
        for saved_job in saved_jobs
    ]

    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Saved Jobs Retrieved successfully",
                "saved_jobs": saved_jobs_list}, status=status.HTTP_200_OK)



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
        'resume_url': user.resume_url,
        "is_active": user.is_active,
        "company_name": user.company_name,
        "contact_name": user.contact_name,
        "address": user.address,
        "industry": user.industry,
        "resume_url": user.resume_url,
        "company_description": user.company_description,
        "profile_complete": Users.is_profile_complete(user.user_id, user.user_role),
        "category_of_interest": json.loads(user.category_of_interest) if user.category_of_interest else [],
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
            "employer_id": job.employer_id,
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "education_level": job.education_level,
            "requirements": json.loads(job.requirements) if job.requirements else [],
            "required_skills": json.loads(job.required_skills) if job.required_skills else [],
            "benefits": json.loads(job.benefits) if job.benefits else [],
            "region": job.region,
            "city": job.city,
            "company_name": job.company_name,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active,
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
    try:
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
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_job(request, job_id):
    try:
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
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    try:
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
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    try:
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
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_job(request, job_id):
    try:
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
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def deactivate_user(request, user_id):
    try:
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
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def save_job(request):
    try:
        job_id = request.data.get('job_id', '')
        user_id = request.data.get('user_id', '')

        required_fields = ["job_id", "user_id"]

        missing_fields = [field for field in required_fields if not request.data.get(field)]

        if missing_fields:
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        saved_job = SavedJobs.saved_job_exists(job_id, user_id)

        if saved_job:
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": "Job already saved"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        saved_job_id = str(uuid.uuid4().hex)

        saved_job = SavedJobs(
            saved_job_id = saved_job_id,
            job_id = job_id,
            user_id = user_id
        )

        saved_job.save()
        
        return Response({
            "status_code": StatusCode.SUCCESS,
            "message": "Job saved successfully."
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def deactivate_job(request, job_id):
    try:
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
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def activate_user(request, user_id):
    try:
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
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def activate_job(request, job_id):
    try:
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
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
