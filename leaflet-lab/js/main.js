/* javascript sheet mkohls */
//leaflet lab

/* Map of GeoJSON data from Wisconsin Public Library data */
var newLayer;
var featureLayer;
var mapLayer;
//create slider and skip buttons
function createSequenceControls(map,attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
	//set slider attributes
	$('.range-slider').attr({
		max: 8,
		min: 0,
		value: 0,
		step: 1
	})
	//add skip buttons
  $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
  $('#panel').append('<button class="skip" id="forward">Skip</button>');
  //replace button content with images
  $('#reverse').html('<img src="img/reverse.png">');
  $('#forward').html('<img src="img/forward.png">');
  //listener for slider
  $('.range-slider').on('input', function(){
    var index = $(this).val();
    //console.log(index);
    //update symbols when slider is moved
    updatePropSymbols(map, attributes[index]);
});
    $('.skip').click(function(){
        //get old index value
        var index = $('.range-slider').val();
        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 8 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 8 : index;
        };
        //update slider
        $('.range-slider').val(index);
		//update symbols when buttons are clicked
        updatePropSymbols(map, attributes[index]);
    });
};

//connect proportional symbols to cycling attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            //add city to popup content string
            var popupContent = "<p><b>" + props.N + ": </b></p>";
            //add formatted attribute to content string
            var year = attribute.split("_")[2];
            popupContent += "<p><b>" + props[attribute] + "</b> print books in " + year + "</p>";
            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
	});
};

//create and style the proportional symbols
function pointToLayer(feature, latlng, attributes){
	var attribute = attributes[0];
	var geojsonMarkerOptions = {
		radius: 8, //initial radius before calculations
		fillColor: "#FA7268",
		color: "#FA7268",
		weight: 1.5,
		opacity: 1,
		fillOpacity: 0.75
	};
	var attValue = Number(feature.properties[attribute]);
	geojsonMarkerOptions.radius = calcPropRadius(attValue);
	featureLayer = L.circleMarker(latlng, geojsonMarkerOptions);
	//build popup content string
	var popupContent = "<p><b>" + feature.properties.N + ": </b></p>";
	//add formatted attribute to popup content
	var year = attribute.split("_")[2];
	popupContent += "<p><b>" + feature.properties[attribute] +"</b> print books in " + year + "</p>";
	//bind the popup to the circle marker
    featureLayer.bindPopup(popupContent, {
		offset: new L.point(0, -geojsonMarkerOptions.radius)
	});
	return featureLayer;
};

//create array to hold index values for attributes
function processData(data){
    //empty array to hold attributes
    var attributes = [];
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Print") > -1){
            attributes.push(attribute);
        };
    };
    return attributes;
};

//adjust the symbols for each data point to reflect its value using the calcPropRadius function results
function createPropSymbols(data, map, attributes){
	L.geoJson(data, {
		pointToLayer: function(feature,latlng){
			return pointToLayer(feature,latlng,attributes);
		}
	}).addTo(map);
};

//function to get the data
function getData(map){
    //load the data
    $.ajax("data/Books.geojson", {
        dataType: "json",
        success: function(response){
			//create an attributes array
            var attributes = processData(response);
			createPropSymbols(response, map, attributes);
			createSequenceControls(map,attributes);
		}
    });
};

//load second layer of data
function getNextLayer(map){
    //load the data
    $.ajax("data/population.geojson", {
        dataType: "json",
        success: function(response){
          //reapply proportional symbol functions to new layer 
          newLayer = L.geoJson(response, {
              pointLayer: function(feature, latlng) {
                var attribute = "Municipal_Pop";
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
                      return new L.CircleMarker(latlng, {
                        radius: calcPropRadius(attValue),
                        fillColor: "#ff7800",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                      });
                  },
              onEachFeature: function(feature, layer) {
                      layer.bindPopup("\nPopulation: " + "<b>" + feature.properties.Municipal_Pop + "</b>");
                      //console.log(feature.properties.N);
                    },
              createPropSymbols: function(data) {
                var attribute = "Municipal_Pop";
              }
            }).addTo(map);
          controlLayers(map);
		 }
    });
};
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.02;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};

//function to create the map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [45, -88],
        zoom: 7
    });
    //add OSM base tilelayer
    mapLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    //call getData function to add data to the map
    getData(map);
    getNextLayer(map);

};

function controlLayers(map){
    var overlayMaps = {
    "Population": newLayer,
    //"Books": featureLayer
  };
  var baseMaps = {
    "Grayscale": mapLayer
  };
  //console.log(newLayer);
  //console.log(featureLayer);
  L.control.layers(null, overlayMaps).addTo(map);
};
//creates the entire map once the page is loaded
$(document).ready(createMap);
