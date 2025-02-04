document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const profileBtn = document.getElementById("profile-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // JWT 토큰 확인 (로그인 상태 체크)
  const token = localStorage.getItem("token");

  if (token) {
      // 로그인 상태
      loginBtn.style.display = "none";
      profileBtn.style.display = "inline-block";
      logoutBtn.style.display = "inline-block";
  } else {
      // 비로그인 상태
      loginBtn.style.display = "inline-block";
      profileBtn.style.display = "none";
      logoutBtn.style.display = "none";
  }

  // 로그아웃 기능
  logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token"); // JWT 토큰 삭제
      alert("로그아웃 되었습니다.");
      window.location.reload(); // 페이지 새로고침
  });
});
