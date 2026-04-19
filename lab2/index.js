const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
// const CommentRouter = require("./routes/CommentRouter");
const models = require("./modelData/models");
require("dotenv").config();
dbConnect();
const PORT = 8082;

app.use(cors());
app.use(express.json());
app.use("/api/user", UserRouter);
app.use("/api/photosOfUser", PhotoRouter);
// Serve static images from the frontend images directory
app.use("/images", express.static(require("path").join(__dirname, "../photo-sharing-v1/src/images")));

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/user/list', (req, res) => {
  console.log('✓ GET /user/list - User list requested');
  const users = models.userListModel();
  const allPhotos = models.allPhotosModel();
  
  const result = users.map(user => {
    // Count photos owned by this user
    const photoCount = allPhotos.filter(p => p.user_id === user._id).length;
    
    // Count comments authored by this user
    let commentCount = 0;
    allPhotos.forEach(photo => {
      if (photo.comments) {
        commentCount += photo.comments.filter(c => c.user._id === user._id).length;
      }
    });

    return {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      photoCount: photoCount,
      commentCount: commentCount
    };
  });
  res.json(result);
});

app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    console.log(`✓ GET /user/${userId} - User detail requested`);
    const user = models.userModel(userId);
    if (user) {
        // Return detailed info as specified: _id, first_name, last_name, location, description, occupation
        const { _id, first_name, last_name, location, description, occupation } = user;
        res.json({ _id, first_name, last_name, location, description, occupation });
    } 
    else {
        // Spec says HTTP status 400 and informative message for non-existent User IDs
        res.status(400).json({ error: `User with ID ${userId} not found` });
    }
});

app.get('/photosOfUser/:id', (req, res) => {
    const userId = req.params.id;
    console.log(`✓ GET /photosOfUser/${userId} - Photos requested`);
    const user = models.userModel(userId);
    if (!user) {
        return res.status(400).json({ error: `User with ID ${userId} not found` });
    }
    const photos = models.photoOfUserModel(userId);
    const result = photos.map(photo => ({
        _id: photo._id,
        user_id: photo.user_id,
        date_time: photo.date_time,
        file_name: photo.file_name,
        comments: (photo.comments || []).map(comment => ({
            _id: comment._id,
            date_time: comment.date_time,
            comment: comment.comment,
            user: {
                _id: comment.user._id,
                first_name: comment.user.first_name,
                last_name: comment.user.last_name
            }
        }))
    }));
    res.json(result);
});
app.get('/commentsOfUser/:id', (req, res) => {
    const userId = req.params.id;
    console.log(`✓ GET /commentsOfUser/${userId} - User comments requested`);
    
    const user = models.userModel(userId);
    if (!user) {
        return res.status(400).json({ error: `User with ID ${userId} not found` });
    }

    const allPhotos = models.allPhotosModel();
    const result = [];

    allPhotos.forEach(photo => {
        if (photo.comments) {
            const userComments = photo.comments.filter(c => c.user._id === userId);
            userComments.forEach(comment => {
                result.push({
                    _id: comment._id,
                    comment: comment.comment,
                    date_time: comment.date_time,
                    photo_id: photo._id,
                    photo_file_name: photo.file_name
                });
            });
        }
    });

    res.json(result);
});
