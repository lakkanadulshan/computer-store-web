import User from "../models/user.js";
import OTP from "../models/otp.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";

const googleClient = new OAuth2Client();

function getEmailConfig() {
    const gmailUser = String(process.env.GMAIL_USER || process.env.Gmail_User || "testlakkana@gmail.com").trim();
    const gmailAppPassword = String(process.env.GMAIL_APP_PASSWORD || process.env.Gmail_App_PASSWORD || "").trim();

    return {
        gmailUser,
        gmailAppPassword
    };
}

export function isAdmin(req) {
    return req?.user?.role === "admin";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildAutoProfileImage(firstName, lastName) {
    const fullName = `${String(firstName || "").trim()} ${String(lastName || "").trim()}`.trim() || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0A0F1E&color=F0F4FF`;
}

export async function registerUser(req, res) {
    const { email, firstName, lastName, password, phone, address, city, state, zipCode, country } = req.body;

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

        const cleanedFirstName = String(firstName).trim();
        const cleanedLastName = String(lastName).trim();

        const user = new User({
            email: normalizedEmail,
            firstName: cleanedFirstName,
            lastName: cleanedLastName,
            password: hashedPassword,
            role: "customer",
            image: buildAutoProfileImage(cleanedFirstName, cleanedLastName),
            phone: String(phone || "").trim(),
            address: String(address || "").trim(),
            city: String(city || "").trim(),
            state: String(state || "").trim(),
            zipCode: String(zipCode || "").trim(),
            country: String(country || "").trim()
        });

        await user.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                image: user.image
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
            image: user.image,
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
            country: user.country
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
        } else if (googlePayload.picture && String(googlePayload.picture).trim()) {
            user.image = String(googlePayload.picture).trim();
            await user.save();
        }

        const appPayload = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            image: user.image,
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
            country: user.country
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

export async function validateOTPAndUpdatePassword(req, res) {
    try {
        const otp = req.body?.otp;
        const email = req.body?.email;
        const newPassword = req.body?.newPassword;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP, and newPassword are required"
            });
        }

        const otpRecord = await OTP.findOne({
            email: email,
            otp: otp
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await User.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    password: hashedPassword,
                    isEmailVerified: true
                }
            }
        );

        await OTP.deleteMany({ email: email });

        return res.status(200).json({
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Error in validateOTPAndUpdatePassword:", {
            message: error?.message,
            stack: error?.stack,
        });
        return res.status(500).json({
            message: "An error occurred while validating OTP and updating password",
            error: error.message
        });
    }


}
export async function sendOTP(req, res) {
    try {
        const { email } = req.params;
        const { gmailUser, gmailAppPassword } = getEmailConfig();

        if (!gmailAppPassword) {
            return res.status(500).json({
                message: "Email service is not configured",
                hint: "Set GMAIL_APP_PASSWORD (or Gmail_App_PASSWORD) in .env"
            });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: gmailUser,
                pass: gmailAppPassword
            }
        });

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await OTP.deleteMany({ 
            email: email
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const newOTP = new OTP({
            email: email,
            otp: otp
        });
        await newOTP.save();

        const message = {
            from: gmailUser,
            to: user.email,
            subject: "OTP for Email Verification",
            text: `Your OTP for email verification is: ${newOTP.otp}`
        };

        transporter.sendMail(message, (error, info) => {
            if (error) {
                console.error("Error sending OTP email:", error);
                return res.status(500).json({
                    message: "Failed to send OTP email"
                });
            } else {
                console.log("OTP email sent:", info.response);
                return res.status(200).json({
                    message: "OTP email sent successfully"
                });
            }
        });
    }
    catch (error) {
        console.error("Error in sendOTP:", {
            message: error?.message,
            stack: error?.stack,
        });
        return res.status(500).json({
            message: "An error occurred while sending OTP",
            error: error.message
        });
    }
}

export async function getMyProfile(req, res) {
    if (!req.user?.email) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {
        const email = String(req.user.email).trim().toLowerCase();
        const user = await User.findOne({ email }).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch profile",
            error: error.message
        });
    }
}

export async function updateMyProfile(req, res) {
    if (!req.user?.email) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try {
        const email = String(req.user.email).trim().toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const firstName = String(req.body?.firstName || "").trim();
        const lastName = String(req.body?.lastName || "").trim();
        const phone = String(req.body?.phone || "").trim();
        const address = String(req.body?.address || "").trim();
        const city = String(req.body?.city || "").trim();
        const state = String(req.body?.state || "").trim();
        const zipCode = String(req.body?.zipCode || "").trim();
        const country = String(req.body?.country || "").trim();

        if (!firstName || !lastName) {
            return res.status(400).json({
                message: "First name and last name are required"
            });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        user.address = address;
        user.city = city;
        user.state = state;
        user.zipCode = zipCode;
        user.country = country;

        const hasGoogleImage = String(user.image || "").startsWith("https://lh3.googleusercontent.com");
        const hasAutoAvatar = String(user.image || "").startsWith("https://ui-avatars.com/api/");
        if (!hasGoogleImage && (hasAutoAvatar || !user.image || user.image === "/default-profile-pic.png")) {
            user.image = buildAutoProfileImage(firstName, lastName);
        }

        await user.save();

        const payload = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            image: user.image,
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
            country: user.country
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2h"
        });

        return res.status(200).json({
            message: "Profile updated successfully",
            token,
            user: payload
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
}

export async function getAllUsers(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Forbidden"
        });
    }

    try {
        const users = await User.find().select("-password").sort({ createdAt: -1, _id: -1 });
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
}

export async function updateUserBlockStatus(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "Forbidden"
        });
    }

    try {
        const email = String(req.params.email || "").trim().toLowerCase();
        if (!email) {
            return res.status(400).json({
                message: "User email is required"
            });
        }

        const isBlocked = Boolean(req.body?.isBlocked);

        const user = await User.findOneAndUpdate(
            { email },
            { isBlocked },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update user status",
            error: error.message
        });
    }
}

