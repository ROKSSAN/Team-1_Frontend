document.addEventListener("DOMContentLoaded", async () => {
    const usernameDisplay = document.getElementById("username-display");
    const userEmail = document.getElementById("user-email");
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");
    const commentList = document.getElementById("comment-list");
    const bookGrid = document.getElementById("book-grid");
    const userLibraryTitle = document.getElementById("user-library-title");

    const token = localStorage.getItem("token");
    let goalId = null;
    let page = 1;
    let isFetching = false;
    let commentPage = 1;
    const reviewId = 1;

    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = "index.html"; 
        return;
    }

    // ✅ 사용자 정보 불러오기
    async function loadUserInfo() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/user/me/", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("사용자 정보 불러오기 실패");

            const user = await response.json();
            usernameDisplay.textContent = user.nickname;
            userEmail.value = user.email;
            userLibraryTitle.textContent = `${user.nickname}의 서재`; 
        } catch (error) {
            console.error("사용자 정보 오류:", error);
        }
    }

    // ✅ 목표 정보 가져오기
    async function loadGoalData() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/goal/goal/", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("목표 데이터를 가져오는 데 실패했습니다.");

            const data = await response.json();

            if (data.length > 0) {
                goalId = data[0].id;
                goalInput.value = data[0].total_books;
            }
        } catch (error) {
            console.error("목표 데이터를 불러오는 중 오류 발생:", error);
        }
    }

    // ✅ 목표 설정 및 수정
    setGoalBtn.addEventListener("click", async () => {
        const goal = parseInt(goalInput.value);
        if (isNaN(goal) || goal <= 0) {
            alert("올바른 목표를 입력하세요.");
            return;
        }

        try {
            let response;
            const requestConfig = {
                method: goalId ? "PUT" : "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ total_books: goal })
            };

            const url = goalId 
                ? `http://127.0.0.1:8000/api/goal/goal/${goalId}/`
                : "http://127.0.0.1:8000/api/goal/goal/";

            response = await fetch(url, requestConfig);
            if (!response.ok) throw new Error("목표 설정 실패");

            alert("목표가 저장되었습니다!");
            loadGoalData();
        } catch (error) {
            console.error("목표 설정 오류:", error);
        }
    });

    // ✅ 댓글 불러오기 (무한 스크롤 지원)
    async function loadComments() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/comments/list/?page=${commentPage}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("댓글 불러오기 실패");

            const data = await response.json();
            if (data.length > 0) {
                commentList.innerHTML += data.map(comment => `
                    <li>${comment.content} <span>${comment.created_at}</span></li>
                `).join("");
                commentPage++;
            }
        } catch (error) {
            console.error("댓글 불러오기 오류:", error);
        }
    }

    // ✅ 댓글 무한 스크롤 이벤트
    commentList.addEventListener("scroll", () => {
        if (commentList.scrollTop + commentList.clientHeight >= commentList.scrollHeight - 50) {
            loadComments();
        }
    });

    // ✅ 내 서재 도서 불러오기 (무한 스크롤 지원)
    async function loadBooks() {
        if (isFetching) return;
        isFetching = true;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/library/books/?page=${page}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("도서를 불러오는 데 실패했습니다.");

            const books = await response.json();

            if (books.length === 0 && page === 1) {
                bookGrid.innerHTML = "<p class='no-books'>리뷰를 남겨 도서를 추가해보세요!</p>";
                return;
            }

            books.forEach(book => {
                const bookElement = document.createElement("div");
                bookElement.classList.add("book-card");
                bookElement.innerHTML = `
                    <div class="book-cover-container">
                        <img src="${book.image_url}" alt="${book.title}" class="book-cover">
                    </div>
                    <div class="book-info">
                        <p class="book-title">${book.title} <span class="book-rating">⭐ ${book.rating.toFixed(1)}</span></p>
                        <p class="book-author">${book.author}</p>
                        <p class="book-review">${book.content}</p>
                    </div>
                `;

                bookElement.addEventListener("click", () => {
                    location.href = `book-detail.html?isbn=${book.isbn}`;
                });

                bookGrid.appendChild(bookElement);
            });

            page++;
            isFetching = false;
        } catch (error) {
            console.error("책 목록 불러오기 오류:", error);
        }
    }

    // ✅ 무한 스크롤 이벤트 리스너 (최적화)
    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            loadBooks();
        }
    });

    // ✅ 최초 데이터 로드
    loadUserInfo();
    loadGoalData();
    loadComments();
    loadBooks();
});
