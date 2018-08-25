//@ts-check

const path = require('path');
const fs = require('fs-extra');
const md5 = require('md5');
const req = require('request');
const colors = require('colors/safe')

const CACHE_DIR = path.join(__dirname, 'request-cahce');

// create cache directory
if (!fs.existsSync(CACHE_DIR))
	fs.mkdirpSync(CACHE_DIR);

/**
 *
 * @param {string} _url
 * @param {*} [options]
 */
function request(_url, options = {}) {
	const url = _url.replace(/#.+$/, '');

	const hash = md5(url);
	const cacheFile = path.join(CACHE_DIR, hash);

	return new Promise((resolve, reject) => {
		if (fs.existsSync(cacheFile)) {
			// console.log(colors.green(colors.dim(`fetch ${url} from cache!`)));
			return resolve(fs.readFileSync(cacheFile, 'utf8'));
		}

		console.log(colors.cyan(`fetching ${colors.bold(url)} ...`));
		req(url, options, (error, response, body) => {
			if (error) {
				console.log(colors.red(`request failed, reason: ${error.message}`));
				return reject(error);
			}
			if (response.statusCode != 200) {
				const err = new Error(`response status code is not 200, but actual ${response.statusCode}`);
				console.log(colors.red(err.message));
				return reject(err);
			}
			fs.writeFileSync(cacheFile, body);
			console.log(colors.green('request success!'));
			return resolve(body);
		});
	});
}

module.exports = {
	request
};
