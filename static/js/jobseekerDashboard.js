document.addEventListener("DOMContentLoaded", function () {
    // Load sidebar dynamically
    // loadJobseekerSidebar();

    // Initialize profile form and other components
    setupProfileForm();

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
    // Get the current path (e.g., "/ai-resume-frontend-v2/pages/jobseeker-profile.html")
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll(".nav-item");

    sidebarLinks.forEach(link => {
        link.classList.remove("active");
        // Get the href value (e.g., "/ai-resume-frontend-v2/pages/jobseeker-profile.html")
        const linkPath = link.getAttribute("href");

        // Check if the current path ends with or matches the link path
        if (currentPath === linkPath || currentPath.endsWith(linkPath.split('/').pop())) {
            link.classList.add("active");
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
        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const formData = new FormData(profileForm);
            const profileData = {};

            for (const [key, value] of formData.entries()) {
                profileData[key] = value;
            }

            if (!profileData.fullName || !profileData.email) {
                alert("Please fill in all required fields");
                return;
            }

            console.log("Profile data:", profileData);
            alert("Profile updated successfully!");
        });
    }
}

function setupSidebarToggle() {
    document.addEventListener("click", function (event) {
        const toggleSidebarBtn = document.querySelector(".toggle-sidebar");
        const sidebar = document.querySelector(".sidebar");

        if (toggleSidebarBtn && sidebar && event.target === toggleSidebarBtn) {
            sidebar.classList.toggle("active");
        }
    });
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