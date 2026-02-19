export function isUsernameValid(username: string) {
  // lastname + 2 digits, letters only for lastname part
  return /^[A-Za-z]+\d{2}$/.test(username);
}

export function isPasswordValid(password: string) {
  // Simple, consistent rule for this assignment
  // At least 6 chars, must include at least one letter and one digit
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
}

export function isEmailValid(email: string) {
  // Simplest usable structure: xxxxx@xx.xx
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function isPhoneValid(phone: string) {
  return /^\d{10}$/.test(phone);
}

export function isAirlineFlightNoValid(s: string) {
  return /^[A-Za-z]{2}\d{4}$/.test(s);
}

export function isTicketValid(s: string) {
  return /^\d{10}$/.test(s);
}

export function isLuggageIdValid(s: string) {
  return /^\d{6}$/.test(s);
}
