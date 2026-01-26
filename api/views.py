from django.shortcuts import render
from django.db import IntegrityError
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import uuid
from uuid import UUID
import uuid
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

def _serialize_job(job, include_application_count=False):
    """Serialize a Job into a compact dict to keep lines short and PEP8-compliant."""
    requirements = (
        json.loads(job.requirements) if job.requirements else []
    )
    required_skills = (
        json.loads(job.required_skills) if job.required_skills else []
    )
    benefits = (
        json.loads(job.benefits) if job.benefits else []
    )

    payload = {
        "employer_id": job.employer_id,
        "job_id": job.job_id,
        "title": job.title,
        "description": job.description,
        "category": job.category,
        "contract_type": job.contract_type,
        "experience": job.experience,
        "education_level": job.education_level,
        "requirements": requirements,
        "required_skills": required_skills,
        "benefits": benefits,
        "region": job.region,
        "city": job.city,
        "company_name": job.company_name,
        "no_of_vacancies": job.no_of_vacancies,
        "salary": job.salary,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "is_active": job.is_active,
    }

    if include_application_count:
        payload["no_of_applications"] = (
            Applications.get_number_of_applications_by_job_id(job.job_id)
        )

    return payload

def index_frontend_view(request):
    return render(request, "airesumefrontend/index.html") 

def jobs_frontend_view(request):
    return render(request, "airesumefrontend/jobs.html") 

def jobseeker_auth_frontend_view(request):
    return render(request, "airesumefrontend/jobseeker-signin.html") 

def jobseeker_signup_frontend_view(request):
    return render(request, "airesumefrontend/jobseeker-signup.html") 

def employer_auth_frontend_view(request):
    return render(request, "airesumefrontend/employer-signin.html") 

def employer_signup_frontend_view(request):
    return render(request, "airesumefrontend/employer-signup.html") 

def contact_us_frontend_view(request):
    return render(request, "airesumefrontend/contact.html") 

def jobseeker_dashboard_frontend_view(request):
    return render(request, "airesumefrontend/jobseeker-dashboard.html") 

def jobseeker_browse_jobs_frontend_view(request):
    return render(request, "airesumefrontend/jobseeker-browse-jobs.html") 

def jobseeker_profile_frontend_view(request):
    return render(request, "airesumefrontend/my-profile.html")

def employer_profile_frontend_view(request):
    return render(request, "airesumefrontend/employer-profile.html")

def jobseeker_profile_second_frontend_view(request):
    return render(request, "airesumefrontend/jobseeker-profile.html")
 
def my_jobs_frontend_view(request):
    return render(request, "airesumefrontend/my-jobs.html") 

def employer_dashboard_frontend_view(request):
    return render(request, "airesumefrontend/employer-dashboard.html") 

def employer_new_job_frontend_view(request):
    return render(request, "airesumefrontend/employer-new-job.html") 

def employer_job_listings_frontend_view(request):
    return render(request, "airesumefrontend/employer-job-listings.html") 

def upload_cv_frontend_view(request):
    return render(request, "airesumefrontend/upload-cv.html") 

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
            return Response(
                {
                    "status_code": StatusCode.NOT_FOUND,
                    "message": "User not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Guard against missing storage configuration to avoid opaque 500s
        if not settings.AZURE_STORAGE_CONNECTION_STRING or not settings.AZURE_CONTAINER_NAME:
            return Response(
                {
                    "status_code": StatusCode.SERVER_ERROR,
                    "message": "Storage is not configured. Please contact support.",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

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
                # Ideally log the error here
                return Response({
                    "status_code": StatusCode.SERVER_ERROR,
                    "message": "An internal error occurred during file upload."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Ideally log the error here
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": "An internal error occurred during file upload."
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
        dob = request.data.get("dob") or None  # Avoid invalid empty-string dates
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

        # CHANGED: Return user data as a dictionary (JSON-serializable)
        user_data = {
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
            "category_of_interest": json.loads(user.category_of_interest) if user.category_of_interest else [],
            "job_notifications": user.job_notifications,
            "company_name": user.company_name if user.user_role == "employer" else None,
            "contact_name": user.contact_name if user.user_role == "employer" else None,
            "address": user.address if user.user_role == "employer" else None,
            "industry": user.industry if user.user_role == "employer" else None,
            "company_description": user.company_description if user.user_role == "employer" else None,
        }

        return Response({
            "status_code": StatusCode.SUCCESS,
            "message": "User created successfully",
            "data": user_data
        }, status=status.HTTP_201_CREATED)
        # signed_up_user = user.get_user_by_user_id(user_id)


        # if user:
        #     return Response({
        #         "status_code": StatusCode.SUCCESS,
        #         "message": "User created successfully",
        #         "data": signed_up_user
        #     }, status=status.HTTP_201_CREATED)
        # else:
        #     return Response({
        #         "status_code": StatusCode.INVALID_CREDENTIALS,
        #         "message": "Failed To Create User"
        #     }, status=status.HTTP_401_UNAUTHORIZED) 

    except IntegrityError as e:
         return Response({
            "status_code": StatusCode.BAD_REQUEST,
            "message": "User with this email or phone number already exists."
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def login(request):
    try:
        username = request.data.get("username")  # This will be the email
        password = request.data.get("password")
        user_role = request.data.get("user_role")

        if not username or not password:
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": "Email and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate using email (since USERNAME_FIELD = "email")
        from django.contrib.auth import authenticate
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Check if user role matches
            if user.user_role != user_role:
                return Response({
                    "status_code": StatusCode.INVALID_CREDENTIALS,
                    "message": f"Invalid credentials for {user_role}"
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Generate or get auth token
            from rest_framework.authtoken.models import Token
            token, created = Token.objects.get_or_create(user=user)

            user_data = {
                "user_id": user.user_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "user_role": user.user_role,
                "token": token.key,
            }

            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "Login successful",
                "data": user_data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "status_code": StatusCode.INVALID_CREDENTIALS,
                "message": "Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": "An internal error occurred during login."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_new_job(request):
    try:
        required_fields = [
            "employer_id",
            "title",
            "description",
            "category",
            "contract_type",
            "experience",
            "education_level",
            "requirements",
            "required_skills",
            "benefits",
            "region",
            "city",
            "company_name",
            "no_of_vacancies",
            "salary",
        ]

        missing_fields = [field for field in required_fields if not request.data.get(field)]

        if missing_fields:
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        employer_id = request.data.get("employer_id", "")

        # Ensure the authenticated user is the job owner
        if str(request.user.user_id) != str(employer_id):
            return Response({
                "status_code": StatusCode.UNAUTHORIZED,
                "message": "You are not allowed to create jobs for this employer."
            }, status=status.HTTP_403_FORBIDDEN)
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

        added_job = Jobs.get_job_by_job_id(job_id)

        if job:
            serialized = JobSerializer(added_job).data if added_job else None
            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "Job created successfully",
                "job": serialized
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "status_code": StatusCode.INVALID_CREDENTIALS,
                "message": "Failed To Create Job"
            }, status=status.HTTP_401_UNAUTHORIZED) 
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": "An internal error occurred while adding the job."
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


        existing_application = Applications.objects.filter(
            user_id=user_id,
            job_id=job_id,
            record_status="1"
        ).first()

        # If an application already exists, treat the request as idempotent and return success
        if existing_application:
            existing_payload = Applications.get_application_by_application_id_json_format(
                existing_application.application_id
            )
            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "Application already exists",
                "data": existing_payload
            }, status=status.HTTP_200_OK)

        application_id = str(uuid.uuid4().hex)
        
        # Create and save the new job
        job = Applications(
            application_id = application_id,
            job_id = job_id,
            user_id = user_id,
            employer_id = employer_id,
            status = application_status
        )

        job.save()

        # Fetch JSON-serializable payload for the new application
        added_application = Applications.get_application_by_application_id_json_format(application_id)
        
         

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
            "message": "An internal error occurred while creating the application."
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
    
    qualified_count = Applications.objects.filter(
        employer_id=employer_id,
        status__in=["shortlisted", "hired"],
        record_status="1"
    ).count()

    dashboard_metrics_data = {
        "active_jobs": len(active_jobs),
        "all_applications_count": all_applications_count,
        "qualified_candidates": qualified_count
    }
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "Employer Dashboard Metrics Retrieved successfully",
                "data": dashboard_metrics_data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_jobseeker_dashboard_metrics(request):
    user_id = request.data.get("user_id", "")

    all_applications = Applications.get_applications_by_user_id(user_id)
    saved_jobs_count = SavedJobs.get_saved_jobs_by_user_id(user_id)

    # Applications in review: status is 'pending' or 'review'
    in_review_statuses = ["pending", "review"]
    applications_in_review = [a for a in all_applications if getattr(a, 'status', '').lower() in in_review_statuses]

    dashboard_metrics_data = {
        "all_applications_count": len(all_applications),
        "saved_jobs_count": len(saved_jobs_count),
        "applications_in_review": len(applications_in_review)
    }
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "Job Seeker Dashboard Metrics Retrieved successfully",
                "data": dashboard_metrics_data}, status=status.HTTP_200_OK)

@api_view(['GET'])
# @authentication_classes([TokenAuthentication])
# @permission_classes([IsAuthenticated])
def get_all_jobs(request):
    # Only return active jobs for the public listings feed
    jobs = Jobs.get_active_jobs()
    jobs_list = [_serialize_job(job, include_application_count=True) for job in jobs]
    return Response({"status_code": StatusCode.SUCCESS, 
                "message": "All Jobs Retrieved successfully",
                "jobs": jobs_list}, status=status.HTTP_200_OK)

@api_view(['GET'])
# @authentication_classes([TokenAuthentication])
# @permission_classes([IsAuthenticated])
def get_all_jobs_by_employer(request, employer_id):
    # Return all (non-deleted) jobs for the employer so paused/active both show up
    jobs = Jobs.get_all_jobs_posted_by_employer(employer_id)
    jobs_list = [_serialize_job(job, include_application_count=True) for job in jobs]
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
    jobs_list = [_serialize_job(job, include_application_count=False) for job in jobs]
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
        return Response(
            {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "message": "Invalid user ID format",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    saved_jobs = SavedJobs.get_saved_jobs_by_user_id(user_id)



    saved_jobs_list = []
    for saved_job in saved_jobs:
        job_json = Jobs.get_job_by_job_id_json_format(saved_job.job_id)
        if not job_json:
            # skip orphaned saved-job entries that reference deleted jobs
            continue
        saved_jobs_list.append({
            "saved_job_id": saved_job.saved_job_id,
            "user_id": saved_job.user_id,
            "job_details": job_json,
            "created_at": saved_job.created_at,
            "updated_at": saved_job.updated_at,
        })

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
        return Response(
            {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "message": "Invalid user ID format",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = Users.get_user_by_user_id(user_id)  # Fetch user
    if not user:
        return Response(
            {
                "status_code": StatusCode.NOT_FOUND,
                "message": "User not found",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

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
        return Response(
            {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "message": "Invalid Job ID format",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    job = Jobs.get_job_by_job_id(job_id)  # Fetch user
    if not job:
        return Response(
            {
                "status_code": StatusCode.NOT_FOUND,
                "message": "Job not found",
            },
            status=status.HTTP_404_NOT_FOUND,
        )
    
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
        return Response(
            {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "message": "Invalid Application ID format",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    application = Applications.get_application_by_application_id(application_id)  # Fetch Application
    if not application:
        return Response(
            {
                "status_code": StatusCode.NOT_FOUND,
                "message": "Application not found",
            },
            status=status.HTTP_404_NOT_FOUND,
        )
    
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
        return Response(
            {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "message": "Invalid User ID format",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    applications = Applications.get_applications_by_user_id(user_id)  # Fetch Application By the user_id
    
    application_list = []
    for application in applications:
        job_json = Jobs.get_job_by_job_id_json_format(application.job_id)
        if not job_json:
            # skip orphaned applications tied to deleted jobs
            continue
        application_list.append({
            "application_id": application.application_id,
            "user_details": Users.get_user_by_user_id_json_format(application.user_id),
            "job_details": job_json,
            "status": application.status,
            "created_at": application.created_at,
            "updated_at": application.updated_at,
        })

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
        return Response(
            {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "message": "Invalid Job ID format",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    
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
            return Response(
                {
                    "status_code": StatusCode.NOT_FOUND,
                    "message": "User not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Instantiate the serializer with the current user instance and the incoming data.
        # Using partial=True allows for partial updates. If you require all fields, you can remove partial=True.
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user_obj = serializer.instance
            # Return role-specific fields to avoid empty employer fields for jobseekers
            if user_obj.user_role == "employer":
                user_payload = {
                    "user_id": user_obj.user_id,
                    "first_name": user_obj.first_name,
                    "last_name": user_obj.last_name,
                    "email": user_obj.email,
                    "msisdn": user_obj.msisdn,
                    "gender": user_obj.gender,
                    "dob": user_obj.dob,
                    "region": user_obj.region,
                    "city": user_obj.city,
                    "socials": user_obj.socials,
                    "user_role": user_obj.user_role,
                    "category_of_interest": json.loads(user_obj.category_of_interest)
                    if user_obj.category_of_interest
                    else [],
                    "job_notifications": user_obj.job_notifications,
                    "resume_url": user_obj.resume_url,
                    "company_name": user_obj.company_name,
                    "contact_name": user_obj.contact_name,
                    "address": user_obj.address,
                    "industry": user_obj.industry,
                    "company_description": user_obj.company_description,
                    "is_active": user_obj.is_active,
                }
            else:
                user_payload = {
                    "user_id": user_obj.user_id,
                    "first_name": user_obj.first_name,
                    "last_name": user_obj.last_name,
                    "email": user_obj.email,
                    "msisdn": user_obj.msisdn,
                    "gender": user_obj.gender,
                    "dob": user_obj.dob,
                    "region": user_obj.region,
                    "city": user_obj.city,
                    "socials": user_obj.socials,
                    "user_role": user_obj.user_role,
                    "category_of_interest": json.loads(user_obj.category_of_interest)
                    if user_obj.category_of_interest
                    else [],
                    "job_notifications": user_obj.job_notifications,
                    "resume_url": user_obj.resume_url,
                    "is_active": user_obj.is_active,
                }
            return Response({
                "status_code": StatusCode.SUCCESS,
                "message": "User updated successfully",
                "user": user_payload
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
            "message": "An internal error occurred while updating the user."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_job(request, job_id):
    try:
        job = Jobs.get_job_by_job_id(job_id)  # Fetch job
        if not job:
            return Response(
                {
                    "status_code": StatusCode.NOT_FOUND,
                    "message": "Job not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the owner can update this job
        if str(request.user.user_id) != str(job.employer_id):
            return Response({
                "status_code": StatusCode.UNAUTHORIZED,
                "message": "You are not allowed to update this job."
            }, status=status.HTTP_403_FORBIDDEN)
        
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
            "message": "An internal error occurred while updating the job."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    try:
        application = Applications.get_application_by_application_id(application_id)  # Fetch application
        if not application:
            return Response(
                {
                    "status_code": StatusCode.NOT_FOUND,
                    "message": "Application not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        
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
            "message": "An internal error occurred while updating application status."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    try:
        user = Users.get_user_by_user_id(user_id)  # Fetch user
        if not user:
            return Response(
                {
                    "status_code": StatusCode.NOT_FOUND,
                    "message": "User not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        
        
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
            "message": "An internal error occurred while deleting the user."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_job(request, job_id):
    try:
        job = Jobs.get_job_by_job_id(job_id)  # Fetch job
        if not job:
            return Response(
                {
                    "status_code": StatusCode.NOT_FOUND,
                    "message": "Job not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the owner can delete this job
        if str(request.user.user_id) != str(job.employer_id):
            return Response({
                "status_code": StatusCode.UNAUTHORIZED,
                "message": "You are not allowed to delete this job."
            }, status=status.HTTP_403_FORBIDDEN)
        
        
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
            "message": "An internal error occurred while deleting the job."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def deactivate_user(request, user_id):
    try:
        user = Users.get_user_by_user_id(user_id)  # Fetch user
        if not user:
            return Response(
                {
                    "status_code": StatusCode.NOT_FOUND,
                    "message": "User not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        
        
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
            "message": "An internal error occurred while deactivating the user."
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

        saved_job = SavedJobs.saved_job_exists(user_id, job_id)

        job_saved = Jobs.get_job_by_job_id(job_id)

        job_data = {
            "employer_id": job_saved.employer_id,
            "job_id": job_saved.job_id,
            "title": job_saved.title,
            "description": job_saved.description,
            "category": job_saved.category,
            "contract_type": job_saved.contract_type,
            "experience": job_saved.experience,
            "education_level": job_saved.education_level,
            "requirements": json.loads(job_saved.requirements) if job_saved.requirements else [],
            "required_skills": json.loads(job_saved.required_skills) if job_saved.required_skills else [],
            "benefits": json.loads(job_saved.benefits) if job_saved.benefits else [],
            "region": job_saved.region,
            "city": job_saved.city,
            "company_name": job_saved.company_name,
            "no_of_vacancies": job_saved.no_of_vacancies,
            "salary": job_saved.salary,
            "created_at": job_saved.created_at,
            "updated_at": job_saved.updated_at,
            "is_active": job_saved.is_active,
        }

        if saved_job is not None:
            return Response({
                "status_code": StatusCode.BAD_REQUEST,
                "message": "Job already saved",
                "data": job_data
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
            "message": "An internal error occurred while saving the job."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def remove_saved_job(request):
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

        saved_job = SavedJobs.get_saved_job(user_id, job_id)

        saved_job.record_status = 0

        saved_job.save()

        removed_saved_job = Jobs.get_job_by_job_id(job_id)

        job_data = {
            "employer_id": removed_saved_job.employer_id,
            "job_id": removed_saved_job.job_id,
            "title": removed_saved_job.title,
            "description": removed_saved_job.description,
            "category": removed_saved_job.category,
            "contract_type": removed_saved_job.contract_type,
            "experience": removed_saved_job.experience,
            "education_level": removed_saved_job.education_level,
            "requirements": json.loads(removed_saved_job.requirements) if removed_saved_job.requirements else [],
            "required_skills": json.loads(removed_saved_job.required_skills)
            if removed_saved_job.required_skills
            else [],
            "benefits": json.loads(removed_saved_job.benefits) if removed_saved_job.benefits else [],
            "region": removed_saved_job.region,
            "city": removed_saved_job.city,
            "company_name": removed_saved_job.company_name,
            "no_of_vacancies": removed_saved_job.no_of_vacancies,
            "salary": removed_saved_job.salary,
            "created_at": removed_saved_job.created_at,
            "updated_at": removed_saved_job.updated_at,
            "is_active": removed_saved_job.is_active,
        }
        
        return Response({
            "status_code": StatusCode.SUCCESS,
            "message": "Saved job removed successfully.",
            "data": job_data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            "status_code": StatusCode.SERVER_ERROR,
            "message": "An internal error occurred while removing the saved job."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def deactivate_job(request, job_id):
    try:
        job = Jobs.get_job_by_job_id(job_id)  # Fetch job
        if not job:
            return Response(
                {
                    "status_code": StatusCode.NOT_FOUND,
                    "message": "Job not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the owner can deactivate this job
        if str(request.user.user_id) != str(job.employer_id):
            return Response({
                "status_code": StatusCode.UNAUTHORIZED,
                "message": "You are not allowed to deactivate this job."
            }, status=status.HTTP_403_FORBIDDEN)
        
        
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
            "message": "An internal error occurred while deactivating the job."
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
            "message": "An internal error occurred while activating the user."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def activate_job(request, job_id):
    try:
        job = Jobs.get_job_by_job_id(job_id)  # Fetch job
        if not job:
            return Response({"status_code": StatusCode.NOT_FOUND, "message": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        # Only the owner can activate this job
        if str(request.user.user_id) != str(job.employer_id):
            return Response({
                "status_code": StatusCode.UNAUTHORIZED,
                "message": "You are not allowed to activate this job."
            }, status=status.HTTP_403_FORBIDDEN)
        
        
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
            "message": "An internal error occurred while activating the job."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
