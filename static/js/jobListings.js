// Main functionality for job listings page
document.addEventListener('DOMContentLoaded', function () {
    // Load sidebar
    console.log("DOM fully loaded");
    // Uncomment the loadSidebar function if needed
    // loadSidebar();

    // Create New Job button action (defensive in case element missing)
    const createBtn = document.getElementById("createNewJob");
    if (createBtn) {
        createBtn.addEventListener("click", function () {
            console.log("Create New Job clicked -> navigating to /employer-new-job/");
            window.location.assign("/employer-new-job/");
        });
    } else {
        console.warn("createNewJob button not found in DOM");
    }

    initializeJobListings();

    // Trigger filter/sort after initial load completes
    setTimeout(() => {
        if (typeof JobFilters !== 'undefined' && typeof JobFilters.filterJobs === 'function') {
            JobFilters.filterJobs();
        }
    }, 500);

    // Setup filter event listeners (defensive for missing nodes)
    document.getElementById("searchJobs")?.addEventListener("input", JobFilters.filterJobs);
    document.querySelector(".search-btn")?.addEventListener("click", function (e) {
        e.preventDefault();
        JobFilters.filterJobs();
    });
    document.getElementById("categoryFilter")?.addEventListener("change", JobFilters.filterJobs);
    document.getElementById("statusFilter")?.addEventListener("change", JobFilters.filterJobs);
    document.getElementById("dateFilter")?.addEventListener("change", JobFilters.filterJobs);
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
        // Sort jobs by datePosted descending (latest first)
        if (jobs && Array.isArray(jobs)) {
            jobs.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
        }
        console.log("Jobs loaded:", jobs);

        // Make sure JobListings functions are available
        if (typeof window.JobListings === 'undefined' ||
            typeof window.JobListings.renderJobs !== 'function') {
            console.error("JobListings.renderJobs is not defined. Rendering jobs failed.");
            return;
        }

        window.JobListings.renderJobs(jobs);
        // apply current filters (e.g., if Status dropdown already changed)
        console.log("About to call JobFilters.filterJobs()");
        console.log("JobFilters exists?", typeof JobFilters !== 'undefined');
        console.log("JobFilters.filterJobs exists?", typeof JobFilters?.filterJobs === 'function');

        if (typeof JobFilters !== 'undefined' && typeof JobFilters.filterJobs === 'function') {
            try {
                await JobFilters.filterJobs();
                console.log("JobFilters.filterJobs() completed");
            } catch (error) {
                console.error("Error calling JobFilters.filterJobs():", error);
            }
        } else {
            console.warn("JobFilters not available - sorting will not be applied after initial render");
        }
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

    // cache current jobs for modal/actions
    window.JobListings.currentJobs = jobs || [];

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
                No job listings found. <a href="/employer-new-job/">Create your first job listing</a>.
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

        const location = [job.city, job.region].filter(Boolean).join(', ') || 'Not specified';
        const statusText = capitalizeFirstLetter(job.status || 'active');
        const statusClass = (job.status || 'active') === 'active' ? 'active' : 'paused';

        const jobRow = document.createElement("tr");
        jobRow.innerHTML = `
            <td>
                <div class="job-title-container">
                    <span class="job-title">${job.jobTitle || 'Untitled Position'}</span>
                </div>
            </td>
            <td>${capitalizeFirstLetter(job.category || 'uncategorized')}</td>
            <td>${location}</td>
            <td>
                <span class="application-count">${job.applications}</span>
            </td>
            <td>${formattedDate}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="action-menu">
                    <button class="action-btn view-btn" data-id="${job.id}" title="View Details">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="action-btn applicants-btn" data-job-id="${job.id}" title="View Applicants">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M20 20V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
    console.log("✅ renderJobs() about to call setupActionButtons");
    setupActionButtons();
    console.log("✅ renderJobs() COMPLETED");
}

async function setupActionButtons() {
    // View job details
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const jobId = this.getAttribute('data-id');
            const job = (window.JobListings.currentJobs || []).find(j => j.id === jobId);
            if (job) {
                showJobDetailsModal(job);
            }
        });
    });

    // View applicants
    document.querySelectorAll('.applicants-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const jobId = this.getAttribute('data-job-id');
            if (jobId) {
                showApplicantsModal(jobId);
            }
        });
    });

    // Edit job
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const jobId = this.getAttribute('data-id');
            const job = (window.JobListings.currentJobs || []).find(j => j.id === jobId);
            if (job) {
                sessionStorage.setItem('editingJob', JSON.stringify(job));
                window.location.assign(`/employer-new-job/?edit=${jobId}`);
            }
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

            if (await showDeleteConfirmation()) {
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

function ensureModalContainer() {
    let modal = document.getElementById('job-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'job-details-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 11000;
            padding: 16px;
        `;
        modal.innerHTML = `
            <div id="job-details-card" style="background:#fff; max-width: 640px; width: 100%; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.2); overflow:hidden;">
                <div style="display:flex; justify-content: space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #e5e7eb;">
                    <h3 id="job-details-title" style="margin:0; font-size:18px; color:#111827;"></h3>
                    <button id="job-details-close" aria-label="Close" style="border:none; background:none; font-size:20px; cursor:pointer; color:#6b7280;">×</button>
                </div>
                <div style="padding:16px 20px; max-height:70vh; overflow-y:auto;" id="job-details-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('#job-details-close').onclick = () => { modal.style.display = 'none'; };
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }
    return modal;
}

function ensureDeleteConfirmationModal() {
    let modal = document.getElementById('delete-confirmation-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'delete-confirmation-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 12000;
            padding: 16px;
        `;

        modal.innerHTML = `
            <div style="background:#fff; max-width: 400px; width: 100%; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); overflow:hidden; transform: scale(1); transition: transform 0.2s;">
                <div style="padding: 24px;">
                    <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin: 0 auto 16px; background-color: #fee2e2; border-radius: 50%;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9V14M12 17.01L12.01 16.998M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #111827; text-align: center;">Delete Job Listing</h3>
                    <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center; line-height: 1.5;">Are you sure you want to delete this job listing? This action cannot be undone.</p>
                </div>
                <div style="background-color: #f9fafb; padding: 16px 24px; display: flex; gap: 12px; justify-content: center;">
                    <button id="cancel-delete-btn" style="flex: 1; padding: 8px 16px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.2s;">Cancel</button>
                    <button id="confirm-delete-btn" style="flex: 1; padding: 8px 16px; background: #dc2626; border: 1px solid transparent; border-radius: 6px; font-size: 14px; font-weight: 500; color: #fff; cursor: pointer; transition: all 0.2s;">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Hover effects via JS since inline CSS is used
        const cancelBtn = modal.querySelector('#cancel-delete-btn');
        cancelBtn.onmouseenter = () => cancelBtn.style.backgroundColor = '#f3f4f6';
        cancelBtn.onmouseleave = () => cancelBtn.style.backgroundColor = '#fff';

        const confirmBtn = modal.querySelector('#confirm-delete-btn');
        confirmBtn.onmouseenter = () => confirmBtn.style.backgroundColor = '#b91c1c';
        confirmBtn.onmouseleave = () => confirmBtn.style.backgroundColor = '#dc2626';
    }
    return modal;
}

function showDeleteConfirmation() {
    return new Promise((resolve) => {
        const modal = ensureDeleteConfirmationModal();
        const cancelBtn = modal.querySelector('#cancel-delete-btn');
        const confirmBtn = modal.querySelector('#confirm-delete-btn');

        const cleanup = () => {
            modal.style.display = 'none';
            cancelBtn.onclick = null;
            confirmBtn.onclick = null;
            modal.onclick = null;
        };

        cancelBtn.onclick = () => {
            cleanup();
            resolve(false);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                cleanup();
                resolve(false);
            }
        };

        confirmBtn.onclick = () => {
            cleanup();
            resolve(true);
        };

        modal.style.display = 'flex';
    });
}

function ensureApplicantsModal() {
    let modal = document.getElementById('applicants-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'applicants-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 11000;
            padding: 16px;
        `;
        modal.innerHTML = `
            <div style="background:#fff; max-width: 720px; width: 100%; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.2); overflow:hidden;">
                <div style="display:flex; justify-content: space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #e5e7eb;">
                    <h3 style="margin:0; font-size:18px; color:#111827;">Applicants</h3>
                    <button id="applicants-close" aria-label="Close" style="border:none; background:none; font-size:20px; cursor:pointer; color:#6b7280;">×</button>
                </div>
                <div id="applicants-body" style="padding:16px 20px; max-height:70vh; overflow-y:auto;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('#applicants-close').onclick = () => { modal.style.display = 'none'; };
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }
    return modal;
}

async function showApplicantsModal(jobId) {
    const modal = ensureApplicantsModal();
    const body = modal.querySelector('#applicants-body');
    body.innerHTML = '<div style="padding:12px; text-align:center; color:#4b5563;">Loading applicants...</div>';
    modal.style.display = 'flex';

    try {
        const applicants = await JobDataService.loadApplicationsByJob(jobId);
        const state = {
            all: applicants,
            filtered: applicants,
            status: 'all',
            search: ''
        };

        const render = () => {
            const list = state.filtered;
            if (!list.length) {
                body.innerHTML = '<div style="padding:12px; text-align:center; color:#6b7280;">No applicants match your filters.</div>';
                return;
            }

            const rows = list.map(app => {
                const applicantName = [app.applicant.first_name, app.applicant.last_name].filter(Boolean).join(' ') || app.applicant.email || 'Unknown';
                const status = (app.status || 'pending').toLowerCase();
                const created = app.created_at ? new Date(app.created_at).toLocaleString() : '—';
                const email = app.applicant.email || '';
                const resume = app.applicant.resume_url ? `<a href="${app.applicant.resume_url}" target="_blank" rel="noopener" style="color:#2563eb;">Resume</a>` : '';
                return `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #e5e7eb; gap:12px;">
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:600; color:#111827;">${applicantName}</div>
                            <div style="color:#6b7280; font-size:12px;">${email ? `<a href="mailto:${email}" style="color:#2563eb;">${email}</a>` : ''}</div>
                            <div style="color:#6b7280; font-size:12px;">Applied: ${created}</div>
                            <div style="color:#6b7280; font-size:12px;">${resume}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <select data-app-id="${app.id}" class="app-status-select" style="padding:6px 8px; border:1px solid #d1d5db; border-radius:6px; font-size:12px; color:#111827;">
                                ${['pending', 'review', 'shortlisted', 'rejected', 'hired', 'withdrawn'].map(opt => `<option value="${opt}" ${status === opt ? 'selected' : ''}>${capitalizeFirstLetter(opt)}</option>`).join('')}
                            </select>
                            <button class="action-btn save-app-status" data-app-id="${app.id}" style="padding:6px 10px; background:#4f46e5; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px;">Save</button>
                        </div>
                    </div>
                `;
            }).join('');

            body.innerHTML = `
                <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; align-items:center;">
                    <div style="font-weight:600; color:#111827;">Applicants (${state.filtered.length}/${state.all.length})</div>
                    <select id="applicant-status-filter" style="padding:6px 8px; border:1px solid #d1d5db; border-radius:6px; font-size:12px; color:#111827;">
                        ${['all', 'pending', 'review', 'shortlisted', 'rejected', 'hired', 'withdrawn'].map(opt => `<option value="${opt}" ${state.status === opt ? 'selected' : ''}>${capitalizeFirstLetter(opt)}</option>`).join('')}
                    </select>
                    <input id="applicant-search" type="search" placeholder="Search name or email" value="${state.search || ''}" style="padding:6px 8px; border:1px solid #d1d5db; border-radius:6px; font-size:12px; min-width:200px;">
                </div>
                <div>${rows}</div>
            `;

            const statusSelect = body.querySelector('#applicant-status-filter');
            const searchInput = body.querySelector('#applicant-search');
            statusSelect.onchange = () => {
                state.status = statusSelect.value;
                applyFilters();
            };
            searchInput.oninput = () => {
                state.search = searchInput.value || '';
                applyFilters();
            };

            body.querySelectorAll('.save-app-status').forEach(btn => {
                btn.addEventListener('click', async function () {
                    const appId = this.getAttribute('data-app-id');
                    const select = body.querySelector(`select[data-app-id="${appId}"]`);
                    const newStatus = select ? select.value : 'pending';
                    this.disabled = true;
                    try {
                        const ok = await JobDataService.updateApplicationStatus(appId, newStatus);
                        this.disabled = false;
                        if (ok) {
                            // update local copy
                            const target = state.all.find(a => a.id === appId);
                            if (target) target.status = newStatus;
                            applyFilters();
                        }
                    } catch (e) {
                        this.disabled = false;
                    }
                });
            });
        };

        const applyFilters = () => {
            const term = (state.search || '').toLowerCase();
            state.filtered = state.all.filter(app => {
                const statusOk = state.status === 'all' || (app.status || '').toLowerCase() === state.status;
                const name = [app.applicant.first_name, app.applicant.last_name].filter(Boolean).join(' ').toLowerCase();
                const email = (app.applicant.email || '').toLowerCase();
                const textOk = !term || name.includes(term) || email.includes(term);
                return statusOk && textOk;
            });
            render();
        };

        if (!applicants.length) {
            body.innerHTML = '<div style="padding:12px; text-align:center; color:#6b7280;">No applicants yet.</div>';
            return;
        }

        applyFilters();
    } catch (e) {
        body.innerHTML = '<div style="padding:12px; text-align:center; color:#ef4444;">Failed to load applicants.</div>';
    }
}

function formatEducation(val = '') {
    const key = val.toString().toLowerCase().replace(/[^a-z]/g, '');
    const map = {
        highschool: "High School",
        associatesdegree: "Associate's Degree",
        associate: "Associate's Degree",
        bachelor: "Bachelor's Degree",
        bachelorsdegree: "Bachelor's Degree",
        master: "Master's Degree",
        mastersdegree: "Master's Degree",
        doctorate: "Doctorate",
        phd: "Doctorate"
    };
    return map[key] || (val || '—');
}

function formatContract(val = '') {
    const key = val.toString().toLowerCase().replace(/[^a-z]/g, '');
    const map = {
        fulltime: 'Full-Time',
        parttime: 'Part-Time',
        contract: 'Contract',
        internship: 'Internship',
        temporary: 'Temporary'
    };
    return map[key] || (val || '—');
}

function showJobDetailsModal(job) {
    const modal = ensureModalContainer();
    const body = modal.querySelector('#job-details-body');
    const title = modal.querySelector('#job-details-title');
    title.textContent = job.jobTitle || 'Job details';

    const details = [
        { label: 'Category', value: capitalizeFirstLetter(job.category) },
        { label: 'Status', value: capitalizeFirstLetter(job.status) },
        { label: 'Contract', value: formatContract(job.contract_type || job.contractType) },
        { label: 'Experience', value: job.experience },
        {
            label: 'Education', value: formatEducation(
                job.education_level || job.education || job.educationLevel || job.educationlevel || ''
            )
        },
        { label: 'Location', value: [job.city, job.region].filter(Boolean).join(', ') },
        { label: 'Salary', value: job.salary },
        { label: 'Vacancies', value: job.no_of_vacancies },
        { label: 'Company', value: job.company_name },
    ];

    const listItem = (label, value) => `
        <div style="display:flex; margin-bottom:10px;">
            <div style="width:140px; color:#6b7280; font-weight:600;">${label}</div>
            <div style="flex:1; color:#111827;">${value || '—'}</div>
        </div>
    `;

    const chipList = (title, values = []) => {
        if (!values || !values.length) return '';
        const chips = values.map(v => `<span style="display:inline-block; background:#eef2ff; color:#4338ca; padding:4px 8px; border-radius:9999px; margin:4px 6px 0 0; font-size:12px;">${v}</span>`).join('');
        return `<div style="margin:12px 0;"><div style="font-weight:600; color:#374151; margin-bottom:6px;">${title}</div><div>${chips}</div></div>`;
    };

    body.innerHTML = `
        ${listItem('Posted', job.datePosted ? new Date(job.datePosted).toLocaleString() : '—')}
        ${details.map(d => listItem(d.label, d.value)).join('')}
        <div style="margin:12px 0;">
            <div style="font-weight:600; color:#374151; margin-bottom:6px;">Description</div>
            <div style="white-space:pre-wrap; color:#111827;">${job.description || '—'}</div>
        </div>
        ${chipList('Requirements', job.requirements)}
        ${chipList('Skills', job.required_skills)}
        ${chipList('Benefits', job.benefits)}
    `;

    modal.style.display = 'flex';
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Handle page visibility changes (when user comes back to the tab)
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        console.log("Page is now visible, reinitializing job listings");
        initializeJobListings();
    }
});

// Handle page reload/refresh events more explicitly
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        console.log("Page was restored from back-forward cache, reinitializing");
        initializeJobListings();
    }
});



window.loadJobListings = async function () {
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
    renderJobs: renderJobs,
    currentJobs: []
};
