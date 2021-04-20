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
// composersRowChart = dc.rowChart("#chart-row-composers"),
var composersRowChart = dc.rowChart("#chart-row-composers"),
    orchestrasRowChart = dc.rowChart("#chart-row-orchestras"),
    citiesRowChart = dc.rowChart("#chart-row-cities"),
    timeSeriesChart = dc.seriesChart("#chart-series-time"),
    timeBarChart = dc.barChart("#chart-bar-time"),
    dataCount = dc.dataCount("#datacount"),
    dataSummaryTable = dc.dataTable("#table-datasummary");

var ndx;            // NB now paginating need to define outside of load data

var x, y, z, myColor, xpad, ypad, tooltip;

// LOAD DATA

// NB  special chars so try this? https://stackoverflow.com/questions/38304384/d3-js-read-csv-file-with-special-characters-%C3%A9-%C3%A0-%C3%BC-%C3%A8
d3.csv('/assets/PerformanceDatabaseMock.csv').then(data => {
	// might want to format data a bit here
	// eg calculate month or year from timestamp


	// CREATE CROSSFILTER DIMENSIONS AND GROUPS

  // temp hardcode city
  var city1 = "London", city2 = "Weimar";

	ndx = crossfilter(data),
    composerDim = ndx.dimension(d => d.Composer),
    composerSearchDim = ndx.dimension(d => d.Composer),
		orchestraDim = ndx.dimension(d => d.Orchestra),
    cityDim = ndx.dimension(d => d.City),
    citySearchDim = ndx.dimension(d => d.City),
		yearDim = ndx.dimension(d => d.Year),
    cityYearDim = ndx.dimension(d => [d.City, d.Year]),
    cityComposerDim = ndx.dimension(d => [d.City, d.Composer]),
		all = ndx.groupAll(),
    composerGroup = composerDim.group(),
    orchestraGroup = orchestraDim.group(),
    cityGroup = cityDim.group(),
    citySearchGroup = citySearchDim.group(),
    yearGroup = yearDim.group().reduceCount(),
    cityYearGroup = cityYearDim.group().reduceCount(),
    cityComposerGroup = cityComposerDim.group().reduceCount();


	// CONFIGURE DATA COUNT (x out of y records shown)
	dataCount.dimension(ndx)
	    .group(all)
	    .html({
	    	some: '<span class="filter-count">%filter-count</span> out of <span class="total-count">%total-count</span> performances selected. <a href="javascript:dc.filterAll(); dc.renderAll();">View all performances</a>',
     		all: 'All performances selected. Click on charts to filter...'
		});


	// CONFIGURE CHART ATTRIBUTES
  composersRowChart.width(185).height(1000)
    .dimension(composerDim)
    .group(composerGroup)              // ** TOTAL ie all cities **
    .ordinalColors(colours1) 	         // my range of colours
    .ordering(d => -d.value)           // order by count (not name)
    .on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
    .margins({top: 10,bottom: 30,right: 5,left: 5})
    .elasticX(true)
    .xAxis().ticks(4);                 // --> less ticks! setter so can't chain ie must be last!

  orchestrasRowChart.width(300).height(250)
      .dimension(orchestraDim)
      .group(orchestraGroup)
      .ordinalColors(colours2) 	         // my range of colours
      .ordering(d => d.key)              // order by name
      //.renderVerticalGridLines(false)
      .gap(2)
      .elasticX(true)
      .on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
      .xAxis().ticks(5);                 // --> less ticks! setter so can't chain ie must be last!
	    // NB elastic means rescale axis; may want to turn this off

  citiesRowChart.width(300).height(250)
      .dimension(cityDim)
      .group(cityGroup)
      .ordinalColors(colours3) 	         // my range of colours
      .ordering(d => d.key)              // order by name
      .gap(2)
      .elasticX(true)
      .on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
      .xAxis().ticks(5);                 // --> less ticks! setter so can't chain ie must be last!
	    // NB elastic means rescale axis; may want to turn this off


  timeSeriesChart.width(600).height(240)
      .dimension(cityYearDim)
      .group(cityYearGroup)
      .seriesAccessor(function(d) {return d.key[0];})
      .keyAccessor(function(d) {return +d.key[1];})
      .valueAccessor(function(d) {return +d.value;})
      .ordinalColors(colours4) 	         // my range of colours
      .x(d3.scaleLinear().domain([1840, 1900]))
      .elasticY(true)
      .on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
      .legend(dc.legend().x(300).y(0).itemHeight(13).gap(5).horizontal(1).legendWidth(500).itemWidth(80))
      .margins({top:40,bottom:20,right:20,left:30})   // extra margin at top for legend
      .xAxis().tickFormat(d3.format('d'));    // 1900 not 1,900
      // NB elastic means rescale axis; may want to turn this off
  timeSeriesChart.yAxis().ticks(5);         // --> less ticks! setter so can't chain ie must be last!


  timeBarChart.width(600).height(100)
      .dimension(yearDim)
      .group(yearGroup)
      .ordinalColors(colours) 	         // my range of colours
      // old style .x(d3.scale.linear().domain([1840, 1900])) // d3v3 not d3v4
      .x(d3.scaleLinear().domain([1840, 1900]))
      .centerBar(true)
      .elasticY(true)
      .on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
      .margins({top:10,bottom:20,right:20,left:30})   // margin to match timeSeriesChart
      .xAxis().tickFormat(d3.format('d'));    // 1900 not 1,900
      // NB elastic means rescale axis; may want to turn this off
   timeBarChart.yAxis().ticks(3);         // --> less ticks! setter so can't chain ie must be last!


   // PLACES FILTERS
  //one set of checkbox / buttons
   var selectPlaces = new dc.CboxMenu("#selectPlaces")
      .dimension(citySearchDim)
      .group(citySearchGroup)
      //.title(d => d.key)       // DOESNT WORK
      //.filter("London")          // DOESNT WORK
      .on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
      .multiple(true);
      //.controlsUseVisibility(true);





	// CONFIGURE DATA TABLE          // yearDIM = sort by year ?
	dataSummaryTable.dimension(yearDim)
	    .group(d => d.year)          // group by year??
      .size(Infinity)				       // need all the records & let pagination handle display & offset
    	.columns(['Composer', 'Symphony', 'Year', 'Orchestra', 'City'])      // can change labels & format of data if desired
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



  // NON DC.JS BUBBLE CHART
  // ======================
  // https://www.d3-graph-gallery.com/graph/bubble_color.html

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 20, bottom: 30, left: 150},
    width = 420 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

  var svg = d3.select("#chart-bubble-composers")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  x = d3.scaleBand()
    .domain(cityComposerGroup.top(Infinity).map(d => d.key[0]))   // cities
    .range([ 0, width])
    .align(0.5);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  xpad = x.bandwidth() / 2;     // want half the width of the band to ploy in center of band

  // Add Y axis
  y = d3.scaleBand()
    .domain(composerGroup.top(Infinity).map(d => d.key))        // ALL composers
    .range([ 0, height]);                           // biggest total at top (svg 0)
  svg.append("g").call(d3.axisLeft(y));

/*
    // gridlines  // https://observablehq.com/@d3/styled-axes
    svg.append("g")
    .call(d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width)
      .tickFormat(""))
    .call(g => g.selectAll(".tick")
      .attr("stroke-opacity", 0.2))   */

  ypad = y.bandwidth() / 2;     // want half the width of the band to ploy in center of band

  // add gridlines https://bl.ocks.org/wadefagen/ce5d308d8080130de10f21254273e30c
  function make_gridlines() {
      return d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat("")
  }
  svg.append("g").attr("stroke-opacity", 0.2).call(make_gridlines())



  // Add a scale for bubble size
  maxZ = Math.max.apply(Math, cityComposerGroup.top(5).map(function(o) { return o.value; }));
  //z = d3.scaleLinear().domain([0, maxZ]).range([0, 10]);
  // want 0=0; 1 = visible; linear not ideal see https://bl.ocks.org/guilhermesimoes/e6356aa90a16163a6f917f53600a2b4a
  z = d3.scaleSqrt()
     .domain([0, maxZ])   // counts from cityComposerGroup ie per city
     .range([0, 15]);


  // Add a scale for bubble color - cities from cityComposerGroup
  myColor = d3.scaleOrdinal()
      .domain(cityComposerGroup.top(Infinity).map(d => d.key[0]))
      .range(d3.schemeSet2);

  // tooltip 1. Create a tooltip div that is hidden by default:
   tooltip = d3.select("#chart-bubble-composers")
     .append("div")
       .style("opacity", 0)
       .attr("class", "tooltip")
       .style("background-color", "black")
       .style("border-radius", "5px")
       .style("padding", "10px")
       .style("color", "white")
       .style("min-width", "120px")

   // tooltip 2. Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
   var showTooltip = function(d) {
     tooltip
       .transition()
       .duration(200)
     tooltip
       .style("opacity", 1)
       .html(d.key[0] + " " + d.value )
       .style("left", (d3.mouse(this)[0]+200) + "px")
       .style("top", (d3.mouse(this)[1]+30) + "px")
   }
   var moveTooltip = function(d) {
     tooltip
       .style("left", (d3.mouse(this)[0]+60) + "px")
       .style("top", (d3.mouse(this)[1]+5) + "px")
   }
   var hideTooltip = function(d) {
     tooltip
       .transition()
       .duration(200)
       .style("opacity", 0)
   }






  // Add dots
  svg.append('g')
     .attr("id", "dots")
     .selectAll("dot")
     .data(cityComposerGroup.top(Infinity))       // data = cityComposerGroup
     .enter()
     .append("circle")
       .attr("cx", function (d) { return x(d.key[0]) + xpad; } )  // x = city + pad to center of band
       .attr("cy", function (d) { return y(d.key[1]) + ypad; } )    // y = composer + pad to center of band
       //.attr("r", function (d) { return z(d.value); } )         // r = value
       .attr("r", function (d) {
            //console.log(d.key[1], d.key[0], "value ", d.value, " scale ", z(d.value));
            //return d.value * 5})
            return z(d.value); } )         // TEST
       .style("fill", function (d) { return myColor(d.key[0]); } )  // colour = city
       //.style("opacity", "0.7")
       .attr("stroke", "white")
       .style("stroke-width", "2px")
       // tooltip3 Trigger the functions
       .on("mouseover", showTooltip )
       .on("mousemove", moveTooltip )
       .on("mouseleave", hideTooltip )



/*
  console.log("cityComposerGroup");
  console.log(cityComposerGroup.top(5));   // .top(Infinity) = all items

  console.log("filtered cityComposerGroup2");
  console.log(cityComposerGroup2.top(5));


  console.log("composerGroup");
  console.log(composerGroup.top(5));   // .top(Infinity) = all items

  console.log("filtered / copy composerGroup2");
  //console.log(composerGroup2.top(5));   // .top is not a function -> not a group? empty?
  console.log(JSON.stringify(composerGroup2));
*/

}); /* close load data */









// FUNCTIONS
// =========

function updateBubbles() {
  // bubbles is non DC.JS so have to update manually when other charts are filtered
  // https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi
  //
  //console.log("update bubbles. new filtered composerGroup");
  //console.log(JSON.stringify(cityComposerGroup.top(Infinity)));


// redraw x?

  var bubbles = d3.select("#chart-bubble-composers svg")
    .selectAll("circle")
    .data(cityComposerGroup.top(Infinity));

  // enter selection
  //bubbles.enter().append("circle");

  // update selection
  bubbles
    .transition()
    .duration(300)
    .attr("cx", function (d) { return x(d.key[0]) + xpad; } )  // x = city + pad to center of band
    .attr("cy", function (d) { return y(d.key[1]) + ypad; } )    // y = composer + pad to center of band
    //.attr("r", function (d) { return z(d.value); } )         // r = value
    .attr("r", function (d) {
         //console.log(d.key[1], d.key[0], "value ", d.value, " scale ", z(d.value));
         //return d.value * 5})
         return z(d.value); } )         // TEST
    .style("fill", function (d) { return myColor(d.key[0]); } )  // colour = city

  // exit selection
  // bubbles.exit().remove();

}


// PAGINATION
// https://github.com/dc-js/dc.js/blob/develop/web-src/examples/table-pagination.html

var ofs = 0, pag = 10;          // start 0; 20 per page

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
