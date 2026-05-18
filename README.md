# hls-video-to-audio

Strips video from an HLS stream and pipes the audio out as MP3 — in real time, over HTTP. That's the whole thing.

Built one weekend because I had an HLS video link I wanted to listen to without the video overhead. Didn't want to download and convert; I wanted it to behave like an audio stream I could point a player at. So: tiny Express server, fluent-ffmpeg does the transcoding on the fly, client gets a chunked MP3 response it can start playing immediately.

## Usage

1. Open `server.js` and replace the placeholder HLS URL with your `.m3u8` link:

```js
const hlsStreamUrl = 'https://example.com/stream/index.m3u8';
```

2. Install and start:

```bash
npm install
node server.js
```

3. Point any audio player (VLC, browser, `curl`) at:

```
http://localhost:3000/audio-stream
```

The server reads the HLS source at native frame rate (`-re`), drops the video track, re-encodes to MP3 via `libmp3lame`, and streams it back. If the client disconnects, FFmpeg is killed immediately.

## Stack

- **Express** — HTTP server, single route
- **fluent-ffmpeg** — FFmpeg wrapper for the transcode/pipe
- **FFmpeg** — must be installed on the host (`brew install ffmpeg` / `apt install ffmpeg`)

## Limitations

The HLS URL is hardcoded in the file right now — no query-param support, no authentication pass-through. Works fine for a private or open stream; not production-ready for anything multi-tenant. Port defaults to `3000`, overridable via `PORT` env var.
