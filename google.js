var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var mailcomposer = require('mailcomposer')
var urlsafeBase64 = require('urlsafe-base64')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
var TOKEN_DIR = './.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'keys.json';
var SECRET_PATH = TOKEN_DIR + 'client_secret.json';
var oauth2Client
var initializedFlag = false

function initialize() {
	// Load client secrets from a local file.
	fs.readFile(SECRET_PATH, function processClientSecrets(err, content) {
		if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		}
		// Authorize a client with the loaded credentials, then call the
		// Gmail API.
		authorize(JSON.parse(content));
	})
}
initialize()

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 */
function authorize(credentials) {
	console.log('Authorizing')
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var auth = new googleAuth();
	oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function(err, token) {
		if (err) {
			getNewToken(oauth2Client, initialize);
		} else {
			oauth2Client.credentials = JSON.parse(token);
			initializedFlag = true
		}
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, cb) {
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	});
	console.log('Authorize this app by visiting this url: ', authUrl);
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question('Enter the code from that page here: ', function(code) {
		rl.close();
		oauth2Client.getToken(code, function(err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err)
				return
			}
			oauth2Client.credentials = token
			storeToken(token, () => {
				if (cb)
					cb(oauth2Client)
			})

		});
	});
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token, cb) {
	try {
		fs.mkdirSync(TOKEN_DIR)
	} catch (err) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
	fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
		if (err)
			console.log('Token not stored!')
		else
			console.log('Token stored to ' + TOKEN_PATH)
		cb(err)
	});
}

exports.initialized = () => {
	return initializedFlag
}

/**
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
exports.sendEmail = (subject, body) => {
	var email = {
		to: 'tk100794@gmail.com',
		subject: subject,
		fromName: 'T.J. Wilder',
		from: 'tk100794@gmail.com',
		html: body
	}
	var mail = mailcomposer(email)
	mail.build((err, message) => {
		//console.log(message.toString())
		var mes = urlsafeBase64.encode(message)
		//console.log(mes)
		var gmail = google.gmail('v1')
		var draft = gmail.users.messages.send({
			auth: oauth2Client,
			userId: 'me',
			id: 'me',
			resource: {
				raw: mes
			},
			raw: mes
		}, function(err, response) {
			if (err) {
				console.log('The API returned an error: ' + err)
				return
			}
			//console.log(response)
		})
	})
}

exports.insertEmail = (subject, body) => {
	var email = {
		to: 'tj@devpartners.com',
		subject: subject,
		from: 'Paypal <service@paypal-stuff.com>',
		html: body
	}
	var mail = mailcomposer(email)
	mail.build((err, message) => {
		console.log(message.toString())
		var mes = urlsafeBase64.encode(message)
		var gmail = google.gmail('v1')
		var draft = gmail.users.messages.insert({
			auth: oauth2Client,
			userId: 'tj@devpartners.com',
			resource: {
				raw: mes,
				labelIds: [
					'INBOX',
					'UNREAD'
				]
			}
		}, function(err, response) {
			if (err) {
				console.log('The API returned an error: ' + err)
				return
			}
			console.log(response)
		})
		console.log(JSON.stringify(draft, null, 2))
	})
}

/**
 * Get all the Labels in the user's mailbox.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {Function} callback Function to call when the request is complete.
 */
function listLabels(userId, callback) {
	var gmail = google.gmail('v1')
	var draft = gmail.users.labels.list({
			auth: oauth2Client,
			userId: 'me'
		}, function(err, response) {
			if (err)
				console.log(err)
			console.log(response)
		})
	console.log(draft)
}
