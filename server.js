const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const ytdlp = require('yt-dlp-exec');

const app = express(); // ✅ Initialize 'app' BEFORE using it
const port = process.env.PORT || 3000; // ✅ Use dynamic port for deployment

app.use(cors()); // ✅ Move 'cors' AFTER 'app' is initialized
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/download', async (req, res) => {
    const videoURL = req.body.url;
    console.log(`Received request for URL: ${videoURL}`);
    if (!videoURL) {
        return res.status(400).send('URL is required');
    }

    try {
        const info = await ytdlp(videoURL, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
        });
        console.log('yt-dlp response:', info);

        const formats = info.formats.map(format => ({
            quality: format.format_note,
            url: format.url
        }));

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            formats
        });

    } catch (error) {
        console.error('yt-dlp error:', error);
        res.status(500).json({ error: 'Failed to fetch video info' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
