// Main functionality for job listings page
document.addEventListener('DOMContentLoaded', function () {
    // Load sidebar
    console.log("DOM fully loaded");
    // Uncomment the loadSidebar function if needed
    // loadSidebar();

    // Create New Job button action
    document.getElementById("createNewJob").addEventListener("click", function () {
        window.location.href = "./employer-new-job.html"; // Use relative path
    });

    initializeJobListings();

    // Setup filter event listeners
    document.getElementById("searchJobs").addEventListener("input", JobFilters.filterJobs);
    document.getElementById("categoryFilter").addEventListener("change", JobFilters.filterJobs);
    document.getElementById("statusFilter").addEventListener("change", JobFilters.filterJobs);
    document.getElementById("dateFilter").addEventListener("change", JobFilters.filterJobs);
});

async function initializeJobListings() {
    console.log("Initializing job listings");
    try {
        // Make sure JobDataService is available
        if (typeof JobDataService === 'undefined') {
            console.error("JobDataService is not defined. Loading jobs failed.");
            return;
        }

        // Show loading state
        const tableBody = document.getElementById("jobsTableBody");
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-message">
                        <div class="loading-spinner"></div>
                        Loading job listings...
                    </td>
                </tr>
            `;
        }

        const jobs = await JobDataService.loadJobs();
        console.log("Jobs loaded:", jobs);

        // Make sure JobListings functions are available
        if (typeof window.JobListings === 'undefined' ||
            typeof window.JobListings.renderJobs !== 'function') {
            console.error("JobListings.renderJobs is not defined. Rendering jobs failed.");
            return;
        }

        window.JobListings.renderJobs(jobs);
        console.log("Jobs rendered successfully");
    } catch (error) {
        console.error("Error initializing job listings:", error);
        // Show error message
        const tableBody = document.getElementById("jobsTableBody");
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="error-message">
                        Error loading jobs. Please refresh the page and try again.
                    </td>
                </tr>
            `;
        }
    }
}

// Functions for rendering jobs and setting up action buttons
function renderJobs(jobs) {
    console.log("Rendering jobs:", jobs);
    const tableBody = document.getElementById("jobsTableBody");

    // Make sure the table body exists
    if (!tableBody) {
        console.error("jobsTableBody element not found");
        return;
    }

    tableBody.innerHTML = "";

    if (!jobs || jobs.length === 0) {
        const noJobsRow = document.createElement("tr");
        noJobsRow.innerHTML = `
            <td colspan="7" class="no-jobs-message">
                No job listings found. <a href="./employer-new-job.html">Create your first job listing</a>.
            </td>
        `;
        tableBody.appendChild(noJobsRow);
        return;
    }

    jobs.forEach(job => {
        const formattedDate = job.datePosted ? new Date(job.datePosted).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : 'N/A';

        const jobRow = document.createElement("tr");
        jobRow.innerHTML = `
            <td>
                <div class="job-title-container">
                    <span class="job-title">${job.jobTitle || 'Untitled Position'}</span>
                </div>
            </td>
            <td>${capitalizeFirstLetter(job.category || 'uncategorized')}</td>
            <td>${job.city || 'Not specified'}</td>
            <td>
                <span class="application-count">${job.applications}</span>
            </td>
            <td>${formattedDate}</td>
            <td>
                <span class="status-badge ${job.status || 'active'}">${capitalizeFirstLetter(job.status || 'active')}</span>
            </td>
            <td>
                <div class="action-menu">
                    <button class="action-btn view-btn" data-id="${job.id}" title="View Details">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="action-btn edit-btn" data-id="${job.id}" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="action-btn toggle-status-btn" data-id="${job.id}" data-status="${job.status || 'active'}" title="${(job.status || 'active') === 'active' ? 'Pause' : 'Activate'}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            ${(job.status || 'active') === 'active' ?
                '<path d="M10 9V15M14 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' :
                '<path d="M10 9L15 12L10 15V9Z" fill="currentColor"/><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
            }
                        </svg>
                    </button>
                    <button class="action-btn delete-btn" data-id="${job.id}" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(jobRow);
    });

    // Add event listeners to action buttons
    setupActionButtons();
}

async function setupActionButtons() {
    // View job details
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const jobId = this.getAttribute('data-id');
        });
    });

    // Edit job
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const jobId = this.getAttribute('data-id');
        });
    });

    // Toggle job status (active/paused)
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const jobId = this.getAttribute('data-id');
            const currentStatus = this.getAttribute('data-status');
            const newStatus = currentStatus === 'active' ? 'paused' : 'active';

            // Disable the button while updating
            this.disabled = true;

            try {
                // Update job in data service
                const success = await JobDataService.updateJobStatus(jobId, newStatus);
                
                if (!success) {
                    alert("Failed to update job status. Please try again.");
                }
            } catch (error) {
                console.error("Error updating job status:", error);
                alert("An error occurred while updating the job status.");
            } finally {
                // Re-enable the button
                this.disabled = false;
            }
        });
    });

    // Delete job
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const jobId = this.getAttribute('data-id');

            if (confirm("Are you sure you want to delete this job listing? This action cannot be undone.")) {
                // Disable the button while deleting
                this.disabled = true;

                try {
                    // Delete job using data service
                    const success = await JobDataService.deleteJob(jobId);
                    
                    if (!success) {
                        alert("Failed to delete job. Please try again.");
                    }
                } catch (error) {
                    console.error("Error deleting job:", error);
                    alert("An error occurred while deleting the job.");
                } finally {
                    // Re-enable the button
                    this.disabled = false;
                }
            }
        });
    });
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Handle page visibility changes (when user comes back to the tab)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        console.log("Page is now visible, reinitializing job listings");
        initializeJobListings();
    }
});

// Handle page reload/refresh events more explicitly
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        console.log("Page was restored from back-forward cache, reinitializing");
        initializeJobListings();
    }
});



window.loadJobListings = async function() {
    console.log("loadJobListings called");
    try {
        // Make sure JobDataService is available
        if (typeof JobDataService === 'undefined') {
            console.error("JobDataService is not defined. Loading jobs failed.");
            return;
        }

        const jobs = await JobDataService.loadJobs();
        console.log("Jobs loaded:", jobs);

        window.JobListings.renderJobs(jobs);
    } catch (error) {
        console.error("Error in loadJobListings:", error);
    }
};

window.JobListings = {
    renderJobs: renderJobs
};