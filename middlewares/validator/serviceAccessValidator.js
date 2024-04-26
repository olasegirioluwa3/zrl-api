async function validateServiceAccessData(input = {}) {
  const { svId, svProductId, amountPaid, paymentReference, paymentAuthorizer, gateway, currency } = input;
  const errors = [];
  const data = {};
  const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation

  if (svId) {
    if (!svId.trim()) {
      errors.push('svId is required');
    } else if (svId.length > 10) {
      errors.push('svId should contain at least 10 characters');
    } else {
      data.svId = svId;
    }
  }

  if (svProductId) {
    if (!svProductId.trim()) {
      errors.push('svProductId is required');
    } else if (svProductId.length > 10) {
      errors.push('svProductId should contain at least 10 characters');
    } else {
      data.svProductId = svProductId;
    }
  }

  if (amountPaid) {
    if (!amountPaid.trim()) {
      errors.push('amountPaid is required');
    } else if (amountPaid.length > 10) {
      errors.push('amountPaid should contain at least 10 characters');
    } else {
      data.amountPaid = amountPaid;
    }
  }

  if (paymentReference) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!paymentReference.trim()) {
      errors.push('paymentReference cannot be empty or whitespace only');
    } else if (paymentReference.length < 6) {
      errors.push('paymentReference must be at least 2 characters long');
    } else if (!sentencePattern.test(paymentReference)) {
      errors.push('paymentReference should only contain letters, spaces, and common punctuation');
    } else {
      data.paymentReference = paymentReference.trim();
    }
  }
  
  if (paymentAuthorizer) {
    if (!paymentAuthorizer.trim()) {
      errors.push('paymentAuthorizer cannot be empty or whitespace only');
    } else if (paymentAuthorizer.length < 6) {
      errors.push('paymentAuthorizer must be at least 2 characters long');
    } else {
      data.paymentAuthorizer = paymentAuthorizer.trim();
    }
  }

  if (gateway) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!gateway.trim()) {
      errors.push('gateway cannot be empty or whitespace only');
    } else if (gateway.length < 6) {
      errors.push('gateway must be at least 2 characters long');
    } else if (!sentencePattern.test(gateway)) {
      errors.push('gateway should only contain letters, spaces, and common punctuation');
    } else {
      data.gateway = gateway.trim();
    }
  }

  if (currency) {
    if (!currency.trim()) {
      errors.push('Currency cannot be empty or whitespace only');
    } else if (currency.length < 2) {
      errors.push('Currency should contain at least 2 characters');
    } else if (!sentencePattern.test(currency)) {
      errors.push('Currency should only contain letters, spaces, and common punctuation');
    } else {
      data.currency = currency.trim();
    }
  }

  return { data, errors };
}

module.exports = validateServiceAccessData;