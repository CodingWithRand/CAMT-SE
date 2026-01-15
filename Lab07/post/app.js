// TASK B2: Implement POST with fetch (Send Message)
// Requirements:
// 1) Validate input (if empty → show “Please type a message first.”)
// 2) Show status: “Sending…”
// 3) Send POST request to: https://httpbin.org/post
// 4) Include:
//    - method: "POST"
//    - headers: { "Content-Type": "application/json" }
//    - body: JSON.stringify({ message, createdAt })
// 5) Parse response JSON and display what you sent (echoed JSON)
//
// Output requirements:
// - Show “Sent successfully.” on success
// - Show error message on failure
// - Display JSON nicely formatted: JSON.stringify(obj, null, 2)

// 0) Access HTML elements (IDs required: msg, btnSend, status, output)
const inputMessage = document.getElementById("msg");
const sendBtn = document.getElementById("btnSend");
const clearBtn = document.getElementById("btnClear");
const statusDiv = document.getElementById("status");
const resultPre = document.getElementById("output");

clearBtn.addEventListener("click", () => {
  statusDiv.textContent = "...";
  resultPre.textContent = "";
});

// 1) Add click event listener to the Send button
// Hint: sendBtn.addEventListener("click", async () => { ... });
sendBtn.addEventListener("click", async () => {
  // 2) Read and trim the input value
  // TODO: const message = inputMessage.value.trim();
  const message = inputMessage.value.trim();

  // 3) Validate input: if empty -> show warning and stop
  // TODO:
  // if (!message) {
  //   statusDiv.textContent = "Please type a message first.";
  //   return;
  // }
  if (!message) {
    statusDiv.textContent = "Please type a message first.";
    return;
  }

  sendBtn.disabled = true;
  // 4) UI: show sending state + clear previous output
  // TODO:
  // statusDiv.textContent = "Sending...";
  // resultPre.textContent = "";
  statusDiv.textContent = "Sending...";
  resultPre.textContent = "";

  try {
    // 5) Send POST request using fetch()
    // TODO: const res = await fetch("https://httpbin.org/post", { ... });
    const res = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        createdAt: new Date().toISOString(),
      }),
    });

    // 6) Check res.ok (HTTP errors do not throw automatically)
    // TODO: if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    

    // 7) Parse JSON response
    // TODO: const data = await res.json();
    const data = await res.json();
    

    // 8) Display echoed JSON (what we sent back)
    // Hint: data.json contains the sent body in httpbin
    // TODO: resultPre.textContent = JSON.stringify(data.json, null, 2);
    resultPre.textContent = JSON.stringify(data.json, null, 2);

    // 9) Success message
    // TODO: statusDiv.textContent = "Sent successfully.";
    statusDiv.textContent = "Sent successfully.";
    
  } catch (err) {
    // 10) Error message
    // TODO: statusDiv.textContent = `Error: ${err.message}`;
    statusDiv.textContent = `Error: ${err.message}`;
    
  } finally {
    // Optional: re-enable the button
    // TODO: sendBtn.disabled = false;
    sendBtn.disabled = false;
  }
});