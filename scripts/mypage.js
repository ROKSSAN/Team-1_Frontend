document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("username-display");
    const usernameInput = document.getElementById("username-input");
    const saveUsernameBtn = document.getElementById("save-username");
    const userEmail = document.getElementById("user-email");
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");
    const commentList = document.getElementById("comment-list");

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.html"; // 로그인 안 했으면 이동
        return;
    }

    // ✅ 사용자 정보 불러오기
    async function loadUserInfo() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/user/me/", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("사용자 정보 불러오기 실패");
            
            const user = await response.json();
            usernameDisplay.textContent = user.nickname;
            userEmail.value = user.email;
            localStorage.setItem("username", user.nickname);
            localStorage.setItem("user_email", user.email);
        } catch (error) {
            console.error("사용자 정보 오류:", error);
        }
    }

    loadUserInfo();

    // ✅ 닉네임 변경
    saveUsernameBtn.addEventListener("click", async () => {
        const newUsername = usernameInput.value.trim();
        if (!newUsername) {
            alert("닉네임을 입력하세요.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/user/update-profile/", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ nickname: newUsername })
            });

            if (!response.ok) throw new Error("닉네임 변경 실패");

            localStorage.setItem("username", newUsername);
            usernameDisplay.textContent = newUsername;
            alert("닉네임이 변경되었습니다!");
        } catch (error) {
            console.error("닉네임 변경 오류:", error);
            alert("서버 오류가 발생했습니다.");
        }
    });

    // ✅ 독서 목표 설정
    setGoalBtn.addEventListener("click", async () => {
        const goal = parseInt(goalInput.value);
        if (isNaN(goal) || goal <= 0) {
            alert("올바른 목표를 입력하세요.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/goal/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ total_books: goal })
            });

            if (!response.ok) throw new Error("목표 설정 실패");

            localStorage.setItem("readingGoal", goal);
            alert("목표가 설정되었습니다!");
        } catch (error) {
            console.error("목표 설정 오류:", error);
        }
    });

    // ✅ 댓글 불러오기 (Infinite Scroll)
    let page = 1;
    const reviewId = 1; // 예시: 특정 리뷰 ID, 실제로는 동적으로 변경

    async function loadComments() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/comments/list/?page=${page}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("댓글 불러오기 실패");

            const data = await response.json();
            if (data.length > 0) {
                commentList.innerHTML += data.map(comment => `
                    <li>${comment.content} <span>${comment.created_at}</span></li>
                `).join("");
                page++;
            }
        } catch (error) {
            console.error("댓글 불러오기 오류:", error);
        }
    }

    loadComments();

    commentList.addEventListener("scroll", () => {
        if (commentList.scrollTop + commentList.clientHeight >= commentList.scrollHeight - 50) {
            loadComments();
        }
    });
});
