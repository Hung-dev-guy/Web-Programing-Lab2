const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

router.post("/", async (request, response) => {
  try {
    const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

    // Validation: Required fields
    if (!login_name || !password || !first_name || !last_name) {
      return response.status(400).send('login_name, password, first_name, and last_name are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return response.status(400).send('A user with that login name already exists');
    }

    // Create new user
    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location: location || '',
      description: description || '',
      occupation: occupation || ''
    });

    await newUser.save();

    return response.status(201).json({
      login_name: newUser.login_name,
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name
    });
  } catch (err) {
    console.error('Registration error:', err);
    return response.status(500).send(err.toString());
  }
});

router.get("/list", async (request, response) => {
    try {
        const users = await User.find({}, "_id first_name last_name");
        response.status(200).json(users);
    } catch (error) {
        console.error("Error fetching user list:", error);
        response.status(500).json({ error: "Failed to retrieve user list" });
    }
});

router.get("/:id", async (request, response) => {
    const userId = request.params.id;
    try {
        const user = await User.findById(userId, "_id first_name last_name location description occupation");
        if (user) {
            response.status(200).json(user);
        } else {
            response.status(400).json({ error: `User with ID ${userId} not found` });
        }
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        // CastError happens if the ID is not a valid ObjectId
        response.status(400).json({ error: "Invalid user ID format" });
    }
});

module.exports = router;