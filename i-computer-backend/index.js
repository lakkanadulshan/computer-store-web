import express from 'express';
import mongoose from 'mongoose';
import dns from 'dns';
import userRouter from './routes/userRouter.js';
import jwt from "jsonwebtoken";
import productRouter from './routes/productRouter.js';
import orderRouter from './routes/orderRouter.js';
import contactRouter from './routes/contactRouter.js';
import cors from 'cors';
import dotenv from 'dotenv';
import { continueWithGoogle } from './controllers/userController.js';

dotenv.config();


// Use Google's public DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();


app.use(cors());

const mongodbURL = process.env.MONGO_URI || process.env.mongoURL;
const port = process.env.PORT || 3000;

//sample

async function ensureOrderIndexes() {
    try {
        const ordersCollection = mongoose.connection.db.collection("orders");
        const indexes = await ordersCollection.indexes();
        const legacyUniqueUserIdIndex = indexes.find(
            (index) => index.name === "userId_1" && index.unique === true
        );

        if (legacyUniqueUserIdIndex) {
            await ordersCollection.dropIndex("userId_1");
            console.log("Dropped legacy unique index on orders.userId");
        }
    } catch (error) {
        console.log("Order index check warning:", error.message);
    }
}



// If the SRV connection above keeps failing, replace it with the standard connection string
// from your Atlas dashboard: Database → Connect → Drivers → select "Node.js" → copy the string

mongoose.connect(mongodbURL)
.then(async () => {
    await ensureOrderIndexes();
    console.log("connected to mongodb")
    app.listen(port, () => {
        console.log(`server running on port ${port}`)
        // console.log("Available routes:")
        // console.log("POST /api/users")
        // console.log("POST /api/users/register")
        // console.log("POST /api/users/login")
        // console.log("POST /api/users/google")
        // console.log("GET  /api/products")
        // console.log("POST /api/products")
        // console.log("PUT  /api/products/:productId")
        // console.log("DELETE /api/products/:productId")
        // console.log("GET  /api/orders")
        // console.log("POST /api/orders")
        

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

app.use((req, res, next) => {
    const publicUserPaths = [
        "/api/users",
        "/api/users/register",
        "/api/users/login",
        "/api/users/google",
        "/api/users/google-login",
        "/api/users/googleLogin",
        "/api/users/continue-with-google",
        "/users",
        "/users/register",
        "/users/login",
        "/users/google",
        "/users/google-login",
        "/users/googleLogin",
        "/users/continue-with-google",
        "/api/auth/google",
        "/api/google"
    ];
    if (publicUserPaths.includes(req.path) && req.method === "POST") {
        return next();
    }

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
app.use('/users', userRouter);
app.post('/api/auth/google', continueWithGoogle);
app.post('/api/google', continueWithGoogle);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/contact', contactRouter);

