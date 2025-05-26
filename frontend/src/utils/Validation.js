// validationRules.js

export const nameValidation = {
    required: "Name is required",
    validate: (value) => {
        if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value.trim())) {
            return "Only characters and single spaces (not at start)";
        }
        if (value.replace(/\s/g, "").length < 3) {
            return "At least 3 letters required (excluding spaces)";
        }
        return true;
    },
};

export const nameKeyDownHandler = (e) => {
    const key = e.key;
    const isLetter = /^[a-zA-Z]$/.test(key);
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const isSpaceAllowed =
        key === ' ' && /^[a-zA-Z]$/.test(e.currentTarget.value.slice(-1));
    if (!(isLetter || allowedKeys.includes(key) || isSpaceAllowed)) {
        e.preventDefault();
    }
    if (key === ' ' && e.currentTarget.value.length === 0) {
        e.preventDefault();
    }
};

export const InputCleanup = (e) => {
    const value = e.currentTarget.value;
    e.currentTarget.value = value
        .replace(/[^a-zA-Z ]/g, "")
        .replace(/^\s+/, "")
        .replace(/\s{2,}/g, " ");
};

// Similarly for shop name:
export const shopNameValidation = {
    required: "Shop Name is required",
    validate: (value) => {
        if (/^\s/.test(value)) return "Cannot start with space";
        if (!/^[A-Za-z0-9 ]+$/.test(value.trim())) return "Only letters, numbers, and spaces allowed";
        return true;
    },
};

export const shopNameKeyDownHandler = (e) => {
    const allowedChars = /^[a-zA-Z0-9 ]$/;
    const controlKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];

    if (e.key === " " && e.currentTarget.selectionStart === 0) {
        e.preventDefault();
    }

    if (!allowedChars.test(e.key) && !controlKeys.includes(e.key)) {
        e.preventDefault();
    }
};

export const streetValidation = {
    required: "Street is required",
    validate: (value) => {
        if (!value.trim()) return "Street is required";
        if (/^\s/.test(value)) return "Street cannot start with space";
        if (!/^[A-Za-z0-9 ,.\-#\/']+$/.test(value)) return "Invalid characters in street";
        return true;
    },
};
export const streetKeyDown = (e) => {
    const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
    if (!allowed.includes(e.key) && !/^[a-zA-Z0-9 ,.\-#\/']$/.test(e.key)) e.preventDefault();
    if (e.key === " " && e.currentTarget.selectionStart === 0) e.preventDefault();
};
  
export const streetInputClean = (e) => {
    e.currentTarget.value = e.currentTarget.value
        .replace(/[^a-zA-Z0-9 ,.\-#\/']/g, "")
        .replace(/^\s+/, "")
        .replace(/\s{2,}/g, " ");
};
  
// 🌆 CITY & STATE (Only letters + spaces)
export const cityStateValidation = {
    required: "This field is required",
    validate: (value) => {
        if (!value.trim()) return "This field is required";
        if (/^\s/.test(value)) return "Cannot start with space";
        if (!/^[A-Za-z]+(\s[A-Za-z]+)*$/.test(value)) return "Only letters and single spaces allowed";
        return true;
    },
};
export const cityStateKeyDown = (e) => {
    const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
    if (!allowed.includes(e.key) && !/^[a-zA-Z ]$/.test(e.key)) e.preventDefault();
    if (e.key === " " && e.currentTarget.selectionStart === 0) e.preventDefault();
};
export const cityStateInputClean = (e) => {
    e.currentTarget.value = e.currentTarget.value
        .replace(/[^a-zA-Z ]/g, "")
        .replace(/^\s+/, "")
        .replace(/\s{2,}/g, " ");
};
  
// 🔢 PINCODE
export const pincodeValidation = {
    required: "Pincode is required",
    validate: (value) => {
        if (!/^\d{6}$/.test(value)) return "Pincode must be exactly 6 digits";
        return true;
    },
};
export const pincodeKeyDown = (e) => {
    const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
    if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) e.preventDefault();
};
export const pincodeInputClean = (e) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
  };