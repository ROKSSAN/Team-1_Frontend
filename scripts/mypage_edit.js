let currentImage = 0;
const images = [
    "../assets/images/profile_image.svg",
    "../assets/images/profile_image1.svg",
    "../assets/images/profile_image2.svg",
    "../assets/images/profile_image3.svg",
    "../assets/images/profile_image4.svg",
    "../assets/images/profile_image5.svg"
];

const profileImage = document.getElementById("profile-image");
const prevButton = document.getElementById("prev-profile");
const nextButton = document.getElementById("next-profile");
const nicknameInput = document.getElementById("user-nickname");
const passwordInput = document.getElementById("user-password");
const saveButton = document.getElementById("save-profile");

// ✅ **로컬 스토리지에서 Access Token 가져오기**
const accessToken = localStorage.getItem("token");

if (!accessToken) {
    alert("로그인이 필요합니다.");
    window.location.href = "index.html";  // 로그인 페이지로 리디렉트
}

// ✅ **회원 정보 조회 API 호출 (초기 데이터 로드)**
fetch('http://127.0.0.1:8000/api/user/me/', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
})
.then(response => response.json())
.then(data => {
    if (data) {
        nicknameInput.value = data.nickname;

        // API 응답값을 ../assets 경로로 변환
        const profileImgPath = `../assets/images/${data.profile_image.split('/').pop()}`;
        profileImage.src = profileImgPath;

        currentImage = images.indexOf(profileImgPath) !== -1 ? images.indexOf(profileImgPath) : 0;
    }
})
.catch(error => {
    console.error("Error fetching user data:", error);
});

// ✅ **프로필 이미지 변경 기능**
prevButton.addEventListener("click", () => {
    currentImage = (currentImage - 1 + images.length) % images.length;
    profileImage.src = images[currentImage];
});

nextButton.addEventListener("click", () => {
    currentImage = (currentImage + 1) % images.length;
    profileImage.src = images[currentImage];
});

// ✅ **프로필 업데이트 요청 (이미지 + 닉네임 + 비밀번호)**
saveButton.addEventListener("click", async () => {
    const nickname = nicknameInput.value.trim(); // 닉네임 공백 제거
    const password = passwordInput.value.trim(); // 비밀번호 공백 제거
    const profileImageSrc = profileImage.src.split('/').pop(); // 파일명만 추출

    // ✅ 로컬 경로 -> 서버 경로 변환
    const profileImageMap = {
        "profile_image.svg": "profile_images/profile_image.svg",
        "profile_image1.svg": "profile_images/profile_image1.svg",
        "profile_image2.svg": "profile_images/profile_image2.svg",
        "profile_image3.svg": "profile_images/profile_image3.svg",
        "profile_image4.svg": "profile_images/profile_image4.svg",
        "profile_image5.svg": "profile_images/profile_image5.svg",
    };

    const serverProfileImage = profileImageMap[profileImageSrc] || `profile_images/${profileImageSrc}`;

    try {
        // ✅ 변경된 값만 API에 전송
        const requestBody = {};
        if (nickname) requestBody.nickname = nickname;
        if (password) requestBody.password = password;
        if (serverProfileImage) requestBody.profile_image = serverProfileImage;

        const response = await fetch('http://127.0.0.1:8000/api/user/update_profile/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`프로필 업데이트 실패: ${response.status}`);

        const data = await response.json();

        if (data.message === "Profile updated successfully.") {
            alert("프로필이 성공적으로 업데이트되었습니다.");
            window.location.href = "mypage.html"; // ✅ 저장 후 마이페이지로 이동
        }

    } catch (error) {
        console.error("프로필 업데이트 중 오류:", error);
        alert("프로필 업데이트 중 오류가 발생했습니다.");
    }
});
