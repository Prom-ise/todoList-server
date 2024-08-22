const express = require('express');
const app = express();
const cors = require('cors');
const userRouter = require('./Routes/User.Route');
const fileRouter = require('./Routes/File.Route');


const corsOptions = {
  origin: 'https://todo-list-client-sandy.vercel.app',
  AccessControlAllowOrigin: "*", // Replace this with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));


require('dotenv').config();
const port = process.env.PORT || 7000;


const mongoose = require('mongoose');
const uri = process.env.MONGODB_URL;

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use(express.json({ limit: "50mb" }));

app.use("/todoList", userRouter);
app.use("/uploadList", fileRouter);
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  mongoose.connect(uri)
    .then(() => {
      console.log(`Server is running on port ${port} and Connected to MongoDB`);
    })
    .catch((err) => {
      console.log(err);
    });
});
