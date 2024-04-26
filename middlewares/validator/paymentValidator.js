async function validatePaymentData( input ) {
  const { svId, userId, amount, amountPaid, paymentReference, paymentAuthorizer, gateway, currency } = input;
  const errors = [];
  const data = {};

  if (userId) {
    const sanitizedNumber = userId.replace(/\D/g, '');
    if (sanitizedNumber.length < 1) {
      errors.push('userId seems too small');
    } else if (sanitizedNumber.length > 15) {
      errors.push('userId seems too big');
    } else {
      data.userId = sanitizedNumber;
    }
  }

  if (amount) {
    const sanitizedNumber = amount.replace(/\D/g, '');
    if (sanitizedNumber.length < 2) {
      errors.push('Amount seems too small');
    } else if (sanitizedNumber.length > 15) {
      errors.push('Amount seems too big');
    } else {
      data.amount = sanitizedNumber;
    }
  }

  if (amountPaid) {
    const sanitizedNumber = amountPaid.replace(/\D/g, '');
    if (sanitizedNumber.length < 2) {
      errors.push('Amount seems too small');
    } else if (sanitizedNumber.length > 15) {
      errors.push('Amount seems too big');
    } else {
      data.amountPaid = sanitizedNumber;
    }
  }

  if (paymentReference) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!paymentReference.trim()) {
      errors.push('Payment Reference cannot be empty or whitespace only');
    } else if (paymentReference.length < 2) {
      errors.push('Payment Reference must be at least 2 characters long');
    } else if (!sentencePattern.test(paymentReference)) {
      errors.push('Payment Reference should only contain letters, spaces, and common punctuation');
    } else {
      data.paymentReference = paymentReference.trim();
    }
  }

  if (gateway) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!gateway.trim()) {
      errors.push('Gateway cannot be empty or whitespace only');
    } else if (gateway.length < 2) {
      errors.push('Gateway must be at least 2 characters long');
    } else if (!sentencePattern.test(gateway)) {
      errors.push('Gateway should only contain letters, spaces, and common punctuation');
    } else {
      data.gateway = gateway.trim();
    }
  }

  if (currency) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!currency.trim()) {
      errors.push('Currency cannot be empty or whitespace only');
    } else if (currency.length < 2) {
      errors.push('Currency must be at least 2 characters long');
    } else if (!sentencePattern.test(currency)) {
      errors.push('Currency should only contain letters, spaces, and common punctuation');
    } else {
      data.currency = currency.trim();
    }
  }

  return { data, errors };
}

module.exports = validatePaymentData;