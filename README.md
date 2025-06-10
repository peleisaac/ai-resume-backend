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
