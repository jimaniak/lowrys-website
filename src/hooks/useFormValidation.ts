// src/hooks/useFormValidation.ts
'use client';

import { useState, useEffect } from 'react';

// Define validation types
export type ValidationError = string | null;
export type TouchedFields = Record<string, boolean>;
export type ValidationErrors = Record<string, ValidationError>;

// Define validation rules interface
interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  errorMessage?: string;
}

// Define validation rules for each field
export type FieldValidationRules = Record<string, ValidationRules>;

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: FieldValidationRules
) {
  // State for form values, errors, touched fields, and form validity
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validate a single field
  const validateField = (name: string, value: any): ValidationError => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Check if field is required and empty
    if (rules.required && (value === '' || value === null || value === undefined)) {
      return rules.errorMessage || 'This field is required';
    }

    // Check minimum length
    if (rules.minLength && value.length < rules.minLength) {
      return rules.errorMessage || `Must be at least ${rules.minLength} characters`;
    }

    // Check maximum length
    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.errorMessage || `Must be no more than ${rules.maxLength} characters`;
    }

    // Check pattern (regex)
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.errorMessage || 'Invalid format';
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      return rules.errorMessage || 'Invalid value';
    }

    return null;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let formIsValid = true;

    // Validate each field
    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName as keyof T]);
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    return formIsValid;
  };

  // Handle field change
  const handleChange = (name: keyof T, value: any) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    // If field has been touched, validate it on change
    if (touched[name as string]) {
      const error = validateField(name as string, value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  };

  // Handle field blur
  const handleBlur = (name: keyof T) => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    const error = validateField(name as string, values[name]);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Handle form submission
  const handleSubmit = async (
    onSubmit: (values: T) => Promise<void> | void,
    onError?: (errors: ValidationErrors) => void
  ) => {
    setIsSubmitting(true);
    
    // Validate all fields and mark them as touched
    const touchedFields: TouchedFields = {};
    Object.keys(validationRules).forEach((field) => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    const formIsValid = validateForm();

    if (formIsValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
      if (onError) {
        onError(errors);
      }
    }
  };

  // Check form validity whenever values or errors change
  useEffect(() => {
    const formHasErrors = Object.values(errors).some((error) => error !== null);
    setIsValid(!formHasErrors);
  }, [values, errors]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateForm,
  };
}
