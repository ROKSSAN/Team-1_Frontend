document.addEventListener("DOMContentLoaded", async () => {
    const usernameDisplay = document.getElementById("username-display");
    const userEmail = document.getElementById("user-email");
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");
    const commentList = document.getElementById("comment-list");

    const token = localStorage.getItem("token");
    let goalId = null;

    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = "index.html"; // 로그인 페이지로 이동
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
            if (goalId) {
                response = await fetch(`http://127.0.0.1:8000/api/goal/goal/${goalId}/`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ total_books: goal })
                });
            } else {
                response = await fetch("http://127.0.0.1:8000/api/goal/goal/", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ total_books: goal })
                });
            }

            if (!response.ok) throw new Error("목표 설정 실패");

            alert("목표가 저장되었습니다!");
            loadGoalData();
        } catch (error) {
            console.error("목표 설정 오류:", error);
        }
    });

    // ✅ 댓글 불러오기
    let page = 1;
    const reviewId = 1; 

    async function loadComments() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/review/${reviewId}/comments/list/?page=${page}`, {
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
