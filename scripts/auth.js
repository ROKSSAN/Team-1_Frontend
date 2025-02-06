document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("token") !== null;
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const profileBtn = document.getElementById("profile-btn");

    if (isLoggedIn) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        profileBtn.style.display = "inline-block";
    } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        profileBtn.style.display = "none";
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
});
