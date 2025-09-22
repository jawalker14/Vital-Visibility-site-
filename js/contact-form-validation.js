/**
 * Contact Form Validation Module
 * Enhanced validation for the contact form with real-time feedback
 */

class ContactFormValidator {
  constructor(form) {
    this.form = form;
    this.fields = {
      name: form.querySelector('#name'),
      email: form.querySelector('#email'),
      phone: form.querySelector('#phone'),
      message: form.querySelector('#message'),
      consent: form.querySelector('#consent')
    };
    this.statusElement = form.querySelector('#form-status');
    this.init();
  }

  init() {
    // Add real-time validation on blur
    Object.entries(this.fields).forEach(([fieldName, field]) => {
      if (field && fieldName !== 'consent') {
        field.addEventListener('blur', () => this.validateField(fieldName));
        field.addEventListener('input', () => this.clearFieldError(fieldName));
      }
    });

    // Special handling for consent checkbox
    if (this.fields.consent) {
      this.fields.consent.addEventListener('change', () => this.validateField('consent'));
    }
  }

  validateField(fieldName) {
    const field = this.fields[fieldName];
    if (!field) return true;

    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'name':
        if (value.length < 2) {
          isValid = false;
          errorMessage = 'Name must be at least 2 characters long';
        }
        break;

      case 'email':
        if (!this.isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        // Phone is optional, but if provided should be valid
        if (value && !this.isValidPhone(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid phone number';
        }
        break;

      case 'message':
        if (value.length < 10) {
          isValid = false;
          errorMessage = 'Message must be at least 10 characters long';
        }
        break;

      case 'consent':
        if (!field.checked) {
          isValid = false;
          errorMessage = 'Please provide consent to proceed';
        }
        break;
    }

    this.setFieldState(field, isValid, errorMessage);
    return isValid;
  }

  isValidEmail(email) {
    // More robust email validation than just checking for '@'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7;
  }

  setFieldState(field, isValid, errorMessage) {
    // Remove existing error state
    field.classList.remove('field-error');
    const existingError = field.parentElement.querySelector('.field-error-message');
    if (existingError) {
      existingError.remove();
    }

    if (!isValid && errorMessage) {
      // Add error state
      field.classList.add('field-error');
      const errorElement = document.createElement('div');
      errorElement.className = 'field-error-message';
      errorElement.textContent = errorMessage;
      errorElement.style.color = 'var(--color-red, #dc3545)';
      errorElement.style.fontSize = '0.875rem';
      errorElement.style.marginTop = '0.25rem';
      field.parentElement.appendChild(errorElement);
    }
  }

  clearFieldError(fieldName) {
    const field = this.fields[fieldName];
    if (field) {
      field.classList.remove('field-error');
      const existingError = field.parentElement.querySelector('.field-error-message');
      if (existingError) {
        existingError.remove();
      }
    }
  }

  validateForm() {
    let isFormValid = true;

    // Validate all required fields
    ['name', 'email', 'message', 'consent'].forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        isFormValid = false;
      }
    });

    // Validate optional phone field if provided
    if (this.fields.phone?.value.trim()) {
      if (!this.validateField('phone')) {
        isFormValid = false;
      }
    }

    // If form is invalid, show general error message
    if (!isFormValid) {
      this.showStatus('Please complete all required fields correctly.', false);
    }

    return isFormValid;
  }

  showStatus(message, isSuccess = true) {
    if (this.statusElement) {
      this.statusElement.textContent = message;
      this.statusElement.style.color = isSuccess ? 'var(--color-green, #28a745)' : 'var(--color-red, #dc3545)';
    }
  }

  clearStatus() {
    if (this.statusElement) {
      this.statusElement.textContent = '';
    }
  }
}

// Export for use in other modules
window.ContactFormValidator = ContactFormValidator;