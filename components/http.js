var SteamCommunity = require('../index.js');

SteamCommunity.prototype.httpRequest = function(uri, options, callback, source) {
	if (typeof uri === 'object') {
		source = callback;
		callback = options;
		options = uri;
		uri = options.url || options.uri;
	} else if (typeof options === 'function') {
		source = callback;
		callback = options;
		options = {};
	}

	options.url = options.uri = uri;

	if (this._httpRequestConvenienceMethod) {
		options.method = this._httpRequestConvenienceMethod;
		delete this._httpRequestConvenienceMethod;
	}

	// Add origin header if necessary
	// https://github.com/DoctorMcKay/node-steamcommunity/issues/351
	if ((options.method || 'GET').toUpperCase() != 'GET') {
		options.headers = options.headers || {};
		if (!options.headers.origin) {
			var parsedUrl = new URL(options.url);
			options.headers.origin = parsedUrl.origin;
		}
	}

	var requestID = ++this._httpRequestID;
	source = source || "";

	var self = this;
	var continued = false;

	if (!this.onPreHttpRequest || !this.onPreHttpRequest(requestID, source, options, continueRequest)) {
		// No pre-hook, or the pre-hook doesn't want to delay the request.
		continueRequest(null);
	}

	function continueRequest(err) {
		if (continued) {
			return;
		}

		continued = true;

		if (err) {
			if (callback) {
				callback(err);
			}

			return;
		}

		// Build impit fetch options
		var fetchOpts = {
			"method": options.method || 'GET',
		};

		// Headers
		if (options.headers) {
			fetchOpts.headers = {};
			for (var h in options.headers) {
				if (Object.prototype.hasOwnProperty.call(options.headers, h)) {
					fetchOpts.headers[h] = options.headers[h];
				}
			}
		}

		// Request body: formData (multipart file uploads, like avatar upload)
		if (options.formData) {
			var boundary = '----SteamCommunity' + Math.random().toString(36).substring(2);
			fetchOpts.body = buildMultipartBody(options.formData, boundary);
			fetchOpts.headers = fetchOpts.headers || {};
			fetchOpts.headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
		} else if (options.form) {
			fetchOpts.body = (new URLSearchParams(options.form)).toString();
			fetchOpts.headers = fetchOpts.headers || {};
			fetchOpts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		} else if (options.body) {
			fetchOpts.body = options.body;
		}

		// JSON: set Accept header so Steam returns JSON
		if (options.json) {
			fetchOpts.headers = fetchOpts.headers || {};
			fetchOpts.headers['Accept'] = 'application/json';
		}

		// Redirect handling
		if (options.followRedirect === false) {
			fetchOpts.redirect = 'manual';
		}
		// followAllRedirects is the default in impit (redirect: 'follow')

		// Per-request timeout
		if (options.timeout) {
			fetchOpts.timeout = options.timeout;
		}

		// Build URL with query string
		var fetchUrl = options.uri || options.url;
		if (options.qs) {
			var qsStr = (new URLSearchParams(options.qs)).toString();
			fetchUrl += (fetchUrl.indexOf('?') != -1 ? '&' : '?') + qsStr;
		}

		self._impit.fetch(fetchUrl, fetchOpts).then(function(response) {
			// Build compatible response shape: {statusCode, headers, body, url}
			var res = {
				"statusCode": response.status,
				"headers": {},
				"url": response.url
			};
			response.headers.forEach(function(value, key) {
				res.headers[key.toLowerCase()] = value;
			});

			// encoding: null → return a Buffer (binary data like images)
			var bodyPromise = (options.encoding === null)
				? response.arrayBuffer().then(function(buf) { return Buffer.from(buf); })
				: response.text();

			return bodyPromise.then(function(rawBody) {
				var body = rawBody;
				if (options.json) {
					try {
						body = JSON.parse(rawBody);
					} catch (ex) {
						body = null; // Will trigger jsonError below
					}
				}
				res.body = body;

				var hasCallback = !!callback;
				var httpError = options.checkHttpError !== false && self._checkHttpError(null, res, callback, body);
				var communityError = !options.json && options.checkCommunityError !== false && self._checkCommunityError(body, httpError ? function(){} : callback);
				var tradeError = !options.json && options.checkTradeError !== false && self._checkTradeError(body, httpError || communityError ? function(){} : callback);
				var jsonError = options.json && options.checkJsonError !== false && body === null ? new Error("Malformed JSON response") : null;

				self.emit('postHttpRequest', requestID, source, options, httpError || communityError || tradeError || jsonError || null, res, body, {
					"hasCallback": hasCallback,
					"httpError": httpError,
					"communityError": communityError,
					"tradeError": tradeError,
					"jsonError": jsonError
				});

				if (hasCallback && !(httpError || communityError || tradeError)) {
					if (jsonError) {
						callback.call(self, jsonError, res);
					} else {
						callback.call(self, null, res, body);
					}
				}
			});
		}).catch(function(err) {
			var hasCallback = !!callback;
			var httpError = options.checkHttpError !== false && self._checkHttpError(err, null, callback, null);

			self.emit('postHttpRequest', requestID, source, options, httpError || err, null, null, {
				"hasCallback": hasCallback,
				"httpError": httpError,
				"communityError": false,
				"tradeError": false,
				"jsonError": false
			});

			if (hasCallback && !httpError) {
				callback.call(self, err);
			}
		});
	}
};

SteamCommunity.prototype.httpRequestGet = function() {
	this._httpRequestConvenienceMethod = "GET";
	return this.httpRequest.apply(this, arguments);
};

SteamCommunity.prototype.httpRequestPost = function() {
	this._httpRequestConvenienceMethod = "POST";
	return this.httpRequest.apply(this, arguments);
};

SteamCommunity.prototype._notifySessionExpired = function(err) {
	this.emit('sessionExpired', err);
};

SteamCommunity.prototype._checkHttpError = function(err, response, callback, body) {
	if (err) {
		callback(err, response, body);
		return err;
	}

	if (response.statusCode >= 300 && response.statusCode <= 399 && response.headers.location.indexOf('/login') != -1) {
		err = new Error("Not Logged In");
		callback(err, response, body);
		this._notifySessionExpired(err);
		return err;
	}

	if (response.statusCode == 403 && typeof response.body === 'string' && response.body.match(/<div id="parental_notice_instructions">Enter your PIN below to exit Family View.<\/div>/)) {
		err = new Error("Family View Restricted");
		callback(err, response, body);
		return err;
	}

	if (response.statusCode >= 400) {
		err = new Error("HTTP error " + response.statusCode);
		err.code = response.statusCode;
		callback(err, response, body);
		return err;
	}

	return false;
};

SteamCommunity.prototype._checkCommunityError = function(html, callback) {
	var err;

	if(typeof html === 'string' && html.match(/<h1>Sorry!<\/h1>/)) {
		var match = html.match(/<h3>(.+)<\/h3>/);
		err = new Error(match ? match[1] : "Unknown error occurred");
		callback(err);
		return err;
	}

	if (typeof html === 'string' && html.indexOf('g_steamID = false;') > -1 && html.indexOf('<title>Sign In</title>') > -1) {
		err = new Error("Not Logged In");
		callback(err);
		this._notifySessionExpired(err);
		return err;
	}

	return false;
};

SteamCommunity.prototype._checkTradeError = function(html, callback) {
	if (typeof html !== 'string') {
		return false;
	}

	var match = html.match(/<div id="error_msg">\s*([^<]+)\s*<\/div>/);
	if (match) {
		var err = new Error(match[1].trim());
		callback(err);
		return err;
	}

	return false;
};

/**
 * Build a multipart/form-data body from an options.formData object.
 * Supports string/number fields and file fields with {value: Buffer, options: {filename, contentType}}.
 */
function buildMultipartBody(formData, boundary) {
	var CRLF = '\r\n';
	var parts = [];

	Object.keys(formData).forEach(function(key) {
		var val = formData[key];
		var headers = '--' + boundary + CRLF;

		if (val && typeof val === 'object' && val.value !== undefined && val.options) {
			// File field: {value: Buffer, options: {filename, contentType}}
			headers += 'Content-Disposition: form-data; name="' + key + '"; filename="' + val.options.filename + '"' + CRLF;
			headers += 'Content-Type: ' + (val.options.contentType || 'application/octet-stream') + CRLF;
			headers += CRLF;
			parts.push(Buffer.from(headers, 'utf8'));
			parts.push(Buffer.isBuffer(val.value) ? val.value : Buffer.from(String(val.value), 'utf8'));
			parts.push(Buffer.from(CRLF, 'utf8'));
		} else {
			// Regular field
			headers += 'Content-Disposition: form-data; name="' + key + '"' + CRLF;
			headers += CRLF;
			parts.push(Buffer.from(headers, 'utf8'));
			parts.push(Buffer.from(String(val), 'utf8'));
			parts.push(Buffer.from(CRLF, 'utf8'));
		}
	});

	parts.push(Buffer.from('--' + boundary + '--' + CRLF, 'utf8'));
	return Buffer.concat(parts);
}
