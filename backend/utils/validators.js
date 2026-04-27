// ================= VALIDATION UTILITIES =================

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateName = (name) => {
  return name && name.trim().length > 0;
};

const validatePrice = (price) => {
  const priceNum = Number(price);
  return !isNaN(priceNum) && priceNum > 0;
};

const validateService = (data) => {
  const errors = {};

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

  if (!data.worker_id) {
    errors.worker_id = "Worker ID is required";
  }

  return Object.keys(errors).length === 0 ? null : errors;
};

const validateRegister = (data) => {
  const errors = {};

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

const validateLogin = (data) => {
  const errors = {};

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

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validatePrice,
  validateService,
  validateRegister,
  validateLogin,
};
