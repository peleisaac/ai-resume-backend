export function handleApiResponse(code, data) {
    switch (code) {
        case "AR00":
            return { success: true, message: "Success!", data };
        case "AR01":
            return { success: false, message: "Invalid credentials. Please try again." };
        case "AR02":
            return { success: false, message: "Unauthorized access. Please log in again." };
        case "AR03":
            return { success: false, message: "Not found. Please check your input." };
        case "AR04":
            return { success: false, message: "Server error. Try again later." };
        case "AR05":
            return { success: false, message: "Bad request. Please check your input and try again." };
        default:
            return { success: false, message: "Unknown error. Please try again." };
    }
}