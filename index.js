window.parsedFiles = []
window.math = require('mathjs')
window.helpers = require('./helpers')
window.ui = require('./display/ui')
window.config = require('./config')
// Tell datatables not to alert on error
$.fn.dataTable.ext.errMode = 'none';

window.isBlurred = false
window.onblur = () => {	window.isBlurred = true }
window.onfocus = () => { window.isBlurred = false }

if(typeof window.fileStats === 'undefined') window.fileStats = []
if(typeof window.files === 'undefined') window.files = []
if(typeof window.parsedFiles === 'undefined') window.parsedFiles = []
if(typeof window.fileCount === 'undefined') window.fileCount = 0

// Receive files
// Handle files
// UI: Ask "Use existing dataset to enrich new rows OR Enrich existing dataset with new columns"
// Convert to table
	// PDF
	// Excel
// Parse csv to table
// Make sense of columns
	// Transpose data to analyze columns seperately
	// Saved transposed columns for later reference
	// Also analyze occurance of text, numbers, special chars as a percentage of string
// Analyze datasets for matches
	// Split tasks into subtask for different threads
		// a.length / 100
	// Add column for presence in datasets for later overlap analyzis (venn diagram)
		// https://www.benfrederickson.com/venn-diagrams-with-d3.js/
// Present findings
	// Send to table view

window.handleFileSelect = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	window.files = [].concat(files, Array.from(evt.dataTransfer.files))
	console.log('Caught a File!');
	console.log(files);
	
	Array.from(evt.dataTransfer.files).forEach(file => {
		if((file.name.indexOf('.csv') >= 0)){
			parseCSVDataset(file);	
			document.querySelector('#drop_zone').style.height = 0
			document.querySelector('#drop_zone').style.opacity = 0
		}
		else {
			console.log(`${file.name} need to be a CSV file`)
		}
	})
}

window.handleDragOver = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

var dropZone = document.body;
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);

// var addDatasetBtn = $('#add-dataset');
// addDatasetBtn.change((e) => {
// 	console.log(e)
// })


function parseCSVDataset(e) { 
	console.log('attempt');
	Papa.parse(e, {
		config: {
			header: true, 
			worker: true,
		},
		before: function(file, inputElem){ console.log('Attempting to Parse...')},
		error: function(err, file, inputElem, reason){ console.log(err); },
		complete: function(results, file){
			const dataset = prepareDataset(results, file.name)
			parsedFiles.push(dataset)

			// Figure out data matrix
			fileStats.push([dataset.data.length, dataset.data[0].length, file.name])

			// Update UI showing stats about files
			// ui.updateFileStats(fileStats)

			fileCount++
			if (fileCount > 1) {
				matchDataset()
			}
			else if (fileCount == 1) {
				// ui.updateTable(dataset.data)
			}
		}
	});
}

$("#file_stats").delegate('.file-stat','click', function(){
	ui.updateTable(parsedFiles[$(this).attr('data-fileId')].data)
})

// Should be done in a WEBWORKER
function prepareDataset(dataset, name){

	// If headers are empty fill them with "Column #"
	dataset.data[0] = dataset.data[0].map((i,e) => {
		if(i.length == 0 || i == "" || i == " "){
			return `Column ${e}`
		}
		else return i
	})

	var headers = dataset.data[0]
	var transposed = helpers.transpose(dataset.data.slice(1))
	
	var dataInCols = transposed.map(col => {
		return helpers.countUniqueValues(col) > 1 && col.join('') != ""
	})

	// Identify most unique columns for comparison
	columnStats = helpers.columnStats(transposed, headers)

	// Filter out empty columns and add column with file name
	let data = dataset.data.map((row, i) => {
		return [...row.filter((col,i) => dataInCols[i]), (i==0?name.replace(/\.(.*)/gi,''):1)]
	})

	return Object.assign({}, dataset, {
		name, 
		data,
		transposed,
		columnStats,
		headers,
	})
}

window.matchDataset = function(){

	if(parsedFiles.length < 2) return false
	matchAtIndex = parsedFiles.length-1

	fileA = parsedFiles[matchAtIndex-1]
	fileB = parsedFiles[matchAtIndex]

	let columnMatches = helpers.columnMatches(
		[ fileA.transposed, fileB.transposed, ],
		[ fileA.headers, fileB.headers, ]
	)
	console.log(columnMatches)

	// If headers look too much like the other content aka it isnt a header fill them with Column no
	// ...

	// Ignore empty Columns
	// cell is - N/A "" " "

	// Limit calculcation to 1000x1000xcoluns while testing
	a = fileA.data//.slice(0,1000)
	b = fileB.data//.slice(0,50000)

	window.bestFit = []
	window.blacklist = []

	// Start webworker
	var work = require('webworkify');
	var w = work(require('./worker.js'));
	var first = true;

	w.addEventListener('message', function (event) {
		const data = (typeof event.data == 'Object' ? event.data : JSON.parse(event.data))
		if (first) {
			// revoke the Object URL that was used to create this worker, so as
			// not to leak it
			URL.revokeObjectURL(w.objectURL);
			first = false;
		}
		if(data.command != null){
			if(data.command == "progress"){
				//str = `${data.iterationCount.toLocaleString()} iterations done out of ${data.iterationTodo.toLocaleString()} in total (${data.completion}%).`
				str = `${data.completion}%`
				document.querySelector('#progress_inner').innerHTML = str	
				ui.updateProgressBar(data.completion)
			}
			else if(data.command == "error"){
				//str = `${data.iterationCount.toLocaleString()} iterations done out of ${data.iterationTodo.toLocaleString()} in total (${data.completion}%).`
				console.error(data.error)
			}
			else if(data.command == "done"){

				document.querySelector('#progress_inner').innerHTML = ''
				updateProgressInfo()

				ui.handleNotifications('Done 😀', {
				body: 'Datasets have been combined'
				}, () => {
				console.log('This notification was clicked')
				})

				bestFit = data.bestFit
				blacklist = data.blacklist

				var maxScores = {
					maxScore	  : 0,
					minScore	  : 99999,
					scores	 	  : [],
					specificPoints: []
				}
				maxScores.scores   = bestFit.map((x) => x.sumMaxScore) 
				maxScores.scores.sort((a,b) => b-a)

				maxScores.maxScore = maxScores.scores[0]
				maxScores.minScore = maxScores.scores[maxScores.scores.length - 1]

				var dropoff;
				var dropoffMargin = config.threshold.dropoff;
				for (var i = 1; i < maxScores.scores.length; i++){
					dropoff = Math.abs(maxScores.scores[i-1] - maxScores.scores[i])*100 / maxScores.maxScore;

					if (dropoff > dropoffMargin && maxScores.scores[i] != 0){
						maxScores.specificPoints.push(maxScores.scores[i]);
					}
				}
				datamerger_app.display(maxScores, data.tableColumns);

				// return; 
				tableColumns = data.tableColumns
				tableData = bestFit.sort((a,b) => b.sumMaxScore-a.sumMaxScore)

				

				// Update UI showing stats about files
				a = files[0].name.split(' ')[0]
				b = files[1].name.split(' ')[0]
				let name = `${a} ${b} combined`;
				let dataset = bestFit.map(i => Object.values(i.combinedResult))
				dataset = [tableColumns.map(i => i.title), ...dataset]
				console.log(dataset)
				dataset = prepareDataset({
					data: dataset
				}, name)

				parsedFiles.push(dataset)
				fileStats.push([bestFit.length, tableColumns.length, name])
				ui.updateFileStats(fileStats)

				// Update UI of Table View
				ui.updateTable(tableData, tableColumns)

				// Update UI of ProgressBar
				ui.updateProgressBar(0)

				// Close down webworker
				w.terminate()
				w = undefined	

				// Debugging
				console.log(data);
				console.log(helpers.histogram(blacklist))
			}
		}
	});

	const message = {
		command: "analyze",
		a, 
		b,
		columnStats: [fileA.columnStats, fileB.columnStats],
		columnMatches,
		options: {
			oneToMany: false, // Set to True for Dinero case and to False for any entity matching
		},
	}

	w.postMessage(JSON.stringify(message))
}

window.saveResult = function(){
	content = bestFit.map(item => item.combinedResult)

	console.log(files)
	a = files[0].name.split(' ')[0]
	b = files[1].name.split(' ')[0]
	
	let filename = `${a} ${b} combined.csv`;
	let csvContent = Papa.unparse(content, {
		delimiter: ",",
		header: true,
		newline: "\r\n"
	}); /* Download as CSV file */
	var dlLink = document.createElement("a");
	var blob = new Blob(["\ufeff", csvContent]);
	var url = URL.createObjectURL(blob);
	dlLink.href = url;
	dlLink.download = `${filename}.csv`;
	document.body.appendChild(dlLink);
	dlLink.click();
	document.body.removeChild(dlLink);
}

window.saveCSV = function(content, name){	
	let filename = `${name}`;
	let csvContent = Papa.unparse(content, {
		delimiter: ",",
		header: true,
		newline: "\r\n"
	}); /* Download as CSV file */
	var dlLink = document.createElement("a");
	var blob = new Blob(["\ufeff", csvContent]);
	var url = URL.createObjectURL(blob);
	dlLink.href = url;
	dlLink.download = `${filename}.csv`;
	document.body.appendChild(dlLink);
	dlLink.click();
	document.body.removeChild(dlLink);
}
