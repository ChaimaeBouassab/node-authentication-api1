import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
//import { verifyAccessToken } from "./Helpers/JWTHelpers";
import AuthRoute from "./Routes/AuthRoute.js";
import "./Helpers/InitRedis.js";
import "./Helpers/InitMongodb.js";

// Load environment variables from .env file

dotenv.config();

const app = express();

// Middleware for logging HTTP requests
app.use(morgan("dev"));

// Middleware for parsing JSON request bodies
app.use(express.json());

// Middleware for parsing URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res, next) => {
  res.send("Hello from express.");
});

// Route for handling authentication-related requests
app.use("/auth", AuthRoute);


// Middleware for handling 404 (Not Found) errors
app.use(async (req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});


// Error-handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
