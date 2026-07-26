const axios = require('axios');
const { fetchTikTokData } = require('../services/tiktokService');
const { fetchInstagramData } = require('../services/instagramService');
const { successResponse, errorResponse } = require('../utils/response');

// POST /api/download — fetch video metadata
const download = async (req, res, next) => {
  try {
    const data = await fetchTikTokData(req.body.url);
    successResponse(res, { data });
  } catch (err) {
    next(err);
  }
};

// GET /api/download-file?url=...&filename=... — proxy & stream file to browser
const downloadFile = async (req, res, next) => {
  try {
    const { url, filename = 'snapdin-download' } = req.query;

    if (!url) return errorResponse(res, 'Missing url parameter.', 400);

    // Determine file extension from URL or fallback to .mp4
    const ext = url.match(/\.(mp4|mp3|jpg|jpeg|png|webp)/i)?.[1] || 'mp4';
    const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, '_')}.${ext}`;

    // Fetch the file from the CDN — stream directly, never buffer fully in memory
    const isTikTok = url.includes('tiktok') || url.includes('tiktokcdn');
    const isInstagram = url.includes('cdninstagram') || url.includes('fbcdn');

    const upstream = await axios.get(url, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Referer': isInstagram ? 'https://www.instagram.com/' : 'https://www.tiktok.com/',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Range': 'bytes=0-',
      },
      maxRedirects: 5,
    });

    // Forward content-type and length if available
    const contentType   = upstream.headers['content-type']   || 'application/octet-stream';
    const contentLength = upstream.headers['content-length'];

    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    // Allow frontend on any origin to trigger the download
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // Pipe the upstream stream straight to the client — memory efficient
    upstream.data.pipe(res);

    upstream.data.on('error', (err) => next(err));
  } catch (err) {
    next(err);
  }
};

// POST /api/instagram — fetch Instagram video metadata
const downloadInstagram = async (req, res, next) => {
  try {
    const data = await fetchInstagramData(req.body.url);
    const payload = { success: true, data };
    console.log('Sending payload size:', JSON.stringify(payload).length);
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

// GET /api/proxy-image?url=... — proxy CDN image to bypass CORS
const proxyImage = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return errorResponse(res, 'Missing url parameter.', 400);

    const isTikTok = url.includes('tiktok');
    const upstream = await axios.get(url, {
      responseType: 'stream',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Referer': isTikTok ? 'https://www.tiktok.com/' : 'https://www.instagram.com/',
      },
    });

    res.setHeader('Content-Type', upstream.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    upstream.data.pipe(res);
    upstream.data.on('error', (err) => next(err));
  } catch (err) {
    next(err);
  }
};

// GET /api/proxy-video?url=... — proxy CDN video for inline playback (no Content-Disposition)
const proxyVideo = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return errorResponse(res, 'Missing url parameter.', 400);

    const upstream = await axios.get(url, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity',
      },
      maxRedirects: 5,
    });

    res.setHeader('Content-Type', upstream.headers['content-type'] || 'video/mp4');
    if (upstream.headers['content-length']) res.setHeader('Content-Length', upstream.headers['content-length']);
    res.setHeader('Accept-Ranges', 'bytes');
    upstream.data.pipe(res);
    upstream.data.on('error', (err) => next(err));
  } catch (err) {
    next(err);
  }
};

module.exports = { download, downloadFile, downloadInstagram, proxyImage, proxyVideo };
