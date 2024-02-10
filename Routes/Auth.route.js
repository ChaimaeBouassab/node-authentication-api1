const express = require("express");
const router = express.Router();
const AuthController = require("../Controllers/Auth.Controller");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/changepassword", AuthController.changePassword);
router.delete("/logout", AuthController.logout);

// Create a new user
router.post("/api/v1/users", AuthController.createUser);

// Get a user by ID
router.get("/api/v1/users/:user_id/:user_year", AuthController.getUserById);

// Edit User Data
router.patch("/api/v1/users/:user_id/:user_year", AuthController.editUserData);

router.delete("/api/v1/users/:user_id/:user_year", AuthController.deleteUser);


router.get("/api/v1/users/search", AuthController.searchUsers);

router.get("/api/v1/users/getByYear/:year", AuthController.getUsersByYear);

// Get Users with Pagination
router.get("/api/v1/users/:year", AuthController.getUsersWithPagination);

module.exports = router;
