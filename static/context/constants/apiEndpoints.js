// Guard against double execution when pages are dynamically loaded
if (!window.apiEndpoints) {
  const baseUrl = "http://127.0.0.1:8000/api/v1";
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
    jobsByEmployer: `${baseUrl}/jobs-by-employer`,

    addApplication: `${baseUrl}/application/add`,
    applicationsByUser: `${baseUrl}/applications/by-user`,
    employerDashboardMetrics: `${baseUrl}/employer/dashboard-metrics`,
    jobseekerDashboardMetrics: `${baseUrl}/jobseekers/dashboard-metrics`,

    resumeUpload: `${baseUrl}/user`,
  };
}
