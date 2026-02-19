document.querySelector(".book-search form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const res = await fetch("/books/search", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ bookName: e.target.bookName.value })
  });
  const searchedbooks = await res.json();
  const el = document.getElementById("book-list");
  el.innerHTML = searchedbooks.map(b => `<div>${b.bookNo}.${b.bookName}</div>`).join("");
})