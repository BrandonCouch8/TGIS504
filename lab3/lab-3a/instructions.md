# Lab 3a: Leaflet.draw for front end mobile data collection

## TGIS 504, Winter 2021, Dr. Emma Slager

### Introduction

Lab 3 is divided into three parts, each worth 20 points. The parts are divided as follows: 

1. In Part A (this week), you will build the front end of a map-centric mobile data collection tool, built on Leaflet and the Leaflet.draw plugin. 
2. In Part B (next week), you will build the back end database to store collected data, using a table-based, SQL compatible Carto database. 
3. In Part C (two weeks), you will refine the form used to collect non-spatial attribute data in the front end tool using XLS Form. 

At the end of Lab 3, you will have a map-centric, SQL-based data collection tool designed for a data collection scenario of your choice. Parts A & B of this lab are based on [this collaborative mapping tutorial](http://132.72.155.230:3838/js/collaborative-mapping.html), with modifications by myself. 

*Technology stack for Lab 3a*

* Atom or another text editor for authoring files
* Leaflet libraries
* Leaflet.draw libraries
* Chrome or another web browser with developer tools (JS console)

#### 1.1 Set up the workspace and initialize the map

As usual, we'll start out by setting up a structure for the project. We need an HTML index, a JavaScript file, and a CSS file. You can download the templates from GitHub or create them yourself. To save you some time, I've already added the links to the Leaflet library to the head of the index, created a div to hold the map, and specified the height of that div in the CSS file. The index links to the JavaScript file, but the JS file is currently blank.

In the JavaScript file, initialize the map by adding the following code: 

```javascript
var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: '{Your Access Token Goes Here}'
}).addTo(map);
```

Be sure to put your Mapbox access token in the correct spot if you want to use Mapbox basemap imagery, or change your basemap tiles to another tile source if you wish. 

The map is currently centered and zoomed in on London. This is fine for now. 

#### 1.2 Add the drawing control

The first thing we need for our data collection tool is an editing tool bar that will allow us to add vector data to the map. This is similar to the editing toolbar you are likely familiar with in ArcMap, which you might use to digitize building footprints from a georeferenced aerial image. Using the toolbar, contributors will draw shapes on the map, which will late be submitted and stored to a database. To add this editing toolbar, we will use the [Leaflet.draw](https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html) plugin, which is a well maintained plugin for Leaflet that Leaflet itself highly recommends. 

Start by including links to the plugin's libraries in the ```head``` of your index. As usual, we'll load these files from a CDN:

```html
<!-- Leaflet.draw links -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js" integrity="sha512-ozq8xQKq6urvuU6jNgkfqAmT7jKN2XumbrX1JiB3TnF7tI48DPI4Gy1GXKD/V3EExgAs1V+pRO7vwtS1LHg0Gw==" crossorigin="anonymous"></script>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css" integrity="sha512-gc3xjCmIy673V6MyOAZhIW93xhM9ei1I+gLbmFjUHIjocENRsLX/QUE1htk5q1XV2D/iie/VQ8DXI6Vu8bexvQ==" crossorigin="anonymous" />
```

Next, we need to create an editable layer on the map. This will be empty for now, but before we can add shapes to the map, they'll need somewhere to go. Add the following to your JavaScript code, below where you initialize the map: 

```javascript
var drawnItems = L.featureGroup().addTo(map);
```

The editable layer is a [Feature Group](https://leafletjs.com/reference-1.6.0.html#featuregroup) object. This is a familiar object by now, but as a reminder, it is used to combine several layers into one object, which makes it easier to do things like clear the map of all layers of a given type. We have named the editable layer drawnItems, which is a variable name we will reference it by later. 

Next, we'll add the drawing control itself by adding the following code below the declaration of ```drawnItems```: 

```javascript
new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    }
}).addTo(map);
```

Save your changes and preview them in the browser. You should see a new control menu added to the top-left corner of the map. The first set of options allows you to draw different shapes--line, polygon, rectangle, circle, etc.--and the second set allows you to edit or delete a shape. Try drawing shapes with the tools. You should notice that after a shape is finished, it immediately disappears. However, what we usually want instead is for the drawn shape to persist on the map. To achieve this, we'll add an even listener that triggers a function to add the shape as a layer to the ```drawnItems``` feature group. Add this code at the bottom of your JavaScript file: 

```javascript
map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
});
```

The ```draw:created``` [event is part of the Leaflet.draw library](https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html#l-draw-event). The object that is created when it fires contains a property called 'layer' that contains the newly drawn shape. We use the code above to add that layer to the feature group ```drawnItems```. Now the shape will persist on the map. Because we made the feature group editable when we initialized the drawing control, you can now use the 'edit layers' button and the 'delete layers' button to adjust the location or vertices of your shape or delete it altogether. Save your changes and try this out in the browser. 

#### 1.3 Working with drawn items

##### 1.3.1 Printing drawnItems to the console

Now that you can draw items and add them to a feature group so that they persist on the map, the next step is to see how we can do something more with drawn shapes. Eventually, you will send the shapes to a database to be stored and accessed later, but for now, we'll use ```console.log``` to print the geometry of the shapes to the console so we can inspect them. 

To print the GeoJSON of the drawn shapes, we will modify the ```draw:created``` event listener. Replace the three lines of code for that event listener with this expanded version: 

```javascript
map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    drawnItems.eachLayer(function(layer) {
        var geojson = JSON.stringify(layer.toGeoJSON().geometry);
        console.log(geojson);
    });
});
```

The new part of the code here is the second internal expression, starting with ```drawnItems.eachLayer```. The ```.eachLayer``` method of the feature group is a convenient way of iterating so that the specified function is applied to each layer in the feature group. This should be familiar to you from our work on conditional styling in Fall Quarter when we used ```.forEach``` to style features in a layer, for instance. Inside the function that is applied on each layer, there are two expressions: 

```javascript
        var geojson = JSON.stringify(layer.toGeoJSON().geometry);
        console.log(geojson);
```

These two expressions actually do a lot: 

* Converting the current ```layer``` to GeoJSON with the ```.toGeoJSON``` method
* Selecting just the ```geometry``` property of the GeoJSON, using ```.geometry```
* Applying the ```JSON.stringify ``` function (a method built into JavaScript; documentation [here](https://www.w3schools.com/js/js_json_stringify.asp))  to convert the the GeoJSON geometry object to a string. 
* Printing the string with ```console.log```

Save your changes and open your work in the browser. Open developer tools to view the JavaScript console. Draw several shapes and inspect the output that is printed to the console. If you want, you can delete the ```.geometry``` portion of the code to see how that changes what is printed. Just be sure to add the ```.geometry``` portion of the code back in before moving on to the next step. 

##### 1.3.2 Simplifying the drawing controls

In the browser, use the drawing controls to add a marker, circle, and a circle marker to the map. Closely examine the geometry of the three shapes that is printed to the console. You should notice that the "type" of all three shapes is listed as "Point" geometry. You may remember from close readings of the Leaflet documentation in Fall Quarter that the geometry of a circle marker includes one pair of coordinates for the center of the circle and a radius specified in pixels. (A circle is the same, but whereas the circleMarker has a default radius of 10 pixels, the L.circle object has no default radius.)

With the `.toGeoJSON()` method, then, markers, circles, and circle markers all become `"Point"` geometries when converted to GeoJSON, where the original radius is not being kept for circles and circle markers. Similarly, rectangles and polygons are both recorded simply as `"Polygon"` geometries. 

For simplicity and consistency with the GeoJSON format, which we are going to use to record drawn shapes and send them to the database in Part 2 of the lab, it therefore makes sense to only allow drawing of three shape types: 

* lines, which will be converted to "LineString" GeoJSON
* polygons, which will be converted to "Polygon" GeoJSON
* markers, which will be converted to "Point" GeoJSON

Back in your JavaScript file, replace the section of the code that initializes the draw control with the following: 

```javascript
new L.Control.Draw({
    draw : {
        polygon : true,
        polyline : true,
        rectangle : false,     // Rectangles disabled
        circle : false,        // Circles disabled 
        circlemarker : false,  // Circle markers disabled
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);
```

Save your changes and preview in the browser. Your drawing control should now have just three options: line, polygon, and point. 

#### 1.4 Collecting attribute data with a form

In addition to shape geometry, a data collection tool usually collects non-spatial attribute data too, as you well know from prior labs with Survey123 and Collector for ArcGIS. To allow us to collect attribute data, we will use a simple [HTML form](https://www.w3schools.com/html/html_forms.asp) that allows the user to enter a description of the shape they drew and the contributor's name. The description and name entered by the user will eventually be sent to the database as non-spatial attributes, together with the GeoJSON representing the drawn geometry. 

Our submission form will reside in a popup, conveniently appearing on top of the drawn shape once it is finished. The form contents will be defined with HTML code that we will wrap in a function called `createFormPopup` that binds and opens a popup with an editable form. **Add** the following function to your JavaScript code below the part of the code that initializes the draw control and **change** the `map.addEventListener` part of the code as follows:

```javascript
function createFormPopup() {
    var popupContent = 
        '<form>' + 
        'Description:<br><input type="text" id="input_desc"><br>' +
        'User\'s Name:<br><input type="text" id="input_name"><br>' +
        '<input type="button" value="Submit" id="submit">' + 
        '</form>'
    drawnItems.bindPopup(popupContent).openPopup();
}

map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    createFormPopup();
});
```

Note that the content inside the `popupContent` variable is HTML, just like any of the popup content you've written so far. The `<form>` element is an HTML element just like any other (like `<p>` or `<h1>`), and the `<input>` elements inside of the form include a `"text"` input for the description, a second `"text"` input for the contributor's name, and a `"button"` input that we will attach an event listener to. 

We've gone over this before, but I also want to draw your attention to the \ in `'User\'s Name:` Because we've used single quotes in defining the HTML content, the page interprets the apostrophe in "User's" as a closing single quote. We use the backslash to "escape" the character that follows the backslash. This turns the special character (the single quote) into a string (understandable as an apostrophe). See the 'Escape Character' heading on [this page](https://www.w3schools.com/js/js_strings.asp) for more information. 

Save your changes and view them in the browser. Draw a shape to see what happens. We are no longer printing the shape geometry to the console, but now, when you finish drawing a shape, a popup appears containing the form. You can enter values in the form's text inputs and click the submit button, but nothing will happen until we attach the event listener to the submit button and define a function to run when it is clicked. 

Next, let's write that function, which we will call `setData`. Add to the bottom of your JavaScript file: 

```javascript
function setData(e) {

    if(e.target && e.target.id == "submit") {

        // Get user name and description
        var enteredUsername = document.getElementById("input_name").value;
        var enteredDescription = document.getElementById("input_desc").value;

        // Print user name and description
        console.log(enteredUsername);
        console.log(enteredDescription);

        // Get and print GeoJSON for each drawn layer
        drawnItems.eachLayer(function(layer) {
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            console.log(drawing);
        });

        // Clear drawn items layer
        drawnItems.closePopup();
        drawnItems.clearLayers();

    }
}
```

The `setData` function collects the user entered information into three variables and, for now, prints them to the console: 

* `enteredUsername`: the text input from the `#input_name` field of the popup
* `enteredDescription`: the text input from the `#input_desc` field of the popup
* `drawing`: the geometry of each drawn shape, as GeoJSON

The first two inputs, `enteredUsername` and `enteredDescription`, are extracted from the text input area using the `.value` property. The `drawing` variable is created a little differently, inside an `.eachLayer` iteration. Using an iteration is essential, since the `drawnItems` feature group may contain more than one layer in case the user has drawn more than one shape. In such case, each layer is converted into a separate GeoJSON and separately printed in the console. 

Finally, add an event listener to the end of your JavaScript code so that when the submit button is clicked, the `setData` function will run: 

```javascript
document.addEventListener("click", setData);
```

Note that the event listener is binded to the *document* rather than to the “submit” button. The reason is that the popup is a dynamic element. For instance, the popup may be closed and re-opened when the layer is being edited. As a result, the event listener would have to be binded each time the popup re-appears. The solution here is different, relying on a mechanism known as [event delegation](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_delegation). This is related to the `if` statement that opens the `setData` function: 

```
if(e.target && e.target.id == "submit") {...}
```

The part `e.target && e.target.id == "submit"` means “check if `e.target` exists, and if it does check if its `id` is equal to `"submit"`. Since the event listener is binded to the `document`, it persists even if the popup is closed (or even if it was not created yet). However, the event listener is not triggered by any click in the `document`, but only by clicks on the "submit" button.

Save your changes and test the results in the browser. As the user, you can draw one or more shapes with the drawing control. Each time a shape is drawn, a popup with the *name* and *description* text inputs is opened. Once the user decides to click “submit”, the name and description, as well as each GeoJSON for the drawn shapes, are printed in the console. Finally, the popup is closed, and the layer is removed from the map using the `.closePopup` and `.clearLayers` methods in the last two expressions.

#### 1.5 Fine-tuning the popup behavior based on drawing events

One minor inconvenience is that the submission popup remains open while entering the “edit” or “delete” modes. This is counter-intuitive, as we should not submit the drawing while still editing it and making changes. The following code binds a few additional event listeners to close the popup when the user enters the “edit” or “delete” modes, and re-open it when done editing or deleting. This is accomplished using `"draw:editstart"`, `"draw:deletestart"` event listeners combined with the `.openPopup` method on the one hand, and the `"draw:editstop"` and `"draw:deletestop"` event listeners combined with the `.closePopup` methods on the other hand.

As you can see in the code section that follows, the `"draw:deletestop"` event listener is slightly more complex: its internal code contains a conditional for checking whether the user has deleted *all* of the drawn shapes. In the latter case, running `drawnItems.openPopup()` would cause an error, since there are no layers to open the popup on. Therefore, a conditional is first being evaluated to verify that at least one layer remains when the user is done deleting. If there is at least one layer—the editable popup will open. If there are no layers left—nothing will happen; the user will see an empty map where they can draw new shapes once more.

Enter the following code to the bottom of your JavaScript file: 

```javascript
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
```

Save your changes and open in the browser. Open the JavaScript console. Test your work by drawing shapes in the map, entering data in the form, and clicking the "submit" button. Inspect the outputs printed to the console. Draw some more shapes and before clicking submit and without closing the popup manually, try editing or deleting some of them. The popup should close when you begin edits and then open again when you finish. When you press "submit" once more, the output printed to the console should reflect the up-to-date shape geometry. 

#### 1.6 Final edits and submission

For now, your attribute data collection form is very simple, just collecting two text inputs from the user--name and description. In Part C of this lab, you'll build that out in much greater depth to fit a data collection scenario of your choosing (remember Reading Response 3? We're finally circling back to that.) For now, we'll keep it simple, but I still want to you to implement some changes to the front-end of your tool to demonstrate your mastery of these concepts. To that end, I want you to tailor your map so that it could be used by people in your hometown to record their favorite places in town. Make the following adjustments: 

1. Change the default view and zoom to be appropriate for your hometown (or, if you feel you don't have a single hometown, to whatever place you wish to focus on).
2. Add a bit of explanatory text (in an alert window, on an about page that you link to, or using some other layout of your choice) explaining to users of the map what the goal of the map is and how to use it. 
3. Remove the line option from the draw control so that users can only submit polygons or points. 
4. Modify the input fields on your form to collect a title for the point or polygon, rather than a username. Order your inputs so that the user enters the title before they enter the description. 

*Some additional notes:* 

* Until you set up a database to store the submitted data, the data will not persist on the map. That is OK for now! We'll fix this issue in Part B next week. 
* You may add additional fields or default values to your form if you wish. For more on how to create and edit HTML forms, see this page: https://www.w3schools.com/html/html_forms.asp.
* You may change the basemap or make other changes to the design of the page if you wish. If you make design changes, keep in mind the best practices for mobile web design from the [Ricker and Roth reading](https://gistbok.ucgis.org/bok-topics/mobile-maps-and-responsive-design). 
* Bonus points may be awarded for particularly effective designs and/or forms. 

##### Submission

Upload your completed map to GitHub and submit a link to your work on Canvas. There is no write-up for Lab 3a. 
