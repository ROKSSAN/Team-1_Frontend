document.addEventListener("DOMContentLoaded", async () => {
  const bookImage = document.getElementById("book-image");
  const bookTitle = document.getElementById("book-title");
  const bookAuthor = document.getElementById("book-author");
  const bookPublisher = document.getElementById("book-publisher");
  const bookLink = document.getElementById("book-link");
  const reviewsList = document.getElementById("reviews-list");
  const recommendationsList = document.getElementById("recommendation-list");

  const params = new URLSearchParams(window.location.search);
  const isbn = params.get("isbn"); // URL에서 ISBN 가져오기

  if (!isbn) {
      alert("잘못된 접근입니다.");
      window.location.href = "main.html";
      return;
  }

  // ✅ 책 정보 가져오기
  async function loadBookDetails() {
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/book/isbn/${isbn}/`); // API 경로 수정
          if (!response.ok) throw new Error("책 정보를 불러올 수 없습니다.");

          const book = await response.json();
          bookImage.src = book.image_url;
          bookTitle.textContent = book.title;
          bookAuthor.textContent = `${book.author} / ${book.translator || "번역 없음"}`;
          bookPublisher.textContent = `${book.publisher} / ${book.published_date}`;
          bookLink.href = book.link;
      } catch (error) {
          console.error("책 정보 오류:", error);
      }
  }

  // ✅ 리뷰 목록 가져오기
  async function loadReviews() {
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/review/list/?isbn=${isbn}`);
          if (!response.ok) throw new Error("리뷰를 불러올 수 없습니다.");

          const reviews = await response.json();
          reviewsList.innerHTML = reviews.length > 0
              ? reviews.map(review => `
                  <div class="review-card">
                      <p>${review.content}</p>
                  </div>
              `).join("")
              : "<p>아직 리뷰가 없습니다.</p>";

      } catch (error) {
          console.error("리뷰 불러오기 오류:", error);
      }
  }

  // ✅ 연관 추천 도서 가져오기
  async function loadRecommendations() {
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/book/recommendations/?isbn=${isbn}`);
          if (!response.ok) throw new Error("추천 도서를 불러올 수 없습니다.");

          const books = await response.json();
          recommendationsList.innerHTML = books.length > 0
              ? books.map(book => `
                  <div class="recommendation-item" onclick="location.href='book-detail.html?isbn=${book.isbn}'">
                      <img src="${book.image_url}" alt="${book.title}">
                      <p>${book.title}</p>
                  </div>
              `).join("")
              : "<p>추천할 도서가 없습니다.</p>";

      } catch (error) {
          console.error("추천 도서 오류:", error);
      }
  }

  // ✅ 데이터 불러오기
  loadBookDetails();
  loadReviews();
  loadRecommendations();
});
