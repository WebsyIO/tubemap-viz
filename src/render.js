value: function(data, element, pan){
  //create the canvas elements
  this.createCanvases(element);
  if(data && !data.target){   //data.target catches if data is an event
    //reset some of the values
    this.stations = {};
    this.legend = [];
    this.grid = {};
    //build the station definition
    this.buildStationData(data);
    if(this.debug==true){
      console.log('stations ready');
    }
    //build the legend
    this.buildLegendData();
    //evaluate the label requirements
    this.getLabelInfo();
    if(this.debug==true){
      console.log('labels ready');
    }
    //calculate the initial grid
    //this.buildGrid();
    if(this.debug==true){
      console.log('grid ready');
    }
    this.processFirstLine();
    if(this.debug==true){
      console.log('first line ready');
    }
    this.processStations();
    if(this.debug==true){
      console.log('station positions ready');
    }
    //before drawing anything, calculate the outer co-ordinates of the map and if possible center it
    //if the map is wider than the available space it should be centered vertically and aligned left
    this.centerMap();
    if(this.debug==true){
      console.log('map transposed');
    }
  }
  //draw the grid
  this.drawGrid();
  if(this.debug==true){
    console.log('grid drawn');
  }
  //draw the lines
  this.drawLines();
  if(this.debug==true){
    console.log('lines drawn');
  }
  //draw the stations
  this.drawStations();
  if(this.debug==true){
    console.log('stations drawn');
  }
  //draw any images
  this.drawImages();
  if(this.debug==true){
    console.log('images drawn');
  }
  //draw the labels
  this.drawLabels();
  if(this.debug==true){
    console.log('labels drawn');
  }
  //draw the legend
  this.drawLegend();
  if(this.debug==true){
    console.log('legend drawn');
  }
  //create the map event listeners
  this.createEventListeners(element);
  if(this.debug==true){
    console.log('events listening');
  }
}
