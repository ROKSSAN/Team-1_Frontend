document.addEventListener("DOMContentLoaded", () => {
  const bookGrid = document.getElementById("book-grid");
  const userLibraryTitle = document.getElementById("user-library-title");
  const logoutBtn = document.getElementById("logout-btn");

  // 사용자 이름 가져오기
  const username = localStorage.getItem("username") || "사용자";
  userLibraryTitle.textContent = `${username}님의 서재`;

  // 사용자가 남긴 리뷰한 책 목록 가져오기 (ISBN 기반)
  fetch("../data/reviewed-books.json")
      .then(response => response.json())
      .then(data => {
          loadBooks(data.books);
      })
      .catch(error => console.error("책 데이터를 불러오는 중 오류 발생:", error));

  // 로그아웃 버튼 이벤트
  if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("token");
          window.location.href = "index.html";
      });
  }
});

// 책 데이터를 화면에 표시하는 함수
function loadBooks(books) {
  const bookGrid = document.getElementById("book-grid");

  bookGrid.innerHTML = books.map(book => `
      <div class="book-card">
          <div class="book-cover" style="background-image: url(${book.cover || 'default-cover.jpg'})"></div>
          <div class="book-info">
              <h3>${book.title}</h3>
              <p>${book.author}</p>
              <div class="rating">
                  ${generateStars(book.rating)}
              </div>
              <p class="review">${book.review || ""}</p>
          </div>
      </div>
  `).join("");
}

// 별점 표시 함수
function generateStars(rating) {
  return "⭐".repeat(Math.round(rating)) + ` ${rating.toFixed(1)}`;
}
