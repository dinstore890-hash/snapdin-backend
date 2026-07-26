const { Router } = require('express');
const { download, downloadFile, downloadInstagram, proxyImage } = require('../controllers/downloadController');
const validateUrl = require('../middleware/validateUrl');

const router = Router();

router.post('/download',           validateUrl, download);           // TikTok metadata
router.post('/instagram',                       downloadInstagram);  // Instagram metadata
router.get('/proxy-image',                      proxyImage);         // proxy CDN image
router.get('/download-file',                    downloadFile);       // proxy & stream file

module.exports = router;
