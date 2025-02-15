document.addEventListener("DOMContentLoaded", async () => {
    const baseUrl = "http://127.0.0.1:8000/"; // ✅ baseUrl 전역 변수 설정
    const usernameDisplay = document.getElementById("username-display");
    const userEmail = document.getElementById("user-email");
    const goalInput = document.getElementById("goal-input");
    const setGoalBtn = document.querySelector(".set-goal-btn");
    const profileImage = document.querySelector(".profile-picture img");
    const editIcon = document.querySelector(".edit-icon");

    const token = localStorage.getItem("token");
    let goalId = null;

    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = "index.html"; 
        return;
    }

    // ✅ 사용자 정보 불러오기
    async function loadUserInfo() {
        try {
            const response = await fetch(`${baseUrl}api/user/me/`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("사용자 정보 불러오기 실패");

            const user = await response.json();
            usernameDisplay.textContent = user.nickname;
            userEmail.value = user.email;

            // ✅ 프로필 이미지 처리 (null 방지 및 경로 보정)
            console.log("프로필 이미지 URL:", user.profile_image);
            profileImage.src = user.profile_image 
                ? `${baseUrl}${user.profile_image}` 
                : "../assets/images/profile_image.svg";
        } catch (error) {
            console.error("사용자 정보 오류:", error);
        }
    }

    // ✅ 목표 정보 가져오기
    async function loadGoalData() {
        try {
            const response = await fetch(`${baseUrl}api/goal/goal/`, {
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
            const requestConfig = {
                method: goalId ? "PUT" : "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ total_books: goal })
            };

            const url = goalId 
                ? `${baseUrl}api/goal/goal/${goalId}/`
                : `${baseUrl}api/goal/goal/`;

            const response = await fetch(url, requestConfig);
            if (!response.ok) throw new Error("목표 설정 실패");

            alert("목표가 저장되었습니다!");
            loadGoalData();
        } catch (error) {
            console.error("목표 설정 오류:", error);
        }
    });

    // ✅ 프로필 수정 페이지 이동
    if (editIcon) {
        editIcon.addEventListener("click", () => {
            window.location.href = "mypage_edit.html";
        });
    }

    // ✅ 최초 데이터 로드
    await loadUserInfo();
    await loadGoalData();
});

