document.addEventListener("DOMContentLoaded", function () {
    // Load sidebar dynamically
    loadJobseekerSidebar();

    // Initialize profile form and other components
    // setupProfileForm();

    // Toggle mobile sidebar
    setupSidebarToggle();

    // Initialize current page content based on URL
    initializeCurrentPageContent();

    fetchUserDetails();

    setTimeout(highlightActiveLink, 100); // Short delay to ensure sidebar is loaded
});

function loadJobseekerSidebar() {
    // Directly insert the sidebar HTML instead of fetching it
    const sidebarHTML = `<aside class="sidebar">
    <!-- Jobseeker Profile Section -->
    <div class="jobseeker-profile">
        <div class="profile-image">
            <img src="/static/assets/lady.jpg" alt="Jobseeker Profile">
        </div>
        <div class="profile-info">
            <h3 id="dashboard-name">Loading...</h3>
            <p id="dashboard-role">Loading...</p>
        </div>
    </div>

    <!-- Navigation Links -->
    <nav class="dashboard-nav">
        <ul>
            <li>
                <a href="/jobseeker-dashboard" class="nav-item">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
                            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </span>
                    <span>Dashboard</span>
                </a>
            </li>
            <li>
                <a href="/my-jobs" class="nav-item">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </span>
                    <span>My Jobs</span>
                </a>
            </li>
            <li>
                <a href="/jobseeker-browse-jobs" class="nav-item">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </span>
                    <span>Browse Jobs</span>
                </a>
            </li>
            <li>
                <a href="/my-profile" class="nav-item">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </span>
                    <span>My Profile</span>
                </a>
            </li>
        </ul>
        <div class="sidebar-footer">
            <a href="#" id="logout-btn" class="nav-item logout-btn">
                <span class="icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
                <span>Logout</span>
            </a>
        </div>
    </nav>
</aside>`;

    const sidebarContainer = document.getElementById("sidebar");
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHTML;
        setupSidebarNavigation();
        setupLogoutButton();
        highlightActiveLink();
    }
}

async function fetchUserDetails() {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user);

    if (!user) {
        console.warn("No user object found in localStorage");
        // window.location.href = "/jobseeker-signin";
        return;
    }

    // Still update UI elements even if token is missing
    let nameElement = document.getElementById("dashboard-name");
    let roleElement = document.getElementById("dashboard-role");

    if (nameElement && roleElement) {
        user.full_name = `${user.first_name} ${user.last_name}`;
        nameElement.textContent = user.full_name || "Jane Doe";
        roleElement.textContent = user.user_role || "Jobseeker";
    }

    // Only redirect if essential user properties are missing
    if (!user.user_id) {
        console.warn("No user_id found in user object");
        window.location.href = "/jobseeker-signin";
        return;
    }

    // Log token missing but don't redirect
    if (!user.token) {
        console.warn("No token found in user object");
    }
}

function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll(".nav-item");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            // Prevent page loading logic for the logout button
            if (this.id === "logout-btn") return;

            event.preventDefault();

            const targetPage = this.getAttribute("href");
            history.pushState({}, "", targetPage);

            loadContent(targetPage);
            updateActiveLink(this, sidebarLinks);
        });
    });
}


function setupLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();

            console.log("User logged out successfully");
            // Clear user data from localStorage
            localStorage.removeItem("user");

            // Redirect to login page
            window.location.href = "/jobseeker-signin";

        });
    }
}


function loadContent(page) {
    // This fetches the HTML for the page
    fetch(page)
        .then(response => response.text())
        .then(html => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;

            // Get the new page content (main-content) from the loaded HTML
            const newContent = tempDiv.querySelector(".main-content");

            if (newContent) {
                // Update the current page content with the new content
                document.querySelector(".main-content").innerHTML = newContent.innerHTML;
                document.title = tempDiv.querySelector("title").innerText;

                // Reinitialize page-specific scripts
                initializeCurrentPageContent();

                // If the page is the Browse Jobs page, initialize job listings
                if (window.location.pathname.includes("/jobseeker-browse-jobs")) {
                    window.location.reload();
                    initializeJobBrowsing();  // Add this line to initialize job browsing
                }

                if (window.location.pathname.includes("/my-profile")) {
                    window.location.reload();
                    // initializeJobBrowsing();  // Add this line to initialize job browsing
                }

                if (window.location.pathname.includes("/jobseeker-dashboard")) {
                    window.location.reload();
                    // initializeJobBrowsing();  // Add this line to initialize job browsing
                }

                if (window.location.pathname.includes("/my-jobs")) {
                    window.location.reload();
                    // initializeJobBrowsing();  // Add this line to initialize job browsing
                }
            }
        })
        .catch(error => console.error("Error loading content:", error));
}

function initializeJobBrowsing() {
    console.log("Initializing job browsing page...");
}


function initializeCurrentPageContent() {


    // Initialize job browsing if we're on the browse jobs page
    if (window.location.pathname.includes("/jobseeker-browse-jobs")) {
        console.log("Initializing job browsing page");
        // initializeJobBrowsing();
    }

    // Initialize saved/applied jobs if we're on my jobs page
    if (window.location.pathname.includes("/jobseeker-my-jobs")) {
        console.log("Initializing my jobs page");
    }
    if (window.location.pathname.includes("/jobseeker-my-jobs")) {
        console.log("Initializing my jobs page");
    }
}
function updateActiveLink(activeLink, allLinks) {
    allLinks.forEach(link => link.classList.remove("active"));
    activeLink.classList.add("active");
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

function setupSidebarToggle() {
    document.addEventListener("click", function (event) {
        const toggleSidebarBtn = document.querySelector(".toggle-sidebar");
        const sidebar = document.querySelector(".sidebar");

        if (toggleSidebarBtn && sidebar && event.target === toggleSidebarBtn) {
            sidebar.classList.toggle("active");
        }
    });
}