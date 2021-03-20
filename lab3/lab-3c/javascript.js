var map = L.map('map').setView([47.25, -122.44], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYnJhbmRvbmNvdWNoOCIsImEiOiJja2h2NHNpcW4xaXJhMnhtanQ5NHp2ZWppIn0.SLSInhDEagBT3c0do7OQag'
}).addTo(map);

var drawnItems = L.featureGroup().addTo(map);

var cartoData = L.layerGroup().addTo(map);
var url = "https://brandoncouch8.carto.com/api/v2/sql";
var urlGeoJSON = url + "?format=GeoJSON&q=";
var sqlQuery = "SELECT * FROM lab_3c_brandon";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>" + feature.properties.name + "</b><br>" +
        feature.properties.type + "<br>" +
        feature.properties.description + "<br>" +
        feature.properties.dinein + "<br>" +
        feature.properties.drivethru + "<br>" +
        feature.properties.pickup + "<br>" +
        feature.properties.delivery + "<br>" +
        feature.properties.phone + "<br>" +
        feature.properties.website
    );
}

fetch(urlGeoJSON + sqlQuery)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {onEachFeature: addPopup}).addTo(cartoData);
    });

new L.Control.Draw({
    draw : {
        polygon : false,
        polyline : false,
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled
        circlemarker : false,  // Circle markers disabled
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);


alert("This map is for submitting info on local restaurants in Tacoma.\nTo submit a place, use the tools on the left side of the map to add a point on the map.\nWhen you have placed a point, enter the relevant info in the pop-up that appears and click \"Submit.\"");


function createFormPopup() {
    var popupContent =
      '<form method="post">' +
          '<h1>Enter Restaurant Info! </h1>' +
          '<p>Required fields are followed by <strong><abbr title="required">*</abbr></strong>.</p>' +
            '<section>' +
              '<p>' +
                '<label for="name">' +
                  '<span>Restaurant name: </span>' +
                  '<strong><abbr title="required">*</abbr></strong>' +
                '</label>' +
                '<br><input type="text" id="name" name="name">' +
              '</p>' +
              '<p>' +
                '<label for="type">' +
                  '<span>Food type:</span>' +
                  '<strong><abbr title="required">*</abbr></strong>' +
                '</label>' +
                '<select id="type" name="foodtype">' +
                  '<option value="burgers">Burgers</option>' +
                  '<option value="sandwiches">Sandwiches</option>' +
                  '<option value="pizza">Pizza</option>' +
                  '<option value="mexican">Mexican</option>' +
                  '<option value="asian">Asian</option>' +
                  '<option value="coffee">Coffee</option>' +
                  '<option value="bar">Bar</option>' +
                  '<option value="other">Other</option>' +
                '</select>' +
              '</p>' +
              '<p>' +
                '<label for="desc">' +
                  '<span>Give a brief description: </span>' +
                  '<strong><abbr title="required">*</abbr></strong>' +
                '</label>' +
                '<br><input type="text" id="desc" name="description">' +
              '</p>' +
            '</section>' +
              '<fieldset>' +
                '<legend>Dining options: </legend>' +
                '<ul>' +
                  '<li>' +
                    '<input type="hidden" id="dinein" name="dinein" value="false">' +
                    '<label for="dinein">' +
                      '<input type="checkbox" id="dinein" name="dinein" value="true">' +
                      'Dine-in' +
                    '</label>' +
                  '</li>' +
                  '<li>' +
                    '<input type="hidden" id="drivethru" name="drivethru" value="false">' +
                    '<label for="drivethru">' +
                      '<input type="checkbox" id="drivethru" name="drivethru" value="true">' +
                      'Drive-Through' +
                    '</label>' +
                  '</li>' +
                  '<li>' +
                    '<input type="hidden" id="pickup" name="pickup" value="false">' +
                    '<label for="pickup">' +
                      '<input type="checkbox" id="pickup" name="pickup" value="true">' +
                      'Pick-up' +
                    '</label>' +
                  '</li>' +
                  '<li>' +
                    '<input type="hidden" id="delivery" name="delivery" value="false">' +
                    '<label for="delivery">' +
                      '<input type="checkbox" id="delivery" name="delivery" value="true">' +
                      'Delivery' +
                    '</label>' +
                  '</li>' +
                '</ul>' +
              '</fieldset>' +
            '<section>' +
              '<p>' +
                '<label for="phone">' +
                  '<span>Phone number: </span>' +
                '</label>' +
                '<br><input type="text" id="phone" name="phone">' +
              '</p>' +
              '<p>' +
                '<label for="website">' +
                  '<span>Website: </span>' +
                '</label>' +
                '<br><input type="text" id="website" name="website">' +
              '</p>' +
            '</section>' +
          '<section>' +
              '<p> <input type="button" value="Submit" id="submit"> </p>' +
          '</section>' +
      '</form>'

    drawnItems.bindPopup(popupContent).openPopup();
}

map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    createFormPopup();
});

function setData(e) {

    if(e.target && e.target.id == "submit") {

        // Get user name and description
        var enteredName = document.getElementById("name").value;
        var enteredType = document.getElementById("type").value;
        var enteredDescription = document.getElementById("desc").value;
        var isDineIn = document.getElementById("dinein").value;
        var isDriveThru = document.getElementById("drivethru").value;
        var isPickUp = document.getElementById("pickup").value;
        var isDelivered = document.getElementById("delivery").value;
        var enteredPhone = document.getElementById("phone").value;
        var enteredWebsite = document.getElementById("website").value;

        // For each drawn layer
        drawnItems.eachLayer(function(layer) {

    			// Create SQL expression to insert layer
                var drawing = JSON.stringify(layer.toGeoJSON().geometry);
                var sql =
                    "INSERT INTO lab_3c_brandon (the_geom, name, type, description, dinein, drivethru, pickup, delivery, phone, website) " +
                    "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                    drawing + "'), 4326), '" +
                    enteredName + "', '" +
                    enteredType + "', '" +
                    enteredDescription + "', '" +
                    isDineIn + "', '" +
                    isDriveThru + "', '" +
                    isPickUp + "', '" +
                    isDelivered + "', '" +
                    enteredPhone + "', '" +
                    enteredWebsite + "')";
                console.log(sql);

                // Send the data
                fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: "q=" + encodeURI(sql)
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    console.log("Data saved:", data);
                })
                .catch(function(error) {
                    console.log("Problem saving the data:", error);
                });

            // Transfer submitted drawing to the CARTO layer
            //so it persists on the map without you having to refresh the page
            var newData = layer.toGeoJSON();
              newData.properties.name = enteredName;
              newData.properties.type = enteredType;
              newData.properties.description = enteredDescription;
              newData.properties.dinein = isDineIn;
              newData.properties.drivethru = isDriveThru;
              newData.properties.pickup = isPickUp;
              newData.properties.delivery = isDelivered;
              newData.properties.phone = enteredPhone;
              newData.properties.website = enteredWebsite;
            L.geoJSON(newData, {onEachFeature: addPopup}).addTo(cartoData);

        });

        // Clear drawn items layer
        drawnItems.closePopup();
        drawnItems.clearLayers();

    }
}

document.addEventListener("click", setData);

map.addEventListener("draw:editstart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:deletestart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:editstop", function(e) {
    drawnItems.openPopup();
});
map.addEventListener("draw:deletestop", function(e) {
    if(drawnItems.getLayers().length > 0) {
        drawnItems.openPopup();
    }
});
