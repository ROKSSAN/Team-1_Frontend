document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("username-display");
    const usernameInput = document.getElementById("username-input");
    const saveUsernameBtn = document.getElementById("save-username");
    const userEmail = document.getElementById("user-email");
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");
    const commentList = document.getElementById("comment-list");
    
    // ✅ Load user data from localStorage
    usernameDisplay.textContent = localStorage.getItem("username") || "닉네임";
    userEmail.value = localStorage.getItem("user_email") || "hicc@example.com";
    goalInput.value = localStorage.getItem("readingGoal") || "";

    // ✅ Update nickname
    saveUsernameBtn.addEventListener("click", async () => {
        const newUsername = usernameInput.value.trim();
        if (!newUsername) {
            alert("닉네임을 입력하세요.");
            return;
        }

        try {
            const response = await fetch("/users/update-profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ username: newUsername })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("username", newUsername);
                usernameDisplay.textContent = newUsername;
                alert("닉네임이 변경되었습니다!");
            } else {
                alert(data.error || "닉네임 변경 실패");
            }
        } catch (error) {
            console.error("닉네임 변경 오류:", error);
            alert("서버 오류가 발생했습니다.");
        }
    });

    // ✅ Set reading goal
    setGoalBtn.addEventListener("click", async () => {
        const goal = parseInt(goalInput.value);
        if (isNaN(goal) || goal <= 0) {
            alert("올바른 목표를 입력하세요.");
            return;
        }

        try {
            const response = await fetch("/users/set-goal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ goal })
            });

            if (response.ok) {
                localStorage.setItem("readingGoal", goal);
                alert("목표가 설정되었습니다!");
            }
        } catch (error) {
            console.error("목표 설정 오류:", error);
        }
    });

    // ✅ Load comments with infinite scroll
    let page = 1;
    async function loadComments() {
        try {
            const response = await fetch(`/users/comments?page=${page}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();

            if (response.ok && data.comments.length > 0) {
                commentList.innerHTML += data.comments.map(comment => `
                    <li>${comment.text} <span>${comment.date}</span></li>
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
