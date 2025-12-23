/**
 * validationUtils.js
 * Utility functions for restricting user input to valid characters.
 */

const ValidationUtils = {
    /**
     * Restricts input to numbers only (0-9).
     * Usage: inputElement.addEventListener('input', ValidationUtils.restrictToNumbers);
     */
    restrictToNumbers: function (e) {
        const input = e.target;
        // Remove any non-digit characters
        const clean = input.value.replace(/\D/g, '');
        if (input.value !== clean) {
            input.value = clean;
        }
    },

    /**
     * Restricts input to currency-like characters (digits, commas, dots, dashes, spaces, currency symbols).
     */
    restrictToCurrency: function (e) {
        const input = e.target;
        // Allow digits, $, €, £, comma, dot, dash, space
        const clean = input.value.replace(/[^0-9.,\-\s$€£]/g, '');
        if (input.value !== clean) {
            input.value = clean;
        }
    },

    /**
     * Restricts input to name-like characters (letters, spaces, hyphens, apostrophes).
     */
    restrictToName: function (e) {
        const input = e.target;
        // Allow letters (unicode), spaces, hyphens, apostrophes
        // This regex allows alphabetic characters from various languages
        const clean = input.value.replace(/[^a-zA-Z\s\-'\u00C0-\u00FF]/g, '');
        if (input.value !== clean) {
            input.value = clean;
        }
    },

    /**
     * Attach validation to multiple inputs by ID
     * @param {string[]} ids - Array of element IDs
     * @param {function} validationFn - The validation function to use
     */
    attach: function (ids, validationFn) {
        if (!Array.isArray(ids)) return;
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', validationFn);
            }
        });
    }
};

window.ValidationUtils = ValidationUtils;
