document.addEventListener("DOMContentLoaded", function () {
    // Load sidebar dynamically
    // loadJobseekerSidebar();

    // Initialize profile form and other components
    setupProfileForm();

    // Load personalized recommendations
    loadRecommendedJobs();

    // Toggle mobile sidebar
    setupSidebarToggle();

    // Initialize current page content based on URL
    // initializeCurrentPageContent();

    setTimeout(highlightActiveLink, 100); // Short delay to ensure sidebar is loaded
});



function initializeMyJobs() {
    // Check if we need to load saved/applied jobs scripts
    loadSavedJobsScripts().then(() => {
        if (typeof window.loadSavedJobs === 'function') {
            window.loadSavedJobs();
        } else {
            console.error("loadSavedJobs function not found even after loading scripts");
        }
    });
}

function loadJobScripts() {
    return new Promise((resolve, reject) => {
        // Load job-data.js first
        const jobDataScript = document.createElement('script');
        jobDataScript.src = '/static/js/jobData.js';
        jobDataScript.onload = function () {
            // Then load job-listings.js
            const jobListingsScript = document.createElement('script');
            jobListingsScript.src = '/static/js/jobListings.js';
            jobListingsScript.onload = function () {
                // Finally load job-filters.js
                const jobFiltersScript = document.createElement('script');
                jobFiltersScript.src = '/static/js/jobFilters.js';
                jobFiltersScript.onload = function () {
                    // Add a small delay to ensure scripts are parsed and executed
                    setTimeout(() => {
                        resolve();
                    }, 100);
                };
                jobFiltersScript.onerror = reject;
                document.head.appendChild(jobFiltersScript);
            };
            jobListingsScript.onerror = reject;
            document.head.appendChild(jobListingsScript);
        };
        jobDataScript.onerror = reject;
        document.head.appendChild(jobDataScript);
    });
}

function loadSavedJobsScripts() {
    return new Promise((resolve, reject) => {
        // Load saved-jobs.js
        const savedJobsScript = document.createElement('script');
        savedJobsScript.src = '../js/saved-jobs.js';
        savedJobsScript.onload = function () {
            // Add a small delay to ensure scripts are parsed and executed
            setTimeout(() => {
                resolve();
            }, 100);
        };
        savedJobsScript.onerror = reject;
        document.head.appendChild(savedJobsScript);
    });
}

function highlightActiveLink() {
    const normalize = (p) => {
        if (!p) return "";
        // Build URL to safely parse, then strip query/hash and trailing slash
        const u = new URL(p, window.location.origin);
        return u.pathname.replace(/\/+$/, "");
    };

    const currentPath = normalize(window.location.pathname);
    const sidebarLinks = document.querySelectorAll("a.nav-item");

    sidebarLinks.forEach(link => {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
        const linkPath = normalize(link.getAttribute("href"));

        if (currentPath === linkPath) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function updateActiveLink(activeLink, allLinks) {
    allLinks.forEach(link => link.classList.remove("active"));
    activeLink.classList.add("active");
}


function setupProfileForm() {
    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
        profileForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const formData = new FormData(profileForm);
            const profileData = {};

            for (const [key, value] of formData.entries()) {
                profileData[key] = value;
            }

            if (!profileData.first_name || !profileData.email) {
                window.notify.error("Please fill in all required fields");
                return;
            }

            // Get user ID from localStorage
            const user = JSON.parse(
                localStorage.getItem('user') || '{}'
            );
            
            if (!user.user_id) {
                window.notify.error("User not logged in");
                return;
            }

            // Update profile using CRUD operations
            const result = await window.profileCRUD.updateProfile(
                user.user_id,
                profileData
            );

            if (result) {
                // Profile updated successfully (notification shown by CRUD)
                console.log("Profile updated:", result);
            }
        });
    }
}

function setupSidebarToggle() {
    // Prevent double-binding if initialized elsewhere
    if (window.__sidebarToggleInitialized) {
        return;
    }

    const sidebarContainer = document.getElementById("sidebar");
    const mobileToggle = document.getElementById("mobileMenuToggle");
    const toggleSidebarBtn = document.querySelector(".toggle-sidebar");

    // Ensure overlay exists once
    let overlay = document.getElementById("sidebarOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "sidebarOverlay";
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
    }

    const openSidebar = () => {
        if (!sidebarContainer) return;
        sidebarContainer.classList.add("active");
        overlay.classList.add("active");
        document.body.classList.add("sidebar-open");
    };

    const closeSidebar = () => {
        if (!sidebarContainer) return;
        sidebarContainer.classList.remove("active");
        overlay.classList.remove("active");
        document.body.classList.remove("sidebar-open");
    };

    const toggleSidebar = () => {
        if (!sidebarContainer) return;
        if (sidebarContainer.classList.contains("active")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    };

    // Bind the explicit mobile toggle button
    if (mobileToggle && sidebarContainer) {
        mobileToggle.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            toggleSidebar();
        });
    }

    // Fallback: support any element with .toggle-sidebar
    document.addEventListener("click", function (event) {
        if (toggleSidebarBtn && sidebarContainer && (event.target === toggleSidebarBtn || toggleSidebarBtn.contains(event.target))) {
            toggleSidebar();
        }
    });

    // Clicking overlay closes the sidebar
    overlay.addEventListener("click", function () {
        closeSidebar();
    });

    // Mark as initialized to avoid duplicate listeners from other scripts
    window.__sidebarToggleInitialized = true;
}

async function loadRecommendedJobs(limit = 3) {
    const container = document.getElementById("recommended-jobs");
    if (!container) return;

    try {
        const response = await fetch(`${apiEndpoints.jobs}`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch jobs");
        }

        const payload = await response.json();
        const jobs = Array.isArray(payload.jobs) ? [...payload.jobs] : [];

        jobs.sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0));

        const recommended = jobs.slice(0, limit);
        if (!recommended.length) {
            container.innerHTML = `<p class="empty-state">No recommendations yet. Try browsing jobs to get started.</p>`;
            return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userSkills = normalizeSkills(user.skills || user.skills_list || user.required_skills || []);

        container.innerHTML = recommended.map(job => renderRecommendedCard(job, userSkills)).join("");

        container.querySelectorAll(".apply-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const jobId = btn.getAttribute("data-job-id");
                window.location.href = `/jobseeker-browse-jobs?jobId=${jobId}`;
            });
        });
    } catch (error) {
        console.error("Error loading recommended jobs:", error);
        container.innerHTML = `<p class="error-message">Unable to load recommendations right now.</p>`;
    }
}

function renderRecommendedCard(job, userSkills) {
    const jobId = job.job_id || job.id || "";
    const contract = job.contract_type || job.contractType || "Not specified";
    const location = [job.city, job.region].filter(Boolean).join(", ") || "Location not set";
    const salary = job.salary ? `$${job.salary}` : "Not specified";
    const jobSkills = normalizeSkills(job.required_skills || job.skills || []);
    const match = calculateMatchScore(userSkills, jobSkills);
    const matchLabel = match === null ? "" : `<div class="match-score"><span>${match}% Match</span></div>`;

    return `
        <div class="job-card">
            <div class="job-card-header">
                <div class="company-logo">
                    <img src="/static/assets/landing-page-image.png" alt="Company Logo">
                </div>
                <div class="job-info">
                    <h4 class="job-title">${job.title || "Untitled role"}</h4>
                    <p class="company-name">${job.company_name || "Company TBD"}</p>
                </div>
            </div>
            <div class="job-details">
                <div class="job-detail">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="2" />
                        <path d="M12 7V12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                    <span>${contract}</span>
                </div>
                <div class="job-detail">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12.5C13.6569 12.5 15 11.1569 15 9.5C15 7.84315 13.6569 6.5 12 6.5C10.3431 6.5 9 7.84315 9 9.5C9 11.1569 10.3431 12.5 12 12.5Z" stroke="currentColor" stroke-width="2" />
                        <path d="M19 19.5C19 16.4624 15.866 14 12 14C8.13401 14 5 16.4624 5 19.5" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <span>${location}</span>
                </div>
                <div class="job-detail">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9V18.8C6 19.9201 6 20.4802 6.21799 20.908C6.40973 21.2843 6.71569 21.5903 7.09202 21.782C7.51984 22 8.07989 22 9.2 22H14.8C15.9201 22 16.4802 22 16.908 21.782C17.2843 21.5903 17.5903 21.2843 17.782 20.908C18 20.4802 18 19.9201 18 18.8V9M6 9H18M6 9C6 7.93913 6.42143 6.92172 7.17157 6.17157C7.92172 5.42143 8.93913 5 10 5H14C15.0609 5 16.0783 5.42143 16.8284 6.17157C17.5786 6.92172 18 7.93913 18 9" stroke="currentColor" stroke-width="2" />
                        <path d="M14 5V4.2C14 3.0799 14 2.51984 13.782 2.09202C13.5903 1.71569 13.2843 1.40973 12.908 1.21799C12.4802 1 11.9201 1 10.8 1H10.2C9.07989 1 8.51984 1 8.09202 1.21799C7.71569 1.40973 7.40973 1.71569 7.21799 2.09202C7 2.51984 7 3.0799 7 4.2V5" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <span>${salary}</span>
                </div>
            </div>
            <div class="job-card-footer">
                ${matchLabel}
                <button class="apply-btn" data-job-id="${jobId}">View Details</button>
            </div>
        </div>
    `;
}

function normalizeSkills(skills) {
    if (!Array.isArray(skills)) return [];
    return skills
        .map(s => (s || "").toString().toLowerCase().trim())
        .filter(Boolean);
}

function calculateMatchScore(userSkills, jobSkills) {
    if (!userSkills.length || !jobSkills.length) return null;
    const jobSet = new Set(jobSkills);
    const overlap = userSkills.filter(s => jobSet.has(s)).length;
    const denom = Math.max(jobSkills.length, 1);
    return Math.min(100, Math.round((overlap / denom) * 100));
}

// Add popstate event handler at the root level (same as in employer dashboard)
window.addEventListener('popstate', function () {
    // Get the current URL path to determine which page to load
    const currentPath = window.location.pathname;

    // Load the content for the current URL
    loadContent(currentPath);

    // Update the active link in the sidebar
    highlightActiveLink();
});
