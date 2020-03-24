let geojson;
let geojsonArray = [];
mapboxgl.accessToken = 'pk.eyJ1IjoibnZhc2lsZXYiLCJhIjoiY2s3Yjd0d2VmMDBhYjNqbnBsN2VwYmhqNCJ9.LYk5UmK-RpoztjjX4X5Qnw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [153.1285, -27.7932],
    zoom: 6
});

let requestURL = 'https://ev-v2.cit.cc.api.here.com/ev/stations.json?app_id=DemoCredForAutomotiveAPI&app_code=JZlojTwKtPLbrQ9fEGznlA&prox=-28.085783,153.424930,200000';
// let requestURL = 'https://docs.google.com/spreadsheets/d/1YfQWUF_WyP-uPK0vaquT8SGR93IV83WbhneYJ4wRLZc/pub?output=csv';

let request = new XMLHttpRequest();

request.open('GET', requestURL);
request.responseType = 'json';
request.send();

request.onload = function () {
    jsonFile = request.response;
    // console.log(geojson);
    // var jsonFile = csvJSON(geojson);
    console.log(jsonFile.evStations.evStation);
    data.features = parseToGeojson(jsonFile.evStations.evStation);
    console.log(data);
    setTimeout(populateMap, 2500);
}

function parseToGeojson(jsonParam) {

    geojsonArray = [];

    for (i = 0; i < jsonParam.length; i++) {
        // if (isNaN(parseInt(jsonParam[i].LATITUDE)) ||
        //     isNaN(parseInt(jsonParam[i].LONGITUDE)) ||
        //     parseInt(jsonParam[i].LATITUDE) > 90 ||
        //     parseInt(jsonParam[i].LONGITUDE) > 180 ||
        //     jsonParam[i].LATITUDE == null ||
        //     jsonParam[i].LONGITUDE == null
        // ) {
        //     continue
        // }

        // console.log(jsonParam[i].LATITUDE + " , " + jsonParam[i].LONGITUDE );
        // console.log(jsonParam[i].ADDRESS );
        var connectorType = ";"
        if (jsonParam[i].totalNumberOfConnectors == 0) {
            connectorType = "";
        } else {
            connectorType = jsonParam[i].connectors.connector[0].connectorType.name;
        }

        var feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [jsonParam[i].position.longitude, jsonParam[i].position.latitude]
            },
            "properties": {
                "id": jsonParam[i].id,
                "totalNumberOfConnectors": jsonParam[i].totalNumberOfConnectors,
                "connector_type": connectorType,
                "address": jsonParam[i].address.streetNumber + ", " + jsonParam[i].address.street + ", " + jsonParam[i].address.city + ", " + jsonParam[i].address.postalCode,
                "type": ""
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

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)

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
                        'rgba(33,102,172,0)',
                        0.2,
                        'rgb(103,169,207)',
                        0.4,
                        'rgb(209,229,240)',
                        0.6,
                        'rgb(253,219,199)',
                        0.8,
                        'rgb(239,138,98)',
                        1,
                        'rgb(178,24,43)'
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
                        'rgba(33,102,172,0)',
                        2,
                        'rgb(103,169,207)',
                        3,
                        'rgb(209,229,240)',
                        4,
                        'rgb(253,219,199)',
                        5,
                        'rgb(239,138,98)',
                        6,
                        'rgb(178,24,43)'
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
            var description = e.features[0].properties.id + "<br>" +
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