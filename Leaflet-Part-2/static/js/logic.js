const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

function getColor(depth) {
    // Hex codes are from https://www.schemecolor.com/red-orange-green-gradient.php
    let color = ""
    if (depth < 10) {
        color = "#69B34C";
    }
    else if (depth < 30) {
        color = "#ACB334";
    }
    else if (depth < 50) {
        color = "#FAB733";
    }
    else if (depth < 70) {
        color = "#FF8E15";
    }
    else if (depth < 90) {
        color = "#FF4E11";
    }
    else {
        color = "#FF0D0D";
    }
    return color;
}

let circle = [];

d3.json(url).then(function(data){
    let features = data.features;
    for (let i=0; i < features.length; i++) {
        let earthquake = features[i];
        let coordinates = earthquake.geometry.coordinates;
        lon = coordinates[1];
        lat = coordinates[0];
        circle.push(L.circle([lon,lat], {
            color: "black",
            weight: 1,
            fillColor: getColor(coordinates[2]),
            fillOpacity: 0.75,
            radius: earthquake.properties.mag*10000
          }).bindPopup(`<h3>${earthquake.properties.place}</h3><hr><p>${new Date(earthquake.properties.time)}</p>`));
    } 
    // Followed example from leaflet website: https://leafletjs.com/examples/choropleth/
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function(myMap) {
        var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10,10,30,50,70,90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}

    return div;
};

  // Adding the legend to the map
  legend.addTo(myMap);
});

let circleLayer = L.layerGroup(circle);

let outdoors = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}', {
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

let gray = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

let baseMaps = {
    Satellite: satellite,
    Grayscale: gray,
    Outdoors: outdoors
};

let overlayMaps = {
    Earthquakes: circleLayer
};

let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [satellite, circleLayer]
  });

L.control.layers(baseMaps, overlayMaps).addTo(myMap);
