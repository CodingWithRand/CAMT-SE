import { showToast, wait } from "../utils/misc";
import beginOpenAnimation from "./open_animation";

// document.getElementById("evolve").addEventListener("click", () => {
//     const date = new Date();
//     date.setTime(date.getTime() + (24 * 60 * 60 * 1000))
//     setCookie("evolve", true, date.toUTCString(), "/")
// });

const typingText = document.getElementById('inviting-text');
const textToType = {
  en: [
    "Discover stories worth reading",
    "Explore worldwide insights",
    "Discuss ideas with people from around the world",
    "Share your own unique stories",
  ],
  th: [
    "ค้นหาเรื่องราวที่น่าอ่าน",
    "สำรวจข้อมูลต่างๆจากทั่วโลก",
    "แลกเปลี่ยนความคิดเห็นกับผู้คนจากทั่วโลก",
    "แบ่งปันเรื่องราวที่เป็นเอกลักษณ์ของคุณเอง",
  ],
}

async function typing() {
    typingText.textContent = '';
    
    while(true) {
        for(const text of textToType[document.documentElement.lang.slice(0, 2)]) {
            for(const char of text) {
                await wait(100);
                typingText.textContent = typingText.textContent + char;
            }
            await wait(5000);
            for(let i = text.length; i >= 0; i--) {
                await wait(50);
                typingText.textContent = text.substring(0, i);
            }
        }
    }
}


async function handleGoogleCallback() {
  const processedParams = new URLSearchParams(window.location.hash.replace("#", "?"))
  const accessToken = processedParams.get("access_token");
  const refreshToken = processedParams.get("refresh_token");
  let reloaded = false;

  if (accessToken && refreshToken) {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.classList.remove("hidden");
    }
    try {
      const response = await fetch("/api/auth/google/callback", {
        method: "POST",
        body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
        headers: { "Content-Type": "application/json" }
      })
  
      if (response.ok && !reloaded) {
        reloaded = true;
        window.location.reload();
      } else {
        throw response;
      }
    } catch (error) {
      showToast("An error occurred while logging in. Please try again.");
      loadingOverlay.classList.add("hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname !== "/" || document.getElementById("feed")) return;

  typing();
  document.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => window.location.href = `/blogs/${card.dataset.blogId}/${card.dataset.blogSlug}`);
  });
  if (window.innerHeight / window.innerWidth > 1.25) {
    document.getElementById("scene-play").classList.add("phone-adjusted")
  } else {
    document.getElementById("scene-play").classList.remove("phone-adjusted")
  }
  handleGoogleCallback();
  beginOpenAnimation();
});

window.addEventListener("resize", () => {
  if (window.innerHeight / window.innerWidth > 1.25) {
    document.getElementById("scene-play").classList.add("phone-adjusted")
  } else {
    document.getElementById("scene-play").classList.remove("phone-adjusted")
  }
})