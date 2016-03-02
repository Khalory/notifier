var fs = require('fs')

exports.aggregate = (callback) => {
	fs.readFile('./notifierConfig.json', (err, data) => {
		if (err) {
			console.log('Got error reading config: ' + err)
			throw err
		}

		var config = JSON.parse(data)

		var modules = {}
		for (key in config) {
			if (!modules[key]) {
				modules[key] = require('./modules/' + key + '.js')
			}

			config[key].forEach((moduleConfig) => {
				console.log(moduleConfig)
				modules[key].register(moduleConfig, callback)
			})
		}
	})
}
