document.addEventListener("DOMContentLoaded", function () {
    const footerContainer = document.getElementById("footer");
    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer class="footer">
                <div class="footer-container">
                    <p>&copy; 2025 AI Resume Screening Application</p>
                </div>
            </footer>
        `;
    }
});