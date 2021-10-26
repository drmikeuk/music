// draw smple world map from topojson

var width = 1110,
    height = 300;

var svg = d3.select("#citiesMap").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geoMercator()
    .scale(280)                             // zoom in
    .center([-60, 30 ]);                    // center to focus on EU + US

var path = d3.geoPath()
    .projection(projection);

//d3.json('/assets/countries-110m.topojson.json').then(world => {

var mapurl = '/assets/countries-110m.topojson.json';
var placesurl = '/assets/cities.csv';       // just copy off google maps
Promise.all([d3.json(mapurl), d3.csv(placesurl)]).then(function(data) {
    //if (error) throw error;

    var world = data[0];
    var places = data[1];

    // draw map
    svg.selectAll("path")
       .data(topojson.feature(world,world.objects.countries).features)
       .enter().append("path")
       .attr("fill", "#ACB5BB")
       //.attr("stroke", "white")
       .attr("d", path);

    // draw bubbles for places
    svg.selectAll("circle")
       	.data(places)
        .enter()
       	.append("circle")
       	.attr("r", 7)                                           //  (fixed size)
       	.attr("cx", function(d) {	return projection([d.lng, d.lat])[0]; })
       	.attr("cy", function(d) {	return projection([d.lng, d.lat])[1]; })
       	.attr("fill", "darkgreen")
       	.attr("opacity", 0.5)



    // TEST calc svg x,y from lat,lng
    /*
    places.forEach(place => {
      //console.log(place);
      console.log("city: ", place["city"], ", x:", projection([place["lng"], place["lat"]])[0], ", y:", projection([place["lng"], place["lat"]])[1]);
      //console.log(projection( [place["lng"], place["lat"]] ));  // note  longitude, latitude]
    });

    */






});
