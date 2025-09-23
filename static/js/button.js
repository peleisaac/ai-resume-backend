function handleClick() {
    alert("Button Clicked!");
}

// Function to create buttons dynamically
function createButton({ text, variant = "primary", fullWidth = false, icon = null }) {
    const button = document.createElement("button");
    button.className = `btn ${variant} ${fullWidth ? "w-full" : ""}`;
    button.innerHTML = icon ? `<span class="icon">${icon}</span> ${text}` : text;
    button.onclick = handleClick;
    return button;
}