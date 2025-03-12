from rest_framework import serializers
from .models import Users # Adjust the import according to your project structure
from .models import Jobs
import json

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

class JSONListField(serializers.Field):
    """
    Custom field that serializes a list into a JSON string for storage
    and deserializes a JSON string back to a list for representation.
    """
    def to_internal_value(self, data):
        # Expecting a list from the input
        if not isinstance(data, list):
            raise serializers.ValidationError("Expected a list of strings.")
        try:
            # Optionally, validate that all items in the list are strings:
            if not all(isinstance(item, str) for item in data):
                raise serializers.ValidationError("All items in the list must be strings.")
        except Exception as e:
            raise serializers.ValidationError("Invalid data format: " + str(e))
        # Convert list to JSON string
        return json.dumps(data)

    def to_representation(self, value):
        # When reading, value is the JSON string stored in the DB.
        try:
            return json.loads(value)
        except Exception:
            # If conversion fails, return the raw value
            return value



class UserSerializer(serializers.ModelSerializer):
    category_of_interest = JSONListField(required=False)

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
            'resume_url',
            'company_name',
            'contact_name',
            'address',
            'industry',
            'company_description',
            'is_active',
        )
        read_only_fields = ('user_id',)

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jobs
        fields = (
            'job_id',
            'title',
            'description',
            'category',
            'contract_type',
            'experience',
            'education_level',
            'region',
            'city',
            'no_of_vacancies',
            'salary',
        )
        read_only_fields = ('job_id',)
