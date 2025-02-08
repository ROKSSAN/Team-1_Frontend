document.addEventListener("DOMContentLoaded", async () => {
  const bookGrid = document.getElementById("book-grid");
  const userLibraryTitle = document.getElementById("user-library-title");
  const logoutBtn = document.getElementById("logout-btn");

  // ✅ 로그인 상태 확인 (토큰 존재 여부)
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token || !username) {
      // 로그인하지 않은 경우
      userLibraryTitle.textContent = "로그인 후 이용해 주세요.";
      bookGrid.innerHTML = `<p class="login-prompt">📚 내 서재를 보려면 <a href="index.html">로그인</a>하세요.</p>`;
      return;
  }

  // ✅ 로그인한 경우 사용자 이름 표시
  userLibraryTitle.textContent = `${username}님의 서재`;

  try {
      // ✅ 사용자가 남긴 리뷰 목록 가져오기 (API 요청)
      const response = await fetch("http://127.0.0.1:8000/api/library/", {
          headers: {
              "Authorization": `Bearer ${token}`
          }
      });

      if (!response.ok) {
          throw new Error("서버에서 데이터를 불러오지 못했습니다.");
      }

      const data = await response.json();
      if (data.length === 0) {
          bookGrid.innerHTML = `<p class="no-books">📖 아직 작성한 리뷰가 없습니다.</p>`;
      } else {
          loadBooks(data); // 가져온 데이터로 책 목록 렌더링
      }
  } catch (error) {
      console.error("책 데이터를 불러오는 중 오류 발생:", error);
      bookGrid.innerHTML = `<p class="error-message">⛔ 데이터를 불러오는 중 오류가 발생했습니다.</p>`;
  }

  // ✅ 로그아웃 버튼 이벤트
  if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("token");
          localStorage.removeItem("username");  // 닉네임도 삭제
          window.location.href = "index.html";  // 로그인 페이지로 이동
      });
  }
});

// ✅ 책 데이터를 화면에 표시하는 함수
function loadBooks(books) {
  const bookGrid = document.getElementById("book-grid");

  bookGrid.innerHTML = books.map(book => `
      <div class="book-card">
          <div class="book-cover" style="background-image: url(${book.image_url || 'default-cover.jpg'})"></div>
          <div class="book-info">
              <h3>${book.title}</h3>
              <p>${book.author}</p>
              <div class="rating">
                  ${generateStars(book.rating)}
              </div>
              <p class="review">${book.review || "리뷰 없음"}</p>
          </div>
      </div>
  `).join("");
}

// ✅ 별점 표시 함수
function generateStars(rating) {
  return "⭐".repeat(Math.round(rating)) + ` ${rating.toFixed(1)}`;
}
