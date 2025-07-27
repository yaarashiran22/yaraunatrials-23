// Security utilities for input validation and sanitization
import DOMPurify from 'dompurify';

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  price: /^\d+(\.\d{1,2})?$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
} as const;

// Content length limits
export const CONTENT_LIMITS = {
  title: 100,
  description: 500,
  content: 280,
  bio: 200,
  name: 50,
  location: 50,
} as const;

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
};

// Validate and sanitize text input
export const validateAndSanitizeText = (
  text: string,
  maxLength: number,
  required = false
): { isValid: boolean; value: string; error?: string } => {
  if (!text && required) {
    return { isValid: false, value: '', error: 'This field is required' };
  }
  
  if (!text) {
    return { isValid: true, value: '' };
  }

  const sanitized = sanitizeInput(text);
  
  if (sanitized.length > maxLength) {
    return { 
      isValid: false, 
      value: sanitized, 
      error: `Text must be ${maxLength} characters or less` 
    };
  }

  return { isValid: true, value: sanitized };
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.email.test(email);
};

// Validate UUID format
export const validateUUID = (uuid: string): boolean => {
  return VALIDATION_PATTERNS.uuid.test(uuid);
};

// Validate price format
export const validatePrice = (price: string): { isValid: boolean; value?: number; error?: string } => {
  if (!price) {
    return { isValid: true };
  }

  if (!VALIDATION_PATTERNS.price.test(price)) {
    return { isValid: false, error: 'Invalid price format' };
  }

  const numPrice = parseFloat(price);
  if (numPrice < 0) {
    return { isValid: false, error: 'Price cannot be negative' };
  }

  if (numPrice > 1000000) {
    return { isValid: false, error: 'Price is too high' };
  }

  return { isValid: true, value: numPrice };
};

// Rate limiting utilities
const requestCounts = new Map<string, { count: number; timestamp: number }>();

export const checkRateLimit = (
  userId: string, 
  action: string, 
  maxRequests = 5, 
  windowMs = 60000
): boolean => {
  const key = `${userId}-${action}`;
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now - record.timestamp > windowMs) {
    requestCounts.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

// File validation for uploads
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File is too large. Maximum size is 5MB.' };
  }

  return { isValid: true };
};

// Secure content filtering
export const containsInappropriateContent = (text: string): boolean => {
  // Basic content filtering - in production, use a proper content moderation service
  const inappropriateWords = ['spam', 'scam', 'fraud']; // Add more as needed
  const lowerText = text.toLowerCase();
  
  return inappropriateWords.some(word => lowerText.includes(word));
};

// Authorization checks
export const canUserModifyItem = (userId: string, itemUserId: string): boolean => {
  return userId === itemUserId;
};

export const canUserViewProfile = (
  currentUserId: string | null, 
  profileUserId: string, 
  isPrivateProfile: boolean
): boolean => {
  // Public profiles can be viewed by anyone
  if (!isPrivateProfile) return true;
  
  // Private profiles can only be viewed by the owner
  return currentUserId === profileUserId;
};