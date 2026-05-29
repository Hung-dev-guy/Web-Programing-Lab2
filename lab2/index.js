const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const User = require("./db/userModel");
const Photo = require("./db/photoModel");
require("dotenv").config();
dbConnect();
const PORT = 8082;
const session = require("express-session");

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'photoappsecret',
  resave: false,
  saveUninitialized: false
}));

// requireLogin middleware - must be declared before app.use(requireLogin)
function requireLogin(req, res, next) {
  const allowedPaths = [
    '/admin/login',
    '/admin/logout'
  ];
  
  // Allow POST /user for registration without login
  if (req.method === 'POST' && req.path === '/user') {
    return next();
  }

  if (allowedPaths.includes(req.path)) {
    return next();
  }

  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }

  next();
}

app.use(requireLogin);

app.use("/user", UserRouter);
app.use("/", PhotoRouter);
app.use("/images", express.static(require("path").join(__dirname, "photo-sharing-v1/src/images")));

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// POST /admin/login
app.post('/admin/login', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).send('Database connection is not established. Please check if your MongoDB service is running.');
  }

  try {
    const loginName = req.body.login_name;
    const password = req.body.password;

    // Validate inputs
    if (!loginName || !password) {
      return res.status(400).send('Invalid login credentials');
    }

    const user = await User.findOne({ login_name: loginName });

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(400).send('Invalid login credentials');
    }

    // Set session
    req.session.user = {
      _id: user._id,
      first_name: user.first_name
    };

    // Return user data needed by frontend
    return res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    });

  } catch (err) {
    return res.status(500).send(err.toString());
  }
});

app.post('/admin/register', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).send('Database connection is not established. Please check if your MongoDB service is running.');
  }

  try {
    const { login_name, password, confirm_password, first_name, last_name, location, description, occupation } = req.body;

    if (!login_name || !password || !confirm_password || !first_name || !last_name) {
      return res.status(400).send('All required fields must be provided');
    }

    if (password !== confirm_password) {
      return res.status(400).send('Passwords do not match');
    }

    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send('A user with that login name already exists');
    }

    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation
    });

    await newUser.save();

    return res.status(201).json({
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name
    });

  } catch (err) {
    return res.status(500).send(err.toString());
  }
});

// POST /admin/logout
app.post('/admin/logout', (req, res) => {
  if (!req.session.user) {
    return res.status(400).send('Not logged in');
  }

  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }

    return res.status(200).send('Logged out');
  });
});


app.get('/user/list', async (req, res) => {
  console.log('✓ GET /user/list - User list requested');
  try {
    const users = await User.find({}, '_id first_name last_name');
    const photos = await Photo.find({}, '_id user_id comments');

    const result = users.map(user => {
      const uid = user._id.toString();
      const photoCount = photos.filter(p => p.user_id && p.user_id.toString() === uid).length;
      let commentCount = 0;
      photos.forEach(photo => {
        if (photo.comments) {
          commentCount += photo.comments.filter(c => c.user_id && c.user_id.toString() === uid).length;
        }
      });
      return {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        photoCount,
        commentCount
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    console.log(`✓ GET /user/${userId} - User detail requested`);
    try {
      const user = await User.findById(userId, '_id first_name last_name location description occupation');
      if (user) {
          res.json(user);
      } else {
          res.status(400).json({ error: `User with ID ${userId} not found` });
      }
    } catch (err) {
      res.status(400).json({ error: 'Invalid user ID' });
    }
});

app.get('/photosOfUser/:id', async (req, res) => {
    const userId = req.params.id;
    console.log(`✓ GET /photosOfUser/${userId} - Photos requested`);
    try {
      const user = await User.findById(userId, '_id');
      if (!user) {
          return res.status(400).json({ error: `User with ID ${userId} not found` });
      }
      const photos = await Photo.find({ user_id: userId }).populate({
        path: 'comments.user_id',
        select: '_id first_name last_name',
        model: 'Users'
      });
      const result = photos.map(photo => ({
          _id: photo._id,
          user_id: photo.user_id,
          date_time: photo.date_time,
          file_name: photo.file_name,
          comments: (photo.comments || []).map(comment => ({
              _id: comment._id,
              date_time: comment.date_time,
              comment: comment.comment,
              user: comment.user_id
                  ? {
                      _id: comment.user_id._id,
                      first_name: comment.user_id.first_name,
                      last_name: comment.user_id.last_name
                    }
                  : null
          }))
      }));
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.toString() });
    }
});
// POST /commentsOfPhoto/:photo_id - Add a comment to a photo
app.post('/commentsOfPhoto/:photo_id', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized');
  }

  const photoId = req.params.photo_id;
  const { comment } = req.body;

  // Reject empty comments
  if (!comment || !comment.trim()) {
    return res.status(400).send('Bad request: Comment cannot be empty');
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(400).json({ error: `Photo with ID ${photoId} not found` });
    }

    // Get the logged-in user info
    const loggedInUser = await User.findById(req.session.user._id).select('_id first_name last_name');
    if (!loggedInUser) {
      return res.status(400).send('User not found');
    }

    const newComment = {
      comment: comment.trim(),
      date_time: new Date(),
      user_id: loggedInUser._id
    };

    photo.comments.push(newComment);
    await photo.save();

    // Return the updated photo with populated user info
    const updatedPhoto = await Photo.findById(photoId).populate({
      path: 'comments.user_id',
      select: '_id first_name last_name',
      model: 'Users'
    });

    const photoObj = updatedPhoto.toObject();
    const result = {
      _id: photoObj._id,
      user_id: photoObj.user_id,
      file_name: photoObj.file_name,
      date_time: photoObj.date_time,
      comments: photoObj.comments.map(c => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user_id
          ? {
              _id: c.user_id._id,
              first_name: c.user_id.first_name,
              last_name: c.user_id.last_name
            }
          : null
      }))
    };

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
});

app.get('/commentsOfUser/:id', async (req, res) => {
    const userId = req.params.id;
    console.log(`✓ GET /commentsOfUser/${userId} - User comments requested`);

    try {
      const user = await User.findById(userId, '_id');
      if (!user) {
          return res.status(400).json({ error: `User with ID ${userId} not found` });
      }

      const photos = await Photo.find({ 'comments.user_id': userId }, '_id file_name comments');
      const result = [];

      photos.forEach(photo => {
          if (photo.comments) {
              const userComments = photo.comments.filter(c => c.user_id && c.user_id.toString() === userId);
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
    } catch (err) {
      res.status(500).json({ error: err.toString() });
    }
});
