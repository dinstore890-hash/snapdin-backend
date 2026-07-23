const { Router } = require('express');
const { download, downloadFile } = require('../controllers/downloadController');
const validateUrl = require('../middleware/validateUrl');

const router = Router();

router.post('/download',      validateUrl, download);      // fetch metadata
router.get('/download-file',              downloadFile);   // proxy & stream file

module.exports = router;
