import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name, value) => {
      if (validationRules[name]) {
        const error = validationRules[name](value, values);
        setErrors((prev) => ({ ...prev, [name]: error }));
        return error;
      }
      return '';
    },
    [validationRules, values]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const val = type === 'checkbox' ? checked : value;

      setValues((prev) => ({ ...prev, [name]: val }));
      setServerError('');

      if (touched[name]) {
        validateField(name, val);
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const val = type === 'checkbox' ? checked : value;

      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name, val);
    },
    [validateField]
  );

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    for (const field of Object.keys(validationRules)) {
      const error = validationRules[field](values[field], values);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    // Mark all validated fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, curr) => {
      acc[curr] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    return isValid;
  }, [validationRules, values]);

  const handleSubmit = (onSubmit) => {
    return async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      setServerError('');
      const isValid = validateAll();
      if (!isValid) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        setServerError(err.message || 'An error occurred during submission');
      } finally {
        setIsSubmitting(false);
      }
    };
  };

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
    setServerError('');
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    touched,
    errors,
    serverError,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setServerError,
    handleSubmit,
    resetForm,
    setValues,
  };
};
