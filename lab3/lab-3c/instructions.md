# Lab 3c: Finalizing your data collection tool

## TGIS 504, Winter 2021, Dr. Emma Slager

### Introduction

Lab 3 is divided into three parts, each worth 20 points. The parts are divided as follows: 

1. In Part A, you built the front end of a map-centric mobile data collection tool, built on Leaflet and the Leaflet.draw plugin. 
2. In Part B, you built the back end database to store collected data, using a table-based, SQL compatible Carto database. You also updated the front end application to send data to the database.
3. In Part C (this week), you will refine the form used to collect non-spatial attribute data in the front end tool and finalize your application to meet the needs of a data collection scenario of your choice. 

At the end of Lab 3, you will have a map-centric, SQL-based data collection tool designed for a data collection scenario of your choice. 

*Template files*

* Your Lab 3B files, which you should save a copy of in a new Lab 3C folder. 

*Technology stack for Lab 3b*

* Atom or another text editor for editing files
* Leaflet & Leaflet.draw libraries
* Chrome or another web browser with developer tools (JS console)
* CARTO (web interface and SQL commands)

***Overview of part C of this lab***

The final step in completing your map-based data collection application is to build out the form used to collect non-spatial attributes to suit a data collection scenario of your choice. Rather than merely collecting a name and description of each feature the user draws on the map, you will now build a more complicated data collection form. 

The steps for achieving this are as follows: 

1. Define/refine your data collection scenario
2. Build out a conceptual and logical data model for the data you will collect, keeping in mind that they physical data model you will eventually employ will use CARTO for your database management. 
3. Create the form that you will use to collect the data
4. Create the table that will hold your data in CARTO
5. Update your JS, HTML, and SQL code to connect the form to the table

#### 3.1 Define/refine your data collection scenario

When we first began the unit on mobile data collection, the [week 3 reading response](https://canvas.uw.edu/courses/1441220/discussion_topics/5998837) asked you to identify a spatial data collection scenario for which field-based data collection would be helpful. If you completed that reading response, I encourage you to return to your post now to help with this task. If you did not complete that reading response, I encourage you to visit the prompt at the link above to read the example data collection scenarios to help you brainstorm an appropriate data collection scenario now. 

Write a paragraph explaining the data collection problem you are trying to solve. Why does data need to be collected for your topic? What spatial data (i.e. points, lines, or polygons) will the user be asked to collect? What non-spatial data (i.e. attributes) will the user be asked to collect? Submit this paragraph with your lab write-up. 

#### 3.2 Build out your data models

Once you've defined your data collection scenario, begin to brainstorm your logical data model. The task here is to move from the descriptive paragraph you wrote in 3.1 to sketching out (I suggest literally sketching this using pencil and paper) the question form *and* the data tables that you will build next. What questions will you ask, and how will you structure them (i.e. multiple choice, text entry, multi-checkboxes, etc.)? When you store the data, what columns will you need in your table, and what variable types should be stored in each column? 

You will build your form using HTML5, so keep in mind the [possible input types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) (in other words, the kinds of questions) you can solicit with your form.  You will store your table using CARTO, so keep in mind that the variable types for columns can be numeric, string, date, boolean, or geometry. 

You will not need to turn in the sketches/planning work you do here, but this work will shape the form that you eventually use in your map and which will be graded. 

#### 3.3 Build your form, using HTML

Next, use HTML to build a form that you will display in a popup, just as you did for the name and description fields in Lab 3A. I suggest building this as a standalone HTML file before adding it to your JavaScript code. For instance the HTML for the form you used in Lab 3A would look like this: 

```html
<form>
Description:<br><input type="text" id="input_desc"><br>
User's Name:<input type="text" id="input_name"><br>
<input type="button" value="Submit" id="submit">
</form>
```

But you added it to your JavaScript file like this: 

```Javascript
function createFormPopup() {
    var popupContent =
        '<form>' +
        'Description:<br><input type="text" id="input_desc"><br>' +
        'User\'s Name:<br><input type="text" id="input_name"><br>' +
        '<input type="button" value="Submit" id="submit">' +
        '</form>'
    drawnItems.bindPopup(popupContent).openPopup();
}
```

(Note that in the latter version, the each line of the HTML is enclosed in 'single quotes' with a `+` after each line to concatenate the code, and that the backslash is used to escape special characters, as in ```'User\'s Name'```, but we'll get to that later). 

If you save your form as a separate file---named, for instance, form.html---you'll be able to test its appearance by viewing the file in the browser as you work. We've reviewed the basics of HTML form construction in class already, but some resources that may help you as you do work on this are listed here: 

* [How to Structure a Web Form, from Mozilla](https://developer.mozilla.org/en-US/docs/Learn/Forms/How_to_structure_a_web_form)
* [HTML Forms, from W3 Schools](https://www.w3schools.com/html/html_forms.asp)
* Lists of HTML input types, from [W3 Schools](https://www.w3schools.com/html/html_form_input_types.asp) and from [Mozilla](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)

As you complete your form, remember that each input will need a unique `id`, as this is needed to send the data to the CARTO table. 

Once you have completed the HTML form, you must transpose it into JavaScript and add it to the variable named `popupContent` in your JS code. *Note: if you have not already saved a **copy** of your Lab 3B files in a new folder for Lab 3C, do so now before making changes to the JS code!*

To transpose the HTML into JS, copy the HTML code for your form (everything inside the `<form>` tags) into your JS, replacing the form you used in parts A & B of the lab (see comments in the code block below): 

```javascript
function createFormPopup() {
    var popupContent =
      //replace this block
        '<form>' +
        'Description:<br><input type="text" id="input_desc"><br>' +
        'User\'s Name:<br><input type="text" id="input_name"><br>' +
        '<input type="button" value="Submit" id="submit">' +
        '</form>'
     //but leave this part 
    drawnItems.bindPopup(popupContent).openPopup();
}
```

Then, enclose each line of the HTML code in quotes, adding a `+` at the end of each line, and using backslash `\` to escape characters as needed. 

*Note that there are ways to automate this transposition, and you are welcome to investigate and use them on your own, but this manual method should also work for now.*

Save your work and test your file to ensure that the form appears as expected when you finish drawing a shape. Your data will not be saved to the database yet, so note that you are just testing that the form appears as expected in this step.

#### 3.4 Create the table that will hold your data in CARTO

In this step, you will use the [CARTO](https://carto.com/) web interface to build a new table to hold the data for part C of the lab. Log in to your account and create a new dataset. You can do this by re-uploading the template file you used in Part B of the lab (template.geojson or template.csv), or by duplicating and renaming a table that already exists in your account. 

Set up your table with all the necessary columns to hold the data your form will collect. At a minimum, you will need: 

1. a 'cartodb_id' field, which should be automatically generated when you create the table
2. a 'the_geom' field to hold the geometry of each shape the user draws
3. a field for each input in your form. You must select the data type for this (number, string, data, or boolean), so ensure that it matches the data type collected by the given input. 

Ensure that your map's privacy settings are set to 'Public' or 'Public--with link' so that it can be accessed via the CARTO SQL API. 

#### 3.5 Update your JS code to connect the form to the table

In this step, you will update your JS file to connect the form to the table. Recall that there are a couple of places in the code that determine how the form and the table interact, both within the `setData(e)` function:

1. Where we select by element ID to get the values the user entered and store those values in variables. In Parts A & B, for instance, this looked something like this: 

   ```javascript
           var enteredUsername = document.getElementById("input_name").value;
           var enteredDescription = document.getElementById("input_desc").value;
   ```

2. Where we write the SQL expression that inserts data into the table. In Parts A & B, this looked something like this: 

   ```javascript
               var drawing = JSON.stringify(layer.toGeoJSON().geometry);
               var sql =
                   "INSERT INTO lab_3b_emma (the_geom, name, description) " +
                   "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                   drawing + "'), 4326), '" +
                   enteredUsername + "', '" +
                   enteredDescription + "')";
               console.log(sql);
   ```

Update each section of the code here to link your table to your form. This should involve the following:

* Creating a variable for each value that the user inputs and selecting by input ID to access those values. 
* Changing the table name and columns referenced in the `INSERT INTO` command to match the name of your newly created table and its columns
* Changing the variables in `INSERT INTO` command to match the variables that are holding the input values. 

Save your changes and test them in the browser. You should be able to draw a new shape, fill in the form, and post the data to CARTO without any errors being logged to the console. Using the CARTO web interface, check your table to see if the data was saved. 

Note, however, that the shapes the user draws are not persisting on the map. To fix that, we need to make three additional changes. First, toward the top of your code, update the variable `sqlQuery` so that it is selecting from the correct table (the exact name must match the name of the table you created in 3.3). You can use * to select all columns, or name just specific columns that you want to display, e.g.:

```javascript
var sqlQuery = "SELECT * FROM 3c_table_name";
```

Immediately below that line in the code, you should see a function named `addPopup`. This bit of code is pulling attributes from the GeoJSON that is exported from the CARTO table to display in each feature's popup. Change the content of that popup by pulling different properties that match the column names in your new table, e.g. replacing `feature.properties.name` and `feature.properties.description` in the example below with whatever properties you wish to display in your popups: 

``` javascript
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>" + feature.properties.name + "</b><br>" +
        feature.properties.description
    );
}
```

Finally, towards the bottom of your code (within the function named `setData`), you have a few lines of code that transfer any drawings the user has made in the current session to the layer called `cartoData` so that they persist on the map without the user having to refresh the page:  

```javascript
  var newData = layer.toGeoJSON();
    newData.properties.description = enteredDescription;
    newData.properties.name = enteredUsername;
    L.geoJSON(newData, {onEachFeature: addPopup}).addTo(cartoData);
```
Change the content of this code block so that it is also displaying the properties you want to show up in a popup, similar to what you changed in the `addPopup` function above. 

Save your changes and check your work, using the JavaScript console to help you trouble shoot any issues that arise. 

#### 3.6 Submission

Make any additional changes you wish to make to the map appearance (such as changing the initial zoom and view or changing the basemap tiles), and upload your completed map to GitHub. 

In your write-up, include a link to your map and a link to your CARTO table. Additionally, include the description of your data collection scenario that you wrote in step 3.1. 

As discussed in class, this is a new lab, and the instructions could likely use some improvement. I will award bonus points on a case by cases basis for good suggestions for how or where to improve the instructions in future years. You may include these suggestions in an additional section in your write-up. 