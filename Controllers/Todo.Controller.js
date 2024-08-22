// const express = require('express');
// const userMode = require("../Models/user.Model");
// const Todo = require('../Models/todo.Model');
// const jwt = require("jsonwebtoken");
// const secretKey = process.env.SECRET_KEY;

// const auth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ status: false, message: "No token provided, authorization denied" });
//     }

//     const token = authHeader.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ status: false, message: "Token format invalid, authorization denied" });
//     }

//     jwt.verify(token, secretKey, async (err, decoded) => {
//       if (err) {
//         console.log(err);
//         return res.status(401).json({ status: false, message: "Token is not valid" });
//       } else {
//         const user = await userMode.findById(decoded.user.id);
//         if (!user) {
//           return res.status(404).json({ status: false, message: "User not found" });
//         }
//         req.user = user;
//         next();
//       }
//     });
//   } catch (error) {
//     console.error("Error accessing todolist:", error);
//     res.status(500).json({ status: false, message: "Internal server error" });
//   }
// };

// const getTodos = async (req, res) => {
//   try {
//     const todos = await Todo.find({ userId: req.user.id });
//     res.json({
//       status: true,
//       todos: todos,
//       user: {
//         firstName: req.user.firstName,
//         lastName: req.user.lastName,
//         email: req.user.email
//       }
//     });
//   } catch (err) {
//     console.error('Error fetching todos:', err.message);
//     res.status(500).json({ status: false, message: 'Server error' });
//   }
// };


// const createTodo = async (req, res) => {
//   const { title, description } = req.body;

//   try {
//     const newTodo = new Todo({
//       userId: req.user.id,
//       title,
//       description,
//       completed: false 
//     });

//     const todo = await newTodo.save();
//     res.json(todo);
//   } catch (err) {
//     console.error('Error saving todo:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// const updateTodo = async (req, res) => {
//   const { title, description, completed } = req.body; 

//   try {
//     let todo = await Todo.findById(req.params.id);

//     if (!todo) {
//       return res.status(404).json({ msg: 'Todo not found' });
//     }

//     if (todo.userId.toString() !== req.user.id) {
//       return res.status(401).json({ msg: 'User not authorized' });
//     }

//     todo.title = title || todo.title;
//     todo.description = description || todo.description;
//     todo.completed = completed !== undefined ? completed : todo.completed; 

//     todo = await todo.save();

//     res.json(todo);
//   } catch (err) {
//     console.error('Error updating todo:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// const deleteAccount = async (req, res) => {
//   try {
//     console.log("Delete account route hit");
//     const userId = req.user.id;
//     await userMode.findByIdAndDelete(userId);
//     await Todo.deleteMany({ userId });
//     // Also delete uploaded files if necessary
//     res.json({ msg: 'Account and all associated data deleted' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

// const deleteTodo = async (req, res) => {
//   try {
//     console.log("Delete todo route hit");
//     const todo = await Todo.findById(req.params.id);

//     if (!todo) {
//       return res.status(404).json({ msg: 'Todo not found' });
//     }

//     if (todo.userId.toString() !== req.user.id) {
//       return res.status(401).json({ msg: 'User not authorized' });
//     }

//     await todo.deleteOne();
//     res.json({ msg: 'Todo removed' });
//   } catch (err) {
//     console.error('Error deleting todo:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// module.exports = {
//   auth,
//   getTodos,
//   createTodo,
//   updateTodo,
//   deleteTodo,
//   deleteAccount
// };


const express = require('express');
const userMode = require('../Models/user.Model');
const Todo = require('../Models/todo.Model');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

// Middleware for authenticating JWT tokens
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: false, message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: false, message: 'Token format invalid, authorization denied' });
    }

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ status: false, message: 'Token is not valid' });
      }

      const user = await userMode.findById(decoded.user.id);
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

// Fetch all todos for the authenticated user
const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id });
    res.json({
      status: true,
      todos,
      user: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
      },
    });
  } catch (err) {
    console.error('Error fetching todos:', err.message);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

// Create a new todo for the authenticated user
const createTodo = async (req, res) => {
  const { title, description } = req.body;

  try {
    const newTodo = new Todo({
      userId: req.user.id,
      title,
      description,
      completed: false,
    });

    const todo = await newTodo.save();
    res.json(todo);
  } catch (err) {
    console.error('Error saving todo:', err.message);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

// Update an existing todo for the authenticated user
const updateTodo = async (req, res) => {
  const { title, description, completed } = req.body;

  try {
    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ status: false, message: 'Todo not found' });
    }

    if (todo.userId.toString() !== req.user.id) {
      return res.status(401).json({ status: false, message: 'User not authorized' });
    }

    // Update the fields only if they are provided
    todo.title = title || todo.title;
    todo.description = description || todo.description;
    todo.completed = completed !== undefined ? completed : todo.completed;

    todo = await todo.save();
    res.json(todo);
  } catch (err) {
    console.error('Error updating todo:', err.message);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

// Delete a todo for the authenticated user
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ status: false, message: 'Todo not found' });
    }

    if (todo.userId.toString() !== req.user.id) {
      return res.status(401).json({ status: false, message: 'User not authorized' });
    }

    await todo.deleteOne();
    res.json({ status: true, message: 'Todo removed' });
  } catch (err) {
    console.error('Error deleting todo:', err.message);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

// Delete the authenticated user's account and all associated todos
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await userMode.findByIdAndDelete(userId);
    await Todo.deleteMany({ userId });
    // If you have uploaded files, add code to delete them here
    res.json({ status: true, message: 'Account and all associated data deleted' });
  } catch (err) {
    console.error('Error deleting account:', err.message);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

module.exports = {
  auth,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  deleteAccount,
};
