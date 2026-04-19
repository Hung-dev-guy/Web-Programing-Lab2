const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();
const User = require("../db/userModel");

router.get("/:id", async (request, response) => {
    const userId = request.params.id;
    try {
        // Check if user exists
        const userExists = await User.exists({ _id: userId });
        if (!userExists) {
            return response.status(400).json({ error: `User with ID ${userId} not found` });
        }

        const photos = await Photo.find({ user_id: userId })
            .populate({
                path: "comments.user_id",
                select: "_id first_name last_name",
                model: "Users"
            });

        // Construct the response objects with only the required fields
        const result = photos.map(photo => {
            const photoObj = photo.toObject();
            return {
                _id: photoObj._id,
                user_id: photoObj.user_id,
                file_name: photoObj.file_name,
                date_time: photoObj.date_time,
                comments: photoObj.comments.map(comment => ({
                    _id: comment._id,
                    comment: comment.comment,
                    date_time: comment.date_time,
                    user: comment.user_id 
                }))
            };
        });

        response.status(200).json(result);
    } catch (error) {
        console.error(`Error fetching photos for user ${userId}:`, error);
        response.status(400).json({ error: "Invalid user ID format" });
    }
});

module.exports = router;
