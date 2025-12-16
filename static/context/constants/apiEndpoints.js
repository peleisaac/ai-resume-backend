// Guard against double execution when pages are dynamically loaded
const baseUrl = "https://ai-resume-backend-v2.axxendcorp.com/api/v1";
if (!window.apiEndpoints) {
  window.apiEndpoints = {
    base: baseUrl,
    users: `${baseUrl}/users`,
    user: `${baseUrl}/users`,
    updateUser: `${baseUrl}/user`,
    login: `${baseUrl}/login`,
    signup: `${baseUrl}/signup`,
    forgotPassword: `${baseUrl}/auth/forgot-password`,
    changePassword: `${baseUrl}/auth/reset-password`,
    validateOtp: `${baseUrl}/auth/validate-otp`,
    resendOtp: `${baseUrl}/otp/resend`,

    jobs: `${baseUrl}/jobs`,
    saveJob: `${baseUrl}/job/save`,
    savedJobs: `${baseUrl}/jobs/saved`,
    removeSavedJob: `${baseUrl}/saved-job/remove`,
    deleteJob: `${baseUrl}/job/delete`,
    addJob: `${baseUrl}/job/add`,
    applicationStatus: `${baseUrl}/application/status`,
    applicationsByJob: `${baseUrl}/applications/by-job`,
    jobsByEmployer: `${baseUrl}/jobs-by-employer`,

    addApplication: `${baseUrl}/application/add`,
    applicationsByUser: `${baseUrl}/applications/by-user`,
    employerDashboardMetrics: `${baseUrl}/employer/dashboard-metrics`,
    jobseekerDashboardMetrics: `${baseUrl}/jobseekers/dashboard-metrics`,

    resumeUpload: `${baseUrl}/user`,
  };
} else {
  // ensure new endpoints are present even if apiEndpoints was already defined
  window.apiEndpoints.applicationsByJob = `${baseUrl}/applications/by-job`;
}
