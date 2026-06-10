// public/js/register.js
import { showToast } from "../utils/misc.js";
import FormValidation from "../utils/reg_form_validation.js"
import notf_lang from "../locales.js";

const { rules, currentError, showError, resetField, validateField, validatePasswordRequirements } = FormValidation

document.addEventListener('DOMContentLoaded', () => {
    if(window.location.pathname !== '/register') return
    const redirectErrorMsg = new URLSearchParams(window.location.search).get('error')
    if(redirectErrorMsg) showToast(redirectErrorMsg);
    window.history.replaceState(null, "", "/register");
    const form = document.getElementById('register-form');
    const termsCheckbox = document.querySelector('input[type="checkbox"]');

    const notfmsg = (fn, notfId) => notf_lang("register", fn, notfId)

    // Validate entire form
    function validateForm(e) {
        e.preventDefault();

        const fields = {
            userName: document.querySelector('input[name="userName"]'),
            email: document.querySelector('input[name="email"]'),
            password: document.querySelector('input[name="password"]'),
            confirmPassword: document.querySelector('input[name="confirmPassword"]'),
            terms: termsCheckbox
        };

        let isValid = true;

        // Validate each field
        for (let field in fields) {
            if (field === 'password') {
                if (!validatePasswordRequirements(fields[field])) {
                    currentError(notfmsg("validateForm", 1));
                    isValid = false;
                    break;
                }
                continue;
            }
            const validation = validateField(fields[field], rules[field]);
            if (!validation) {
                isValid = false;
                break;
            }
        }

        // Show toast based on form validity
        if (!isValid) {
            showToast(currentError(), 'error');
        } else {
            // Reset error states
            Object.values(fields).forEach(field => {
                if (field.type !== 'checkbox') {
                    resetField(field);
                }
            });

            // Success toast
            // showToast('All fields validated successfully! Submitting...', 'success');
            form.submit();
        }
    }

    // Event listeners
    form?.addEventListener('submit', validateForm);

    // Real-time validation (optional UX improvement)
    const inputs = document.querySelectorAll('input:not([name="password"]), select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const rule = rules[input.name];
            if (rule && !validateField(input, rule)) {
                showError(input, rule.errorMessage);
            } else {
                resetField(input, false);
            }
        });
    });

    document.querySelector('input[name="password"]').addEventListener('input', (e) => validatePasswordRequirements(e.currentTarget))

    // Handle Google OAuth button (prevent default redirect if needed)
    document.getElementById('sign-up-w-google')?.addEventListener('click', async () => {
        const response = await fetch('/api/register/google', {
            method: "POST",
            credentials: "include"
        });
        if (!response.ok) {
            const error = await response.json();
            showToast(error.error || notfmsg("signUpWGoogle", 1));
            return;
        } else {
            const oauthURL = await response.json();
            window.location.href = oauthURL.url;
        }
    });
});