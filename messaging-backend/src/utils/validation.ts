// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation
export const isValidUsername = (username: string): boolean => {
  // Username: 3-30 characters, alphanumeric, underscore, hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6;
};

// Strong password validation (optional)
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// MongoDB ObjectId validation
export const isValidObjectId = (id: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

// Sanitize input (remove HTML tags)
export const sanitizeInput = (input: string): string => {
  return input.replace(/<[^>]*>/g, '').trim();
};

// Validate message content
export const isValidMessageContent = (content: string): boolean => {
  return content.trim().length > 0 && content.length <= 5000;
};

// Validate conversation participants
export const isValidParticipants = (participants: string[]): boolean => {
  return participants.length >= 2 && participants.every(isValidObjectId);
};

// Validate file URL (basic check)
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};