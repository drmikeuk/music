// based on worked example https://dc-js.github.io/dc.js/docs/stock.html

var colours = ["#5ba965",
"#ba5fb2",
"#a6973e",
"#6a7fcf",
"#cd6c39",
"#cc566a"];
var colours = ["#934acc",
"#559348",
"#b74c8e",
"#a37832",
"#6574be",
"#c44c44"]; // pimp

var colours = ["#daecca",
"#88aee1",
"#dbc4a4",
"#8bd0eb",
"#e7b8b7",
"#87c7c0",
"#d6bee2",
"#abcaa4",
"#aeb9d5",
"#baeae5",
"#a9beaf",
"#bad7e4"]; // pastel

var colours1 = ["#a57b87",
"#d642bc",
"#e5b6ca",
"#e545a2",
"#8f5260",
"#e03b6f",
"#aa7796",
"#b23d84",
"#de8095",
"#9b5080",
"#e386c0",
"#ad4261"]; // red roses

var colours2= ["#656d50",
"#92e63f",
"#a9ae87",
"#d9d934",
"#5e8b54",
"#5dcf51",
"#656a26",
"#97dd89",
"#a09c3f",
"#d8dfa9",
"#4f9437",
"#c8d766"];  // mint

var colours3 =  ["#8f7040",
"#e28c23",
"#6b4c33",
"#e1b340",
"#766949",
"#e6c392",
"#705110",
"#d69a55",
"#85644a",
"#a27b1d",
"#ad906c",
"#a06829"]; // yellow lime

var colours4 = ["#ff4f8a",
"#007e19",
"#6263ff",
"#abb13d",
"#800078",
"#e37f00",
"#00a6f0",
"#c1006e",
"#aea3e2",
"#771224",
"#d18f7c",
"#6a3557"]; // pimp

// from https://medialab.github.io/iwanthue/

// CREATE OBJECTS & TIE TO HTML ie match to div IDs in the html
// originRingChart = dc.pieChart("#chart-ring-origin"),
var composersRowChart = dc.rowChart("#chart-row-composers"),
    orchestrasRowChart = dc.rowChart("#chart-row-orchestras"),
    citiesRowChart = dc.rowChart("#chart-row-cities"),
    timeSeriesChart = dc.seriesChart("#chart-series-time"),
    timeBarChart = dc.barChart("#chart-bar-time"),
    dataCount = dc.dataCount("#datacount"),
    dataSummaryTable = dc.dataTable("#table-datasummary");

var ndx;            // NB now paginating need to define outside of load data

// LOAD DATA
d3.csv('/assets/PerformanceDatabaseMock.csv').then(data => {
	// CREATE CROSSFILTER DIMENSIONS AND GROUPS
	ndx = crossfilter(data),
    composerDim = ndx.dimension(d => d.Composer),
    composerSearchDim = ndx.dimension(d => d.Composer),
		orchestraDim = ndx.dimension(d => d.Orchestra),
    cityDim = ndx.dimension(d => d.City),
		yearDim = ndx.dimension(d => d.Year),
    cityYearDim = ndx.dimension(d => [d.City, d.Year]),
		all = ndx.groupAll(),
    composerGroup = composerDim.group(),
    orchestraGroup = orchestraDim.group(),
    cityGroup = cityDim.group(),
    yearGroup = yearDim.group().reduceCount(),
    cityYearGroup = cityYearDim.group().reduceCount();


	// CONFIGURE DATA COUNT (x out of y records shown)
	dataCount.dimension(ndx)
	    .group(all)
	    .html({
	    	some: '<span class="filter-count">%filter-count</span> out of <span class="total-count">%total-count</span> performances selected. <a href="javascript:dc.filterAll(); dc.renderAll();">View all performances</a>',
     		all: 'All performances selected. Click on charts to filter...'
		});


	// CONFIGURE CHART ATTRIBUTES
  composersRowChart.width(260).height(800)
      .dimension(composerDim)
      .group(composerGroup)
      .ordinalColors(colours1) 	         // my range of colours
      .cap(20)                           // cap to 20 rows as test
      .ordering(d => -d.value)           // order by count (not name)
      .elasticX(true)
      .xAxis().ticks(4);                 // --> less ticks! setter so can't chain ie must be last!
	    // NB elastic means rescale axis; may want to turn this off

  orchestrasRowChart.width(400).height(300)
      .dimension(orchestraDim)
      .group(orchestraGroup)
      .ordinalColors(colours2) 	         // my range of colours
      .ordering(d => d.key)              // order by name
      //.renderVerticalGridLines(false)
      .elasticX(true)
      .xAxis().ticks(5);                 // --> less ticks! setter so can't chain ie must be last!
	    // NB elastic means rescale axis; may want to turn this off

  citiesRowChart.width(400).height(300)
      .dimension(cityDim)
      .group(cityGroup)
      .ordinalColors(colours3) 	         // my range of colours
      .ordering(d => d.key)              // order by name
      .elasticX(true)
      .xAxis().ticks(5);                 // --> less ticks! setter so can't chain ie must be last!
	    // NB elastic means rescale axis; may want to turn this off


  timeSeriesChart.width(800).height(240)
      .dimension(cityYearDim)
      .group(cityYearGroup)
      .seriesAccessor(function(d) {return d.key[0];})
      .keyAccessor(function(d) {return +d.key[1];})
      .valueAccessor(function(d) {return +d.value;})
      .ordinalColors(colours4) 	         // my range of colours
      .x(d3.scaleLinear().domain([1840, 1900]))
      .elasticX(true)
      .legend(dc.legend().x(300).y(0).itemHeight(13).gap(5).horizontal(1).legendWidth(500).itemWidth(80))
      .xAxis().tickFormat(d3.format('d'));    // 1900 not 1,900
      // NB elastic means rescale axis; may want to turn this off
  timeSeriesChart.yAxis().ticks(5);         // --> less ticks! setter so can't chain ie must be last!


  timeBarChart.width(800).height(180)
      .dimension(yearDim)
      .group(yearGroup)
      .ordinalColors(colours) 	         // my range of colours
      // old style .x(d3.scale.linear().domain([1840, 1900])) // d3v3 not d3v4
      .x(d3.scaleLinear().domain([1840, 1900]))
      .centerBar(true)
      .elasticY(true)
      .xAxis().tickFormat(d3.format('d'));    // 1900 not 1,900
      // NB elastic means rescale axis; may want to turn this off
   timeBarChart.yAxis().ticks(5);         // --> less ticks! setter so can't chain ie must be last!


	// CONFIGURE DATA TABLE          // yearDIM = sort by year ?
	dataSummaryTable.dimension(yearDim)
	    .group(d => d.year)          // group by year??
      .size(Infinity)				       // need all the records & let pagination handle display & offset
    	.columns(['Composer', 'Symphony', 'Year', 'Orchestra', 'City'])
      .on('preRender', update_offset)     // pagination
      .on('preRedraw', update_offset)     // pagination
      .on('pretransition', display);      // pagination


  // DOWNLOAD BUTTON ACTION
  // from example https://dc-js.github.io/dc.js/examples/download-table.html

  d3.select('#download')
      .on('click', function() {
          var data = composerDim.top(Infinity);
          //if(d3.select('#download-type input:checked').node().value==='table') {
              data = data.sort(function(a, b) {
                  return dataSummaryTable.order()(dataSummaryTable.sortBy()(a), dataSummaryTable.sortBy()(b));
              });
              data = data.map(function(d) {
                  var row = {};
                  dataSummaryTable.columns().forEach(function(c) {
                      row[dataSummaryTable._doColumnHeaderFormat(c)] = dataSummaryTable._doColumnValueFormat(c, d);
                  });
                  return row;
              });
          //}

          //console.log  ("data...");
          //console.log (data); //  -> i have the right data here

          // using Filesave.js  https://github.com/eligrey/FileSaver.js/
          // orig: var blob = new Blob([d3.csvFormat(data)], {type: "text/plain;charset=utf-8"});
          var blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
          saveAs(blob, 'data.txt');
      });



	// RENDERING
	dc.renderAll();

}); /* close load data */



// FUNCTIONS
// =========


// PAGINATION
// https://github.com/dc-js/dc.js/blob/develop/web-src/examples/table-pagination.html

var ofs = 0, pag = 20;          // start 0; 20 per page

function update_offset() {
    var totFilteredRecs = ndx.groupAll().value();
    var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
    ofs = ofs >= totFilteredRecs ? Math.floor((totFilteredRecs - 1) / pag) * pag : ofs;
    ofs = ofs < 0 ? 0 : ofs;

    dataSummaryTable.beginSlice(ofs);
    dataSummaryTable.endSlice(ofs+pag);
}

function display() {
    var totFilteredRecs = ndx.groupAll().value();
    var end = ofs + pag > totFilteredRecs ? totFilteredRecs : ofs + pag;
    d3.select('#begin')
        .text(end === 0? ofs : ofs + 1);
    d3.select('#end')
        .text(end);
    d3.select('#last')
        .attr('disabled', ofs-pag<0 ? 'true' : null);
    d3.select('#next')
        .attr('disabled', ofs+pag>=totFilteredRecs ? 'true' : null);
    d3.select('#size').text(totFilteredRecs);
    if(totFilteredRecs != ndx.size()){
      d3.select('#totalsize').text("(filtered Total: " + ndx.size() + " )");
    }else{
      d3.select('#totalsize').text('');
    }
}
function next() {
    ofs += pag;
    update_offset();
    dataSummaryTable.redraw();
}
function last() {
    ofs -= pag;
    update_offset();
    dataSummaryTable.redraw();
}
