// Form validation configuration
import notf_lang from "../locales.js";

const errmsg = (notfId) => notf_lang("reg_form_validation", "rules", notfId);

const rules = {
    userName: {
        required: true,
        pattern: /^[a-zA-Z0-9_ ]{3,50}$/,
        errorMessage: errmsg(1)
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessage: errmsg(2)
    },
    confirmPassword: {
        required: true,
        equalTo: 'password',
        errorMessage: errmsg(3)
    },
    terms: {
        required: true,
        errorMessage: errmsg(4)
    },
    bio: {
        required: false,
        minLength: 0,
        maxLength: 1000,
        errorMessage: errmsg(5)
    }
};

// Password
/**
 * Validate password requirements and update UI
 */
function validatePasswordRequirements(passwordElement) {
    const password = passwordElement?.value || '';
    const requirements = getPasswordRequirements(password);

    // Update requirement icons
    updateRequirementIcon('length-icon', requirements.length);
    updateRequirementIcon('uppercase-icon', requirements.uppercase);
    updateRequirementIcon('number-icon', requirements.number);
    updateRequirementIcon('special-icon', requirements.special);

    return Object.values(requirements).every((isValid) => isValid);
}

/**
 * Get password requirement validation object
 */
function getPasswordRequirements(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };
}

/**
 * Update requirement icon and text styling
 */
function updateRequirementIcon(iconId, isValid) {
    const icon = document.getElementById(iconId);
    if (icon) {
        if (isValid) {
            icon.className = 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-300 dark:bg-green-700 text-green-700 dark:text-green-200';
            icon.textContent = '✓';
            icon.parentElement.querySelector("[id$='-text']").classList.add('text-slate-600');
            icon.parentElement.querySelector("[id$='-text']").classList.add('dark:text-slate-400');
            icon.parentElement.querySelector("[id$='-text']").classList.remove('text-red-600');
            icon.parentElement.querySelector("[id$='-text']").classList.remove('dark:text-red-400');
        } else {
            icon.className = 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-300 dark:bg-red-700 text-red-600 dark:text-red-200';
            icon.textContent = '✗';
            icon.parentElement.querySelector("[id$='-text']").classList.remove('text-slate-600');
            icon.parentElement.querySelector("[id$='-text']").classList.remove('dark:text-slate-400');
            icon.parentElement.querySelector("[id$='-text']").classList.add('text-red-600');
            icon.parentElement.querySelector("[id$='-text']").classList.add('dark:text-red-400');
        }
    }
}

let currentError = null;

// Validate single field
function validateField(field, rule) {
    if (!rule.required && !field.value.trim()) return true;

    if (field.type === 'checkbox' && !field.checked) {
        currentError = rule.errorMessage;
        return false;
    }

    const value = field.value.trim();

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
        showError(field, rule.errorMessage);
        return false;
    }

    // MinLength validation (password)
    if (rule.minLength && value.length < rule.minLength) {
        showError(field, rule.errorMessage);
        return false;
    }

    // MinLength validation (password)
    if (rule.maxLength && value.length > rule.maxLength) {
        showError(field, rule.errorMessage);
        return false;
    }

    // EqualTo validation (confirm password)
    if (rule.equalTo) {
        const password = document.querySelector(`input[name="password"], input[name="new-password"]`).value;
        if (value !== password) {
            showError(field, rule.errorMessage);
            return false;
        }
    }

    return true;
}

// Show error for field
function showError(field, message) {
    currentError = message;
    field.classList.add('border-red-500', 'focus:ring-red-500');
    field.classList.remove('focus:border-blue-500', 'focus:ring-blue-500', 'border-slate-300');
    let errorMessage = field.parentElement.querySelector('.err-msg');
    if(!errorMessage) errorMessage = document.createElement('span'); // Avoid duplicate messages
    errorMessage.className = "err-msg text-xs text-red-500 mt-2";
    errorMessage.textContent = message;
    if(!field.parentElement.querySelector('.err-msg')) field.parentElement.appendChild(errorMessage);
}

// Reset field styles
function resetField(field, preserveMsg = true) {
    currentError = null;
    field.classList.remove('border-red-500', 'focus:ring-red-500');
    field.classList.add('focus:border-blue-500', 'focus:ring-blue-500');
    if(preserveMsg) return;
    if(!field.parentElement.querySelector('.err-msg')) return;
    field.parentElement.removeChild(field.parentElement.querySelector('.err-msg'));
}

export default { 
    rules, 
    currentError: (set=undefined) => {
        if(set) currentError = set;
        else return currentError;
    }, 
    validateField, 
    showError, 
    resetField,
    validatePasswordRequirements
}