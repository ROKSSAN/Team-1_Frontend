document.addEventListener("DOMContentLoaded", function () {
  const username = localStorage.getItem("username"); // 로그인 시 저장된 사용자 이름 가져오기
  if (username) {
      document.getElementById("user-name").textContent = username;
  } 
});
