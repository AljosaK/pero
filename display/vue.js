import Vue from "vue";

window.onload = function() {
	window.datamerger_app = new Vue({
		el: "#datamerger-vue",
		data: {
			step: 0,
			modalOpened: false,
			joinType: "overlap",
			threshold: {
				maxScore: 0,
				minScore: 9999,
				specificPoints: [],
				current: 0
			},
			tableCol : {}
		},
		watch : {
			'threshold.current': {
				handler(val){
					if (this.step == 2){
						var data = bestFit.sort((a,b) => b.sumMaxScore-a.sumMaxScore)
						data = data.filter((a) => a.sumMaxScore >= this.threshold.current).slice(-1)
						reviewTable(data, this.tableCol)					
					}
				}
			},
			step: {
				handler(val){
					if (this.step == 2){
						var data = bestFit.sort((a,b) => b.sumMaxScore-a.sumMaxScore)
						data = data.filter((a) => a.sumMaxScore >= this.threshold.current).slice(-1)
						reviewTable(data, this.tableCol)
					}
				}
			}
		},
		methods : {
			backButton(){
				this.step --;
			},
			nextButton(){
				this.step++;
			},
			display(maxScores, tableCol){
				this.threshold.maxScore = maxScores.maxScore;
				this.threshold.minScore = maxScores.minScore;
				this.threshold.specificPoints = maxScores.specificPoints;
				this.threshold.current = maxScores.specificPoints[0]
				this.tableCol = tableCol

				this.step = 1;
				this.modalOpened = true;
			}
		}
	})

	jQuery(document).on("click", ".popup-modal-overlay", function(e){
		if (e.target == this){
			datamerger_app.modalOpened = false;
		}	
	})
}
reviewTable = function(tableData, tableColumns = null) {
	
	str = `<div class=""><table id="review_result_table" class="ui compact small fixed single line celled selectable striped table" cellspacing="0" width="100%"></table></div>`
	document.querySelector('#test_result').innerHTML = str	

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

	$('#review_result_table')
		.on( 'error.dt', function ( e, settings, techNote, message ) {
		console.log( 'An error has been reported by DataTables: ', message );
		} )
		.DataTable(dataTableOptions);
	// Present data in table

	// Combine columns with more than 100% matches
	// Combine exact match columns
	// Turn columns with few unique values into 
}