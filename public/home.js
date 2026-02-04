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
        const res = await fetch(`/blog/api/posts/${likeBtn.dataset.id}/like`, { 
            method: "POST",
            credentials: "include"
        });
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

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays, p) {
    if (decodeURIComponent(document.cookie).search(`${cname}=${cvalue}`) === -1) document.cookie += `${cname}=${cvalue}; expires=${exdays}; path=${p};`;
}

document.getElementById("evolve").addEventListener("click", () => {
    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000))
    setCookie("evolve", true, date.toUTCString(), "/blog")
})