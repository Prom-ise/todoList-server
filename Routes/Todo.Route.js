const express = require('express');
const router = express.Router();
const {
  auth,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  deleteAccount
//   deleteFile
} = require('../Controllers/Todo.Controller');

router.get('/', auth, getTodos);
router.post('/', auth, createTodo);
router.put('/:id', auth, updateTodo);
router.delete('/delete-account', auth, deleteAccount);
router.delete('/:id', auth, deleteTodo);
// router.delete('/:id/files/:fileId', auth, deleteFile);

module.exports = router;
