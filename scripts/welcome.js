document.addEventListener("DOMContentLoaded", async function () {
  const usernameElement = document.getElementById("user-name");

  try {
      const token = localStorage.getItem("token");
      if (!token) {
          window.location.href = "index.html"; // 로그인되지 않은 경우 메인 페이지로 리디렉트
          return;
      }

      // ✅ 사용자 정보 가져오기 (API 호출)
      const response = await fetch("http://127.0.0.1:8000/api/user/me/", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`
          }
      });

      if (!response.ok) throw new Error("사용자 정보를 가져오는 데 실패했습니다.");

      const userData = await response.json();

      // ✅ 사용자 이름 표시
      localStorage.setItem("username", userData.nickname); // 로컬 스토리지에 저장
      usernameElement.textContent = userData.nickname;

  } catch (error) {
      console.error("사용자 정보 오류:", error);
      window.location.href = "index.html"; // 오류 발생 시 메인 페이지로 이동
  }
});
