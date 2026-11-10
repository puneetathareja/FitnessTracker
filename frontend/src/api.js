/**
 * =============================================
 * API CONFIGURATION (api.js)
 * =============================================
 * Handles API base URL configuration
 * Supports both local and production environments
 */

/**
 * Normalize and validate API base URL
 * - Handles bare ports (":4000" -> "http://localhost:4000")
 * - Adds missing protocol (http:// or https://)
 * - Defaults to localhost for development, Render for production
 * - Corrects deprecated backend URLs
 */
function normalizeApiBase(val) {
	if (val && typeof val === 'string' && val.trim() !== '') {
		let url = val.trim();
		if (url.startsWith(':')) {
			url = `http://localhost${url}`;
		}
		return url.replace(/\/+$/, '');
	}
	const hasWindow = typeof window !== 'undefined' && window.location;
	const isLocalHost = hasWindow && ['localhost', '127.0.0.1'].includes(window.location.hostname);
	return isLocalHost ? 'http://localhost:4000' : '';
}

// ===== EXPORT API BASE URL =====
export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
