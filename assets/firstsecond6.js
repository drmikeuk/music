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
var secondCitiesBarChart = dc.barChart("#chart-bar-secondCities"),
    timeBarChart = dc.barChart("#chart-bar-time"),
    dataCount = dc.dataCount("#datacount"),
    dataSummaryTable = dc.dataTable("#table-datasummary");

// REMOVED var composite = new dc.CompositeChart("#chart-composite-composers");


var ndx;            // NB now paginating need to define outside of load data


// LOAD DATA
// =========
// NB  special chars so try this? https://stackoverflow.com/questions/38304384/d3-js-read-csv-file-with-special-characters-%C3%A9-%C3%A0-%C3%BC-%C3%A8
d3.csv('/assets/PerformanceDatabaseMock.LondonNYParis.csv').then(original => {
	// might want to format data a bit here eg calculate month or year from timestamp

  // reshape data to find first and second cities
  // from composer, city, year
  // to composer, firstcity, firstyear, secondcity
  var nested = d3.nest()
    .key(function(d) { return d.Composer; })
    .key(function(d) { return d.Year; }).sortKeys(d3.ascending)
    .entries(original);

  var data = nested.map(function(element){
    //console.log (" got", element)
    //console.log ("  - first item", element["values"][0]["values"][0])
    var firstcity = element["values"][0]["values"][0]["City"]
    var firstYear = element["values"][0]["values"][0]["Year"]
    var secondcity =  '', secondYear = ''; // crossfilter can cope with blanks; but not if  endefined
    // check each city until get a different one - ie 2nd city
    element["values"].every(element => {
      //console.log ("    - ", element["values"][0]["city"])
      if (element["values"][0]["City"] != firstcity) {
        //console.log ("      -> ", element["values"][0]["city"] + " is second city")
        secondcity = element["values"][0]["City"];
        secondYear = element["values"][0]["Year"];
        return false; // we have 2nd city so exit
      }
      return true;
    });

    return {
      Composer: element["values"][0]["values"][0]["Composer"],
      firstCity: firstcity,
      firstYear: firstYear,
      secondCity: secondcity,
      secondYear: secondYear
    }
  });
  //console.log("reshaped data")
  //console.dir(data)


	// CREATE CROSSFILTER DIMENSIONS AND GROUPS
	ndx = crossfilter(data),
    cityDim = ndx.dimension(d => d.firstCity),
    secondCityDim = ndx.dimension(d => d.secondCity),
		yearDim = ndx.dimension(d => d.firstYear),
		all = ndx.groupAll(),
    cityGroup = cityDim.group(),
    secondCityGroup = secondCityDim.group().reduceCount(),
    yearGroup = yearDim.group().reduceCount();


	// CONFIGURE DATA COUNT (x out of y records shown)
	dataCount.dimension(ndx)
	    .group(all)
	    .html({
	    	some: 'Showing <span class="filter-count">%filter-count</span> out of <span class="total-count">%total-count</span> first performances. <a href="javascript:reset();">Reset</a>',
     		all: ' '
		});


	// CONFIGURE CHART ATTRIBUTES

  secondCitiesBarChart.width(800).height(300)
    .dimension(secondCityDim)
    .group(secondCityGroup)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .ordinalColors(colours) 	         // my range of colours
    //.centerBar(true)  // not req with scaleBand
    .elasticY(true)
    .margins({top:10,bottom:70,right:20,left:40})   // big bottom margin for labels (rotate after render)
    //.on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
    secondCitiesBarChart.yAxis().ticks(3);         // --> less ticks! setter so can't chain ie must be last!


    var distinctYears = [...new Set(yearDim.top(Infinity).map(d => d.firstYear))].sort();
    var firstyear = distinctYears[0];
    var lastyear = distinctYears[distinctYears.length - 1];

    console.log("firstyear: ", firstyear)
    console.log("lastyear: ", lastyear)

  timeBarChart.width(800).height(100)
      .dimension(yearDim)
      .group(yearGroup)
      .ordinalColors(colours) 	         // my range of colours
      // old style .x(d3.scale.linear().domain([1840, 1900])) // d3v3 not d3v4
      //.x(d3.scaleLinear().domain([1812, 1901]))   // extra or 1st bar cut off
      .x(d3.scaleLinear().domain([firstyear, lastyear]))          // years from current dataset (unique; sorted)
      .centerBar(true)
      .elasticY(true)
      .margins({top:10,bottom:20,right:20,left:40})   // margin to match bars aboves
      //.on("filtered", updateBubbles)    // bubbles is non-dc.js so update manually
      .xAxis().tickFormat(d3.format('d'));    // 1900 not 1,900

  //timeBarChart.yAxis().tickFormat(d3.format("d"));    // oops - get 1,1,1,2,2,2

  timeBarChart.yAxis().ticks(2);         // --> less ticks! setter so can't chain ie must be last!


  // SEARCH CITIES v2: filterable set of checkboxes
  var filterCities = new dc.CboxMenu("#filterCities")
      //.dimension(composerDim)             // same DIM as graph - graph DONT update (so see all)
      //.group(composerGroup)
      .dimension(cityDim)     // new DIM - graph updates BUT loose all
      .group(cityGroup)
      .order(function (a,b) {
        return a.value < b.value ? 1 : b.value < a.value ? -1 : 0; // order by value not group key (label)
      })
      //.title(d => d.key)       // DOESNT WORK
      .on("filtered", updateCity)    // update Title + bubbles is non-dc.js so update manually
      .multiple(true);


	// CONFIGURE DATA TABLE          // yearDIM = sort by year ?
	dataSummaryTable.dimension(yearDim)
	    .group(d => d.firstYear)          // group by year??
      .size(Infinity)				       // need all the records & let pagination handle display & offset
    	.columns(['Composer', 'firstCity', 'firstYear', 'secondCity', 'secondYear'])  // can change labels & format of data if desired
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

  // rotate x labels
  // see http://www.d3noob.org/2016/08/rotating-text-labels-for-graph-axis-in.html
  // and https://stackoverflow.com/questions/51818345/how-to-rotate-d3-chart-xaxis-label-in-vertical
  var secondCities = d3.select("#chart-bar-secondCities");
  secondCities.select('.axis.x')
    .attr("text-anchor", "end")
    .selectAll("text")
    .attr("transform", "rotate(-65)")
    .attr("dx", "-0.8em")
    .attr("dy", "-0.5em");

}); /* close load data */


// MY FIND COMPOSER (ie filter LIs)
$(document).ready(function(){
  $("#filter").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#filterCities li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });


});



// FUNCTIONS
// =========

// UPDATE FIRST CITY + FIRST PERFORMANCE TITLE if filtered
function updateCity() {
  // check if filtered / has been called as reset filters
  // NB currentFilter returns: null / string for single / array for range / function
  if (typeof cityDim.currentFilter() === 'string') {
    // console.log("filtered: ", citySearchDim.currentFilter());
    // (luckily only populates if SINGLE selected composer) not relevent as checked is stringf
    $("#this-city").html("First performance: " + cityDim.currentFilter());
  } else {
    // reset
    $("#this-city").html("");
  }

  // add logic from _updatebubbles_ ...
  // check if graphs visible: if not then hide info & show graphs
  if ($('#graphs').hasClass('hidden')) {
    //console.log("graphs is hidden - show it")
    $('#info').addClass('hidden')
    $('#graphs').removeClass('hidden')
  }

  // reset (blank) select composers filter as the redraw will have redrawn the whole list
  $("#filter").val('');
}




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
