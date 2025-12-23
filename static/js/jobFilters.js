
// Job filters functionality
const JobFilters = {
    async filterJobs() {

        try {
            // Get all jobs from the cache (reload only if missing)
            const allJobs = await JobDataService.loadJobs();
            if (!Array.isArray(allJobs)) return;

            // Get filter values (defensive checks for missing DOM nodes)
            const searchInput = document.getElementById("searchJobs");
            const categorySelect = document.getElementById("categoryFilter");
            const statusSelect = document.getElementById("statusFilter");
            const dateSelect = document.getElementById("dateFilter");

            const searchTerm = (searchInput?.value || '').toLowerCase();
            const categoryFilter = categorySelect?.value || 'all';
            const statusFilter = statusSelect?.value || 'all';
            const dateFilter = dateSelect?.value || 'all';

            // Apply filters
            const filteredJobs = allJobs.filter(job => {
                // Search term filter
                const matchesSearch =
                    (job.jobTitle && job.jobTitle.toLowerCase().includes(searchTerm)) ||
                    (job.category && job.category.toLowerCase().includes(searchTerm)) ||
                    (job.city && job.city.toLowerCase().includes(searchTerm));

                // Category filter
                const matchesCategory = categoryFilter === 'all' ||
                    (job.category && job.category.toLowerCase() === categoryFilter.toLowerCase());

                // Status filter
                const matchesStatus = statusFilter === 'all' ||
                    (job.status && job.status.toLowerCase() === statusFilter.toLowerCase());

                // Date filter
                let matchesDate = true;
                if (dateFilter !== 'all' && job.datePosted) {
                    const jobDate = new Date(job.datePosted);
                    const today = new Date();
                    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                    if (dateFilter === 'today') {
                        matchesDate = jobDate >= todayStart;
                    } else if (dateFilter === 'week') {
                        const weekStart = new Date(todayStart);
                        weekStart.setDate(todayStart.getDate() - 7);
                        matchesDate = jobDate >= weekStart;
                    } else if (dateFilter === 'month') {
                        const monthStart = new Date(todayStart);
                        monthStart.setMonth(todayStart.getMonth() - 1);
                        matchesDate = jobDate >= monthStart;
                    }
                }

                return matchesSearch && matchesCategory && matchesStatus && matchesDate;
            });



            // Sort filtered jobs by datePosted descending (latest first)
            filteredJobs.sort((a, b) => {
                const dateA = new Date(a.datePosted);
                const dateB = new Date(b.datePosted);
                return dateB - dateA;
            });

            // Render filtered jobs
            window.JobListings.renderJobs(filteredJobs);

            // Update counts
            updateFilteredCount(filteredJobs.length, allJobs.length);

        } catch (error) {
            console.error("Error filtering jobs:", error);
        }
    },
};

function updateFilteredCount(filteredCount, totalCount) {
    const paginationElement = document.querySelector('.pagination-current');
    if (paginationElement) {
        if (filteredCount < totalCount) {
            paginationElement.textContent = `Showing ${filteredCount} of ${totalCount} jobs`;
        } else {
            paginationElement.textContent = `Page 1 of 1`;
        }
    }
}

// Make the filter functionality globally accessible
window.JobFilters = JobFilters;
