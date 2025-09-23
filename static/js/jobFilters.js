
// Job filters functionality
const JobFilters = {
    async filterJobs() {
        console.log("Filtering jobs...");
        
        try {
            // Get all jobs from the data service
            const allJobs = await JobDataService.loadJobs();
            
            // Get filter values
            const searchTerm = document.getElementById("searchJobs").value.toLowerCase();
            const categoryFilter = document.getElementById("categoryFilter").value;
            const statusFilter = document.getElementById("statusFilter").value;
            const dateFilter = document.getElementById("dateFilter").value;
            
            // Apply filters
            let filteredJobs = allJobs.filter(job => {
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
                    const todayStart = new Date(today.setHours(0, 0, 0, 0));
                    
                    if (dateFilter === 'today') {
                        matchesDate = jobDate >= todayStart;
                    } else if (dateFilter === 'week') {
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - 7);
                        matchesDate = jobDate >= weekStart;
                    } else if (dateFilter === 'month') {
                        const monthStart = new Date(today);
                        monthStart.setMonth(today.getMonth() - 1);
                        matchesDate = jobDate >= monthStart;
                    }
                }
                
                return matchesSearch && matchesCategory && matchesStatus && matchesDate;
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