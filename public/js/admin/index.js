document.querySelectorAll(".status-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const status = button.getAttribute("data-status");

    // Get all checked checkboxes
    const selectedCheckboxes = document.querySelectorAll(
      ".order-checkbox:checked",
    );
    const orderIds = Array.from(selectedCheckboxes).map((cb) => cb.value);

    if (orderIds.length === 0) {
      return alert("Please select at least one order.");
    }
    // 2. CONFIRMATION GATE: Only pops up if status is 'delete'
    if (status === "delete") {
      const confirmed = confirm(
        `Are you sure you want to delete ${orderIds.length} order(s)?`,
      );
      if (!confirmed) return; // Exit function if they click 'Cancel'
    }

    // Send the data to the server
    const response = await fetch("/admin/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds, status }),
    });

    if (response.ok) {
      window.location.reload(); // Refresh to show new statuses
    } else {
      alert("Failed to update orders.");
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const categoryButtons = document.querySelectorAll(".category-button");
  const productCards = document.querySelectorAll(".product-card");

  function cb(e = undefined) {
    // console.log(localStorage.getItem("adminCurrentProductSelectedCategory"));
    const c =
      localStorage.getItem("adminCurrentProductSelectedCategory") || "all";
    let button;
    if (!e)
      button = document.querySelector(`.category-button[data-category=${c}]`);
    else button = e.target;
    // 1. Manage Active Class UI
    categoryButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // 2. Get the filter value
    const selectedPlatform = button.getAttribute("data-category");
    localStorage.setItem(
      "adminCurrentProductSelectedCategory",
      selectedPlatform,
    );

    // 3. Filter the cards
    productCards.forEach((card) => {
      // Get platform from the data attribute we added in step 1
      const cardPlatforms = card.getAttribute("data-platform");

      if (
        selectedPlatform === "all" ||
        cardPlatforms.includes(selectedPlatform)
      ) {
        card.style.display = "flex"; // Show
      } else {
        card.style.display = "none"; // Hide
      }
    });
  }

  if (window.location.pathname.includes("/admin")) {
    categoryButtons.forEach((button) => button.addEventListener("click", cb));
    cb();
  } else if (window.location.pathname.includes("/admin/orders")) {
    document.querySelectorAll(".status-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".status-button")
          .forEach((btn) => btn.classList.remove("active"));
        btn.classList.add("active");
        const selectedStatus = btn.getAttribute("data-order-status");
        document.querySelectorAll(".order-card").forEach((order) => {
          const cardStatus = order.getAttribute("data-status");
          if (selectedStatus === "all" || cardStatus === selectedStatus) {
            order.style.display = "grid";
          } else {
            order.style.display = "none";
          }
        });
      });
    });
    document.getElementById("select_all").addEventListener("click", (e) => {
      const isSelectedAll = e.target.checked;
      const checkboxes = document.querySelectorAll(".order-checkbox");
      checkboxes.forEach((c) => {
        c.checked = isSelectedAll;
      });
    });
  }
});

// I commented below. We have to discuss how we want to do the search.
// Search without click the button is good, but we already have the button, so that eliminate the need for button.
// Do we still want to have the search button? If no, we can go with the code below and remove the search button.

// const searchInput = document.querySelector("#search-order");
// const orderCards = document.querySelectorAll(".order-card");

// searchInput.addEventListener("input", (e) => {
//   const query = e.target.value.toLowerCase();

//   orderCards.forEach((card) => {
//     // Grab the text from your EJS-rendered spans
//     const orderId = card.querySelector(".order-number").innerText.toLowerCase();
//     const userName = card
//       .querySelector(".customer-name")
//       .innerText.toLowerCase();

//     // Check if the query exists in either field
//     if (orderId.includes(query) || userName.includes(query)) {
//       card.style.display = "flex"; // Show it
//     } else {
//       card.style.display = "none"; // Hide it
//     }
//   });
// });
