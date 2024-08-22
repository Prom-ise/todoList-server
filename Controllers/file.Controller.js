// const express = require('express');
// const File = require('../Models/files.Model');
// const path = require('path');
// const jwt = require("jsonwebtoken");
// const userMode = require("../Models/user.Model");
// const secretKey = process.env.SECRET_KEY;
// const fs = require('fs');

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
// const uploadFile = async (req, res) => {
//   const { description } = req.body;
//   const userId = req.user.id; 

//   const files = req.files.map(file => ({
//     userId: userId,
//     fileName: file.filename,
//     filePath: file.path,
//     fileType: file.mimetype,
//     fileSize: file.size,
//     description: description || ''
//   }));

//   try {
//     const savedFiles = await File.insertMany(files);
//     res.json(savedFiles);
//   } catch (err) {
//     console.error('Error saving file:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// const fetchFiles = async (req, res) => {
//   try {
//     const files = await File.find({ userId: req.user.id });
//     res.json(files);
//   } catch (err) {
//     console.error('Error fetching files:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// const deleteFile = async (req, res) => {
//   try {
//     const file = await File.findById(req.params.fileId);

//     if (!file) {
//       return res.status(404).json({ msg: 'File not found' });
//     }

//     if (file.userId.toString() !== req.user.id) {
//       return res.status(401).json({ msg: 'User not authorized' });
//     }

//     const filePath = path.join(__dirname, '..', file.filePath);
//     fs.unlink(filePath, err => {
//       if (err) console.error('Error deleting file:', err);
//     });

//     await file.deleteOne();

//     res.json({ msg: 'File deleted' });
//   } catch (err) {
//     console.error('Error deleting file:', err.message);
//     res.status(500).send('Server error');
//   }
// };

// module.exports = { auth, uploadFile, fetchFiles, deleteFile };


const express = require('express');
const File = require('../Models/files.Model');
const path = require('path');
const jwt = require('jsonwebtoken');
const userMode = require('../Models/user.Model');
const secretKey = process.env.SECRET_KEY;
const fs = require('fs');

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

// Upload multiple files
const uploadFile = async (req, res) => {
  const { description } = req.body;
  const userId = req.user.id;

  const files = req.files.map(file => ({
    userId: userId,
    fileName: file.filename,
    filePath: file.path,
    fileType: file.mimetype,
    fileSize: file.size,
    description: description || ''
  }));

  try {
    const savedFiles = await File.insertMany(files);
    res.json(savedFiles);
  } catch (err) {
    console.error('Error saving files:', err.message);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

// Fetch all files for the authenticated user
const fetchFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id });
    res.json(files);
  } catch (err) {
    console.error('Error fetching files:', err.message);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

// Delete a file
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ status: false, message: 'File not found' });
    }

    if (file.userId.toString() !== req.user.id) {
      return res.status(401).json({ status: false, message: 'User not authorized' });
    }

    const filePath = path.join(__dirname, '..', file.filePath);
    fs.unlink(filePath, err => {
      if (err) {
        console.error('Error deleting file:', err.message);
      }
    });

    await file.deleteOne();
    res.json({ status: true, message: 'File deleted' });
  } catch (err) {
    console.error('Error deleting file:', err.message);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

module.exports = { auth, uploadFile, fetchFiles, deleteFile };
