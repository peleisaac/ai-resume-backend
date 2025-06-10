from django.test import TestCase
from django.urls import reverse
from .models import Job, User

# Create your tests here.
class JobMatchingTests(TestCase):
    def setUp(self):
        # Create test data
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.job = Job.objects.create(title="Software Engineer", region="Greater Accra", city="Accra")

    def test_job_list_view(self):
        response = self.client.get(reverse('job_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Software Engineer")

    def test_job_matching_logic(self):
        # Example: Check if job matching logic filters correctly
        response = self.client.get(reverse('job_list') + "?region=Greater Accra")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Software Engineer")
