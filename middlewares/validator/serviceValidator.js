async function validateServiceData(input = {}) {
  const { svCode, svGroupCode, svName, svDesc, svSlug, svPaymentAmount } = input;
  const errors = [];
  const data = {};

  if (svCode) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!svCode.trim()) {
      errors.push('Service Code cannot be empty or whitespace only');
    } else if (svCode.length < 2) {
      errors.push('Service Code must be at least 2 characters long');
    } else if (!sentencePattern.test(svGroupCode)) {
      errors.push('Service Code should only contain letters, spaces, and common punctuation');
    } else {
      data.svCode = svCode.trim();
    }
  }

  if (svGroupCode) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!svGroupCode.trim()) {
      errors.push('Service Group Code cannot be empty or whitespace only');
    } else if (svGroupCode.length < 2) {
      errors.push('Service Group Code must be at least 2 characters long');
    } else if (!sentencePattern.test(svGroupCode)) {
      errors.push('Service Group Code should only contain letters, spaces, and common punctuation');
    } else {
      data.svGroupCode = svGroupCode.trim();
    }
  }

  if (svName) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!svName.trim()) {
      errors.push('Service Name cannot be empty or whitespace only');
    } else if (svName.length < 2) {
      errors.push('Service Name must be at least 2 characters long');
    } else if (!sentencePattern.test(svName)) {
      errors.push('Service Name should only contain letters, spaces, and common punctuation');
    } else {
      data.svName = svName.trim();
    }
  }

  if (svDesc) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!svDesc.trim()) {
      errors.push('Services Desc cannot be empty or whitespace only');
    } else if (svDesc.length < 2) {
      errors.push('Services Desc must be at least 2 characters long');
    } else if (!sentencePattern.test(svDesc)) {
      errors.push('Services Desc should only contain letters, spaces, and common punctuation');
    } else {
      data.svDesc = svDesc.trim();
    }
  }

  if (svSlug) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!svSlug.trim()) {
      errors.push('Services Slug cannot be empty or whitespace only');
    } else if (svSlug.length < 2) {
      errors.push('Services Slug must be at least 2 characters long');
    } else if (!sentencePattern.test(svSlug)) {
      errors.push('Services Slug should only contain letters, spaces, and common punctuation');
    } else {
      data.svSlug = svSlug.trim();
    }
  }
  
  if (svPaymentAmount) {
    svPaymentAmount = svPaymentAmount.trim();
    if (!svPaymentAmount) {
      errors.push('svPaymentAmount is required');
    } else if (svPaymentAmount.length < 10) {
      errors.push('svPaymentAmount must be at least 10 characters long');
    } else {
      data.svPaymentAmount = svPaymentAmount;
    }
  }

  return { data, errors };
}

module.exports = validateWhatsappData;