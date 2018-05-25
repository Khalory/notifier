var aggregator = require('./aggregator.js')
var db = require('./database.js')
var notify = require('./notify.js')

// aggregator.aggregate((type, name, newData, header, message)  => {
// 	console.log({header: header, message: message})
// 	notify.email(header, message)
// 	db.addCache(type, name, newData, JSON.stringify({header: header, message: message}))
// })

notify.makeEmail("This is a fake phishing email from T.J.", "Did it work?")
