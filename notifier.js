var aggregator = require('./aggregator.js')

aggregator.aggregate((mes) => console.log('NOTIFY CALLBACK ' + mes),
		(mes) => console.log('DB CALLBACK ' + mes))
