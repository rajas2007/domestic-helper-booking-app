// ================= VALIDATION UTILITIES =================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return !!(password && password.length >= 6);
};

export const validateName = (name: string): boolean => {
  return !!(name && name.trim().length > 0);
};

export const validatePrice = (price: string | number): boolean => {
  const priceNum = Number(price);
  return !isNaN(priceNum) && priceNum > 0;
};

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export const validateService = (data: {
  title: string;
  description: string;
  price: string;
}): ValidationErrors | null => {
  const errors: ValidationErrors = {};

  if (!data.title || !data.title.trim()) {
    errors.title = "Service title is required";
  }

  if (!data.description || !data.description.trim()) {
    errors.description = "Service description is required";
  }

  if (!data.price) {
    errors.price = "Price is required";
  } else if (!validatePrice(data.price)) {
    errors.price = "Price must be a valid number greater than 0";
  }

  return Object.keys(errors).length === 0 ? null : errors;
};

export const validateRegister = (data: {
  name: string;
  email: string;
  password: string;
}): ValidationErrors | null => {
  const errors: ValidationErrors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = "Name is required";
  }

  if (!data.email || !data.email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else if (!validatePassword(data.password)) {
    errors.password = "Password must be at least 6 characters";
  }

  return Object.keys(errors).length === 0 ? null : errors;
};

export const validateLogin = (data: {
  email: string;
  password: string;
}): ValidationErrors | null => {
  const errors: ValidationErrors = {};

  if (!data.email || !data.email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return Object.keys(errors).length === 0 ? null : errors;
};
