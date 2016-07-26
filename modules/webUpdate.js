var http = require('http')
var https = require('https')
var cheerio = require('cheerio')
var Readable = require('stream').Readable
var diff = require('diff')
var db = require('../database.js')

exports.register = (config, callback) => {
	var requestType = config.requestType
	var siteName = config.siteName
	var hostname = config.hostname
	var selector = config.selector
	var transform = eval(config.transform)

	if (transform == undefined)
		transform = (data)=>{return data}

	var checkUpdates = () => {
		var reqFunc = http
		if (requestType == 'https')
			reqFunc = https
		
		var options = {
			hostname: hostname,
			agent: false
		}

		var body = []
			//console.log(options)
		reqFunc.request(options, (res) => {
			//console.log('Got status: ', res.statusCode)
			
			res.on('data', (chunk) => {
				body.push(chunk.toString())
			})

			res.on('end', () => {
				//console.log('Closed connection')
				//
				db.getCache('webUpdate', siteName, (err, row) => {
					//TODO: add error handling
					if (err) {
						//console.log('Got error in reading file: ' + err)
						throw err
					}
					var bodyString = body.join('')
					var newData = ''

					$ = cheerio.load(bodyString)
					newData = $(selector).html()
					newData = transform(newData)
					var oldData = row.current
					
					if (newData != oldData) {
						callback('webUpdate', siteName, newData, '' + siteName + ' Updated!', 'Changed from: <div>' + oldData + '</div> to <div>' + newData + '</div>')
					}
				})
			})
		}).end()

	}

	setInterval(checkUpdates, 60000)
	checkUpdates()	
}


