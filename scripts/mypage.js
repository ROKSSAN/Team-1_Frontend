document.addEventListener("DOMContentLoaded", async () => {
    const usernameDisplay = document.getElementById("username-display");
    const usernameInput = document.getElementById("username-input");
    const saveUsernameBtn = document.getElementById("save-username");
    const userEmail = document.getElementById("user-email");
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");
    const commentList = document.getElementById("comment-list");

    const token = localStorage.getItem("token");
    let goalId = null; // 목표 ID 저장

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

    // ✅ 목표 정보 가져오기
    async function loadGoalData() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/goal/progress/", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("목표 데이터를 가져오는 데 실패했습니다.");

            const data = await response.json();

            if (data.goal_books) {
                goalId = data.goal_id; // 기존 목표 ID 저장
                goalInput.value = data.goal_books;
            }
        } catch (error) {
            console.error("목표 데이터를 불러오는 중 오류 발생:", error);
        }
    }

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

    // ✅ 목표 설정 및 수정 (POST 또는 PUT)
    setGoalBtn.addEventListener("click", async () => {
        const goal = parseInt(goalInput.value);
        if (isNaN(goal) || goal <= 0) {
            alert("올바른 목표를 입력하세요.");
            return;
        }

        try {
            let response;
            if (goalId) {
                // 기존 목표가 있으면 PUT 요청
                response = await fetch(`http://127.0.0.1:8000/api/goal/goal/${goalId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ total_books: goal })
                });
            } else {
                // 목표가 없으면 POST 요청
                response = await fetch("http://127.0.0.1:8000/api/goal/goal/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ total_books: goal })
                });
            }

            if (!response.ok) throw new Error("목표 설정 실패");

            alert("목표가 저장되었습니다!");
            loadGoalData(); // 목표 갱신
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

    commentList.addEventListener("scroll", () => {
        if (commentList.scrollTop + commentList.clientHeight >= commentList.scrollHeight - 50) {
            loadComments();
        }
    });

    // ✅ 최초 데이터 로드
    loadUserInfo();
    loadGoalData();
    loadComments();
});

