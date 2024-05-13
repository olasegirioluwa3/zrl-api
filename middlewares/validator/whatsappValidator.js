async function validateWhatsappData( input ) {
  const { whatsappNumber, whatsappNumberToken, businessName, businessDesc, businessEmail, verifyToken, graphAPIToken, svId } = input;
  const errors = [];
  const data = {};

  if (id) {
    const sanitizedNumber = id.replace(/\D/g, '');
    if (sanitizedNumber.length < 0) {
      errors.push('id seems too short');
    } else if (sanitizedNumber.length > 15) {
      errors.push('id seems too long');
    } else {
      data.id = sanitizedNumber;
    }
  }

  if (whatsappNumber) {
    const sanitizedNumber = whatsappNumber.replace(/\D/g, '');
    if (sanitizedNumber.length < 10) {
      errors.push('Phone number seems too short');
    } else if (sanitizedNumber.length > 15) {
      errors.push('Phone number seems too long');
    } else {
      data.whatsappNumber = sanitizedNumber;
    }
  }

  if (svId) {
    const sanitizedNumber = svId.replace(/\D/g, '');
  
    if (sanitizedNumber.length < 0) {
      errors.push('svId seems too short');
    } else if (sanitizedNumber.length > 15) {
      errors.push('svId seems too long');
    } else {
      data.svId = sanitizedNumber;
    }
  }

  if (whatsappNumberToken) {
    const sanitizedNumber = whatsappNumberToken.replace(/\D/g, '');
  
    if (sanitizedNumber.length < 3) {
      errors.push('Whatsapp token seems too short');
    } else if (sanitizedNumber.length > 15) {
      errors.push('Phone number seems too long');
    } else {
      data.whatsappNumberToken = sanitizedNumber;
    }
  }
  
  if (businessName) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!businessName.trim()) {
      errors.push('Business Name cannot be empty or whitespace only');
    } else if (businessName.length < 2) {
      errors.push('Business Name must be at least 2 characters long');
    } else if (!sentencePattern.test(businessName)) {
      errors.push('Business Name should only contain letters, spaces, and common punctuation');
    } else {
      data.businessName = businessName.trim();
    }
  }

  if (businessDesc) {
    const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation
    if (!businessDesc.trim()) {
      errors.push('Business Desc cannot be empty or whitespace only');
    } else if (businessDesc.length < 2) {
      errors.push('Business Desc must be at least 2 characters long');
    } else if (!sentencePattern.test(businessDesc)) {
      errors.push('Business Desc should only contain letters, spaces, and common punctuation');
    } else {
      data.businessDesc = businessDesc.trim();
    }
  }

  if (businessEmail){
    if (!businessEmail || !businessEmail.trim()) {
      errors.push('business email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) {
      errors.push('Invalid business email format');
    } else {
      data.businessEmail = businessEmail;
    }
  }
  
  if (graphAPIToken) {
    graphAPIToken = graphAPIToken.trim();
    if (!graphAPIToken) {
      errors.push('graphAPIToken is required');
    } else if (graphAPIToken.length < 10) {
      errors.push('graphAPIToken must be at least 10 characters long');
    } else {
      data.graphAPIToken = graphAPIToken;
    }
  }

  return { data, errors };
}

module.exports = validateWhatsappData;