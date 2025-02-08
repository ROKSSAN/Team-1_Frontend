document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const goalTarget = document.getElementById("goal-target");
  const goalProgress = document.getElementById("goal-progress");

  let goalId = null; // 목표 ID 저장 변수

  if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "index.html";
      return;
  }

  try {
      // ✅ 목표 데이터 가져오기
      const response = await fetch("http://127.0.0.1:8000/api/goal/progress/", {
          headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("목표 데이터를 가져오는 데 실패했습니다.");
      const data = await response.json();

      if (data.goal_books) {
          goalId = data.goal_id; // 기존 목표 ID 저장
          goalTarget.textContent = `${data.goal_books} 권`;
      }

      if (data.read_books) {
          goalProgress.textContent = `${data.read_books} 권`;
      }

      // 📊 목표 달성률 차트
      const ctx1 = document.getElementById("goalChart").getContext("2d");
      new Chart(ctx1, {
          type: "bar",
          data: {
              labels: ["올해 목표 권 수", "현재 읽은 권 수"],
              datasets: [{
                  label: "독서 목표 진행률",
                  data: [data.goal_books || 10, data.read_books || 0],
                  backgroundColor: ["#6366f1", "#ef4444"]
              }]
          },
          options: {
              scales: {
                  y: { beginAtZero: true, max: data.goal_books || 10 }
              }
          }
      });

      // 📊 월별 독서량 차트
      const monthlyResponse = await fetch("http://127.0.0.1:8000/api/goal/monthly-progress/", {
          headers: { "Authorization": `Bearer ${token}` }
      });

      if (!monthlyResponse.ok) throw new Error("월별 독서 데이터를 가져오는 데 실패했습니다.");
      const monthlyData = await monthlyResponse.json();

      // ✅ 월별 독서량 데이터 가공 (2025-01 → 1월 형식 변환)
      const monthlyReading = monthlyData.monthly_reading || {};
      const labels = [];
      const values = [];

      Object.entries(monthlyReading).forEach(([key, value]) => {
          const month = key.split("-")[1].replace(/^0/, ""); // "2025-01" → "1"
          labels.push(`${month}월`);
          values.push(value);
      });

      // 📊 월별 독서량 차트
      const ctx2 = document.getElementById("monthlyChart").getContext("2d");
      new Chart(ctx2, {
          type: "bar",
          data: {
              labels: labels,
              datasets: [{
                  label: "월별 독서량",
                  data: values,
                  backgroundColor: "#4f46e5"
              }]
          },
          options: {
              scales: {
                  y: { beginAtZero: true, max: Math.max(...values) + 2 }
              }
          }
      });

  } catch (error) {
      console.error("목표 데이터 로드 오류:", error);
  }
});
