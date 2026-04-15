import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
         email: {
            type: String,
            required: true,
            unique: true
        },
         firstName: {
            type: String,
            required: true
        },
         lastName: {
            type: String,
            required: true
        },
         password: {
            type: String,
            required: true
    
        },
         role: {
            type: String,
            default: "customer"
        },
        isBlocked:{
            type:Boolean,
            default: false
        },
        isEmailVerified:{
            type:Boolean,
            default: false
        },
        image:{
            type: String,
            required: true,
            default :"/default-profile-pic.png"
        },
        phone: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        state: {
            type: String,
            default: ""
        },
        zipCode: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: ""
        }
    }
)

const User= mongoose.model("User", userSchema);
export default User;


