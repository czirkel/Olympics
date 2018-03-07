var map = L.map('map').setView([26.3351   ,17.2286], 3);
var dataLayer = L.geoJson(null, {
//
// Create circles instead of standard markers
//
pointToLayer: function (feature, latlng) {
  return L.circleMarker(latlng);
},

//
// Use an object to style the circle markers.
//
// If you wanted to, you could make this a function
// that takes the feature and returns a style specific
// to that feature.
//

style: {
  fillColor: '#ffffff',
  fillOpacity: 0.5,
  radius: 8,
  stroke: false
}
}).addTo(map);   

// set a tile layer to be CartoDB tiles 
var MapboxTiles = L.tileLayer('https://api.mapbox.com/styles/v1/czirkel/cjeffmzuk0u9q2sqnz8h5abaa/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY3ppcmtlbCIsImEiOiJjaW45ajM1eGQwMGJvdmdrdmlpcHdqNmFtIn0.mJ3V4g-gZpUP9MarrEjrkQ',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// add these tiles to our map
map.addLayer(MapboxTiles);
// Ask CartoDB for the music festivals camping true layer, as GeoJSON

/*var camping = $.getJSON('https://clzirkel.cartodb.com/api/v2/sql?q=SELECT * FROM musicfestivals_1 WHERE camping IN (true)&format=GeoJSON')
  
    // When it's done, add the results to the map
    .done(function (data) {
      dataLayer.addData(data);     
    });*/
//legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend')

        div.innerHTML +=
        '<b>Olympic Season</b><br />' +
        '<svg class="left" width="22" height="18"><circle cx="10" cy="9" r="8" class="legendSvg1"/></svg><span>Summer</span><br />' +
            '<svg class="left" width="22" height="18"><circle cx="10" cy="9" r="8" class="legendSvg2"/></svg><span>Winter</span><br />' +
            '<svg class="left" width="22" height="18"><circle cx="10" cy="9" r="8" class="legendSvg3"/></svg><span>Summer - Upcoming</span><br />' +
            '<svg class="left" width="22" height="18"><circle cx="10" cy="9" r="8" class="legendSvg4"/></svg><span>Winter - Upcoming</span><br />' +
            '<svg class="left" width="22" height="18"><circle cx="10" cy="9" r="8" class="legendSvg5"/></svg><span>Summer - Canceled</span><br />' +
            '<svg class="left" width="22" height="18"><circle cx="10" cy="9" r="8" class="legendSvg6"/></svg><span>Winter - Canceled</span><br />' +
            '<p></p>'+
            '<span><b>Data was gathered from the</b></span>'+
            '<p><b>Olympic Games official website.</b></p>'
;
    return div;
};

legend.addTo(map);



// set data layer as global variable so we can use it in the layer control below
var musicgeoJSON;

// use jQuery get geoJSON to grab geoJson layer, parse it, then plot it on the map using the plotDataset function

//$.getJSON( "data/musicfestivals.geojson", function( data ) {
$.getJSON( "https://clzirkel.cartodb.com/api/v2/sql?q=SELECT * FROM new_olympics&format=geojson", function( data ) {
    var musicCount = data;
// draw the dataset on the map

    console.log(musicCount);

    //style
    //
    var musicCountPointToLayer = function (feature, latlng){

        console.log(feature.properties.category);
        var value = feature.properties.category;
        var fillColor = null;
        if (value == "Summer"){
            fillColor = "#ff1a1a";
        } else if (value == "Summer - Canceled"){
            fillColor = "#ffe6e6";
        } else if (value == "Summer - Upcoming"){
            fillColor = "#990000";
        } else if (value == "Winter"){
            fillColor = "#1a1aff";
        } else if (value == "Winter - Canceled"){
            fillColor = "#e6e6ff";
        } else if (value == "Winter - Upcoming"){
            fillColor = "#000099";
        }
//set the radius of the point based off how expensive the festival is
        var musicCountMarker = L.circleMarker(latlng, {
            weight: 1,
            opacity: 0.1 ,
            color: 'white',
            fillOpacity: 0.75 ,
            fillColor: fillColor,
            radius: 10
        });

        return musicCountMarker; 
    }

    var musicCountClick = function (feature, layer) {
        var genre = feature.properties.musicfestivals;
                    var template = $('#template').html(); 
            var output = Mustache.render(template, feature.properties);
            layer.bindPopup(output)

        //bind to pop up
        //up case and lower case MATTERS
        //layer.bindPopup("<strong>Festival Name:</strong>" + " " + feature.properties.festival_name + "<br /><strong>Genre:</strong> " + feature.properties.genre + "<br /><strong>Location: </strong>" + feature.properties.city + "," + " " + feature.properties.state + "<br /><strong>Approximate Ticket Price: </strong>" + " " + "$" + feature.properties.full_festival_ticket_price);
    }

    musicCountGeoJSON = L.geoJson(musicCount, {
        pointToLayer: musicCountPointToLayer,
        onEachFeature: musicCountClick
    }).addTo(map);


});


function radius(d) {
    console.log(d);
    return d > 1000 ? 30 :
           d > 500  ? 25 :
           d > 250  ? 20  :
           d > 125  ? 15  :
           d > 75   ? 10  :
                      5 ;
}
// Set option value in constructor
// Set date option



//$("#slider").dateRangeSlider();
$("#slider").dateRangeSlider({
  //"option",
  bounds: {
  
    min: new Date(2016, 0, 1),
    max: new Date(2016, 11, 31)},  
});

$("#slider").bind("valuesChanged", function(e, data){
    var sql = "SELECT * FROM musicfestivals_1 WHERE start_date > '" + data.values.min.toISOString() + "' AND end_date < '" + data.values.max.toISOString() + "'";
    var url = 'https://clzirkel.cartodb.com/api/v2/sql?' + $.param({
        q: sql,
        format: 'GeoJSON'
    });

    $.getJSON(url)

    .done(function (data) {
        dataLayer.clearLayers();
        dataLayer.addData(data);
    });
    console.log(data)
  console.log("Values just changed. min: " + data.values.min + " max: " + data.values.max);
});


function createLayerControls(){
    // add in layer controls
    var baseMaps = {
        "Mapbox Basemap": MapboxTiles,
    };

    var overlayMaps = {
        "Music Festivals": musicgeoJSON,
        "Camping": camping,
    };

    // add control
    L.control.layers(baseMaps, overlayMaps, camping).addTo(map);

    //Countdown clock??


};
