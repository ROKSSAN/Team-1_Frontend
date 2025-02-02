document.addEventListener("DOMContentLoaded", async () => {
  try {
      const response = await fetch("/books/"); // 백엔드 API 요청
      const books = await response.json();

      const bestsellerContainer = document.getElementById("bestseller-books");
      bestsellerContainer.innerHTML = books.slice(0, 5).map(book => `
          <div class="book-item">
              <img src="${book.image}" alt="${book.title}">
              <p>${book.title}</p>
          </div>
      `).join("");

  } catch (error) {
      console.error("도서 목록 불러오기 실패", error);
  }
});

/* document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
      window.location.href = "login.html"; // 로그인 페이지로 이동
  }

  document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "login.html";
  });
}); */

