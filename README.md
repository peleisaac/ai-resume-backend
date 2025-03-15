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

5. **Database Schema**
### Entities and Attributes

#### Users
- **user_id** (PK)
- **first_name**
- **last_name**
- **resume_url**
- **company_name**
- **contact_name**
- **address**
- **industry**
- **company_description**
- **msisdn** (unique)
- **gender**
- **user_role**
- **dob**
- **region**
- **city**
- **socials**
- **category_of_interest**
- **job_notifications**
- **updated_at**
- **email** (unique)
- **is_active**
- **is_staff**
- **is_superuser**
- **record_status**

#### Jobs
- **id** (PK)
- **job_id** (unique)
- **title**
- **description**
- **category**
- **contract_type**
- **company_name**
- **experience**
- **education_level**
- **requirements**
- **required_skills**
- **benefits**
- **region**
- **city**
- **no_of_vacancies**
- **salary**
- **created_at**
- **updated_at**
- **is_active**
- **record_status**

#### Applications
- **id** (PK)
- **application_id** (unique)
- **status**
- **user_id** (FK)
- **job_id** (FK)
- **created_at**
- **updated_at**
- **record_status**

### Relationships

- **Users** entity is managed by **CustomUserManager**.
- **Users** entity has static methods for various operations.
- **Jobs** entity has static methods for various operations.
- **Applications** entity has static methods for various operations.
- **Applications** entity has foreign keys to **Users** and **Jobs** entities.

### ER Diagram

```plaintext
+------------------+          +----------------------+          +------------------+
|    Users         |          |  CustomUserManager   |          |    Jobs          |
+------------------+          +----------------------+          +------------------+
| user_id (PK)     |          | create_user()        |          | id (PK)          |
| first_name       |          | create_superuser()   |          | job_id (unique)  |
| last_name        |          | get_user_by_user_id()|          | title            |
| resume_url       |          | is_profile_complete()|          | description      |
| company_name     |          | get_user_by_user_id_json_format()| category         |
| contact_name     |          +----------------------+          | contract_type    |
| address          |                                             | company_name     |
| industry         |                                             | experience       |
| company_description |                                         | education_level  |
| msisdn (unique)  |                                             | requirements     |
| gender           |                                             | required_skills  |
| user_role        |                                             | benefits         |
| dob              |                                             | region           |
| region           |                                             | city             |
| city             |                                             | no_of_vacancies  |
| socials          |                                             | salary           |
| category_of_interest |                                         | created_at       |
| job_notifications|                                             | updated_at       |
| updated_at       |                                             | is_active        |
| email (unique)   |                                             | record_status    |
| is_active        |                                             +------------------+
| is_staff         |
| is_superuser     |
| record_status    |
+------------------+

+------------------+
| Applications     |
+------------------+
| id (PK)          |
| application_id (unique)|
| status           |
| user_id (FK)     |
| job_id (FK)      |
| created_at       |
| updated_at       |
| record_status    |
+------------------+
```
