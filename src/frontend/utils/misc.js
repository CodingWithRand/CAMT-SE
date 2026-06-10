import { addSearchData } from "../index/home.js";
import notf_lang from "../locales.js"

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

function setCookie(cname, cvalue, exdays=undefined, p="/") {
    const allCookies = decodeURIComponent(document.cookie);
    if (allCookies.search(`${cname}=${cvalue}`) === -1) {
        document.cookie = `${cname}=${cvalue}; ${exdays ? `expires=${exdays}` : ""}; path=${p};`;
    }
}

// Toast
export function showToast(message, type="error") {
    const toast = document.createElement('div');
    const colorMap = {
        error: {
            top: '100px',
            bg: 'bg-red-600',
            text: 'text-white',
            border: 'border-red-500'
        },
        success: {
            top: '100px',
            bg: 'bg-green-600',
            text: 'text-white',
            border: 'border-green-500'
        },
        info: {
            top: '100px',
            bg: 'bg-blue-600',
            text: 'text-white',
            border: 'border-blue-500'
        }
    };

    const config = colorMap[type] || colorMap.error;

    toast.className = `fixed left-1/2 transform -translate-x-1/2 z-50 opacity-100`;
    toast.style.transform = 'translateY(-20px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.innerHTML = `
        <div class="flex items-center gap-3 px-4 py-3 rounded-lg ${config.bg} ${config.text} shadow-lg transition-all duration-300 animate-slideDown">
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            <span>${message}</span>
        </div>
    `;

    toast.style.top = `${config.top}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 50);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}

const text = (notfId) => notf_lang("misc", "getTimeAgo", notfId) 

export function getTimeAgo(stamp) {
    const now = new Date().getTime();
    const publishedDate = new Date(stamp).getTime();
    const diffInSeconds = Math.floor((now - publishedDate) / 1000);
    if (diffInSeconds < 60) {
        return diffInSeconds + ` ${text(1)}${diffInSeconds === 1 ? '' : text("englishPlural")}${text("punctuation")}${text("ago")}`;
    } else if (diffInSeconds < (60 * 60)) {
        const minutes = Math.floor(diffInSeconds / (60));
        return minutes + ` ${text(2)}${minutes === 1 ? '' : text("englishPlural")}${text("punctuation")}${text("ago")}`;
    } else if (diffInSeconds < (60 * 60 * 24)) {
        const hours = Math.floor(diffInSeconds / (60 * 60));
        return hours + ` ${text(3)}${hours === 1 ? '' : text("englishPlural")}${text("punctuation")}${text("ago")}`;
    } else if (diffInSeconds < (60 * 60 * 24 * 30)) {
        const days = Math.floor(diffInSeconds / (60 * 60 * 24));
        return days + ` ${text(4)}${days === 1 ? '' : text("englishPlural")}${text("punctuation")}${text("ago")}`;
    } else if (diffInSeconds < (60 * 60 * 24 * 30 * 12)) {
        const months = Math.floor(diffInSeconds / (60 * 60 * 24 * 30));
        return months + ` ${text(5)}${months === 1 ? '' : text("englishPlural")}${text("punctuation")}${text("ago")}`;
    } else {
        const years = Math.floor(diffInSeconds / (60 * 60 * 24 * 30 * 12));
        return years + ` ${text(6)}${years === 1 ? '' : text("englishPlural")}${text("punctuation")}${text("ago")}`;
    }
}

export function applyPreferences() {
    if (localStorage.getItem('theme') === 'auto') {
        document.documentElement.className = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
    } else {
        document.documentElement.className = localStorage.getItem('theme')
    }
    
    if (localStorage.getItem('font-family')) {
        document.documentElement.style.setProperty('--default-font-family', `var(--font-${localStorage.getItem('font-family')})`);
    }
    
    if (localStorage.getItem('font-size')) {
        document.documentElement.style.setProperty('font-size', `${localStorage.getItem('font-size')}px`);
    }

    if (localStorage.getItem('lang')) {
        setCookie('i18next', localStorage.getItem('lang'))
    } else {
        setCookie('i18next', 'th')
    }
}

export function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}

document.addEventListener('DOMContentLoaded', () => {
    applyPreferences();
})