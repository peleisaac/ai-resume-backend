from rest_framework import serializers
from .models import Users # Adjust the import according to your project structure

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = (
            'user_id',
            'first_name',
            'last_name',
            'email',
            'msisdn',
            'gender',
            'dob',
            'region',
            'city',
            'socials',
            'user_role',
            'category_of_interest',
            'job_notifications',
        )
        read_only_fields = ('user_id',)