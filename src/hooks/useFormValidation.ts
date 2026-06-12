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
export type ValidationRulesInput<T> = FieldValidationRules | ((values: T) => FieldValidationRules);

function resolveRules<T>(input: ValidationRulesInput<T>, values: T): FieldValidationRules {
  return typeof input === 'function' ? input(values) : input;
}

export function validateFieldValue(name: string, value: any, rules: FieldValidationRules): ValidationError {
  const fieldRules = rules[name];
  if (!fieldRules) return null;

  const normalized =
    typeof value === 'string' ? value.trim() : value;

  if (fieldRules.required && (normalized === '' || normalized === null || normalized === undefined)) {
    return fieldRules.errorMessage || 'This field is required';
  }

  const valueLength = String(normalized ?? '').length;

  if (fieldRules.minLength && valueLength > 0 && valueLength < fieldRules.minLength) {
    return fieldRules.errorMessage || `Must be at least ${fieldRules.minLength} characters`;
  }

  if (fieldRules.maxLength && valueLength > fieldRules.maxLength) {
    return fieldRules.errorMessage || `Must be no more than ${fieldRules.maxLength} characters`;
  }

  if (fieldRules.pattern && valueLength > 0 && !fieldRules.pattern.test(String(normalized))) {
    return fieldRules.errorMessage || 'Invalid format';
  }

  if (fieldRules.custom && !fieldRules.custom(normalized)) {
    return fieldRules.errorMessage || 'Invalid value';
  }

  return null;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRulesInput: ValidationRulesInput<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getRules = (formValues: T = values) => resolveRules(validationRulesInput, formValues);

  const validateField = (name: string, value: any, formValues: T = values): ValidationError => {
    return validateFieldValue(name, value, getRules(formValues));
  };

  const validateForm = (formValues: T = values): boolean => {
    const rules = getRules(formValues);
    const newErrors: ValidationErrors = {};
    let formIsValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const error = validateFieldValue(fieldName, formValues[fieldName as keyof T], rules);
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    return formIsValid;
  };

  const handleChange = (name: keyof T, value: any) => {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    if (touched[name as string]) {
      const error = validateField(name as string, value, nextValues);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  };

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

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (
    onSubmit: (values: T) => Promise<void> | void,
    onError?: (errors: ValidationErrors) => void
  ) => {
    const rules = getRules(values);
    const touchedFields: TouchedFields = {};
    Object.keys(rules).forEach((field) => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    const newErrors: ValidationErrors = {};
    let formIsValid = true;
    Object.keys(rules).forEach((fieldName) => {
      const error = validateFieldValue(fieldName, values[fieldName as keyof T], rules);
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });
    setErrors(newErrors);

    if (!formIsValid) {
      onError?.(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      // Optionally handle error in production
    } finally {
      setIsSubmitting(false);
    }
  };

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
