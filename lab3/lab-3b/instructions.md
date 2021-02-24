# Lab 3b: Carto and SQL for back end mobile data collection

## TGIS 504, Winter 2021, Dr. Emma Slager

### Introduction

Lab 3 is divided into three parts, each worth 20 points. The parts are divided as follows: 

1. In Part A (last week), you built the front end of a map-centric mobile data collection tool, built on Leaflet and the Leaflet.draw plugin. 
2. In Part B (this week), you will build the back end database to store collected data, using a table-based, SQL compatible Carto database. You will also update the front end application to send data to the database.
3. In Part C (next week), you will refine the form used to collect non-spatial attribute data in the front end tool using XLS Form. 

At the end of Lab 3, you will have a map-centric, SQL-based data collection tool designed for a data collection scenario of your choice. 

*Template files*

* **lab_3b_template.geojson**, which we will use to create our CARTO table. Download this from GitHub by pulling the latest commit from the TGIS504_Wi2021 repository, which you have hopefully already cloned, to your computer using GitHub Desktop. 
* Your Lab 3A files, which you should save a copy of in a new Lab 3B folder. 

*Technology stack for Lab 3b*

* Atom or another text editor for editing files
* Leaflet & Leaflet.draw libraries
* Chrome or another web browser with developer tools (JS console)
* CARTO (web interface and SQL commands)

#### 2.1 Working with CARTO

In Part A of this lab, you set up a data collection tool that allowed users to draw shapes on a map using Leaflet.draw and entered attribute data for those shapes using an HTML form. However, the drawn layers were not stored anywhere, just printed to the console. In addition to an input interface, to have a functional data collection tool, we also need a permanent storage location and a mechanism for writing user input to that location. In this part of the lab, therefore, you will set up and configure a database to store user-submitted information so that it can be retrieved, displayed, and analyzed at a later time. 

The first step in achieving this is to set up the permanent storage location for the data. We will build a relational database using [CARTO](https://carto.com/), which means that what we need is an (empty) table in our database that contains columns and data types according to the data we intend to collect. 

In this week's reading, you learned about the CARTO platform and read a bit about SQL queries for spatial databases. Here in step 2.1 we'll set up a new table in CARTO and practice running some SQL queries. 

If you haven't already, sign up for a CARTO account using the [CARTO for Students](https://carto.com/help/getting-started/student-accounts/) process. This will give you free access to CARTO for two years. If you have trouble with CARTO for Students for any reason (for instance, if you do not receive verification through the GitHub Education Pack in a timely manner), you may sign up for the [12-month trial here](https://carto.com/signup/), but that should be used only as a backup option. Once you've signed up for an account, log in and visit your dashboard. 

Click the 'Data' button on the top ribbon. Click 'New Dataset', and you will be given an option to connect to a local file, a database, a cloud file, or another file. Click the GeoJSON option under 'Local files'. Use the 'Browse' button or drag & drop to upload the lab_3b_template.geojson file to your CARTO account. Click 'Connect Dataset.'

You should see a blank table with just two columns, 'cartodb_id' with data type 'number' and 'the_geom' of data type 'geometry'. Next, we'll modify the table using both the GUI and SQL commands. 

##### 2.1.1. Modify the CARTO table

First, let's add a couple of additional columns, one called 'name' and one called 'description'. These will hold the name and description attributes that your user can set with the Leaflet.draw interface you made in Part A of the lab. 

Click the 'Add column' button in the upper right corner of the table, and use the interface to change the name of the column to 'name', making sure it has type 'string'.

Add the second column using SQL commands instead of the GUI. In the bottom left corner of the screen, toggle from 'Metadata' to 'SQL'. This should open an SQL window that looks like this: 

![screenshot of SQL window](images/image1.png)

Here we can type SQL queries to modify the table, achieving tasks like adding columns, adding or removing data, or display portions of the data that meet certain criteria. To test this out, change the SQL query from the default text shown in the screenshot above to the following: 

```SQL
SELECT the_geom FROM lab_3b_template
```

Click 'Apply' to run the command. Instead of seeing all of the columns in the table, you should just see the column called 'the_geom'. Click 'Clear'.

The general SQL syntax to add a column to a table is:

ALTER TABLE *table_name*
ADD *column_name datatype*;

To add a column to hold the description attribute, we will use that code, substituting in the name of our table and the name we want to give the new column, and specifying the correct data type. Copy or type the following command into the text box and click 'Apply':

```SQL
ALTER TABLE lab_3b_template
ADD description text;
```

You should see the new column appear, but in certain browsers, the CARTO interface can be a bit glitchy. If the new column does not appear, try refreshing the page, or clicking 'Add column' to get it to show up. (If you add a column, be sure to delete it using the three-dot menu next to the column header before continuing.)

Note that although the CARTO interface lists the data type for the new columns as 'string', the keyword in SQL syntax is 'text'. These are synonyms, and both are familiar to you by now, but I wanted to make sure you take note of it in case you try adding other string/text columns with SQL in the future. 

Next, let's rename the table. Click the three dots next to the table name and change the name to 'lab_3b_[yourname]' changing '[yourname] to your first name, without the square brackets. Click 'OK, rename it' to confirm the change.

For the curious, you can also use the following SQL command to change a table's name, but because of the aforementioned glitchiness, in this case I recommend using the GUI: 

```SQL
ALTER TABLE table_name
RENAME TO new_table_name;
```

Finally, update the privacy settings on your table so that we can access it later. Click the 'PRIVATE' button and change the security settings to 'Public -- with link'. Click 'OK' to confirm the change. 

##### 2.1.2. Add data to the table

Before we add data to the table using the Leaflet.draw interface, let's first add some sample data using an SQL command. Let's add a point at the location of the UWT campus, giving it the name 'UW Tacoma' and the description 'A beautiful, urban campus in Tacoma, WA, the City of Destiny'. We can use the SQL ```INSERT INTO``` and ```VALUES``` keywords for inserting new data, as shown in the query below (note that I am using the name of my table, but you will have to change this so that it matches the name of *your* table):

```SQL
INSERT INTO lab_3b_emma (the_geom, name, description) VALUES (
  ST_SetSRID(
    ST_GeomFromGeoJSON(
      '{"type":"Point","coordinates":[-122.4383461, 47.2449897]}'
    ), 
  4326
  ),
  'UW Tacoma', 
  'A beautiful, urban campus in Tacoma, WA, the City of Destiny'
);
```

After changing the name of the table in the first line of the query to match *your* table's name, click 'Apply' and view the change. The result should look like the following: 

![screenshot of updated table with new row](images/image2.png)

The query looks quite long and complex, so let's walk through it. Note first that the high-level structure used to specify the column names and values to insert looks like this: 

```SQL
INSERT INTO table_name (..., ..., ...) VALUES (..., ..., ...);
```

The first three ```...``` symbols are replaced with the column names where the values go into. The second set of `...` symbols are replaced with the values themselves. Note that the order of the column names needs to match the order of the values, so that the correct value will be inserted into the correct column. In the present example, the ordering of the first triplet (the column names `the_geom`, `name`, and `description`) matches the order of the second triplet after the `VALUES` keyword (the geometry, `'UW Tacoma'`, and `'A beautiful, urban campus in Tacoma, WA, the City of Destiny'`). 

To create the geometry value that goes into the `the_geom` column, the query makes use a function, `ST_GeomFromGeoJSON`. This function converts GeoJSON syntax (`{"type":"Point","coordinates":[-122.4383461, 47.2449897]}` in our example) into what is called Well-Known Binary, or WKB. This is a form of compression that reduces the required storage space for the database. If we were to look at the raw value that is stored for this value, instead of the long string of GeoJSON, we would see instead `010100000011f5ccdc0d9c5ec0adad8ed25b9f4740`. Note that CARTO uses an additional transformation, however, to display the geometry not in WKB but in WKT, or Well-Known Text, as `POINT(-122.4383461 47.2449897)`, which is conveniently human-readable. To explore these three formats further and convert between them, see [this online tool](https://rodic.fr/blog/online-conversion-between-geometric-formats/). 

In addition to converting GeoJSON to WKB, the query uses the `ST_SetSRID` function to specify that the GeoJSON coordinates are in lng/lat, and that they use WGS 84 coordinate reference system. The SRID in `ST_SetSRID` stands for 'spatial reference ID', and it uses the EPSG code `4326` to specify that the SRID is WGS 84. The EPSG system is a public registry of geodetic datums and spatial reference systems, which can all be referred to with a numeric code. For more about the EPSG system, see [this Wikipedia entry](https://en.wikipedia.org/wiki/EPSG_Geodetic_Parameter_Dataset). 

##### 2.1.3. (optional) Add additional columns to represent additional attribute fields

If the form you created in Part A of the lab to collect non-spatial attributes included any additional data fields, add columns to hold the values for those fields to your table now. You may use either the GUI or test yourself by writing an SQL command to achieve this. (If you only included the 'name' and 'description' fields in your form, you can move on to the next step.)

#### 2.2 Using the CARTO SQL API

To utilize our CARTO database with the data collection tool we built with Leaflet, we will use the [CARTO SQL API](https://carto.com/developers/sql-api/). This API allows for communication between a program that understands HTTP (such as a web browser), and database hosted on the CARTO platform. The API allows us to send SQL queries to the database via HTTP using a URL that includes the CARTO user name and the SQL query. The CARTO server processes the request and returns the data that is requested by the query in a format of choice, such as CSV, JSON, or GeoJSON. Because the API uses HTTP to send and receive data, we can send requests to the database--and get responses--using client-side JavaScript code. 

The basic URL structure for sending a request to the CARTO SQL API looks like this: 

```
https://CARTO_USERNAME.carto.com/api/v2/sql?format=FORMAT&q=SQL_STATEMENT
```

where:

- `CARTO_USERNAME` should be replaced with your CARTO **user name**
- `FORMAT` should be replaced with the required **format**
- `SQL_STATEMENT` should be replaced with the SQL **query**

For example, here is a specific query:

```
https://ejeans.carto.com/api/v2/sql?format=GeoJSON&q=
SELECT * FROM lab_3b_emma
```

where:

- `CARTO_USERNAME` was replaced with `ejeans`
- `FORMAT` was replaced with `GeoJSON`
- `SQL_STATEMENT` was replaced with a `SELECT` statement that returns all of the records in the table named `lab_3b_emma`

Based on the data that is currently in the table, the data that would be returned from this call would be the following GeoJSON content: 

```JSON
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-122.4383461, 47.244989]
      },
      "properties": {
        "name": "UW Tacoma",
        "description": "A beautiful, urban campus in Tacoma, WA, the City of Destiny"
      }
    }
  ]
}
```

<!--It's important to note that whenever we export the result of the query in a spatial format (such as `format=GeoJSON`), the geometry column (`the_geom` in this case) must appear in the query. Otherwise, the server cannot generate the geometric part of the layer, and we get an error. For instance, if instead of selecting `*` from the table, we selected only the columns `name` and `description` using the following API call--

```
https://ejeans.carto.com/api/v2/sql?format=GeoJSON&q=
SELECT name, description FROM lab_3b_emma
```

the result would be the following error message, instead of the requested GeoJSON: 

```json
{"error":["column \"the_geom\" does not exist"]}
```

If we wanted *only* non-geographic attribute data to be returned, we could run the API call without specifying any format, and then the result would be returned in default JSON. For example, 

```
https://ejeans.carto.com/api/v2/sql?&q=
SELECT name, description FROM lab_3b_emma
```

would return: 

```json
{"rows":[{"name":"UW Tacoma","description":"A beautiful, urban campus in Tacoma, WA, the City of Destiny"}],"time":0.008,"fields":{"name":{"type":"string","pgtype":"text"},"description":{"type":"string","pgtype":"text"}},"total_rows":1}
```
-->

Because the returned file is in GeoJSON format, we can import it into a Leaflet map quite easily. In the next step, we'll use a call to the CARTO SQL API to display data on our map. 

#### 2.3 Displaying data from CARTO in Leaflet

In your file manager (Windows file explorer or MacOS Finder, depending on your operating system), copy the files that you submitted for Lab 3, Part A into a new folder for Lab 3, Part B. These will be your starter files for this part of the lab, but you'll save them as a copy in a new location rather than overwriting your old files. 

In Atom, open the Project Folder for your newly copied files, and open the JavaScript file. Take a moment to re-familiarize yourself with the code that you wrote here last week. From top to bottom, it should achieve the following: 

* initialize a map, set the default view and base map tile layer
* create an editable feature group named `drawnItems`
* instantiate a control that allows the user to draw shapes on the map
* create a function that opens a form within a popup on any shape the user draws and add an event listener to open that popup when the shape is completed
* create a function that saves data of the shape's geometry and attributes entered into the form. This data is currently printed to the console when the event listener tied to the 'submit' button on the form is triggered. 
* add a series of event listeners to control the behavior of the popup when a shape is being edited. 

The first change we will make to the existing code will be to add previously drawn shapes that are stored in the CARTO table to the map. Under the line of code where you declare the `drawnItems` variable and before where you instantiate the Leaflet.draw control (`new L.Control.Draw...`), add the following: 

```javascript
var cartoData = L.layerGroup().addTo(map);
var url = "https://ejeans.carto.com/api/v2/sql";
var urlGeoJSON = url + "?format=GeoJSON&q=";
var sqlQuery = "SELECT the_geom, description, name FROM lab_3b_emma";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>" + feature.properties.name + "</b><br>" +
        feature.properties.description
    );
}

fetch(urlGeoJSON + sqlQuery)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {onEachFeature: addPopup}).addTo(cartoData);
    });
```

This code does a few things. Let's look first at the top chunk of code. Here we declare a variable named `cartoData` to hold the data already in the CARTO table (as a layer group) and we add it to the map. Next we create variables called `url`, `urlGeoJSON` and `sqlQuery` to hold portions of the CARTO SQL API call, which we'll use in a moment. We don't have to store these as variables, but breaking the API call up like this makes it easy to understand and modify different parts of the call to adjust what we request from CARTO. Finally, we write a function to bind a popup to the features that will be displayed from the CARTO data. Note that the popup for each of the loaded features displays the `name` and the `description` properties, which the user will enter in the popup form when submitting drawn shapes. 

Next let's look at the second chunk of code. This uses a method that is likely new to you, namely `fetch`. 

![Mean Girls fetch gif](https://media3.giphy.com/media/G6ojXggFcXWCs/giphy.gif)

Fetch is an HTML 5 API used for loading resources asynchronously in the web page. In this sense, it is very similar to the AJAX requests you've made with JQuery to load GeoJSONs into Leaflet maps in the past. You can [learn more about the Fetch API here](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)--and note that it is not supported by the Internet Explorer browser at this time. 

The Fetch request we make in the code above requests the resource located at the specified parameter--in this case, the URL created by the combination of the variables `urlGeoJSON` and `sqlQuery`, or `https://ejeans.carto.com/api/v2/sql?format=GeoJSON&q=SELECT the_geom, description, name FROM lab_3b_emma`. 

The `.then()` method in the next bit of code takes the response from the Fetch request and formats it as JSON, and the next `.then()` adds the popups created by the `addPopup` function we wrote above to the map. 

Save your changes and preview in your browser. Navigate in the map to Tacoma, and you should see a point on the map with a clickable popup: 

![screenshot of marker loaded from CARTO](images/image3.png)

This marker is being loaded from the CARTO table named lab_3b_emma, stored in my CARTO account (username ejeans).

*On your own* update the `url` variable and the `sqlQuery` variable to draw data not from my CARTO database but from your own. You will have to replace my username with your own, and replace my table name with your table's name. When you've done this successfully, you should see the same marker in the same location (because that same data should be stored in your table), but the map will be fetching data from the table that you created in step 2.1 above, rather than from my table. 

#### 2.4 Sending user inputs to the CARTO database 

In step 2.3 you displayed data *from* the CARTO database on your map; now it's time to send user inputs from your map *to* the database. 

In Lab 3, Part A, you wrote a function called `setData` that, when the user clicked the 'submit' button on the HTML form, packaged the geometry of the shape the user had drawn as a variable named `drawing`, and packaged the attributes the user had entered for the name and description as variables named `enteredUsername` and `enteredDescription`. It then used `console.log` to print these three variables to the console. Now, instead of printing the variables to the console, we want to send them to the database as values to be stored in a row. 

Replace the portion of the code inside the `setData` function shown in the screenshot below with the code in the code block below.

Replace this: 

![screenshot of what to replace](images/image4.png)

With this: 

```javascript
   	// For each drawn layer
    drawnItems.eachLayer(function(layer) {
           
			// Create SQL expression to insert layer
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            var sql =
                "INSERT INTO lab_3b_emma (the_geom, name, description) " +
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                drawing + "'), 4326), '" +
                enteredUsername + "', '" +
                enteredDescription + "')";
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
        newData.properties.description = enteredDescription;
        newData.properties.name = enteredUsername;
        L.geoJSON(newData, {onEachFeature: addPopup}).addTo(cartoData);

    });
```

Once again, there's a lot going on here, so let's take it bit by bit. Let's look at the part under the first comment: 

```javascript
		// For each drawn layer
        drawnItems.eachLayer(function(layer) {
        	// Code does something with each drawn layer
        });
```

The `.eachLayer` method used here allows us to iterate so that the code that follows will run for every shape that the user draws on the map. Note that the final curly bracket and parenthesis of the code closes this function, as indicated by the tabbing that aligns it with this opening line of code. 

So what does the internal function in the `.eachLayer` iteration do with each layer? Three things: 

1. **Construct** the `INSERT` query for adding a new record into the CARTO table
2. **Send** the query to the CARTO SQL API
3. **Copy** the submitted drawing to the CARTO layer, to display it on the map

Here is the code for the SQL query construction:

```javascript
        // Create SQL expression to insert layer
            var drawing = JSON.stringify(layer.toGeoJSON().geometry);
            var sql =
                "INSERT INTO lab_3b_emma (the_geom, name, description) " +
                "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                drawing + "'), 4326), '" +
                enteredUsername + "', '" +
                enteredDescription + "')";
            console.log(sql);
```
Here we've made some adjustments to what happens with the `drawing` variable, which in Part A we simply printed to the console. First thing first: **change the name of the table in the sql statement from `lab_3b_emma` to *your* table's name.** Now that that's done, what's happening here is you're writing a SQL command to insert data into your table. This is just like what we did in part 2.1.2. above, only you're writing the SQL command in JavaScript instead of in the SQL interface in CARTO, and you're using variables to construct the query dynamically from user inputs. Just like before, you're converting the geometry of the shape from GeoJSON to WKB, using EPSG code 4326 to indicate that the coordinates are in WGS 84. You're also setting the values to be inserted into the `name` and `description` columns equal to what the user entered in the popup form. To help us double check our work, we're also using `console.log` to see in the browser's JS console what's being submitted to the database. 

In the code under the next comment, we actually send the data to the database with the CARTO SQL API: 

```Javascript
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
```

Notice again that we are using Fetch, and that we are connecting to the URL you specified with the `url` variable in step 2.3. In my case, the URL is `https://ejeans.carto.com/api/v2/sql`, and for you, it will be the URL that contains your CARTO username. We use the `POST` method (an HTTP method for sending data to a server; [documentation available here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST)) to send the data, properly formatted and encoded. The remaining parts of the code (the `.then()` functions and the `.catch` function) log some additional information to the console to help us notice and resolve any errors. 

Finally, let's look at the code under the last comment: 

```javascript
        // Transfer submitted drawing to the CARTO layer 
        //so it persists on the map without you having to refresh the page
        var newData = layer.toGeoJSON();
        newData.properties.description = enteredDescription;
        newData.properties.name = enteredUsername;
        L.geoJSON(newData, {onEachFeature: addPopup}).addTo(cartoData);
```

This part of the code transfers the drawn data to the `cartoData` layer to display it on the map without reloading the map. Basically, the drawn `layer` is translated to GeoJSON, combined with the`name` and `description` properties, then added on the map with `L.geoJSON`. Without this part, our drawing would only be sent to the database without being shown on the map, unless we reload the web page. 

Save your changes and preview in the browser. Draw a shape on your map, enter some attribute information for the name and description, and click submit. Your shape should persist on the map; this is great! Next let's check the JS console to make sure the data was submitted to the database. 

Logged to the console, you should see an SQL statement with the geometry of the shape you drew and values for the non-spatial attributes based on what you entered in the form. However, you probably also see a 403 error. If you expand the warning message, it likely tells you 'permission denied for table lab_3b_yourname', like this: 

![screenshot of error message](images/image5.png)

Alas! This means the next step is to update permissions on the CARTO table. 

#### 2.5 Updating permissions on the CARTO table

Any database is always associated with one or more database users, who are granted a specific set of privileges. When you set up your ArcGIS Online database for the Collector map you made in Lab 2, you granted 'Add,' 'Delete', and 'Update' privileges to members of your MSGT cohort, for instance. We typically talk about database user privileges in terms of various roles. For example, an administrator may have the maximal set of privileges, meaning they can do anything in the database: reading and writing into tables, creating new tables, deleting existing tables, adding or removing other uses, and so on. On the other hand, a read-only user may have a more limited set of privileges so that they can only consume data from the database but cannot make changes to any tables. 

The way you've accessed your CARTO database with the CARTO SQL API implies a database connection with the default user named `publicuser`, which is automatically created by CARTO when you set up your account. The `publicuser` has **read** permissions on all tables in your database, which is why you can execute the SQL query starting with `SELECT` in step 2.3 to display data from the database in your map. However, the `publicuser` does not, by default, have **write** permissions that would allow them to modify the table. This is why the above `INSERT` query failed with a `"permission denied"` error. 

In addition to `public user`, CARTO defines an API Key user, who has all possible privileges on the tables in the database--read, write, update, create, delete, and so on. To use the CARTO SQL API with the “API Key” user, we need to supply an additional `api_key` parameter in our query, as in:

```javascript
https://ejeans.carto.com/api/v2/sql?q=
INSERT INTO lab_3b_emma (the_geom, name, description) 
VALUES (ST_SetSRID(ST_GeomFromGeoJSON(
'{"type":"Point","coordinates":[34.838848,31.296301]}'
),4326),'test','test')&
api_key=fb85************************************
```

You're familiar with API keys from your work with Mapbox. You can get the API Key from your account settings panel in the CARTO web interface. So, there are two possible solutions to the "permission denied" problem when trying to insert a new record into the table: we can either connect to the database as the API Key user, who already has permissions to edit the table, or we can grant the `publicuser` a new privilege, for running `INSERT` queries on the `lab_3b` table. 

The first option may seem the most convenient, since the only thing we need to do is locate our API Key string in the CARTO interface and attach it in the SQL API query URL, as shown above. However, there is a serious security issue we need to consider when using this approach. If we include the API Key in our JavaScript code, in principle anyone looking into the source code of our page will be able to copy the API Key and use it to make any kind of SQL query on our account. For example, they could permanently delete any table in our account using `DROP TABLE` command. Exposing the API Key in *client-side* scripts is therefore a serious security risk. The API Key is really intended only for *server-side* scripts, whose source code cannot be accessed by the web page users. For instance, the server-side script may accept requests with a password the user entered; if the password is valid the server can make a query to the CARTO SQL API and send back the result, otherwise the query will be rejected. This approach requires setting up a dynamic server, which means that, to use it securely, the API Key solution is not so simple after all. 

For a simple crowdsourcing app, intended for a trusted audience, the second option of granting `INSERT` privileges to `publicuser` is a simple and effective solution. In a way, this makes our database exposed: anyone who enters our web page will be able to insert new records into the table. On the other hand, the worst-case scenario is just that our table will be filled with many unnecessary records. The only privilege we will grant is `INSERT`, which means that `publicuser` cannot delete any previously entered records or modify the table in any other way. Moreover, when the URL for our page is shared with a trusted audience, such as among students taking a survey in a class, the chances of someone taking the trouble of finding our page and intentionally sabotaging our database by filling it with a large amount of fake records is very small. Thus, in small-scale use cases, the effort of making a dynamic server with an authentication system may be superfluous, since the simple solution presented below is sufficient.

To grant the permission for making `INSERT` queries on the table, the following SQL query needs to be executed. The `publicuser` obviously does not have the permission to grant themself with additional privileges. Therefore the query needs to be executed inside the **SQL editor** on the CARTO web interface, which implies full privileges, or using the SQL API with the the API Key. We'll use the CARTO web interface. 

Return to your CARTO account and open your lab_3b table. Toggle on the SQL editor, and run the following command, being sure to change the name of the table to match **your** table's name: 

```sql
GRANT INSERT  
  ON lab_3b_emma 
  TO publicuser;
```

Return to your map in the browser window and refresh the page. Try again to draw a shape, add some attribute values, and click submit. Check the JS console to see if you have gotten a permissions error. 

It is very possible that you have again received an error, but a different one this time. For instance, my error this time reads `["permission denied for sequence lab_3b_template_copy_cartodb_id_seq0"]` 

![screenshot of second error message](images/image6.png)

If you receive this error as well, run the following command in the CARTO SQL editor, being sure to replace the name of the sequence with the exact name given in **your** error message, e.g.: 

```SQL
GRANT USAGE ON SEQUENCE lab_3b_template_copy_cartodb_id_seq0
  TO publicuser;
```

Return once more to your map in the browser window and refresh the page. Try again to draw a shape, add some attribute values, and click submit. Check the JS console to see if you have gotten a permissions error. This time, instead of an error, you should see a message stating that the data was saved: 

![screenshot of Data saved message](images/image7.png)

Now return to your table in the CARTO web interface. You should see a new row added to your table with the geometry and attributes you just entered on the map and form: 

![screenshot of table with new row](images/image8.png)

Success! The database is now ready to receive data collection entries. Feel free to experiment with adding more shapes and refresh your CARTO table to see them added to the database. You can always delete rows that you do not want to keep by clicking the three vertical dots next to any of the row's values and selecting 'Delete this row...`

If at some point in the future you wanted to disable the ability for a `publicuser` to insert data into the table, for example when data collection is completed and we do not want to accept any more entries, you can always **revoke** the privilege granted to `publicuser` as follows:

```sql
REVOKE INSERT ON TABLE table_name
  FROM publicuser; 
```

**Do not** run this command now, as I will test that your table is accepting submissions when I grade the lab. 

#### 2.6 Submission

Upload your completed map to GitHub and submit a link to your work on Canvas. You need only provide a link to your data collection tool (the map), not to your CARTO database. You've accomplished quite a lot in this lab, so once again there is no write-up for Lab 3b. 
