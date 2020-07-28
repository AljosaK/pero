// stopWords = window.histogram([...parsedFiles[0].data, ...parsedFiles[1].data].join().toLowerCase().replace(/\s+/gi,',').replace(/\,+/gi,',').split(',')).slice(0,30)
	// another version that gets rid of special chars
	// stopWords = window.histogram([...parsedFiles[0].data, ...parsedFiles[1].data].join().toLowerCase().replace(/[\s\.\,\;\:\/\-\_\&\"\']+/gi,',').replace(/\,+/gi,',').split(',')).slice(0,20)

var uniqueValues = ((arr) => Array.from(new Set(arr)))

var histogram = ((arr) => {
	return Array.from(new Set(arr)).map((el,i) => {
		return {
			value: el,
			count: arr.filter(item => item === el).length
		}
	}).sort((a,b) => b.count-a.count)
})

var countUniqueValues = ((arr) => new Set(arr).size)

var transpose = ((matrix) => {
	/*
	return matrix.reduce((prev, next, currentIndex) => {
		let _prev = currentIndex == 1 ? [...prev].map(item => (item.length > 0 ? [item] : [])) : [...prev]
		return [...next].map((item,i) => {
			//console.log(_prev[i], typeof _prev[i])
			if(typeof _prev[i] === 'undefined'){
				return [item]
			}
			else {
				return [..._prev[i],item]
			}
			
		})
	}) 
	*/

	return matrix[0].map((col, i) => matrix.map(row => row[i]))
})

var columnStats = ((transposedDataset, headers) => {

	// TODO
	// Should order randomly

	/*const columns = dataset.data
	.slice(0,1000)
	.reduce((prev, next, currentIndex) => {
		let _prev = currentIndex == 1 ? Array.from(prev).map(item => item.length > 0 ? [item] : []) : Array.from(prev)
		Array.from(next).forEach((item,i) => _prev[i].push(item))
		return _prev
	})*/

	const columns = transposedDataset

	let stats = {
		minStepChange: 99999,
		maxStepChange: 0,
		minUniqueValuesDegree: 99999,
		maxUniqueValuesDegree: 0,
		minStd: 99999,
		maxStd: 0,
	}

	return columns.map(ii => [
			ii, 
			ii
			.sort((a, b) => b.length - a.length)
			.map((a, b, arr) => {
				//return [...a.slice(0,100).padEnd(arr[0].length," ")].map(c => c.charCodeAt()).reduce((a,b) => a+b,0)
				//return +[...a.slice(0,100).padEnd(arr[0].length," ")].map(c => (c.charCodeAt()-30)/10).join("")/Math.pow(10,arr[0].length)

				let charMap = []
				let _a = (""+a)

				try {
					charMap = [..._a]
						.map(c => (c.charCodeAt() - 30) / 10)
						.sort((aa, bb) => bb - aa)

						if(b == 1) {
							//console.log(charMap)
							//console.log(charMap.reduce((aa, bb) => aa + bb, 0))
							//console.log(1 + Math.abs(charMap[0] - charMap[charMap.length-1]))
						}
				}
				catch (e){
					console.error(e)
					console.error(_a)
				}


				return Math.round(((
						charMap.reduce((aa, bb) => aa + bb, 0) / 
						(1 + Math.abs(charMap[0] - charMap[charMap.length-1]))
					) * 100) /
					Math.pow(_a.length,0.5)
				)
			})
			.map(i => (i > 0 ? (i < 1000 ? i : 1000) : 0))
			.sort((a, b) => b - a)
		])
		.map((e,iiii) => {
			const charMaps = e[1]
			const std = Math.round(math.std(e[1]))
			const uniqueValuesDegree = Math.round(uniqueValues(e[0]).length / (1 + e[0].length) * 100)
			const stepChange = e[1].reduce((a, b, i, arr) => {
				return arr[i + 1] ? a + Math.abs(b - arr[i + 1]) : a
			}, 0)
			const columnName = headers[iiii]

			if(stepChange < stats.minStepChange) stats.minStepChange = stepChange
			if(stepChange > stats.maxStepChange) stats.maxStepChange = stepChange
		
			if(std < stats.minStd) stats.minStd = std
			if(std > stats.maxStd) stats.maxStd = std
		
			if(uniqueValuesDegree < stats.minUniqueValuesDegree) stats.minUniqueValuesDegree = uniqueValuesDegree
			if(uniqueValuesDegree > stats.maxUniqueValuesDegree) stats.maxUniqueValuesDegree = uniqueValuesDegree
		
			return {
				//charMaps, 
				std, 
				stepChange,
				uniqueValuesDegree,
				columnName,
		}})
		.map((e,iiii) => {
			const normalizedStd = Math.round(100 * (e.std - stats.minStd) / (stats.maxStd - stats.minStd))
			const normalizedStepChange = Math.round(100 * (e.stepChange - stats.minStepChange) / (stats.maxStepChange - stats.minStepChange))
			const normalizedUniqueValuesDegree = Math.round(100 * (e.uniqueValuesDegree - stats.minUniqueValuesDegree) / (stats.maxUniqueValuesDegree - stats.minUniqueValuesDegree))
			
			return Object.assign(e, { 
				colIndex: iiii,
				normalizedStd,
				normalizedStepChange,
				normalizedUniqueValuesDegree,
				score: (normalizedStepChange + (normalizedUniqueValuesDegree * 2))
		})})
		.sort((a,b) => b.score - a.score)
		//.slice(0,5)
})

var columnMatches = ((transposedDatasets, headers) => { 
	columnsA = transposedDatasets[0]
	columnsB = transposedDatasets[1]
	columnsAU = columnsA.map(i => new Set(i).size)
	columnsBU = columnsB.map(i => new Set(i).size)

	columnLook = columnsA.map((colA, colAIndex) => {
		return columnsB.map((colB, colBIndex) => {
			uniqInColA = columnsAU[colAIndex]
			uniqInColB = columnsBU[colBIndex]
			unionUniqInColsAB = new Set([].concat(colB, colA)).size
			maxUniqInColsAB = Math.max(uniqInColA, uniqInColB)
			minUniqInColsAB = Math.min(uniqInColA, uniqInColB)
			sumUniqInColsAB = uniqInColA + uniqInColB
			notUniqInBothAB = unionUniqInColsAB - maxUniqInColsAB
			notUniqInBothABPercentage = notUniqInBothAB / unionUniqInColsAB
			overlapUniqInColsAB = minUniqInColsAB - notUniqInBothAB

			columnMatch = {
				maxUniqInColsAB,
				minUniqInColsAB,
				unionUniqInColsAB,
				sumUniqInColsAB,
				uniqInColA,
				uniqInColB,
				colAIndex,
				colBIndex,	
				notUniqInBothAB,
				notUniqInBothABPercentage,
				overlapUniqInColsAB,
				headerA: headers[0][colAIndex],
				headerB: headers[1][colBIndex],
			}
			return columnMatch
		})
		.sort((a,b) => b.overlapUniqInColsAB - a.overlapUniqInColsAB)
		.slice(0,1)

	})

	columnLookSorted = [].concat(...columnLook)
		.sort((a,b) => b.overlapUniqInColsAB - a.overlapUniqInColsAB)
	return columnLookSorted
})

module.exports = {
	uniqueValues,
	histogram,
	countUniqueValues,
	columnStats,
	transpose,
	columnMatches,
}