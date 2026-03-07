// public/js/client/index.js
document.addEventListener("DOMContentLoaded", () => {
  const isStorePage =
    window.location.pathname === "/customer" ||
    window.location.pathname === "/customer/";

  if (!isStorePage) return;

  const categoryButtons = document.querySelectorAll(".category-button");
  const productCards = document.querySelectorAll(".product-card");

  function applyFilter(selectedPlatform, clickedButton) {
    categoryButtons.forEach((btn) => btn.classList.remove("active"));
    if (clickedButton) clickedButton.classList.add("active");

    localStorage.setItem(
      "clientCurrentProductSelectedCategory",
      selectedPlatform
    );

    productCards.forEach((card) => {
      if(card.classList.contains("no-game-found")) return;
      const cardPlatforms = (card.getAttribute("data-platform") || "").toLowerCase();
      const match =
        selectedPlatform === "all" ||
        cardPlatforms.includes(String(selectedPlatform).toLowerCase());

      card.style.display = match ? "flex" : "none";
    });
  }

  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selectedPlatform = btn.getAttribute("data-category") || "all";
      applyFilter(selectedPlatform, e.currentTarget);
    });
  });

  const saved =
    localStorage.getItem("clientCurrentProductSelectedCategory") || "all";
  const savedBtn = document.querySelector(
    `.category-button[data-category="${saved}"]`
  );
  applyFilter(saved, savedBtn || null);
});