const express = require("express");
const morgan = require("morgan");
// const createError = require("http-errors");
require("dotenv").config();
require("./helpers/InitMongodb.js");
// const { verifyAccessToken } = require("./helpers/jwt_helpers");
require("./helpers/InitRedis.js");

//  import es6

const AuthRoute = require("./Routes/AuthRoute");

const app = express();

// Middleware to log the request
app.use(morgan("dev"));
// Middleware to parse the request body
app.use(express.json());
// Middleware to parse the url encoded data
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res, next) => {
  res.send("Hello from express.");
});

// app.use(verifyAccessToken);
app.use("/auth", AuthRoute);

// Middleware to handle 404 errors
app.use(async (req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});


// Middleware to handle errors
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
