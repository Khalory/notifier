var google = require('./google.js')

exports.emailObject = (obj) => {
	return exports.email(obj.header, obj.body)
}

exports.email = (subject, body) => {
	return google.sendEmail(subject, body)	
}
