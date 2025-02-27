from django.contrib.auth.backends import ModelBackend
from api.models import Users

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = Users.objects.get(email=username)
            if user.check_password(password):
                return user
        except Users.DoesNotExist:
            return None