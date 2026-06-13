const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

router.post('/init-interview', interviewController.initInterview);
router.post('/chat', interviewController.chat);
router.post('/interview/end', interviewController.endInterview);
router.get('/history', interviewController.getHistory);
router.get('/results/:id', interviewController.getResult);

module.exports = router;
