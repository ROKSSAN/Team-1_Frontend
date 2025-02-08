document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username"); // 아이디 또는 이메일 입력 필드
    const passwordInput = document.getElementById("password");
    const togglePasswordIcon = document.querySelector(".toggle-password");

    // 🔒 비밀번호 보기/숨기기 기능
    if (togglePasswordIcon) {
        togglePasswordIcon.addEventListener("click", () => {
            const isPasswordHidden = passwordInput.type === "password";
            passwordInput.type = isPasswordHidden ? "text" : "password";
            togglePasswordIcon.textContent = isPasswordHidden ? "👁️" : "🙈"; // 아이콘 변경
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

            // API 문서에 따라 로그인 요청 URL 설정
            const loginUrl = "http://127.0.0.1:8000/api/user/login/";

            const loginData = {
                username: identifier,  // API 문서 기준으로 key를 username으로 설정
                password: password
            };

            try {
                const response = await fetch(loginUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(loginData)
                });

                const result = await response.json();

                if (response.ok) {
                    // ✅ 로그인 성공 시 사용자 정보 저장
                    localStorage.setItem("token", result.access_token);  // JWT 토큰 저장
                    localStorage.setItem("username", result.user.nickname); // ✅ 사용자 닉네임 저장

                    alert(`${result.user.nickname}님, 로그인 성공!`);
                    window.location.href = "welcome.html"; // ✅ 로그인 후 Welcome 페이지로 이동
                } else {
                    alert(result.error || "로그인 실패. 다시 시도해주세요.");
                }
            } catch (error) {
                console.error("로그인 요청 실패", error);
                alert("서버 오류가 발생했습니다.");
            }
        });
    }
});
