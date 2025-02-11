document.addEventListener("DOMContentLoaded", async () => {
  const bookImage = document.getElementById("book-image");
  const bookTitle = document.getElementById("book-title");
  const bookAuthor = document.getElementById("book-author");
  const bookPublisher = document.getElementById("book-publisher");
  const bookLink = document.getElementById("book-link"); // ✅ 링크 버튼
  const reviewsList = document.getElementById("reviews-list");
  const recommendationsList = document.getElementById("recommendation-list");

  const params = new URLSearchParams(window.location.search);
  const isbn = params.get("isbn"); // URL에서 ISBN 가져오기

  if (!isbn) {
      alert("잘못된 접근입니다.");
      window.location.href = "main.html";
      return;
  }

  let bookUrl = `https://search.shopping.naver.com/book/catalog/${isbn}`; // 기본 링크 (네이버 쇼핑)

  // ✅ 책 정보 가져오기 (API에서 네이버 책 링크 저장)
  async function loadBookDetails() {
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/book/isbn/${isbn}/`);
          if (!response.ok) throw new Error("책 정보를 불러올 수 없습니다.");

          const book = await response.json();
          bookImage.src = book.image_url;
          bookTitle.textContent = book.title;
          bookAuthor.textContent = `${book.author} / ${book.translator || "번역 없음"}`;
          bookPublisher.textContent = `${book.publisher} / ${book.published_date}`;

          // ✅ API에서 받은 네이버 책 링크 저장
          if (book.link) {
              bookUrl = book.link;  // 네이버 책 상세 페이지 링크 저장
          }

          // ✅ 버튼 표시 (링크 유무와 관계없이 항상 표시)
          bookLink.style.display = "inline-block";
      } catch (error) {
          console.error("책 정보 오류:", error);
      }
  }

  // ✅ 버튼 클릭 시 저장된 네이버 책 링크로 이동 (이중 실행 방지)
  bookLink.addEventListener("click", (event) => {
      event.preventDefault(); // <a> 태그 기본 동작 막기
      window.open(bookUrl, "_blank"); // 저장된 링크로 새 탭에서 이동
  });

  // ✅ 특정 책의 최신 리뷰 목록 가져오기
  async function loadReviews() {
      try {
          const token = localStorage.getItem("token"); // 인증 토큰 가져오기
          const response = await fetch(`http://127.0.0.1:8000/api/review/library/${isbn}/`, {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
          });

          if (response.status === 401) {
              alert("인증이 필요합니다. 다시 로그인하세요.");
              window.location.href = "index.html";
              return;
          }

          if (!response.ok) throw new Error("리뷰를 불러올 수 없습니다.");

          const reviews = await response.json();
          reviewsList.innerHTML = reviews.length > 0
              ? reviews.map(review => `
                  <div class="review-card" data-review-id="${review.id}">
                      <p>${review.content}</p>
                  </div>
              `).join("")
              : "<p>아직 리뷰가 없습니다.</p>";

          // ✅ 리뷰 클릭 시 상세 페이지로 이동
          document.querySelectorAll(".review-card").forEach(reviewCard => {
              reviewCard.addEventListener("click", () => {
                  const reviewId = reviewCard.getAttribute("data-review-id");
                  if (reviewId) {
                      window.location.href = `review-detail.html?id=${reviewId}`;
                  } else {
                      alert("리뷰 정보를 불러오는 데 실패했습니다.");
                  }
              });
          });

      } catch (error) {
          console.error("리뷰 불러오기 오류:", error);
      }
  }

  // ✅ 연관 추천 도서 가져오기
  async function loadRecommendations() {
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/recommendation/naver/?query={책제목}${isbn}`);
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
