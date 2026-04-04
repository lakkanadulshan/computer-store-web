import express from 'express';
import { createUser,loginUser } from '../controllers/userController.js';

// create a router for user-related routes
const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.post('/login', loginUser);
// userRouter.get('/', getAllUsers);

export default userRouter;
