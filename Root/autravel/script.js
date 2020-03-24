// window.onload = function () {

//initialise variables
var close_panel_btn = document.getElementById("close_panel_btn");
close_panel_btn.addEventListener("click", function (e) {
    document.getElementById("left_pannel").classList.remove("open");
});


L.mapbox.accessToken = 'pk.eyJ1IjoiZGF5bmFhaXNsaW5uIiwiYSI6ImNrN3drYW1tcDAzMmEzbHRkNGIyOXdsZTIifQ.ggu68pUfWSjW3CwfyYRBWQ';
// var map = new mapboxgl.Map({
//     container: 'map', // container id
//     style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
//     center: [133.905445, -27.677475], // starting position [lng, lat]
//     zoom: 4 // starting zoom
// });

// example origin and destination
var start = {
    lat: -28.003322,
    lng: 153.431280
};
var finish = {
    lat: -30.302492,
    lng: 153.138318
};


var map = L.mapbox.map('map', 'mapbox.streets', {
    zoomControl: false
}).setView([-27.677475, 133.905445], 5);

L.marker([start.lat, start.lng]).addTo(map);
L.marker([finish.lat, finish.lng]).addTo(map);

var markersClasses = document.getElementsByClassName("leaflet-marker-icon");
console.log(markersClasses);
for (i = 0; i < markersClasses.length; i++) {
    markersClasses[i].addEventListener("click", function () {
        document.getElementById("left_pannel").classList.add("open");
    });
}

map.attributionControl.setPosition('bottomleft');

var directions = L.mapbox.directions();

// Set the origin and destination for the direction and call the routing service
directions.setOrigin(L.latLng(start.lat, start.lng));
directions.setDestination(L.latLng(finish.lat, finish.lng));
directions.query();

var directionsLayer = L.mapbox.directions.layer(directions).addTo(map);
var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions)
    .addTo(map);

// }