from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

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
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    msisdn = models.CharField(max_length=10, unique=True)  # Make msisdn unique
    gender = models.CharField(max_length=10)
    user_role = models.CharField(max_length=50)
    dob = models.DateField(blank=True, null=True)
    region = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    socials = models.CharField(max_length=200)
    category_of_interest = models.CharField(max_length=50)
    job_notifications = models.CharField(max_length=2)
    updated_at = models.DateTimeField(auto_now=True)
    email = models.EmailField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)  # Required by Django auth system
    is_staff = models.BooleanField(default=False)  # Required for Django admin
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = "email"  # Use msisdn as the unique identifier
    REQUIRED_FIELDS = []  # Add required fields for createsuperuser

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.user_role} {self.msisdn} ({self.user_id})"

    
    class Meta:
        db_table = "users"

    @staticmethod
    def user_exists(email, msisdn):
        """Check if a user exists with the given email or msisdn."""
        return Users.objects.filter(models.Q(email=email) | models.Q(msisdn=msisdn)).exists()
    
    @staticmethod
    def get_user_by_email(email):
        """ Get a user by their email"""
        return Users.objects.filter(email=email).first()
    
    @staticmethod
    def get_all_users():
        """Get all users."""
        return Users.objects.all()
    
    @staticmethod
    def get_user_by_user_id(user_id):
        """Get a user by user_id."""
        return Users.objects.filter(user_id=user_id).first()