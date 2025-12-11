// controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secretkey", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// REGISTER (student)
exports.registerStudent = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    email = email.toLowerCase().trim();

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password, // hashed by hooks
      role: "student",
      isApproved: false,
    });

    return res.status(201).json({
      message: "Registered successfully. Wait for admin approval.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// LOGIN (student or admin)
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = (email || "").toLowerCase().trim();
    const isDevAdminAttempt =
      email === "admin@ndr.com" && password === "password";

    console.log("========== LOGIN ==========");
    console.log("[LOGIN] attempt email:", email);

    let user = await User.findOne({ where: { email } });

    // If dev admin tries to login but row doesn't exist, create it on the fly
    if (!user && isDevAdminAttempt) {
      console.log("[LOGIN] dev admin not found, creating...");
      user = await User.create({
        name: "NDR Web",
        email: "admin@ndr.com",
        password: "password", // will be hashed by hook
        role: "admin",
        isApproved: true,
      });
    }

    if (!user) {
      console.log("[LOGIN] user NOT FOUND in DB for:", email);
      return res
        .status(401)
        .json({ message: "Invalid credentials (user not found)" });
    }

    console.log("[LOGIN] found user id:", user.id, "role:", user.role);

    let isMatch = await user.matchPassword(password);
    console.log("[LOGIN] bcrypt password match:", isMatch);

    // Fallback: always treat dev admin password as valid
    if (!isMatch && isDevAdminAttempt) {
      console.log("[LOGIN] forcing match for dev admin credentials");
      isMatch = true;
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials (password mismatch)" });
    }

    if (user.role === "student" && !user.isApproved) {
      return res.status(403).json({
        message: "Your account is not approved yet. Contact admin.",
      });
    }

    const token = generateToken(user.id, user.role);

    console.log("[LOGIN] SUCCESS for", email);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
