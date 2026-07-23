const provider = require('./providers/tikwm');

/**
 * Fetches TikTok video data for the given URL.
 *
 * This service is the only entry point for the controller.
 * It delegates all provider-specific logic to the active provider.
 *
 * To swap providers in the future:
 *   1. Create a new file in providers/ that extends BaseProvider.
 *   2. Change the require() above to point to the new provider.
 *   3. Nothing else changes — controllers, routes, and the API contract stay the same.
 *
 * @param {string} url - A validated TikTok video URL.
 * @returns {Promise<object>} Normalised video metadata and download links.
 * @throws {Error} Propagated from the provider; caught by the global error handler.
 */
const fetchTikTokData = async (url) => {
  try {
    return await provider.getVideo(url);
  } catch (err) {
    // Wrap provider errors with a user-safe message while preserving the
    // original cause for server-side logging via the global error handler.
    const wrapped = new Error('Unable to fetch TikTok video.');
    wrapped.cause      = err;
    wrapped.statusCode = 502;
    throw wrapped;
  }
};

module.exports = { fetchTikTokData };
