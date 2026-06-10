import notf_lang from "../locales.js";
import { showToast } from "./misc.js";

export default function registerPasswordResetForm() {
    // ==================== Password Reset Modal ====================
    const forgetPasswordBtn = document.getElementById('forget-password');
    const passwordResetModal = document.getElementById('password-reset-modal');
    const closeResetModalBtn = passwordResetModal.querySelector('.close-reset-modal');
    const passwordResetForm = passwordResetModal.querySelector('#password-reset-form');
    const resetEmailInput = passwordResetModal.querySelector('#reset-email');
    const resetSuccessMessage = passwordResetModal.querySelector('#reset-success-message');

    // Open password reset modal
    forgetPasswordBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        passwordResetModal.classList.remove('hidden');
        resetEmailInput.focus();
    });

    // Close password reset modal
    function closePasswordResetModal() {
        passwordResetModal.classList.add('hidden');
        passwordResetForm.reset();
        resetSuccessMessage.classList.add('hidden');
    }

    closeResetModalBtn?.addEventListener('click', closePasswordResetModal);

    // Close modal when clicking outside of it
    passwordResetModal?.addEventListener('click', (e) => {
        if (e.target === passwordResetModal) {
            closePasswordResetModal();
        }
    });
    
    const notfmsg = (fn, notfId) => notf_lang("password_reset_form", fn, notfId) 

    // Handle password reset form submission
    passwordResetForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = resetEmailInput.value.trim();

        if (!email) {
            showToast(notfmsg("passwordResetFormSubmission", 1));
            return;
        }

        try {
            const response = await fetch('/api/auth/reset/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const error = await response.json();
                showToast(error.error || notfmsg("passwordResetFormSubmission", 2));
                return;
            }

            // Show success message in modal
            passwordResetForm.style.display = 'none';
            resetSuccessMessage.classList.remove('hidden');

            // Close modal after 3 seconds
            setTimeout(() => {
                closePasswordResetModal();
                passwordResetForm.style.display = 'block';
            }, 3000);
        } catch (error) {
            console.error(error);
            showToast(notfmsg("passwordResetFormSubmission", 3));
        }
    });
}