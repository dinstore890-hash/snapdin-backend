/**
 * BaseProvider
 *
 * Abstract interface that every video provider must implement.
 * Adding a new provider = create a new file in this directory that
 * extends BaseProvider and implements getVideo().
 *
 * Contract returned by getVideo():
 * {
 *   title     : string
 *   author    : string
 *   thumbnail : string  (URL)
 *   duration  : string  (e.g. "00:32")
 *   downloads : {
 *     nowm  : string  (watermark-free video URL)
 *     wm    : string  (watermarked video URL)
 *     mp3   : string  (audio-only URL)
 *     cover : string  (cover image URL)
 *   }
 * }
 */
class BaseProvider {
  /**
   * Fetch video metadata and download links for a TikTok URL.
   * @param {string} url - A validated TikTok video URL.
   * @returns {Promise<object>} Normalised video data matching the contract above.
   */
  // eslint-disable-next-line no-unused-vars
  async getVideo(url) {
    throw new Error(`${this.constructor.name} must implement getVideo(url)`);
  }
}

module.exports = BaseProvider;
