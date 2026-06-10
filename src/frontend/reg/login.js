import { showToast } from "../utils/misc.js";
import registerPasswordResetForm from "../utils/password_reset_form.js";
import notf_lang from "../locales.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorContainer = document.getElementById('login-error');

    registerPasswordResetForm();

    // ==================== Login Form Handling ====================

    // Handle URL-encoded errors (e.g., /login?err=Invalid%20login%20credentials)
    function parseUrlError() {
        const params = new URLSearchParams(window.location.search);
        const error = params.get('err');
        
        if (error) {
            const decodedError = decodeURIComponent(error);
            showToast(decodedError);
            window.location.href = '/';
        }
    }

    const notfmsg = (fn, notfId) => notf_lang("login", fn, notfId)

    // Form validation
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.querySelector('input[name="email"]').value.trim();
        const password = document.querySelector('input[name="password"]').value.trim();

        // Basic validation
        if (!email || !password) {
            showToast(notfmsg("emailLoginFormSubmission", 1));
            return;
        }

        // Note: Server-side validation handles actual authentication
        // Client-side only shows error message if validation fails on server
        try {
            const response = await fetch('/api/login/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                const error = await response.json();
                console.error(error)
                showToast(notfmsg("emailLoginFormSubmission", 2));
                return;
            }
            window.location.href = '/';
        } catch (error) {
            showToast(notfmsg("emailLoginFormSubmission", 3));
        }
    });

    // Handle Google OAuth button (prevent default redirect if needed)
    document.getElementById('sign-in-w-google')?.addEventListener('click', async () => {
        const response = await fetch('/api/login/google', {
            method: "POST",
            credentials: "include"
        });
        if (!response.ok) {
            const error = await response.json();
            showToast(error.error || notfmsg("signInWGoogle", 1));
            return;
        } else {
            const oauthURL = await response.json();
            window.location.href = oauthURL.url;
        }
    });

    // Parse URL error on page load
    parseUrlError();
});