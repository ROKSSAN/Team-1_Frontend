document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ DOMContentLoaded 이벤트 발생");

  const params = new URLSearchParams(window.location.search);
  const reviewId = params.get("id");

  if (!reviewId) {
      alert("잘못된 접근입니다.");
      window.location.href = "main.html";
      return;
  }

  // 🎯 HTML 요소 가져오기
  const reviewAuthor = document.getElementById("review-author");
  const reviewDate = document.getElementById("review-date");
  const reviewText = document.getElementById("review-text");
  const reviewLikes = document.getElementById("review-likes");
  const heartIcon = document.getElementById("heart-icon");
  const bookImage = document.getElementById("book-image");
  const bookTitle = document.getElementById("book-title");
  const reviewRating = document.getElementById("review-rating");
  const ratingValue = document.getElementById("rating-value"); // 별점 값 표시

  try {
      /** ✅ 1. `localStorage`에서 책 정보 불러오기 */
      const storedBook = JSON.parse(localStorage.getItem("currentBook"));
      if (storedBook) {
          console.log("✅ localStorage에서 책 정보 불러오기 성공:", storedBook);
          bookImage.src = storedBook.image_url;
          bookTitle.textContent = storedBook.title;
          bookImage.style.cursor = "pointer";
          bookImage.addEventListener("click", () => {
              window.location.href = `book-detail.html?isbn=${storedBook.isbn}`;
          });
      }

      /** ✅ 2. 리뷰 데이터 불러오기 */
      const reviewResponse = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/?nocache=${new Date().getTime()}`);
      if (!reviewResponse.ok) throw new Error("리뷰 데이터를 불러올 수 없습니다.");

      const review = await reviewResponse.json();
      console.log("✅ API 응답 (리뷰 데이터):", review);

      reviewAuthor.textContent = review.user_nickname;
      reviewDate.textContent = formatDate(review.created_at);
      reviewText.textContent = review.content;
      reviewLikes.textContent = review.likes_count;
      ratingValue.textContent = review.rating.toFixed(1); // 별점 숫자 표시

      /** ✅ 3. 별점 데이터 가져오기 */
      const starsResponse = await fetch("http://127.0.0.1:8000/api/review/stars/");
      if (starsResponse.ok) {
          const stars = await starsResponse.json();
          reviewRating.innerHTML = generateStars(review.rating, stars);
      } else {
          console.warn("⚠️ 별점 데이터를 불러오지 못했습니다.");
      }

      /** ✅ 4. 좋아요(하트) 버튼 설정 */
      const heartResponse = await fetch("http://127.0.0.1:8000/api/review/hearts/");
      if (!heartResponse.ok) throw new Error("하트 이미지 데이터를 불러올 수 없습니다.");

      const heartData = await heartResponse.json();
      let isLiked = review.is_liked;
      heartIcon.src = isLiked ? heartData.full : heartData.empty;

      heartIcon.addEventListener("click", async () => {
          isLiked = !isLiked;
          heartIcon.src = isLiked ? heartData.full : heartData.empty;
          reviewLikes.textContent = isLiked ? parseInt(reviewLikes.textContent) + 1 : parseInt(reviewLikes.textContent) - 1;

          await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/like/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" }
          });
      });

  } catch (error) {
      console.error("🚨 데이터 불러오기 오류:", error);
  }
});

/** ✅ 날짜 변환 함수 */
function formatDate(dateString) {
  if (!dateString) return "날짜 없음";
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${date.getMinutes()}`;
}

/** ✅ 별점 렌더링 함수 */
function generateStars(rating) {
  let output = "";
  for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
          output += `<img src="images/full_star.svg" class="star-icon">`;
      } else if (rating >= i - 0.5) {
          output += `<img src="images/half_star.svg" class="star-icon">`;
      } else {
          output += `<img src="images/empty_star.svg" class="star-icon">`;
      }
  }
  return output;
}

heartIcon.addEventListener("click", () => {
  isLiked = !isLiked;
  heartIcon.src = isLiked ? "images/full_heart.svg" : "images/empty_heart.svg";
  reviewLikes.textContent = isLiked ? parseInt(reviewLikes.textContent) + 1 : parseInt(reviewLikes.textContent) - 1;
});

