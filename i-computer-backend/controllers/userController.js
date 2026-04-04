import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";



export function createUser(req, res) {

    const data = req.body
    // console.log(data)
    // Hash the password before saving the user
    const hashedPassword = bcrypt.hashSync(data.password, 10)
    
    // Create a new user instance with the hashed password
    const user = new User({
        email:data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        role: data.role
    })
    user.save().then(() => {
        res.json({
            message: "User created successfully",
        })
    })
}

export function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    return User.findOne({ email }).then((user) => {
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



export function isAdmin(req) {
    if (req.user && req.user.role === "admin") {
        return true;
    }
    return false;
}

// sample comment