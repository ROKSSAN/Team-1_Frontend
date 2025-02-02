document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const profileBtn = document.getElementById("profile-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const token = localStorage.getItem("token");

  if (token) {
      loginBtn.style.display = "none";
      profileBtn.style.display = "inline-block";
      logoutBtn.style.display = "inline-block";
  } else {
      loginBtn.style.display = "inline-block";
      profileBtn.style.display = "none";
      logoutBtn.style.display = "none";
  }

  logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
  });
});
