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

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/Books.geojson", {
        dataType: "json",
        success: function(response){
            //create a Leaflet GeoJSON layer and add it to the map
            geojsonLayer = L.geoJson(response, {
              style: function(feature) {
                      return {
                      	color: "orange"
                      };
                  },
              //function to calculate radius size for symbols
              pointToLayer: function(feature, latlng) {
                var attribute = "Print_Books_2017";
                var attValue = Number(feature.properties[attribute]);
                console.log(calcPropRadius(attValue));
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
                        fillColor: "#ff7800",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                      });
                  },
              //function to add popups to proportional symbols
              onEachFeature: function(feature, layer) {
                      /* var list = "<dl><dt></dt>"
                      + "<dd>" + feature.properties.N + "</dd>"
                      + "<dt> Print Books in 2017: </dt>"
                      + "<dd>" + feature.properties.Print_Books_2017 + "</dd>"
                      layer.bindPopup(list); */
                      layer.bindPopup("<b>" + feature.properties.N + "<br>" + feature.properties.Print_Books_2017 + "</b>" + " print books in 2017");
                    },
              createPropSymbols: function(data) {
                var attribute = "Print_Books_2017";
              }
             })
        map.addLayer(geojsonLayer);
          }
      })
   };



$(document).ready(createMap);

//4. Determine which attribute to visualize with proportional symbols
//5. For each feature, determine its value for the selected attribute
//6. Give each feature's circle marker a radius based on its attribute value
