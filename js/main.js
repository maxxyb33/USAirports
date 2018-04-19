function myFunction() {
    alert("This chloropleth map presents all airports in the USA.  They are color-coded by whether or not they have a control tower. " +
        "States are further painted with a sequential color pallete, depicting the density (number) of " +
        "airports in the state (see Legend). A firey ocean reminds the site's visitor that on one hand, " +
        "planes are able to cross desolate, violent, unforgiving bodies of water from the comfort, " +
        "convenience, and speed of air travel; while on the other hand, is a reminder about the consequences " +
        "of things gone wrong. " +
        "Hotplate States filled with warm colors suggests safety does not even necessarily offer promise on land. " +
        "As the warning message indicates, don't forget Alaska and Hawaii -- which also have " +
        "respectable airport densities -- See if you can find Adak Airport!  The message can be closed, which will bring the legend and " +
        "credit box into screen view. Airport data has been used from Data.gov by allowance of the " +
        "United States Government. Mike Bostock (of D3, and https://bost.ocks.org/mike/) has provided data of state boundaries. Map " +
        "baselayers and user-interactive features are from Leaflet. Other sources include Google Font " +
        "Library and ColorBrewer2.org.  Created by Max Boath, for OSU GEOG572 Geovisual Analytics. " +
        "4/20/2018");
}




// 14. This is core of how Labelgun works. We must provide two functions, one
// that hides our labels, another that shows the labels. These are essentially
// callbacks that labelgun uses to actually show and hide our labels
// In this instance we set the labels opacity to 0 and 1 respectively.
var hideLabel = function(label){ label.labelObject.style.opacity = 0;};
var showLabel = function(label){ label.labelObject.style.opacity = 1;};
var labelEngine = new labelgun.default(hideLabel, showLabel);
var labels = [];





// 1. Create a map object.
var mymap = L.map('map', {
    center: [39.01, -98.48],
    zoom: 4,
    maxZoom: 11,
    minZoom: 2,
    detectRetina: true});

// 2. Add a base map.
L.tileLayer('https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png').addTo(mymap);

// 3. Add cell towers GeoJSON Data
// Null variable that will hold cell tower data
var airports = null;


// 4. build up a set of colors from colorbrewer's dark2 category
var colors = chroma.scale('Accent').mode('lch').colors(7);

// 5. dynamically append style classes to this page. This style classes will be used for colorize the markers.
for (i = 0; i < 2; i++) {
    $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colors[i] + "; font-size: 15px; text-shadow: 0 0 3px #ffffff;} </style>"));
}

// Get GeoJSON and put on it on the map when it loads
airports= L.geoJson.ajax("airports.geojson", {
    // assign a function to the onEachFeature parameter of the Plane object.
    // Then each (point) feature will bind a popup window.
    // The content of the popup window is the value of `feature.properties.AIRPT_NAME`
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.AIRPT_NAME);
    },
    pointToLayer: function (feature, latlng) {
        var id = 0;
        if (feature.properties.CNTL_TWR == "Y") { id = 0; }
        else if (feature.properties.CNTL_TWR == "N")  { id = 1; }
        //      else { id = 8;} // "Salem Cellular"
        return L.marker(latlng, {icon: L.divIcon({className: 'fa fa-fighter-jet marker-color-' + (id + 1).toString() })});
    },
    attribution: 'Airport Towers Data &copy; Data.gov | US State Boundaries &copy; Mike Bostock | Base Map &copy; Leaflet | Made By Max Boath'
}).addTo(mymap);


// 6. Set function for LEGEND COLOR RAMP
colors = chroma.scale('Oranges').colors(5); //colors = chroma.scale('OrRd').colors(5);

function setColor(density) {
    var id = 0;
    if (density > 25) { id = 4; }
    else if (density > 15 && density <= 25) { id = 3; }
    else if (density > 10 && density <= 15) { id = 2; }
    else if (density > 5 &&  density <= 10) { id = 1; }
    else  { id = 0; }
    return colors[id];
}


// 7. Set style function that sets fill color.md property equal to PLANE density
function style(feature) {
    return {
        fillColor: setColor(feature.properties.count),
        fillOpacity: .85,
        weight: 2,
        opacity: 2,
        color: '#40c2e5',
        dashArray: '8'
    };
}



// 8. Add county polygons
// create counties variable, and assign null to it.
var states = null;
states = L.geoJson.ajax("us-states.geojson", {
    style: style,
    onEachFeature: function (feature, label) {
        label.bindTooltip(feature.properties.name, {className: 'feature-label', permanent:true, direction: 'center'});
        labels.push(label);
    }
}).addTo(mymap);



// 9. Create Leaflet Control Object for Legend
var legend = L.control({position: 'topright'});

// 10. Function that runs when legend is added to map
legend.onAdd = function () {

    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b># of Airports per State</b><br />';
    div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.85"></i><p>26+</p>';
    div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.85"></i><p>16-25</p>';
    div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.85"></i><p>11-15</p>';
    div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.85"></i><p> 6-10</p>';
    div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.85"></i><p> 0-5</p>';
    div.innerHTML += '<hr><b>Control Tower at Airport</b><b><br />';
    div.innerHTML += '<i class="fa fa-fighter-jet marker-color-1"></i><p> Yes</p>';
    div.innerHTML += '<i class="fa fa-fighter-jet marker-color-2"></i><p> No</p>';
    // Return the Legend div containing the HTML content
    return div;
};

// 11. Add a legend to map
legend.addTo(mymap);

// 12. Add a scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(mymap);


// 13. Add a latlng graticules.
L.latlngGraticule({
    showLabel: true,
    opacity: 0.3,
    color: "#00bac3",
    zoomInterval: [
        {start: 2, end: 7, interval: 2},
        {start: 8, end: 11, interval: 0.5}
    ]
}).addTo(mymap);






// 16. create an addLabel function to dynamically update the visible labels, aiming to avoid the lable overlap.

function addLabel(layer, id) {

    // This is ugly but there is no getContainer method on the tooltip :(
    var label = layer.getTooltip()._source._tooltip._container;
    if (label) {
        // We need the bounding rectangle of the label itself
        var rect = label.getBoundingClientRect();

        // We convert the container coordinates (screen space) to Lat/lng
        var bottomLeft = mymap.containerPointToLatLng([rect.left, rect.bottom]);
        var topRight = mymap.containerPointToLatLng([rect.right, rect.top]);
        var boundingBox = {
            bottomLeft : [bottomLeft.lng, bottomLeft.lat],
            topRight   : [topRight.lng, topRight.lat]
        };

        // Ingest the label into labelgun itself
        labelEngine.ingestLabel(
            boundingBox,
            id,
            parseInt(Math.random() * (5 - 1) + 1), // Weight
            label,
            label.innerText,
            false
        );

        // If the label hasn't been added to the map already
        // add it and set the added flag to true
        if (!layer.added) {
            layer.addTo(mymap);
            layer.added = true;
        }
    }
}

// 17. We will update the visualization of the labels whenever you zoom the map.
mymap.on("zoomend", function(){
    var i = 0;
    states.eachLayer(function(label){
        addLabel(label, ++i);
    });
    labelEngine.update();
});


//If you're reading this, you've gone too far.
//   MM    MM      A     xx  xx    xx  xx   Y   Yy      BbOOo
//   M  M M  M    AAA      xx        xx       Yy   |==| BBaaTt
//   M   M   M   AA AA   xx   xx   xx  xx    yY         BBHHh  (.)
