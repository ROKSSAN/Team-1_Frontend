document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.querySelector(".toggle-password");

  // 비밀번호 보기/숨기기 기능
  togglePassword.addEventListener("click", () => {
      if (passwordInput.type === "password") {
          passwordInput.type = "text";
      } else {
          passwordInput.type = "password";
      }
  });

  // 로그인 폼 제출 이벤트
  loginForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // 기본 동작 막기

      const loginData = {
          username: emailInput.value,
          password: passwordInput.value
      };

      try {
          const response = await fetch("/users/login/", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(loginData)
          });

          const result = await response.json();

          if (response.ok) {
              alert("로그인 성공!");
              localStorage.setItem("token", result.token);
              window.location.href = "index.html"; // 로그인 후 메인 페이지로 이동
          } else {
              alert(result.error || "로그인 실패. 다시 시도해주세요.");
          }
      } catch (error) {
          console.error("로그인 요청 실패", error);
          alert("서버 오류가 발생했습니다.");
      }
  });
});

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".toggle-password");

  if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.textContent = "👁️"; // 눈 아이콘 (보이기)
  } else {
      passwordInput.type = "password";
      toggleIcon.textContent = "🙈"; // 잠금 아이콘 (숨기기)
  }
}



