const axios = require('axios');
const { fetchTikTokData } = require('../services/tiktokService');
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
    const upstream = await axios.get(url, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        // Mimic a browser request so CDN doesn't reject it
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Referer': 'https://www.tiktok.com/',
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

module.exports = { download, downloadFile };
