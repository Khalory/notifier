var aggregator = require('./aggregator.js')
var db = require('./database.js')
var notify = require('./notify.js')

aggregator.aggregate((type, name, newData, header, message)  => {
	console.log({header: header, message: message})
	notify.email(header, message)
	db.addCache(type, name, newData, message)
})
