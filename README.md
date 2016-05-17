# tubemap-viz
###An HTML5 Canvas based visualisation that lets you represent data in the style of a Tube/Metro map.

####Setup
Load the TubeMapViz library into your webpage
```html
<script src='https://rawgit.com/websy85/tubemap-viz/master/build/tube-map-viz.js'></script>
```

####Example Usage
Create an element to use as the map parent
```html
<div id="mapContainer" style="width:800; height:600px;"></div>
```
Create a new instance of TubeMapViz  
```javascript
var myTubeMap = new TubeMapViz();
```
Using the sample data provided, call the render() function to draw the map
```javascript
myTubeMap.render(myTubeMap.sampleData, document.getElementById("mapContainer"));
```
####Data Structure
The data expected by the map is an array of objects structured like this
```javascript
{
  "name": String, (required)
  "colour": String,
  "status": Number,  //1 - default || 0 - draws an inactive line using the specified 'inactiveColour'
  "stations": Array (required) [
    {
      "name": String (required),
      "status": Number,
      "custom": {
        "fill": String, //overrides the station fill colour
        "stroke": String, //overrides the station stroke colour
        "scale": Number, //scales the station by the specified scale
        "image": String, (url) //allows an image to be used to represent the station
        "imageSize": Number //specifies the radius of the image used
      }
    }
  ]
}
```
####Options
When creating a new instance of TubeMapViz a configuration object can be passed in.
```javascript
var options = {
  fontSize: 14
}
var myTubeMap = new TubeMapViz(options);
```
Options can also be set after creation
```javascript
myTubeMap.fontSize = 14;
```
The following is a list of available options
```javascript
{
  "debug": Boolean, //defaults to false;
  "disableHighlighting": Boolean, //defaults to false;
  "padding": Number,  //defaults to 30;
  "stationRadius": Number,  //defaults to 8;
  "lineWidth": Number,  //defaults to 5;
  "lineSpacing": Number,  //defaults to 5;
  "labelLineHeight": Number,  //defaults to 13;
  "labelColour": String,  //defaults to "black";
  "labelWrapThreshold": Number, //defaults to 4;
  "fontSize": Number, //defaults to 10;
  "fontFamily": String, //defaults to "Arial";
  "fontWeight": String, //defaults to "Normal";
  "highlightScale": Number, //defaults to 1.3;
  "inactiveColour": String, //defaults to "#DDDDDD";
  "stationColour": String,  //defaults to "black";
  "stationThickness": Number, //defaults to lineWidth;
  "stationClicked": Function, //
  "showLegend": Boolean,  //defaults to true;
  "customLegend": Array [ //allows you to provide a custom legend
    {
      "name": String,
      "colour": String
    }
  ],
  "legendFontSize": Number, //defaults to fontSize;
  "legendFontWeight": String, //defaults to fontWeight;
  "legendFontColour": String, //defaults to labelColour;
  "legendBackgroundColour": String, //defaults to "rgba(255,255,255,0.7)";
  "zoomControlBackgroundColour": String,  //defaults to "#888";
  "allowZoom": Boolean, //defaults to true. if true zoom controls are visible;
  "zoomToFit": Boolean //defaults to true. only active if allowZoom is also true;
}
```
####Methods
```javascript
{
  stationClicked: function(station){
    //allows you to add custom behaviour to the stationClicked event
    //the supplied station object has the following properties
    
  }
}
```
####Rendering Logic
