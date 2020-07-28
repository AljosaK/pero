var levenshtein = require('fast-levenshtein');
window.parsedFiles = []

function handleFileSelect(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	window.parsedFiles = []
	window.files = evt.dataTransfer.files; 
	console.log('Caught a File!');
	console.log(files);

	window.fileCount = 0
	Array.from(files).forEach(file => {
		if((file.name.indexOf('.csv') >= 0)){
			doUpload(file);	
		}
		else {
			console.log(`${file.name} need to be a CSV file`)
		}
	})
	
	
}

function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

function doUpload(e) { 
	console.log('attempt');
	Papa.parse(e, {
		config: {
			header:true
		},
		before: function(file, inputElem){ console.log('Attempting to Parse...')},
		error: function(err, file, inputElem, reason){ console.log(err); },
		complete: function(results, file){
			parsedFiles.push(results)
			fileCount++
			if(fileCount == 2) next()
		}
	});
}

var execTimeStart = performance.now()
window.execTime = function(reset = false, pretty = false){
	if (reset) execTimeStart = performance.now();
	if (pretty) return `${Math.round((performance.now()-execTimeStart)/100)/10} seconds`
	else return Math.round(performance.now()-execTimeStart)
}

var timeSinceExec = performance.now()
window.timeSince = function(pretty = false){
	old = performance.now()-timeSinceExec
	timeSinceExec = performance.now();
	if (pretty) return `${Math.round(old)} milliseconds`
	else return old
}

window.uniqueValues = ((arr) => Array.from(new Set(arr)))
window.histogram = ((arr) => {
	return Array.from(new Set(arr)).map((el,i) => {
		return {
			value: el,
			count: arr.filter(item => item === el).length
		}
	}).sort((a,b) => b.count-a.count)
})
window.countUniqueValues = ((arr) => new Set(arr).size)

window.next = function(){
	parsedFiles.forEach(item => {
		console.log(item.data.length,item.data[0].length)	
	})

	a = parsedFiles[0].data.slice(0,300)
	b = parsedFiles[1].data.slice(0,300)

	window.bestFit = []
	window.blacklist = []

	window.iterationCount = 0
	window.iterationTodo = a.length*a[0].length*b.length*b[0].length
	console.log(iterationCount,iterationTodo)

	//stopWords = window.histogram([...parsedFiles[0].data, ...parsedFiles[1].data].join().toLowerCase().replace(/\s+/gi,',').replace(/\,+/gi,',').split(',')).slice(0,30)
	// another version that gets rid of special chars
	// stopWords = window.histogram([...parsedFiles[0].data, ...parsedFiles[1].data].join().toLowerCase().replace(/[\s\.\,\;\:\/\-\_\&\"\']+/gi,',').replace(/\,+/gi,',').split(',')).slice(0,20)


	execTime(true)

	a.forEach((rowA,rowAIndex) => {
		aaa = []

		rowA.forEach((colA,colAIndex) => {

			let CBA = []

			let CBAavgDist = 0
			let CBAavgRelativeDist = 0

			b.forEach((rowB,rowBIndex) => {

				let ABC = []

				let ABCavgDist = 0
				let ABCavgRelativeDist = 0

				rowB.forEach((colB,colBIndex) => {
					iterationCount++

					if(typeof colA == "string" && typeof colB == "string"){
						// Skip this process if the pair has been blacklisted
						//console.log(blacklist.filter(item => item === `${colAIndex}_${colBIndex}`).length)

						// Don't waste processing on strings that are already very different in length
						if(Math.abs(colA.length-colB.length)<10 && colA.length > 3 && colB.length > 3){
							const textA = colA.replace(/[,\.\/\\\'\"\#]/gi, "").toLowerCase().trim()
							const textB = colB.replace(/[,\.\/\\\'\"\#]/gi, "").toLowerCase().trim()
							
							let dist = 0
							let relativeDist = 0
							
							if(textA != textB){
								if(textB.indexOf(textA) > -1 || textA.indexOf(textB) > -1) {
									dist = 2
									relativeDist = (2*(dist/(textA.length+textB.length)))
								}	
								else {
									dist = levenshtein.get(textA, textB)
									relativeDist = (2*(dist/(textA.length+textB.length)))
									// Only include results that are relevant	
								}
								
								ABCavgDist += dist
								ABCavgRelativeDist += relativeDist
							}

							if(relativeDist < 0.4 && dist < 3){
								ABC.push({
									dist: dist, 
									relativeDist: relativeDist, 
									textA: textA, 
									textB: textB,
									colA: colA,
									colB: colB,
									colBIndex: colBIndex,
								})

								blacklist.push(`${colAIndex}_${colBIndex}`)
							}
						}
						else {
							ABCavgDist += Math.abs(colA.length-colB.length)
							ABCavgRelativeDist += Math.abs(colA.length-colB.length)/((colA.length+colB.length)/2)
						}
						
					}
					else {
						console.error(typeof colA)
						console.error(typeof colB)
					}
				})

				if(ABC.length > 0){
					const cols = ABC.sort((a,b) => a.relativeDist-b.relativeDist)
					CBAavgDist += cols[0].dist
					CBAavgRelativeDist += cols[0].relativeDist

					CBA.push({
						cols: cols,
						minDist: cols[0].dist,
						minRelativeDist: cols[0].relativeDist,
						avgDist: ABCavgDist/cols.length,
						avgRelativeDist: ABCavgRelativeDist/cols.length,
						rowBIndex: rowBIndex,
						colBIndex: cols[0].colBIndex,
					})
				}
			})

			if(CBA.length > 0){
				const colBIndexes = CBA.map(item => item.colBIndex)
				const _histogram = histogram(colBIndexes)

				// Check if there is too many good results, which could indicate a category column like "job title" or "industry"
				if(_histogram.length > 0 && _histogram[0].count > 3){
					CBA = CBA.filter(item => item.colBIndex != _histogram.reverse()[0].value)
				}

				const rows = CBA.sort((a,b) => a.minRelativeDist-b.minRelativeDist)

				if(rows.length > 0){
					aaa.push({
						rows: rows,
						minDist: rows[0].minDist,
						minRelativeDist: rows[0].minRelativeDist,
						avgMinDist: CBAavgDist/rows.length,
						avgMinRelativeDist: CBAavgRelativeDist/rows.length,
						colAIndex: colAIndex,
						processingTime: timeSince(),
						histogram: _histogram,
					})
				}
			}
		})

		if(aaa.length > 0 && rowAIndex != 0){
			const cols = aaa.sort((a,b) => a.avgMinRelativeDist-b.avgMinRelativeDist)
			bestFit.push({
				minDist: cols[0].minDist,
				minRelativeDist: cols[0].minRelativeDist,
				minAvgMinDist: cols[0].avgMinDist,
				textA: cols[0].rows[0].cols[0].textA, 
				textB: cols[0].rows[0].cols[0].textB,
				rowAIndex: rowAIndex,
				colAIndex: cols[0].colAIndex,
				rowBIndex: cols[0].rows[0].rowBIndex,
				colBIndex: cols[0].rows[0].cols[0].colBIndex,
				cols: cols,
				combinedResult: Object.assign(
					{}, 
					...a[rowAIndex]
						.map((item, i) => {return{[a[0][i].trim()+" #"+1]:item}}), 
					...b[cols[0].rows[0].rowBIndex]
						.map((item, i) => {return{[b[0][i].trim()+" #"+2]:item}})
				),
			})
		}

		var completion = Math.round(iterationCount/iterationTodo*1000)
		if(completion%50==0){
			
			const str = `
${iterationCount.toLocaleString()} iterations done out of ${iterationTodo.toLocaleString()} in total (${completion/10}%).
<br>
${timeSince(true)} since last iteration.`

			console.log(str)
			document.querySelector('#progress').innerHTML = str
		}
	})	

	bestFit = bestFit.sort((a,b) => a.minRelativeDist-b.minRelativeDist)
	console.log(bestFit.slice(0,30))
	console.log(execTime(false, true))
	console.log(histogram(blacklist))

	saveResult()
}


window.saveResult = function(){

	const content = bestFit.map(item => item.combinedResult)

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
