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
});

document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username");
    const saveButton = document.getElementById("save-username");

    // ✅ 기존 사용자 이름 표시
    usernameInput.value = localStorage.getItem("username") || "";

    saveButton.addEventListener("click", async () => {
        const newUsername = usernameInput.value.trim();

        if (!newUsername) {
            alert("이름을 입력하세요.");
            return;
        }

        try {
            const response = await fetch("/users/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ username: newUsername })
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ 서버 업데이트 성공 → `localStorage` 업데이트
                localStorage.setItem("username", newUsername);
                alert("이름이 변경되었습니다!");
            } else {
                alert(data.error || "이름 변경에 실패했습니다.");
            }
        } catch (error) {
            console.error("이름 변경 실패:", error);
            alert("서버 오류가 발생했습니다.");
        }
    });
});
