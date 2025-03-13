# AI Resume backend
This repository contains the backend code for the final project using Django Rest Framework designed to manage, query and manipulate data to meet given needs in a particular real-world domain. The REST APIs built enables resume storage using Azure Storage container while integrating seamlessly with an existing HTML, CSS and JavaScript frontend for Jobseekers to apply for jobs posted by employers.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)

## Features 
- REST APIs manage, query and manipulate user data
- Allows upload and resume storage in Azure containers using REST API
- Database Management System using MySQL
- Token-based authentication
- Database: MySQL Storage


## Technologies Used

- **Django**: Backend logic, routing, and manipulating data.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/peleisaac/ai-resume-backend.git
   ```

2. **Install Dependencies**:
   Make sure you have Django installed. You can set up a virtual environment and install dependencies as follows:
   ```bash
   python3 -m venv venv #Use python for windows systems
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt #Use pip3 for linux and mac systems
   ```

3. **Apply the migrations**
   ```bash
   python manage.py migrate #Use python3 for linux and mac systems
   ```

4. **Run the Server**:
   Start the Django development server.
   ```bash
   python manage.py runserver #Use python3 for linux and mac systems
   ```
