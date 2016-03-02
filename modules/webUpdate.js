var http = require('http')
var https = require('https')
var select = require('html-select')
var tokenize = require('html-tokenize')
var Readable = require('stream').Readable
var diff = require('diff')
var db = require('../database.js')

exports.register = (config, callback) => {
	var requestType = config.requestType
	var siteName = config.siteName
	var hostname = config.hostname
	var selector = config.selector	
	var transform = eval(config.transform)

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
					var s = select(selector, (e) => {
						var strm = e.createReadStream()
						strm.on('data', (row) => {
							console.log('Got data!')
							if (row[0] === 'open' || row[0] === 'close' || /^\s+$/.test(row[1].toString()))
								return
							newData += row[1].toString() + '\n'
						})
						strm.on('end', () => {
							console.log(newData);
							newData = transform(newData)
						})
					})
					var dataStream = new Readable
					dataStream.push(bodyString)
					dataStream.push(null)
					dataStream.pipe(tokenize()).pipe(s)
					//console.log("Resuming stream")
					s.resume()

					s.on('end', () => {
						console.log('tokenize ended: ' + newData)
						var oldData = row.current

						if (newData != oldData) {
							callback('webUpdate', siteName, newData, '' + siteName + ' Updated!', 'Changed from: <div>' + oldData + '</div> to <div>' + newData + '</div>')
						}
					})
				})
			})
		}).end()

	}

	setInterval(checkUpdates, 60000)
	checkUpdates()	
}


