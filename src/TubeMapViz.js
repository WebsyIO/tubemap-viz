include "events.js"

var TubeMapViz = (function(){
  function TubeMapViz(options){
    options = options || {};
    this.debug = options.debug || false;
    this.disableHighlighting = options.disableHighlighting || false;
    this.padding = options.padding || 30;
    this.stationRadius = options.stationRadius || 8;
    this.lineWidth = options.lineWidth || 5;
    this.lineSpacing = options.lineSpacing || 5;
    this.labelLineHeight = options.labelLineHeight || 13;
    this.labelWrapThreshold = options.labelWrapThreshold || 4;
    this.fontSize = options.fontSize || 10;
    this.fontFamily = options.fontFamily || "Arial";
    this.fontWeight = options.fontWeight || "Normal";
    this.highlightScale = options.highlightScale || 1.3;
    this.inactiveColour = options.inactiveColour || "#DDDDDD";
    this.stationColour = options.stationColour || "black";
    this.stationThickness = options.stationThickness || this.lineWidth;
    this.stationClicked = options.stationClicked || this.stationClicked;
    this.colours = options.colours || [
      "#61A729",
      "#EE5A35",
      "#4591BA",
      "yellow",
      "pink"
    ];
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;
    this.PIXEL_RATIO = dpr / bsr;
  }
  TubeMapViz.prototype = Object.create(Object.prototype, {
    debug:{
      writable: true
    },
    events:{
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
    drawImages:{
      include "drawImages.js"
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
    clickInProgress:{
      value: false
    },
    preClick:{
      value: function(station){
        this.removeStationHighlight(station);
        this.stationClicked(station);
      }
    },
    postClick:{
      value: function(){
        this.clickInProgress = false;
      }
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
        if(event.type=="touchstart"){
          this.startPanX = (event.touches[0].clientX - r.left) - this.posX;
    			this.startPanY = (event.touches[0].clientY - r.top) - this.posY;
        }
        else {
          this.startPanX = (event.clientX - r.left) - this.posX;
    			this.startPanY = (event.clientY - r.top) - this.posY;
        }        
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
        event.preventDefault();
        if(this.panning){
          var r = this.eventPaper.canvas.getBoundingClientRect();
          if(event.type.indexOf("touch")!=-1){
            var x = event.touches[0].clientX - r.left;
  		      var y = event.touches[0].clientY - r.top;
          }
          else {
            var x = event.clientX - r.left;
  		      var y = event.clientY - r.top;
          }
          this.posX = (x - this.startPanX);
          this.posY = (y - this.startPanY);

          this.drawGrid();
          this.drawLines(true);
          this.drawStations();
          this.drawLabels();
          this.drawImages();
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
