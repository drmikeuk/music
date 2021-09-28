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
// composersRowChart = dc.rowChart("#chart-row-composers"),
var timeBarChart = dc.barChart("#chart-bar-time"),
    dataCount = dc.dataCount("#datacount"),
    dataSummaryTable = dc.dataTable("#table-datasummary");

var ndx;            // NB now paginating need to define outside of load data

var x, y, z, myColor, xpad, ypad, tooltip;          // bubbles #1
var x2, y2, z2, myColor2, xpad2, ypad2, tooltip2;   // bubbles #2

// set the dimensions and margins of the graph // bubbles #2
var margin = {top: 10, right: 20, bottom: 20, left: 70},
  width = 800 - margin.left - margin.right,
  height = 150 - margin.top - margin.bottom;          //100 to match year?


// LOAD DATA

// NB  special chars so try this? https://stackoverflow.com/questions/38304384/d3-js-read-csv-file-with-special-characters-%C3%A9-%C3%A0-%C3%BC-%C3%A8
d3.csv('/assets/PerformanceDatabaseMock.LondonNYParis.csv').then(data => {
	// might want to format data a bit here eg calculate month or year from timestamp


	// CREATE CROSSFILTER DIMENSIONS AND GROUPS

	ndx = crossfilter(data),
    composerDim = ndx.dimension(d => d.Composer),
    composerSearchDim = ndx.dimension(d => d.Composer),
    composerYearDim = ndx.dimension(d => [d.Composer, d.Year]),
		//orchestraDim = ndx.dimension(d => d.Orchestra),
    cityDim = ndx.dimension(d => d.City),
    citySearchDim = ndx.dimension(d => d.City),
		yearDim = ndx.dimension(d => d.Year),
    cityYearDim = ndx.dimension(d => [d.City, d.Year]),
    cityComposerDim = ndx.dimension(d => [d.City, d.Composer]),
		all = ndx.groupAll(),
    composerGroup = composerDim.group(),
    composerYearGroup = composerYearDim.group().reduceCount(),
    //orchestraGroup = orchestraDim.group(),
    cityGroup = cityDim.group(),
    citySearchGroup = citySearchDim.group(),
    yearGroup = yearDim.group().reduceCount(),
    cityYearGroup = cityYearDim.group().reduceCount(),
    cityComposerGroup = cityComposerDim.group().reduceCount()
    nonEmptyCityGroup = remove_empty_bins(cityGroup);


	// CONFIGURE DATA COUNT (x out of y records shown)
	dataCount.dimension(ndx)
	    .group(all)
	    .html({
	    	some: 'Showing <span class="filter-count">%filter-count</span> out of <span class="total-count">%total-count</span> performances. <a href="javascript:reset();">Reset</a>',
     		all: 'All performances selected. Click on charts to filter...'
		});


	// CONFIGURE CHART ATTRIBUTES

  var distinctYears = [...new Set(yearDim.top(Infinity).map(d => d.Year))].sort();
  var firstyear = distinctYears[0];
  var lastyear = distinctYears[distinctYears.length - 1];

  timeBarChart.width(760).height(100)
      .dimension(yearDim)
      .group(yearGroup)
      .ordinalColors(colours) 	         // my range of colours
      // old style .x(d3.scale.linear().domain([1840, 1900])) // d3v3 not d3v4
      //.x(d3.scaleLinear().domain([1812, 1901]))
      .x(d3.scaleLinear().domain([firstyear, lastyear]))          // years from current dataset (unique; sorted)
      .centerBar(true)
      .elasticY(true)
      .on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
      .margins({top:10,bottom:20,right:20,left:70})   // margin to match bubbles
      .xAxis().tickFormat(d3.format('d'));    // 1900 not 1,900
      // NB elastic means rescale axis; may want to turn this off
   timeBarChart.yAxis().ticks(3);         // --> less ticks! setter so can't chain ie must be last!


   // PLACES FILTERS
  //one set of checkbox / buttons
   var selectPlaces = new dc.CboxMenu("#filterPlaces")
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
    	.columns(['Composer', 'Symphony', 'Year', 'City'])      // can change labels & format of data if desired
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



  // NON DC.JS BUBBLE CHART 1: COMPOSERS per CITY
  // ============================================
  // https://www.d3-graph-gallery.com/graph/bubble_color.html

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 20, bottom: 30, left: 150},
    width = 350 - margin.left - margin.right,
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
    .domain(cityComposerGroup.top(Infinity).map(d => d.key[0]).sort())   // cities; sorted az
    .range([ 0, width])
    .align(0.5);
  xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));
  xpad = x.bandwidth() / 2;     // want half the width of the band to ploy in center of band

  // Add Y axis
  y = d3.scaleBand()
    .domain(composerGroup.top(Infinity).map(d => d.key))        // ALL composers
    .range([ 0, height]);                           // biggest total at top (svg 0)
  yAxis = svg.append("g").call(d3.axisLeft(y).tickSizeOuter(0));
  ypad = y.bandwidth() / 2;     // want half the width of the band to ploy in center of band

  // add gridlines https://bl.ocks.org/wadefagen/ce5d308d8080130de10f21254273e30c
  gridlines = svg.append("g").attr("stroke-opacity", 0.2).attr("class", "grid").call(make_gridlines())



  // Add a scale for bubble size
  maxZ = Math.max.apply(Math, cityComposerGroup.top(Infinity).map(function(o) { return o.value; }));
  //z = d3.scaleLinear().domain([0, maxZ]).range([0, 10]);
  // want 0=0; 1 = visible; linear not ideal see https://bl.ocks.org/guilhermesimoes/e6356aa90a16163a6f917f53600a2b4a
  z = d3.scaleSqrt()
     .domain([0, maxZ])   // counts from cityComposerGroup ie per city
     .range([2, 15]);     // start at 3 so smallest not too small! - bnut then zero maps to 3!

  //z = d3.scaleOrdinal().domain([0, maxZ]).range([0, 5, 6, 7, 8, 9, 10]);



  // Add a scale for bubble color - cities from cityComposerGroup
  myColor = d3.scaleOrdinal()
      .domain(cityComposerGroup.top(Infinity).map(d => d.key[0]).sort())   // cities; sorted az
      .range(colours4);

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
       .style("left", (d3.mouse(this)[0]+170) + "px")
       .style("top", (d3.mouse(this)[1]+50) + "px")
   }
   var moveTooltip = function(d) {
     tooltip
       .style("left", (d3.mouse(this)[0]+170) + "px")
       .style("top", (d3.mouse(this)[1]+50) + "px")
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
            //return z(d.value); } )         // TEST
            if (d.value == 0) {
              return 0;                // 0 so wont show
            }
            else {
              return z(d.value);      // scale 3-10 so 1 is not too small
            }
       })
       .style("fill", function (d) { return myColor(d.key[0]); } )  // colour = city
       //.style("opacity", "0.7")
       .attr("stroke", "white")
       .style("stroke-width", "2px")
       // tooltip3 Trigger the functions
       .on("mouseover", showTooltip )
       .on("mousemove", moveTooltip )
       .on("mouseleave", hideTooltip )





    // NON DC.JS BUBBLE CHART 2: CITIES per YEAR
    // =========================================
    // https://www.d3-graph-gallery.com/graph/bubble_color.html

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 20, bottom: 20, left: 70},
      width2 = 760 - margin.left - margin.right,
      height2 = 150 - margin.top - margin.bottom;          //100 to match year?

    var svg = d3.select("#chart-bubbles-time")
    .append("svg")
      .attr("width", width2 + margin.left + margin.right)
      .attr("height", height2 + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    // want auto scale so can make elastic ie change on update...
    var distinctYears = [...new Set(composerYearDim.top(Infinity).map(d => d.Year))].sort();
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
      .call(d3.axisBottom(x2).tickSizeOuter(0).tickFormat(d3.format('d')));    // tickformat 1900 not 1,900

    // Add Y axis
    y2 = d3.scaleBand()
      .domain(cityGroup.top(Infinity).map(d => d.key).sort())        // ALL cities
      .range([ 0, height2]);                           // biggest total at top (svg 0)
    yAxis2 = svg.append("g").call(d3.axisLeft(y2).tickSizeOuter(0));
    ypad2 = y2.bandwidth() / 2;     // want half the width of the band to plot in center of band

    // add gridlines https://bl.ocks.org/wadefagen/ce5d308d8080130de10f21254273e30c
    gridlines2 = svg.append("g").attr("stroke-opacity", 0.2).attr("class", "grid").call(make_gridlines2())


    // Add a scale for bubble size
    maxZ2 = Math.max.apply(Math, cityYearGroup.top(Infinity).map(function(o) { return o.value; }));
    //z = d3.scaleLinear().domain([0, maxZ]).range([0, 10]);
    // want 0=0; 1 = visible; linear not ideal see https://bl.ocks.org/guilhermesimoes/e6356aa90a16163a6f917f53600a2b4a
    z2 = d3.scaleSqrt()
       .domain([0, maxZ2])   // counts from cityYearGroup ie per city
       .range([2, 12]);      // start at 3 so smallest not too small!


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
     var showTooltip2 = function(d) {
       //console.log ("show")
       tooltip2
         .transition()
         .duration(200)
       tooltip2
         .style("opacity", 1)
         .html(d.key[0] + " " + d.key[1] + ": " + d.value )         // city: count
         .style("left", (d3.mouse(this)[0]) + 90 + "px")
         .style("top", (d3.mouse(this)[1]) + 50 + "px")
     }
     var moveTooltip2 = function(d) {
       //console.log ("move")
       tooltip2
         .style("left", (d3.mouse(this)[0]) + 90 + "px")
         .style("top", (d3.mouse(this)[1]) + 50 + "px")
     }
     var hideTooltip2 = function(d) {
       tooltip2
         .transition()
         .duration(200)
         .style("opacity", 0)
     }



    // Add dots
    svg.append('g')
       .attr("id", "dots2")
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
              //return z2(d.value); } )         // TEST
               //console.log(d.key[1], d.key[0], "value ", d.value, " scale ", z(d.value));
               //return d.value * 5})
               if (d.value == 0) {
                 return 0;                // 0 so wont show
               }
               else {
                 return z2(d.value);      // scale 3-10 so 1 is not too small
               }
          })
         .style("fill", function (d) { return myColor2(d.key[0]); } )  // colour = city
         //.style("opacity", "0.7")
         .attr("stroke", "white")
         .style("stroke-width", "2px")
         // tooltip3 Trigger the functions
         .on("mouseover", showTooltip2 )
         .on("mousemove", moveTooltip2 )
         .on("mouseleave", hideTooltip2 )










/*
  console.log("cityComposerGroup raw array ");
  console.log(cityComposerGroup.top(5));

  console.log("cityComposerGroup.map (so just cities)");
  //console.log(cityComposerGroup.top(5));   // .top(Infinity) = all items
  console.log(cityComposerGroup.top(5).map(d => d.key[0]).sort());

  var raw = cityComposerGroup.top(5).map(d => d.key[0]);
  var sorted = raw.sort();
  console.log("cityComposerGroup.map then sorted ");
  console.log(sorted);



 //console.log(cityComposerGroup.top(5));   // .top(Infinity) = all items
  console.log("filtered cityComposerGroup2");
  console.log(cityComposerGroup2.top(5));


  console.log("composerGroup");
  console.log(composerGroup.top(5));   // .top(Infinity) = all items

  console.log("filtered / copy composerGroup2");
  //console.log(composerGroup2.top(5));   // .top is not a function -> not a group? empty?
  console.log(JSON.stringify(composerGroup2));
*/

}); /* close load data */





// MY FIND PLACE (ie filter LIs)
$(document).ready(function(){
  $("#filter").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#filterPlaces li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});



// FUNCTIONS
// =========

function reset()
{
  // reset filters on data (redarw composers list)
  dc.filterAll()
  dc.renderAll()
  // hide graphs; show intro again
  $('#graphs').addClass('hidden')
  $('#info').removeClass('hidden')
  // reset (blank) select composers filter as redraw shows full list
  $("#filter").val('');
}

function make_gridlines() {
    return d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat("")
}

function make_gridlines2() {
    return d3.axisLeft(y2)
        .ticks(5)
        .tickSize(-width)
        .tickFormat("")
}

function updateBubbles() {
  // bubbles is non DC.JS so have to update manually when other charts are filtered
  // https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi
  //
  //console.log("update bubbles. new filtered composerGroup");
  //console.log(JSON.stringify(cityComposerGroup.top(Infinity)));

  // check if graphs visible: if not then hide info & show graphs
  if ($('#graphs').hasClass('hidden')) {
    //console.log("graphs is hidden - show it")
    $('#info').addClass('hidden')
    $('#graphs').removeClass('hidden')
  }

  // reset (blank) select composers filter as the redraw will have redrawn the whole list
  $("#filter").val('');


 // BUBBLES 1: COMPOSERS per CITY
  var bubbles = d3.select("#chart-bubble-composers svg")
    .selectAll("circle")
    .data(cityComposerGroup.top(Infinity));

  // rescale and redraw xAxis
  var distinctCities = [...new Set(cityYearDim.top(Infinity).map(d => d.City))].sort();
  x.domain(distinctCities)        // current cities
  xAxis
    .transition().duration(1000).call(d3.axisBottom(x))     // update new scale
    .call(d3.axisBottom(x).tickSizeOuter(0));     // tickformat 1900 not 1,900
  xpad = x.bandwidth() / 2;     // want half the width of the band to plot in center of band

  // rescale and redraw yAxis
  var distinctComposers = [...new Set(composerDim.top(Infinity).map(d => d.Composer))].sort();
  y.domain(distinctComposers)        // current composers only

  yAxis
    .transition().duration(1000).call(d3.axisLeft(y))     // update new scale
    .call(d3.axisLeft(y).tickSizeOuter(0));     // tickformat 1900 not 1,900
  ypad = y.bandwidth() / 2;     // want half the width of the band to plot in center of band

  // redraw gridlines on new scale
  gridlines
    .transition()
    .duration(300)
    .call(make_gridlines())


  // recalculate z scale - bubble size - to max of _current_ selection
  maxZ = Math.max.apply(Math, cityComposerGroup.top(Infinity).map(function(o) { return o.value; }));
  //z = d3.scaleLinear().domain([0, maxZ]).range([0, 10]);
  // want 0=0; 1 = visible; linear not ideal see https://bl.ocks.org/guilhermesimoes/e6356aa90a16163a6f917f53600a2b4a
  z = d3.scaleSqrt()
     .domain([0, maxZ])   // counts from cityComposerGroup ie per city
     .range([2, 15]);     // start at 3 so smallest not too small! - bnut then zero maps to 3!

  // update selection
  bubbles
    .transition()
    .duration(300)
    //.attr("cx", function (d) { return x(d.key[0]) + xpad; } )  // x = city + pad to center of band
    .attr("cx", function (d) {
      if (isNaN(x(d.key[0]))) {
        // city not in current scale so returns NaN - catch and use dummy 1st city instead
        return x(distinctCities[0]) + xpad; // x = city + pad to center of band
      } else {
        return x(d.key[0]) + xpad;  // x = city + pad to center of band
      }
    } )
    //.attr("cy", function (d) { return y(d.key[1]) + ypad; } )    // y = composer + pad to center of band
    .attr("cy", function (d) {
      if (isNaN(y(d.key[1]))) {
        // composer not in current scale so returns NaN - catch and use dummy 1st composer instead
        return y(distinctComposers[0]) + ypad; // x = composer + pad to center of band
      } else {
        return y(d.key[1]) + ypad;  // x = composer + pad to center of band
      }
    } )
    //.attr("r", function (d) { return z(d.value); } )         // r = value
    .attr("r", function (d) {
         //console.log(d.key[1], d.key[0], "value ", d.value, " scale ", z(d.value));
         //return d.value * 5})
         //return z(d.value); } )         // TEST
         if (d.value == 0) {
           return 0;                // 0 so wont show
         }
         else {
           return z(d.value);      // scale 3-10 so 1 is not too small
         }
    })
    .style("fill", function (d) { return myColor(d.key[0]); } )  // colour = city

  // exit selection
  // bubbles.exit().remove();


  // BUBBLES2: per CITY per YEAR
  // rescale and redraw xAxis
  var distinctYears = [...new Set(composerYearDim.top(Infinity).map(d => d.Year))].sort();
  var firstyear = parseInt(distinctYears[0]);
  ////var firstyear = Math.floor((distinctYears[0] - 1)/10) * 10;     // floor to decade; -1 incase already deacde
  var lastyear = parseInt(distinctYears[distinctYears.length - 1]);         // full range
  //// var lastyear = firstyear + 30;             // dont focus here - filter the year instead
  // set new domain & redraw xAxis
  x2.domain([firstyear,lastyear]);
  xAxis2
    .transition().duration(1000).call(d3.axisBottom(x2))     // update new scale
    .call(d3.axisBottom(x2).tickSizeOuter(0).tickFormat(d3.format('d')));     // tickformat 1900 not 1,900

/*  THIS ISNT WORKING AS EXPECTED

    non-empty: cityGroup.top(Infinity).filter(d => d.value != 0).map(d => d.key)
      is OK (in conmsole.log) but _fails_ as scale

    fixed scale ie domain(["Manchester", "London"]); looks OK but cY all NaN


  // rescale and redraw yAxis
  y2.domain(["Manchester", "London"]);
    //.domain(cityGroup.top(Infinity).filter(d => d.value != 0).map(d => d.key).sort())        // filtered cities
    //.range([ 0, height2]);                                          // biggest total at top (svg 0)

  yAxis2
    .transition().duration(1000).call(d3.axisLeft(y2));     // update new scale

    //.domain(cityGroup.top(Infinity).filter(d => d.value != 0).map(d => d.key).sort())        // filtered cities


/*
//console.log ("update... cityGroup:")
//console.log(cityGroup.top(Infinity).sort())                   // cities (inc. zeros) & counts
//console.log(cityGroup.top(Infinity).map(d => d.key).sort())  // just labels
//console.log ("update... nonEmpty cityGroup:")


nonEmptyCity = cityGroup.top(Infinity).filter(d => d.value != 0).map(d => d.key).sort()
//onEmptyCity = nonEmptyCityList.map(d => d.key).sort();

console.log ("update... nonEmpty city:")
console.log(nonEmptyCity);               // removed empty bins (cities)

*/


  // rescale and redraw yAxis
  var distinctCities = [...new Set(cityYearDim.top(Infinity).map(d => d.City))].sort();
  y2.domain(distinctCities)        // current cities
  //console.log (distinctCities)
  yAxis2
    .transition().duration(1000).call(d3.axisLeft(y2).tickSizeOuter(0))     // update new scale
  ypad2 = y2.bandwidth() / 2;     // want half the width of the band to plot in center of band

  // redraw gridlines on new scale
  gridlines2
    .transition()
    .duration(300)
    .call(make_gridlines2())



  // recalculate z scale - bubble size - to max of _current_ selection
  maxZ2 = Math.max.apply(Math, cityYearGroup.top(Infinity).map(function(o) { return o.value; }));
  z2 = d3.scaleSqrt()
     .domain([0, maxZ2])   // counts from cityYearGroup ie per city
     //.range([3, 10]);    // start at 3 so smallest not too small! BUT sero maps to 3 !
     .range([2, 12]);      // smaller range & x2 when draw....
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
    //.attr("cy", function (d) { return y2(d.key[0]) + ypad2; } )    // y = city + pad to center of band
    .attr("cy", function (d) {
      if (isNaN(y2(d.key[0]))) {
        // city not in current scale so returns NaN - catch and use dummy 1st city instead
        //console.log ("city not in current scale")
        //console.log (d.key[0])
        //console.log (distinctCities[0])
        return y2(distinctCities[0]) + ypad2; // y = city + pad to center of band
      } else {
        return y2(d.key[0]) + ypad2;  // y = city + pad to center of band
      }
    } )    // y = city + pad to center of band
    //.attr("r", function (d) { return z(d.value); } )           // r = value
    .attr("r", function (d) {
         //console.log(d.key[1], d.key[0], "value ", d.value, " scale ", z(d.value));
         //return d.value * 5})
         if (d.value == 0) {
           return 0;                // 0 so wont show
         }
         else {
           return z2(d.value);      // scale 3-10 so 1 is not too small
         }
    })
         //return z2(d.value); } )         // TEST
    .style("fill", function (d) { return myColor2(d.key[0]); } )  // colour = city



}



// REMOVE EMPTY BINS
// see https://dc-js.github.io/dc.js/examples/filtering-removing.html
// Example demonstrating using a "Fake Group" to remove the empty bars of an ordinal bar chart when their values drop to zero.

function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value != 0;
            });
        }
    };
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
