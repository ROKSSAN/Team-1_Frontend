document.addEventListener("DOMContentLoaded", async () => {
  const reviewTitle = document.getElementById("review-title");
  const reviewAuthor = document.getElementById("review-author");
  const reviewDate = document.getElementById("review-date");
  const reviewContent = document.getElementById("review-content");
  const editBtn = document.getElementById("edit-btn");
  const deleteBtn = document.getElementById("delete-btn");

  // URL에서 리뷰 ID 가져오기
  const params = new URLSearchParams(window.location.search);
  const reviewId = params.get("id"); 

  if (!reviewId) {
      alert("잘못된 접근입니다.");
      window.location.href = "main.html";
      return;
  }

  // 로컬 스토리지에서 사용자 ID 가져오기
  const userId = localStorage.getItem("userId");  

  // 리뷰 상세 정보 가져오기
  async function loadReviewDetails() {
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/`);
          if (!response.ok) throw new Error("리뷰 정보를 불러올 수 없습니다.");

          const review = await response.json();
          
          reviewTitle.textContent = review.title;
          reviewAuthor.textContent = review.author;
          reviewDate.textContent = review.created_at;
          reviewContent.textContent = review.content;

          // 본인이 작성한 리뷰일 경우 수정/삭제 버튼 표시
          if (userId && userId === String(review.author_id)) {
              editBtn.style.display = "inline-block";
              deleteBtn.style.display = "inline-block";
          }
      } catch (error) {
          console.error("리뷰 상세 오류:", error);
          alert("리뷰 정보를 불러오는 데 실패했습니다.");
      }
  }

  // 삭제 버튼 클릭 이벤트
  deleteBtn.addEventListener("click", async () => {
      if (!confirm("정말 삭제하시겠습니까?")) return;

      try {
          const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" }
          });

          if (!response.ok) throw new Error("리뷰 삭제 실패");
          alert("리뷰가 삭제되었습니다.");
          window.location.href = "main.html"; // 삭제 후 메인 페이지로 이동
      } catch (error) {
          console.error("리뷰 삭제 오류:", error);
          alert("리뷰 삭제에 실패했습니다.");
      }
  });

  // 리뷰 정보 불러오기
  loadReviewDetails();
});
