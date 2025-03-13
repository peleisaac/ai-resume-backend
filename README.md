# ai-resume-backend
This repository contains the backend code for the final project using Django Rest Framework designed to to manage, query and manipulate data to meet given needs in a particular real-world domain. It enables resume storage, parsing, and retrieval while integrating seamlessly with an existing HTML, CSS and JavaScript resume matching system analyzing, skills and strengths.

## Features 
- Allows to upload and store resume Stores resumes with unique ids and according to skills Secure authentication and authorization.
- Secure and efficient database management BUILT With Backend: Django
- Frontend: React (TypeScript/JavaScript) Integration: Compatible with TypeScript/Express.js-based Authentication:
- Token-based authentication (JWT/ DRF Auth)
- Database: MySQL Storage: Local file System Install Prerequisites Django djangorestframework PyMySql Virtual Environment Backend Setup


## Clone the repo

github repo if any
Create and activate virtual environment python -m venv venv source venv/bin/activate, On Windows, use venv\Scripts\activate Install Dependencies Pip install -r requirements.txt Configure environment variables Run migrations python manage.py migrate Start the backend server Python manage.py runserver Frontend Setup Navigate to the frontend directory:

Install Dependencies: pip install npm install Configure environment variables: Create a virtual environment and ensure necessary configurations are installed Start the frontend development server: Npm start API Endpoints Method Description POST Upload a resume file GET Retrieve all stored resumes GET Retrieve a specific resume DELETE Delete a resume

Usage • Upload resumes via API or frontend. • Extract parsed data for further processing. • Integrate with the resume matching system for better job candidate analysis.
