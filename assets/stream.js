// based on worked example https://dc-js.github.io/dc.js/docs/stock.html

// colours from from https://medialab.github.io/iwanthue/
var colours = ["#5ba965","#ba5fb2","#a6973e","#6a7fcf","#cd6c39","#cc566a"];
var colours = ["#934acc","#559348","#b74c8e","#a37832","#6574be","#c44c44"]; // pimp
var colours = ["#daecca","#88aee1","#dbc4a4","#8bd0eb","#e7b8b7","#87c7c0","#d6bee2","#abcaa4","#aeb9d5","#baeae5","#a9beaf","#bad7e4"]; // pastel
var colours1 = ["#a57b87","#d642bc","#e5b6ca","#e545a2","#8f5260","#e03b6f","#aa7796","#b23d84","#de8095","#9b5080","#e386c0","#ad4261"]; // red roses
var colours2= ["#656d50","#92e63f","#a9ae87","#d9d934","#5e8b54","#5dcf51","#656a26","#97dd89","#a09c3f","#d8dfa9","#4f9437","#c8d766"];  // mint
var colours3 =  ["#8f7040","#e28c23","#6b4c33","#e1b340","#766949","#e6c392","#705110","#d69a55","#85644a","#a27b1d","#ad906c","#a06829"]; // yellow lime
var colours4 = ["#ff4f8a","#007e19","#6263ff","#abb13d","#800078","#e37f00","#00a6f0","#c1006e","#aea3e2","#771224","#d18f7c","#6a3557"]; // pimp


// CREATE OBJECTS & TIE TO HTML ie match to div IDs in the html
var timeBarChart = dc.barChart("#chart-bar-time"),
    dataCount = dc.dataCount("#datacount"),
    dataSummaryTable = dc.dataTable("#table-datasummary");

var ndx;            // NB now paginating need to define outside of load data
var x, y, z, myColor, xpad, ypad, tooltip, xAxis;


// LOAD DATA
///////////////////////////////////////////////////////////////////////////////
// NB  special chars so try this? https://stackoverflow.com/questions/38304384/d3-js-read-csv-file-with-special-characters-%C3%A9-%C3%A0-%C3%BC-%C3%A8
d3.csv('/assets/PerformanceDatabaseMock.csv').then(data => {
	// might want to format data a bit here eg calculate month or year from timestamp


	// CREATE CROSSFILTER DIMENSIONS AND GROUPS
	ndx = crossfilter(data),
    composerDim = ndx.dimension(d => d.Composer),
    composerYearDim = ndx.dimension(d => [d.Composer, d.Year]),
		yearDim = ndx.dimension(d => d.Year),
    yearSearchDim = ndx.dimension(d => d.Year),
    cityDim = ndx.dimension(d => d.City),
    cityYearDim = ndx.dimension(d => [d.City, d.Year]),
		all = ndx.groupAll(),
    composerGroup = composerDim.group().reduceCount(),
    composerYearGroup = composerYearDim.group().reduceCount(),
    //
// ---> want to customreduce to get just the MIN Year (ie return 1 row per comopser; not one per year)
    //
    //composerYearGroup = composerYearDim.group().reduce(
    //  function (p, v) { if(v.Year < p || p === null) p = v.Year; return p; },
    //  function (p, v) { return p; },
    //  function () { return null; }
    //),
    yearGroup = yearDim.group().reduceCount(),
    cityGroup = cityDim.group().reduceCount(),
    cityYearGroup = cityYearDim.group().reduceCount();


	// CONFIGURE DATA COUNT (x out of y records shown)
	dataCount.dimension(ndx)
	    .group(all)
	    .html({
	    	some: '<span class="filter-count">%filter-count</span> out of <span class="total-count">%total-count</span> performances selected. <a href="javascript:dc.filterAll(); dc.renderAll();">View all performances</a>',
     		all: 'All performances selected. Click on charts to filter...'
		});


	// CONFIGURE CHART ATTRIBUTES
  timeBarChart.width(800).height(100)
      .dimension(yearDim)
      .group(yearGroup)
      .ordinalColors(colours) 	         // my range of colours
      // old style .x(d3.scale.linear().domain([1840, 1900])) // d3v3 not d3v4
      //.x(d3.scaleLinear().domain([1810, 1900]))  // fixed. london data range
      .x(d3.scaleLinear().domain([1839, 1901]))    // fixed. dummy data range +/- 1
      .centerBar(true)
      .elasticY(true)
      .on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
      .margins({top:10,bottom:20,right:20,left:70})   // margin to match bubbles
      .xAxis().tickFormat(d3.format('d'));    // 1900 not 1,900
   timeBarChart.yAxis().ticks(3);         // --> less ticks! setter so can't chain ie must be last!


   // SEARCH COMPOSERS v2: filterable set of checkboxes
   var filterComposers = new dc.CboxMenu("#filterComposers")
       //.dimension(composerYearDim)     // new DIM - graph updates BUT loose all
       //.group(composerYearGroup)
       //start with just composers
       .dimension(composerDim)     // new DIM - graph updates BUT loose all
       .group(composerGroup)
       .order(function (a,b) {
         return a.value < b.value ? 1 : b.value < a.value ? -1 : 0; // order by value not group key (label)
       })
       //.title(d => d.key)       // DOESNT WORK
       .on("filtered", updateTitle)    // update comosper title + bubbles is non-dc.js so update manually
       .multiple(false);          // only single select aka radio


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

          //console.log  ("data...");
          //console.log (data); //  -> i have the right data here

          // using Filesave.js  https://github.com/eligrey/FileSaver.js/
          // orig: var blob = new Blob([d3.csvFormat(data)], {type: "text/plain;charset=utf-8"});
          var blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
          saveAs(blob, 'data.txt');
      });



	// RENDERING
	dc.renderAll();



  // MY FIND COMPOSER (ie filter LIs)
  $(document).ready(function(){
    $("#filter").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#filterComposers li").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });



  // NON DC.JS BUBBLE CHART
  // ===========================================================================
  // https://www.d3-graph-gallery.com/graph/bubble_color.html

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 20, bottom: 30, left: 70},
    width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var svg = d3.select("#chart-bubbles-time")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  // want auto scale so can make eleastic ie change on update...
  var distinctYears = [...new Set(composerYearDim.top(Infinity).map(d => d.Year))].sort();
  var firstyear = distinctYears[0];
  var lastyear = distinctYears[distinctYears.length - 1];
  x = d3.scaleLinear()
    //.domain(distinctYears)   //nOPe       // years from current dataset (unique; sorted)
    .domain([firstyear, lastyear])          // years from current dataset (unique; sorted)
    //.domain([1810, 1900])                 // fixed. london data range
    //.domain([1839, 1901])                 // fixed. dummy data range +/- 1
    .range([ 0, width]);
  xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format('d')));    // tickformat 1900 not 1,900

  // Add Y axis
  y = d3.scaleBand()
    .domain(cityGroup.top(Infinity).map(d => d.key).sort())        // ALL cities
    .range([ 0, height]);                           // biggest total at top (svg 0)
  svg.append("g").call(d3.axisLeft(y));
  ypad = y.bandwidth() / 2;     // want half the width of the band to plot in center of band

  // add gridlines https://bl.ocks.org/wadefagen/ce5d308d8080130de10f21254273e30c
  function make_gridlines() {
      return d3.axisLeft(y)
          .ticks(5)
          .tickSize(-width)
          .tickFormat("")
  }
  svg.append("g").attr("stroke-opacity", 0.2).call(make_gridlines())


  // Add a scale for bubble size
  maxZ = Math.max.apply(Math, cityYearGroup.top(Infinity).map(function(o) { return o.value; }));
  //z = d3.scaleLinear().domain([0, maxZ]).range([0, 10]);
  // want 0=0; 1 = visible; linear not ideal see https://bl.ocks.org/guilhermesimoes/e6356aa90a16163a6f917f53600a2b4a
  z = d3.scaleSqrt()
     .domain([0, maxZ])   // counts from cityYearGroup ie per city
     .range([0, 15]);


  // Add a scale for bubble color - all cities from cityGroup
  myColor = d3.scaleOrdinal()
      .domain(cityGroup.top(Infinity).map(d => d.key).sort())   // all cities; sorted az
      .range(colours4);

/*
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
*/


  // Add dots
  svg.append('g')
     .attr("id", "dots")
     .selectAll("dot")
     .data(cityYearGroup.top(Infinity))       // data = cityYearGroup
     .enter()
     .append("circle")
       .attr("cx", function (d) { return x(d.key[1]); } )           // x = year
       .attr("cy", function (d) { return y(d.key[0]) + ypad; } )    // y = city + pad to center of band
       //.attr("r", function (d) { return z(d.value); } )           // r = value
       .attr("r", function (d) {
            //console.log(d.key[1], d.key[0], "value ", d.value, " scale ", z(d.value));
            //return d.value * 5})
            return z(d.value); } )         // TEST
       .style("fill", function (d) { return myColor(d.key[0]); } )  // colour = city
       //.style("opacity", "0.7")
       .attr("stroke", "white")
       .style("stroke-width", "2px")
       // tooltip3 Trigger the functions
       //.on("mouseover", showTooltip )
       //.on("mousemove", moveTooltip )
       //.on("mouseleave", hideTooltip )



  // NON DC.JS STREAM CHART
  // ===========================================================================
  // https://www.d3-graph-gallery.com/graph/streamgraph_basic.html

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 20, bottom: 30, left: 70},
    width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var svg = d3.select("#chart-stream-time")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  // want auto scale so can make eleastic ie change on update...
  var distinctYears = [...new Set(composerYearDim.top(Infinity).map(d => d.Year))].sort();
  var firstyear = distinctYears[0];
  var lastyear = distinctYears[distinctYears.length - 1];
  x = d3.scaleLinear()
    //.domain(distinctYears)   //nOPe       // years from current dataset (unique; sorted)
    .domain([firstyear, lastyear])          // years from current dataset (unique; sorted)
    //.domain([1810, 1900])                 // fixed. london data range
    //.domain([1839, 1901])                 // fixed. dummy data range +/- 1
    .range([ 0, width]);
  xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format('d')));    // tickformat 1900 not 1,900

  // Add Y axis
  maxY = Math.max.apply(Math, yearGroup.top(Infinity).map(function(o) { return o.value; })); // max per year (all cities)
  var y = d3.scaleLinear()
    .domain([-maxY, maxY])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add a scale for bubble color - all cities from cityGroup
  color = d3.scaleOrdinal()
      .domain(cityGroup.top(Infinity).map(d => d.key).sort())   // all cities; sorted az
      .range(colours4);

  // rearrange data
  var newData = [];
  cityYearGroup.top(10).forEach(function (row) {
      // example row: {key: ["London", "1840"], value: 13}
      // if no newData[<year>] --> create: newData[<year>]=[]
      if (!newData[row.key[1]]) {
        newData[row.key[1]]=[];
        newData[row.key[1]]["Year"] = row.key[1];
      }
      // add data: newData[<year>][<city>] = value
      newData[row.key[1]][row.key[0]] = row.value;
      console.log ("row");
      console.log (row);
  });

  console.log ("newData");
  console.log (newData);

  console.log ("keys (cities)");
  console.log (cityGroup.top(Infinity).map(d => d.key).sort());


  //stack the data
   var stackedData = d3.stack()
     //.offset(d3.stackOffsetSilhouette)
     .keys(cityGroup.top(Infinity).map(d => d.key).sort())         // keys = series = cities
     (newData)

   console.log ("stacked Data");
   console.log (stackedData);



  // Show the areas
  svg
   .selectAll("mylayers")
   .data(stackedData)
   .enter()
   .append("path")
     .style("fill", function(d) { return color(d.key); })
     .attr("d", d3.area()
       .x(function(d, i) { return x(d.data.year); })
       .y0(function(d) { return y(d[0]); })
       .y1(function(d) { return y(d[1]); })
   )

/*
console.log ("data = city year group");
console.log (cityYearGroup.top(5));

var newData = [];
cityYearGroup.top(5).forEach(function (row) {
    // example row: {key: ["London", "1840"], value: 13}
    console.log("value: ", row.value);
    console.log("key0: ", row.key[0]); // city
    console.log("key1: ", row.key[1]); // year
    //newData.push(row.value);    // values: 7, 6, 6, 5, 5
    //newData[row.key[1]][row.key[0]]=row.value;
    //newData[row.key[1]]=row.value;


    // if no newData[<year>] --> create: newData[<year>]=[]
    if (!newData[row.key[1]]) {
      newData[row.key[1]]=[];
    }
    // add data: newData[<year>][<city>] = value
    newData[row.key[1]][row.key[0]] = row.value;
});

*/




/*
newData["1842"]=[];                   // how only push if don't exist?

// if no newData[<year>] --> create: newData[<year>]=[]
if (!newData["1842"]) {
  newData["1842"]=[];
}

newData["1842"]["Paris"] = 1;         // error (Cannot set property 'Paris' of undefined) unless created 1842 1st

newData["1842"]["London"] = 10;

// if no newData[<year>] --> create: newData[<year>]=[]
if (!newData["1844"]) {
  newData["1844"]=[];
}

newData["1844"]["Paris"] = 2;

*/






//console.log ("stack");
//console.log (stackedData);










/*
console.log("composer year DIM")
//data = composerYearDim.top(Infinity);                    // all rows; all fields
data = composerYearDim.top(Infinity).map(d => d.Year);   // all rows; just years
distinctYears = [...new Set(data)].sort();
firstyear = distinctYears[0];
lastyear = distinctYears[distinctYears.length - 1];

console.log(distinctYears);
console.log("1st year ", firstyear, " last year ", lastyear);
*/


}); /* close load data */





// FUNCTIONS
// =============================================================================

// UPDATE COMPOSER + FIRST PERFORMANCE TITLE if filtered
function updateTitle() {

  // check if filtered / has been called as reset filters
  if (composerDim.currentFilter()) {
    //console.log("filtered: ", composerDim.currentFilter());

    // sort by year
    var data = yearDim.top(Infinity).sort(function(x, y){
      return d3.ascending(x.Year, y.Year);
    });

    // sort by date (may be multiple in each year)
    //   -- Date needs to be "date" not string?
    // d3.ascending sorts by natural order which includes dates
    // https://observablehq.com/@d3/d3-ascending
  /*  var data = yearDim.top(Infinity).sort(function(x, y){
      return d3.ascending(x.Date, y.Date);
    }); */

    var firstrow = data[0];
    //console.log("firstrow");
    //console.log (JSON.stringify(firstrow))

    $("#this-composer").html(firstrow["Composer"]);
    var firststring = "First performance: <span>" + firstrow["Year"] + " " + firstrow["City"] + ": <i>" + firstrow["Symphony"] + "</i></span>";
    $("#first").html(firststring);


    // additionally filter by year to start +30 (so more focus)
    var distinctYears = [...new Set(composerYearDim.top(Infinity).map(d => d.Year))].sort();
    var firstyear = Math.floor((distinctYears[0] - 1)/10) * 10;     // floor to decade; -1 incase already decade
    var lastyear = firstyear + 30;             // extra focus on the start

    yearDim.filterRange([firstyear, lastyear]);


    // ^^^^^^ yearSearchDim works (get data i want on cityYear bubbles iem 30 years)
    //        but get just these 30years on year barChart (ie loose others)
    //        -- really want comopsite like at top of comospes3?

    //        yearDim works (get data i want on cityYear bubbles iem 30 years)
    //        year barChart shows all years
    //          BUT no highlight (composite like at top comospers?)










  } else {
    // reset
    $("#this-composer").html("");
    $("#first").html("");
  }


  updateBubbles();    //bubbles is non-dc.js so update manually
}





// UPDATE BUBBLES
function updateBubbles() {
  // bubbles is non DC.JS so have to update manually when other charts are filtered
  // https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi
  // update bubbles like https://www.d3-graph-gallery.com/graph/scatter_buttonXlim.html


  // rescale and redraw xAxis
  var distinctYears = [...new Set(composerYearDim.top(Infinity).map(d => d.Year))].sort();
  var firstyear = parseInt(distinctYears[0]);
  ////var firstyear = Math.floor((distinctYears[0] - 1)/10) * 10;     // floor to decade; -1 incase already deacde
  var lastyear = parseInt(distinctYears[distinctYears.length - 1]);         // full range
  //// var lastyear = firstyear + 30;             // dont focus here - filter the year instead
  // set new domain & redraw xAxis
  x.domain([firstyear,lastyear]);
  xAxis
    .transition().duration(1000).call(d3.axisBottom(x))     // update new scale
    .call(d3.axisBottom(x).tickFormat(d3.format('d')));     // tickformat 1900 not 1,900

  // recalculate z scale - bubble size - to max of _current_ selection
  maxZ = Math.max.apply(Math, cityYearGroup.top(Infinity).map(function(o) { return o.value; }));
  z = d3.scaleSqrt()
     .domain([0, maxZ])   // counts from cityYearGroup ie per city
     .range([0, 15]);
  //console.log("maxZ ", maxZ);

  var bubbles = d3.select("#chart-bubbles-time svg")
    .selectAll("circle")
    .data(cityYearGroup.top(Infinity));

  // enter selection
  //bubbles.enter().append("circle");

  // update selection
  bubbles
    .transition()
    .duration(300)
    .attr("cx", function (d) { return x(d.key[1]); } )           // x = year
    .attr("cy", function (d) { return y(d.key[0]) + ypad; } )    // y = city + pad to center of band
    //.attr("r", function (d) { return z(d.value); } )           // r = value
    .attr("r", function (d) {
         //console.log(d.key[1], d.key[0], "value ", d.value, " scale ", z(d.value));
         //return d.value * 5})
         return z(d.value); } )         // TEST
    .style("fill", function (d) { return myColor(d.key[0]); } )  // colour = city


    // just FYI ...
    //console.log(distinctYears);
    //console.log("1st year ", firstyear, " last year ", lastyear);


  // exit selection
  // bubbles.exit().remove();

}



// PAGINATION
////////////////////////////////////////////////////////////////////////////////
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
