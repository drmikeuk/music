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
    firstCitiesRowChart = dc.rowChart("#chart-row-firstCities"),
    secondCitiesComposite = new dc.CompositeChart("#chart-composite-secondCities"),
    dataCount = dc.dataCount("#datacount"),
    dataSummaryTable = dc.dataTable("#table-datasummary");

var ndx;            // NB now paginating need to define outside of load data

// LOAD DATA
d3.csv('/assets/test.csv').then(data => {
	// CREATE CROSSFILTER DIMENSIONS AND GROUPS
	ndx = crossfilter(data),
    composerDim = ndx.dimension(d => d.Composer),
    firstCityDim = ndx.dimension(d => d.FirstCity),
    secondCityDim = ndx.dimension(d => d.SecondCity),
		all = ndx.groupAll(),
    composerGroup = composerDim.group(),
    firstCityGroup = firstCityDim.group();
    secondCityGroup = secondCityDim.group();

  // copy initial secondCityGroup into _static_ group for composite background
  secondCityStaticGroup = static_copy_group(secondCityGroup);

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

  firstCitiesRowChart.width(400).height(300)
      .dimension(firstCityDim)
      .group(firstCityGroup)
      .ordinalColors(colours3) 	         // my range of colours
      .ordering(d => d.key)              // order by name
      .elasticX(true)
      .xAxis().ticks(5);                 // --> less ticks! setter so can't chain ie must be last!
	    // NB elastic means rescale axis; may want to turn this off

  // secondCities composite chart: background chart = initial values as static, grey bars
  //                               foreground chart = filtered values as blue bars

  secondCitiesComposite.width(400).height(400)
    //.x(d3.scaleOrdinal())                             // auto - works for individual charts but not composite
    //.x(d3.scaleOrdinal().domain(composerSearchDim))     // specify DIM - works for individual charts but not composite
    .x(d3.scaleOrdinal().domain(secondCityGroup.top(Infinity).map(d => d.key)))  // sorted list of cities
    .xUnits(dc.units.ordinal)
    //.ordering(d => -d.value)              // order by value not name
    .compose([
        new dc.BarChart(secondCitiesComposite)
            .dimension(secondCityDim)
            .group(secondCityStaticGroup, "all")
            .centerBar(true)
            .colors('#ccc'),                          // grey static bars
        new dc.BarChart(secondCitiesComposite)
            .dimension(secondCityDim)
            .group(secondCityGroup, "selected")
            .centerBar(true)
            .colors('#3498DB')                        // blue filtered bars
        ]);
    //.brushOn(false)
    //.yAxis().ticks(2);                 // --> less ticks! setter so can't chain ie must be last!
    //composite.xAxis().tickValues([]); // no ticks or labels







	// CONFIGURE DATA TABLE          // yearDIM = sort by year ?
	dataSummaryTable.dimension(composerDim)
	    .group(d => d.year)          // group by year??
      .size(Infinity)				       // need all the records & let pagination handle display & offset
    	.columns(['Composer', 'FirstCity', 'SecondCity'])
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

function static_copy_group(group) {
    var all = group.all().map(kv => ({key: kv.key, value: kv.value}));
    return {
        all: function() {
            return all;
        }
    }
}


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
