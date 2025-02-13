document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const reviewId = params.get("id");

  if (!reviewId) {
      alert("잘못된 접근입니다.");
      window.location.href = "main.html";
      return;
  }

  const reviewTitle = document.getElementById("review-title");
  const reviewAuthor = document.getElementById("review-author");
  const reviewAuthorImage = document.getElementById("review-author-image");
  const reviewDate = document.getElementById("review-date");
  const reviewText = document.getElementById("review-text");
  const reviewLikes = document.getElementById("review-likes");
  const heartIcon = document.getElementById("heart-icon");
  const bookImage = document.getElementById("book-image");
  const bookTitle = document.getElementById("book-title");
  const reviewRating = document.getElementById("review-rating");

  try {
      /** ✅ 1. 리뷰 데이터 불러오기 */
      const reviewResponse = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/?nocache=${new Date().getTime()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          cache: "no-store"
      });

      if (!reviewResponse.ok) throw new Error("리뷰 정보를 불러올 수 없습니다.");
      
      const responseText = await reviewResponse.text();
      console.log("API 응답 (리뷰):", responseText); // 🔍 응답 확인
      const review = JSON.parse(responseText);

      reviewTitle.textContent = review.title;
      reviewAuthor.textContent = review.user_nickname;
      reviewDate.textContent = formatDate(review.created_at);
      reviewText.textContent = review.content;
      reviewLikes.textContent = review.likes_count;

      /** ✅ 2. 작성자 프로필 이미지 가져오기 */
      const userProfileResponse = await fetch(`http://127.0.0.1:8000/api/user/profile/${review.user_nickname}/`);
      if (userProfileResponse.ok) {
          const userProfile = await userProfileResponse.json();
          reviewAuthorImage.src = userProfile.profile_image;
      } else {
          console.warn("작성자 프로필 이미지를 불러오지 못함");
      }

      /** ✅ 3. 책 정보 불러오기 */
      const bookResponse = await fetch(`http://127.0.0.1:8000/api/book/isbn/${review.isbn}/?nocache=${new Date().getTime()}`);
      if (!bookResponse.ok) throw new Error("책 정보를 불러올 수 없습니다.");
      
      const book = await bookResponse.json();
      bookImage.src = book.image_url;
      bookTitle.textContent = book.title;
      bookImage.style.cursor = "pointer";
      bookImage.addEventListener("click", () => {
          window.location.href = `book-detail.html?isbn=${review.isbn}`;
      });

      /** ✅ 4. 별점 정보 가져오기 */
      const starsResponse = await fetch("http://127.0.0.1:8000/api/review/stars/");
      if (starsResponse.ok) {
          const stars = await starsResponse.json();
          reviewRating.innerHTML = generateStars(review.rating, stars);
      } else {
          console.warn("별점 정보를 불러오지 못함");
      }

      /** ✅ 5. 좋아요(하트) 아이콘 처리 */
      const heartResponse = await fetch("http://127.0.0.1:8000/api/review/hearts/");
      if (!heartResponse.ok) throw new Error("하트 이미지 정보를 불러올 수 없습니다.");
      
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
      console.error("데이터 불러오기 오류:", error);
  }
});

/** ✅ 날짜 변환 함수 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${date.getMinutes()}`;
}

/** ✅ 별점 렌더링 함수 */
function generateStars(rating, stars) {
  let output = "";
  for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
          output += `<img src="${stars.full}" class="star-icon">`;
      } else if (rating >= i - 0.5) {
          output += `<img src="${stars.half}" class="star-icon">`;
      } else {
          output += `<img src="${stars.empty}" class="star-icon">`;
      }
  }
  return output;
}
