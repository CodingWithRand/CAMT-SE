import { showToast } from "../../utils/misc.js"
import FormValidation from "../../utils/reg_form_validation.js"
import registerPasswordResetForm from "../../utils/password_reset_form.js";

document.addEventListener("DOMContentLoaded", () => {
    if(window.location.pathname !== '/account') return
    const profileForm = document.getElementById("account-profile-form")
    const passwordForm = document.getElementById("password-form");

    registerPasswordResetForm();

    document.getElementById('avatar-input').addEventListener('change', (e) => {
        const file = e.target.files[0]
        const reader = new FileReader();
        reader.onload = (e) => {
            const pfp = document.querySelector('.pfp');
            if(pfp.tagName === "DIV") {
                pfp.parentElement.insertAdjacentHTML("afterbegin", `<img class="pfp w-24 h-24 rounded-full  bg-white" src="${e.target.result}" alt="User Avatar">`)
                pfp.remove();
            } else {
                pfp.src = e.target.result;
            }
        }
        reader.readAsDataURL(file)
    })

    const convertToRuleName = (otherName) => 
        otherName === "display-name" ? "userName" : 
        otherName === "new-password" ? "password" :
        otherName === "confirm-password" ? "confirmPassword" : otherName; 

    const profileFormInputs = profileForm.querySelectorAll('input, textarea');
    profileFormInputs.forEach((pfi) => {
        pfi.addEventListener('input', () => {
            const rule = FormValidation.rules[convertToRuleName(pfi.name)];
            if (rule && !FormValidation.validateField(pfi, rule)) {
                FormValidation.showError(pfi, rule.errorMessage);
            } else {
                FormValidation.resetField(pfi, false);
            }
        })
    })

    profileForm.querySelector('textarea[name="bio"]').addEventListener("input", (event) => profileForm.querySelector('textarea[name="bio"]').parentElement.querySelector('span').textContent = `Max 1000 characters. Characters Left: ${1000 - event.target.value.length}`);

    document.querySelector('input[name="confirm-password"]').addEventListener('input', () => {
        const rule = FormValidation.rules[convertToRuleName("confirm-password")];
        if (rule && !FormValidation.validateField(document.querySelector('input[name="confirm-password"]'), rule)) {
            FormValidation.showError(document.querySelector('input[name="confirm-password"]'), rule.errorMessage);
        } else {
            FormValidation.resetField(document.querySelector('input[name="confirm-password"]'), false);
        }
    })
    document.querySelector('input[name="new-password"]').addEventListener('input', (e) => FormValidation.validatePasswordRequirements(e.currentTarget))

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const avatar = profileForm.querySelector('#avatar-input');
        const displayName = profileForm.querySelector('input[name="display-name"]');
        const bio = profileForm.querySelector('textarea[name="bio"]');

        // Validation
        const to_validate_fields = {
            userName: displayName,
            bio: bio
        }

        let isValid = true;

        for (let tvf in to_validate_fields) {
            const validation = FormValidation.validateField(to_validate_fields[tvf], FormValidation.rules[tvf]);
            if (!validation) isValid = false;
        }

        if(!isValid) {
            return showToast(FormValidation.currentError, "error");
        }

        let pfpURL = undefined;
        if (avatar.files[0]) {
            try {
                const avatarFD = new FormData();
                avatarFD.append("avatar", avatar.files[0], "avatar.png")
                const pfpURLResponse = await fetch('/api/users/upload/avatar', {
                    method: "POST",
                    body: avatarFD
                });
                if(!pfpURLResponse.ok) throw pfpURLResponse;
                pfpURL = await pfpURLResponse.json();
                pfpURL = pfpURL.url
            } catch (e) {
                console.error(e);
                return showToast(e.message);
            }
        }

        try {
            const updatedProfileResponse = await fetch('/api/users/update', {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: pfpURL, displayName: displayName.value, bio: bio.value })
            })
            if(!updatedProfileResponse.ok) throw updatedProfileResponse;
            showToast("Profile updated successfully", "success");
        } catch (e) {
            console.error(e);
            return showToast(e.message);
        }
    })

    passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newPassword = passwordForm.querySelector("input[name='new-password']");
        const confirmPassword = passwordForm.querySelector("input[name='confirm-password']");

        // Validation
        const to_validate_fields = {
            password: newPassword,
            confirmPassword: confirmPassword
        }

        let isValid = true;

        for (let tvf in to_validate_fields) {
            if (tvf === 'password') {
                if (!FormValidation.validatePasswordRequirements(to_validate_fields[tvf])) {
                    FormValidation.currentError("Password must have 8+ characters, uppercase, lowercase, number, and symbol");
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

        const currentPassword = passwordForm.querySelector("input[name='current-password']");
        try {
            const updatedPasswordResponse = await fetch('/api/auth/update/password', {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPassword: currentPassword.value, newPassword: newPassword.value })
            })
            if (!updatedPasswordResponse.ok) {
                const error = await updatedPasswordResponse.json();
                return showToast(error.error, "error");
            }
        } catch (e) {
            console.error(e);
        }
        showToast("Password updated successfully", "success");
        e.target.reset();
    })

    const accountDeleteBtn = document.getElementById('account-delete');
    const accountDeleteModal = document.getElementById('account-delete-modal');
    const closeResetModalBtn = accountDeleteModal.querySelector('.close-reset-modal');
    const accountDeleteForm = accountDeleteModal.querySelector('#account-delete-form');
    const accountDeleteConfirmPasswordInput = accountDeleteModal.querySelector('#account-delete-confirm-password');

    // Open password reset modal
    accountDeleteBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        accountDeleteModal.classList.remove('hidden');
        accountDeleteConfirmPasswordInput.focus();
    });

    // Close password reset modal
    function closeAccountDeleteModal() {
        accountDeleteModal.classList.add('hidden');
        accountDeleteForm.reset();
    }

    closeResetModalBtn?.addEventListener('click', closeAccountDeleteModal);

    // Close modal when clicking outside of it
    accountDeleteModal?.addEventListener('click', (e) => {
        if (e.target === accountDeleteModal) {
            closeAccountDeleteModal();
        }
    });

    // Handle password reset form submission
    accountDeleteModal?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = accountDeleteConfirmPasswordInput.value.trim();

        if (!password) {
            showToast('Please enter your password to confirm account deletion.');
            return;
        }

        try {
            const response = await fetch('/api/auth/delete/account', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirm_password: password })
            });

            if (!response.ok) {
                const error = await response.json();
                showToast(error.error || 'Failed to delete account.');
                return;
            }

            window.location.replace('/');
        } catch (error) {
            console.error(error);
            showToast('An error occurred. Please try again.');
        }
    });
})