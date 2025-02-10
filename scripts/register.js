document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("register-form");

  registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // 사용자 입력 값 가져오기
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const nickname = document.getElementById("nickname").value.trim();
      const email = document.getElementById("email").value.trim();

      // 입력값 검증
      if (!username || !password || !nickname || !email) {
          alert("모든 필드를 입력해주세요.");
          return;
      }

      const requestData = {
          username: username,
          password: password,
          nickname: nickname,
          email: email
      };

      try {
          // 회원가입 API 요청
          const response = await fetch("http://127.0.0.1:8000/api/user/signup/", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(requestData)
          });

          const responseData = await response.json();

          if (response.ok) {
              alert("회원가입 성공! 로그인 페이지로 이동합니다.");
              window.location.href = "index.html"; // 로그인 페이지로 리디렉트
          } else {
              // API에서 반환된 오류 메시지 처리
              alert(responseData.message || "회원가입에 실패했습니다.");
          }
      } catch (error) {
          console.error("회원가입 요청 중 오류 발생:", error);
          alert("서버와의 통신 중 오류가 발생했습니다. 나중에 다시 시도해주세요.");
      }
  });
});
