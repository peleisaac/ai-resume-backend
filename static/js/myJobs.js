document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const tabs = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const savedJobsList = document.getElementById('saved-jobs-list');
    const appliedJobsList = document.getElementById('applied-jobs-list');
    const noSavedJobsMsg = document.getElementById('no-saved-jobs');
    const noAppliedJobsMsg = document.getElementById('no-applied-jobs');
    const savedSearchInput = document.getElementById('saved-search');
    const savedSearchBtn = document.getElementById('saved-search-btn');
    const appliedSearchInput = document.getElementById('applied-search');
    const appliedSearchBtn = document.getElementById('applied-search-btn');
    const statusFilter = document.getElementById('status-filter');
    const dateFilterElement = document.getElementById('date-filter'); 
    const filterBtn = document.getElementById('filter-btn');
    const modal = document.getElementById('job-modal');
    const closeModal = document.querySelector('.modal .close');
    const jobDetailContent = document.getElementById('job-detail-content');
    const applyButton = document.getElementById('apply-button');
    const removeSavedButton = document.getElementById('remove-saved-button');
    const toastContainer = document.getElementById('toast-container');


    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show active content
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tabId}-jobs`).classList.add('active');
        });
    });

    let savedJobs = [];
    let appliedJobs = [];

    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch (e) {
            return null;
        }
    };

    function init() {
        fetchSavedJobs();
        fetchAppliedJobs();
    }

    function parseRequiredSkills(skills) {
        // Handle case where skills is a string that looks like a JSON array
        if (typeof skills === 'string' && skills.startsWith('[') && skills.endsWith(']')) {
            try {
                return JSON.parse(skills);
            } catch (e) {
                // If parsing fails, try simple string splitting
                return skills.replace(/[\[\]"]/g, '').split(',').map(s => s.trim());
            }
        }
        // Handle case where skills is already an array
        else if (Array.isArray(skills)) {
            return skills;
        }
        // Handle case where skills is a simple string
        else if (typeof skills === 'string') {
            return [skills];
        }
        // Default to empty array
        return [];
    }


    async function fetchSavedJobs() {
        savedJobsList.innerHTML = '<div class="loading-spinner"></div>';

        const user = getCurrentUser();
        if (!user || !user.user_id) {
            savedJobs = [];
            loadSavedJobs();
            return;
        }

        try {
            const response = await fetch(`${apiEndpoints.savedJobs}/${user.user_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch saved jobs (HTTP ${response.status})`);

            const data = await response.json();
            const saved_Jobs = (data.saved_jobs || []).filter(app => app.job_details);
            savedJobs = saved_Jobs.map(app => {
                const required_skills = parseRequiredSkills(app.job_details.required_skills || []);

                return {
                    id: app.saved_job_id,
                    job_id: app.job_details.job_id,
                    title: app.job_details.title || "No Title",
                    company_name: app.job_details.company_name || "Not specified",
                    city: app.job_details.city || "Not specified",
                    region: app.job_details.region || "Not specified",
                    salary: app.job_details.salary || "Not specified",
                    contract_type: app.job_details.contract_type || "Not specified",
                    experience: app.job_details.experience || "Not specified",
                    created_at: app.created_at,
                    description: app.job_details.description || "No description available.",
                    requirements: parseRequiredSkills(app.job_details.requirements ||  []),
                    required_skills: required_skills,
                    benefits: parseRequiredSkills(app.job_details.benefits || [])
                };
            });
        } catch (error) {
            console.error("Error fetching saved jobs:", error);
            savedJobs = [];
        }

        loadSavedJobs();
    }

    async function fetchAppliedJobs() {
        appliedJobsList.innerHTML = '<div class="loading-spinner"></div>';

        const user = getCurrentUser();
        if (!user || !user.user_id) {
            appliedJobs = [];
            loadAppliedJobs();
            return;
        }

        try {
            const response = await fetch(`${apiEndpoints.applicationsByUser}/${user.user_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch applied jobs (HTTP ${response.status})`);
            const data = await response.json();

            const applied_jobs = (data.applications || []).filter(app => app.job_details);

            appliedJobs = applied_jobs.map(app => {
                const required_skills = parseRequiredSkills(app.job_details.required_skills || []);

                return {
                    id: app.application_id,
                    job_id: app.job_details.job_id,
                    title: app.job_details.title || "No Title",
                    company_name: app.job_details.company_name || "Not specified",
                    city: app.job_details.city || "Not specified",
                    region: app.job_details.region || "Not specified",
                    salary: app.job_details.salary || "Not specified",
                    contract_type: app.job_details.contract_type || "Not specified",
                    experience: app.job_details.experience || "Not specified",
                    created_at: app.created_at,
                    status: (app.status || "processing").toLowerCase(),
                    description: app.job_details.description || "No description available.",
                    requirements: parseRequiredSkills(app.job_details.requirements || []),
                    required_skills: required_skills,
                    benefits: parseRequiredSkills(app.job_details.benefits || [])
                };
            });

            notifyApplicationStatusChanges(appliedJobs);
        } catch (error) {
            console.error("Error fetching applied jobs:", error);
            appliedJobs = [];
        }

        loadAppliedJobs();
    }

    function notifyApplicationStatusChanges(applications) {
        const cacheKey = "applicationStatusCache";
        let cache = {};
        try {
            cache = JSON.parse(localStorage.getItem(cacheKey) || "{}");
        } catch (e) {
            cache = {};
        }

        const updates = [];
        (applications || []).forEach(app => {
            if (!app.id || !app.status) return;
            const prev = cache[app.id];
            const current = (app.status || "").toLowerCase();
            if (prev && prev !== current) {
                updates.push({ id: app.id, title: app.title || "Application", status: current });
            }
            cache[app.id] = current;
        });

        if (updates.length && window.notify && typeof window.notify.info === "function") {
            updates.forEach(u => {
                window.notify.info(`${u.title} status updated to ${u.status}`);
            });
        }

        localStorage.setItem(cacheKey, JSON.stringify(cache));
    }

    function loadSavedJobs() {
        savedJobsList.innerHTML = "";

        if (savedJobs.length === 0) {
            noSavedJobsMsg.style.display = 'block';
        } else {
            noSavedJobsMsg.style.display = 'none';
            savedJobs.forEach(job => {
                const jobCard = createJobCard(job, 'saved');
                savedJobsList.appendChild(jobCard);
            });
        }
    }

    function loadAppliedJobs() {
        appliedJobsList.innerHTML = ''; // Clear previous content

        if (appliedJobs.length === 0) {
            noAppliedJobsMsg.style.display = 'block';
        } else {
            noAppliedJobsMsg.style.display = 'none';
            appliedJobs.forEach(job => {
                const jobCard = createJobCard(job, 'applied');
                appliedJobsList.appendChild(jobCard);
            });
        }
    }

    init();

    // Create Job Card - Updated to match browse_jobs.js style
    function createJobCard(job, type) {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.dataset.jobId = job.id;

        // Calculate time ago for saved/applied date (avoid rounding up on small deltas)
        const postedDate = new Date(job.created_at);
        const now = new Date();
        const diffMs = Math.max(0, now - postedDate);
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeAgo;
        if (diffMinutes < 1) {
            timeAgo = 'Just now';
        } else if (diffMinutes < 60) {
            timeAgo = `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
        } else if (diffHours < 24) {
            timeAgo = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffDays < 7) {
            timeAgo = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            timeAgo = `${weeks} week${weeks === 1 ? '' : 's'} ago`;
        } else {
            const months = Math.floor(diffDays / 30);
            timeAgo = `${months} month${months === 1 ? '' : 's'} ago`;
        }

        // Create job description (first sentence)
        const shortDescription = job.description ?
            job.description.split('.')[0] + '.' :
            "No description available";

        // Generate required skills HTML
        const skillsHTML = job.required_skills && job.required_skills.length > 0 ?
            job.required_skills.map(skill => `<span class="job-tag">${skill}</span>`).join('') :
            '';

        // Job card HTML structure matching browse_jobs.js
        jobCard.innerHTML = `
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title || "No Title"}</h3>
                    <div class="company-name">${job.company_name || "No Company"}</div>
                </div>
                <div class="salary">${job.salary ? `${job.salary}` : "Not specified"}</div>
            </div>
            <div class="job-details">
                <div class="job-detail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${job.city}, ${job.region}
                </div>
                <div class="job-detail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    ${job.contract_type}
                </div>
                <div class="job-detail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    ${job.experience || "Not specified"}
                </div>
            </div>
            <div class="job-description">
                ${shortDescription}
            </div>
            <div class="job-tags">
                ${skillsHTML}
            </div>
            <div class="posted-date">
                ${type === 'saved' ? `Saved ${timeAgo}` : `Applied ${timeAgo}`}
                ${type === 'applied' && job.status ?
                `<span class="status-badge ${job.status}">${capitalizeFirstLetter(job.status.replace('_', ' '))}</span>` :
                ''}
            </div>
        `;

        // Add event listener to open job details
        jobCard.addEventListener('click', () => openJobDetails(job, type));

        return jobCard;
    }

    function openJobDetails(job, type) {
        
        jobDetailContent.innerHTML = `
            <div class="job-wrapper">
                <div class="job-detail-header">
                    <h2>${job.title}</h2>
                    <div class="company-detail">
                        <div class="company-name">${job.company_name || "No Company"}</div>
                        <div class="company-location">${job.city}, ${job.region}</div>
                    </div>
                    <div class="job-highlight">
                        <div class="salary">${job.salary ? `$${job.salary}` : "Not specified"}</div>
                        <div class="job-type">${job.contract_type}</div>
                        <div class="experience-level">${job.experience || "Not specified"}</div>
                        ${type === 'applied' && job.status ?
                    `<div class="application-status">
                                <span class="status-badge ${job.status}">${capitalizeFirstLetter(job.status.replace('_', ' '))}</span>
                            </div>` :
                    ''}
                    </div>
                </div>
    
                <div class="job-description-full">
                    <h3>Job Description</h3>
                    ${job.description}
                </div>
    
                <div class="job-requirements">
                    <h3>Requirements</h3>
                    <ul>
                    ${Array.isArray(job.requirements) && job.requirements.length ?
                    job.requirements.map(req => `<li>${req}</li>`).join('') :
                    '<li>Not specified</li>'}
                    </ul>
                </div>
    
                <div class="job-benefits">
                    <h3>Benefits</h3>
                    <ul>
                    ${Array.isArray(job.benefits) && job.benefits.length ?
                    job.benefits.map(benefit => `<li>${benefit}</li>`).join('') :
                    '<li>Not specified</li>'}
                    </ul>
                </div>
    
                <div class="job-skills">
                    <h3>Required Skills</h3>
                    <div class="job-tags">
                    ${Array.isArray(job.required_skills) && job.required_skills.length ?
                    job.required_skills.map(skill => `<span class="skill job-tag">${skill}</span>`).join('') :
                    'Not specified'}
                    </div>
                </div>
            </div>
        `;

        // Update buttons based on job type
        if (type === 'saved') {
            applyButton.style.display = 'block';
            removeSavedButton.style.display = 'block';
            applyButton.onclick = () => {
                window.location.href = `../pages/jobseeker-browse-jobs.html?jobId=${job.job_id}`;
            };
            removeSavedButton.onclick = () => {
                removeSavedJob(job.job_id);
                closeJobModal();
            };
        } else {
            applyButton.style.display = 'none';
            removeSavedButton.style.display = 'none';
        }

        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    // Close Job Modal
    function closeJobModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    // Remove a saved job
    async function removeSavedJob(jobId) {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.user_id) {
                window.notify.error("Please sign in to remove saved jobs.");
                return;
            }

            const ok = await window.jobCRUD.removeSavedJob(jobId);
            if (!ok) return;

            savedJobs = savedJobs.filter(job => job.id !== jobId);
            loadSavedJobs();
            window.notify.success('Job removed from saved list');
        } catch (error) {
            console.error("Error removing saved job:", error);
            window.notify.error('Failed to remove job. Please try again.');
        }
    }

    // Show toast notification
    function showToast(message, type = '') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Remove the toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Helper Functions
    function jobMatchesSearch(job, searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        return (
            job.title.toLowerCase().includes(searchTerm) ||
            job.company_name.toLowerCase().includes(searchTerm) ||
            (job.city + ' ' + job.region).toLowerCase().includes(searchTerm)
        );
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Calculate "time ago" for application date
    function calculateTimeAgo(date) {
        const now = new Date();
        const diff = Math.abs(now - date);
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "1 day ago";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getPastDate(timeframe) {
        const today = new Date();
        switch (timeframe) {
            case 'today':
                return new Date(today.setHours(0, 0, 0, 0));
            case 'week':
                return new Date(today.setDate(today.getDate() - 7));
            case 'month':
                return new Date(today.setMonth(today.getMonth() - 1));
            default:
                return new Date(0); // Beginning of time
        }
    }

    // Event Listeners
    // Search saved jobs
    savedSearchBtn.addEventListener('click', () => {
        const searchTerm = savedSearchInput.value.trim();
        if (searchTerm) {
            const filteredJobs = savedJobs.filter(job => jobMatchesSearch(job, searchTerm));
            savedJobsList.innerHTML = "";

            if (filteredJobs.length === 0) {
                savedJobsList.innerHTML = `<p>No jobs matching "${searchTerm}" found.</p>`;
            } else {
                filteredJobs.forEach(job => {
                    const jobCard = createJobCard(job, 'saved');
                    savedJobsList.appendChild(jobCard);
                });
            }
        } else {
            loadSavedJobs();
        }
    });

    savedSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            savedSearchBtn.click();
        }
    });

    // Search applied jobs
    appliedSearchBtn.addEventListener('click', () => {
        const searchTerm = appliedSearchInput.value.trim();
        const status = statusFilter.value;
        const dateFilterValue = dateFilterElement.value;

        let filteredJobs = [...appliedJobs];

        // Apply search term filter
        if (searchTerm) {
            filteredJobs = filteredJobs.filter(job => jobMatchesSearch(job, searchTerm));
        }

        // Apply status filter
        if (status) {
            filteredJobs = filteredJobs.filter(job => job.status === status);
        }

        // Apply date filter
        if (dateFilterValue) {
            const cutoffDate = getPastDate(dateFilterValue);
            filteredJobs = filteredJobs.filter(job => new Date(job.created_at) >= cutoffDate);
        }

        appliedJobsList.innerHTML = "";

        if (filteredJobs.length === 0) {
            appliedJobsList.innerHTML = "<p>No jobs match your filter criteria.</p>";
        } else {
            filteredJobs.forEach(job => {
                const jobCard = createJobCard(job, 'applied');
                appliedJobsList.appendChild(jobCard);
            });
        }
    });

    appliedSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            appliedSearchBtn.click();
        }
    });

    // Apply filters
    filterBtn.addEventListener('click', () => {
        appliedSearchBtn.click();
    });

    // Close modal when clicking on X or outside the modal
    closeModal.addEventListener('click', closeJobModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeJobModal();
        }
    });

    // Keyboard accessibility for modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeJobModal();
        }
    });
});
