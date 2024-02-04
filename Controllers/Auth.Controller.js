const express = require("express");
const router = express.Router();
const morgan = require("morgan");
const createError = require("http-errors");
const User = require("../Models/User.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signAccessToken, signRefreshToken } = require("../helpers/jwt_helper");

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password, level, github, linkedin, team, year } =
        req.body;

      const user = new User({
        name: name,
        email: email,
        password: password,
        level: level,
        github: github,
        linkedin: linkedin,
        team: team,
        year: year,
      });

      const error = await user.validate();
      if (error) throw error;

      const isEmailUsed = await User.isEmailUsed(user.email);
      if (isEmailUsed)
        throw new Error(JSON.stringify({ message: "Email is already used" }));

      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);

      await user.save();

      const token = jwt.sign(
        {
          id: user._id,
          exp: Date.now() + +process.env.TOKEN_EXPIRE_TIME,
          iat: Date.now(),
        },
        process.env.ACCESS_TOKEN_SECRET
      );

      // Envoi du token dans l'en-tête de la réponse
      res.header("auth-token", token).json({ status: "ok" });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        throw new Error(
          JSON.stringify({ message: "email or password is missing" })
        );

      const user = await User.findOne({ email: email });

      if (!user) throw new Error(JSON.stringify({ message: "user not found" }));

      if (user.email.toLowerCase() !== email.toLowerCase())
        throw new Error(
          JSON.stringify({ message: "email or password are incorrect" })
        );

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect)
        throw new Error(
          JSON.stringify({ message: "email or password are incorrect" })
        );

      // Génération du token d'authentification
      const token = jwt.sign(
        {
          id: user._id,
          exp: Date.now() + +process.env.TOKEN_EXPIRE_TIME,
          iat: Date.now(),
        },
        process.env.ACCESS_TOKEN_SECRET
      );

      res.header("auth-token", token).json({ status: "ok" });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },


  changePassword: async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;

      if (!email)
        throw new Error("email is missing");

      if (!oldPassword)
        throw new Error("old password is missing");

      if (!newPassword)
        throw new Error("new password is missing");

      const user = await User.findOne({ email: email });

      if (!user)
        throw new Error(JSON.stringify({ message: "user not found" }));

      const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordCorrect)
        throw new Error(JSON.stringify({ message: "old password is incorrect" }));

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();

      res.status(200).send({ status: "ok" });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  refreshToken: async (req, res) => {
    const { email, password } = req.body;
    // Logique de rafraîchissement du token
    res.send("refresh token route");
  },

  logout: async (req, res, next) => {
    try {
    // Extraction du refreshToken de la requête
      const { refreshToken } = req.body
      if (!refreshToken) throw createError.BadRequest()
      const userId = await verifyRefreshToken(refreshToken)
    //client.DEL(userId, ...)  méthode de node-redis permettant de 
    //supprimer une clé de Redis (ici, userId)
      client.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message)
          throw createError.InternalServerError()
        }
        console.log(val)
        res.sendStatus(204)
      })
    } catch (error) {
      next(error)
    }
  },


};
