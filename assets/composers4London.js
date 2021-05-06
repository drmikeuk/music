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
//var composersBarChart1 = dc.barChart("#chart-bar-composers1"),
//    composersBarChart2 = dc.barChart("#chart-bar-composers2"),
var timeBarChart = dc.barChart("#chart-bar-time"),
    dataCount = dc.dataCount("#datacount"),
    dataSummaryTable = dc.dataTable("#table-datasummary");

var composite = new dc.CompositeChart("#chart-composite-composers");


var ndx;            // NB now paginating need to define outside of load data
var x2, y2, z2, myColor2, xpad2, ypad2, tooltip2, height2;   // bubbles #2

// LOAD DATA
// =========
// NB  special chars so try this? https://stackoverflow.com/questions/38304384/d3-js-read-csv-file-with-special-characters-%C3%A9-%C3%A0-%C3%BC-%C3%A8
d3.csv('/assets/PerformanceDatabaseMock.London.csv').then(data => {
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


  timeBarChart.width(800).height(100)
      .dimension(yearDim)
      .group(yearGroup)
      .ordinalColors(colours) 	         // my range of colours
      // old style .x(d3.scale.linear().domain([1840, 1900])) // d3v3 not d3v4
      .x(d3.scaleLinear().domain([1812, 1901]))   // extra or 1st bar cut off
      .centerBar(true)
      .elasticY(true)
      .margins({top:10,bottom:20,right:20,left:70})   // margin to match bubbles
      .on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
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
      //.on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
      .on("filtered", updateComposer)    // update Title + bubbles is non-dc.js so update manually
      .multiple(true);




	// CONFIGURE DATA TABLE          // yearDIM = sort by year ?
	dataSummaryTable.dimension(yearDim)
	    .group(d => d.year)          // group by year??
      .size(Infinity)				       // need all the records & let pagination handle display & offset
    	.columns(['Composer', 'Symphony', 'Date', 'Orchestra', 'City'])  // can change labels & format of data if desired
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


  // NON DC.JS BUBBLE CHART 2: CITIES per YEAR
  // =========================================
  // https://www.d3-graph-gallery.com/graph/bubble_color.html

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 20, bottom: 20, left: 70},
    width2 = 800 - margin.left - margin.right,
    height2 = 300 - margin.top - margin.bottom;          //100 to match year?

  var svg = d3.select("#chart-bubbles-time")
  .append("svg")
    .attr("width", width2 + margin.left + margin.right)
    .attr("height", height2 + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  // want auto scale so can make elastic ie change on update...
  var distinctYears = [...new Set(cityYearDim.top(Infinity).map(d => d.Year))].sort();
  var firstyear = distinctYears[0];
  var lastyear = distinctYears[distinctYears.length - 1];
  x2 = d3.scaleLinear()
    //.domain(distinctYears)   //nOPe       // years from current dataset (unique; sorted)
    .domain([firstyear, lastyear])          // years from current dataset (unique; sorted)
    //.domain([1810, 1900])                 // fixed. london data range
    //.domain([1839, 1901])                 // fixed. dummy data range +/- 1
    .range([ 0, width2]);
  xAxis2 = svg.append("g")
    .attr("transform", "translate(0," + height2 + ")")
    .call(d3.axisBottom(x2).tickFormat(d3.format('d')));    // tickformat 1900 not 1,900

  // Add Y axis
  y2 = d3.scaleBand()
    .domain(cityGroup.top(Infinity).map(d => d.key).sort())        // ALL cities
    .range([ 0, height2]);                           // biggest total at top (svg 0)
  yAxis2 = svg.append("g").call(d3.axisLeft(y2));
  ypad2 = y2.bandwidth() / 2;     // want half the width of the band to plot in center of band

  // add gridlines https://bl.ocks.org/wadefagen/ce5d308d8080130de10f21254273e30c
  function make_gridlines2() {
      return d3.axisLeft(y2)
          .ticks(5)
          .tickSize(-width2)
          .tickFormat("")
  }
  svg.append("g").attr("stroke-opacity", 0.2).call(make_gridlines2())


  // Add a scale for bubble size
  maxZ2 = Math.max.apply(Math, cityYearGroup.top(Infinity).map(function(o) { return o.value; }));
  //z = d3.scaleLinear().domain([0, maxZ]).range([0, 10]);
  // want 0=0; 1 = visible; linear not ideal see https://bl.ocks.org/guilhermesimoes/e6356aa90a16163a6f917f53600a2b4a
  z2 = d3.scaleSqrt()
     .domain([0, maxZ2])   // counts from cityYearGroup ie per city
     .range([0, 10]);


  // Add a scale for bubble color - all cities from cityGroup
  myColor2 = d3.scaleOrdinal()
      .domain(cityGroup.top(Infinity).map(d => d.key).sort())   // all cities; sorted az
      .range(colours4);


  // tooltip 1. Create a tooltip div that is hidden by default:
   tooltip2 = d3.select("#chart-bubbles-time")
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
     tooltip2
       .transition()
       .duration(200)
     tooltip2
       .style("opacity", 1)
       .html(d.key[0] + " " + d.key[1] + ": " + d.value )         // city: count
       .style("left", (d3.mouse(this)[0] + 90) + "px")
       .style("top", (d3.mouse(this)[1] + 150) + "px")
   }
   var moveTooltip = function(d) {
     tooltip2
       .style("left", (d3.mouse(this)[0] + 90) + "px")
       .style("top", (d3.mouse(this)[1] + 150) + "px")
   }
   var hideTooltip = function(d) {
     tooltip2
       .transition()
       .duration(200)
       .style("opacity", 0)
   }



  // Add dots
  svg.append('g')
     .attr("id", "dots")
     .selectAll("dot")
     .data(cityYearGroup.top(Infinity))       // data = cityYearGroup
     .enter()
     .append("circle")
       .attr("cx", function (d) { return x2(d.key[1]); } )           // x = year
       .attr("cy", function (d) { return y2(d.key[0]) + ypad2; } )    // y = city + pad to center of band
       //.attr("r", function (d) { return z(d.value); } )           // r = value
       .attr("r", function (d) {
            //console.log(d.key[1], d.key[0], "value ", d.value, " scale ", z(d.value));
            //return d.value * 5})
            return z2(d.value); } )         // TEST
       .style("fill", function (d) { return myColor2(d.key[0]); } )  // colour = city
       //.style("opacity", "0.7")
       .attr("stroke", "white")
       .style("stroke-width", "2px")
       // tooltip3 Trigger the functions
       .on("mouseover", showTooltip )
       .on("mousemove", moveTooltip )
       .on("mouseleave", hideTooltip )








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

// UPDATE COMPOSER + FIRST PERFORMANCE TITLE if filtered
function updateComposer() {

  // check if filtered / has been called as reset filters
  if (composerSearchDim.currentFilter()) {
    //console.log("filtered: ", composerSearchDim.currentFilter());

    // luckily on populates if SINGLE selected composer
    $("#this-composer").html(composerSearchDim.currentFilter());



  } else {
    // reset
    $("#this-composer").html("");
  }

  updateBubbles();    //bubbles is non-dc.js so update manually
}



function updateBubbles() {
  // bubbles is non DC.JS so have to update manually when other charts are filtered
  // https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi
  //
  //console.log("update bubbles. new filtered composerGroup");
  //console.log(JSON.stringify(cityComposerGroup.top(Infinity)));

  // BUBBLES2: per CITY per YEAR
  // rescale and redraw xAxis
  var distinctYears = [...new Set(cityYearDim.top(Infinity).map(d => d.Year))].sort();
  var firstyear = parseInt(distinctYears[0]);
  ////var firstyear = Math.floor((distinctYears[0] - 1)/10) * 10;     // floor to decade; -1 incase already deacde
  var lastyear = parseInt(distinctYears[distinctYears.length - 1]);         // full range
  //// var lastyear = firstyear + 30;             // dont focus here - filter the year instead
  // set new domain & redraw xAxis
  x2.domain([firstyear,lastyear]);
  xAxis2
    .transition().duration(1000).call(d3.axisBottom(x2))     // update new scale
    .call(d3.axisBottom(x2).tickFormat(d3.format('d')));     // tickformat 1900 not 1,900


    // recalculate z scale - bubble size - to max of _current_ selection
    maxZ2 = Math.max.apply(Math, cityYearGroup.top(Infinity).map(function(o) { return o.value; }));
    z2 = d3.scaleSqrt()
       .domain([0, maxZ2])   // counts from cityYearGroup ie per city
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
      .attr("cx", function (d) { return x2(d.key[1]); } )           // x = year
      .attr("cy", function (d) { return y2(d.key[0]) + ypad2; } )    // y = city + pad to center of band
      //.attr("r", function (d) { return z(d.value); } )           // r = value
      .attr("r", function (d) {
           //console.log(d.key[1], d.key[0], "value ", d.value, " scale ", z(d.value));
           //return d.value * 5})
           return z2(d.value); } )         // TEST
      .style("fill", function (d) { return myColor2(d.key[0]); } )  // colour = city



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
