var levenshtein = require('fast-levenshtein');

var execTimeStart = performance.now()
execTime = function(reset = false, pretty = false){
	if (reset) execTimeStart = performance.now();
	if (pretty) return `${Math.round((performance.now() - execTimeStart) / 100) / 10} seconds`
	else return Math.round(performance.now() - execTimeStart)
}

var timeSinceExec = performance.now()
timeSince = function(pretty = false){
	old = performance.now() - timeSinceExec
	timeSinceExec = performance.now();
	if (pretty) return `${Math.round(old)} milliseconds`
	else return old
}

matchScore = function(textA, textB){
	// An absolute match between two cells is given 100 points
	let Score = 100
	
	if(textA != textB){
		if(textB.indexOf(textA) > -1 || textA.indexOf(textB) > -1) {
			// If a word from one of the cells exists in the other cell 25 points are given
			Score = 25
		}	
		else {
			// If there is no direct match a levenstein distance is calculated
			// This algorithm figures out how many characters needs to be changed in order to find a match
			// The calculated distance is used to give points
			// The score is 10 points divided by the distance
			Score = Math.round(10 / levenshtein.get(textA, textB))
		}
	}

	// Calculate numerical distance e.g. 0.1 == 10%
	// No distance is 20 points

	return Score ? Score : 0
}

cleanString = function(str){
	return	str ? str.replace(/[,\.\/\\\'\"\#]/gi, "").toLowerCase().trim() : ''
}

module.exports = function (a, b, columnStats, columnMatches, progress, options = {}) {

	var oneToMany = options.oneToMany != null ? options.oneToMany : false

	var tableColumns = []

	execTime(true)
	
	var bestFit = []
	var blacklist = []
	/*let a, b

	// Join the smallest dataset into the biggest
	if(aa.length < bb.length){
		a = bb
		b = aa
	} 
	else {
		a = aa
		b = bb
	}*/

	if(!(a.length > 0 && b.length > 0)) return bestFit

	// Store original data for later combined result out
	let _a = a
	let _b = b

	// columnMatches tell which columns has exact matches




	// Filter out columns that are not top 4 of columnstats results
	a = a.map((rowA,rowAIndex) => {
		return rowA.filter((colA,colAIndex) => {
			return (columnStats[0].findIndex(i => i.colIndex == colAIndex) > -1)
		})	
	})

	// Filter out columns that are not top 4 of columnstats results
	b = b.map((rowB,rowBIndex) => {
		return rowB.filter((colB,colBIndex) => {
			return (columnStats[1].findIndex(i => i.colIndex == colBIndex) > -1)
		})
	})

	// localStorage.kimA = a
	// localStorage.kimB = b


	a_headers = _a[0].map((item, ii) => {
		var header = (item != null ? item.trim() : `Column ${ii}`) + " " + 1
		var safeHeader = btoa(header)
		var columnHeader = {
			data: safeHeader,
			title: header,
			visible: false,
		}
		
		if(columnStats[0].slice(0,3).findIndex(i => i.colIndex == ii) > -1){
			columnHeader.visible = true
		}

		tableColumns.push(columnHeader)

		return safeHeader
	})

	b_headers = _b[0].map((item, ii) => {
		var header = (item != null ? item.trim() : `Column ${ii}`) + " #" + 2
		var safeHeader = btoa(header)
		var columnHeader = {
			data: safeHeader,
			title: header,
			visible: false,
		}

		if(columnStats[1].slice(0,3).findIndex(i => i.colIndex == ii) > -1){
			columnHeader.visible = true
		}

		tableColumns.push(columnHeader)

		return safeHeader
	})

	// console.log(a_headers)
	// console.log(b_headers)

	var iterationTodo = a.length * a[0].length * b.length * b[0].length
	var iterationCount = 0

	console.log(iterationCount, iterationTodo)

    a.forEach((rowA,rowAIndex) => {
		
		// Ignore first row since it should be a header
		if(rowAIndex == 0) return
		aaa = []

		b.forEach((rowB,rowBIndex) => {

			// Ignore first row since it should be a header
			if(rowBIndex == 0) return
			let CBA = []
			let CBAsumScore = 0

			rowA.forEach((colA,colAIndex) => {

				//if(columnStats[0].findIndex(i => i.colIndex == colAIndex) < 0) return
				let ABC = []
				let ABCsumScore = 0

				rowB.forEach((colB,colBIndex) => {

					//if(columnStats[1].findIndex(i => i.colIndex == colBIndex) < 0) return
					iterationCount++

					if(typeof colA == "string" && typeof colB == "string"){
						// Skip this process if the pair has been blacklisted
						//console.log(blacklist.filter(item => item === `${colAIndex}_${colBIndex}`).length)

						// Don't waste processing on strings that are already very different in length
						if(Math.abs(colA.length - colB.length) < 10 && colA.length > 3 && colB.length > 3){
							const textA = cleanString(colA)
							const textB = cleanString(colB)
							const Score = matchScore(textA, textB)

							ABCsumScore += Score

							// If there is a good score it is added to the exact match index
							// This index can be used to spot of there are certain columns that matches TOO many times
							// This would be the case with categories, tags or other topic-determining columns
							if(Score > 90){
								blacklist.push(`${colAIndex}_${colBIndex}`)
							}

							ABC.push({
								Score: Score, 
								// textA: textA, 
								// textB: textB,
								// colA: colA,
								// colB: colB,
								//colBIndex: colBIndex,
							})
						}
						
					}
					else {
						// console.error(typeof colA)
						// console.error(typeof colB)
					}
				})

				//const colsBforA = (ABC.length > 0) ? ABC : []
				CBAsumScore += ABCsumScore

				CBA.push({
					//colsBforA: colsBforA,
					sumScore: ABCsumScore,
					//colAIndex: colAIndex,
				})
			})

			//const colsA = (CBA.length > 0) ? CBA : []
			aaa.push({
				//colsA: colsA,
				sumMaxScore: CBAsumScore,
				rowBIndex: rowBIndex,
				processingTime: timeSince(),
			})
		})

		if(aaa.length > 0 && rowAIndex != 0){
			const rowsBforA = aaa.sort((a, b) => b.sumMaxScore - a.sumMaxScore)
			const _rowBIndex = rowsBforA[0].rowBIndex
			const rowsBforATop5 = rowsBforA.slice(0, 5)
			const sumMaxScore = rowsBforA[0].sumMaxScore
			const scoreDropoff = Math.abs(rowsBforA[0].sumMaxScore - rowsBforA[1].sumMaxScore)
			const scoreDropoffPercent = Math.round(scoreDropoff / sumMaxScore * 100)

			// To make sure we have the best fit possible we check the score difference between 1st and 2nd results
			// If there is a too small difference we estimate that the result is insignificant and discard the match
			// BUT: Only enforce this if the data MUST be 1-1 matched rather than 1-many - Dinory USE CASE would allow for 1-many
			if(scoreDropoffPercent > 20 || oneToMany || true){
				bestFit.push({
					rowAIndex: rowAIndex,
					rowBIndex: _rowBIndex,
					rowsBforATop5: rowsBforATop5,
					sumMaxScore: sumMaxScore,
					scoreDropoff: scoreDropoff,
					scoreDropoffPercent: scoreDropoffPercent,
					twoGoodThings: sumMaxScore + scoreDropoff,
					combinedResult: Object.assign(
						{}, 
						// Grab original data for a for the selected row 
						..._a[rowAIndex]
							.map((item, i) => {
								return {
									[a_headers[i]]: item
								}
							}),
						// Grab original data for b for the selected row 
						..._b[_rowBIndex]
							.map((item, i) => {
								return {
									[b_headers[i]]: item
								}
							})
					),
				})
			}
		}


		// Look for rows where a particular column to column doesnt match where all other rows match


		var completion = Math.round(iterationCount / iterationTodo * 100)
		if((rowAIndex / a.length * 100) % 1 == 0){
			progress({
				completion,
				iterationCount,
				iterationTodo,
			})
		}
	})	

	return {
		bestFit,
		blacklist,
		tableColumns,
	}
};