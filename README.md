# vrc-ytdlp-resolver

A small web tool that resolves direct playable video URLs from YouTube using `yt-dlp`.  
This is useful for VRChat world video players that sometimes fail to play YouTube links due to bot protection or signature restrictions.

Instead of relying on in-world extraction, this tool resolves the video **server-side** and outputs a temporary direct streaming link (`*.googlevideo.com`).  
You can then paste this link into a VRChat video player that accepts raw media URLs.

---

## ✨ Features

- Resolve YouTube watch URLs into playable direct video URLs
- Prefers **progressive MP4 (H.264 + AAC)** for VRChat compatibility
- Automatically falls back to adaptive video + audio streams if required
- Web UI for easy usage
- Shows:
  - **Local `yt-dlp` version**
  - **Latest available `yt-dlp` version from GitHub**
  - Update availability notification

---

## 📦 Requirements

- Node.js **18+**
- `yt-dlp` installed and available in the system PATH  
  (or specify a custom path via `YT_DLP_PATH`)

---

## 🧱 Installation

```bash
git clone https://github.com/MrUnknownDE/vrc-ytdlp-resolver
cd vrc-ytdlp-resolver
npm install
````

Make sure `yt-dlp` is installed:

```bash
# Linux / Mac
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
chmod +x yt-dlp
sudo mv yt-dlp /usr/local/bin/

# Windows (PowerShell)
winget install yt-dlp.yt-dlp
```

(Optional) Set a custom path:

```bash
export YT_DLP_PATH="/path/to/yt-dlp"
```

---

## 🚀 Run

```bash
npm run dev
```

The web interface will be available at:

```
http://localhost:3000
```

---

## 🐳 Docker

```bash
docker build -t vrc-ytdlp-resolver .
docker run --rm -p 3000:3000 vrc-ytdlp-resolver
```

---

## 🔧 Usage

1. Open the web UI.
2. Paste a YouTube watch link.
3. Click **Resolve**.
4. Copy the direct playback URL.
5. Paste it into your VRChat video player.

> ⚠️ Direct streaming URLs are temporary.
> They may expire after several minutes or hours.
> If playback stops later, simply resolve again.

---

## ⚠️ Disclaimer

This tool **does not download or store media.**
It only extracts direct streaming URLs that YouTube already provides for playback.

Respect YouTube’s Terms of Service and copyright laws.
Do not use this tool for piracy.