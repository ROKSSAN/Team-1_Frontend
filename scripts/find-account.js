document.addEventListener("DOMContentLoaded", () => {
  const findIdBtn = document.getElementById("find-id-btn");
  const findPwBtn = document.getElementById("find-pw-btn");

  // ✅ 아이디 찾기
  findIdBtn.addEventListener("click", async () => {
      const email = document.getElementById("find-id-email").value.trim();
      const resultMessage = document.getElementById("id-result");

      if (!email) {
          resultMessage.textContent = "이메일을 입력해주세요.";
          return;
      }

      try {
          const response = await fetch("http://127.0.0.1:8000/api/user/find-id/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email })
          });

          const data = await response.json();

          if (response.ok) {
              resultMessage.textContent = `✅ 아이디: ${data.username}`;
          } else {
              resultMessage.textContent = data.error || "❌ 아이디 찾기 실패";
          }
      } catch (error) {
          console.error("아이디 찾기 오류:", error);
          resultMessage.textContent = "❌ 서버 오류가 발생했습니다.";
      }
  });

  // ✅ 비밀번호 찾기 (비밀번호 재설정 링크 전송)
  findPwBtn.addEventListener("click", async () => {
      const email = document.getElementById("find-pw-email").value.trim();
      const resultMessage = document.getElementById("pw-result");

      if (!email) {
          resultMessage.textContent = "이메일을 입력해주세요.";
          return;
      }

      try {
          const response = await fetch("http://127.0.0.1:8000/api/user/reset-password/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email })
          });

          const data = await response.json();

          if (response.ok) {
              resultMessage.textContent = "📩 비밀번호 재설정 링크가 이메일로 전송되었습니다.";
          } else {
              resultMessage.textContent = data.error || "❌ 비밀번호 찾기 실패";
          }
      } catch (error) {
          console.error("비밀번호 찾기 오류:", error);
          resultMessage.textContent = "❌ 서버 오류가 발생했습니다.";
      }
  });
});
