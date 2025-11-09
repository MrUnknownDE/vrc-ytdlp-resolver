# vrc-ytdlp-resolver

A small web tool that resolves temporary direct video stream URLs from YouTube using `yt-dlp`.

This can be useful for VRChat worlds where the built-in video extraction sometimes fails or gets rate-limited.  
Instead of resolving the link inside VRChat, this tool resolves it **server-side** and returns a direct playback URL (`*.googlevideo.com`).

---

## ⚠️ Important Behavior (Read This First)

YouTube's streaming URLs are **time-limited** and often **IP-bound**.

This means:

- The direct video link usually **only works for the same public IP** that requested it.
- If **another user** in VRChat tries to use that same link from a **different network**, the video may **fail to load**.
- If your VRChat world is public and players are on different networks → **you must run this tool on a shared server** and the world should receive links resolved **by that shared server**, not by individual players.

### In short:

| Who resolves the URL? | Who can watch? |
|-----------------------|---------------|
| A player on home Wi-Fi | Only that player (same IP) |
| A dedicated server | Anyone connected to the VRChat world |

So if you want **everyone** in the instance to be able to watch:
→ **Host this tool on a server (VPS / Docker / Linux box) and resolve the URLs there.**

---

## ✨ Features

- Resolves YouTube links to direct streaming URLs
- Prefers **progressive MP4 (H.264 + AAC)** when available
- Falls back to adaptive (video+audio split) if necessary
- Shows:
  - Local `yt-dlp` version
  - Latest available version from GitHub
  - Update availability notice
- Clean web UI (no CLI required)

---

## 📦 Requirements

- Node.js **18+**
- `yt-dlp` installed (or provided via Docker image)
- If running in VRChat shared environments: run this **on a server**, not on players’ PCs

---

## 🐳 Docker (Recommended for Server Deployment)

```bash
docker run -d \
  --name vrc-ytdlp-resolver \
  -p 8080:3000 \
  mrunknownde/vrc-ytdlp-resolver:latest
````

Web UI → [http://localhost:8080](http://localhost:8080)

---

## 🧱 Local Install (Non-Docker)

```bash
git clone https://github.com/MrUnknownDE/vrc-ytdlp-resolver
cd vrc-ytdlp-resolver
npm install
npm run dev
```

---

## Usage Instructions

1. Open the web interface
2. Paste a YouTube URL
3. Click **Resolve**
4. Copy the direct link
5. Paste into your VRChat video player

> Remember: if you are **not** running this on a server, only **you** will be able to watch the video.

---

## 🔄 Why URLs Expire

YouTube uses **signed playback tokens**:

* Expire after minutes/hours
* Often tied to your **public IP**
* Cannot be manually extended

Just resolve again when needed.