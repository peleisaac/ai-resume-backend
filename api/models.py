from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import json

class CustomUserManager(BaseUserManager):
    def create_user(self, msisdn, password=None, **extra_fields):
        if not msisdn:
            raise ValueError("The MSISDN (phone number) field must be set")
        user = self.model(msisdn=msisdn, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, msisdn, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(msisdn, password, **extra_fields)


class Users(AbstractBaseUser):
    user_id = models.CharField(unique=True, max_length=200)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    resume_url = models.CharField(max_length=200, blank=True, null=True)
    company_name = models.CharField(max_length=200, blank=True, null=True)
    contact_name = models.CharField(max_length=200, blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)
    industry = models.CharField(max_length=200, blank=True, null=True)
    company_description = models.TextField(blank=True, null=True)
    msisdn = models.CharField(max_length=15, blank=True, null=True)  # Make msisdn unique
    gender = models.CharField(max_length=10, blank=True, null=True)
    user_role = models.CharField(max_length=50)
    dob = models.DateField(blank=True, null=True)
    region = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    socials = models.CharField(max_length=200, blank=True, null=True)
    category_of_interest = models.TextField(blank=True, null=True)
    job_notifications = models.CharField(max_length=2, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    email = models.EmailField(max_length=255, unique=True, default=None)
    is_active = models.BooleanField(default=True)  # Required by Django auth system
    is_staff = models.BooleanField(default=False)  # Required for Django admin
    is_superuser = models.BooleanField(default=False)
    record_status = models.CharField(max_length=2, default="1")

    USERNAME_FIELD = "email"  # Use msisdn as the unique identifier
    REQUIRED_FIELDS = []  # Add required fields for createsuperuser

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.user_role} {self.msisdn} ({self.user_id})"

    
    class Meta:
        db_table = "users"

    @staticmethod
    def user_exists(email):
        """Check if a user exists with the given email."""
        return Users.objects.filter(models.Q(email=email)).exists()
    
    @staticmethod
    def get_user_by_email(email):
        """ Get a user by their email"""
        return Users.objects.filter(email=email).first()
    
    @staticmethod
    def get_all_users():
        """Get all users."""
        return Users.objects.filter(record_status="1").all()
    
    @staticmethod
    def get_active_users():
        """Get all active users."""
        return Users.objects.filter(record_status="1", is_active=True).all()
    
    @staticmethod
    def get_inactive_users():
        """Get all inactive users."""
        return Users.objects.filter(record_status="1", is_active=False).all()
    
    @staticmethod
    def get_user_by_user_id(user_id):
        """Get a user by user_id."""
        return Users.objects.filter(user_id=user_id, record_status="1").first()
    
    @staticmethod
    def is_profile_complete(user_id, user_role):
        """Check if a user's profile is complete."""
        user = Users.objects.filter(user_id=user_id, record_status="1", user_role=user_role).first()
        if not user:
            return False

        def all_filled(fields):
            return all(bool(str(field).strip()) for field in fields)

        if user_role == "jobseeker":
            required = [
                user.first_name,
                user.last_name,
                user.email,
                user.gender,
                user.msisdn,
                user.dob,
                user.region,
                user.city,
                user.user_role,
                user.category_of_interest,
                user.job_notifications,
                user.resume_url,
            ]
            return all_filled(required)

        if user_role == "employer":
            required = [
                user.email,
                user.msisdn,
                user.region,
                user.city,
                user.company_name,
                user.contact_name,
                user.address,
                user.industry,
                user.company_description,
            ]
            return all_filled(required)

        return False
    
    
    @staticmethod
    def get_user_by_user_id_json_format(user_id):
        """Get a user by user_id."""
        user = Users.objects.filter(user_id=user_id, record_status="1").first()
        return {
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
            "company_description": user.company_description,
            "category_of_interest": json.loads(user.category_of_interest) if user.category_of_interest else [],
            "job_notifications": user.job_notifications
         } if user else None
    

class Jobs(models.Model):
    id = models.AutoField(primary_key=True)
    job_id = models.CharField(unique=True, max_length=200)
    employer_id = models.CharField(max_length=200)
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=50)
    contract_type = models.CharField(max_length=100)
    company_name = models.CharField(max_length=100)
    experience = models.CharField(max_length=500)
    education_level = models.CharField(max_length=200)
    requirements = models.TextField(blank=True, null=True)
    required_skills = models.TextField(blank=True, null=True)
    benefits = models.TextField(blank=True, null=True)
    region = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    no_of_vacancies = models.CharField(max_length=10)
    salary = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)  # Required by Django auth system
    record_status = models.CharField(max_length=2, default="1")

    def __str__(self):
        return f"{self.title} ({self.job_id})"
    
    class Meta:
        db_table = "jobs"

    
    @staticmethod
    def get_all_jobs():
        """Get all jobs."""
        return Jobs.objects.filter(record_status="1").all()
    
    @staticmethod
    def get_all_jobs_posted_by_employer(employer_id):
        """Get all jobs Posted By Employer"""
        return Jobs.objects.filter(record_status="1", employer_id=employer_id).all()
    
    @staticmethod
    def get_active_jobs_by_employer(employer_id):
        """Get all active jobs By User."""
        return Jobs.objects.filter(record_status="1", is_active=True, employer_id=employer_id).all()
    

    @staticmethod
    def get_active_jobs():
        """Get all active jobs."""
        return Jobs.objects.filter(record_status="1", is_active=True).all()
    
    @staticmethod
    def get_inactive_jobs():
        """Get all inactive jobs."""
        return Jobs.objects.filter(record_status="1", is_active=False).all()
    
    @staticmethod
    def get_job_by_job_id(job_id):
        """Get a job by job_id."""
        return Jobs.objects.filter(job_id=job_id, record_status="1").first()
    
    @staticmethod
    def get_job_by_job_id_json_format(job_id):
        """Get a job by job_id in JSON format."""
        job = Jobs.objects.filter(job_id=job_id, record_status="1").first()
        return {
            "employer_id": job.employer_id,
            "job_id": job.job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "contract_type": job.contract_type,
            "experience": job.experience,
            "education_level": job.education_level,
            "requirements": job.requirements,
            "required_skills": job.required_skills,
            "benefits": job.benefits,
            "company_name": job.company_name,
            "region": job.region,
            "city": job.city,
            "no_of_vacancies": job.no_of_vacancies,
            "salary": job.salary,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "is_active": job.is_active,
        } if job else None
    

class Applications(models.Model):
    id = models.AutoField(primary_key=True)
    application_id = models.CharField(unique=True, max_length=200)
    status = models.CharField(max_length=50)
    user_id = models.CharField(max_length=200)
    employer_id = models.CharField(max_length=200)
    job_id = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    record_status = models.CharField(max_length=2, default="1")

    def __str__(self):
        return f"{self.application_id} ({self.status})"
    
    class Meta:
        db_table = "applications"

    @staticmethod
    def get_all_applications():
        """Get all applications."""
        return Applications.objects.filter(record_status="1").all()
    
    @staticmethod
    def get_all_applications_count_for_employer(employer_id):
        """Get the number of applications For Employer."""
        return Applications.objects.filter(record_status="1", employer_id=employer_id).count()
    
    @staticmethod
    def get_all_applications_count():
        """Get the number of applications."""
        return Applications.objects.filter(record_status="1").count()
    
    @staticmethod
    def get_application_by_application_id(application_id):
        """Get an application by application_id."""
        return Applications.objects.filter(application_id=application_id, record_status="1").first()
    
    @staticmethod
    def get_applications_by_user_id(user_id):
        """Get applications by user_id."""
        return Applications.objects.filter(user_id=user_id, record_status="1").all()
    
    @staticmethod
    def get_applications_by_job_id(job_id):
        """Get applications by job_id."""
        return Applications.objects.filter(job_id=job_id, record_status="1").all()
    
    @staticmethod
    def get_number_of_applications_by_job_id(job_id):
        """Get the number of applications by job_id."""
        return Applications.objects.filter(job_id=job_id, record_status="1").count()
    
    @staticmethod
    def application_exists(user_id, job_id):
        """Check if an application exists with the given user_id and job_id."""
        return Applications.objects.filter(
            user_id=user_id,
            job_id=job_id,
            record_status="1"
        ).exists()

    @staticmethod
    def get_application_by_application_id_json_format(application_id):
        """Get an application by application_id in JSON format."""
        application = Applications.objects.filter(application_id=application_id, record_status="1").first()
        return {
            "application_id": application.application_id,
            "status": application.status,
            "user_id": application.user_id,
            "employer_id": application.employer_id,
            "job_id": application.job_id,
            "created_at": application.created_at,
            "updated_at": application.updated_at,
        } if application else None
    


class SavedJobs(models.Model):
    id = models.AutoField(primary_key=True)
    saved_job_id = models.CharField(unique=True, max_length=200)
    employer_id = models.CharField(max_length=200)
    user_id = models.CharField(max_length=200)
    job_id = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    record_status = models.CharField(max_length=2, default="1")

    def __str__(self):
        return f"{self.job_id} ({self.user_id})"
    
    class Meta:
        db_table = "saved_jobs"

    @staticmethod
    def get_all_saved_jobs():
        """Get all saved jobs."""
        return SavedJobs.objects.filter(record_status="1").all()

    @staticmethod
    def get_saved_jobs_by_user_id(user_id):
        """Get saved jobs by user_id."""
        return SavedJobs.objects.filter(user_id=user_id, record_status="1").all()
    
    @staticmethod
    def get_saved_jobs_by_job_id(job_id):
        """Get saved jobs by job_id."""
        return SavedJobs.objects.filter(job_id=job_id, record_status="1").all()
    
    @staticmethod
    def saved_job_exists(user_id, job_id):
        """Check if a saved job exists with the given user_id and job_id."""
        return SavedJobs.objects.filter(user_id=user_id, job_id=job_id, record_status="1").first()
    
    @staticmethod
    def get_saved_job(user_id, job_id):
        """Get saved job with the given user_id and job_id."""
        return SavedJobs.objects.filter(user_id=user_id, job_id=job_id, record_status="1").first()
    
    
