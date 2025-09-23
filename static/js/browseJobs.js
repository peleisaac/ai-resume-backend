
// State variables
let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
const jobsPerPage = 10;
let currentFilters = {
    search: '',
    location: '',
    jobType: '',
    experience: ''
};

// DOM elements
const jobsListElement = document.getElementById('jobs-list');
const jobCountElement = document.getElementById('job-count-number');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageNumbersElement = document.getElementById('page-numbers');
const searchInput = document.getElementById('job-search');
const searchButton = document.getElementById('search-btn');
const locationFilter = document.getElementById('location');
const jobTypeFilter = document.getElementById('job-type');
const experienceFilter = document.getElementById('experience');
const filterButton = document.getElementById('filter-btn');
const jobModal = document.getElementById('job-modal');
const applyButton = document.getElementById('apply-button');
const saveJobButton = document.getElementById('save-job-button');
const closeModalButton = document.querySelector('.close');
const jobDetailContent = document.getElementById('job-detail-content');



// Fetch jobs from backend
async function fetchJobs() {
    try {
        console.log("Fetching jobs from backend...");

        allJobs = []; // 🔄 Clear old job data
        filteredJobs = [];

        const response = await fetch(`${apiEndpoints.jobs}`);
        if (!response.ok) throw new Error('Failed to fetch jobs');

        const data = await response.json();
        console.log("Fetched jobs from backend:", data.jobs); // 🛠 Debugging

        allJobs = data.jobs.map(job => ({
            ...job,
            shortDescription: job.description ? job.description.split('.')[0] + '.' : "No description available"
        }));

        filteredJobs = [...allJobs];

        updateJobCount();
        renderJobs();
        renderPagination();
    } catch (error) {
        console.error('Error fetching jobs:', error);
        jobsListElement.innerHTML = `<div class="error-message"><p>Failed to load jobs. Please try again later.</p></div>`;
    }
}


// Render jobs list dynamically
function renderJobs() {
    if (filteredJobs.length === 0) {
        jobsListElement.innerHTML = `<p>No jobs found.</p>`;
        return;
    }

    const startIndex = (currentPage - 1) * jobsPerPage;
    const jobsToDisplay = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

    jobsListElement.innerHTML = jobsToDisplay.map(job => {
        if (!job.job_id) {
            console.error("Missing job_id for job:", job);
        }
        const postedDate = new Date(job.created_at);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - postedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeAgo;
        if (diffDays === 0) {
            timeAgo = 'Today';
        } else if (diffDays === 1) {
            timeAgo = '1 day ago';
        } else if (diffDays < 7) {
            timeAgo = `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            timeAgo = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else {
            const months = Math.floor(diffDays / 30);
            timeAgo = `${months} ${months === 1 ? 'month' : 'months'} ago`;
        }

        return `
        <div class="job-card" data-job-id="${job.job_id || 'unknown'}" onclick="openJobDetails('${job.job_id}')">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title || "No Title"}</h3>
                    <div class="company-name">${job.company_name || "No Company"}</div>
                </div>

                <div class="salary">${job.salary ? `$${job.salary}` : "Not specified"}</div>
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
                    ${job.experience}
                </div>
            </div>
            <div class="job-description">
                ${job.shortDescription}
            </div>
            <div class="job-tags">
                ${job.required_skills.map(skill => `<span class="skill job-tag">${skill}</span>`).join('')}
            </div>
            <div class="posted-date">Posted ${timeAgo}</div>
        </div>
    `;
    }).join('');
}

// Open job details modal
function openJobDetails(jobId) {
    console.log("Opening job details for jobId:", jobId); // Debugging

    const job = allJobs.find(job => job.job_id === jobId);
    if (!job) {
        console.error("Job not found for jobId:", jobId);
        return;
    }

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
                    <div class="experience-level">${job.experience}</div>
                </div>
            </div>
    
            <div class="job-description-full">
                <h3>Job Description</h3>
                ${job.description}
            </div>
    
            <div class="job-requirements">
                <h3>Requirements</h3>
                <ul>
                ${job.requirements.length ? job.requirements.map(req => `<li>${req}</li>`).join('') : '<li>Not specified</li>'}
                </ul>
            </div>
    
            <div class="job-benefits">
                <h3>Benefits</h3>
                <ul>
                ${job.benefits.length ? job.benefits.map(benefit => `<li>${benefit}</li>`).join('') : '<li>Not specified</li>'}
                </ul>
            </div>
    
            <div class="job-skills">
                <h3>Required Skills</h3>
                <div class="job-tags">
                ${job.required_skills.length ? job.required_skills.map(skill => `<span class="job-tag skill">${skill}</span>`).join('') : 'Not specified'}
                </div>
            </div>
        </div>
    `;

    jobModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Update apply button
    applyButton.setAttribute('data-job-id', job.job_id);
    saveJobButton.setAttribute('data-job-id', job.job_id);
}

function closeJobDetails() {
    jobModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

//  Update job count display
function updateJobCount() {
    jobCountElement.textContent = filteredJobs.length;
}

// // Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    prevPageButton.classList.toggle('disabled', currentPage === 1);
    nextPageButton.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);

    pageNumbersElement.innerHTML = Array.from({ length: totalPages }, (_, i) =>
        `<span class="${i + 1 === currentPage ? 'current' : ''}" onclick="changePage(${i + 1})">${i + 1}</span>`
    ).join('');
}

// Apply filters
function applyFilters() {
    currentFilters = {
        search: searchInput.value.toLowerCase(),
        location: locationFilter.value,
        jobType: jobTypeFilter.value,
        experience: experienceFilter.value
    };

    filteredJobs = allJobs.filter(job => {
        // Search filter (title, company, description)
        const searchMatch = !currentFilters.search ||
            job.title.toLowerCase().includes(currentFilters.search) ||
            job.company.toLowerCase().includes(currentFilters.search) ||
            job.shortDescription.toLowerCase().includes(currentFilters.search) ||
            job.required_skills.some(skill => skill.toLowerCase().includes(currentFilters.search));

        // Location filter
        const locationMatch = !currentFilters.location ||
            job.city.toLowerCase().includes(currentFilters.location) ||
            job.region.toLowerCase().includes(currentFilters.location);

        // Job type filter
        const jobTypeMatch = !currentFilters.jobType ||
            job.contract_type.toLowerCase() === currentFilters.jobType;

        // Experience filter
        const experienceMatch = !currentFilters.experience ||
            job.experience.toLowerCase().includes(currentFilters.experience);

        return searchMatch && locationMatch && jobTypeMatch && experienceMatch;
    });

    // Reset to first page
    currentPage = 1;

    // Update UI
    updateJobCount();
    renderJobs();
    renderPagination();
}


// Save job
function saveJob(jobId) {
    alert('Job saved to your profile!');
}




// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Fetch jobs
    setTimeout(fetchJobs, 100);
    // fetchJobs();

    // Page navigation
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderJobs();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderJobs();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Search and filters
    searchButton.addEventListener('click', applyFilters);
    filterButton.addEventListener('click', applyFilters);

    // Enter key for search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    // Modal functionality
    closeModalButton.addEventListener('click', closeJobDetails);
    window.addEventListener('click', (e) => {
        if (e.target === jobModal) {
            closeJobDetails();
        }
    });







    // Apply for job
    const applyButton = document.getElementById("apply-button");
    applyButton.addEventListener("click", async function () {
        const jobId = applyButton.getAttribute("data-job-id");


        if (!jobId || jobId === "undefined") {
            showToast("Error: No job ID found.", "error");
            return;
        }

        // Get the job details from allJobs using the jobId
        const job = allJobs.find(job => job.job_id === jobId);
        console.log("job details: ", job);
        if (!job) {
            showToast("Error: Job details not found.", "error");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.user_id) {
            showToast("Please sign in to apply for jobs.", "error");
            window.location.href = "/jobseeker-signin";
            return;
        }

        applyButton.disabled = true; // Prevent multiple clicks


        const applicationData = {
            job_id: jobId,
            user_id: user.user_id,
            application_status: "new",
            employer_id: job.employer_id,
        };

        try {
            const response = await fetch(`${apiEndpoints.addApplication}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                },
                body: JSON.stringify(applicationData),
                mode: "cors"
            });
            
            const data = await response.json();

           
           if (data.status_code === "AR00") {
            showToast("Job application sent successfully!", "success");
           } else {
            showToast(data.message)
           }
           
        } catch (error) {
            showToast("Network error. Please try again later.", "error");
            console.error("Error:", error);
        } finally {
            applyButton.disabled = false;
        }
    });







    // Function to show toast messages
    function showToast(message, type) {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }


    const saveJobButton = document.getElementById("save-job-button");
    saveJobButton.addEventListener("click", async function () {
        const jobId = saveJobButton.getAttribute("data-job-id");

        console.log("Saving the Job with Job ID:", jobId); // ✅ Debugging

        if (!jobId || jobId === "undefined") {
            console.error("No valid job ID found for application.");
            showToast("Error: No job ID found.", "error");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.user_id) {
            showToast("Please sign in to save these jobs.", "error");
            window.location.href = "/jobseeker-signin";
            return;
        }

        saveJobButton.disabled = true; // Prevent multiple clicks

        const saveData = {
            job_id: jobId,
            user_id: user.user_id,
            // application_status: "new",
        };

        try {
            const response = await fetch(`${apiEndpoints.saveJob}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                },
                body: JSON.stringify(saveData),
            });

            const data = await response.json();
            console.log("Server Response:", data); // ✅ Debug response

            if (data.status_code === "AR00") {
                showToast("Job application saved successfully!", "success");
                fetchJobs(); // 🔄 Refresh job list after applying
            } else if (data.status_code === "AR05") {
                showToast("You have already saved this job.", "warning");
            } else {
                showToast(data.message || "Failed to save the job.", "error");
            }
        } catch (error) {
            showToast("Network error. Please try again later.", "error");
            console.error("Error:", error);
        } finally {
            saveJobButton.disabled = false;
        }
    });
});