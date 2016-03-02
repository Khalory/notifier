var sqlite3 = require('sqlite3').verbose()
var dbName = './NotifierDatabase.db'
var ready = false
require('./buildDatabase.js').build(dbName, () => {
	ready = true
})
var db = new sqlite3.Database(dbName)

exports.getCache = (type, name, callback) => {
	db.get('SELECT * FROM cache WHERE type = ? AND name = ? ORDER BY update_time DESC LIMIT 1;', [type, name], (err, row) => {
		if (row == undefined)
			row = {current: ''}

		callback(err, row)
	})
}

exports.addCache = (type, name, newData, mes) => {
	db.run('INSERT INTO cache (type, name, current, message, update_time) '
		 + 'VALUES (?, ?, ?, ?, ?);', [type, name, newData, mes, (new Date).getTime()])	
}
