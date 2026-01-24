// Guard against double execution when pages are dynamically loaded
const baseUrl = "postgres://uebroi7mi1719s:pcab294e8297db75020683db7f38bae12606e2ed1c28792dfca6bc9c9b3af9761@c18qegamsgjut6.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d3248bqti57enm/api/v1";
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
