this.TubeMapViz = (function(){
  include "events.js"
  function TubeMapViz(options){
    if(!window.requestAnimFrame){
      window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
        };
      })();
    }
    options = options || {};
    this.debug = options.debug || false;
    this.disableHighlighting = options.disableHighlighting || false;
    this.padding = options.padding || 30;
    this.stationRadius = options.stationRadius || 8;
    this.lineWidth = options.lineWidth || 5;
    this.lineSpacing = options.lineSpacing || 5;
    this.labelLineHeight = options.labelLineHeight || 13;
    this.labelColour = options.labelColour || "black";
    this.labelWrapThreshold = options.labelWrapThreshold || 4;
    this.fontSize = options.fontSize || 10;
    this.fontFamily = options.fontFamily || "Arial";
    this.fontWeight = options.fontWeight || "Normal";
    this.highlightScale = options.highlightScale || 1.3;
    this.inactiveColour = options.inactiveColour || "#DDDDDD";
    this.stationColour = options.stationColour || "black";
    this.stationThickness = options.stationThickness || this.lineWidth;
    this.stationClicked = options.stationClicked || this.stationClicked;
    this.customLegend = options.customLegend || null;
    this.showLegend = options.showLegend || true;
    this.legendFontSize = options.legendFontSize || this.fontSize;
    this.legendFontWeight = options.legendFontWeight || this.fontWeight;
    this.legendFontColour = options.legendFontColour || options.labelColour || "black";
    this.legendBackgroundColour = options.legendBackgroundColour || "rgba(255,255,255,0.7)";
    this.zoomControlBackgroundColour = options.zoomControlBackgroundColour || "#888";
    this.allowZoom = options.allowZoom || true;
    this.zoomToFit = options.zoomToFit || true;
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
    mapWidth:{
      writable: true
    },
    mapHeight:{
      writable: true
    },
    mapRatioY:{
      writable: true
    },
    elemRatioY:{
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
    anchorX:{
      writable: true,
      value: 0
    },
    anchorY:{
      writable: true,
      value: 0
    },
    pixelMultiplier:{
      writable: true,
      value: 1
    },
    zoomLevel:{
      writable: true,
      value: 0
    },
    minZoom:{
      writable: true
    },
    maxZoom:{
      writable: true
    },
    canZoom:{
      writable: true,
      value: false
    },
    zoomSteps:{
      writable: true,
      value: []
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
    shortestDistance:{
      writable: true
    },
    longestDistance:{
      writable: true
    },
    longestLabelAllocation:{
      writable: true
    },
    distanceMultiplier:{
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
    buildLegendData:{
      include "buildLegendData.js"
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
    drawLegend:{
      include "drawLegend.js"
    },
    drawZoomControls:{
      include "drawZoomControls.js"
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
        alert('you clicked station "'+station.name+'"');
      }
    },
    highlightStation:{
      value: function(station){
        if(!this.disableHighlighting){
          station.mode = "highlight";
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
        this.anchorX = this.posX;
        this.anchorY = this.posY;
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
        this.startPanX = 0;
        this.startPanY = 0;
        this.anchorX = 0;
        this.anchorY = 0;
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
          this.drawZoomControls();
        }
      }
    },
    scaleAll:{
      include "scaleAll.js"
    },
    zoomIn:{
      value: function(){
        this.animateZoom(1, 10, 1, function(){
          this.zoomLevel++;
          this.pixelMultiplier = this.zoomSteps[this.zoomLevel];
          console.log(this.pixelMultiplier);
          this.drawGrid();
          this.drawLines(true);
          this.drawStations();
          this.drawLabels();
          this.drawImages();
          this.drawZoomControls();
          this.createEventListeners();
        });
      }
    },
    zoomOut:{
      value: function(event){
        this.animateZoom(1, 10, -1, function(){
          this.zoomLevel--;
          this.pixelMultiplier = this.zoomSteps[this.zoomLevel];
          this.drawGrid();
          this.drawLines(true);
          this.drawStations();
          this.drawLabels();
          this.drawImages();
          this.drawZoomControls();
          this.createEventListeners();
        });
      }
    },
    animateZoom: {
      value: function(curr, max, step, callbackFn){
        var that = this;
        this.pixelMultiplier += step/max/10;
        requestAnimFrame(function(){
          that.drawGrid();
          that.drawLines(true);
          that.drawStations();
          that.drawLabels();
          that.drawImages();
          that.drawZoomControls();
          that.createEventListeners();
          curr++;
          if(curr<max){
            that.animateZoom(curr, max, step, callbackFn);
          }
          else {
            callbackFn.call(that);
          }
        });
      }
    }
  });
  return TubeMapViz;
}());
