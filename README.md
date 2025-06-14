# AI Resume backend
This repository contains the backend code for the final project using Django Rest Framework designed to manage, query and manipulate data to meet given needs in a particular real-world domain. The REST APIs built enables resume storage using Azure Storage container while integrating seamlessly with an existing HTML, CSS and JavaScript frontend for Jobseekers to apply for jobs posted by employers.

Our AI resume project is designed to meet the needs of two main target audiences: job seekers and employers.

For job seekers, the platform streamlines the process of finding relevant job opportunities. By uploading their resumes, job seekers receive personalized job matches tailored to their skills, experience, and preferences—reducing the time and effort needed to search for opportunities manually. This directly addresses their need for quick, accurate, and relevant job matching, increasing their chances of finding the right role faster.

For employers, the platform provides access to a pool of qualified candidates that match their job requirements. Using AI algorithms, the system analyzes candidate profiles and resumes to highlight the best fits for a given role. This saves employers time in the recruitment process and helps them find candidates whose skills align with their specific needs.

By focusing on these two target audiences, our platform bridges the gap between job seekers and employers—offering a smarter, data-driven approach to recruitment and job discovery.

For security, the following has been implemented on the backend to protect user data:

- HTTPS: Enforce secure data transfer using HTTPS.
- Authentication/Authorization: Strong session/token management using Token based authentication.
- Input Validation: We sanitize inputs to prevent injections (SQL, XSS).
- File Upload Security: Validate file types and sizes before uploading to Azure blob storage.
- Database Security: We use MVC, parameterized queries, and least privilege.
- Logging & Monitoring: We Detect suspicious activities by logging all activities in the backend.
- Environment Management: We Use .env for sensitive settings, no hard-coded secrets.
- Regular Updates: Patch libraries and dependencies.

## Table of Contents

- [User Stories](#user-stories)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [Testing Implemented](#testing-implemented)
- [Deployment Procedure](#deployment-procedure)

## User Stories
### Job Seeker User Stories
- As a job seeker, I want to upload my resume so that I can be matched with relevant job opportunities.

- As a job seeker, I want to see a list of jobs so that I can quickly find jobs or filter for jobs I can apply for.

- As a job seeker, I want to save jobs I’m interested in so that I can apply later.

- As a job seeker, I want my personal data to be protected and only shared with employers when I give consent.

### Employer User Stories
- As an employer, I want to post job openings so that I can attract qualified candidates and also edit jobs I have already posted.

- As an employer, I want to search for candidates based on their uploaded resumes and skills so that I can find the best match for my job roles.

- As an employer, I want to view matched candidates for a job opening so that I can quickly shortlist potential hires.

- As an employer, I want to view analytics and insights on the number of applications and matched candidates for my posted jobs.

- As an employer, I want to update the status of candidates who applied for a job.

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
- **employer_id**
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
- **employer_id** (FK)
- **job_id** (FK)
- **created_at**
- **updated_at**
- **record_status**

### Saved Jobs
- **id** (PK)
- **saved_job_id** (unique)
- **user_id** (FK)
- **employer_id** (FK)
- **job_id** (FK)
- **created_at**
- **updated_at**

### Relationships

- **Users** entity is managed by **CustomUserManager**.
- **Users** entity has static methods for various operations.
- **Jobs** entity has static methods for various operations.
- **Applications** entity has static methods for various operations.
- **Applications** entity has foreign keys to **Users** and **Jobs** entities.
- **Saved Jobs** entity has foreign keys to **Users** and **Jobs** entities.

### ER Diagram

```plaintext
+------------------+          +----------------------+          +------------------+
|    Users         |          |  CustomUserManager   |          |    Jobs          |
+------------------+          +----------------------+          +------------------+
| user_id (PK)     |          | create_user()        |          | id (PK)          |
| first_name       |          | create_superuser()   |          | job_id (unique)  |
|                  |          |                      |          | employer_id (FK) |                  
| last_name        |          | get_user_by_user_id()|          | title            |
| resume_url       |          | is_profile_complete()|          | description      |
| company_name     |          | get_user_by_user_id_json_format()| category        |
| contact_name     |          +----------------------+          | contract_type    |
| address          |                                             | company_name    |
| industry         |                                             | experience      |
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
| employer_id (FK) |
| job_id (FK)      |
| created_at       |
| updated_at       |
| record_status    |
+------------------+

+------------------+
| Saved Jobs       |
+------------------+
| id (PK)          |
| saved_job_id (unique) |
| user_id (FK)
| employer_id (FK) |
| job_id (FK)      |
| created_at       |
| updated_at       |
| record_status    |
+------------------+
```

## Testing Implemented
Automated testing was implemented for the backend. Sample test cases can be found in the tests.py file.

## Deployment Procedure
This project was deployed using a Virtual Machine (VM) on a Azure. The steps taken to accomplish that are as follows:

- I created a new VM (Ubuntu 22.04 LTS).
- I assigned a public IP address and configure security groups to allow SSH (port 22), HTTP (port 80), and HTTPS (port 443).
- I connected to the VM via SSH
  ```bash
   ssh your_username@your_server_ip
   ```
- I updated & installed Essential Packages using the commands below
  ```bash
  sudo apt update && sudo apt upgrade -y
  sudo apt install python3-pip python3-venv python3-dev build-essential libpq-dev nginx git -y
  ```
- I cloned the respository from github using the link:
```bash
https://github.com/peleisaac/ai-resume-backend.git
```
- I Set Up a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```
- I installed Project dependancies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```
- I configured django settings
```bash
Configure Django Settings

Set ALLOWED_HOSTS in settings.py to include your server IP/domain.

Set DEBUG=False for production.

Configure STATIC_ROOT and MEDIA_ROOT in settings.py.
```
- Collect Static Files
```bash
python manage.py collectstatic
```
- Apply database migrations
```bash
python manage.py migrate
```
- Set Up Gunicorn as the Application Server
- Install gunicorn by using the command:
```bash
pip install gunicorn
```
-Test it manually
```bash
gunicorn --bind 0.0.0.0:8000 your_project_name.wsgi:application
```
- Configure Supervisor to Manage Gunicorn
```bash
sudo apt install supervisor
```
- Create a Supervisor config for Gunicorn:
```bash
sudo nano /etc/supervisor/conf.d/your_project.conf
```
- Example Config
```bash
[program:your_project]
command=/home/your_username/your-repo/venv/bin/gunicorn --workers 3 --bind unix:/home/your_username/your-repo/your_project.sock your_project_name.wsgi:application
directory=/home/your_username/your-repo
user=your_username
autostart=true
autorestart=true
stdout_logfile=/var/log/your_project/gunicorn.log
stderr_logfile=/var/log/your_project/gunicorn_error.log
```
- Create Log Directories
```bash
sudo mkdir -p /var/log/your_project/
sudo chown -R your_username:your_username /var/log/your_project/
```
- Reload Supervisor
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```
- Configure Nginx as a revere proxy
```bash
sudo nano /etc/nginx/sites-available/your_project
```
- Example Config
```bash
server {
    listen 80;
    server_name your_domain.com your_server_ip;

    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        root /home/your_username/your-repo;
    }

    location /media/ {
        root /home/your_username/your-repo;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/your_username/your-repo/your_project.sock;
    }
}
```
- Enable the config
```bash
sudo ln -s /etc/nginx/sites-available/your_project /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```
- Secure with https (Optional but recommended)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com
```
