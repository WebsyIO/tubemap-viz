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

####Methods

####Rendering Logic
