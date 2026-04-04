import express from 'express';
import mongoose from 'mongoose';
import dns from 'dns';
import userRouter from './routes/userRouter.js';
import jwt from "jsonwebtoken";
import productRouter from './routes/productRouter.js';
import orderRouter from './routes/orderRouter.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


// Use Google's public DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();


app.use(cors());

const mongodbURL = process.env.mongoURL;



// If the SRV connection above keeps failing, replace it with the standard connection string
// from your Atlas dashboard: Database → Connect → Drivers → select "Node.js" → copy the string

mongoose.connect(mongodbURL)
.then(() => {
    console.log("connected to mongodb")
    app.listen(3000, () => {
        console.log("server running on port 3000")
        

    })
})
.catch((err) => {
    console.log("Error connecting to mongodb:", err.message)

    
})


//use the express.json() middleware to parse JSON request bodies
app.use(express.json());

// app.use((req, res, next) => {
//   const authorizationHeader = req.headers.authorization;

//   if (!authorizationHeader) {
//     return next();
//   }

//   const token = authorizationHeader.replace("Bearer ", "");
//   console.log(authorizationHeader);

//   jwt.verify(token, "secretKey@2003", (error, content) => {
//     if (error || !content) {
//       console.log("invalid token");
//       return res.status(401).json({
//         message: "Invalid token"
//       });
//     }

//     console.log(content);
//     req.user = content; // Attach the decoded user information to the request object for use in subsequent routes
//     return next();
//   });
// });

// Use the userRouter for all routes starting with /users

app.use((req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return next();

    }
    const token = authHeader.replace("Bearer ", "");
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        return res.status(500).json({
            message: "JWT secret is not configured"
        });
    }

    jwt.verify(token, jwtSecret, (error, content) => {
        if (error || content == null) {
            console.log("invalid token");
            return res.status(401).json({
                message: "Invalid token"
            });
        }else{
            console.log(content);
            req.user = content;
            next();
            
    }

    });

});


app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

