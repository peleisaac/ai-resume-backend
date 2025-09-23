
// toast.js - Reusable toast utility for the entire project

// Configure toastr globally
toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: true,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
  };
  
  // Simple toast functions
  const Toast = {
    success: (message, title = "") => {
      toastr.success(message, title);
    },
  
    error: (message, title = "") => {
      toastr.error(message, title);
    },
  
    warning: (message, title = "") => {
      toastr.warning(message, title);
    },
  
    info: (message, title = "") => {
      toastr.info(message, title);
    },
  };
  
  const ensureToastStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
      .toast-success { background-color: #51A351 !important; opacity: 1 !important; }
      .toast-error { background-color: #BD362F !important; opacity: 1 !important; }
      .toast-warning { background-color: #F89406 !important; opacity: 1 !important; }
      .toast-info { background-color: #2F96B4 !important; opacity: 1 !important; }
    `;
    document.head.appendChild(style);
  };
  
  // Initialize styles when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureToastStyles);
  } else {
    ensureToastStyles();
  }
  
  // Make it globally available
  window.Toast = Toast;
  