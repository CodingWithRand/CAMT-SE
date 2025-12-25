const btn = document.querySelector("#btnJoke");
const setupEl = document.querySelector("#setup");
const deliveryEl = document.querySelector("#delivery");
const statusEl = document.querySelector("#status");
btn.addEventListener("click", async () => {
  statusEl.textContent = "Loading...";
  setupEl.textContent = "-";
  deliveryEl.textContent = "-";
  try {
    const res = await fetch("/api/joke");
    const data = await res.json();
    setupEl.textContent = data.setup;
    deliveryEl.textContent = data.delivery;
    statusEl.textContent = "";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error loading joke.";
  }
});
