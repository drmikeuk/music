// based on worked example https://dc-js.github.io/dc.js/docs/stock.html

var colours0 = ["#3498DB"];  // darker ver of blue highlight list item; for mini composers graph

// from https://medialab.github.io/iwanthue/
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


// CREATE OBJECTS & TIE TO HTML ie match to div IDs in the html
//var composersBarChart1 = dc.barChart("#chart-bar-composers1"),
//    composersBarChart2 = dc.barChart("#chart-bar-composers2"),
var orchestrasRowChart = dc.rowChart("#chart-row-orchestras"),
    citiesRowChart = dc.rowChart("#chart-row-cities"),
    timeSeriesChart = dc.seriesChart("#chart-series-time"),
    timeBarChart = dc.barChart("#chart-bar-time"),
    dataCount = dc.dataCount("#datacount"),
    dataSummaryTable = dc.dataTable("#table-datasummary");

var composite = new dc.CompositeChart("#chart-composite-composers");


var ndx;            // NB now paginating need to define outside of load data

// LOAD DATA
// =========
// NB  special chars so try this? https://stackoverflow.com/questions/38304384/d3-js-read-csv-file-with-special-characters-%C3%A9-%C3%A0-%C3%BC-%C3%A8
d3.csv('/assets/PerformanceDatabaseMock.csv').then(data => {
	// might want to format data a bit here
	// eg calculate month or year from timestamp


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
    composerSearchGroup = composerSearchDim.group(),
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
/*
  composersBarChart1.width(800).height(100)
    .dimension(composerSearchDim)
    .group(composerSearchGroup)
    .colors('#ccc') 	                 // just ALL blue #3498DB
    //.x(d3.scaleOrdinal())              // NB scale.ordinal() is D3v3 style
    //.x(d3.scaleOrdinal().domain(composerSearchDim))
    //.x(d3.scaleOrdinal().domain(composerSearchDim.top(Infinity).map(d => d.Composer))) // ok
    .x(d3.scaleOrdinal().domain(composerSearchGroup.top(Infinity).map(d => d.key)))  // sorted list of composers
    .xUnits(dc.units.ordinal)
    .ordering(d => -d.value)              // order by value not name: fails if specify domain manually
    //.centerBar(true)
    .yAxis().ticks(2);                 // --> less ticks! setter so can't chain ie must be last!
  composersBarChart1.xAxis().tickValues([]); // no ticks or labels

  composersBarChart2.width(800).height(100)
    .dimension(composerDim)
    .group(composerGroup)
    .colors('#3498DB') 	                 // just ALL blue #3498DB
    .x(d3.scaleOrdinal().domain(composerSearchGroup.top(Infinity).map(d => d.key)))  // sorted list of composers
    .xUnits(dc.units.ordinal)
    .ordering(d => -d.value)           // order by value not name
    //.centerBar(true)
    .yAxis().ticks(2);                 // --> less ticks! setter so can't chain ie must be last!
  composersBarChart2.xAxis().tickValues([]); // no ticks or labels
*/


  composite.width(800).height(100)
    //.x(d3.scaleOrdinal())                             // auto - works for individual charts but not composite
    //.x(d3.scaleOrdinal().domain(composerSearchDim))     // specify DIM - works for individual charts but not composite
    .x(d3.scaleOrdinal().domain(composerSearchGroup.top(Infinity).map(d => d.key)))  // sorted list of composers
    .xUnits(dc.units.ordinal)
    //.ordering(d => -d.value)              // order by value not name
    .compose([
        new dc.BarChart(composite)
            .dimension(composerSearchDim)
            .group(composerSearchGroup, "all")
            .centerBar(true)
            .colors('#ccc'),
        new dc.BarChart(composite)
            .dimension(composerDim)
            .group(composerGroup, "selected")
            .centerBar(true)
            .colors('#3498DB')
        ])
    .brushOn(false)
    .yAxis().ticks(2);                 // --> less ticks! setter so can't chain ie must be last!
    composite.xAxis().tickValues([]); // no ticks or labels


  orchestrasRowChart.width(400).height(250)
      .dimension(orchestraDim)
      .group(orchestraGroup)
      .ordinalColors(colours2) 	         // my range of colours
      .ordering(d => d.key)              // order by name
      //.renderVerticalGridLines(false)
      .gap(2)
      .elasticX(true)
      .xAxis().ticks(5);                 // --> less ticks! setter so can't chain ie must be last!
	    // NB elastic means rescale axis; may want to turn this off

  citiesRowChart.width(400).height(250)
      .dimension(cityDim)
      .group(cityGroup)
      .ordinalColors(colours3) 	         // my range of colours
      .ordering(d => d.key)              // order by name
      .gap(2)
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
      .x(d3.scaleLinear().domain([1839, 1941]))
      .elasticY(true)
      .legend(dc.legend().x(300).y(0).itemHeight(13).gap(5).horizontal(1).legendWidth(500).itemWidth(80))
      .margins({top:40,bottom:20,right:20,left:30})   // extra margin at top for legend
      .xAxis().tickFormat(d3.format('d'));    // 1900 not 1,900
      // NB elastic means rescale axis; may want to turn this off
  timeSeriesChart.yAxis().ticks(3);         // --> less ticks! setter so can't chain ie must be last!

  timeBarChart.width(800).height(100)
      .dimension(yearDim)
      .group(yearGroup)
      .ordinalColors(colours) 	         // my range of colours
      // old style .x(d3.scale.linear().domain([1840, 1900])) // d3v3 not d3v4
      .x(d3.scaleLinear().domain([1839, 1901]))   // extra or 1st bar cut off
      .centerBar(true)
      .elasticY(true)
      .margins({top:10,bottom:20,right:20,left:30})   // margin to match timeSeriesChart
      .xAxis().tickFormat(d3.format('d'));    // 1900 not 1,900
      // NB elastic means rescale axis; may want to turn this off
  timeBarChart.yAxis().ticks(3);         // --> less ticks! setter so can't chain ie must be last!


  // SEARCH COMPOSERS (v1 dc.js text filter)
  //var mysearch = new dc.TextFilterWidget("#search").dimension(composerDim);
  //mysearch.placeHolder('Search composers');

  // SEARCH COMPOSERS v2: filterable set of checkboxes
  var filterComposers = new dc.CboxMenu("#filterComposers")
      //.dimension(composerDim)             // same DIM as graph - graph DONT update (so see all)
      //.group(composerGroup)
      .dimension(composerSearchDim)     // new DIM - graph updates BUT loose all
      .group(composerSearchGroup)
      .order(function (a,b) {
        return a.value < b.value ? 1 : b.value < a.value ? -1 : 0; // order by value not group key (label)
      })
      //.title(d => d.key)       // DOESNT WORK
      .multiple(true);




	// CONFIGURE DATA TABLE          // yearDIM = sort by year ?
	dataSummaryTable.dimension(yearDim)
	    .group(d => d.year)          // group by year??
      .size(Infinity)				       // need all the records & let pagination handle display & offset
    	.columns(['Composer', 'Symphony', 'Year', 'Orchestra', 'City'])  // can change labels & format of data if desired
      .on('preRender', update_offset)     // pagination
      .on('preRedraw', update_offset)     // pagination
      .on('pretransition', display);      // pagination



  // DOWNLOAD BUTTON ACTION
  // from example https://dc-js.github.io/dc.js/examples/download-table.html
  d3.select('#download')
      .on('click', function() {
          var data = originDim.top(Infinity);
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


// MY FIND COMPOSER (ie filter LIs)
$(document).ready(function(){
  $("#filter").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#filterComposers li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});



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
