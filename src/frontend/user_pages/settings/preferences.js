import { showToast } from "../../utils/misc.js";

document.addEventListener("DOMContentLoaded", () => {
    if(window.location.pathname !== '/account/preferences') return

    // Font size slider handler
    document.querySelector('input[name="font-size"]').addEventListener('input', function(e) {
        document.getElementById('font-size-display').textContent = e.target.value + 'px';
    });

    
    // Save preferences (placeholder - will be connected to backend)
    const preferenceSettingsForm = document.getElementById('preference-settings')
    const themeInputs = preferenceSettingsForm.querySelectorAll('input[name="theme-mode"]');
    
    themeInputs.forEach((ti) => {
        ti.addEventListener('change', (e) => {
            if (e.currentTarget.checked) {
                if (e.currentTarget.value === 'auto') {
                    document.documentElement.className = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
                } else {
                    document.documentElement.className = e.currentTarget.value
                }
            }
        })
    })

    document.querySelector('select[name="font-family"]').addEventListener('change', function(e) {
        const selectedFont = e.target.value;
        document.documentElement.style.setProperty('--default-font-family', `var(--font-${selectedFont})`);
    });

    document.querySelector('input[name="font-size"]').addEventListener('change', function(e) {
        const selectedFontSize = e.target.value;
        document.documentElement.style.setProperty('font-size', `${selectedFontSize}px`);
    });

    preferenceSettingsForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const selectedTheme = document.querySelector('input[name="theme-mode"]:checked').value;
        const selectedFont = document.querySelector('select[name="font-family"]').value;
        const selectedFontSize = document.querySelector('input[name="font-size"]').value;
        const visibleProfile = document.querySelector('input[name="public-profile"]').checked;
        const defaultAllowPostComments = document.querySelector('input[name="allow-comments"]').checked;
        const lang = document.querySelector('input[name="lang"]:checked').value;
        localStorage.setItem('theme', selectedTheme);
        localStorage.setItem('font-family', selectedFont);
        localStorage.setItem('font-size', selectedFontSize);
        localStorage.setItem('lang', lang);

        try {
            const response = await fetch("/api/users/update/current/preferences", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    theme: selectedTheme,
                    font_family: selectedFont,
                    font_size: parseInt(selectedFontSize),
                    visible_profile: visibleProfile,
                    default_allow_post_comments: defaultAllowPostComments,
                    lang: lang
                })
            });

            if (!response.ok) throw response;

            showToast('Successfully saved your preference settings!', 'success');
            window.location.reload();
        } catch (err) {
            console.error("Error saving preferences:", err);
            showToast('Failed to save your preference settings.');
        }
    });
})
