value: function(data, element, pan){
  //create the canvas elements
  this.createCanvases(element);
  console.log('canvases ready');
  if(data){
    //reset some of the values
    this.stations = {};
    this.grid = {};
    //build the station definition
    this.buildStationData(data);
    console.log('stations ready');
    //evaluate the label requirements
    this.getLabelInfo();
    console.log('labels ready');
    //calculate the initial grid
    //this.buildGrid();
    console.log('grid ready');
    this.processFirstLine();
    console.log('first line ready');
    console.log(this.stations);
    this.processStations();
    console.log('station positions ready');
    //before drawing anything, calculate the outer co-ordinates of the map and if possible center it
    //if the map is wider than the available space it should be centered vertically and aligned left
    this.centerMap();
    console.log('map transposed');
  }
  //draw the grid
  this.drawGrid();
  console.log('grid drawn');
  //draw the lines
  this.drawLines();
  console.log('lines drawn');
  //draw the stations
  this.drawStations();
  console.log('stations drawn');
  //draw the labels
  this.drawLabels();
  console.log('labels drawn');
  //create the map event listeners
  this.createEventListeners();
  console.log('events listening');
  // if(!pan || pan==false){
  //   this.setupPanning();
  //   console.log('panning configured');
  // }
}
