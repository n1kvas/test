let geojson;
let geojsonArray = [];
var close_panel_btn = document.getElementById("close_panel_btn");
close_panel_btn.addEventListener("click", function (e) {
    document.getElementById("left_pannel").classList.remove("open");
});

mapboxgl.accessToken = 'pk.eyJ1IjoibW9yaXR6bWV5ZXIiLCJhIjoiY2s3bDd5c2FhMDR4NDNrcG15cWtwc2xsMiJ9.TggF7vBKVIy7O3ufJxvuMQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v9',
    center: [133.5, -26],
    zoom: 3.5
});

let requestURL = 'https://ev-v2.cit.cc.api.here.com/ev/stations.json?app_id=DemoCredForAutomotiveAPI&app_code=JZlojTwKtPLbrQ9fEGznlA&maxresults=100000&bbox=';


/*let h = 0;
do {
    h++;
    if (h === 5);
    console.log(h);
} while (h < 10);*/

let latA = [];
let latB = [];
let longA = [];
let longB = [];

for (let lat = 112; lat <= 151; lat += 3) {
    latA.push(lat);
    latB.push(lat + 3);
    console.log("Array Longitude A: " + latA);
    console.log("Array Longitude B: " + latB);
};

for (let long = -10; long >= -43; long -= 3) {
    longA.push(long);
    longB.push(long + 3);
    console.log("Array Latitude A: " + longA);
    console.log("Array Latitude B: " + longB);
};


let index = ["-26,148;-29,151", "-29,148;-32,151", "-32,148;-35,151", "-26,151;-29,154", "-29,151;-32,154", "-32,151;-35,154"];


(function loop(i, length) {

    let request = new XMLHttpRequest();

    if (i >= length) {
        return;
    }
    var url = requestURL + longA[i] + "," + latA[i] + ";" + longB[i] + "," + latB[i];
    /*var url = requestURL + index[i];*/

    request.open("GET", url);
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            //console.log(JSON.stringify(data));
            loop(i + 1, length);
        }
    }

    request.responseType = 'json';
    request.send();

    request.onload = function () {
        var jsonFile = request.response;

        console.log(jsonFile.evStations);

        data.features = parseToGeojson(jsonFile.evStations.evStation);
        console.log(data);

        setTimeout(populateMap, 1000);
    }
})(0, index.length);

function parseToGeojson(jsonParam) {



    for (i = 0; i < jsonParam.length; i++) {

        var connectorType = ";"
        if (jsonParam[i].totalNumberOfConnectors == 0) {
            connectorType = "";
        } else {
            connectorType = jsonParam[i].connectors.connector[0].connectorType.name;
        }

        var streetNumber = ""
        if (jsonParam[i].address.streetNumber == null) {
            streetNumber = "";
        } else {
            streetNumber = jsonParam[i].address.streetNumber + ", "
        }

        var street = ""
        if (jsonParam[i].address.street == null) {
            street = "";
        } else {
            street = jsonParam[i].address.street + ", "
        }


        var feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [jsonParam[i].position.longitude, jsonParam[i].position.latitude]
            },
            "properties": {
                "id": jsonParam[i].id,
                "name": jsonParam[i].name,
                "totalNumberOfConnectors": jsonParam[i].totalNumberOfConnectors,
                "connector_type": connectorType,
                "address": streetNumber + street + jsonParam[i].address.city + ", " + jsonParam[i].address.postalCode,

            }
        }
        geojsonArray.push(feature);
    }

    return geojsonArray;
    // jsonParam.forEach(element => {
    //      console.log(element);
    // });
}

//var csv is the CSV file with headers
function csvJSON(csv) {
    var lines = csv.split("\n");

    var result = [];


    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;

        var obj = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    return result; //JavaScript object
    // return JSON.stringify(result); //JSON
}

function populateMap() {
    // map.on('load', function () {
    if (map) {
        // Add a geojson point source.
        // Heatmap layers also work with a vector tile source.
        map.addSource('earthquakes', {
            'type': 'geojson',
            'data': data
        });

        map.addLayer({
                'id': 'earthquakes-heat',
                'type': 'heatmap',
                'source': 'earthquakes',
                'maxzoom': 9,
                'paint': {
                    // Increase the heatmap weight based on frequency and property magnitude
                    'heatmap-weight': [
                            'interpolate',
                            ['linear'],
                            ['get', 'mag'],
                            0,
                            0,
                            6,
                            1
                        ],
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    'heatmap-intensity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0,
                            1,
                            9,
                            3
                        ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    'heatmap-color': [
                            'interpolate',
                            ['linear'],
                            ['heatmap-density'],
                            0,
                            'rgba(255,255,255,0)',
                            0.2,
                            'rgba(255,255,255,0.8)',
                            0.4,
                            'rgba(199,253,238,0.8)',
                            0.6,
                            'rgba(2,232,216,0.8)',
                            0.8,
                            'rgba(1,228,226,1)',
                            1,
                            'rgba(0,196,255,1)'
                        ],
                    // Adjust the heatmap radius by zoom level
                    'heatmap-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0,
                            2,
                            9,
                            20
                        ],
                    // Transition from heatmap to circle layer by zoom level
                    'heatmap-opacity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            7,
                            1,
                            9,
                            0
                        ]
                }
            },
            'waterway-label'
        );

        map.addLayer({
                'id': 'earthquakes-point',
                'type': 'circle',
                'source': 'earthquakes',
                'minzoom': 7,
                'paint': {
                    // Size circle radius by earthquake magnitude and zoom level
                    'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            7,
                            ['interpolate', ['linear'],
                                ['get', 'mag'], 1, 1, 6, 4
                            ],
                            16,
                            ['interpolate', ['linear'],
                                ['get', 'mag'], 1, 5, 6, 50
                            ]
                        ],
                    // Color circle by earthquake magnitude
                    'circle-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'mag'],
                            1,
                            'rgb(255,255,255)',
                            2,
                            'rgb(0,196,255)',
                            3,
                            'rgb(0,196,255)',
                            4,
                            'rgb(0,196,255)',
                            5,
                            'rgb(0,196,255)',
                            6,
                            'rgb(0,196,255)'
                        ],
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1,
                    // Transition from heatmap to circle layer by zoom level
                    'circle-opacity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            7,
                            0,
                            8,
                            1
                        ]
                }
            },
            'waterway-label'
        );

        map.on('click', 'earthquakes-point', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.name + "<br>" +
                e.features[0].properties.address + "<br>" +
                "<button id='" + e.features[0].properties.id + "'>More Info</button>";

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(description)
                .addTo(map);
        });

        // add markers to map

        // geojson.features.forEach(function (marker) {

        //     console.log(marker.geometry.coordinates);
        //     // add marker to map
        //     new mapboxgl.Marker()
        //         .setLngLat(marker.geometry.coordinates)
        //         // .setPopup(popup) // sets a popup on this marker
        //         .addTo(map);
        // });

        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            })
        );
        map.addControl(
            new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl
            })
        );

    };
}
