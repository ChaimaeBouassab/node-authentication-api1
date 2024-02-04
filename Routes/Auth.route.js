const express = require("express");
const router = express.Router();
const AuthController = require("../Controllers/Auth.Controller");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/changepassword", AuthController.changePassword);
router.delete("/logout", AuthController.logout);

// Create a new user
router.post("/api/v1/users", (req, res) => {
  res.status(201).json({ message: "User created successfully" });
});

router.get("/api/v1/users/:user_id", (req, res) => {
  const userId = req.params.user_id;
});

// Edit User Data
router.patch('/api/v1/users/:user_id', async (req, res) => {
  try {
      const userId = req.params.user_id;
      const updatedUserData = req.body;

      // Find the user in the database by user ID and update the data
      const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User data updated successfully", user: updatedUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/api/v1/users/:user_id", (req, res) => {
  const userId = req.params.user_id;
});


// Update User
router.put('/api/v1/users/:user_id', (req, res) => {
  const userId = req.params.user_id;
});

module.exports = router;
