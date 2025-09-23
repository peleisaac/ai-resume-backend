// Job data management service

const JobDataService = {

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

    loadJobs: async function () {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.token) {
                console.warn("User not logged in or token missing. Falling back to mock data.");
                return this.getMockJobs();
            }
            console.log("User: ", user);
            employer_id = user.user_id;

            const response = await fetch(`${apiEndpoints.jobsByEmployer}/${employer_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                },
                mode: "cors"
            });

            const result = await response.json();

            if (response.ok && result.status_code === "AR00") {
                // this.showToast("Jobs loaded successfully!", "success");
                return this.formatApiJobs(result.jobs);
            } else {
                this.showToast("Failed to load jobs. Using demo data.", "error");
                return this.getMockJobs();
            }
        } catch (error) {
            this.showToast("Error connecting to server. Using demo data.", "error");
            return this.getMockJobs();
        }
    },

    formatApiJobs: function (apiJobs) {
        return apiJobs.map(job => ({
            id: job.job_id,
            jobTitle: job.title || "Untitled Position",
            category: job.category || "other",
            city: job.city || "Not specified",
            region: job.region || "Not specified",
            applications: job.no_of_applications || 0,
            datePosted: job.date_posted || new Date().toISOString().split('T')[0],
            status: job.status || "active"
        }));
    },

    updateJobList: function (newJob) {
        console.log("Updating job list with new job:", newJob);
        console.log("Job added successfully, will refresh job list on next view");

        return true;
    },
    getMockJobs: function () {
        return [
            {
                id: 1,
                jobTitle: "Senior Software Engineer",
                category: "technology",
                city: "San Francisco",
                region: "west",
                applications: 24,
                datePosted: "2025-03-05",
                status: "active"
            },
            {
                id: 2,
                jobTitle: "Marketing Manager",
                category: "marketing",
                city: "New York",
                region: "northeast",
                applications: 15,
                datePosted: "2025-03-08",
                status: "active"
            },
            {
                id: 3,
                jobTitle: "Data Analyst",
                category: "technology",
                city: "Remote",
                region: "remote",
                applications: 8,
                datePosted: "2025-03-01",
                status: "active"
            },
            {
                id: 4,
                jobTitle: "Financial Advisor",
                category: "finance",
                city: "Chicago",
                region: "midwest",
                applications: 6,
                datePosted: "2025-02-20",
                status: "paused"
            },
            {
                id: 5,
                jobTitle: "HR Specialist",
                category: "other",
                city: "Denver",
                region: "west",
                applications: 12,
                datePosted: "2025-03-10",
                status: "active"
            }
        ];
    },

    getAllJobs: async function () {
        return await this.loadJobs();
    },

    updateJobStatus: async function (jobId, newStatus) {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.token) {
                console.warn("User not logged in or token missing. Cannot update job status.");
                return false;
            }

            const response = await fetch(`${apiEndpoints.applicationStatus}/${jobId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                },
                body: JSON.stringify({ status: newStatus }),
                mode: "cors"
            });

            const result = await response.json();

            if (response.ok) {
                this.showToast(`Job status updated to ${newStatus}!`, "success");
                // Re-fetch and re-render the jobs table
                const jobs = await this.loadJobs();
                window.JobListings.renderJobs(jobs);
                return true;
            } else {
                this.showToast("Failed to update job status.", "error");
                return false;
            }
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
                // Re-fetch and re-render the jobs table
                const jobs = await this.loadJobs();
                window.JobListings.renderJobs(jobs);
                return true;
            } else {
                const result = await response.json();
                this.showToast("Failed to delete job.", "error");
                return false;
            }
        } catch (error) {
            this.showToast("Network error when deleting job.", "error");
            return false;
        }
    }
};

// Make the service globally accessible
window.JobDataService = JobDataService;