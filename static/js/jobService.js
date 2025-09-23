// jobService.js - Without ES6 modules (for compatibility)

const JobService = {
    applyForJob: async (jobId, employerId, documentsUrls = []) => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        if (!token || !user?.user_id) {
          throw new Error("Authentication required");
        }
        const payload = {
          user_id: user.user_id,
          employer_id: employerId,
          job_id: jobId,
          application_status: "new",
        };
  
        if (Array.isArray(documentsUrls) && documentsUrls.length > 0) {
          const validDocs = documentsUrls.filter(
            (doc) => typeof doc === "object" && Object.keys(doc).length > 0
          );
          if (validDocs.length > 0) {
            payload.required_documents_urls = validDocs;
          }
        }
  
        const response = await fetch(`${apiEndpoints.addApplication}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${token}`,
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to apply for job");
        }
  
        const responseData = await response.json();
        return responseData;
      } catch (error) {
        throw error;
      }
    },
  
    saveJob: async (jobId) => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        if (!token || !user?.user_id) {
          throw new Error("Authentication required");
        }
  
        const response = await fetch(`${apiEndpoints.saveJob}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${token}`,
          },
          body: JSON.stringify({
            user_id: user.user_id,
            job_id: jobId,
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save job");
        }
  
        const responseData = await response.json();
        return responseData;
      } catch (error) {
        throw error;
      }
    },
  
    unsaveJob: async (jobId) => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
  
        const response = await fetch(`${apiEndpoints.removeSavedJob}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `token ${token}`,
          },
          body: JSON.stringify({
            user_id: user.user_id,
            saved_job_id: jobId,
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to remove saved job");
        }
  
        const responseData = await response.json();
        return responseData;
      } catch (error) {
        throw error;
      }
    },
  };
  
  // Make it globally available
  window.JobService = JobService;