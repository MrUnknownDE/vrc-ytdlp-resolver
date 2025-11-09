import express from "express";
import morgan from "morgan";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";
import pLimit from "p-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

const YT_DLP = process.env.YT_DLP_PATH || "yt-dlp";
const limit = pLimit(2); // simple per-process concurrency limit

// ---- Version detection & refresh (local + latest from GitHub) ----
let localYtDlpVersion = "unknown";
let latestYtDlpVersion = null;

function fetchLatestYtDlpVersion() {
  return new Promise((resolve, reject) => {
    https.get(
      {
        hostname: "api.github.com",
        path: "/repos/yt-dlp/yt-dlp/releases/latest",
        headers: { "User-Agent": "vrc-ytdlp-webtool" }
      },
      (res) => {
        let data = "";
        res.on("data", (d) => (data += d));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            const tag = (json.tag_name || "").toString().trim();
            if (!tag) return reject(new Error("No tag_name in GitHub API response"));
            resolve(tag.replace(/^v/i, ""));
          } catch (e) {
            reject(e);
          }
        });
      }
    ).on("error", reject);
  });
}

async function detectLocalYtDlpVersion() {
  return new Promise((resolve) => {
    const child = spawn(YT_DLP, ["--version"]);
    let out = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.on("close", () => resolve(out.trim() || "unknown"));
  });
}

(async () => {
  localYtDlpVersion = await detectLocalYtDlpVersion();
  try {
    latestYtDlpVersion = await fetchLatestYtDlpVersion();
  } catch {
    // ignore on boot; we'll retry below
  }
  // re-check every 6 hours
  setInterval(async () => {
    try {
      latestYtDlpVersion = await fetchLatestYtDlpVersion();
    } catch {
      // ignore errors; keep last known value
    }
  }, 6 * 60 * 60 * 1000);
})();

// ---- Core: resolve direct media URL via yt-dlp ----
async function resolveDirectUrl(inputUrl) {
  const formatSelector =
    // 1) Progressive MP4 with audio (H.264 + AAC), https
    "best[acodec!=none][vcodec*=avc][ext=mp4][protocol*=https]/" +
    // 2) Any progressive with audio
    "best[acodec!=none][protocol*=https]/" +
    // 3) Anything with audio (may be HLS/DASH)
    "best[acodec!=none]/" +
    // 4) Fallback best
    "best";

  const json = await execJson([
    "-J",
    "-f",
    formatSelector,
    "--no-warnings",
    "--no-playlist",
    inputUrl
  ]);

  // Case A: yt-dlp returns a single playable URL (progressive)
  if (json.url) {
    return { url: json.url, note: "Direct stream (single URL)." };
  }

  // Case B: adaptive (separate video/audio)
  if (Array.isArray(json.requested_formats) && json.requested_formats.length) {
    const vid = json.requested_formats.find((f) => f.vcodec && f.acodec === "none");
    const aud = json.requested_formats.find((f) => f.acodec && f.vcodec === "none");
    if (vid?.url && aud?.url) {
      return {
        url: vid.url,
        audioUrl: aud.url,
        note:
          "Adaptive streams (separate video/audio). Many in-world players expect a single URL."
      };
    }
  }

  throw new Error("Could not extract a playable URL.");
}

function execJson(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(YT_DLP, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";

    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`yt-dlp exited with ${code}: ${err || out}`));
      }
      try {
        const json = JSON.parse(out);
        resolve(json);
      } catch (e) {
        reject(new Error(`JSON parse error: ${e.message}\nRaw: ${out.slice(0, 4000)}`));
      }
    });
  });
}

// ---- API routes ----
app.post("/api/resolve", async (req, res) => {
  const { url } = req.body || {};
  if (
    !url ||
    !/^https?:\/\/(www\.)?youtube\.com\/|^https?:\/\/youtu\.be\//i.test(url)
  ) {
    return res.status(400).json({ error: "Please provide a valid YouTube URL." });
  }

  try {
    const result = await limit(() => resolveDirectUrl(url));
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/api/version", (req, res) => {
  res.json({
    local: localYtDlpVersion,
    latest: latestYtDlpVersion,
    updateAvailable: Boolean(
      latestYtDlpVersion &&
        localYtDlpVersion !== "unknown" &&
        localYtDlpVersion !== latestYtDlpVersion
    )
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`VRC yt-dlp WebTool running at http://localhost:${port}`);
});