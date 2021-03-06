import _getIterator from 'babel-runtime/core-js/get-iterator';
import _Object$keys from 'babel-runtime/core-js/object/keys';
import { format, parse, resolve } from 'url';
import { STATUS_CODES } from 'http';
import * as http from 'http';
import * as https from 'https';
import { createGunzip, createInflate, createInflateRaw } from 'zlib';
import * as zlib from 'zlib';
import { PassThrough } from 'stream';
import _Object$assign from 'babel-runtime/core-js/object/assign';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _Symbol from 'babel-runtime/core-js/symbol';
import { convert } from 'encoding';
import bodyStream from 'is-stream';
import toArrayBuffer from 'buffer-to-arraybuffer';
import _Symbol$toStringTag from 'babel-runtime/core-js/symbol/to-string-tag';
import _Object$defineProperty from 'babel-runtime/core-js/object/define-property';
import _Object$create from 'babel-runtime/core-js/object/create';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _Object$setPrototypeOf from 'babel-runtime/core-js/object/set-prototype-of';
import _Array$from from 'babel-runtime/core-js/array/from';
import _Symbol$iterator from 'babel-runtime/core-js/symbol/iterator';

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js
// (MIT licensed)

var BUFFER = _Symbol('buffer');
var TYPE = _Symbol('type');
var CLOSED = _Symbol('closed');

var Blob = function () {
	function Blob() {
		_classCallCheck(this, Blob);

		_Object$defineProperty(this, _Symbol$toStringTag, {
			value: 'Blob',
			writable: false,
			enumerable: false,
			configurable: true
		});

		this[CLOSED] = false;
		this[TYPE] = '';

		var blobParts = arguments[0];
		var options = arguments[1];

		var buffers = [];

		if (blobParts) {
			var a = blobParts;
			var length = Number(a.length);
			for (var i = 0; i < length; i++) {
				var element = a[i];
				var buffer = void 0;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = new Buffer(new Uint8Array(element.buffer, element.byteOffset, element.byteLength));
				} else if (element instanceof ArrayBuffer) {
					buffer = new Buffer(new Uint8Array(element));
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = new Buffer(typeof element === 'string' ? element : String(element));
				}
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		var type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}

	Blob.prototype.slice = function slice() {
		var size = this.size;

		var start = arguments[0];
		var end = arguments[1];
		var relativeStart = void 0,
		    relativeEnd = void 0;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		var span = Math.max(relativeEnd - relativeStart, 0);

		var buffer = this[BUFFER];
		var slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		var blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		blob[CLOSED] = this[CLOSED];
		return blob;
	};

	Blob.prototype.close = function close() {
		this[CLOSED] = true;
	};

	_createClass(Blob, [{
		key: 'size',
		get: function get() {
			return this[CLOSED] ? 0 : this[BUFFER].length;
		}
	}, {
		key: 'type',
		get: function get() {
			return this[TYPE];
		}
	}, {
		key: 'isClosed',
		get: function get() {
			return this[CLOSED];
		}
	}]);

	return Blob;
}();

_Object$defineProperty(Blob.prototype, _Symbol$toStringTag, {
	value: 'BlobPrototype',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = _Object$create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

/**
 * body.js
 *
 * Body interface provides common methods for Request and Response
 */

var DISTURBED = _Symbol('disturbed');
var CONSUME_BODY = _Symbol('consumeBody');

/**
 * Body class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */

var Body = function () {
	function Body(body) {
		var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    _ref$size = _ref.size,
		    size = _ref$size === undefined ? 0 : _ref$size,
		    _ref$timeout = _ref.timeout,
		    timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

		_classCallCheck(this, Body);

		if (body == null) {
			// body is undefined or null
			body = null;
		} else if (typeof body === 'string') {
			// body is string
		} else if (body instanceof Blob) {
			// body is blob
		} else if (Buffer.isBuffer(body)) {
			// body is buffer
		} else if (bodyStream(body)) {
			// body is stream
		} else {
			// none of the above
			// coerce to string
			body = String(body);
		}
		this.body = body;
		this[DISTURBED] = false;
		this.size = size;
		this.timeout = timeout;
	}

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	Body.prototype.arrayBuffer = function arrayBuffer() {
		return this[CONSUME_BODY]().then(function (buf) {
			return toArrayBuffer(buf);
		});
	};

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */


	Body.prototype.blob = function blob() {
		var ct = this.headers && this.headers.get('content-type') || '';
		return this[CONSUME_BODY]().then(function (buf) {
			var _Object$assign2;

			return _Object$assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), (_Object$assign2 = {}, _Object$assign2[BUFFER] = buf, _Object$assign2));
		});
	};

	/**
  * Decode response as json
  *
  * @return  Promise
  */


	Body.prototype.json = function json() {
		return this[CONSUME_BODY]().then(function (buffer) {
			return JSON.parse(buffer.toString());
		});
	};

	/**
  * Decode response as text
  *
  * @return  Promise
  */


	Body.prototype.text = function text() {
		return this[CONSUME_BODY]().then(function (buffer) {
			return buffer.toString();
		});
	};

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */


	Body.prototype.buffer = function buffer() {
		return this[CONSUME_BODY]();
	};

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */


	Body.prototype.textConverted = function textConverted() {
		var _this = this;

		return this[CONSUME_BODY]().then(function (buffer) {
			return convertBody(buffer, _this.headers);
		});
	};

	/**
  * Decode buffers into utf-8 string
  *
  * @return  Promise
  */


	Body.prototype[CONSUME_BODY] = function () {
		var _this2 = this;

		if (this[DISTURBED]) {
			return Body.Promise.reject(new Error('body used already for: ' + this.url));
		}

		this[DISTURBED] = true;

		// body is null
		if (this.body === null) {
			return Body.Promise.resolve(new Buffer(0));
		}

		// body is string
		if (typeof this.body === 'string') {
			return Body.Promise.resolve(new Buffer(this.body));
		}

		// body is blob
		if (this.body instanceof Blob) {
			return Body.Promise.resolve(this.body[BUFFER]);
		}

		// body is buffer
		if (Buffer.isBuffer(this.body)) {
			return Body.Promise.resolve(this.body);
		}

		// istanbul ignore if: should never happen
		if (!bodyStream(this.body)) {
			return Body.Promise.resolve(new Buffer(0));
		}

		// body is stream
		// get ready to actually consume the body
		var accum = [];
		var accumBytes = 0;
		var abort = false;

		return new Body.Promise(function (resolve$$1, reject) {
			var resTimeout = void 0;

			// allow timeout on slow response body
			if (_this2.timeout) {
				resTimeout = setTimeout(function () {
					abort = true;
					reject(new FetchError('Response timeout while trying to fetch ' + _this2.url + ' (over ' + _this2.timeout + 'ms)', 'body-timeout'));
				}, _this2.timeout);
			}

			// handle stream error, such as incorrect content-encoding
			_this2.body.on('error', function (err) {
				reject(new FetchError('Invalid response body while trying to fetch ' + _this2.url + ': ' + err.message, 'system', err));
			});

			_this2.body.on('data', function (chunk) {
				if (abort || chunk === null) {
					return;
				}

				if (_this2.size && accumBytes + chunk.length > _this2.size) {
					abort = true;
					reject(new FetchError('content size at ' + _this2.url + ' over limit: ' + _this2.size, 'max-size'));
					return;
				}

				accumBytes += chunk.length;
				accum.push(chunk);
			});

			_this2.body.on('end', function () {
				if (abort) {
					return;
				}

				clearTimeout(resTimeout);
				resolve$$1(Buffer.concat(accum));
			});
		});
	};

	_createClass(Body, [{
		key: 'bodyUsed',
		get: function get() {
			return this[DISTURBED];
		}
	}]);

	return Body;
}();

function convertBody(buffer, headers) {
	var ct = headers.get('content-type');
	var charset = 'utf-8';
	var res = void 0,
	    str = void 0;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone$1(instance) {
	var p1 = void 0,
	    p2 = void 0;
	var body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (bodyStream(body) && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance.body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present and non-null.
 *
 * @param   Mixed  instance  Response or Request instance
 */
function extractContentType(instance) {
	var body = instance.body;

	// istanbul ignore if: Currently, because of a guard in Request, body
	// can never be null. Included here for completeness.

	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (body instanceof Blob) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return 'multipart/form-data;boundary=' + body.getBoundary();
	} else {
		// body is stream
		// can't really do much about this
		return null;
	}
}

function getTotalBytes(instance) {
	var body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (typeof body === 'string') {
		// body is string
		return Buffer.byteLength(body);
	} else if (body instanceof Blob) {
		// body is blob
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		// can't really do much about this
		return null;
	}
}

function writeToStream(dest, instance) {
	var body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (typeof body === 'string') {
		// body is string
		dest.write(body);
		dest.end();
	} else if (body instanceof Blob) {
		// body is blob
		dest.write(body[BUFFER]);
		dest.end();
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * A set of utilities borrowed from Node.js' _http_common.js
 */

/**
 * Verifies that the given val is a valid HTTP token
 * per the rules defined in RFC 7230
 * See https://tools.ietf.org/html/rfc7230#section-3.2.6
 *
 * Allowed characters in an HTTP token:
 * ^_`a-z  94-122
 * A-Z     65-90
 * -       45
 * 0-9     48-57
 * !       33
 * #$%&'   35-39
 * *+      42-43
 * .       46
 * |       124
 * ~       126
 *
 * This implementation of checkIsHttpToken() loops over the string instead of
 * using a regular expression since the former is up to 180% faster with v8 4.9
 * depending on the string length (the shorter the string, the larger the
 * performance difference)
 *
 * Additionally, checkIsHttpToken() is currently designed to be inlinable by v8,
 * so take care when making changes to the implementation so that the source
 * code size does not exceed v8's default max_inlined_source_size setting.
 **/
/* istanbul ignore next */
function isValidTokenChar(ch) {
  if (ch >= 94 && ch <= 122) return true;
  if (ch >= 65 && ch <= 90) return true;
  if (ch === 45) return true;
  if (ch >= 48 && ch <= 57) return true;
  if (ch === 34 || ch === 40 || ch === 41 || ch === 44) return false;
  if (ch >= 33 && ch <= 46) return true;
  if (ch === 124 || ch === 126) return true;
  return false;
}
/* istanbul ignore next */
function checkIsHttpToken(val) {
  if (typeof val !== 'string' || val.length === 0) return false;
  if (!isValidTokenChar(val.charCodeAt(0))) return false;
  var len = val.length;
  if (len > 1) {
    if (!isValidTokenChar(val.charCodeAt(1))) return false;
    if (len > 2) {
      if (!isValidTokenChar(val.charCodeAt(2))) return false;
      if (len > 3) {
        if (!isValidTokenChar(val.charCodeAt(3))) return false;
        for (var i = 4; i < len; i++) {
          if (!isValidTokenChar(val.charCodeAt(i))) return false;
        }
      }
    }
  }
  return true;
}
/**
 * True if val contains an invalid field-vchar
 *  field-value    = *( field-content / obs-fold )
 *  field-content  = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 *  field-vchar    = VCHAR / obs-text
 *
 * checkInvalidHeaderChar() is currently designed to be inlinable by v8,
 * so take care when making changes to the implementation so that the source
 * code size does not exceed v8's default max_inlined_source_size setting.
 **/
/* istanbul ignore next */
function checkInvalidHeaderChar(val) {
  val += '';
  if (val.length < 1) return false;
  var c = val.charCodeAt(0);
  if (c <= 31 && c !== 9 || c > 255 || c === 127) return true;
  if (val.length < 2) return false;
  c = val.charCodeAt(1);
  if (c <= 31 && c !== 9 || c > 255 || c === 127) return true;
  if (val.length < 3) return false;
  c = val.charCodeAt(2);
  if (c <= 31 && c !== 9 || c > 255 || c === 127) return true;
  for (var i = 3; i < val.length; ++i) {
    c = val.charCodeAt(i);
    if (c <= 31 && c !== 9 || c > 255 || c === 127) return true;
  }
  return false;
}

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

function sanitizeName(name) {
	name += '';
	if (!checkIsHttpToken(name)) {
		throw new TypeError(name + ' is not a legal HTTP header name');
	}
	return name.toLowerCase();
}

function sanitizeValue(value) {
	value += '';
	if (checkInvalidHeaderChar(value)) {
		throw new TypeError(value + ' is not a legal HTTP header value');
	}
	return value;
}

var MAP = _Symbol('map');

var Headers = function () {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	function Headers() {
		var init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		_classCallCheck(this, Headers);

		this[MAP] = _Object$create(null);

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) {
			// no op
		} else if (typeof init === 'object') {
			var method = init[_Symbol$iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				var pairs = [];
				for (var _iterator = init, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
					var _ref;

					if (_isArray) {
						if (_i >= _iterator.length) break;
						_ref = _iterator[_i++];
					} else {
						_i = _iterator.next();
						if (_i.done) break;
						_ref = _i.value;
					}

					var pair = _ref;

					if (typeof pair !== 'object' || typeof pair[_Symbol$iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(_Array$from(pair));
				}

				for (var _iterator2 = pairs, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _getIterator(_iterator2);;) {
					var _ref2;

					if (_isArray2) {
						if (_i2 >= _iterator2.length) break;
						_ref2 = _iterator2[_i2++];
					} else {
						_i2 = _iterator2.next();
						if (_i2.done) break;
						_ref2 = _i2.value;
					}

					var _pair = _ref2;

					if (_pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(_pair[0], _pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (var _iterator3 = _Object$keys(init), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _getIterator(_iterator3);;) {
					var _ref3;

					if (_isArray3) {
						if (_i3 >= _iterator3.length) break;
						_ref3 = _iterator3[_i3++];
					} else {
						_i3 = _iterator3.next();
						if (_i3.done) break;
						_ref3 = _i3.value;
					}

					var key = _ref3;

					var value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}

		_Object$defineProperty(this, _Symbol$toStringTag, {
			value: 'Headers',
			writable: false,
			enumerable: false,
			configurable: true
		});
	}

	/**
  * Return first header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */


	Headers.prototype.get = function get(name) {
		var list = this[MAP][sanitizeName(name)];
		if (!list) {
			return null;
		}

		return list.join(',');
	};

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */


	Headers.prototype.forEach = function forEach(callback) {
		var thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		var pairs = getHeaderPairs(this);
		var i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i],
			    name = _pairs$i[0],
			    value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaderPairs(this);
			i++;
		}
	};

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */


	Headers.prototype.set = function set(name, value) {
		this[MAP][sanitizeName(name)] = [sanitizeValue(value)];
	};

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */


	Headers.prototype.append = function append(name, value) {
		if (!this.has(name)) {
			this.set(name, value);
			return;
		}

		this[MAP][sanitizeName(name)].push(sanitizeValue(value));
	};

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */


	Headers.prototype.has = function has(name) {
		return !!this[MAP][sanitizeName(name)];
	};

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */


	Headers.prototype.delete = function _delete(name) {
		delete this[MAP][sanitizeName(name)];
	};

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	Headers.prototype.raw = function raw() {
		return this[MAP];
	};

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */


	Headers.prototype.keys = function keys() {
		return createHeadersIterator(this, 'key');
	};

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */


	Headers.prototype.values = function values() {
		return createHeadersIterator(this, 'value');
	};

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */


	Headers.prototype[_Symbol$iterator] = function () {
		return createHeadersIterator(this, 'key+value');
	};

	return Headers;
}();

Headers.prototype.entries = Headers.prototype[_Symbol$iterator];

_Object$defineProperty(Headers.prototype, _Symbol$toStringTag, {
	value: 'HeadersPrototype',
	writable: false,
	enumerable: false,
	configurable: true
});

function getHeaderPairs(headers, kind) {
	var keys = _Object$keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return [k];
	} : function (k) {
		return [k, headers.get(k)];
	});
}

var INTERNAL = _Symbol('internal');

function createHeadersIterator(target, kind) {
	var iterator = _Object$create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target: target,
		kind: kind,
		index: 0
	};
	return iterator;
}

var HeadersIteratorPrototype = _Object$setPrototypeOf({
	next: function next() {
		// istanbul ignore if
		if (!this || _Object$getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL],
		    target = _INTERNAL.target,
		    kind = _INTERNAL.kind,
		    index = _INTERNAL.index;

		var values = getHeaderPairs(target, kind);
		var len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		var pair = values[index];
		this[INTERNAL].index = index + 1;

		var result = void 0;
		if (kind === 'key') {
			result = pair[0];
		} else if (kind === 'value') {
			result = pair[1];
		} else {
			result = pair;
		}

		return {
			value: result,
			done: false
		};
	}
}, _Object$getPrototypeOf(_Object$getPrototypeOf(_getIterator([]))));

// On Node.js v0.12 the %IteratorPrototype% object is broken
if (typeof HeadersIteratorPrototype[_Symbol$iterator] !== 'function') {
	HeadersIteratorPrototype[_Symbol$iterator] = function () {
		return this;
	};
}

_Object$defineProperty(HeadersIteratorPrototype, _Symbol$toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * response.js
 *
 * Response class provides content decoding
 */

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */

var Response = function (_Body) {
	_inherits(Response, _Body);

	function Response() {
		var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		_classCallCheck(this, Response);

		var _this = _possibleConstructorReturn(this, _Body.call(this, body, opts));

		_this.url = opts.url;
		_this.status = opts.status || 200;
		_this.statusText = opts.statusText || STATUS_CODES[_this.status];
		_this.headers = new Headers(opts.headers);

		_Object$defineProperty(_this, _Symbol$toStringTag, {
			value: 'Response',
			writable: false,
			enumerable: false,
			configurable: true
		});
		return _this;
	}

	/**
  * Convenience property representing if the request ended normally
  */


	/**
  * Clone this response
  *
  * @return  Response
  */
	Response.prototype.clone = function clone() {

		return new Response(clone$1(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok
		});
	};

	_createClass(Response, [{
		key: 'ok',
		get: function get() {
			return this.status >= 200 && this.status < 300;
		}
	}]);

	return Response;
}(Body);

_Object$defineProperty(Response.prototype, _Symbol$toStringTag, {
	value: 'ResponsePrototype',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * request.js
 *
 * Request class contains server only options
 */

var PARSED_URL = _Symbol('url');

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */

var Request = function (_Body) {
	_inherits(Request, _Body);

	function Request(input) {
		var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		_classCallCheck(this, Request);

		var parsedURL = void 0;

		// normalize input
		if (!(input instanceof Request)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse('' + input);
			}
			input = {};
		} else {
			parsedURL = parse(input.url);
		}

		var method = init.method || input.method || 'GET';

		if ((init.body != null || input instanceof Request && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		var inputBody = init.body != null ? init.body : input instanceof Request && input.body !== null ? clone$1(input) : null;

		// fetch spec options
		var _this = _possibleConstructorReturn(this, _Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		}));

		_this.method = method.toUpperCase();
		_this.redirect = init.redirect || input.redirect || 'follow';
		_this.headers = new Headers(init.headers || input.headers || {});

		if (init.body != null) {
			var contentType = extractContentType(_this);
			if (contentType !== null && !_this.headers.has('Content-Type')) {
				_this.headers.append('Content-Type', contentType);
			}
		}

		// server only options
		_this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		_this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		_this.counter = init.counter || input.counter || 0;
		_this.agent = init.agent || input.agent;
		_this.localAddress = init.localAddress || input.localAddress;

		_this[PARSED_URL] = parsedURL;
		_Object$defineProperty(_this, _Symbol$toStringTag, {
			value: 'Request',
			writable: false,
			enumerable: false,
			configurable: true
		});
		return _this;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	Request.prototype.clone = function clone$1() {
		return new Request(this);
	};

	_createClass(Request, [{
		key: 'url',
		get: function get() {
			return format(this[PARSED_URL]);
		}
	}]);

	return Request;
}(Body);

_Object$defineProperty(Request.prototype, _Symbol$toStringTag, {
	value: 'RequestPrototype',
	writable: false,
	enumerable: false,
	configurable: true
});

function getNodeRequestOptions(request) {
	var headers = new Headers(request.headers);

	// fetch step 3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!/^https?:$/.test(request[PARSED_URL].protocol)) {
		throw new Error('only http(s) protocols are supported');
	}

	// HTTP-network-or-cache fetch steps 5-9
	var contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		var totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 12
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 16
	if (request.compress) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}
	if (!headers.has('Connection') && !request.agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4
	// chunked encoding is handled by Node.js

	var result = _Object$assign({}, request[PARSED_URL], {
		method: request.method,
		headers: headers.raw(),
		agent: request.agent
	});

	if (request.localAddress) result.localAddress = request.localAddress;

	return result;
}

/**
 * index.js
 *
 * a request API compatible with window.fetch
 */

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url$$1, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve$$1, reject) {
		// build request object
		var request = new Request(url$$1, opts);

		var options = getNodeRequestOptions(request);

		if (!options.protocol || !options.hostname) {
			throw new Error('only absolute urls are supported');
		}

		var send = (options.protocol === 'https:' ? https : http).request;

		// http.request only support string as host header, this hack make custom host header possible
		if (options.headers.host) {
			options.headers.host = options.headers.host[0];
		}

		// send request
		var req = send(options);
		var reqTimeout = void 0;

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					req.abort();
					reject(new FetchError('network timeout at: ' + request.url, 'request-timeout'));
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			clearTimeout(reqTimeout);
			reject(new FetchError('request to ' + request.url + ' failed, reason: ' + err.message, 'system', err));
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			// handle redirect
			if (fetch.isRedirect(res.statusCode) && request.redirect !== 'manual') {
				if (request.redirect === 'error') {
					reject(new FetchError('redirect mode is set to error: ' + request.url, 'no-redirect'));
					return;
				}

				if (request.counter >= request.follow) {
					reject(new FetchError('maximum redirect reached at: ' + request.url, 'max-redirect'));
					return;
				}

				if (!res.headers.location) {
					reject(new FetchError('redirect location header missing at: ' + request.url, 'invalid-redirect'));
					return;
				}

				// per fetch spec, for POST request with 301/302 response, or any request with 303 response, use GET when following redirect
				if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
					request.method = 'GET';
					request.body = null;
					request.headers.delete('content-length');
				}

				request.counter++;

				resolve$$1(fetch(resolve(request.url, res.headers.location), request));
				return;
			}

			// normalize location header for manual redirect mode
			var headers = new Headers();
			for (var _iterator = _Object$keys(res.headers), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
				var _ref;

				if (_isArray) {
					if (_i >= _iterator.length) break;
					_ref = _iterator[_i++];
				} else {
					_i = _iterator.next();
					if (_i.done) break;
					_ref = _i.value;
				}

				var _name = _ref;

				if (Array.isArray(res.headers[_name])) {
					for (var _iterator2 = res.headers[_name], _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _getIterator(_iterator2);;) {
						var _ref2;

						if (_isArray2) {
							if (_i2 >= _iterator2.length) break;
							_ref2 = _iterator2[_i2++];
						} else {
							_i2 = _iterator2.next();
							if (_i2.done) break;
							_ref2 = _i2.value;
						}

						var val = _ref2;

						headers.append(_name, val);
					}
				} else {
					headers.append(_name, res.headers[_name]);
				}
			}
			if (request.redirect === 'manual' && headers.has('location')) {
				headers.set('location', resolve(request.url, headers.get('location')));
			}

			// prepare response
			var body = res.pipe(new PassThrough());
			var response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout
			};

			// response object
			var output = void 0;

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no content-encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || !headers.has('content-encoding') || res.statusCode === 204 || res.statusCode === 304) {
				output = new Response(body, response_options);
				resolve$$1(output);
				return;
			}

			// otherwise, check for gzip or deflate
			var name = headers.get('content-encoding');

			// for gzip
			if (name == 'gzip' || name == 'x-gzip') {
				body = body.pipe(createGunzip());
				output = new Response(body, response_options);
				resolve$$1(output);
				return;

				// for deflate
			} else if (name == 'deflate' || name == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				var raw = res.pipe(new PassThrough());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(createInflate());
					} else {
						body = body.pipe(createInflateRaw());
					}
					output = new Response(body, response_options);
					resolve$$1(output);
				});
				return;
			}

			// otherwise, use response as-is
			output = new Response(body, response_options);
			resolve$$1(output);
			return;
		});

		writeToStream(req, request);
	});
}

/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

export { Headers, Request, Response };export default fetch;
