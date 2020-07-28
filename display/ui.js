
handleNotifications = function(title, options, callback = null){
	if (window.isBlurred && Notification.permission === "granted") {
		// If it's okay let's create a notification
		let n = new Notification(title, options)
		n.onclick = callback == null ? (() => {
			console.log('Notification clicked')
		}) : callback
		return true
	}
	// Alternatively show a sweetalert inside the app
	// https://sweetalert2.github.io/
	else return false
}

updateProgressBar = function(progress = 0) {
	progress = progress >= 100 ? 0 : +progress
	if (progress == 0) document.querySelector('#progressbar').style.width = 0	
	else if (progress > 0) {	
		document.querySelector('#progressbar').style.width = `${progress}%`	
	} 
	else document.querySelector('#progressbar').style.width = 0	
}

updateFileStats = function(fileStats) {
	str = `<div class="row">
	${fileStats.map((i,e) => `
<div class="col-sm-4 file-stat" data-fileId="${e}">
	<div class="">
		<strong>${i[2]}</strong>
		<br>
		Rows: ${i[0]} and Columns: ${i[1]}
	</div>
</div>
		`).join("")}
	</div>`
	document.querySelector('#file_stats').innerHTML = str	
}

updateProgressInfo = function(){
	str = `<a href="#" onclick="saveResult()"><i data-feather="download" id="" class="" stroke-width="1"></i></a>`
	document.querySelector('#progress_inner').innerHTML = str
	feather.replace({height: 18, width: 18,})
}

updateTable = function(tableData, tableColumns = null) {
	
	str = `<div class=""><table id="result_table" class="ui compact small fixed single line celled selectable striped table" cellspacing="0" width="100%"></table></div>`
	document.querySelector('#result').innerHTML = str	

	// Hide redundant columns
	/*
	 // Get the column API object
	var column = table.column( $(this).attr('data-column') );

	// Toggle the visibility
	column.visible( ! column.visible() );
	*/

	// Prepare data with columns for table view
	let tableDataForView, columns
	if(tableData[0] && tableData[0].sumMaxScore && tableData[0].twoGoodThings){
		tableDataForView = tableData.map(item => Object.assign({}, {
			sumMaxScore: item.sumMaxScore,
			twoGoodThings: item.twoGoodThings,
		}, item.combinedResult))

		columns = tableColumns != null ? [
			{
				data: 'sumMaxScore',
				title: 'sumMaxScore',
				visible: false,
			},
			{
				data: 'twoGoodThings',
				title: 'Match Rating',
				visible: true,
			},
			...tableColumns,
		] : Object.keys(tableDataForView[0]).map(i => {return {data: i, title: i}})
	}
	else {
		// Skip first row which is the header
		tableDataForView = tableData.slice(1)
		columns = tableColumns != null ? tableColumns : tableData[0].map(i => {return {title: i}})
	}

	const dom = "<'ui stackable grid'"+
	"<'row'"+
	"<'four wide column'B>"+
	"<'four wide column'>"+
	"<'right aligned eight wide column'f>"+
	">"+
	"<'row dt-table'"+
	"<'sixteen wide column'tr>"+
	">"+
	"<'row'"+
	"<'four wide column'l>"+
	"<'center aligned eight wide column'p>"+
	"<'right aligned four wide column'i>"+
	">"+
	">"

	// Configure table view
	window.dataTableOptions = {
		dom: dom,
		data: tableDataForView,
		columns: columns,
		buttons: [ 'colvis', ],
		responsive: true,
		keys: true,
		order: [[ 1, 'desc' ]],
		colReorder: true,
	}

	$('#result_table')
		.on( 'error.dt', function ( e, settings, techNote, message ) {
		console.log( 'An error has been reported by DataTables: ', message );
		} )
		.DataTable(dataTableOptions);
	// Present data in table

	// Combine columns with more than 100% matches
	// Combine exact match columns
	// Turn columns with few unique values into 
}

module.exports = {
	updateProgressBar, // (progress = 0)
	updateFileStats, // (fileStats)
	updateTable, // (tableData, tableColumns = null)
	handleNotifications, // (title, options, callback = null)
}