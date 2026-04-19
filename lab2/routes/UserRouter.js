const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

router.post("/", async (request, response) => {
  
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