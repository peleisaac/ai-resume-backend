from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import uuid
from uuid import UUID
from api.models import Users
from rest_framework import status
from api.status_codes import StatusCode
from .serializers import UserSerializer

# Create your views here.
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "You have access to this view!"})

@api_view(['POST'])
def sign_up(request):
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")
        msisdn = request.data.get("msisdn")
        gender = request.data.get("gender")
        password = request.data.get("password")
        dob = request.data.get("dob")
        region = request.data.get("region")
        city = request.data.get("city")
        socials = request.data.get("socials")
        user_role = request.data.get("user_role")
        category_of_interest = request.data.get("category_of_interest")
        job_notifications = request.data.get("job_notifications")

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
    
    
