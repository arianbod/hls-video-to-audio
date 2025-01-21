const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();

app.get('/audio-stream', (req, res) => {
  const hlsStreamUrl = 'your .m3u8 link here';
  res.contentType('audio/mp3');

  const command = ffmpeg(hlsStreamUrl)
    .inputOptions('-re') // Read input at native frame rate
    .audioCodec('libmp3lame')
    .noVideo()
    .format('mp3')
    .outputOptions('-movflags frag_keyframe+empty_moov') // Use fragmented MP3
    .on('start', (commandLine) => {
      console.log('Spawned FFmpeg with command: ' + commandLine);
    })
    .on('progress', (progress) => {
      console.log(`Processing: ${progress.timemark}`);
    })
    .on('error', (err, stdout, stderr) => {
      console.error('Error processing stream: ' + err.message);
      console.error('FFmpeg stderr: ' + stderr);
      if (!res.headersSent) {
        res.status(500).send('Error processing stream');
      }
    })
    .on('end', () => {
      console.log('Processing finished successfully');
    });

  req.on('close', () => {
    console.log('Request closed by client');
    command.kill('SIGKILL'); // Ensure FFmpeg process is killed if client disconnects
  });

  command.pipe(res, { end: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
