// Function for redirecting home
// function goHome() {
//   window.location.href = "../pages/jobseekers-dashboard.html"; // Redirect to home page
// }

document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("cv-upload");
    const uploadButton = document.querySelector(".cv_btn");
  
    uploadButton.addEventListener("click", async function () {
      if (!fileInput.files.length) {
        alert("Please select a file to upload.");
        return;
      }
  
      const file = fileInput.files[0];
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB
  
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        alert("Invalid file type. Please upload a PDF or Word document.");
        return;
      }
  
      // Validate file size
      if (file.size > maxSize) {
        alert("File size exceeds 10MB. Please upload a smaller file.");
        return;
      }
  
      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
  
      const user = JSON.parse(localStorage.getItem("user"));
  
      try {
        const response = await fetch(
          `${apiEndpoints.resumeUpload}/${user.user_id}/resume/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Token ${user?.token}`, // Ensure authentication
            },
            body: formData,
          }
        );
  
        const result = await response.json();
        console.log("CV Upload Response:", result); // Debugging
  
        if (response.ok) {
          // localStorage.setItem("user", JSON.stringify(result.user_details));
          Toast.success(`${result.message}`);
          // Hide upload section and show success message
          document.getElementById("upload-section").classList.remove("active");
          document.getElementById("success-section").classList.add("active");
  
          // Redirect to dashboard after a delay
          setTimeout(() => {
            window.location.href = "/jobseeker-dashboard";
          }, 3000);
        } else {
          Toast.error(`Upload failed: ${result.message}`);
        }
      } catch (error) {
        console.error("Error uploading CV:", error);
        alert("An error occurred. Please try again.");
      }
    });
  });