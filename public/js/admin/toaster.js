function showGlassToast(message, type = "success") {
  const toast = document.createElement("div");

  // Apply the base class AND a type class
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

  // Timing logic (matches your 1.5s fast speed)
  setTimeout(() => {
    requestAnimationFrame(() => {
      toast.classList.add("toast-hidden");
    });
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 1500);
}

// Logic to check localStorage on load
window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);

  // 1. URL-driven success messages
  if (urlParams.has("success")) {
    const action = urlParams.get("action");
    let msg = "Changes Saved!";

    if (action === "add") msg = "Successfully added the game to the list!";
    if (action === "delete") msg = "Successfully deleted the item!";

    showGlassToast(msg);

    // Clean up the URL so it doesn't show again on refresh
    localStorage.removeItem("realmNotification");
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  // for invalid form submits
  if (urlParams.has("error")) {
    // Call your toast function with a red/error theme
    showGlassToast(`Invalid Data: ${urlParams.get("error")}`, "error");
    
    // Clean URL
    localStorage.removeItem("realmNotification");
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  if (urlParams.has("q")) {
    showGlassToast(`Login failed: ${urlParams.get("q")}`, "error");
    localStorage.removeItem("realmNotification");
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  // 2. localStorage-driven messages (used for form submits + deletes)
  const stored = localStorage.getItem("realmNotification");
  if (stored) {
    showGlassToast(stored, "success");
    localStorage.removeItem("realmNotification");
  }
});

// Logic to capture the button click
document.addEventListener("click", (e) => {
  // 1. Handle FORM Buttons (Add / Save)
  const btn = e.target.closest('button[type="submit"]:not(.exception)');
  if (btn) {
    const form = btn.closest("form");

    if (form && form.checkValidity()) {
      const val = btn.innerText.toLowerCase();
      let text = "Changes Saved!"; // Default

      // If it's your Add form, it likely has "Add" in the button text
      if (
        val.includes("add") ||
        val.includes("create") ||
        val.includes("new")
      ) {
        text = "Successfully added the game to the list!";
      } else if (val.includes("login")) {
        text = "Successfully logged in!"
      }

      localStorage.setItem("realmNotification", text);
    }
    return;
  }

  // 2. Handle DELETE Links (The Trash Icon)
  // This looks for any <a> tag that has "/delete/" in the URL
  const deleteLink = e.target.closest('a[href*="/delete/"]');
  if (deleteLink) {
    // Optional: Add a confirmation so they don't misclick
    const confirmed = confirm("Are you sure you want to delete this item?");

    if (!confirmed) {
      e.preventDefault(); // Stop the deletion if they click 'Cancel'
      return;
    }

    localStorage.setItem(
      "realmNotification",
      "Successfully deleted the item!"
    );
  }
  
});