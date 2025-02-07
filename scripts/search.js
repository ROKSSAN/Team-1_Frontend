document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("book-search");

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
});

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");
  const resultsContainer = document.getElementById("search-results");

  if (query) {
      document.getElementById("search-title").textContent = `"${query}" 검색 결과`;

      try {
          const response = await fetch(`http://127.0.0.1:8000/book/search/?query=${encodeURIComponent(query)}`);
          const books = await response.json();

          resultsContainer.innerHTML = "";

          if (!books || books.length === 0) {
              resultsContainer.innerHTML = "<p>검색 결과가 없습니다.</p>";
              return;
          }

          books.forEach(book => {
              const bookElement = document.createElement("div");
              bookElement.classList.add("book-item");
              bookElement.innerHTML = `
                  <img src="${book.image_url}" alt="${book.title}">
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
});
