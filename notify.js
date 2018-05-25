var google = require('./google.js')

exports.emailObject = (obj) => {
	return exports.email(obj.header, obj.body)
}

exports.email = (subject, body) => {
	return google.sendEmail(subject, body)
}

exports.makeEmail = (subject, body) => {
	if (google.initialized()) {
		return google.insertEmail(subject, body)
	}
	setTimeout(() => exports.makeEmail(subject, body), 500)
}
