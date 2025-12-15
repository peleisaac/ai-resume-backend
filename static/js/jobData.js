// Job data management service (API-first)

if (!window.JobDataService) {
    const JobDataService = {
        cachedJobs: null,

        showToast: function (message, type) {
            const toast = document.createElement("div");
            toast.className = `toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.classList.add("fade-out");
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        },

        loadJobs: async function (forceReload = false) {
            try {
                if (!forceReload && Array.isArray(this.cachedJobs)) {
                    return this.cachedJobs;
                }

                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.token) {
                    console.warn("User not logged in or token missing. Cannot load jobs.");
                    return [];
                }
                console.log("User: ", user);
                const employer_id = user.user_id;

                const response = await fetch(`${apiEndpoints.jobsByEmployer}/${employer_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${user.token}`
                    },
                    mode: "cors"
                });

                const result = await response.json();

                if (response.ok && (result.status_code === "AR00" || result.status_code === 200 || result.status_code === "200")) {
                    const formatted = this.formatApiJobs(result.jobs || []);
                    this.cachedJobs = formatted;
                    return formatted;
                }

                this.showToast(result.message || "Failed to load jobs from API.", "error");
                return [];
            } catch (error) {
                this.showToast("Error connecting to server.", "error");
                return [];
            }
        },

        formatApiJobs: function (apiJobs) {
            return apiJobs.map(job => ({
                id: job.job_id,
                jobTitle: job.title || "Untitled Position",
                description: job.description || "",
                category: job.category || "other",
                contract_type: job.contract_type || "",
                experience: job.experience || "",
                education_level: job.education_level || "",
                city: job.city || "Not specified",
                region: job.region || "Not specified",
                applications: job.no_of_applications || 0,
                datePosted: job.created_at || job.updated_at || new Date().toISOString(),
                status: job.is_active === 0 || job.is_active === false ? "paused" : "active",
                salary: job.salary || "",
                company_name: job.company_name || "",
                requirements: job.requirements || [],
                required_skills: job.required_skills || [],
                benefits: job.benefits || [],
                no_of_vacancies: job.no_of_vacancies || "",
            }));
        },

        updateJobStatus: async function (jobId, newStatus) {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.token) {
                    console.warn("User not logged in or token missing. Cannot update job status.");
                    return false;
                }

                const endpoint = newStatus === "active"
                    ? `${apiEndpoints.base}/job/activate/${jobId}`
                    : `${apiEndpoints.base}/job/deactivate/${jobId}`;

                const response = await fetch(endpoint, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${user.token}`
                    },
                    mode: "cors"
                });

                const result = await response.json().catch(() => ({}));

                if (response.ok) {
                    this.showToast(`Job status updated to ${newStatus}!`, "success");
                    // refresh cache
                    this.cachedJobs = null;
                    const jobs = await this.loadJobs(true);
                    window.JobListings.renderJobs(jobs);
                    return true;
                }

                this.showToast(result.message || "Failed to update job status.", "error");
                return false;
            } catch (error) {
                this.showToast("Network error when updating job status.", "error");
                return false;
            }
        },

        deleteJob: async function (jobId) {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.token) {
                    console.warn("User not logged in or token missing. Cannot delete job.");
                    return false;
                }
                console.log("User: ", user);

                const response = await fetch(`${apiEndpoints.deleteJob}/${jobId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${user.token}`
                    },
                    mode: "cors"
                });

                if (response.ok) {
                    this.showToast("Job deleted successfully!", "success");
                    this.cachedJobs = null;
                    const jobs = await this.loadJobs(true);
                    window.JobListings.renderJobs(jobs);
                    return true;
                }

                const result = await response.json();
                this.showToast(result.message || "Failed to delete job.", "error");
                return false;
            } catch (error) {
                this.showToast("Network error when deleting job.", "error");
                return false;
            }
        }
    };

    window.JobDataService = JobDataService;
}
