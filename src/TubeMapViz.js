include "events.js"

var TubeMapViz = (function(){
  function TubeMapViz(options){
    options = options || {};
    this.debug = options.debug || false;
    this.padding = options.padding || 30;
    this.stationRadius = options.stationRadius || 8;
    this.lineWidth = options.lineWidth || 5;
    this.lineSpacing = options.lineSpacing || 5;
    this.labelLineHeight = options.labelLineHeight || 13;
    this.fontSize = options.fontSize || 10;
    this.fontFamily = options.fontFamily || "Arial";
    this.fontWeight = options.fontWeight || "Normal";
    this.highlightScale = options.highlightScale || 1.3;
    this.stationColour = options.stationColour || "black";
    this.stationThickness = options.stationThickness || this.lineWidth;
    this.colours = options.colours || [
      "#61A729",
      "#EE5A35",
      "#4591BA",
      "yellow",
      "pink"
    ];
  }
  TubeMapViz.prototype = Object.create(Object.prototype, {
    debug:{
      writable: true
    },
    width:{
      writable: true
    },
    height:{
      writable: true
    },
    posX:{
      writable: true,
      value: 0
    },
    posY:{
      writable: true,
      value: 0
    },
    zoomSize:{
      writable: true,
      value: 0
    },
    boundLeft:{
      writable: true,
      value: 0
    },
    boundRight:{
      writable: true,
      value: 0
    },
    boundTop:{
      writable: true,
      value: 0
    },
    boundBottom:{
      writable: true,
      value: 0
    },
    startPanX:{
      writable: true,
      value: 0
    },
    startPanY:{
      writable: true,
      value: 0
    },
    panning: {
      writable: true,
      value: false
    },
    listening: {
      writable: true,
      value: false
    },
    padding:{
      writable: true
    },
    gridSize:{
      writable: true
    },
    grid:{
      writable: true,
      value: []
    },
    gridSize:{
      writable: true,
      value: {x:0, y:0}
    },
    stationRadius:{
      writable: true
    },
    lineWidth:{
      writable: true
    },
    lineSpacing:{
      writable: true
    },
    labelLineHeight:{
      writable: true
    },
    fontSize:{
      writable: true
    },
    fontFamily:{
      writable: true
    },
    fontWeight:{
      writable: true
    },
    colours:{
      writable: true
    },
    lastVerticalDirection:{
      writable: true,
      value: 2
    },
    lines:{
      writable: true,
      value: []
    },
    stations:{
      writable: true,
      value: {}
    },
    createCanvases:{
      include "createCanvases.js"
    },
    allocateGridPosition:{
      include "allocateGridPosition.js"
    },
    buildStationData:{
      include "buildStationData.js"
    },
    processFirstLine:{
      include "processFirstLine.js"
    },
    processStations:{
      include "processStations.js"
    },
    useCell:{
      include "useCell.js"
    },
    getLabelInfo:{
      include "getLabelInfo.js"
    },
    getFreeY:{
      include "getFreeY.js"
    },
    createNewGridCell:{
      include "createNewGridCell.js"
    },
    centerMap:{
      include "centerMap.js"
    },
    buildGrid:{
      include "buildGrid.js"
    },
    drawGrid:{
      include "drawGrid.js"
    },
    drawLines:{
      include "drawLines.js"
    },
    drawStations:{
      include "drawStations.js"
    },
    drawLabels:{
      include "drawLabels.js"
    },
    createEventListeners:{
      include "createEventListeners.js"
    },
    setupPanning:{
      include "setupPanning.js"
    },
    render:{
      include "render.js"
    },
    sampleData:{
      include "sampleData.js"
    },
    stationClicked:{
      writable: true,
      value: function(station){

      }
    },
    highlightStation:{
      value: function(station){
        if(!this.disableHighlighting){
          station.mode = "highlight"; //status 3 is a hover
          this.drawStations();
          this.drawLabels();
        }
      }
    },
    removeStationHighlight:{
      value: function(station){
        console.log('mouse out');
        if(!this.disableHighlighting){
          station.mode = "normal";
          this.drawStations();
          this.drawLabels();
        }
      }
    },
    startPan: {
      value: function(event){
        var r = this.eventPaper.canvas.getBoundingClientRect();
  			this.startPanX = (event.clientX - r.left) - this.posX;
  			this.startPanY = (event.clientY - r.top) - this.posY;
        this.panning = true;
      }
    },
    endPan: {
      value: function(event){
        this.panning = false;        
        this.createEventListeners();
      }
    },
    pan:{
      value: function(event){
        if(this.panning){
          var r = this.eventPaper.canvas.getBoundingClientRect();
          var x = event.clientX - r.left;
		      var y = event.clientY - r.top;
          this.posX = (x - this.startPanX);
          this.posY = (y - this.startPanY);

          this.drawGrid();
          this.drawLines(true);
          this.drawStations();
          this.drawLabels();
        }
      }
    },
    scaleAll:{
      include "scaleAll.js"
    },
    zoom:{
      value: function(event){
        event.preventDefault();
        event.deltaY > 0 ? this.zoomSize--:this.zoomSize++;
        //this.drawStations();
      }
    }
  });
  return TubeMapViz;
}());
