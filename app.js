import express from "express";
import morgan from "morgan";
import dotenv from 'dotenv'
//import { verifyAccessToken } from "./Helpers/JWTHelpers";
import AuthRoute from "./Routes/AuthRoute.js";
import "./Helpers/InitRedis.js"
import "./Helpers/InitMongodb.js";
dotenv.config()

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res, next) => {
  res.send("Hello from express.");
});





app.use("/auth", AuthRoute);

app.use(async (req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
