/* javascript sheet mkohls */
//leaflet lab

/* Map of GeoJSON data from Wisconsin Public Library data */

//function to instantiate the Leaflet map
function createMap(){
    //create the map and center it on WI
    var map = L.map('map', {
        center: [45, -88],
        zoom: 7
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};
function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    //Below Example 3.5...replace button content with images
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
  };
//build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attArray = [];
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Print") > -1){
            attArray.push(attribute);
        };
    };
    //check result
    //console.log(attArray);
    return attArray;
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/Books.geojson", {
        dataType: "json",
        success: function(response){
            var attArray = processData(response);
            //console.log(attArray);
            createSequenceControls(map, attArray);
            //create a Leaflet GeoJSON layer and add it to the map
            geojsonLayer = L.geoJson(response, {
              //function to calculate radius size for symbols
              pointToLayer: function(feature, latlng, attArray) {
                var attArray = processData(response);
                var attribute = attArray[0];
                //console.log(attribute);
                var attValue = Number(feature.properties[attribute]);
                //console.log(calcPropRadius(attValue));
                function calcPropRadius(attValue) {
                  //scale factor to adjust symbol size evenly
                  var scaleFactor = 0.02;
                  //area based on attribute value and scale factor
                  var area = attValue * scaleFactor;
                  //radius calculated based on area
                  var radius = Math.sqrt(area/Math.PI);

                  return radius;
                };
                //use return to generate proportional symbols
                      return new L.CircleMarker(latlng, {
                        radius: calcPropRadius(attValue),
                        fillColor: "#FA7268",
                        color: "#FA7268",
                        weight: 1.5,
                        opacity: 1,
                        fillOpacity: 0.75
                      });
                  },
              //function to add popups to proportional symbols
              onEachFeature: function(feature, layer) {
                      /* var list = "<dl><dt></dt>"
                      + "<dd>" + feature.properties.N + "</dd>"
                      + "<dt> Print Books in 2017: </dt>"
                      + "<dd>" + feature.properties.Print_Books_2017 + "</dd>"
                      layer.bindPopup(list); */
                      //console.log("hello");
                      layer.bindPopup("<b>" + feature.properties.N + "<br>" + feature.properties.Print_Books_2017 + "</b>" + " print books in 2017");
                    },
             })
        map.addLayer(geojsonLayer);
          }
      })
   };



$(document).ready(createMap);
