document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const profileBtn = document.getElementById("profile-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const searchInput = document.querySelector(".search-bar");

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const loggedInNav = document.querySelector(".logged-in-nav");
    const loggedOutNav = document.querySelector(".logged-out-nav");

    // ✅ 로그인 여부에 따라 네비게이션 변경
    if (token && username) {
        // 로그인 상태
        if (loggedInNav) loggedInNav.style.display = "flex";
        if (loggedOutNav) loggedOutNav.style.display = "none";
        if (loginBtn) loginBtn.style.display = "none";
        if (profileBtn) profileBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "inline-block";

        // ✅ 로그인된 사용자 닉네임 표시
        const usernameDisplay = document.getElementById("username-display");
        if (usernameDisplay) usernameDisplay.textContent = `${username}님`;
    } else {
        // 비로그인 상태
        if (loggedInNav) loggedInNav.style.display = "none";
        if (loggedOutNav) loggedOutNav.style.display = "flex";
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (profileBtn) profileBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";
    }

    // ✅ 로그아웃 처리 (API 호출 후 로그아웃)
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/user/logout/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        refresh_token: localStorage.getItem("refresh_token")
                    })
                });

                if (response.ok) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("refresh_token");
                    localStorage.removeItem("username");
                    alert("로그아웃 되었습니다.");
                    window.location.href = "index.html"; // ✅ 로그아웃 후 로그인 페이지로 이동
                } else {
                    alert("로그아웃에 실패했습니다.");
                }
            } catch (error) {
                console.error("로그아웃 오류:", error);
                alert("서버 오류가 발생했습니다.");
            }
        });
    }

    // ✅ 검색 기능 (엔터 입력 시 `search.html` 이동)
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
