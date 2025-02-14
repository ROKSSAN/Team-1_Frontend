document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const reviewId = params.get("id");
    let isbn = params.get("isbn");
    let token = localStorage.getItem("token");

    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = "index.html";
        return;
    }

    // isbn이나 reviewId 중 하나는 반드시 있어야 함
    if (!isbn && !reviewId) {
        alert("잘못된 접근입니다.");
        window.location.href = "main.html";
        return;
    }

    // DOM 요소 가져오기
    const bookTitle = document.getElementById("book-title");
    const bookImage = document.getElementById("book-image");
    const reviewAuthorImage = document.getElementById("review-author-image");
    const reviewAuthor = document.getElementById("review-author");
    const reviewDate = document.getElementById("review-date");
    const ratingValue = document.getElementById("rating-value");
    const reviewTextElement = document.getElementById("review-text");
    const stars = document.querySelectorAll(".star");
    const publishReviewButton = document.getElementById("publish-review");
    const saveReviewButton = document.getElementById("save-rating");

    let selectedRating = 0;
    let currentReviewData = null;

    try {
        // 사용자 정보 불러오기
        const userResponse = await fetch("http://127.0.0.1:8000/api/user/me/", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!userResponse.ok) {
            throw new Error("사용자 정보를 불러올 수 없습니다.");
        }

        const user = await userResponse.json();
        if (reviewAuthorImage) {
            reviewAuthorImage.src = `http://127.0.0.1:8000/api/user/profile/${user.nickname}`;
            reviewAuthorImage.onerror = () => { reviewAuthorImage.src = "../assets/images/profile_image.svg"; };
        }
        if (reviewAuthor) reviewAuthor.textContent = user.nickname;
        if (reviewDate) reviewDate.textContent = formatDate(new Date());

        // 수정 모드인 경우 기존 리뷰 데이터 불러오기
        if (reviewId) {
            const reviewResponse = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!reviewResponse.ok) {
                throw new Error("리뷰 데이터를 불러올 수 없습니다.");
            }

            currentReviewData = await reviewResponse.json();
            console.log("✅ 불러온 리뷰 데이터:", currentReviewData);

            // 기존 데이터로 폼 초기화
            if (reviewTextElement) reviewTextElement.value = currentReviewData.content;
            if (currentReviewData.rating) {
                selectedRating = currentReviewData.rating;
                updateStarsUI(selectedRating);
            }

            // ISBN 설정 (수정 모드에서는 리뷰 데이터의 ISBN 사용)
            isbn = currentReviewData.isbn;
        }

        // ISBN이 있으면 책 정보 불러오기
        if (isbn) {
            console.log("✅ 책 정보 불러오기 시작 - ISBN:", isbn);
            const bookResponse = await fetch(`http://127.0.0.1:8000/api/book/isbn/${isbn}/`);
            if (!bookResponse.ok) throw new Error("책 정보를 불러올 수 없습니다.");
            const book = await bookResponse.json();
            console.log("✅ 불러온 책 정보:", book);

            if (bookTitle) bookTitle.textContent = book.title;
            if (bookImage) {
                bookImage.src = book.image_url || "../assets/images/no_image.png";
                bookImage.onerror = () => { bookImage.src = "../assets/images/no_image.png"; };
                bookImage.style.cursor = "pointer";
                bookImage.addEventListener("click", () => {
                    window.location.href = `book-detail.html?isbn=${isbn}`;
                });
            }
        }

    } catch (error) {
        console.error("🚨 데이터 불러오기 오류:", error);
    }

    // 별점 기능 추가
    stars.forEach((star, index) => {
        star.addEventListener("mousemove", (event) => updateStars(event, star, index));
        star.addEventListener("click", (event) => {
            selectedRating = getStarRating(event, star, index);
            updateStarsUI(selectedRating);
        });
        star.addEventListener("mouseleave", () => updateStarsUI(selectedRating));
    });

    function updateStars(event, star, index) {
        const hoverRating = getStarRating(event, star, index);
        updateStarsUI(hoverRating);
    }

    function getStarRating(event, star, index) {
        const mouseX = event.clientX - star.getBoundingClientRect().left;
        return mouseX < star.clientWidth / 2 ? index + 0.5 : index + 1;
    }

    function updateStarsUI(rating) {
        stars.forEach((star, index) => {
            if (star) {
                star.src = (index + 1 <= rating) ? "../assets/images/full_star.svg" :
                    (index + 0.5 === rating) ? "../assets/images/half_star.svg" :
                    "../assets/images/empty_star.svg";
            }
        });
        if (ratingValue) ratingValue.textContent = `${rating.toFixed(1)}점`;
    }

    // 리뷰 발행/수정 (POST/PUT)
    if (publishReviewButton) {
        publishReviewButton.textContent = reviewId ? "수정" : "발행";
        publishReviewButton.addEventListener("click", async () => {
            const content = reviewTextElement.value.trim();
            if (!content) {
                alert("리뷰 내용을 입력해주세요.");
                return;
            }

            const requestBody = { isbn, content, rating: selectedRating };
            const url = reviewId ? 
                `http://127.0.0.1:8000/api/review/${reviewId}/` :
                "http://127.0.0.1:8000/api/review/";

            const method = reviewId ? "PUT" : "POST";

            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestBody)
                });

                const responseData = await response.json();
                console.log("📢 서버 응답 데이터:", responseData);

                if (!response.ok) throw new Error(responseData.detail || "리뷰 처리 실패");

                const successMessage = reviewId ? "리뷰가 수정되었습니다." : "리뷰가 발행되었습니다.";
                alert(successMessage);

                // 리뷰 상세 페이지로 이동
                const targetReviewId = reviewId || responseData.id;
                window.location.href = `review-detail.html?id=${targetReviewId}`;
            } catch (error) {
                console.error("🚨 리뷰 처리 오류:", error);
                alert(reviewId ? "리뷰 수정 중 오류가 발생했습니다." : "리뷰 발행 중 오류가 발생했습니다.");
            }
        });
    }

    // 별점 저장 기능
    if (saveReviewButton) {
        // 수정 모드에서는 버튼 숨기기
        saveReviewButton.style.display = reviewId ? "none" : "block";

        // 버튼이 보이는 경우(새 리뷰 작성)에만 이벤트 리스너 추가
        if (!reviewId) {
            saveReviewButton.addEventListener("click", async () => {
                if (!token) {
                    alert("로그인이 필요합니다.");
                    window.location.href = "index.html";
                    return;
                }

                const lastReviewId = localStorage.getItem("last_review_id");
                if (!lastReviewId) {
                    alert("먼저 리뷰를 작성해주세요.");
                    return;
                }

                if (selectedRating === 0) {
                    alert("별점을 선택해주세요.");
                    return;
                }

                const requestBody = { rating: selectedRating };
                console.log("📢 별점 저장 요청 데이터:", requestBody);

                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/review/${lastReviewId}/`, {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(requestBody)
                    });

                    const responseData = await response.json();
                    console.log("📢 서버 응답 데이터:", responseData);

                    if (!response.ok) throw new Error(responseData.detail || "별점 저장 실패");

                    alert("별점이 성공적으로 저장되었습니다.");
                    window.location.href = `review-detail.html?id=${lastReviewId}`;
                } catch (error) {
                    console.error("🚨 별점 저장 오류:", error);
                    alert("별점 저장 중 오류가 발생했습니다.");
                }
            });
        }
    }
});

function formatDate(date) {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}