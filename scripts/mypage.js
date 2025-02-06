document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username-input");
    const saveUsernameBtn = document.getElementById("save-username");
    const userEmail = document.getElementById("user-email");
    const passwordInput = document.getElementById("password-input");
    const savePasswordBtn = document.getElementById("save-password");
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");
    const commentList = document.getElementById("comment-list");

    // 사용자 정보 불러오기
    usernameInput.value = localStorage.getItem("username") || "닉네임";
    userEmail.textContent = localStorage.getItem("email") || "hicc@example.com";

    // 닉네임 변경
    saveUsernameBtn.addEventListener("click", async () => {
        const newUsername = usernameInput.value.trim();
        if (!newUsername) return alert("닉네임을 입력하세요.");

        await fetch("/users/update-profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: newUsername })
        });
        localStorage.setItem("username", newUsername);
        alert("닉네임 변경 완료!");
    });

    // 목표 설정
    setGoalBtn.addEventListener("click", async () => {
        const goal = parseInt(goalInput.value);
        if (!goal) return alert("올바른 목표를 입력하세요.");

        await fetch("/users/set-goal", { method: "POST", body: JSON.stringify({ goal }) });
        localStorage.setItem("readingGoal", goal);
        alert("목표가 저장되었습니다!");
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("username-input");
    const saveUsernameBtn = document.getElementById("save-username");
    const userEmail = document.getElementById("user-email");
    const commentList = document.getElementById("comment-list");

    // ✅ LocalStorage에서 사용자 정보 불러오기
    usernameDisplay.value = localStorage.getItem("username") || "닉네임";
    userEmail.textContent = localStorage.getItem("email") || "hicc@example.com";

    // 닉네임 수정 버튼 클릭 이벤트
    saveUsernameBtn.addEventListener("click", async () => {
        const newUsername = usernameDisplay.value.trim();
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
                // ✅ 서버 업데이트 성공 → LocalStorage 갱신
                localStorage.setItem("username", newUsername);
                alert("닉네임이 변경되었습니다!");
            } else {
                alert(data.error || "닉네임 변경 실패");
            }
        } catch (error) {
            console.error("닉네임 변경 오류:", error);
            alert("서버 오류가 발생했습니다.");
        }
    });

    // ✅ 목표 설정
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");
    const goalProgress = document.getElementById("goal-progress");
    const progressText = document.getElementById("progress-text");

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

    // ✅ 댓글 불러오기
    fetch("/users/comments", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
    .then(response => response.json())
    .then(data => {
        commentList.innerHTML = data.comments.map(comment => `
            <li>${comment.text} <span>${comment.date}</span></li>
        `).join("");
    })
    .catch(error => console.error("댓글 불러오기 오류:", error));
});

document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("username-display");
    const userEmail = document.getElementById("user-email");
    const commentList = document.getElementById("comment-list");
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");

    // 사용자 정보 불러오기
    usernameDisplay.textContent = localStorage.getItem("username") || "닉네임";

    // 목표 설정 버튼 클릭 이벤트
    setGoalBtn.addEventListener("click", async () => {
        const goal = parseInt(goalInput.value);
        if (isNaN(goal) || goal <= 0) {
            alert("올바른 목표 독서량을 입력하세요.");
            return;
        }

        try {
            await fetch("/users/set-goal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ goal })
            });

            localStorage.setItem("readingGoal", goal);
            alert("목표가 설정되었습니다!");
        } catch (error) {
            console.error("목표 설정 오류:", error);
            alert("서버 오류가 발생했습니다.");
        }
    });

    // 댓글 불러오기 및 무한 스크롤
    let page = 1;
    function loadComments() {
        fetch(`/users/comments?page=${page}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
        .then(response => response.json())
        .then(data => {
            data.comments.forEach(comment => {
                const li = document.createElement("li");
                li.innerHTML = `${comment.text} <span>${comment.date}</span>`;
                commentList.appendChild(li);
            });
            page++;
        })
        .catch(error => console.error("댓글 불러오기 오류:", error));
    }

    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
            loadComments();
        }
    });

    loadComments();
});

document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("username-display");
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");
    const commentList = document.getElementById("comment-list");

    // ✅ 사용자 정보 불러오기
    const storedUsername = localStorage.getItem("username") || "닉네임";
    usernameDisplay.textContent = storedUsername;
    document.getElementById("user-email").value = localStorage.getItem("user_email") || "hicc@example.com";

    // ✅ 목표 설정 버튼 클릭
    setGoalBtn.addEventListener("click", async () => {
        const goal = parseInt(goalInput.value);
        if (isNaN(goal) || goal <= 0) {
            alert("유효한 목표 수를 입력하세요.");
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

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("readingGoal", goal);
                alert("목표가 설정되었습니다!");
            } else {
                alert(data.error || "목표 설정 실패");
            }
        } catch (error) {
            console.error("목표 설정 오류:", error);
            alert("서버 오류가 발생했습니다.");
        }
    });

    // ✅ 작성 댓글 불러오기 (무한 스크롤)
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
