const express = require('express');
const router = express.Router();
const { auth, uploadFile, fetchFiles, deleteFile } = require('../Controllers/file.Controller');
// const auth = require('../Middlewares/auth');
const upload = require('../Middlewares/upload'); // Your multer configuration

router.post('/upload', auth, upload.array('files', 5), uploadFile);
router.get('/files', auth, fetchFiles);
router.delete('/files/:fileId', auth, deleteFile);

module.exports = router;
