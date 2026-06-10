import { showToast } from "./utils/misc.js";
import FormValidation from "./utils/reg_form_validation.js";
import notf_lang from "./locales.js";

/**
 * Auth Module - Handles password reset, email verification, and 2FA
 * Integrates with auth.ejs modal-based authentication pages
 */

document.addEventListener('DOMContentLoaded', async () => {
    if(!window.location.pathname.startsWith('/auth')) return;

    const processedParams = new URLSearchParams(window.location.search)
    const th = processedParams.get("token");

    let access_token

    try {
        // if (th) {
        //     const response = await fetch('/api/auth/verify', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ token: th, type: "recovery" })
        //     });

        //     if (!response.ok) throw response;
        //     access_token = (await response.json()).access_token
        // } else {
        //     throw new Error("No token provided")
        // }
    } catch (error) {
        console.error(error)
        // Notification modal, "This request is invalid or has expired."
        document.getElementById("invalid-request-modal").classList.remove("hidden");
        window.history.replaceState("", null, window.location.pathname);
        document.querySelector("#auth-action").innerHTML = "";
        return
    }
    
    window.history.replaceState("", null, window.location.pathname);

    // ==================== Password Reset ====================
    handlePasswordReset(access_token);

    // ==================== Email Verification ====================
    // handleEmailVerification();

    // ==================== Two-Factor Authentication ====================
    // handleTwoFactor();
});

/**
 * Handle Password Reset Form
 */
function handlePasswordReset(token) {
    const form = document.getElementById('password-reset-form');
    if (!form) return;

    const passwordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const successMessage = document.getElementById('reset-success-message');

    // Real-time password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => FormValidation.validatePasswordRequirements(e.currentTarget));
    }

    confirmPasswordInput.addEventListener('input', () => {
        const rule = FormValidation.rules["confirmPassword"];
        if (rule && !FormValidation.validateField(confirmPasswordInput, rule)) {
            FormValidation.showError(confirmPasswordInput, rule.errorMessage);
        } else {
            FormValidation.resetField(confirmPasswordInput, false);
        }
    })

    const notfmsg = (notfId, arg=undefined) => {
        if(notfId === 2) return notf_lang("auth", "resetPasswordFormSubmission", notfId) + arg;
        else return notf_lang("auth", "resetPasswordFormSubmission", notfId);
    }
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validation
        const to_validate_fields = {
            password: passwordInput,
            confirmPassword: confirmPasswordInput
        }

        let isValid = true;

        for (let tvf in to_validate_fields) {
            if (tvf === 'password') {
                if (!FormValidation.validatePasswordRequirements(to_validate_fields[tvf])) {
                    FormValidation.currentError(notfmsg(1));
                    isValid = false;
                    break;
                }
                continue;
            }
            const validation = FormValidation.validateField(to_validate_fields[tvf], FormValidation.rules[tvf]);
            if (!validation) {
                isValid = false;
                break;
            }
        }

        if(!isValid) {
            return showToast(FormValidation.currentError(), "error");
        }

        try {
            const response = await fetch('/api/auth/reset/password', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword: passwordInput.value })
            });

            // Request work now. Deal with the aftermath later. (Notification toast for error and success, redirecting, etc...)
            
            if (!response.ok) {
                const error = await response.json();
                showToast(notfmsg(2, error.error), 'error');
                return;
            } else {
                showToast(notfmsg(3), 'success');
            }

            // Show success message
            form.style.display = 'none';
            successMessage.classList.remove('hidden');

            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } catch (error) {
            console.error('Password reset error:', error);
            showToast(notfmsg(5), 'error');
        }
    });
}

// below is still wip

/**
 * Handle Email Verification Form
 */
function handleEmailVerification() {
    const form = document.getElementById('email-verification-form');
    if (!form) return;

    const resendBtn = document.getElementById('resend-code-btn');
    const successMessage = document.getElementById('verify-success-message');
    const verifyEmail = document.getElementById('verify-email');
    const verificationCode = document.getElementById('verification-code');

    // Auto-focus on verification code after email input
    if (verifyEmail) {
        verifyEmail.addEventListener('change', () => {
            verificationCode.focus();
        });
    }

    // Auto-move to next field or submit when 6 digits entered
    if (verificationCode) {
        verificationCode.addEventListener('input', (e) => {
            if (e.target.value.length === 6) {
                // Allow 100ms for user to review before submitting
                setTimeout(() => {
                    const numValue = e.target.value;
                    if (/^\d{6}$/.test(numValue)) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }, 100);
            }
        });
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = verifyEmail.value.trim();
        const code = verificationCode.value.trim();

        if (!email || !code) {
            showToast('Email and verification code are required', 'error');
            return;
        }

        if (!/^\d{6}$/.test(code)) {
            showToast('Verification code must be 6 digits', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.message || 'Verification failed', 'error');
                return;
            }

            // Show success message
            form.style.display = 'none';
            successMessage.classList.remove('hidden');

            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } catch (error) {
            console.error('Email verification error:', error);
            showToast('An error occurred. Please try again.', 'error');
        }
    });

    // Resend code button
    if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
            const email = verifyEmail.value.trim();

            if (!email) {
                showToast('Please enter your email address first', 'error');
                return;
            }

            try {
                const response = await fetch('/api/auth/resend-verification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    showToast(data.message || 'Failed to resend code', 'error');
                    return;
                }

                showToast('Verification code sent to your email!', 'success');

                // Disable resend button temporarily (60 seconds)
                resendBtn.disabled = true;
                let countdown = 60;
                resendBtn.textContent = `Resend Code (${countdown}s)`;

                const interval = setInterval(() => {
                    countdown--;
                    resendBtn.textContent = `Resend Code (${countdown}s)`;

                    if (countdown === 0) {
                        clearInterval(interval);
                        resendBtn.disabled = false;
                        resendBtn.textContent = 'Resend Code';
                    }
                }, 1000);
            } catch (error) {
                console.error('Resend verification error:', error);
                showToast('An error occurred. Please try again.', 'error');
            }
        });
    }
}

/**
 * Handle Two-Factor Authentication Form
 */
function handleTwoFactor() {
    const form = document.getElementById('two-factor-form');
    if (!form) return;

    const totpCode = document.getElementById('totp-code');
    const successMessage = document.getElementById('2fa-success-message');

    // Auto-submit when 6 digits entered
    if (totpCode) {
        totpCode.addEventListener('input', (e) => {
            if (e.target.value.length === 6) {
                setTimeout(() => {
                    const numValue = e.target.value;
                    if (/^\d{6}$/.test(numValue)) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }, 100);
            }
        });
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const code = totpCode.value.trim();

        if (!code) {
            showToast('Authenticator code is required', 'error');
            return;
        }

        if (!/^\d{6}$/.test(code)) {
            showToast('Code must be 6 digits', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.message || 'Authentication failed', 'error');
                // Clear the field for retry
                totpCode.value = '';
                totpCode.focus();
                return;
            }

            // Show success message
            form.style.display = 'none';
            successMessage.classList.remove('hidden');

            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            console.error('2FA verification error:', error);
            showToast('An error occurred. Please try again.', 'error');
            totpCode.value = '';
            totpCode.focus();
        }
    });
}

export default {
    handlePasswordReset,
    handleEmailVerification,
    handleTwoFactor
};
