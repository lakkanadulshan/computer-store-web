import express from 'express';
import { createUser, registerUser, loginUser, continueWithGoogle } from '../controllers/userController.js';

// create a router for user-related routes
const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/google', continueWithGoogle);
userRouter.post('/google-login', continueWithGoogle);
userRouter.post('/googleLogin', continueWithGoogle);
userRouter.post('/continue-with-google', continueWithGoogle);
// userRouter.get('/', getAllUsers);

export default userRouter;
