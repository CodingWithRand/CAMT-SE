function showGlassToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `glass-toast ${type === "error" ? "toast-error" : ""}`;

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="font-size: 1.2rem;">${type === "error" ? "⚠️" : "✅"}</div>
      <div style="font-family: system-ui, sans-serif;">
        <p style="margin: 0; font-size: 0.85rem; font-weight: 600;">${message}</p>
      </div>
    </div>
    <div class="toast-progress ${type === "error" ? "progress-error" : ""}"></div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    requestAnimationFrame(() => toast.classList.add("toast-hidden"));
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);

  // 1️⃣ Server-driven (preferred)
  if (urlParams.has("success")) {
    const msg = urlParams.get("msg") || "Success!";
    showGlassToast(msg, "success");
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  if (urlParams.has("login")) {
    showGlassToast("Successfully logged in!", "success");
    localStorage.removeItem("realmNotification");
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  if (urlParams.has("error")) {
    const msg = urlParams.get("msg") || "Something went wrong.";
    showGlassToast(msg, "error");
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  // 2️⃣ LocalStorage fallback (like admin)
  const stored = localStorage.getItem("clientNotification");
  if (stored) {
    showGlassToast(stored, "success");
    localStorage.removeItem("clientNotification");
  }
});

// Optional pre-navigation messages (safe)
// This is not need. The code become redundant as it displays to the user twice. (After they refresh the page)
// document.addEventListener("click", (e) => {
//   const addBtn = e.target.closest(
//     'form[action*="/customer/cart/add/"] button[type="submit"]'
//   );

//   if (addBtn) {
//     localStorage.setItem("clientNotification", "Adding to cart...");
//     return;
//   }

//   const payBtn = e.target.closest(
//     'form[action="/customer/checkout"] button[type="submit"]'
//   );

//   if (payBtn) {
//     if (payBtn.hasAttribute("disabled")) return;
//     localStorage.setItem("clientNotification", "Processing payment...");
//   }
// });