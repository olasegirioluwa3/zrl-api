const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Sequelize = require("sequelize"); // Import Sequelize
const { sequelize } = require("../models");
const User = sequelize.models.user;
const validateUserData = "../middlewares/validator/index";
const { sendEmail } = require("../utils/email");
const domain = process.env.APP_WEBSITE_URL || "localhost:3000";

const generateToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

// module.exports = () => {
async function registerUser(req, res, data) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10); // Hash password with a cost factor of 10
    data.password = hashedPassword;
    const token = generateToken();
    data.emailVerificationToken = token;

    const verifyLink = `${domain}/account/email-verify/${token}`;
    const emailText = `To verify your account email, click on the following link: ${verifyLink}`;
    const newUser = new User(data);
    if (await newUser.save(data)) {
      await sendEmail(data.email, "Activate your account", emailText);
      res.status(201).json({ message: "Registration successful" });
    } else {
      res.status(401).json({ message: "Registration failed, try again" });
    }
  } catch (error) {
    console.error(error.message);
    if (error instanceof Sequelize.UniqueConstraintError) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Registration failed on C" });
    }
  }
}

async function loginUser(req, res, data) {
  try {
    const { email, password } = data;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Record not found" });
    } else if (user.emailVerificationStatus !== "Activated") {
      return res.status(401).json({
        message:
          "Account not activated! Please, check your email for verification link",
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }
    const token = jwt.sign(
      { userId: user.id, userRole: user.role },
      process.env.APP_JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );
    res.status(200).json({ token, user: { id: user.id, email, role: "user" } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getProfile(req, res) {
  try {
    // Extract user ID from the authenticated token
    const userId = req.user.userId; // Assuming 'req.user' is populated by authentication middleware

    // Fetch user data based on ID
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // Exclude password for security
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Consider including related entities (e.g., applications, posts)
    // Use appropriate joins or eager loading based on your data model

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId; // Extract ID from authenticated user
    const { firstName, lastName, bio } = req.body; // Update fields

    // Implement validation for update data (optional)

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.bio = bio;

    await user.save(); // Save updated user data

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    // Handle potential validation errors or database errors
    res.status(500).json({ message: "Failed to update profile" });
  }
}

async function updateProfilePicture(req, res) {
  try {
    const userId = req.user.userId; // Extract ID from authenticated user

    // Assuming 'uploadProfilePicture' middleware handles file upload and stores the path in req.file

    if (!req.file) {
      return res.status(400).json({ message: "No profile picture uploaded" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = req.file.path; // Update profile picture path

    await user.save(); // Save updated user data

    res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.error(error);
    // Handle potential errors during file upload or database update
    res.status(500).json({ message: "Failed to update profile picture" });
  }
}

async function updateCoverPicture(req, res) {
  try {
    const userId = req.user.userId; // Extract ID from authenticated user

    // Assuming 'uploadCoverPicture' middleware handles file upload and stores the path in req.file

    if (!req.file) {
      return res.status(400).json({ message: "No cover picture uploaded" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.coverPicture = req.file.path; // Update cover picture path

    await user.save(); // Save updated user data

    res.status(200).json({ message: "Cover picture updated successfully" });
  } catch (error) {
    console.error(error);
    // Handle potential errors during file upload or database update
    res.status(500).json({ message: "Failed to update cover picture" });
  }
}

async function getUserByUsername(req, res) {
  try {
    const username = req.params.username; // Extract username from request path

    // Implement access control logic here (consider privacy settings)
    // This might involve checking if the requesting user can view other user profiles

    const user = await User.findOne({
      where: { username },
      exclude: { password },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Consider including only public user information (exclude sensitive data)

    res.status(200).json({ user: { username: user.username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
}

async function forgotPassword(req, res, data) {
  try {
    const { email } = data;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid email address" }); // Avoid revealing if user exists for security
    }
    const token = generateToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    const resetLink = `${domain}/account/new-password/${token}`;
    const emailText = `To reset your password, click on the following link: ${resetLink}`;
    if (await sendEmail(email, "Password Reset", emailText)) {
      await user.save();
      res.status(200).send({
        status: "success",
        message: "Password reset link sent successfully!",
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to send password reset instructions" });
  }
}

async function verifyAccountEmail(req, res, data) {
  try {
    const { emailVerificationToken } = data;
    const user = await User.findOne({
      where: { emailVerificationToken: emailVerificationToken },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid reset token" });
    }
    user.emailVerificationToken = "";
    user.emailVerificationStatus = "Activated";
    const link = `${domain}/login`;
    const emailText = `Account verified successfully, click on the following link to login: ${link}`;
    if (
      await sendEmail(user.email, "Account verified successfully", emailText)
    ) {
      await user.save();
      res.status(200).json({
        status: "success",
        message: "Account email verified successfully, proceed to login",
        user,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
}

async function resetPasswordInit(req, res, data) {
  try {
    const { resetPasswordToken } = data;
    const user = await User.findOne({
      where: { resetPasswordToken: resetPasswordToken },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid reset token" });
    }
    res.status(200).json({
      status: "success",
      message: "Reset Email Token is Valid",
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
}

async function resetPasswordFinal(req, res, data) {
  try {
    const { resetPasswordToken, password } = data;
    const user = await User.findOne({
      where: { resetPasswordToken: resetPasswordToken },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid reset token" });
    }
    if (user.resetPasswordExpires && user.resetPasswordExpires < Date.now()) {
      return res
        .status(401)
        .json({ message: "Reset token has expired! Please, try again." });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash new password
    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = "";
    user.emailVerificationToken = "";
    user.emailVerificationStatus = "Activated";
    const link = `${domain}/account/signin`;
    const emailText = `Reset password successfully, click on the following link to login: ${link}`;
    if (await sendEmail(user.email, "Reset Password Successfully", emailText)) {
      await user.save();
      res.status(200).json({
        status: "success",
        message: "Password reset was successful",
        email: user.email,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
}

async function resetPassword(req, res) {
  try {
    const userId = req.user.userId; // Extract ID from authenticated user
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash new password
    user.password = hashedPassword;

    await user.save(); // Save updated user data

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
}

async function verifyResetToken(token) {
  try {
    const decodedToken = jwt.verify(token, process.env.RESET_TOKEN_SECRET); // Decode using a secret

    // Check for expiry
    const issuedAt = decodedToken.iat;
    const expirationTime = 60 * 60 * 24; // 24 hours in seconds
    const isExpired = Date.now() / 1000 > issuedAt + expirationTime;

    if (isExpired) {
      return false; // Reject expired tokens
    }

    // Validate user ID consistency
    const userId = decodedToken.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return false; // Reject tokens for non-existent users
    }

    // Optionally check for a used token
    // if (user.resetTokenUsedAt && user.resetTokenUsedAt > issuedAt) {
    //   return false; // Reject already used tokens
    // }

    return true; // Token is valid
  } catch (error) {
    console.error("Invalid token:", error);
    return false; // Reject invalid tokens
  }
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updateProfilePicture,
  updateCoverPicture,
  getUserByUsername,
  forgotPassword,
  verifyAccountEmail,
  resetPasswordInit,
  resetPasswordFinal,
  resetPassword,
  verifyResetToken,
};
// }
