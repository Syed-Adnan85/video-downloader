const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');
const ytdl = require('youtube-dl-exec');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/download', async (req, res) => {
    const videoURL = req.body.url;
    if (!videoURL) {
        return res.status(400).send('URL is required');
    }

    try {
        const info = await ytdl(videoURL, {
            dumpSingleJson: true,
        });

        const formats = info.formats.map(format => ({
            quality: format.format_note,
            url: format.url,
        }));

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            formats,
        });

    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).send('Error fetching video info. Please check the URL and try again.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
