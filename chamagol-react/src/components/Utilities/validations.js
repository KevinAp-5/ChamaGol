import validator from "validator";
// Validate email format
export const validateEmail = (email) => {
    return validator.isEmail(email);
  };
  
// Validate password length (e.g., at least 6 characters)
export const validatePassword = (password) => {
  return password.length >= 8;
};

// Validate if two passwords match (e.g., for signup)
export const validatePasswordsMatch = (password, confirmPassword) => {
  return password == confirmPassword;
};

export const validateName = (name) => {
  const nameRule = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;
  return nameRule.test(name);
}