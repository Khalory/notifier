var sqlite3 = require('sqlite3').verbose()

exports.build = (dbName, cb) => {
	var db = new sqlite3.Database(dbName)
	db.run('CREATE TABLE cache (type TEXT KEY NOT NULL, '
				+ 'name TEXT NOT NULL, current TEXT NOT NULL, '
				+ 'message TEXT, update_time INT KEY NOT NULL);', (err) => {
					if (!exists(err)) {
						console.log('Got error building database: ' + err)
						throw err
					}
				}, cb)
}




function exists(err) {
	return err.toString().indexOf('already exists') >= 0
}
