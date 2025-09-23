// import { apiEndpoints } from "../context/constants/apiEndpoints.js";
import { handleApiResponse } from "./handleApiResponse.js";

document.addEventListener("DOMContentLoaded", function () {
  // Get user role from the body tag
  const userRole = document.body.getAttribute("data-role") || "jobseeker";

  // Function to load the sign-in form
  function loadSignInForm(type) {
    const pageTitle =
      type === "employer" ? "EMPLOYERS SIGN IN" : "JOBSEEKERS SIGN IN";
    const switchText =
      type === "employer" ? "Are you a Jobseeker?" : "Are you an Employer?";
    const switchPath =
      type === "employer" ? "/jobseeker-signin" : "/employer-signin";
    const signUpPath =
      type === "employer" ? "/employer-signup" : "/jobseeker-signup";
    const profilePath =
      type === "employer"
        ? "/employer-profile"
        : "/jobseeker-profile";

    return `
            <form id="signin-form">
                <div>
                    <h2 class="title">${pageTitle}</h2>
                    <p class="subtitle">Access Your Account</p>
                </div>
    
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter Email" required>
    
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter Password" required>
    
                <button type="submit" class="signin-btn">SIGN IN</button>
                <p id="error-message" class="error-message"></p>
            </form>
    
            <div class="auth-box">
                <p>Don't have an account?</p>
                <button onclick="location.href='${signUpPath}'" class="secondary-btn">SIGN UP HERE</button>
                <p>${switchText}</p>
                <button onclick="location.href='${switchPath}'" class="secondary-btn">SIGN IN HERE</button>
            </div>
        `;
  }

  // Inject the form into the page
  const authContainer = document.getElementById("auth-container");
  if (authContainer) {
    authContainer.innerHTML = loadSignInForm(userRole);

    // Attach event listener for form submission
    const form = document.getElementById("signin-form");
    if (form) {
      form.addEventListener("submit", handleSignIn);
    }
  }

  // Sign-in form submission handler
  function handleSignIn(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("error-message");

    errorMessage.textContent = "";

    if (!email || !password) {
      errorMessage.textContent = "All fields are required.";
      return;
    }

    const data = {
      email: email,
      password: password,
      user_role: userRole,
    };

    console.log("Sending login request with data:", data);

    fetch(`${apiEndpoints.login}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
      mode: "cors",
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log("Login response:", responseData);
        const result = handleApiResponse(
          responseData.status_code,
          responseData.data
        );
        console.log("Processed login result:", result);

        if (result.success) {
          Toast.success(`${responseData.message}`);
          // Store user data in localStorage
          localStorage.setItem("user", JSON.stringify(result.data));

          // Get the userId from the login response
          const userId = result.data.user_id;

          // Make a request to the users endpoint to check profile completion status
          return fetch(`${apiEndpoints.user}/${userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Token ${result.data.token}`,
            },
            mode: "cors",
          })
            .then((profileResponse) => {
              console.log("Profile response status:", profileResponse.status);
              return profileResponse.json();
            })
            .then((profileData) => {
              console.log("Profile data:", profileData);

              // Log the specific user object structure
              if (profileData.user) {
                console.log(
                  "User object:",
                  JSON.stringify(profileData.user, null, 2)
                );
                console.log(
                  "Profile complete value:",
                  profileData.user.profile_complete
                );
              } else {
                console.log("No user object found in response");
              }

              // Use handleApiResponse for consistent error handling
              const profileResult = handleApiResponse(
                profileData.status_code,
                profileData.user
              );

              console.log("Processed profile result:", profileResult);

              // Check if profile fetch was successful
              if (profileResult.success && profileResult.data) {
                const profileCompleted =
                  profileResult.data.profile_complete === true;
                console.log("Profile completed status:", profileCompleted);
                Toast.success(`${profileResult.message}`);

                // Redirect based on profile completion status
                if (profileCompleted) {
                  console.log("Redirecting to dashboard");
                  Toast.success("Redirecting to dashboard");
                  window.location.href =
                    userRole === "employer"
                      ? "/employer-dashboard"
                      : "/jobseeker-dashboard";
                } 
                else {
                  console.log("Redirecting to profile - incomplete profile");
                  Toast.error("Redirecting to profile - incomplete profile");
                  window.location.href =
                    userRole === "employer"
                      ? "/employer-profile"
                      : "/jobseeker-profile";
                }
              } 
              // else {
              //   console.log("Profile data issue, redirecting to profile page");
              //   Toast.error("Profile data issue, redirecting to profile page");
              //   window.location.href =
              //     userRole === "employer"
              //       ? "/employer-profile"
              //       : "/jobseeker-profile";
              //   Toast.error(profileResult.message);
              // }
            })
            .catch((profileError) => {
              Toast.error("Profile fetch error:", profileError);
              console.error("Profile fetch error:", profileError);
              // If there's an error fetching the profile, redirect to profile page
              window.location.href =
                userRole === "employer"
                  ? "/employer-profile"
                  : "/jobseeker-profile";
            });
        } else {
          document.getElementById("email").value = "";
          document.getElementById("password").value = "";
          Toast.error(`${responseData.non_field_errors}`);
          errorMessage.textContent = responseData.message || result.message;
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        Toast.error(`${error.message}`);

        document.getElementById("email").value = "";
        document.getElementById("password").value = "";

        errorMessage.textContent = "An error occurred. Please try again.";
      });
  }
});