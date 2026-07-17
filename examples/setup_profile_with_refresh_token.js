// Setup Steam profile using refreshToken login via steam-user.
// Prerequisites: npm install steam-user steamcommunity @faker-js/faker
//
// This example:
// 0. Checks external IP via steamCommunity.httpRequestGet (verifies proxy is working)
// 1. Logs into steam-user with a refreshToken
// 2. Sets the web session cookies on steamcommunity
// 3. Runs setupProfile to initialize the profile
// 4. Picks a random game avatar, downloads it, and uploads it
// 5. Edits the profile name
// 6. Applies privacy settings
// 7. Retrieves the account country code via impit-powered httpRequestGet
//
// =============================================================================
// SteamCommunity constructor options (all optional)
// =============================================================================
//
//   new SteamCommunity({
//       timeout:      50000,              // Request timeout in ms (default: 50000)
//       userAgent:    'MyApp/1.0',        // Custom User-Agent string (default: Chrome UA)
//       localAddress: '192.168.1.100',    // Bind to specific local IP/interface
//       proxy:        'socks5://...',     // Proxy URL — impit handles HTTP/HTTPS/SOCKS4/SOCKS5
//       impit:        myCustomImpit,      // Inject a custom Impit instance (advanced)
//   })
//
//   // Shorthand for localAddress only:
//   new SteamCommunity('192.168.1.100')
//
//   // REMOVED (was request): `options.request` — the old `request` package is gone.
//   // Use `options.impit` to inject a custom Impit instance if needed.
//
//   // impit proxyUrl supports these protocols natively:
//   //   http://user:pass@host:port
//   //   https://user:pass@host:port
//   //   socks4://user:pass@host:port
//   //   socks5://user:pass@host:port
//
// Proxy environment variables for this example:
//   STEAM_PROXY_TYPE=http  STEAM_PROXY_URL=http://user:pass@host:port  node ...
//   STEAM_PROXY_TYPE=socks5 STEAM_PROXY_URL=socks5://user:pass@host:port node ...
//   STEAM_PROXY_TYPE=none   node ...   (default, no proxy)

const SteamUser = require('steam-user');
const SteamCommunity = require('../index.js');
const { faker } = require('@faker-js/faker');

// ========== CONFIGURATION ==========
const REFRESH_TOKEN = process.env.STEAM_REFRESH_TOKEN || 'your-refresh-token-here';
const PROFILE_NAME = process.env.STEAM_PROFILE_NAME || faker.internet.displayName();

// --- Proxy configuration ---
// STEAM_PROXY_TYPE: 'http' | 'socks5' | 'none' (default: 'none')
// STEAM_PROXY_URL:  full proxy URL including protocol and auth
//   Examples:
//     http://localhost:8080
//     http://user:password@proxy.example.com:3128
//     socks5://user:password@proxy.example.com:1080
//     socks5://localhost:9050
const PROXY_TYPE = (process.env.STEAM_PROXY_TYPE || 'none').toLowerCase();
const PROXY_URL = process.env.STEAM_PROXY_URL || '';

const PRIVACY_SETTINGS = {
	profile: SteamCommunity.PrivacyState.Public,       // 1=Private, 2=FriendsOnly, 3=Public
	inventory: SteamCommunity.PrivacyState.FriendsOnly,
	inventoryGifts: false,                               // true = hide gifts (private), false = visible
	gameDetails: SteamCommunity.PrivacyState.Public,
	playtime: false,                                     // true = hide playtime, false = show
	friendsList: SteamCommunity.PrivacyState.FriendsOnly,
	comments: SteamCommunity.PrivacyState.Public,        // mirrors profile visibility
};

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});

async function main() {
	console.log('=== Steam Community Profile Setup ===\n');

	// --- Build proxy config ---
	const proxyConfig = buildProxyConfig(PROXY_TYPE, PROXY_URL);
	if (proxyConfig) {
		console.log('Proxy: ' + PROXY_TYPE.toUpperCase() + ' → ' + proxyConfig.proxyUrl);
	} else {
		console.log('Proxy: none (direct connection)');
	}

	// Create steamcommunity early — we need it for the IP check
	const steamCommunityOptions = {};
	if (proxyConfig) {
		steamCommunityOptions.proxy = proxyConfig.proxyUrl;
	}
	const steamCommunity = new SteamCommunity(steamCommunityOptions);

	// === STEP 0: Check external IP (verifies proxy is working) ===
	console.log('\n[0/7] Checking external IP via steamCommunity.httpRequestGet (impit)...');
	const ipInfo = await getExternalIP(steamCommunity);
	console.log('  IP:', ipInfo);
	console.log();

	// === STEP 1: Login to steam-user with refreshToken ===
	console.log('[1/7] Logging into steam-user with refreshToken...');

	// steam-user: proxy passed via constructor options
	const steamUserOptions = {};
	if (proxyConfig && proxyConfig.steamUserProxy) {
		steamUserOptions.proxy = proxyConfig.steamUserProxy;
	}
	const steamUser = new SteamUser(steamUserOptions);

	const logOnResult = await loginWithRefreshToken(steamUser, REFRESH_TOKEN);
	console.log('  ✓ steam-user logged in as', logOnResult.steamID.getSteamID64());

	// === STEP 2: Wait for webSession, then set cookies on steamcommunity ===
	console.log('[2/7] Waiting for webSession...');
	const sessionData = await waitForWebSession(steamUser);
	console.log('  ✓ Got webSession cookies');

	steamCommunity.setCookies(sessionData.cookies);
	console.log('  ✓ Cookies set on steamcommunity');

	// === STEP 3: Verify logged in ===
	console.log('[3/7] Checking login state...');
	const loggedInState = await checkLoggedIn(steamCommunity);
	console.log('  ✓ Logged in:', loggedInState.vanity ? 'vanity URL resolved' : 'profile visible');

	// === STEP 4: Setup profile ===
	console.log('[4/7] Setting up profile...');
	await setupProfile(steamCommunity);
	console.log('  ✓ Profile setup complete');

	// === STEP 5: Get game avatars and upload one ===
	console.log('[5/7] Fetching game avatars and uploading...');
	const avatarUrl = await pickRandomGameAvatar(steamCommunity);
	console.log('  ✓ Picked avatar:', avatarUrl);

	const imageBuffer = await downloadAvatar(steamCommunity, avatarUrl);
	console.log('  ✓ Downloaded avatar (' + (imageBuffer.length / 1024).toFixed(1) + ' KB)');

	await uploadAvatar(steamCommunity, imageBuffer, 'jpg');
	console.log('  ✓ Avatar uploaded');

	// === STEP 6: Edit profile name ===
	console.log('[6/7] Setting profile name to:', PROFILE_NAME);
	await editProfileName(steamCommunity, PROFILE_NAME);
	console.log('  ✓ Profile name updated');

	// === STEP 7: Apply privacy settings ===
	console.log('[7/7] Applying privacy settings...');
	await setPrivacy(steamCommunity, PRIVACY_SETTINGS);
	console.log('  ✓ Privacy settings applied');

	// === BONUS: Get country code from store page ===
	console.log('\n[Bonus] Fetching country code...');
	const country = await getCountryCode(steamCommunity);
	console.log('  ✓ Country code:', country);

	console.log('\n=== All done! ===');
	steamUser.logOff();
}

// ========== HELPER FUNCTIONS ==========

/**
 * Build proxy configuration from type and URL.
 * impit natively supports HTTP, HTTPS, SOCKS4, and SOCKS5 proxies.
 *
 * Returns null if no proxy is configured, or an object:
 *   { proxyUrl: string, steamUserProxy: string|object }
 *
 * steam-user's proxy option accepts:
 *   - SOCKS5: 'socks5://user:pass@host:port'
 *   - HTTP:   'http://user:pass@host:port' or {HttpProxy: '...'}
 */
function buildProxyConfig(type, url) {
	if (type === 'none' || !url) {
		return null;
	}

	// Normalize: if user provided url without protocol, prepend it
	if (!url.match(/^https?:\/\/|^socks[45]?:\/\//)) {
		url = type + '://' + url;
	}

	switch (type) {
		case 'http':
		case 'https':
			// impit: proxyUrl accepts http/https/socks URLs directly
			// steam-user: HTTP proxy as string or {HttpProxy: url}
			return {
				proxyUrl: url,
				steamUserProxy: url,  // steam-user 5.x accepts URL string for HTTP proxies
			};

		case 'socks5':
		case 'socks4':
			return {
				proxyUrl: url,
				steamUserProxy: url,  // steam-user accepts 'socks5://...' string
			};

		default:
			console.warn('Unknown proxy type: ' + type + '. Valid: http, socks5, socks4, none');
			return null;
	}
}

/**
 * Check external IP address via api.ip.cc — useful for verifying proxy is active.
 * Returns a formatted string like "1.2.3.4 (US, New York)" or just the IP on failure.
 */
function getExternalIP(steamCommunity) {
	return new Promise((resolve) => {
		steamCommunity.httpRequestGet(
			{
				uri: 'https://api.ip.cc',
				timeout: 10000,
				headers: { 'Accept': 'application/json' },
			},
			(err, response, body) => {
				if (err) {
					return resolve('unknown (' + err.message + ')');
				}

				try {
					const json = typeof body === 'string' ? JSON.parse(body) : body;
					const ip = json.ip || json.IP || '?';
					const country = json.country || json.Country || '';
					const city = json.city || json.City || '';
					const parts = [ip];
					if (country) parts.push(country);
					if (city) parts.push(city);
					resolve(parts.join(', '));
				} catch (e) {
					// Fallback: return trimmed body
					const trimmed = (typeof body === 'string' ? body.trim() : String(body)).substring(0, 100);
					resolve(trimmed || 'unknown');
				}
			},
			'ip-check'
		);
	});
}

/**
 * Login to steam-user using a refresh token.
 */
function loginWithRefreshToken(steamUser, refreshToken) {
	return new Promise((resolve, reject) => {
		steamUser.once('loggedOn', () => resolve({ steamID: steamUser.steamID }));
		steamUser.once('error', reject);

		steamUser.logOn({
			refreshToken,
			logonID: 1000,
		});
	});
}

/**
 * Wait for steam-user to emit the webSession event (contains cookies for steamcommunity).
 */
function waitForWebSession(steamUser) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error('webSession timeout')), 30000);
		steamUser.once('webSession', (sessionID, cookies) => {
			clearTimeout(timeout);
			resolve({ sessionID, cookies });
		});
	});
}

/**
 * Check whether the steamcommunity instance is logged in.
 * Returns { vanity: boolean, familyView: boolean }.
 */
function checkLoggedIn(steamCommunity) {
	return new Promise((resolve, reject) => {
		steamCommunity.loggedIn((err, loggedIn, familyView) => {
			if (err) return reject(err);
			resolve({ vanity: loggedIn, familyView });
		});
	});
}

/**
 * Call setupProfile to finalize the profile initialization on Steam.
 */
function setupProfile(steamCommunity) {
	return new Promise((resolve, reject) => {
		steamCommunity.setupProfile((err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}

/**
 * Fetch the list of game avatars from Steam and pick a random one.
 * Uses steamcommunity's httpRequestGet — powered by impit under the hood since
 * the migration removed the old `request` package.
 */
function pickRandomGameAvatar(steamCommunity) {
	return new Promise((resolve, reject) => {
		steamCommunity.httpRequestGet(
			{
				uri: 'https://steamcommunity.com/actions/GameAvatars/?json=1',
				json: true,
			},
			(err, response, body) => {
				if (err) return reject(err);

				if (!body || !body.rgOtherGames) {
					return reject(new Error('Malformed game avatars response'));
				}

				const avatars = body.rgOtherGames
					.map((app) => app.avatars)
					.flat()
					.map((avatar) => avatar.avatar_hash);

				if (avatars.length === 0) {
					return reject(new Error('No game avatars available'));
				}

				const randomHash = avatars[Math.floor(Math.random() * avatars.length)];
				resolve(`https://avatars.akamai.steamstatic.com/${randomHash}_full.jpg`);
			},
			'steamcommunity'
		);
	});
}

/**
 * Download an avatar image as a Buffer.
 * Uses steamcommunity's httpRequestGet with `encoding: null` to get a raw Buffer
 * (powered by impit under the hood).
 */
function downloadAvatar(steamCommunity, url) {
	return new Promise((resolve, reject) => {
		steamCommunity.httpRequestGet(
			{
				uri: url,
				encoding: null, // return a Buffer, not a string
			},
			(err, response, body) => {
				if (err) return reject(err);
				if (response.statusCode !== 200) {
					return reject(new Error('Avatar download failed: HTTP ' + response.statusCode));
				}
				// encoding: null returns a Buffer (fixed in http.js bridge for impit)
				if (!Buffer.isBuffer(body)) {
					return reject(new Error('Avatar download returned text, not image data'));
				}
				resolve(body);
			},
			'steamcommunity'
		);
	});
}

/**
 * Upload an avatar image buffer to the Steam profile.
 */
function uploadAvatar(steamCommunity, imageBuffer, format) {
	return new Promise((resolve, reject) => {
		steamCommunity.uploadAvatar(imageBuffer, format, (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}

/**
 * Edit the profile display name.
 */
function editProfileName(steamCommunity, name) {
	return new Promise((resolve, reject) => {
		steamCommunity.editProfile({ name }, (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}

/**
 * Apply privacy settings to the Steam profile.
 *
 * Numeric values: SteamCommunity.PrivacyState.Private (1), FriendsOnly (2), Public (3)
 * Booleans (playtime, inventoryGifts): true = hide, false = show
 */
function setPrivacy(steamCommunity, privacy) {
	return new Promise((resolve, reject) => {
		const settings = {
			profile: privacy.profile,
			inventory: privacy.inventory,
			inventoryGifts: privacy.inventoryGifts,
			gameDetails: privacy.gameDetails,
			playtime: privacy.playtime,
			friendsList: privacy.friendsList,
			comments: privacy.comments || privacy.profile,
		};

		steamCommunity.profileSettings(settings, (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}

/**
 * Fetch the account country code from the Steam store page.
 *
 * IMPORTANT: After the impit migration, `steamCommunity.request` (the old `request`
 * package instance) no longer exists. Use `steamCommunity.httpRequestGet` instead —
 * it's powered by impit under the hood and provides the same (err, response, body)
 * callback signature.
 */
function getCountryCode(steamCommunity) {
	return new Promise((resolve, reject) => {
		steamCommunity.httpRequestGet(
			{
				uri: 'https://store.steampowered.com/account',
			},
			(err, response, body) => {
				if (err) return reject(err);
				if (response.statusCode !== 200) {
					return reject(new Error('Store page request failed: HTTP ' + response.statusCode));
				}

				// Parse the data-userinfo attribute from the #application_config element
				const match = body.match(
					/<[^>]*id="application_config"[^>]*data-userinfo="([^"]*)"/
				);
				if (!match) {
					return reject(new Error('Country code element not found'));
				}

				try {
					// HTML-encoded JSON needs double-quote unescaping
					const rawJson = match[1].replace(/&quot;/g, '"');
					const configData = JSON.parse(rawJson);
					resolve(configData.country_code || configData.countryCode || null);
				} catch (parseErr) {
					reject(new Error('Failed to parse userinfo JSON: ' + parseErr.message));
				}
			},
			'steamcommunity'
		);
	});
}
