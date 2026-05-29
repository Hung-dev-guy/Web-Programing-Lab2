const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();
const User = require("../db/userModel");
const path = require('path');
const fs = require('fs');
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const imagesDir = path.join(__dirname, '../photo-sharing-v1/src/images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.post('/photos/new', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file provided');
    }

    try {
        if (!req.session || !req.session.user) {
            return res.status(401).send('User not logged in');
        }

        const userId = req.session.user._id;
        const filename = req.file.filename;
        const creationDate = new Date();

        const newPhoto = new Photo({
            file_name: filename,
            user_id: userId,
            date_time: creationDate
        });

        await newPhoto.save();

        res.status(200).json({
            message: 'Photo uploaded successfully',
            photo: newPhoto
        });
    } catch (err) {
        console.error('Photo upload error:', err);
        res.status(500).send('Error uploading photo');
    }
});

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
