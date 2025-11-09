# /Dockerfile
FROM node:20-slim

# System-Tools + Python3 für yt-dlp + optional ffmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 \
      ca-certificates \
      curl \
      ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp installieren (Release-Binary)
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
      -o /usr/local/bin/yt-dlp \
 && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Dependencies installieren
COPY package.json package-lock.json* ./
RUN npm ci || npm i

# App-Code
COPY . .

ENV PORT=3000
EXPOSE 3000
CMD ["npm","start"]