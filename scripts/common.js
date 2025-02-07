document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const profileBtn = document.getElementById("profile-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const searchInput = document.querySelector(".search-bar");

    const token = localStorage.getItem("token");
    const loggedInNav = document.querySelector(".logged-in-nav");
    const loggedOutNav = document.querySelector(".logged-out-nav");

    // 🔹 로그인 여부에 따라 네비게이션 변경
    if (token) {
        // 로그인 상태
        if (loggedInNav) loggedInNav.style.display = "flex";
        if (loggedOutNav) loggedOutNav.style.display = "none";
        if (loginBtn) loginBtn.style.display = "none";
        if (profileBtn) profileBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
        // 비로그인 상태
        if (loggedInNav) loggedInNav.style.display = "none";
        if (loggedOutNav) loggedOutNav.style.display = "flex";
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (profileBtn) profileBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";
    }

    // 🔹 로그아웃 처리
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            alert("로그아웃 되었습니다.");
            window.location.reload();
        });
    }

    // 🔹 검색 기능 (엔터 입력 시 search.html 이동)
    if (searchInput) {
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search.html?query=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});
