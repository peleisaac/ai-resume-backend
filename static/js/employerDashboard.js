document.addEventListener("DOMContentLoaded", async function () {
    // Load sidebar dynamically
    loadSidebar();

    // Initialize job posting form
    // setupJobPostingForm();

    // Toggle mobile sidebar
    setupSidebarToggle();

    // Initialize job listings if we're on that page
    initializeCurrentPageContent();

    setTimeout(highlightActiveLink, 100); // Short delay to ensure sidebar is loaded

    fetchUserDetails();
});




function loadSidebar() {
    // Directly insert the sidebar HTML instead of fetching it
    const sidebarHTML = `<aside class="sidebar">
    <!-- Employer Profile Section -->
    <div class="employer-profile">
        <div class="profile-image">
            <img src="/static/assets/lady.jpg" alt="Employer Profile">
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
                <a href="/employer-dashboard" class="nav-item">
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
                <a href="/employer-new-job/" class="nav-item active">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </span>
                    <span>New Job</span>
                </a>
            </li>
            <li>
                <a href="/employer-job-listings/" class="nav-item">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </span>
                    <span>Job Listings</span>
                </a>
            </li>
            <li>
                <a href="/employer-profile" class="nav-item">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
                            <path d="M5 20C5.5 16 8.5 14 12 14C15.5 14 18.5 16 19 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </span>
                    <span>Profile</span>
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
        console.log("Sidebar manually inserted into #sidebar.");
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
        // window.location.href = "/employer-signin";
        return;
    }
    
    // If company_name missing, attempt to refresh user profile from API
    if (!user.company_name && user.user_id && user.token) {
        try {
            const refreshed = await refreshUserFromApi(user.user_id, user.token);
            if (refreshed) {
                // Preserve token and any client-stored fields
                const merged = { ...user, ...refreshed, token: user.token };
                localStorage.setItem("user", JSON.stringify(merged));
                Object.assign(user, merged);
            }
        } catch (e) {
            console.warn("Could not refresh user profile", e);
        }
    }

    // Still update UI elements even if token is missing
    let nameElement = document.getElementById("dashboard-name");
    let contactElement = document.getElementById("dashboard-role");

    if (nameElement && contactElement) {
        nameElement.textContent = user.company_name || "Tech Inc";
        contactElement.textContent =  user.contact_name || "Jane Doe";
    }
    
    // Only redirect if essential user properties are missing
    if (!user.user_id) {
        console.warn("No user_id found in user object");
        // window.location.href = "/employer-signin";
        return;
    }
    
    // Log token missing but don't redirect
    if (!user.token) {
        console.warn("No token found in user object");
    }
}

async function refreshUserFromApi(userId, token) {
    const resp = await fetch(`${apiEndpoints.user}/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Token ${token}`
        },
        mode: "cors"
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.user || null;
}



function setupLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();

            // Clear user data from localStorage
            localStorage.removeItem("user");

            // Redirect to login page
            window.location.href = "/employer-signin";

            console.log("User logged out successfully");
        });
    }
}

function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll(".nav-item");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();

            const targetPage = this.getAttribute("href");
            history.pushState({}, "", targetPage);

            loadContent(targetPage);
            updateActiveLink(this, sidebarLinks);
        });
    });
}

function loadContent(page) {
    fetch(page)
        .then(response => response.text())
        .then(html => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const newMain = tempDiv.querySelector(".main-content");
            if (!newMain) {
                window.location.assign(page);
                return;
            }

            const newContent = newMain.innerHTML;
            document.querySelector(".main-content").innerHTML = newContent;

            document.title = tempDiv.querySelector("title").innerText;

            // Do NOT re-run external scripts; they are already loaded globally.
            // This avoids duplicate definitions (e.g., JobDataService, JobFilters).

            // Initialize appropriate functionality based on page
            initializeCurrentPageContent();

            // If it's the new job page, update the company name
            if (page.includes("employer-new-job.html")) {
                updateCompanyNameField();
            }
        })
        .catch(error => console.error("Error loading content:", error));
}

function updateCompanyNameField() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    console.log("Updating company name field with user data:", user);

    // Get company name from user data (try multiple possible property names)
    const companyName = user.company_name || user.companyName || '';

    if (companyName && companyName.trim() !== '') {
        const companyNameField = document.getElementById("companyName");
        if (companyNameField) {
            companyNameField.value = companyName;
            companyNameField.setAttribute("readonly", "true");
        } else {
            console.error("Company name field not found in DOM");
        }
    } else {
        console.warn("No company name found in user data");
        const companyNameField = document.getElementById("companyName");
        if (companyNameField) {
            companyNameField.removeAttribute("readonly");
            companyNameField.placeholder = "Enter company name";
        }
    }
}

// Add this function to employer-dashboard.js
function fetchDashboardMetrics() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
        console.error("User not logged in or token missing");
        return;
    }

    fetch(`${apiEndpoints.employerDashboardMetrics}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Token ${user.token}`
        },
        body: JSON.stringify({ "employer_id": user.user_id }),
        mode: "cors"
    })
        .then(response => response.json())
        .then(data => {
            console.log("Fetched metrics:", data);

            const appliedJobsElement = document.querySelector(".metric-value.applied-jobs");
            const activeJobsElement = document.querySelector(".metric-value.active-jobs");
            const candidateElement = document.querySelector(".metric-value.candidate");

            if (appliedJobsElement) appliedJobsElement.textContent = data.data.all_applications_count || 0;
            if (activeJobsElement) activeJobsElement.textContent = data.data.active_jobs || 0;
            if (candidateElement) candidateElement.textContent = data.data.qualified_candidates || 0; // Adjust this based on your API response
        })
        .catch(error => console.error("Error fetching metrics:", error));
}

function initializeCurrentPageContent() {
    if (window.location.pathname.includes("/employer-new-job")) {
        console.log("Initializing new job page");
        updateCompanyNameField();
        loadJobFormScripts().then(() => {
            initializeNewJobForm();
        }).catch((e) => console.error("Failed to load job form scripts", e));
    }

    // Initialize job listings if we're on the job listings page
    if (window.location.pathname.includes("/employer-job-listings")) {
        console.log("Initializing job listings page");
        ensureCreateNewJobNavigation();
        initializeJobListings();
    }
    if (window.location.pathname.includes("/employer-dashboard")) {
        console.log("Welcome to Dashboard. reloading");
        fetchDashboardMetrics();
    }
}

function loadJobFormScripts() {
    return new Promise((resolve, reject) => {
        // If already available, resolve immediately
        if (window.jobCRUD && window.JobDataService) {
            resolve();
            return;
        }

        // Prevent double-loading
        if (window.__jobFormScriptsLoading) {
            const wait = setInterval(() => {
                if (window.jobCRUD && window.JobDataService) {
                    clearInterval(wait);
                    resolve();
                }
            }, 50);
            return;
        }

        window.__jobFormScriptsLoading = true;

        const loadScript = (src) => new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = res;
            s.onerror = rej;
            document.head.appendChild(s);
        });

        // Load jobData then jobCRUD
        loadScript('/static/js/jobData.js')
            .then(() => loadScript('/static/js/jobCRUD.js'))
            .then(() => {
                window.__jobFormScriptsLoading = false;
                resolve();
            })
            .catch(err => {
                window.__jobFormScriptsLoading = false;
                reject(err);
            });
    });
}

function ensureCreateNewJobNavigation() {
    const createBtn = document.getElementById("createNewJob");
    if (createBtn && !createBtn.__navigateBound) {
        createBtn.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.assign("/employer-new-job/");
        });
        createBtn.__navigateBound = true;
    }
}

function initializeJobListings() {
    // Check if the necessary job-related scripts are loaded
    if (typeof window.loadJobListings === 'function') {
        // If the function already exists, call it
        window.loadJobListings();
    } else {
        // If not, dynamically load the necessary scripts
        loadJobScripts().then(() => {
            // After scripts are loaded, call the function
            if (typeof window.loadJobListings === 'function') {
                window.loadJobListings();
            } else {
                console.error("loadJobListings function not found even after loading scripts");
            }
        });
    }
}

function initializeNewJobForm() {
    const jobForm = document.getElementById("jobPostingForm");
    if (!jobForm || jobForm.dataset.bound === 'true') {
        return;
    }

    jobForm.dataset.bound = 'true';

    const normalizeEducation = (val = '') => {
        const key = val.toString().toLowerCase().replace(/[^a-z]/g, '');
        const map = {
            highschool: 'highSchool',
            highschools: 'highSchool',
            hs: 'highSchool',
            secondary: 'highSchool',
            associatesdegree: 'associate',
            associate: 'associate',
            associates: 'associate',
            assoc: 'associate',
            bachelorsdegree: 'bachelor',
            bachelor: 'bachelor',
            bachelors: 'bachelor',
            undergraduate: 'bachelor',
            college: 'bachelor',
            mastersdegree: 'master',
            master: 'master',
            masters: 'master',
            graduate: 'master',
            grad: 'master',
            mba: 'master',
            doctordegree: 'doctorate',
            doctorate: 'doctorate',
            doctor: 'doctorate',
            phd: 'doctorate',
            phdph: 'doctorate'
        };
        return map[key] || '';
    };

    const setSelectValue = (selectEl, desiredValue, fallbackRaw = '') => {
        if (!selectEl) return;
        const normalizedDesired = (desiredValue || '').toString();
        const options = Array.from(selectEl.options || []);

        // try exact value match first
        const exact = options.find(opt => opt.value === normalizedDesired);
        if (exact) {
            selectEl.value = exact.value;
            return;
        }

        // try case-insensitive match on value
        const lower = normalizedDesired.toLowerCase();
        const byLowerValue = options.find(opt => opt.value.toLowerCase() === lower);
        if (byLowerValue) {
            selectEl.value = byLowerValue.value;
            return;
        }

        // try text match on the visible label
        const byText = options.find(opt => opt.text.toLowerCase().replace(/[^a-z]/g, '') === fallbackRaw.toLowerCase().replace(/[^a-z]/g, ''));
        if (byText) {
            selectEl.value = byText.value;
        }
    };

    const normalizeContractType = (val = '') => {
        const key = val.toString().toLowerCase().replace(/[^a-z]/g, '');
        const map = {
            fulltime: 'fullTime',
            parttime: 'partTime',
            contract: 'contract',
            internship: 'internship',
            temporary: 'temporary'
        };
        return map[key] || '';
    };

    const requirementInput = document.getElementById("requirementInput");
    const addRequirementBtn = document.getElementById("addRequirementBtn");
    const requirementsList = document.getElementById("requirementsList");
    const requirementsData = document.getElementById("requirementsData");

    const benefitInput = document.getElementById("benefitInput");
    const addBenefitBtn = document.getElementById("addBenefitBtn");
    const benefitsList = document.getElementById("benefitsList");
    const benefitsData = document.getElementById("benefitsData");

    const skillInput = document.getElementById("skillInput");
    const addSkillBtn = document.getElementById("addSkillBtn");
    const skillsList = document.getElementById("skillsList");
    const skillsData = document.getElementById("skillsData");

    let requirements = JSON.parse(requirementsData?.value || '[]');
    let benefits = JSON.parse(benefitsData?.value || '[]');
    let skills = JSON.parse(skillsData?.value || '[]');
    let editingJobId = null;
    const submitBtn = document.querySelector('.submit-btn');
    const headerTitle = document.querySelector('.content-card .card-header h2');

    // If we navigated here from "Edit" capture stored job and prefill
    const storedJob = sessionStorage.getItem('editingJob');
    if (storedJob) {
        try {
            const job = JSON.parse(storedJob);
            editingJobId = job.id;
            if (submitBtn) submitBtn.textContent = 'Update Job';
            if (headerTitle) headerTitle.textContent = 'Update Job Listing';
            // Prefill fields
            document.getElementById('jobTitle') && (document.getElementById('jobTitle').value = job.jobTitle || '');
            document.getElementById('jobDescription') && (document.getElementById('jobDescription').value = job.description || '');
            document.getElementById('category') && (document.getElementById('category').value = (job.category || '').toLowerCase());
            document.getElementById('contractType') && (document.getElementById('contractType').value = normalizeContractType(job.contract_type || ''));
            document.getElementById('experience') && (document.getElementById('experience').value = job.experience || '');
            const educationSelect = document.getElementById('education');
            const normalizedEdu = normalizeEducation(job.education_level || job.education || '');
            setSelectValue(educationSelect, normalizedEdu, job.education_level || job.education || '');
            document.getElementById('region') && (document.getElementById('region').value = job.region || '');
            document.getElementById('city') && (document.getElementById('city').value = job.city || '');
            document.getElementById('vacancies') && (document.getElementById('vacancies').value = job.no_of_vacancies || '');
            document.getElementById('salary') && (document.getElementById('salary').value = job.salary || '');

            // Prefill lists
            requirements = Array.isArray(job.requirements) ? [...job.requirements] : [];
            benefits = Array.isArray(job.benefits) ? [...job.benefits] : [];
            skills = Array.isArray(job.required_skills) ? [...job.required_skills] : [];

            requirementsData && (requirementsData.value = JSON.stringify(requirements));
            benefitsData && (benefitsData.value = JSON.stringify(benefits));
            skillsData && (skillsData.value = JSON.stringify(skills));

            // Render chips for prefilled items
            const renderChips = (items, listElement) => {
                listElement.innerHTML = '';
                items.forEach(value => {
                    const itemChip = document.createElement('div');
                    itemChip.classList.add('item-chip');
                    itemChip.innerHTML = `${value}<span class="remove-item" data-value="${value}">×</span>`;
                    listElement?.appendChild(itemChip);
                    itemChip.querySelector('.remove-item')?.addEventListener('click', function () {
                        const val = this.getAttribute('data-value');
                        const idx = items.indexOf(val);
                        if (idx !== -1) items.splice(idx, 1);
                        listElement.removeChild(itemChip);
                        if (listElement === requirementsList && requirementsData) requirementsData.value = JSON.stringify(items);
                        if (listElement === benefitsList && benefitsData) benefitsData.value = JSON.stringify(items);
                        if (listElement === skillsList && skillsData) skillsData.value = JSON.stringify(items);
                    });
                });
            };

            renderChips(requirements, requirementsList);
            renderChips(benefits, benefitsList);
            renderChips(skills, skillsList);
        } catch (e) {
            console.warn('Could not prefill editing job', e);
        }
    } else {
        if (submitBtn) submitBtn.textContent = 'Post a Job';
        if (headerTitle) headerTitle.textContent = 'Create a Job Listing';
    }

    const addItemToList = (inputElement, listElement, itemsArray, hiddenInput) => {
        const value = (inputElement?.value || '').trim();
        if (!value) return;

        itemsArray.push(value);
        if (hiddenInput) hiddenInput.value = JSON.stringify(itemsArray);

        const itemChip = document.createElement('div');
        itemChip.classList.add('item-chip');
        itemChip.innerHTML = `${value}<span class="remove-item" data-value="${value}">×</span>`;
        listElement?.appendChild(itemChip);

        itemChip.querySelector('.remove-item')?.addEventListener('click', function () {
            const valueToRemove = this.getAttribute('data-value');
            const idx = itemsArray.indexOf(valueToRemove);
            if (idx !== -1) {
                itemsArray.splice(idx, 1);
                if (hiddenInput) hiddenInput.value = JSON.stringify(itemsArray);
                itemChip.remove();
            }
        });

        if (inputElement) {
            inputElement.value = '';
            inputElement.focus();
        }
    };

    if (addRequirementBtn) {
        addRequirementBtn.addEventListener('click', () => addItemToList(requirementInput, requirementsList, requirements, requirementsData));
    }
    if (requirementInput) {
        requirementInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addItemToList(requirementInput, requirementsList, requirements, requirementsData);
            }
        });
    }

    if (addBenefitBtn) {
        addBenefitBtn.addEventListener('click', () => addItemToList(benefitInput, benefitsList, benefits, benefitsData));
    }
    if (benefitInput) {
        benefitInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addItemToList(benefitInput, benefitsList, benefits, benefitsData);
            }
        });
    }

    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', () => addItemToList(skillInput, skillsList, skills, skillsData));
    }
    if (skillInput) {
        skillInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addItemToList(skillInput, skillsList, skills, skillsData);
            }
        });
    }

    // Submit handler for job form when loaded via sidebar
    jobForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const user = JSON.parse(localStorage.getItem('user')) || {};
        const employer_id = user.user_id;
        const companyInput = document.getElementById('companyName');
        const companyNameValue = (companyInput?.value || '').trim();

        if (!companyNameValue) {
            window.notify?.error('Please enter a company name before posting.');
            companyInput?.focus();
            return;
        }

        const jobData = {
            title: document.getElementById('jobTitle')?.value,
            description: document.getElementById('jobDescription')?.value,
            requirements: requirements,
            benefits: benefits,
            required_skills: skills,
            category: document.getElementById('category')?.value,
            contract_type: document.getElementById('contractType')?.value,
            experience: document.getElementById('experience')?.value,
            education_level: document.getElementById('education')?.value,
            region: document.getElementById('region')?.value,
            city: document.getElementById('city')?.value,
            no_of_vacancies: parseInt(document.getElementById('vacancies')?.value || '0', 10),
            salary: document.getElementById('salary')?.value,
            is_active: '1',
            company_name: companyNameValue,
            employer_id: employer_id,
        };

        try {
            const result = editingJobId
                ? await window.jobCRUD.updateJob(editingJobId, jobData)
                : await window.jobCRUD.addJob(jobData);

            if (result) {
                window.notify.success(editingJobId ? 'Job updated successfully!' : 'Job posted successfully!');
                sessionStorage.removeItem('editingJob');
                jobForm.reset();
                requirements = [];
                benefits = [];
                skills = [];
                requirementsList.innerHTML = '';
                benefitsList.innerHTML = '';
                skillsList.innerHTML = '';
                requirementsData.value = '';
                benefitsData.value = '';
                skillsData.value = '';
                window.location.href = '/employer-job-listings/';
            }
        } catch (error) {
            console.error('Error posting job:', error);
            window.notify.error('Failed to post job. Please try again.');
        }
    });
}

function loadJobScripts() {
    return new Promise((resolve, reject) => {
        // If scripts are already present, skip dynamic loading
        if (window.JobDataService && window.JobFilters && window.JobListings) {
            resolve();
            return;
        }

        // Prevent duplicate injection if already in progress
        if (window.__jobScriptsLoading) {
            const waitForExisting = setInterval(() => {
                if (window.JobDataService && window.JobFilters && window.JobListings) {
                    clearInterval(waitForExisting);
                    resolve();
                }
            }, 50);
            return;
        }

        window.__jobScriptsLoading = true;

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
                        window.__jobScriptsLoading = false;
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

function highlightActiveLink() {
    const normalize = (p = "") => {
        if (!p) return "";
        try {
            const url = new URL(p, window.location.origin);
            let clean = url.pathname;
            if (clean !== "/" && clean.endsWith("/")) clean = clean.slice(0, -1);
            return clean.toLowerCase();
        } catch (e) {
            let clean = p;
            if (clean !== "/" && clean.endsWith("/")) clean = clean.slice(0, -1);
            return clean.toLowerCase();
        }
    };

    const currentPath = normalize(window.location.pathname);
    const sidebarLinks = document.querySelectorAll(".nav-item");

    sidebarLinks.forEach(link => {
        link.classList.remove("active");
        const linkPath = normalize(link.getAttribute("href"));
        if (!linkPath) return;

        // exact match
        if (currentPath === linkPath) {
            link.classList.add("active");
            return;
        }

        // match last segment (e.g., /employer-new-job matches /employer-new-job/)
        const currentLast = currentPath.split('/').filter(Boolean).pop();
        const linkLast = linkPath.split('/').filter(Boolean).pop();
        if (currentLast && linkLast && currentLast === linkLast) {
            link.classList.add("active");
        }
    });
}

function updateActiveLink(activeLink, sidebarLinks) {
    sidebarLinks.forEach(link => link.classList.remove("active"));
    activeLink.classList.add("active");
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

window.addEventListener('popstate', function () {
    // Get the current URL path to determine which page to load
    const currentPath = window.location.pathname;

    // Only fetch if it's one of your application pages
    if (currentPath.includes('/employer-dashboard') ||
        currentPath.includes('/employer-new-job') ||
        currentPath.includes('/employer-job-listings')) {

        // Load the content for the current URL
        loadContent(currentPath);

        // Update the active link in the sidebar
        highlightActiveLink();
    }
});

