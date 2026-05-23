const express = require('express');
const router = express.Router();
const { generateMemeTemplates, createEditorData } = require('../controllers/memeController');

router.post('/generate', generateMemeTemplates);
router.post('/create-editor-data', createEditorData);

module.exports = router;
