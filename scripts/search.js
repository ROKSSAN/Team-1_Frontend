document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("book-search");
  const resultsContainer = document.getElementById("search-results");
  const searchTitle = document.getElementById("search-title");

  // ✅ 검색창에서 엔터 입력 시 검색 실행
  if (searchBar) {
      searchBar.addEventListener("keypress", (event) => {
          if (event.key === "Enter") {
              event.preventDefault();
              const query = searchBar.value.trim();
              if (query) {
                  window.location.href = `search.html?query=${encodeURIComponent(query)}`;
              }
          }
      });
  }

  // ✅ URL 파라미터에서 검색어 가져오기
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");

  if (!query) return;

  // ✅ 검색 결과 제목 업데이트
  if (searchTitle) {
      searchTitle.textContent = `"${query}" 검색 결과`;
  }

  // ✅ 도서 검색 API 호출
  async function fetchBooks() {
      try {
          const response = await fetch(`http://127.0.0.1:8000/api/book/search/?query=${encodeURIComponent(query)}`);

          if (!response.ok) throw new Error("서버 응답 오류");

          const books = await response.json();
          resultsContainer.innerHTML = "";

          if (!books || books.length === 0) {
              resultsContainer.innerHTML = "<p>검색 결과가 없습니다.</p>";
              return;
          }

          // ✅ 검색 결과 동적 생성
          books.forEach(book => {
              const bookElement = document.createElement("div");
              bookElement.classList.add("book-item");
              bookElement.innerHTML = `
                  <div class="book-cover-container" onclick="location.href='book-detail.html?isbn=${book.isbn}'">
                      <img src="${book.image_url}" alt="${book.title}" class="book-cover">
                  </div>
                  <div class="book-info">
                      <h3>${book.title}</h3>
                      <p>${book.author} / ${book.publisher} (${book.published_date})</p>
                      <a href="${book.link}" target="_blank">📖 자세히 보기</a>
                  </div>
              `;
              resultsContainer.appendChild(bookElement);
          });

      } catch (error) {
          console.error("책 검색 오류:", error);
          resultsContainer.innerHTML = "<p>검색 중 오류가 발생했습니다.</p>";
      }
  }

  fetchBooks();
});

document.addEventListener("DOMContentLoaded", async () => {
  const searchResultsContainer = document.getElementById("search-results");
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q"); // 검색어 가져오기

  if (!query) {
      searchResultsContainer.innerHTML = "<p class='no-results'>검색어를 입력해주세요.</p>";
      return;
  }

  try {
      const response = await fetch(`http://127.0.0.1:8000/api/book/search/?q=${query}`);
      if (!response.ok) throw new Error("검색 결과를 가져오는 데 실패했습니다.");

      const books = await response.json();

      if (books.length === 0) {
          searchResultsContainer.innerHTML = "<p class='no-results'>검색 결과가 없습니다.</p>";
          return;
      }

      searchResultsContainer.innerHTML = books.map(book => `
          <div class="book-card">
              <div class="book-cover-container" onclick="location.href='book-detail.html?isbn=${book.isbn}'">
                  <img src="${book.image_url}" alt="${book.title}" class="book-cover">
              </div>
              <p class="book-title">${book.title}</p>
              <p class="book-author">${book.author}</p>
          </div>
      `).join("");

  } catch (error) {
      console.error("검색 결과 불러오기 오류:", error);
      searchResultsContainer.innerHTML = "<p class='error-message'>검색 결과를 불러오는 중 오류가 발생했습니다.</p>";
  }
});
