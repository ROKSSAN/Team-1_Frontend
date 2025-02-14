document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ DOMContentLoaded 이벤트 발생");

  const params = new URLSearchParams(window.location.search);
  const reviewId = params.get("id");
  const token = localStorage.getItem("token") || null;
  const username = localStorage.getItem("username") || "로그인 필요"; // ✅ undefined 방지

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
  const ratingValue = document.getElementById("rating-value");
  const editButton = document.getElementById("edit-button");
  const deleteButton = document.getElementById("delete-button");
  const commentInput = document.getElementById("comment-input");
  const commentList = document.getElementById("comment-list");
  const commentUsername = document.getElementById("comment-username");

  // ✅ 로그인한 사용자 닉네임 설정
  if (commentUsername) {
      commentUsername.textContent = username;
  }

  let isLiked = false;
  let likesCount = 0;
  let isProcessing = false;

  try {
      /** ✅ 1. 리뷰 데이터 불러오기 */
      const reviewResponse = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/`);
      if (!reviewResponse.ok) throw new Error("리뷰 데이터를 불러올 수 없습니다.");

      const review = await reviewResponse.json();
      console.log("✅ API 응답 (리뷰 데이터):", review);

      reviewAuthor.textContent = review.user_nickname;
      reviewDate.textContent = formatDate(review.created_at);
      reviewText.textContent = review.content;
      likesCount = review.likes_count;
      reviewLikes.textContent = likesCount;
      ratingValue.textContent = review.rating.toFixed(1);

      // ⭐ 별점 시각화
      reviewRating.innerHTML = generateStars(review.rating);

      /** ✅ 2. 사용자가 작성한 리뷰인지 확인 (수정/삭제 버튼 노출) */
      if (token) {
          const userReviewResponse = await fetch(`http://127.0.0.1:8000/api/review/library/`, {
              headers: { "Authorization": `Bearer ${token}` }
          });

          if (userReviewResponse.ok) {
              const userReviews = await userReviewResponse.json();
              const isUserReview = userReviews.some(r => r.id === review.id);

              if (isUserReview) {
                  editButton.style.display = "inline-block";
                  deleteButton.style.display = "inline-block";

                  // ✅ 수정 버튼 클릭 시 review-write 페이지로 이동
                  editButton.addEventListener("click", () => {
                      localStorage.setItem("editReview", JSON.stringify(review));
                      window.location.href = `review-write.html?id=${reviewId}`;
                  });

                  // ✅ 삭제 버튼 클릭 시 삭제 요청
                  deleteButton.addEventListener("click", async () => {
                      if (!confirm("정말 삭제하시겠습니까?")) return;

                      const deleteResponse = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/`, {
                          method: "DELETE",
                          headers: { "Authorization": `Bearer ${token}` }
                      });

                      if (deleteResponse.ok) {
                          alert("리뷰가 삭제되었습니다.");
                          window.location.href = "library.html";
                      } else {
                          alert("리뷰 삭제 실패");
                      }
                  });
              }
          }
      }

      /** ✅ 3. ISBN을 이용하여 책 정보 불러오기 */
      const bookResponse = await fetch(`http://127.0.0.1:8000/api/book/isbn/${review.isbn}/`);
      if (bookResponse.ok) {
          const book = await bookResponse.json();
          bookImage.src = book.image_url;
          bookTitle.textContent = book.title;

          // ✅ 책 표지 클릭 시 상세 페이지 이동
          bookImage.style.cursor = "pointer";
          bookImage.addEventListener("click", () => {
              window.location.href = `book-detail.html?isbn=${review.isbn}`;
          });
      } else {
          bookTitle.textContent = "책 정보를 찾을 수 없습니다.";
          bookImage.src = "../assets/images/no_image.png";
      }

      /** ✅ 4. 기존 댓글 불러오기 */
      loadComments();

  } catch (error) {
      console.error("🚨 데이터 불러오기 오류:", error);
  }

  /** ✅ 5. Enter 키로 댓글 추가 기능 */
  commentInput.addEventListener("keypress", async (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          await submitComment();
      }
  });

  /** ✅ 댓글 불러오기 */
  async function loadComments() {
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/comments/list/`, {
              headers: token ? { "Authorization": `Bearer ${token}` } : {}
          });

          if (!response.ok) throw new Error("댓글을 불러올 수 없습니다.");

          const comments = await response.json();
          commentList.innerHTML = comments.map(comment => `
              <li class="comment-item">
                  <img src="../assets/images/profile_1.png" alt="사용자 프로필" class="comment-profile">
                  <span class="comment-author">${comment.user_nickname}</span>
                  <span class="comment-text">${comment.content}</span>
              </li>
          `).join("");
      } catch (error) {
          console.error("🚨 댓글 불러오기 오류:", error);
      }
  }

  /** ✅ 댓글 등록 함수 */
  async function submitComment() {
      const commentText = commentInput.value.trim();
      if (!commentText) return;

      if (!token) {
          alert("로그인이 필요합니다.");
          return;
      }

      try {
          const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/comments/`, {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ content: commentText })
          });

          if (!response.ok) throw new Error("댓글 등록 실패");

          const newComment = await response.json();
          console.log("✅ 댓글 등록 성공:", newComment);

          // ✅ 댓글 리스트에 추가
          addCommentToList(newComment);
          commentInput.value = "";
      } catch (error) {
          console.error("🚨 댓글 등록 오류:", error);
          alert("댓글 등록 중 오류가 발생했습니다.");
      }
  }

  /** ✅ 댓글 리스트에 추가하는 함수 */
  function addCommentToList(comment) {
      const li = document.createElement("li");
      li.classList.add("comment-item");
      li.innerHTML = `
          <img src="../assets/images/profile_1.png" alt="사용자 프로필" class="comment-profile">
          <span class="comment-author">${comment.user_nickname}</span>
          <span class="comment-text">${comment.content}</span>
      `;
      commentList.prepend(li);
  }
});

/** ✅ 날짜 변환 함수 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

/** ✅ 별점 렌더링 함수 */
function generateStars(rating) {
  return [...Array(5)].map((_, i) => 
      `<img src="../assets/images/${rating > i ? (rating >= i + 1 ? "full" : "half") : "empty"}_star.svg" class="star-icon">`
  ).join("");
}

/** ✅ 좋아요 버튼 기능 */
async function toggleLike() {
  if (!token) {
      alert("로그인이 필요합니다.");
      return;
  }

  if (isProcessing) return;
  isProcessing = true;

  try {
      const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/like/`, {
          method: isLiked ? "DELETE" : "POST",
          headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("좋아요 처리 실패");

      isLiked = !isLiked;
      likesCount += isLiked ? 1 : -1;
      reviewLikes.textContent = likesCount;
      heartIcon.src = isLiked ? "../assets/images/full_heart.svg" : "../assets/images/empty_heart.svg";
      localStorage.setItem(`liked_review_${reviewId}`, isLiked);
  } catch (error) {
      console.error("🚨 좋아요 처리 오류:", error);
      alert("좋아요 기능에 오류가 발생했습니다.");
  } finally {
      isProcessing = false;
  }
}

/** ✅ 기존 좋아요 상태 확인 */
async function loadLikeStatus() {
  if (!token) return;

  try {
      const response = await fetch(`http://127.0.0.1:8000/api/review/liked/`, {
          headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("좋아요 상태 불러오기 실패");

      const likedReviews = await response.json();
      isLiked = likedReviews.some(review => review.review_id === parseInt(reviewId));

      heartIcon.src = isLiked ? "../assets/images/full_heart.svg" : "../assets/images/empty_heart.svg";
  } catch (error) {
      console.error("🚨 좋아요 상태 불러오기 오류:", error);
  }
}

// ✅ 이벤트 리스너 추가
heartIcon.addEventListener("click", toggleLike);

// ✅ 좋아요 상태 로드
loadLikeStatus();
