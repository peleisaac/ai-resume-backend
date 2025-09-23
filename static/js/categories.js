document.addEventListener("DOMContentLoaded", function () {
    loadCategories();
});

function loadCategories() {
    fetch("/static/models/categories.json")
        .then(response => response.json())
        .then(data => {
            const categoryList = document.getElementById("category-list");
            categoryList.innerHTML = "";

            data.categories.forEach(category => {
                const categoryItem = document.createElement("div");
                categoryItem.classList.add("category-item");

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = "categories";
                checkbox.value = category;
                checkbox.classList.add("category-checkbox");
                checkbox.onclick = limitSelection; 

                const label = document.createElement("label");
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(" " + category));

                categoryItem.appendChild(checkbox);
                categoryItem.appendChild(document.createTextNode(category));

                categoryList.appendChild(categoryItem);
            });
        })
        .catch(error => console.error("Error loading categories:", error));
}


function limitSelection() {
    const checkboxes = document.querySelectorAll(".category-checkbox");
    const checkedCount = document.querySelectorAll(".category-checkbox:checked").length;

    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.disabled = checkedCount >= 2; // Disable unchecked boxes after selecting 2
        } else {
            checkbox.disabled = false; // Re-enable if selection is below 2
        }
    });
}