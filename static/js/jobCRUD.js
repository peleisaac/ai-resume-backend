/**
 * Job CRUD Operations
 * Handles Create, Read, Update, Delete for jobs and saved jobs
 */

class JobCRUD {
    constructor() {
        this.token = this.getToken();
        this.userId = this.getUserId();
    }

    isSuccess(response, data = {}) {
        const code = data?.status_code;
        return (
            (response && response.ok) ||
            code === 200 ||
            code === 201 ||
            code === "200" ||
            code === "201" ||
            code === "AR00"
        );
    }

    getToken() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token;
    }

    getUserId() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.user_id;
    }

    /**
     * CREATE - Save a job
     */
    async saveJob(jobId) {
        try {
            const response = await fetch(
                `${window.apiEndpoints.base}/job/save`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    },
                    body: JSON.stringify({
                        user_id: this.userId,
                        job_id: jobId
                    })
                }
            );

            const data = await response.json();
            const ok = this.isSuccess(response, data);

            if (ok) {
                window.notify.success('Job saved successfully!');
                return true;
            } else {
                window.notify.error(
                    data.message || 'Failed to save job'
                );
                return false;
            }
        } catch (error) {
            window.notify.error('Error saving job');
            console.error('Save job error:', error);
            return false;
        }
    }

    /**
     * READ - Get saved jobs
     */
    async getSavedJobs(userId) {
        try {
            const response = await fetch(
                `${window.apiEndpoints.base}/jobs/saved/${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    }
                }
            );

            const raw = await response.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch (e) {
                console.warn('Non-JSON response from jobs/saved:', raw);
            }

            if (this.isSuccess(response, data)) {
                return data.saved_jobs || [];
            }

            window.notify.error(
                data.message || 'Failed to load saved jobs'
            );
            return [];
        } catch (error) {
            window.notify.error('Error loading saved jobs');
            console.error('Get saved jobs error:', error);
            return [];
        }
    }

    /**
     * DELETE - Remove saved job
     */
    async removeSavedJob(jobId) {
        try {
            const response = await fetch(
                `${window.apiEndpoints.base}/saved-job/remove`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    },
                    body: JSON.stringify({
                        user_id: this.userId,
                        job_id: jobId
                    })
                }
            );

            const raw = await response.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch (e) {
                console.warn('Non-JSON response from saved-job/remove:', raw);
            }

            if (this.isSuccess(response, data)) {
                window.notify.success('Job removed from saved list');
                return true;
            }

            window.notify.error(
                data.message || 'Failed to remove job'
            );
            return false;
        } catch (error) {
            window.notify.error('Error removing job');
            console.error('Remove saved job error:', error);
            return false;
        }
    }

    /**
     * CREATE - Apply for a job
     */
    async applyForJob(jobId, employerId, coverLetter = '') {
        try {
            const response = await fetch(
                `${window.apiEndpoints.base}/application/add`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    },
                    body: JSON.stringify({
                        user_id: this.userId,
                        job_id: jobId,
                        employer_id: employerId,
                        application_status: 'pending',
                        cover_letter: coverLetter
                    })
                }
            );

            const raw = await response.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch (e) {
                console.warn('Non-JSON response from application/add:', raw);
            }

            const okStatus = this.isSuccess(response, data);

            if (okStatus) {
                window.notify.success('Application submitted successfully!');
                return true;
            }

            const alreadyExists = (data.message || '').toLowerCase().includes('already exists') || data.status_code === 'AR05';
            if (alreadyExists) {
                window.notify.warning('You already applied to this job.');
                return false;
            }

            const msg = data.message || `Failed to submit application (HTTP ${response.status}).`;
            window.notify.error(msg);
            return false;
        } catch (error) {
            window.notify.error('Error submitting application');
            console.error('Apply for job error:', error);
            return false;
        }
    }

    /**
     * CREATE - Add new job (Employer)
     */
    async addJob(jobData) {
        // Require auth token; no local fallback
        if (!this.token) {
            window.notify.error('Authentication required to post a job.');
            return null;
        }

        try {
            console.log('Submitting job payload:', jobData);
            const response = await fetch(
                `${window.apiEndpoints.base}/job/add`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    },
                    body: JSON.stringify(jobData)
                }
            );

            const raw = await response.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch (e) {
                console.warn('Non-JSON response from job/add:', raw);
            }

            const ok = this.isSuccess(response, data);

            if (ok) {
                window.notify.success('Job posted successfully!');
                if (window.JobDataService) {
                    window.JobDataService.cachedJobs = null;
                }
                return {
                    success: true,
                    job: data.job
                };
            }

            const message = data.message || `Failed to post job (HTTP ${response.status}).`;
            window.notify.error(message);
            console.error('Job post failed:', { status: response.status, data: data || raw });
            return {
                success: false,
                error: message
            };
        } catch (error) {
            // Network or other error: fall back to local mock
            console.error('Add job error:', error);
            window.notify.error('Network issue while posting job.');
            return {
                success: false,
                error: 'Network issue while posting job.'
            };
        }
    }

    /**
     * UPDATE - Update job (Employer)
     */
    async updateJob(jobId, jobData) {
        try {
            // Only send fields accepted by the update_job serializer
            const allowed = (({
                title,
                description,
                category,
                contract_type,
                experience,
                education_level,
                region,
                city,
                no_of_vacancies,
                salary,
                requirements,
                required_skills,
                benefits,
                company_name
            }) => ({
                title,
                description,
                category,
                contract_type,
                experience,
                education_level,
                region,
                city,
                no_of_vacancies,
                salary,
                requirements,
                required_skills,
                benefits,
                company_name
            }))(jobData || {});

            const response = await fetch(
                `${window.apiEndpoints.base}/job/${jobId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    },
                    body: JSON.stringify(allowed)
                }
            );

            const data = await response.json().catch(() => ({}));
            const ok = this.isSuccess(response, data);

            if (ok) {
                window.notify.success('Job updated successfully!');
                if (window.JobDataService) {
                    window.JobDataService.cachedJobs = null;
                }
                return data.job;
            }

            window.notify.error(
                (data && data.message) || `Failed to update job (HTTP ${response.status}).`
            );
            return null;
        } catch (error) {
            window.notify.error('Error updating job');
            console.error('Update job error:', error);
            return null;
        }
    }

    /**
     * DELETE - Delete job (Employer)
     */
    async deleteJob(jobId) {
        if (!confirm(
            'Are you sure you want to delete this job posting? ' +
            'This action cannot be undone.'
        )) {
            return false;
        }

        try {
            const response = await fetch(
                `${window.apiEndpoints.base}/job/delete/${jobId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${this.token}`
                    }
                }
            );

            const raw = await response.text();
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch (e) {
                console.warn('Non-JSON response from job/delete:', raw);
            }

            if (this.isSuccess(response, data)) {
                window.notify.success('Job deleted successfully');
                if (window.JobDataService) {
                    window.JobDataService.cachedJobs = null;
                }
                return true;
            }

            window.notify.error(
                data.message || 'Failed to delete job'
            );
            return false;
        } catch (error) {
            window.notify.error('Error deleting job');
            console.error('Delete job error:', error);
            return false;
        }
    }
}

// Create global instance
window.jobCRUD = new JobCRUD();
