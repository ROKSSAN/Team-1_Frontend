document.addEventListener("DOMContentLoaded", async () => {
  const bookGrid = document.getElementById("book-grid");
  const userLibraryTitle = document.getElementById("user-library-title");
  const writeReviewBtn = document.getElementById("write-review-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // ✅ 로그인 상태 확인 (토큰 존재 여부)
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token || !username) {
      userLibraryTitle.textContent = "로그인 후 이용해 주세요.";
      bookGrid.innerHTML = `<p class="login-prompt">📚 내 서재를 보려면 <a href="index.html">로그인</a>하세요.</p>`;
      return;
  }

  // ✅ 로그인한 경우 사용자 이름 표시
  userLibraryTitle.textContent = `${username}님의 서재`;

  try {
      // ✅ API 요청하여 사용자가 작성한 리뷰 가져오기
      const response = await fetch("http://127.0.0.1:8000/api/review/library/", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
          }
      });

      if (response.status === 401) {
          alert("인증이 필요합니다. 다시 로그인하세요.");
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.location.href = "index.html";
          return;
      }

      if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
      }

      const books = await response.json();
      if (!books || books.length === 0) {
          bookGrid.innerHTML = `<p class="no-books-message">📖 아직 작성한 리뷰가 없습니다.</p>`;
      } else {
          loadBooks(books);
      }
  } catch (error) {
      console.error("책 데이터를 불러오는 중 오류 발생:", error);
      bookGrid.innerHTML = `<p class="error-message">⛔ 데이터를 불러오는 중 오류가 발생했습니다.</p>`;
  }

  // ✅ 로그아웃 버튼 이벤트
  if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.location.href = "index.html";
      });
  }

  // ✅ 리뷰 쓰기 버튼 이벤트 (책 검색 페이지로 이동)
  writeReviewBtn.addEventListener("click", () => {
      window.location.href = "search.html";
  });
});

// ✅ 책 데이터를 화면에 표시하는 함수
function loadBooks(books) {
  const bookGrid = document.getElementById("book-grid");

  bookGrid.innerHTML = books.map(book => `
      <div class="book-card" onclick="location.href='book-detail.html?isbn=${book.isbn}'">
          <div class="book-cover" style="background-image: url(${book.image_url || '../assets/images/no_image.png'})"></div>
          <div class="book-info">
              <h3>${book.title} <span class="rating">⭐ ${book.rating.toFixed(1)}</span></h3>
              <p>${book.author}</p>
              <p class="review">${book.short_review || "리뷰 없음"}</p>
          </div>
      </div>
  `).join("");
}
