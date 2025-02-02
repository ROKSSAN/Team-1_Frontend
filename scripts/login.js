document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username"); // 아이디 또는 이메일 입력 필드
    const passwordInput = document.getElementById("password");
    const togglePasswordIcon = document.querySelector(".toggle-password");

    // 🔒 비밀번호 보기/숨기기 기능
    if (togglePasswordIcon) {
        togglePasswordIcon.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePasswordIcon.textContent = "👁️"; // 열린 아이콘
            } else {
                passwordInput.type = "password";
                togglePasswordIcon.textContent = "🙈"; // 닫힌 아이콘
            }
        });
    }

    // 🔑 로그인 폼 제출 이벤트
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // 기본 동작 막기

            const identifier = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!identifier || !password) {
                alert("아이디(이메일)과 비밀번호를 입력하세요.");
                return;
            }

            // 입력값이 이메일인지 확인하는 정규식
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmail = emailPattern.test(identifier);

            const loginData = {
                [isEmail ? "email" : "username"]: identifier, // 이메일이면 email 필드, 아니면 username 필드로 전송
                password
            };

            try {
                const response = await fetch("/users/login/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(loginData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert("로그인 성공!");
                    localStorage.setItem("token", result.token); // JWT 토큰 저장
                    window.location.href = "main.html"; // 로그인 후 메인 페이지로 이동
                } else {
                    alert(result.error || "로그인 실패. 다시 시도해주세요.");
                }
            } catch (error) {
                console.error("로그인 요청 실패", error);
                alert("서버 오류가 발생했습니다.");
            }
        });
    }

    // 로그인 상태 관리
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const profileBtn = document.getElementById("profile-btn");

    const isLoggedIn = localStorage.getItem("token") !== null;

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
        window.location.reload();
    });
});
