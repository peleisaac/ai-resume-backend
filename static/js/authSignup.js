import { handleApiResponse } from "./handleApiResponse.js";

document.addEventListener("DOMContentLoaded", function () {
  // Get user role from the body tag
  const userRole = document.body.getAttribute("data-role") || "jobseeker";

  // Function to load the sign-up form with improved styling
  function loadSignUpForm(type) {
    const pageTitle =
      type === "employer" ? "EMPLOYERS SIGN UP" : "JOBSEEKERS SIGN UP";
    const fnameLabel = type === "employer" ? "Company Name" : "First Name";
    const lnameLabel = type === "employer" ? "Contact Name" : "Last Name";
    const switchText =
      type === "employer" ? "Are you a Jobseeker?" : "Are you an Employer?";
    const switchPath =
      type === "employer" ? "/jobseeker-signup" : "/employer-signup";
    const signInPath =
      type === "employer" ? "/employer-signin" : "/jobseeker-signin";

    return `
            <form id="signup-form">
                <div>
                    <h2 class="title">${pageTitle}</h2>
                    <p class="subtitle">Create an Account</p>
                </div>
                    
                <label for="fname">${fnameLabel}</label>
                <input type="text" id="fname" placeholder="Enter ${fnameLabel}" required />
                
                <label for="lname">${lnameLabel}</label>
                <input type="text" id="lname" placeholder="Enter ${lnameLabel}" required />
                
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter Email" required />
                
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter Password" required />
                
                <button type="submit" class="signup-btn">REGISTER</button>
                <p id="error-message" class="error-message"></p>

            </form>
                    
            <div class="auth-box">
                <p>Already Registered?</p>
                <button id="signin-btn" class="secondary-btn">SIGN IN HERE</button>
                <p>${switchText}</p>
                <button id="switch-btn" class="secondary-btn">SIGN UP HERE</button>
            </div>
        `;
  }

  // Inject the form into the page
  const authContainer = document.getElementById("auth-container");
  if (authContainer) {
    authContainer.innerHTML = loadSignUpForm(userRole);

    // Apply validations
    if (window.ValidationUtils) {
      window.ValidationUtils.attach(['fname', 'lname', 'company_name', 'contact_name'], window.ValidationUtils.restrictToName);
    }


    // Attach event listeners for navigation buttons
    document
      .getElementById("signin-btn")
      .addEventListener("click", function () {
        window.location.href =
          userRole === "employer"
            ? "/employer-signin"
            : "/jobseeker-signin";
      });

    document
      .getElementById("switch-btn")
      .addEventListener("click", function () {
        window.location.href =
          userRole === "employer"
            ? "/jobseeker-signup"
            : "/employer-signup";
      });

    // Attach form submission event listener
    const form = document.getElementById("signup-form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }
  }

  // Form submission handler
  function handleFormSubmit(event) {
    event.preventDefault();

    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("error-message");

    errorMessage.textContent = "";

    if (!fname || !lname || !email || !password) {
      errorMessage.textContent = "All fields are required.";
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordPattern.test(password)) {
      errorMessage.textContent =
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";
      return;
    }

    let data;
    if (userRole === "employer") {
      data = {
        first_name: "",
        last_name: "",
        msisdn: "",
        gender: "",
        dob: "1999-03-21",
        region: "",
        city: "",
        socials: "",
        category_of_interest: "",
        company_name: fname,
        contact_name: lname,
        email: email,
        password: password,
        user_role: userRole,
        company_description: "",
        job_notifications: "",
        address: "",
        industry: "",
      };
    } else {
      // Jobseeker data structure
      data = {
        first_name: fname,
        last_name: lname,
        email: email,
        password: password,
        user_role: userRole,
        msisdn: "",
        gender: "",
        dob: "1999-03-21",
        region: "",
        city: "",
        socials: "",
        category_of_interest: "",
        company_name: "",
        contact_name: "",
        company_description: "",
        job_notifications: "",
        address: "",
        industry: "",
      };
    }

    fetch(`${apiEndpoints.signup}`, {
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
        const result = handleApiResponse(
          responseData.status_code,
          responseData.data
        );
        console.log("Processed signup result:", result);

        if (result.success) {
          localStorage.setItem("user", JSON.stringify(result.data));
          console.log(`${responseData.data}`);
          // alert(result.message);
          window.notify.success(`${responseData.message}`);

          setTimeout(() => {
            window.location.href =
              userRole === "employer"
                ? "/employer-signin"
                : "/jobseeker-signin";
          }, 2000);
        } else {
          errorMessage.textContent = responseData.message || result.message;
          window.notify.error(`${responseData.message}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        window.notify.error("An error occurred. Please try again.");
        errorMessage.textContent = "An error occurred. Please try again.";
      });
  }
});
