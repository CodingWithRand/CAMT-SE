const posts = document.querySelectorAll(".post");
for (const post of posts) {
    const likeBtn = post.querySelector(".like-btn")
    const statusText = post.querySelector(".status");
    likeBtn.addEventListener("click", () => like({ likeBtn, statusText }));
}

async function like({ likeBtn, statusText }) {
    const originalText = likeBtn.textContent;
    statusText.textContent = "";
    likeBtn.setAttribute("disabled", "true");
    likeBtn.textContent = "Liking...";
    try {
        const res = await fetch(`/api/posts/${likeBtn.dataset.id}/like`, { method: "POST" });
        if(res.ok) {
            const json = await res.json();
            likeBtn.textContent = `Likes: ${json.likes}`;
        } else {
            throw new Error(`Error (${res.status}): ${res.statusText}`)
        }
    } catch (err) {
        statusText.textContent = err.message;
        likeBtn.textContent = originalText;
    }
    likeBtn.removeAttribute("disabled");
};