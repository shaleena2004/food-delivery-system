export const validators = {
  required: (value, fieldName = 'Field') => {
    if (value === undefined || value === null || String(value).trim() === '') {
      return `${fieldName} is required`;
    }
    return '';
  },

  email: (value) => {
    if (!value || !value.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  },

  password: (value, minLength = 6) => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < minLength) {
      return `Password must be at least ${minLength} characters`;
    }
    return '';
  },

  minLength: (value, min, fieldName = 'Field') => {
    if (value && value.trim().length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return '';
  },

  positiveNumber: (value, fieldName = 'Number') => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return `${fieldName} must be greater than 0`;
    }
    return '';
  },

  phone: (value) => {
    if (!value || !value.trim()) return '';
    const phoneRegex = /^[\d\s+\-()]{7,20}$/;
    if (!phoneRegex.test(value.trim())) {
      return 'Please enter a valid phone number';
    }
    return '';
  },
};
