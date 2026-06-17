import notf_lang from "./locales.js";
import { showToast } from './utils/misc.js'

function t(fn, id = undefined) {
    return notf_lang("contact", fn, id);
}

document.addEventListener('DOMContentLoaded', () => {
    if(window.location.pathname !== '/contact') return

    const form = document.getElementById('contact-form');

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fullName = form.querySelector('input[name="fullname"]').value;
        const email = form.querySelector('input[name="email_address"]').value;
        const subject = form.querySelector('input[name="subject"]').value;
        const message = form.querySelector('textarea[name="message"]').value;

        try {
            const contact_sent_response = await fetch('/api/contact/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    email, subject, message
                })
            })

            if (contact_sent_response.ok) showToast(t("contact_sent_success", "success"));
            else throw contact_sent_response
        } catch (e) {
            const error = await e.json();
            console.error(error);
            showToast(error.message, "error");
        }
    })
})