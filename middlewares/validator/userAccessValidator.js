async function validateUserAccessData(input = {}) {
  const { id, email, saId, userId, role, inviteBy } = input;
  const errors = [];
  const data = {};
  const sentencePattern = /^[a-zA-Z\s.,!?;:'"-]+$/; // Pattern for sentences with common punctuation

  if (id) {
    if (isNaN(parseInt(id, 10))) {
      errors.push('ID must be an integer');
    } else if (id.length > 10) {
      errors.push('ID should contain at most 10 digits');
    } else {
      data.id = parseInt(id, 10);
    }
  }

  if (email){
    if (!email || !email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    } else {
      data.email = email;
    }
  }

  if (saId) {
    if (!saId.trim()) {
      errors.push('saId is required');
    } else if (saId.length > 10) {
      errors.push('saId should contain at least 10 characters');
    } else {
      data.saId = saId;
    }
  }

  if (userId) {
    if (!userId.trim()) {
      errors.push('userId is required');
    } else if (userId.length > 10) {
      errors.push('userId should contain at most 10 characters');
    } else {
      data.userId = userId;
    }
  }

  if (role) {
    if (!role.trim()) {
      errors.push('Role cannot be empty or whitespace only');
    } else if (role.length < 2) {
      errors.push('Role should contain at least 2 characters');
    } else if (!sentencePattern.test(role)) {
      errors.push('Role should only contain letters, spaces, and common punctuation');
    } else {
      data.role = role.trim();
    }
  }

  
  if (inviteBy) {
    if (!inviteBy.trim()) {
      errors.push('inviteBy is required');
    } else if (inviteBy.length > 10) {
      errors.push('inviteBy should contain at most 10 characters');
    } else {
      data.inviteBy = inviteBy;
    }
  }

  return { data, errors };
}

module.exports = validateUserAccessData;