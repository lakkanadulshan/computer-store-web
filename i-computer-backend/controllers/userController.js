import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

export function isAdmin(req) {
    return req?.user?.role === "admin";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function registerUser(req, res) {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({
            message: "Email, first name, last name, and password are required"
        });
    }

    if (!isValidEmail(String(email).trim().toLowerCase())) {
        return res.status(400).json({
            message: "Invalid email format"
        });
    }

    if (String(password).length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }

    try {
        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = new User({
            email: normalizedEmail,
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            password: hashedPassword,
            role: "customer"
        });

        await user.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
}

export const createUser = registerUser;
export function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    return User.findOne({ email: normalizedEmail }).then((user) => {
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);

        

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }

        const payload = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            image: user.image
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET,{
            expiresIn: "2h"
        });


        return res.status(200).json({
            message: "Login successful",
        
            token: token,
            role: user.role
        });
    }).catch(() => {
        return res.status(500).json({
            message: "Login failed"
        });
    });
}

export async function continueWithGoogle(req, res) {
    const idToken = req.body?.token || req.body?.idToken || req.body?.credential;
    const accessToken = req.body?.access_token || req.body?.accessToken;
    const googleClientIds = String(process.env.GOOGLE_CLIENT_ID || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    if (!idToken && !accessToken) {
        return res.status(400).json({
            message: "Google token is required",
            hint: "Send one of: credential/idToken/token (ID token) or access_token."
        });
    }

    if (googleClientIds.length === 0) {
        return res.status(500).json({
            message: "Google client id is not configured",
            hint: "Set GOOGLE_CLIENT_ID in .env (you can provide one or multiple comma-separated client IDs)."
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            message: "JWT secret is not configured"
        });
    }

    try {
        let googlePayload;

        if (idToken) {
            const ticket = await googleClient.verifyIdToken({
                idToken: idToken,
                audience: googleClientIds
            });
            googlePayload = ticket.getPayload();
        } else {
            const googleUserResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!googleUserResponse.ok) {
                const googleErrorText = await googleUserResponse.text();
                return res.status(401).json({
                    message: "Invalid Google access token",
                    error: googleErrorText
                });
            }

            googlePayload = await googleUserResponse.json();
        }

        if (!googlePayload?.email) {
            return res.status(400).json({
                message: "Google account email is not available"
            });
        }

        const email = String(googlePayload.email).trim().toLowerCase();
        let user = await User.findOne({ email: email });

        if (!user) {
            // Google users don't provide a local password, so store an unusable random hash.
            const randomPasswordHash = bcrypt.hashSync(`${email}-${Date.now()}`, 10);

            user = new User({
                email: email,
                firstName: googlePayload.given_name || "Google",
                lastName: googlePayload.family_name || "User",
                password: randomPasswordHash,
                role: "customer",
                isEmailVerified: Boolean(googlePayload.email_verified),
                image: googlePayload.picture || "/default-profile-pic.png"
            });

            await user.save();
        }

        const appPayload = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            image: user.image
        };

        const appToken = jwt.sign(appPayload, process.env.JWT_SECRET, {
            expiresIn: "2h"
        });

        return res.status(200).json({
            message: "Google login successful",
            token: appToken,
            role: user.role
        });
    } catch (error) {
        console.error("Google login error:", {
            message: error?.message,
            stack: error?.stack,
        });

        return res.status(401).json({
            message: "Invalid Google token",
            error: error.message,
            hint: "If using useGoogleLogin flow: implicit, send access_token. If using Google Identity Services credential response, send credential/idToken and configure GOOGLE_CLIENT_ID."
        });
    }
}
