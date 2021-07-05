// testing reshaping data

// LOAD DATA
d3.csv('/assets/test2.csv').then(data => {

  console.log("raw data")
  console.log(data)


// v1 NEST -> ENTRIES (verbose array!) then MAP to get first city
  var nested = d3.nest()
    .key(function(d) { return d.composer; })
    .key(function(d) { return d.year; }).sortKeys(d3.ascending)
    .entries(data);
  console.log("nested data (entries)")
  console.dir(nested)

  var reshaped = nested.map(function(element){
    console.log (" got", element)
    console.log ("  - first item", element["values"][0]["values"][0])
    //return element["values"][0]["values"][0]   // works
    var firstcity = element["values"][0]["values"][0]["city"]
    var secondcity;
    // check each city until get a different one - ie 2nd city
    element["values"].every(element => {
      console.log ("    - ", element["values"][0]["city"])
      if (element["values"][0]["city"] != firstcity) {
        console.log ("      -> ", element["values"][0]["city"] + " is second city")
        secondcity = element["values"][0]["city"];
        return false; // we have 2nd city so exit
      }
      return true;
    });

    return {
      composer: element["values"][0]["values"][0]["composer"],
      firstCity: firstcity,
      secondcity: secondcity
    }
  });
  console.log("reshaped data")
  console.dir(reshaped)



/*
  // v2 NEST -> MAP (neater?) then ... ... to get first city
    var nested = d3.nest()
      .key(function(d) { return d.composer; })
      .key(function(d) { return d.year; }).sortKeys(d3.ascending)
      .map(data);
    console.log("nested data (map)")
    console.dir(nested)
*/

}); /* close load data */
