document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refresh_token");
    const username = localStorage.getItem("username");

    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const profileBtn = document.getElementById("profile-btn");
    const usernameDisplay = document.getElementById("username-display");

    if (token && username) {
        // ✅ 로그인 상태
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (profileBtn) profileBtn.style.display = "inline-block";

        // ✅ 사용자 이름 표시
        if (usernameDisplay) {
            usernameDisplay.textContent = `${username}님`;
        }
    } else {
        // ❌ 비로그인 상태
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (profileBtn) profileBtn.style.display = "none";
    }

    // ✅ 로그아웃 처리 (API 요청 후 로그아웃)
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
                        refresh_token: refreshToken
                    })
                });

                if (response.ok) {
                    // ✅ 로컬 스토리지에서 사용자 정보 삭제
                    localStorage.removeItem("token");
                    localStorage.removeItem("refresh_token");
                    localStorage.removeItem("username");

                    alert("로그아웃 되었습니다.");
                    window.location.href = "index.html"; // ✅ 로그아웃 후 로그인 페이지로 이동
                } else {
                    alert("로그아웃 실패. 다시 시도해주세요.");
                }
            } catch (error) {
                console.error("로그아웃 오류:", error);
                alert("서버 오류가 발생했습니다.");
            }
        });
    }
});
