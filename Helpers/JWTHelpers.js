import jwt from "jsonwebtoken";
const sign = jwt.sign;
const verify = jwt.verify;
import pkg from "http-errors";
const InternalServerError = pkg.InternalServerError;
const Unauthorized = pkg.Unauthorized;
// Redis client for storing refresh tokens
import client from "../Helpers/InitRedis.js"; 

// Generate JWT token for user
// Expires in 1 hour, iat = issued at, iat = issued at, id = user id
export function generateToken(user){
  const token = sign(
    {
      id: user._id,
      exp: Math.floor( Date.now() /1000) + 60 * 60 * 2,
      iat: Math.floor( Date.now() /1000) + 60 * 60,
    },
    process.env.ACCESS_TOKEN_SECRET
  );
  return token
}

export function signAccessToken(userId) {
  return new Promise((resolve, reject) => {
    const payload = {}; // Payload for the access token
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "1h",
      issuer: "pickurpage.com",
      audience: userId,
    };
    // Sign the access token using JWT
    sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(InternalServerError());
        return;
      }
      resolve(token);
    });
  });
}

export function verifyAccessToken(req, res, next) {
  // Check if 'Authorization' header is present in the request
  if (!req.headers["authorization"]) return next(Unauthorized());
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];
  verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const message = err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(Unauthorized(message));
    }
    req.payload = payload;
    next();
  });
}

export function signRefreshToken(userId) {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: "1y",
      issuer: "pickurpage.com",
      audience: userId,
    };
    sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        // reject(err)
        reject(InternalServerError());
      }
      // Store the refresh token in Redis
      client.SET(userId, token, "EX", 365 * 24 * 60 * 60, (err, reply) => {
        if (err) {
          console.log(err.message);
          reject(InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  });
}

export function verifyRefreshToken(refreshToken) {
  return new Promise((resolve, reject) => {
    verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) return reject(Unauthorized());
        const userId = payload.aud;
        client.GET(userId, (err, result) => {
          if (err) {
            console.log(err.message);
            reject(InternalServerError());
            return;
          }
          if (refreshToken === result) return resolve(userId);
          reject(Unauthorized());
        });
      }
    );
  });
}
