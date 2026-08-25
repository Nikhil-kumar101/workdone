const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// ==========================================
// JWT SECRET
// ==========================================

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (
    typeof secret !== "string" ||
    secret.trim().length < 32
  ) {
    throw new Error(
      "JWT_SECRET must exist and contain at least 32 characters"
    );
  }

  return secret.trim();
};


// ==========================================
// CREATE JWT
// ==========================================

const createToken = (userId) => {
  const secret = getJwtSecret();

  return jwt.sign(
    {
      id: userId,
    },
    secret,
    {
      expiresIn: "7d",
      algorithm: "HS256",
    }
  );
};


// ==========================================
// REGISTER
// ==========================================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body || {};

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters",
      });
    }


    // ----------------------------------------
    // CHECK EXISTING USER
    // ----------------------------------------

    const existingUser =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }


    // ----------------------------------------
    // HASH PASSWORD
    // ----------------------------------------

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );


    // ----------------------------------------
    // CREATE USER
    // ----------------------------------------

    const user =
      await User.create({
        name: cleanName,
        email: cleanEmail,
        passwordHash,
      });


    // ----------------------------------------
    // CREATE TOKEN
    // ----------------------------------------

    const token =
      createToken(
        user._id.toString()
      );


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully",

      token,

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "REGISTRATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not create account",
    });
  }
};


// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body || {};


    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }


    const cleanEmail =
      email.trim().toLowerCase();


    // ----------------------------------------
    // FIND USER
    // ----------------------------------------

    const user =
      await User.findOne({
        email: cleanEmail,
      });


    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }


    // ----------------------------------------
    // CHECK PASSWORD HASH
    // ----------------------------------------

    if (
      !user.passwordHash ||
      typeof user.passwordHash !== "string"
    ) {
      console.error(
        "LOGIN ERROR: User has no valid passwordHash"
      );

      return res.status(500).json({
        success: false,
        message:
          "Account authentication data is invalid",
      });
    }


    // ----------------------------------------
    // COMPARE PASSWORD
    // ----------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );


    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }


    // ----------------------------------------
    // CREATE JWT
    // ----------------------------------------

    const token =
      createToken(
        user._id.toString()
      );


    console.log(
      "LOGIN SUCCESS:",
      user.email
    );


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      token,

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {

    console.error(
      "================================"
    );

    console.error(
      "LOGIN ERROR"
    );

    console.error(
      "Name:",
      error.name
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Stack:",
      error.stack
    );

    console.error(
      "================================"
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not login",
    });
  }
};


// ==========================================
// GET CURRENT USER
// ==========================================

const getMe = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }


    const user =
      await User.findById(
        req.user._id
      ).select(
        "-passwordHash"
      );


    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }


    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(
      "GET ME ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not get user",
    });
  }
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  register,
  login,
  getMe,
};