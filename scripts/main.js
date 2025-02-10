document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const recentBooksContainer = document.getElementById("recent-books-container");
    const goalTarget = document.getElementById("goal-target");
    const goalProgress = document.getElementById("goal-progress");
    const logoutBtn = document.getElementById("logout-btn");

    // ✅ 최신 리뷰가 달린 도서 불러오기
    async function loadRecentBooks() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/book/recent-reviews/");
            if (!response.ok) throw new Error("최근 도서를 불러오지 못했습니다.");

            const books = await response.json();
            if (books.length === 0) {
                recentBooksContainer.innerHTML = "<p>최근 리뷰가 달린 도서가 없습니다.</p>";
                return;
            }

            // ✅ 최대 6권만 표시 (3x2 레이아웃)
            let bookHTML = books.slice(0, 6).map(book => {
                return `
                    <div class="book-card" onclick="location.href='book-detail.html?isbn=${book.isbn}'">
                        <img src="${book.image_url}" alt="${book.title}" class="book-cover">
                        <p class="book-title">${book.title}</p>
                        <p class="book-author">${book.author}</p>
                    </div>
                `;
            }).join("");

            recentBooksContainer.innerHTML = bookHTML;
        } catch (error) {
            console.error("최근 도서 불러오기 오류:", error);
            recentBooksContainer.innerHTML = "<p>데이터를 불러오는 중 오류가 발생했습니다.</p>";
        }
    }

    // ✅ 독서 목표 데이터 불러오기
    async function loadGoalProgress() {
        if (!token) {
            goalTarget.textContent = "-";
            goalProgress.textContent = "-";
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/goal/progress/", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("목표 데이터를 가져오는 데 실패했습니다.");

            const data = await response.json();
            const goal = data.goal_books || 10; // 기본 목표 10권
            const progress = data.read_books || 0;

            goalTarget.textContent = `${goal}권`;
            goalProgress.textContent = `${progress}권`;

            // ✅ 목표 진행률 차트 생성
            const ctx1 = document.getElementById("goalChart").getContext("2d");
            new Chart(ctx1, {
                type: "bar",
                data: {
                    labels: ["올해 목표 권 수", "현재 읽은 권 수"],
                    datasets: [{
                        label: "독서 목표 진행률",
                        data: [goal, progress],
                        backgroundColor: ["#6366f1", "#ef4444"]
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, max: goal }
                    }
                }
            });

        } catch (error) {
            console.error("목표 데이터 로드 오류:", error);
        }
    }

    // ✅ 초기 데이터 로드
    loadRecentBooks();
    loadGoalProgress();
});
