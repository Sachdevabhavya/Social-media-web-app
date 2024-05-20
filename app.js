const express = require("express");
const mongoose = require("mongoose");
const User= require('./model/user');
const Post = require('./model/post');
const Comment = require('./model/comments')
const shortid = require("shortid");
const session = require("express-session");
const multer = require('multer');

const app=express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.get('/',(req,res)=>{
//     res.send("Hello world")
// })



app.get('/register',async(req,res)=>{
    try{
      res.render('register');
        const log = await User.find({});
        // res.status(200).json(log);
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//enter data for register
// app.post('/register', async (req, res) => {
//   try {
//     const user = await User.create(req.body);
//     res.status(200);
//     res.redirect('/login');
//   } catch (err) {
//     console.log(err.message);
//     res.status(500).json({ message: err.message });
//   }
// });


app.post('/register', async (req, res) => {
  try {
    const { name, password, email } = req.body;

    if (!name || !password || !email) {
      return res.status(400).json({ message: 'Name, password, and email are required' });
    }
    res.redirect('/login');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = await User.create({ name, password, email });
    return res.status(201).json(newUser); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



//find register by id
app.get('/register/:id',async(req,res)=>{
    try{
        const {id} = req.params;
        const log = await User.findById(id);
        res.status(200).json(log);
    }catch(err){
        res.status(500).json({message:err.message})
    }
})

//update registration
app.put('/register/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const user = await User.findByIdAndUpdate(id, updatedData, { new: true });

    if (!user) {
      return res.status(404).json({ message: `Cannot find any user with ID ${id}` });
    }

    res.redirect(`/profile/${user._id}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: `Cannot find any user with ID ${id}` });
    }

    res.render('updateProfile', { id: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



//delete any registered item
app.delete('/register/:id',async(req,res)=>{
    try{
        const {id} = req.params;
        const log = await User.findByIdAndDelete(id);

        if(!log){
            return res.status(404).json({message:`cannot find any product with ID ${id}`})
        }
        res.status(200).json(log)
    }catch(err){
        res.status(404).json({message: err.message})
    }
})

//login
app.get('/login',async(req,res)=>{
  res.render('login');
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.redirect('/');
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }));


app.get('/logout', (req, res) => {
    const userId = req.session.userId; 
  
    res.render('logout', { userId });
  });
  

app.post('/logout', async (req, res) => {
  const { id } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.redirect('/login');
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function generatePostId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${timestamp}-${random}`;
}


const postId = generatePostId();
  

app.get('/post', (req, res) => {

    const userId = req.session.userId;

    res.render('post', { userId , postId: generatePostId() });
  });
  

// app.post('/post', async (req, res) => {
//     const { id, content, imageUrl } = req.body;
  
//     const user = await User.findOne({ _id: id });
  
//     if (!user) {
//       return res.status(404).json({ message: "Invalid operation" });
//     }
  
//     try {
//       const post = await Post.create({
//         userId: user._id,
//         content,
//         imageUrl
//       });
  
//       res.json(post);
//       res.redirect('/');
//     } catch (error) {
//       res.json({ message: error.message });
//     }
//   });


// Create a new post
app.post('/post', async (req, res) => {
  // Extract the necessary data from the request body
  const { userId, content, imageUrl,postId } = req.body;

  try {

    const post = await Post.create({
      content,
      imageUrl
    });

    res.redirect('/');
  } catch (error) {
    // Handle any errors that occurred during post creation
    res.status(500).json({ message: error.message });
  }
});


// app.get('/posts/:id', async(req,res)=>{
//   res.render
// })
// Update a post
// Render the update post page
app.get('/updatePost', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.render('updatePost', { post }); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/deletePost',async(req,res)=>{
  res.render('deletePost');
})

// Update a post
app.put('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { content, imageUrl } = req.body;

  try {
    const post = await Post.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.content = content;
    post.imageUrl = imageUrl;
    await post.save();

    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.remove();

    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG images are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });
  

app.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('comments').populate('userId', 'name');
    res.render('main', { posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get comments
app.get("/comments", async (req, res) => {
  try {
      const comments = await Comment.find().sort({ createdAt: "desc" });
      res.render("comments", { comments });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Create a comment
app.post("/comments", async (req, res) => {
  const { content } = req.body;

  try {
      const comment = await Comment.create({ content });
      res.redirect("/");
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Update a comment
app.put("/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
      const comment = await Comment.findByIdAndUpdate(
          commentId,
          { content },
          { new: true }
      );

      if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
      }

      res.json(comment);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Delete a comment
app.delete("/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
      const comment = await Comment.findByIdAndDelete(commentId);

      if (!comment) {
          return res.status(404).json({ message: "Comment not found" });
      }

      res.json({ message: "Comment deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

  

app.listen(3000 , ()=>{
    console.log("running on local host 3000");
});

mongoose.connect("mongodb+srv://username:password@cluster0.8cudxjs.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("connected to database sucessfully");
}).catch((err)=>{
    console.log(err)
});
