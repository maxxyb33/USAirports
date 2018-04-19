# USAirports
US Airports 2nd trial
copy over from last time.  

code is this:
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Airports in Oregon</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.1/dist/leaflet.css"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css"/>
    <link href="https://fonts.googleapis.com/css?family=Titillium+Web" rel="stylesheet">
    <link href="css/main.css" rel="stylesheet" />
    <style>
        html, body, #map { width: 100%; height: 100%; margin: 0; background: #fff; }

        .legend {
            line-height: 16px;
            width: 140px;
            color: #333333;
            font-family: 'Titillium Web', sans-serif;
            padding: 6px 8px;
            background: white;
            background: rgba(255,255,255,0.9);
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
            border-radius: 5px;
        }

        .legend i {
            width: 16px;
            height: 16px;
            float: left;
            margin-right: 8px;
            opacity: 0.9;
        }

        .legend img {
            width: 16px;
            height: 16px;
            margin-right: 3px;
            float: left;
        }

        .legend p {
            font-size: 12px;
            line-height: 16px;
            margin: 0;
        }



        .alert {
            padding: 10px;
            background-color: #f4e200;
            color: black;
            font-family: 'UnifrakturMaguntia', 'Ranchers', 'Ewert', 'Elsie Swash Caps', 'Titillium Web', sans-serif;
            font-size: 15px
        }

        .closebtn {
            margin-left: 15px;
            color: red;
            font-weight: bold;
            float: right;
            font-size: 22px;
            line-height: 20px;
            cursor: pointer;
            transition: 0.3s;
        }

        .closebtn:hover {
            color: black;
        }


        .leaflet-tooltip.feature-label {
            background-color: transparent;
            border: transparent;
            box-shadow: none;
            font-weight: bold;
            font-size: 14px;
            font-family: 'UnifrakturMaguntia', 'Ranchers', 'Titillium Web', sans-serif;
            text-shadow: 0 0 2px #9f0016;
            color: rgb(255, 250, 197)
        }
    </style>
    <script src="https://unpkg.com/rbush@2.0.1/rbush.min.js"></script>
    <script src="https://unpkg.com/labelgun@6.0.0/lib/labelgun.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.3.1/dist/leaflet.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-ajax/2.1.0/leaflet.ajax.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/1.3.4/chroma.min.js"></script>
    <script type="text/javascript" src="https://cloudybay.github.io/leaflet.latlng-graticule/leaflet.latlng-graticule.js"></script>
</head>
<body>
<div class="alert">
    <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
    <strong>-.-.-.-.-.- Hey -- </strong> Don't forget about <b>Alaska</b> and <b>Hawaii</b> <small><i>(drag the map)</i></small>! They have airports too...and you probably <em>don't</em> want to put your boat in the water! -.-.-.-.-.-
</div>
<!-- Our web map and content will go here -->
<div id="map"></div>

<script>


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
    airports= L.geoJson.ajax("assets/airports.geojson", {
        // assign a function to the onEachFeature parameter of the cellTowers object.
        // Then each (point) feature will bind a popup window.
        // The content of the popup window is the value of `feature.properties.company`
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
    states = L.geoJson.ajax("assets/us-states.geojson", {
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


//problems with this lab: Uploading troubles, how to set up folders on github to organize as such, how do i get the damn thing up,
   // the lab wasnt much of a detailed walkthrough.constructor

</script>
</body>
</html>
