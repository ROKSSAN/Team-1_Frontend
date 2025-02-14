document.addEventListener("DOMContentLoaded", async () => {
    console.log("✅ DOMContentLoaded 이벤트 발생");

    const params = new URLSearchParams(window.location.search);
    const reviewId = params.get("id");
    const token = localStorage.getItem("token") || null;
    const username = localStorage.getItem("username") || "로그인 필요";
    let currentUser = null;

    // HTML 요소 참조
    const reviewAuthor = document.getElementById("review-author");
    const reviewAuthorImage = document.getElementById("review-author-image");
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
    const userProfile = document.getElementById("user-profile");

    let isLiked = false;
    let likesCount = 0;

    // 초기에 수정/삭제 버튼 숨기기
    if (editButton) editButton.style.display = "none";
    if (deleteButton) deleteButton.style.display = "none";

    if (!reviewId) {
        alert("잘못된 접근입니다.");
        window.location.href = "main.html";
        return;
    }

    // 현재 로그인한 사용자 정보 가져오기
    if (token) {
        try {
            const userResponse = await fetch("http://127.0.0.1:8000/api/user/me/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (userResponse.ok) {
                currentUser = await userResponse.json();
                console.log("✅ 현재 로그인한 사용자:", currentUser);

                // 댓글 입력창에 사용자 정보 표시
                if (commentUsername) commentUsername.textContent = currentUser.nickname;
                if (userProfile) {
                    userProfile.src = `http://127.0.0.1:8000/api/user/profile/${currentUser.nickname}/`;
                    userProfile.onerror = () => {
                        userProfile.src = "/assets/images/profile_image.svg";
                    };
                }
            }
        } catch (error) {
            console.error("🚨 사용자 정보 불러오기 오류:", error);
        }
    }

    try {
        // 리뷰 데이터 불러오기
        const reviewResponse = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/`);
        if (!reviewResponse.ok) throw new Error("리뷰 데이터를 불러올 수 없습니다.");

        const review = await reviewResponse.json();
        console.log("✅ 리뷰 데이터:", review);

        // 리뷰 작성자와 현재 사용자가 같은지 확인
        const isAuthor = currentUser && currentUser.nickname === review.user_nickname;

        // 수정/삭제 버튼 표시 및 이벤트 처리
        if (isAuthor) {
            if (editButton) {
                editButton.style.display = "inline-block";
                editButton.addEventListener("click", () => {
                    window.location.href = `review-write.html?id=${reviewId}`;
                });
            }

            if (deleteButton) {
                deleteButton.style.display = "inline-block";
                deleteButton.addEventListener("click", async () => {
                    if (!confirm("정말 삭제하시겠습니까?")) return;

                    try {
                        const deleteResponse = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/`, {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });

                        if (deleteResponse.ok) {
                            alert("리뷰가 삭제되었습니다.");
                            window.location.href = "library.html";
                        } else {
                            const errorData = await deleteResponse.json();
                            throw new Error(errorData.detail || "리뷰 삭제 실패");
                        }
                    } catch (error) {
                        console.error("🚨 리뷰 삭제 오류:", error);
                        alert(error.message);
                    }
                });
            }
        }

        // 리뷰 정보 표시
        if (reviewAuthor) reviewAuthor.textContent = review.user_nickname;
        if (reviewAuthorImage) {
            reviewAuthorImage.src = `http://127.0.0.1:8000/api/user/profile/${review.user_nickname}/`;
            reviewAuthorImage.onerror = () => {
                reviewAuthorImage.src = "/assets/images/profile_image.svg";
            };
        }

        if (reviewDate) reviewDate.textContent = formatDate(review.created_at);
        if (reviewText) reviewText.textContent = review.content;
        likesCount = review.likes_count;
        if (reviewLikes) reviewLikes.textContent = likesCount;
        if (ratingValue) ratingValue.textContent = review.rating.toFixed(1);

        // 별점 시각화
        if (reviewRating) reviewRating.innerHTML = generateStars(review.rating);

        // 좋아요 상태 확인
        if (token && heartIcon) {
            try {
                const likedResponse = await fetch("http://127.0.0.1:8000/api/review/liked/", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (likedResponse.ok) {
                    const likedReviews = await likedResponse.json();
                    isLiked = likedReviews.some(item => item.review_id === review.id);
                    heartIcon.src = `/assets/images/${isLiked ? 'full' : 'empty'}_heart.svg`;
                }
            } catch (error) {
                console.error("🚨 좋아요 상태 확인 오류:", error);
            }
        }

        // 좋아요 토글 이벤트
        if (heartIcon && token) {
            heartIcon.addEventListener("click", async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/like/`, {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    if (!response.ok) throw new Error("좋아요 처리 실패");

                    const data = await response.json();
                    isLiked = data.message === "Like added";
                    likesCount = data.likes_count;

                    heartIcon.src = `/assets/images/${isLiked ? 'full' : 'empty'}_heart.svg`;
                    if (reviewLikes) reviewLikes.textContent = likesCount;
                } catch (error) {
                    console.error("🚨 좋아요 처리 오류:", error);
                    alert("좋아요 처리 중 오류가 발생했습니다.");
                }
            });
        }

        // 책 정보 불러오기
        if (bookImage && bookTitle) {
            const bookResponse = await fetch(`http://127.0.0.1:8000/api/book/isbn/${review.isbn}/`);
            if (bookResponse.ok) {
                const book = await bookResponse.json();
                bookImage.src = book.image_url;
                bookTitle.textContent = book.title;

                bookImage.addEventListener("click", () => {
                    window.location.href = `book-detail.html?isbn=${review.isbn}`;
                });
            } else {
                bookTitle.textContent = "책 정보를 찾을 수 없습니다.";
                bookImage.src = "/assets/images/no_image.png";
            }
        }

        // 댓글 로드
        loadComments();

    } catch (error) {
        console.error("🚨 데이터 불러오기 오류:", error);
        alert("리뷰를 불러오는 중 오류가 발생했습니다.");
    }

    // 댓글 입력 처리
    if (commentInput) {
        commentInput.addEventListener("keypress", async (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                await submitComment();
            }
        });
    }

    async function loadComments() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/comments/list/`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const comments = await response.json();
            if (commentList) {
                commentList.innerHTML = comments.map(comment => `
                    <li class="comment-item">
                        <div class="comment-content">
                            <img src="http://127.0.0.1:8000/api/user/profile/${comment.user_nickname}/"
                                 alt="프로필" class="comment-profile"
                                 onerror="this.src='/assets/images/profile_image.svg'">
                            <div class="comment-info">
                                <span class="comment-author">${comment.user_nickname}</span>
                                <span class="comment-text">${comment.content}</span>
                            </div>
                            ${currentUser && currentUser.nickname === comment.user_nickname ? `
                               
                            ` : ''}
                        </div>
                    </li>
                `).join('');

                // 삭제 버튼에 이벤트 리스너 추가
                document.querySelectorAll('.delete-comment').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        if (!confirm('댓글을 삭제하시겠습니까?')) return;

                        const commentId = e.target.dataset.commentId;
                        try {
                            const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/comments/`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ comment_id: commentId })
                            });

                            if (response.ok) {
                                await loadComments();
                            } else {
                                const errorText = await response.text();
                                throw new Error(errorText);
                            }
                        } catch (error) {
                            console.error('🚨 댓글 삭제 오류:', error);
                            alert('댓글 삭제 중 오류가 발생했습니다.');
                        }
                    });
                });
            }
        } catch (error) {
            console.error("🚨 댓글 불러오기 오류:", error);
            if (commentList) {
                commentList.innerHTML = '<li class="comment-error">댓글을 불러오는 중 오류가 발생했습니다.</li>';
            }
        }
    }

    async function submitComment() {
        const content = commentInput.value.trim();
        if (!content) return;

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
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            commentInput.value = "";
            await loadComments();
        } catch (error) {
            console.error("🚨 댓글 등록 오류:", error);
            alert("댓글 등록 중 오류가 발생했습니다.");
        }
    }
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function generateStars(rating) {
    return [...Array(5)].map((_, i) => {
        let starType;
        const difference = rating - i;

        if (difference >= 1) starType = "full_star";
        else if (difference > 0) starType = "half_star";
        else starType = "empty_star";

        return `<img src="/assets/images/${starType}.svg" alt="별점" class="star-icon">`;
    }).join('');
}