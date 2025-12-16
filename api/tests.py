"""API integration tests for core CRUD and auth flows."""

import json
import uuid

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from api.models import Users, Jobs, Applications, SavedJobs


class APICRUDTests(TestCase):
    """Covers signup, login, profile update, job CRUD, saved jobs, and applications."""

    def setUp(self):
        self.client = APIClient()
        # Surface view exceptions directly during tests to avoid template rendering errors
        self.client.raise_request_exception = True

        # Employer user
        self.employer = Users(
            user_id=str(uuid.uuid4().hex),
            email="employer@example.com",
            user_role="employer",
            first_name="Emp",
            last_name="Loyer",
            is_active=True,
            record_status="1",
        )
        self.employer.set_password("password123")
        self.employer.save()
        self.employer_token = Token.objects.create(user=self.employer)

        # Jobseeker user
        self.jobseeker = Users(
            user_id=str(uuid.uuid4().hex),
            email="seeker@example.com",
            user_role="jobseeker",
            first_name="Job",
            last_name="Seeker",
            is_active=True,
            record_status="1",
        )
        self.jobseeker.set_password("password123")
        self.jobseeker.save()
        self.jobseeker_token = Token.objects.create(user=self.jobseeker)

        # A sample job for saved/apply tests
        self.job = Jobs.objects.create(
            job_id=str(uuid.uuid4().hex),
            employer_id=self.employer.user_id,
            title="Software Engineer",
            description="Build stuff",
            category="Engineering",
            contract_type="Full-time",
            company_name="Acme",
            experience="2+ years",
            education_level="Bachelors",
            requirements=json.dumps(["Python", "Django"]),
            required_skills=json.dumps(["APIs", "REST"]),
            benefits=json.dumps(["Health", "Pension"]),
            region="Greater Accra",
            city="Accra",
            no_of_vacancies="1",
            salary="5000",
        )

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    def test_signup_jobseeker(self):
        payload = {
            "first_name": "New",
            "last_name": "User",
            "email": "newuser@example.com",
            "password": "password123",
            "user_role": "jobseeker",
        }
        response = self.client.post("/api/v1/signup", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIn(response.data.get("status_code"), [200, "200", "AR00"])

    def test_login_success(self):
        payload = {
            "username": self.jobseeker.email,
            "password": "password123",
            "user_role": "jobseeker",
        }
        response = self.client.post("/api/v1/login", payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn(response.data.get("status_code"), [200, "200", "AR00"])
        self.assertIn("token", response.data.get("data", {}))

    def test_update_user_profile(self):
        self.auth(self.jobseeker_token.key)
        payload = {"first_name": "Updated"}
        response = self.client.put(
            f"/api/v1/user/{self.jobseeker.user_id}", payload, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.get("user", {}).get("first_name"), "Updated")

    def test_add_job_as_employer(self):
        self.auth(self.employer_token.key)
        payload = {
            "employer_id": self.employer.user_id,
            "title": "Data Engineer",
            "description": "Data pipelines",
            "category": "Engineering",
            "contract_type": "Full-time",
            "experience": "3 years",
            "education_level": "Bachelors",
            "requirements": ["SQL", "Python"],
            "required_skills": ["Airflow"],
            "benefits": ["Bonus"],
            "region": "Greater Accra",
            "city": "Accra",
            "company_name": "DataCorp",
            "no_of_vacancies": "2",
            "salary": "6000",
        }
        response = self.client.post("/api/v1/job/add", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIn(response.data.get("status_code"), [200, "200", "AR00"])

    def test_save_and_remove_job(self):
        self.auth(self.jobseeker_token.key)
        save_payload = {"user_id": self.jobseeker.user_id, "job_id": self.job.job_id}
        save_response = self.client.post("/api/v1/job/save", save_payload, format="json")
        self.assertEqual(save_response.status_code, 200)

        remove_payload = {"user_id": self.jobseeker.user_id, "job_id": self.job.job_id}
        remove_response = self.client.put(
            "/api/v1/saved-job/remove", remove_payload, format="json"
        )
        self.assertEqual(remove_response.status_code, 200)

    def test_apply_for_job(self):
        self.auth(self.jobseeker_token.key)
        payload = {
            "user_id": self.jobseeker.user_id,
            "job_id": self.job.job_id,
            "employer_id": self.employer.user_id,
            "application_status": "pending",
        }
        response = self.client.post(
            "/api/v1/application/add", payload, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn(response.data.get("status_code"), [200, "200", "AR00"])
