const { errorResponse } = require('../utils/response');

const ALLOWED_HOSTS = ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'];

const validateUrl = (req, res, next) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return errorResponse(res, 'Invalid TikTok URL', 400);
  }

  try {
    const { hostname } = new URL(url);
    if (!ALLOWED_HOSTS.includes(hostname)) {
      return errorResponse(res, 'Invalid TikTok URL', 400);
    }
  } catch {
    return errorResponse(res, 'Invalid TikTok URL', 400);
  }

  next();
};

module.exports = validateUrl;
