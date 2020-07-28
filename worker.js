var BestFit = require('./BestFit');

module.exports = function (self) {
	self.addEventListener('message',function (event){

		// Parse stringified JSON     
		const data = (typeof event.data == 'Object' ? event.data : JSON.parse(event.data))

		if(data.command != null){
			if(data.command == "analyze"){
				try {
					analyze = BestFit(data.a, data.b, data.columnStats, data.columnMatches, (progress) => {
						const response = (Object.assign({'command': 'progress',}, progress));

						self.postMessage(JSON.stringify(response));
					}, data.options)
				}
				catch (e) {
					const response = {
						'command': 'error',
						'error': e
					}
					self.postMessage(JSON.stringify(response));
				}

				const response = {
					'command': 'done',
					'bestFit': analyze.bestFit,
					'blacklist': analyze.blacklist,
					'tableColumns': analyze.tableColumns,
				}

				self.postMessage(JSON.stringify(response));
			}
		}
	});
};

