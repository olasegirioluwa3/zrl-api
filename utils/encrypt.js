require('dotenv').config();

const crypto = require('crypto');

function generateRandomNumber() {
  const randomNumber = crypto.randomBytes(3).readUIntLE(0, 3) % 1000000; // Generate a 3-byte random number and take modulo 1000000
  return randomNumber.toString().padStart(6, '0'); // Pad the number with zeros if needed to ensure it has 6 digits
}

function encryptNumber(number, key) {
    const modulus = Math.pow(10, Math.ceil(Math.log10(number + 1))); // Get the modulus based on the number's length
    return (number + key) % modulus;
}
  
function decryptNumber(encryptedNumber, key) {
    const modulus = Math.pow(10, Math.ceil(Math.log10(encryptedNumber + 1))); // Get the modulus based on the encrypted number's length
    return (encryptedNumber - key + modulus) % modulus;
}

// generateToken used in for email verification
const generateToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

module.exports = { generateRandomNumber, encryptNumber, decryptNumber, generateToken };
