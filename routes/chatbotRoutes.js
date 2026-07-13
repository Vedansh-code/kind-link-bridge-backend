const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const PYTHON_URL = process.env.PYTHON_URL || "http://127.0.0.1:8000";

// POST /api/chatbot/text
router.post('/text', async (req, res) => {
    try {
        const response = await axios.post(`${PYTHON_URL}/chat/text`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error("Python API Error:", error.message);
        res.status(500).json({ status: "error", reply: "Python ML Engine is offline or unreachable!" });
    }
});

// POST /api/chatbot/voice
router.post('/voice', upload.single('audio_file'), async (req, res) => {
    try {
        const formData = new FormData();
        if (req.file) {
            formData.append('audio_file', fs.createReadStream(req.file.path));
        }
        formData.append('chat_history_str', req.body.chat_history_str || "[]");
        formData.append('user_id', req.body.user_id || "guest_123");
        formData.append('user_name', req.body.user_name || "Guest");

        const response = await axios.post(`${PYTHON_URL}/chat/voice`, formData, {
            headers: formData.getHeaders()
        });
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.json(response.data);
    } catch (error) {
        console.error("Python API Error:", error.message);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ status: "error", reply: "Python ML Engine is offline or unreachable!" });
    }
});

module.exports = router;
