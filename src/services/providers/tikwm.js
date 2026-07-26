const axios  = require('axios');
const BaseProvider = require('./provider');

/**
 * TikWM Provider
 *
 * Uses the tikwm.com public API to fetch TikTok video metadata and
 * watermark-free / watermarked download links.
 *
 * API docs: https://www.tikwm.com/
 * Endpoint: POST https://www.tikwm.com/api/
 * Body    : { url, hd: 1 }
 *
 * All implementation details are contained in this file.
 * The rest of the backend never knows which provider is being used.
 */
class TikwmProvider extends BaseProvider {
  constructor() {
    super();

    this.client = axios.create({
      baseURL: 'https://www.tikwm.com',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Mimic a browser so the API doesn't reject the request
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
      // Follow redirects automatically (handles vt.tiktok.com / vm.tiktok.com short links)
      maxRedirects: 5,
    });
  }

  /**
   * Fetch video data from TikWM.
   * @param {string} url - Validated TikTok URL (long or short form).
   * @returns {Promise<object>} Normalised video object matching BaseProvider contract.
   * @throws {Error} If the API call fails or returns an unexpected shape.
   */
  async getVideo(url) {
    const response = await this.client.post(
      '/api/',
      new URLSearchParams({ url, hd: '1' }).toString()
    );

    this._validateResponse(response.data);
    console.log('TikWM images field:', JSON.stringify(response.data.data?.images)?.slice(0, 300));
    console.log('TikWM image_post_info:', JSON.stringify(response.data.data?.image_post_info)?.slice(0, 300));

    return this._normalise(response.data.data);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Validate the raw API response before touching its fields.
   * TikWM returns { code: 0, msg: "success", data: {...} } on success.
   * @param {object} raw - Raw response body from TikWM.
   * @throws {Error} If the response signals failure or is malformed.
   */
  _validateResponse(raw) {
    if (!raw || typeof raw !== 'object') {
      throw new Error('TikWM returned an empty or non-JSON response.');
    }

    if (raw.code !== 0) {
      // TikWM puts a human-readable reason in raw.msg
      throw new Error(raw.msg || 'TikWM API returned a non-zero status code.');
    }

    if (!raw.data || typeof raw.data !== 'object') {
      throw new Error('TikWM response is missing the data payload.');
    }
  }

  /**
   * Map TikWM's response shape to the normalised BaseProvider contract.
   *
   * TikWM fields used:
   *   data.title          — video caption / title
   *   data.author.nickname — display name of the creator
   *   data.cover          — thumbnail / cover image URL
   *   data.duration       — duration in seconds (integer)
   *   data.play           — watermark-free video URL
   *   data.wmplay         — watermarked video URL
   *   data.music          — background audio MP3 URL
   *
   * @param {object} d - data field from TikWM response.
   * @returns {object} Normalised video object.
   */
  _normalise(d) {
    const images = Array.isArray(d.images) && d.images.length > 0 ? d.images : null;
    return {
      title:     d.title     || 'TikTok Video',
      author:    `@${d.author?.unique_id || d.author?.nickname || 'unknown'}`,
      thumbnail: d.cover     || '',
      duration:  this._formatDuration(d.duration),
      videoUrl:  `https://www.tiktok.com/@${d.author?.unique_id || 'user'}/video/${d.id}`,
      images:    images,
      downloads: {
        nowm:  images ? '' : (d.hdplay || d.play || ''),
        wm:    images ? '' : (d.wmplay || d.play || ''),
        mp3:   d.music  || '',
        cover: d.origin_cover || d.cover || '',
      },
      isHd: !!(d.hdplay),
    };
  }

  /**
   * Convert a duration in seconds to "MM:SS" string.
   * @param {number} seconds
   * @returns {string} e.g. 32 → "00:32", 90 → "01:30"
   */
  _formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}

module.exports = new TikwmProvider();
