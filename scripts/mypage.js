document.addEventListener("DOMContentLoaded", () => {
  const goalInput = document.getElementById("goal-input");
  const setGoalBtn = document.querySelector(".set-goal-btn");
  const goalProgress = document.getElementById("goal-progress");
  const progressText = document.getElementById("progress-text");

  // 목표 설정 버튼 클릭
  setGoalBtn.addEventListener("click", () => {
      const goal = parseInt(goalInput.value);
      if (isNaN(goal) || goal <= 0) {
          alert("유효한 목표 수를 입력하세요.");
          return;
      }

      localStorage.setItem("readingGoal", goal);
      localStorage.setItem("booksRead", 0);
      updateProgress();
  });

  // 진행 상황 업데이트
  function updateProgress() {
      const goal = parseInt(localStorage.getItem("readingGoal")) || 100;
      const booksRead = parseInt(localStorage.getItem("booksRead")) || 0;

      goalProgress.max = goal;
      goalProgress.value = booksRead;
      progressText.textContent = `${booksRead} / ${goal}권`;
  }

  updateProgress();
});
