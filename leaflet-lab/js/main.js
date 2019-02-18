/* javascript sheet mkohls */
//leaflet lab

/* Map of GeoJSON data from Wisconsin Public Library data */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
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
    onEachFeature(map);
};

//function to attach popups to each mapped feature - I can't get this to work
function onEachFeature(feature, layer) {
    //we have no property named popupContent; instead, create variable called
    //popupContent, and then html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

function createPropSymbols(data, map){
  //turning the points into styled markers (can't use L.geojson)
  //define the style of the markers here
}
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
                      	color: "green"
                      };
                  },
              pointToLayer: function(feature, latlng) {
                      return new L.CircleMarker(latlng, {
                      	radius: 10,
                      	fillOpacity: 0.85
                      });
                  },
              onEachFeature: function (feature, layer) {
                      layer.bindPopup(feature.properties.N);
                      console.log(feature.properties.N);
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
