const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

// -------------------------------
// COOKIE SETTINGS (SHARED)
// -------------------------------
const COOKIE_OPTIONS = {
    httpOnly: true,                 // JS cannot access the cookie
    secure: true,                   // Required for HTTPS (production)
    sameSite: "none",               // REQUIRED for cross-domain cookies
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// -------------------------------
// REGISTER USER
// -------------------------------
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
            },
        });

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set login cookie
        res.cookie("token", token, COOKIE_OPTIONS);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// -------------------------------
// LOGIN USER
// -------------------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set login cookie
        res.cookie("token", token, COOKIE_OPTIONS);

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// -------------------------------
// LOGOUT USER
// -------------------------------
const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    res.json({ message: "Logout successful" });
};

// -------------------------------
// GET LOGGED-IN USER INFO
// -------------------------------
const me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, firstName: true, lastName: true },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });

    } catch (error) {
        console.error("ME Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { register, login, logout, me };
