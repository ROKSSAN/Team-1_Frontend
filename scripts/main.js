document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    // ✅ 로그인 여부 확인
  /// if (!token) {
     //   window.location.href = "login.html"; // 로그인 페이지로 이동
     //   return;
  //  } 

    try {
        // 📚 최신 리뷰된 도서 목록 가져오기
        const response = await fetch("http://127.0.0.1:8000/api/book/recent-reviews/", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("도서 목록을 불러오는 데 실패했습니다.");
        }

        const books = await response.json();
        const bestsellerContainer = document.getElementById("bestseller-books");

        // 📌 최신 리뷰가 달린 6개 도서 표시
        bestsellerContainer.innerHTML = books.slice(0, 6).map(book => `
            <div class="book-item">
                <img src="${book.image_url}" alt="${book.title}">
                <p>${book.title}</p>
            </div>
        `).join("");

    } catch (error) {
        console.error("도서 목록 불러오기 실패", error);
    }

    // ✅ 로그아웃 버튼 이벤트 리스너 추가
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token"); // JWT 토큰 삭제
            localStorage.removeItem("username"); // 사용자 정보 삭제
            localStorage.removeItem("nickname");
            window.location.href = "login.html"; // 로그인 페이지로 이동
        });
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        document.getElementById("goal-target").textContent = "-";
        document.getElementById("goal-progress").textContent = "-";
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/goal/progress/", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("목표 데이터를 가져오는 데 실패했습니다.");
        }

        const data = await response.json();
        const goal = data.goal_books || 10; // 기본 목표 10권
        const progress = data.read_books || 0;

        document.getElementById("goal-target").textContent = `${goal}권`;
        document.getElementById("goal-progress").textContent = `${progress}권`;

        // ✅ Chart.js로 그래프 생성
        const ctx = document.getElementById("goalChart").getContext("2d");
        new Chart(ctx, {
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
});
