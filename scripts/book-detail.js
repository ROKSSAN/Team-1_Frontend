document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ DOMContentLoaded 이벤트 발생");

  const bookImage = document.getElementById("book-image");
  const bookTitle = document.getElementById("book-title");
  const bookAuthor = document.getElementById("book-author");
  const bookPublisher = document.getElementById("book-publisher");
  const bookLink = document.getElementById("book-link"); 
  const reviewsList = document.getElementById("reviews-list");
  const recommendationsList = document.getElementById("recommendation-grid"); 

  const params = new URLSearchParams(window.location.search);
  const isbn = params.get("isbn");

  if (!isbn) {
      alert("잘못된 접근입니다.");
      window.location.href = "main.html";
      return;
  }

  let bookUrl = `https://search.shopping.naver.com/book/catalog/${isbn}`; 

  // ✅ 책 정보 가져오기
  async function loadBookDetails() {
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/book/isbn/${isbn}/`);
          if (!response.ok) throw new Error("책 정보를 불러올 수 없습니다.");

          const book = await response.json();
          bookImage.src = book.image_url;
          bookTitle.textContent = book.title;
          bookAuthor.textContent = `${book.author} / ${book.translator || "번역 없음"}`;
          bookPublisher.textContent = `${book.publisher} / ${book.published_date}`;

          if (book.link) {
              bookUrl = book.link;
          }

          bookLink.style.display = "inline-block";
          bookLink.addEventListener("click", (event) => {
              event.preventDefault();
              window.open(bookUrl, "_blank");
          });

          console.log("📚 추천 도서 검색어:", book.title);
          loadRecommendations(book.title);

      } catch (error) {
          console.error("책 정보 오류:", error);
      }
  }

  // ✅ 특정 책의 최신 리뷰 목록 가져오기
  async function loadReviews() {
      try {
          const token = localStorage.getItem("token");
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
                  <div class="review-card" data-review-id="${review.review_id}">
                      <p><strong>${review.user}</strong>: ${review.content}</p>
                      <p>⭐ ${review.rating} / 5</p>
                      <p class="review-date">${review.created_at}</p>
                  </div>
              `).join("")
              : "<p>아직 리뷰가 없습니다.</p>";

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

  // ✅ 연관 추천 도서 가져오기 (책 제목 사용)
  async function loadRecommendations(title) {
      if (!recommendationsList) {
          console.error("❌ 추천 도서를 표시할 recommendation-grid 요소가 없습니다.");
          return;
      }

      // ✅ 추천 도서 공간 레이아웃 유지
      recommendationsList.style.display = "grid";
      recommendationsList.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 1fr))";
      recommendationsList.style.gap = "15px";
      recommendationsList.style.minHeight = "200px"; 

      // ✅ 검색어 최적화 (책 제목이 길 경우 자동으로 줄이기)
      function shortenTitle(title, maxLength = 6) {
          if (title.length <= maxLength) return title; 
          const words = title.split(" "); 
          let shortenedTitle = "";

          for (let word of words) {
              if ((shortenedTitle + " " + word).trim().length <= maxLength) {
                  shortenedTitle += (shortenedTitle ? " " : "") + word;
              } else {
                  break;
              }
          }
          return shortenedTitle || title.substring(0, maxLength); 
      }

      const searchQuery = shortenTitle(title);
      console.log("🔍 최종 검색어:", searchQuery);

      try {
          const response = await fetch(`http://127.0.0.1:8000/api/recommendation/naver/?query=${encodeURIComponent(searchQuery)}`);
          if (!response.ok) throw new Error("추천 도서를 불러올 수 없습니다.");

          const books = await response.json();
          console.log("📚 추천 도서 데이터:", books);

          if (books.length > 0) {
              recommendationsList.innerHTML = books.map(book => `
                  <div class="recommendation-item">
                      <a href="${book.link}" target="_blank">
                          <img src="${book.image}" alt="${book.title}">
                          <p>${book.title}</p>
                      </a>
                  </div>
              `).join("");
          } else {
              recommendationsList.innerHTML = "<p>추천할 도서가 없습니다.</p>";
              recommendationsList.style.minHeight = "200px";
          }

      } catch (error) {
          console.error("❌ 추천 도서 오류:", error);
          recommendationsList.innerHTML = "<p>추천 도서를 불러오는 중 오류가 발생했습니다.</p>";
          recommendationsList.style.minHeight = "200px";
      }
  }

  loadBookDetails();
  loadReviews();
});

document.addEventListener("DOMContentLoaded", () => {
  const writeReviewBtn = document.getElementById("write-review-btn");

  if (writeReviewBtn) {
      writeReviewBtn.addEventListener("click", () => {
          const params = new URLSearchParams(window.location.search);
          const isbn = params.get("isbn"); // 현재 페이지에서 ISBN 가져오기

          if (!isbn) {
              alert("도서 정보를 찾을 수 없습니다.");
              return;
          }

          window.location.href = `review-write.html?isbn=${isbn}`; // 리뷰 작성 페이지로 이동
      });
  }
});
