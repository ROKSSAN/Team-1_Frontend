document.addEventListener("DOMContentLoaded", () => {
  const goalInput = document.getElementById("yearly-goal");
  const saveGoalBtn = document.getElementById("save-goal");
  const goalTarget = document.getElementById("goal-target");
  const goalProgress = document.getElementById("goal-progress");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");

  // ✅ 서버에서 목표 데이터 가져오기
  function loadGoalData() {
      fetch("/users/goal", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      })
      .then(response => response.json())
      .then(data => {
          if (data.goal) {
              localStorage.setItem("goal", data.goal);
              goalTarget.textContent = `${data.goal} 권`;
              progressBar.max = data.goal;
          }
          if (data.progress) {
              localStorage.setItem("progress", data.progress);
              goalProgress.textContent = `${data.progress} 권`;
              progressBar.value = data.progress;
              updateProgressText();
          }
      })
      .catch(error => console.error("목표 데이터를 불러오는 중 오류 발생:", error));
  }

  // ✅ 목표 저장 버튼 클릭 시
  saveGoalBtn.addEventListener("click", async () => {
      const newGoal = parseInt(goalInput.value.trim(), 10);
      if (!newGoal || newGoal < 1) {
          alert("올바른 독서 목표 수를 입력하세요.");
          return;
      }

      try {
          const response = await fetch("/users/goal", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`
              },
              body: JSON.stringify({ goal: newGoal })
          });

          const data = await response.json();

          if (response.ok) {
              // ✅ 서버에 저장 성공 → LocalStorage 갱신
              localStorage.setItem("goal", newGoal);
              goalTarget.textContent = `${newGoal} 권`;
              progressBar.max = newGoal;
              updateProgressText();
              alert("목표가 저장되었습니다!");
          } else {
              alert(data.error || "목표 설정 실패");
          }
      } catch (error) {
          console.error("목표 저장 오류:", error);
          alert("서버 오류가 발생했습니다.");
      }
  });

  // ✅ 목표 달성률 업데이트
  function updateProgressText() {
      const progress = parseInt(localStorage.getItem("progress") || "0", 10);
      const goal = parseInt(localStorage.getItem("goal") || "1", 10);
      const percentage = Math.round((progress / goal) * 100);
      progressText.textContent = `${percentage}% 달성`;
  }

  // ✅ 페이지 로드 시 목표 데이터 불러오기
  loadGoalData();
});
