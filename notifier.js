var aggregator = require('./aggregator.js')
var db = require('./database.js')

aggregator.aggregate((type, name, newData, mes)  => {
	console.log('NOTIFY CALLBACK ' + mes)
	db.updateCache(type, name, newData, mes)
})
