this.TubeMapViz = (function(){
  var Events = function(canvas, context){
      this.canvas = canvas;
      this.context = context;
      this.stage = undefined;
      this.listening = false;

      // desktop flags
      this.mousePos = null;
      this.mouseDown = false;
      this.mouseUp = false;
      this.mouseOver = false;
      this.mouseMove = false;

      // mobile flags
      this.touchPos = null;
      this.touchStart = false;
      this.touchMove = false;
      this.touchEnd = false;

      // Region Events
      this.currentRegion = null;
      this.regionIndex = 0;
      this.lastRegionIndex = -1;
      this.mouseOverRegionIndex = -1;
  };

  // ======================================= GENERAL =======================================

  Events.prototype.getContext = function(){
      return this.context;
  };

  Events.prototype.getCanvas = function(){
      return this.canvas;
  };

  Events.prototype.clear = function(){
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  Events.prototype.getCanvasPos = function(){
      var obj = this.getCanvas();
      var top = 0;
      var left = 0;
      while (obj && obj.tagName && obj.tagName != "BODY") {
          top += obj.offsetTop;
          left += obj.offsetLeft;
          obj = obj.offsetParent;
      }
      return {
          top: top,
          left: left
      };
  };

  Events.prototype.setStage = function(func){
      this.stage = func;
      this.listen();
  };

  // ======================================= CANVAS EVENTS =======================================

  Events.prototype.reset = function(evt){
      if (!evt) {
          evt = window.event;
      }

      this.setMousePosition(evt);
      this.setTouchPosition(evt);
      this.regionIndex = 0;

      if (this.stage !== undefined) {
          this.stage();
      }

      // desktop flags
      this.mouseOver = false;
      this.mouseMove = false;
      this.mouseDown = false;
      this.mouseUp = false;

      // mobile touch flags
      this.touchStart = false;
      this.touchMove = false;
      this.touchEnd = false;
  };

  Events.prototype.listen = function(){
      var that = this;

      if (this.stage !== undefined) {
          this.stage();
      }

      // desktop events
      this.canvas.addEventListener("mousedown", function(evt){
          that.mouseDown = true;
          that.reset(evt);
      }, false);

      this.canvas.addEventListener("mousemove", function(evt){
          that.reset(evt);
      }, false);

      this.canvas.addEventListener("mouseup", function(evt){
          that.mouseUp = true;
          that.reset(evt);
      }, false);

      this.canvas.addEventListener("mouseover", function(evt){
          that.reset(evt);
      }, false);

      this.canvas.addEventListener("mouseout", function(evt){
          that.mousePos = null;
      }, false);

      // mobile events
      this.canvas.addEventListener("touchstart", function(evt){
          //evt.preventDefault();
          that.touchStart = true;
          that.reset(evt);
      }, false);

      this.canvas.addEventListener("touchmove", function(evt){
          //evt.preventDefault();
          that.reset(evt);
      }, false);

      this.canvas.addEventListener("touchend", function(evt){
          //evt.preventDefault();
          that.touchEnd = true;
          that.reset(evt);
      }, false);
  };

  Events.prototype.getMousePos = function(evt){
      return this.mousePos;
  };

  Events.prototype.getTouchPos = function(evt){
      return this.touchPos;
  };

  Events.prototype.setMousePosition = function(evt){
      var mouseX = evt.clientX - this.getCanvasPos().left + window.pageXOffset;
      var mouseY = evt.clientY - this.getCanvasPos().top + window.pageYOffset;
      this.mousePos = {
          x: mouseX,
          y: mouseY
      };
  };

  Events.prototype.setTouchPosition = function(evt){
      if (evt.touches !== undefined && evt.touches.length == 1) { // Only deal with one finger
          var touch = evt.touches[0]; // Get the information for finger #1
          var touchX = touch.pageX - this.getCanvasPos().left + window.pageXOffset;
          var touchY = touch.pageY - this.getCanvasPos().top + window.pageYOffset;

          this.touchPos = {
              x: touchX,
              y: touchY
          };
      }
  };

  // ======================================= REGION EVENTS =======================================

  Events.prototype.beginRegion = function(){
      this.currentRegion = {};
      this.regionIndex++;
  };

  Events.prototype.addRegionEventListener = function(type, func){
      var event = (type.indexOf('touch') == -1) ? 'on' + type : type;
      this.currentRegion[event] = func;
  };

  Events.prototype.closeRegion = function(){
      var pos = this.touchPos || this.mousePos;

      if (pos !== null && this.context.isPointInPath(pos.x, pos.y)) {
          if (this.lastRegionIndex != this.regionIndex) {
              this.lastRegionIndex = this.regionIndex;
          }

          // handle onmousedown
          if (this.mouseDown && this.currentRegion.onmousedown !== undefined) {
              this.currentRegion.onmousedown();
              this.mouseDown = false;
          }

          // handle onmouseup
          else if (this.mouseUp && this.currentRegion.onmouseup !== undefined) {
              this.currentRegion.onmouseup();
              this.mouseUp = false;
          }

          // handle onmouseover
          else if (!this.mouseOver && this.regionIndex != this.mouseOverRegionIndex && this.currentRegion.onmouseover !== undefined) {
              this.currentRegion.onmouseover();
              this.mouseOver = true;
              this.mouseOverRegionIndex = this.regionIndex;
          }

          // handle onmousemove
          else if (!this.mouseMove && this.currentRegion.onmousemove !== undefined) {
              this.currentRegion.onmousemove();
              this.mouseMove = true;
          }

          // handle touchstart
          if (this.touchStart && this.currentRegion.touchstart !== undefined) {
              this.currentRegion.touchstart();
              this.touchStart = false;
          }

          // handle touchend
          if (this.touchEnd && this.currentRegion.touchend !== undefined) {
              this.currentRegion.touchend();
              this.touchEnd = false;
          }

          // handle touchmove
          if (!this.touchMove && this.currentRegion.touchmove !== undefined) {
              this.currentRegion.touchmove();
              this.touchMove = true;
          }

      }
      else if (this.regionIndex == this.lastRegionIndex) {
          this.lastRegionIndex = -1;
          this.mouseOverRegionIndex = -1;

          // handle mouseout condition
          if (this.currentRegion.onmouseout !== undefined) {
              this.currentRegion.onmouseout();
          }
      }
  };

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
      value: function(element, data){
        if(element){
          element.innerHTML = "";
          if(!this.listening){
            console.log('adding event listeners to element');
            element.addEventListener('resize', this.render.bind(this), false);
            //element.addEventListener('wheel', this.zoom.bind(this), false);
            element.addEventListener('mousedown', this.startPan.bind(this), true);
            element.addEventListener('touchstart', this.startPan.bind(this), false);
            //element.addEventListener('mouseenter', this.startPan.bind(this), false);
            //element.addEventListener('touchenter', this.startPan.bind(this), false);
            element.addEventListener('mousemove', this.pan.bind(this), false);
            element.addEventListener('touchmove', this.pan.bind(this), false);
            element.addEventListener('mouseup', this.endPan.bind(this), false);
            element.addEventListener('touchend', this.endPan.bind(this), false);
            element.addEventListener('mouseout', this.endPan.bind(this), false);
            element.addEventListener('touchleave', this.endPan.bind(this), false);
            if (!('remove' in Element.prototype)) {
                Element.prototype.remove = function() {
                    if (this.parentNode) {
                        this.parentNode.removeChild(this);
                    }
                };
            }
            this.listening = true;
          }
          var height = element.clientHeight, width = element.clientWidth;
          this.boundTop = Math.floor((height/2)-1);
          this.boundBottom = Math.ceil((height/2)+1);
          this.cellWidth = this.stationRadius*2;
          this.cellHeight = this.stationRadius*2;
          this.gridSize.x = Math.floor(width / this.cellWidth);
          this.gridSize.y = Math.floor(height / this.cellHeight);
          this.baseY = Math.ceil(this.gridSize.y/2);
          //debug canvas
          var debugCanvas = document.createElement('canvas');
          this.debugPaper = {
            canvas: debugCanvas,
            pen: debugCanvas.getContext('2d')
          };
          this.debugPaper.canvas.style.position = "absolute";
          this.debugPaper.canvas.style.top = "0px";
          this.debugPaper.canvas.style.left = "0px";
          this.debugPaper.canvas.style.zIndex = "10";
          this.debugPaper.canvas.width = width;
          this.debugPaper.canvas.height = height;
          if(this.debug){
            element.appendChild(this.debugPaper.canvas);
          }
          //line canvas
          var lineCanvas = document.createElement('canvas');
          this.linePaper = {
            canvas: lineCanvas,
            pen: lineCanvas.getContext('2d')
          };
          this.linePaper.canvas.style.position = "absolute";
          this.linePaper.canvas.style.top = "0px";
          this.linePaper.canvas.style.left = "0px";
          this.linePaper.canvas.style.zIndex = "20";
          this.linePaper.canvas.width = width;
          this.linePaper.canvas.height = height;
          element.appendChild(this.linePaper.canvas);
          //station canvas
          var stationCanvas = document.createElement('canvas');
          this.stationPaper = {
            canvas: stationCanvas,
            pen: stationCanvas.getContext('2d')
          };
          this.stationPaper.canvas.style.position = "absolute";
          this.stationPaper.canvas.style.top = "0px";
          this.stationPaper.canvas.style.left = "0px";
          this.stationPaper.canvas.style.zIndex = "30";
          this.stationPaper.canvas.width = width;
          this.stationPaper.canvas.height = height;
          element.appendChild(this.stationPaper.canvas);
          //image canvas
          var imageCanvas = document.createElement('canvas');
          this.imagePaper = {
            canvas: imageCanvas,
            pen: imageCanvas.getContext('2d')
          };
          this.imagePaper.canvas.style.position = "absolute";
          this.imagePaper.canvas.style.top = "0px";
          this.imagePaper.canvas.style.left = "0px";
          this.imagePaper.canvas.style.zIndex = "30";
          this.imagePaper.canvas.width = width;
          this.imagePaper.canvas.height = height;
          element.appendChild(this.imagePaper.canvas);
          //label canvas
          var labelCanvas = document.createElement('canvas');
          this.labelPaper = {
            canvas: labelCanvas,
            pen: labelCanvas.getContext('2d')
          };
          this.labelPaper.canvas.style.position = "absolute";
          this.labelPaper.canvas.style.top = "0px";
          this.labelPaper.canvas.style.left = "0px";
          this.labelPaper.canvas.style.zIndex = "40";
          this.labelPaper.canvas.width = width;// * this.PIXEL_RATIO;
          this.labelPaper.canvas.height = height;// * this.PIXEL_RATIO;
          // this.labelPaper.canvas.style.width = width + "px";
          // this.labelPaper.canvas.style.height = height + "px";
          element.appendChild(this.labelPaper.canvas);
          //panning layer
          var panningCanvas = document.createElement('canvas');
          this.panningPaper = {
            canvas: panningCanvas,
            pen: panningCanvas.getContext('2d')
          };
          this.panningPaper.canvas.style.position = "absolute";
          this.panningPaper.canvas.style.top = "0px";
          this.panningPaper.canvas.style.left = "0px";
          this.panningPaper.canvas.style.zIndex = "50";
          this.panningPaper.canvas.width = width;
          this.panningPaper.canvas.height = height;
          element.appendChild(this.panningPaper.canvas);
          //legend layer  --for now we're sitting this underneath the panning layer
          var legendCanvas = document.createElement('canvas');
          this.legendPaper = {
            canvas: legendCanvas,
            pen: legendCanvas.getContext('2d')
          };
          this.legendPaper.canvas.style.position = "absolute";
          this.legendPaper.canvas.style.top = "0px";
          this.legendPaper.canvas.style.left = "0px";
          this.legendPaper.canvas.style.zIndex = "45";
          this.legendPaper.canvas.width = width;
          this.legendPaper.canvas.height = height;
          element.appendChild(this.legendPaper.canvas);

          this.height = height;
          this.width = width;
        }
        else{
          //we reset the width of each canvas to effectively to clear the canvases
          this.debugPaper.canvas.width = this.width;
          this.linePaper.canvas.width = this.width;
          this.stationPaper.canvas.width = this.width;
          this.labelPaper.canvas.width = this.width;
        }
      }

    },
    allocateGridPosition:{
      value: function(x, y, station, lastStation, line, progression, direction){
        //function to allocate the grid position for the current station
        //when allocating a grid position for a station we need to accommodate for how much space we need for the label as well
        var lastDirection = direction || 6;
        direction = progression==1 ? 6 : 4; //if we don't have a direction (like on a new line with no share stations) we'll start by trying to go right or left
        var suitableAllocationFound = false;
        var tries = 0;
        var requiredAllocation = station.label.hCount + 1;
        var potentialAllocation;
        // var potentialAllocationDistance = line.longestStation || 10;
        var xAllocation;
        var yAllocation;
        var potentialAllocationDistance = this.longestLabelAllocation || 10;
        var restart = false;
        var startCell = this.grid[x][y];
        var labelTry = 0;
        var iteration = 1;
        var iterationTries = 0;
        var directionsTried = [];
        while(!suitableAllocationFound && tries < 1000){  //hopefully we don't reach 1000 tries but just in case
          tries++;
          iterationTries++;
          restart = false;
          var hIndex = 0, vIndex = 0;
          switch (direction) {
            case 2: //up
              vIndex = -1;
              break;
            case 4: //left
              hIndex = -1;
              break;
            case 6: //right
              hIndex = 1;
              break;
            case 8: //down
              vIndex = 1;
              break;
            default:
          }
          var startX = x+((iterationTries*iteration)*hIndex), startY = y+((iterationTries*iteration)*vIndex);
          var reservedCells = [];
          //start by finding a free cell for the station. we don't want to go further than 8 cells away
          // for (var i=0;i<potentialAllocationDistance;i++){
            // var potX = startX+(hIndex*i)+((potentialAllocationDistance-1)*hIndex), potY = startY+(vIndex*i)+((potentialAllocationDistance-1)*vIndex)
            var potX, potY;
            potX = x + (hIndex*1);
            potY = y + (vIndex*1);
            if(lastStation){
              potX += (hIndex*lastStation.xSpace);
              if(direction==2){
                potY += (vIndex*Math.max(lastStation.ySpace, lastStation.xSpace));
              }
            }
            if(direction==8){
              if(lastStation){
                potY+=Math.round(this.longestLabelAllocation * (lastStation.distanceToNext / this.shortestDistance));
              }
              else{
                potY += Math.round(this.longestLabelAllocation * (station.distanceToNext / this.shortestDistance));
              }
            }
            if(!this.grid[potX]){
              this.grid[potX] = {};
            }
            if(!this.grid[potX][potY]){
              this.createNewGridCell(potX, potY);
            }
            if(this.grid[potX][potY] && !this.grid[potX][potY].occupied){
              potentialAllocation = this.grid[potX][potY];
              // break;
            }
            else if(this.grid[potX][potY] && this.grid[potX][potY].occupied){
              if(this.grid[potX][potY].item!="blocked"){
                potentialAllocation = null;
                // break;
              }
            }
          // }
          // if(potentialAllocation && iterationTries < potentialAllocationDistance){
          if(potentialAllocation){
            labelTry++;
            var needToChangeDirection = false, keepgoing = true;
            xAllocation = this.longestLabelAllocation;
            yAllocation = this.longestLabelAllocation;

            if(direction==2 || direction==8){
              yAllocation = Math.round(this.longestLabelAllocation * (station.distanceToNext / this.shortestDistance));
            }
            else if (direction==4 || direction==6) {
              xAllocation = Math.round(this.longestLabelAllocation * (station.distanceToNext / this.shortestDistance));
            }
            //we have a potentialAllocation, we need to make sure there's clearance to the side in case we go in that direction next
            for(var i=1;i<xAllocation+1;i++){
              if(!this.grid[potentialAllocation.h+i]){
                this.grid[potentialAllocation.h+i] = {};
              }
              if(!this.grid[potentialAllocation.h+i][potentialAllocation.v]){
                this.createNewGridCell(potentialAllocation.h+i, potentialAllocation.v);
              }
              if(this.grid[potentialAllocation.h+i][potentialAllocation.v] && this.grid[potentialAllocation.h+i][potentialAllocation.v].occupied){
                potentialAllocation = null;
                keepgoing = false;
                restart = true;
                break;
              }
            }
            if(keepgoing){
              //now we need to see if the label will fit as well
              var labelY = potentialAllocation.v-1, labelX = potentialAllocation.h+1;
              for(var v=0;v<yAllocation;v++){
                for(var h=0;h<xAllocation;h++){
                  if(!this.grid[labelX+h]){
                    this.createNewGridCell(labelX+h, labelY-v);
                  }

                  if(this.grid[labelX+h][labelY-v] && this.grid[labelX+h][labelY-v].occupied){
                    //then the potential allocation won't work so we move on
                    potentialAllocation = null;
                    restart = true;
                    break;
                  }
                  else{
                    if(!this.grid[labelX+h][labelY-v]){
                      this.createNewGridCell(labelX+h,labelY-v);
                    }
                    reservedCells.push(this.grid[labelX+h][labelY-v]);
                    if(v==yAllocation-1 && h==xAllocation-1){
                      //we have space for the label and the station
                      if(this.debug){
                        console.log("Using cells for "+station.name);
                      }
                      if(lastStation){
                        //connect the dots back to the last station if we're going up
                        if(direction==2){
                          var dotCount = lastStation.vSpace;
                          for(var i=0;i<dotCount+1;i++){
                            this.useCell(potentialAllocation.h,potentialAllocation.v+i, "blocked");
                          }
                        }
                      }
                      for(var i=1;i<xAllocation+1;i++){
                        if(this.debug){
                          console.log("Blocking cells for "+station.name);
                        }
                        this.useCell(potentialAllocation.h+i,potentialAllocation.v, "blocked");
                      }
                      for(var i=1;i<yAllocation+1;i++){
                        if(this.debug){
                          console.log("Blocking cells for "+station.name);
                        }
                        this.useCell(potentialAllocation.h,potentialAllocation.v-i, "blocked");
                      }
                      this.useCell(potentialAllocation.h, potentialAllocation.v, "station");
                      for(var r=0;r<reservedCells.length;r++){
                        this.useCell(reservedCells[r].h, reservedCells[r].v, "label");
                      }
                      station.gridLoc = potentialAllocation;
                      station.xSpace = xAllocation;
                      station.ySpace = yAllocation;
                      station.labelLoc = reservedCells[0];
                      suitableAllocationFound = true;
                      return direction;
                    }
                  }
                }
                if(restart){
                  restart = false;
                  if(labelTry > 8 || needToChangeDirection){
                    changeDirection.call(this);
                  }
                  break;
                }
              }
            }
            else{
              if(restart){
                restart = false;
              }
              changeDirection.call(this);
            }
          }
          else{
            changeDirection.call(this);
          }
        }

        function changeDirection(){
            directionsTried.push(direction);
            switch (direction) {
              case 2: //up
              case 8: //down
                direction = progression==-1?4:6;
                  break;
              case 4: //left
              case 6: //right
                //at this point we probably want to see where we have more space
                direction = this.lastVerticalDirection==2?8:2;
                this.lastVerticalDirection = direction;
                break;
              default:

            }
            if(directionsTried.length==3){  //we've tried left/right and up/down
              iteration++;
              iterationTries = 0;
              directionsTried = [];
            }
        }
      }

    },
    buildStationData:{
      value: function(lines){
        //takes the lines information and uses it to build a distinct station list
        for (var l in lines){
          var sharedStationCount = 0;
          var sharedStations = [];
          for (var l2 in lines){
            if(lines[l].name != lines[l2].name || lines.length == 1){
              //no need for a line to check against itself
              for(var lS in lines[l].stations){
                if(lines[l].stations[lS].distanceToNext){
                  if(!this.shortestDistance){
                    this.shortestDistance = lines[l].stations[lS].distanceToNext;
                  }
                  if(!this.longestDistance){
                    this.longestDistance = lines[l].stations[lS].distanceToNext;
                  }
                  this.shortestDistance = Math.min(this.shortestDistance, lines[l].stations[lS].distanceToNext);
                  this.longestDistance = Math.max(this.longestDistance, lines[l].stations[lS].distanceToNext);
                }
                else{
                  lines[l].stations[lS].distanceToNext = 1;
                }
                if(!this.stations[lines[l].stations[lS].name]){
                  //this.stations[lines[l].stations[lS].name] = {lines:[lines[l].name], hLinesDrawn:0, vLinesDrawn:0, status:lines[l].stations[lS].status, mode:"normal"};
                  this.stations[lines[l].stations[lS].name] = {lines:[lines[l].name], hLinesDrawn:0, vLinesDrawn:0, hAboveLinesDrawn:0, hBelowLinesDrawn:0, vLeftLinesDrawn:0, vRightLinesDrawn:0, mode:"normal"};
                  for (var p in lines[l].stations[lS]){
                    this.stations[lines[l].stations[lS].name][p] = lines[l].stations[lS][p];
                  }
                }
                for (var l2S in lines[l2].stations){
                  if(lines[l].stations[lS].name == lines[l2].stations[l2S].name){
                    if(lines[l2].stations[l2S].status>0){
                      this.stations[lines[l].stations[lS].name].status = lines[l2].stations[l2S].status;
                    }
                    if(this.stations[lines[l].stations[lS].name].lines.indexOf(lines[l].name)==-1){
                      this.stations[lines[l].stations[lS].name].lines.push(lines[l].name);
                    }
                  }
                }
              }
            }
          }
        }
        console.log(this.shortestDistance);
        console.log(this.longestDistance);
        if(!this.shortestDistance || this.shortestDistance == "NaN"){
          this.shortestDistance = 1;
        }
        if(!this.longestDistance || this.longestDistance == "NaN"){
          this.longestDistance = 1;
        }
        this.distanceMultiplier = (this.shortestDistance / this.longestDistance);
        console.log(this.distanceMultiplier);
        this.lines = lines;
      }

    },
    buildLegendData:{
      value: function(){
        if(this.customLegend){
          this.legend = this.customLegend;
        }
        else{
          for(var i=0;i<this.lines.length;i++){
            var leg = {
              name: this.lines[i].name
            };
            if(this.lines[i].colour){
              leg.colour = this.lines[i].colour;
            }
            else if(Array.isArray(this.colours)){
              leg.colour = this.colours[i];
            }
            else if(this.colours[this.lines[i].name]){
              leg.colour = this.colours[this.lines[i].name];
            }
            else {
              leg.colour = "black";
            }
            this.legend.push(leg);
          }
        }
      }

    },
    processFirstLine:{
      value: function(){
        //this plots the points for the first line.
        //the first line is the one with the most shared stations
        //which we draw diagonally to set a baseline
        var stationCount = this.lines[0].stations.length;
        var startCellX, startCellY, startPixelY, gridLoc;

        //we should draw this line centrally to the grid horizontally
        var label = this.stations[this.lines[0].stations[0].name].label;
        // var longestStation = this.lines[0].longestStation || 10;
        var longestStation = this.longestLabelAllocation || 10;
        startCellX = 1;
        startCellY = Math.ceil(this.gridSize.y/2);

        //draw the first part of the line
        for (var s=0;s<stationCount;s++){
          //based on the width of the label mark the relevant cells unusable
          var label = this.stations[this.lines[0].stations[s].name].label;
          if(s<stationCount){
            // for(var i=0;i<this.lines[0].longestStation+1;i++){
            var stationLength = Math.round(this.longestLabelAllocation * (this.lines[0].stations[s].distanceToNext / this.shortestDistance));
            var xAllocation = stationLength;
            var yAllocation = this.longestLabelAllocation;
            console.log(this.longestLabelAllocation);
            console.log(stationLength);
            for(var i=0;i<xAllocation+1;i++){
              this.useCell(startCellX+i,startCellY, "blocked");
            }
            for(var i=0;i<yAllocation+1;i++){
              this.useCell(startCellX,startCellY-i, "blocked");
            }
          }

          this.useCell(startCellX, startCellY, "station");
          gridLoc = this.grid[startCellX][startCellY];
          this.lines[0].stations[s].gridLoc = gridLoc;
          this.stations[this.lines[0].stations[s].name].gridLoc = gridLoc

          //allocate the position for the station label starting 1 cell immediately up and right of the station
          var labelY = startCellY-1, labelX = startCellX+1;
          // for(var v=0;v<this.lines[0].longestStation;v++){
          //   for(var h=0;h<this.lines[0].longestStation;h++){
          for(var v=0;v<yAllocation;v++){
            for(var h=0;h<xAllocation;h++){
              this.useCell(labelX+h,labelY-v, "label");
              if(v==0&&h==0){
                this.stations[this.lines[0].stations[s].name].labelLoc = this.grid[labelX][labelY];
              }
            }
          }
          var station = this.lines[0].stations[s];
          this.stations[this.lines[0].stations[s].name].xSpace = xAllocation;
          this.stations[this.lines[0].stations[s].name].ySpace = yAllocation;
          //now we move to what would effectively be the end of the label
          startCellX += xAllocation+1;
        }
      }

    },
    processStations:{
      value: function(){
        //function to assign grid positions to each station

        for(var l=1; l < this.lines.length; l++){
          var stationCount = this.lines[l].stations.length;
          var startCellX;
          var startCellY;
          var stationsDrawn = [];
          var currentStation = 0;
          var currentCheckpoint = 0;
          var direction;
          stationsDrawn = [];
          //now we continue drawing the rest of the lines
          //find the first shared station that's already been drawn
          while(stationsDrawn.length < this.lines[l].stations.length){
            for (var c=currentCheckpoint;c<stationCount;c++){
              if(this.stations[this.lines[l].stations[c].name].gridLoc){
                //we have a shared station
                currentStation = c;
                break;
              }
              else{
                currentStation = null;
              }
            }
            if(currentStation!=null){
              for (var s=currentStation;s>currentCheckpoint-1;s--){
                var newLoc, allocation;
                var baseStation = this.stations[this.lines[l].stations[currentStation].name].gridLoc;
                var currLoc = this.stations[this.lines[l].stations[s].name].gridLoc;
                if(currLoc){
                  //this is a shared station, we'll compare it with the previous station to see what direction we're going in
                  //we don't need to take any other action on a share station
                  if(this.lines[l].stations[s+1]){
                    var prevLoc = this.stations[this.lines[l].stations[s+1].name].gridLoc;
                    if(prevLoc){
                      if(prevLoc.v == currLoc.v){
                        //we're travelling horizontally
                        direction = 4;  //left because we're counting down through the stations
                      }
                      else if(prevLoc.h == currLoc.h){
                        //we're travelling vertically
                        direction = prevLoc.v > currLoc.v ? 2 : 8;  //2=up, 8=down
                      }
                      else{
                        //in theory we shouldn't get here because we're not drawing diagonal lines
                      }
                    }
                  }
                  stationsDrawn.push(this.lines[l].stations[s].name);
                }
                else {
                  //get the grid position of the last station
                  var prevStation = this.stations[this.lines[l].stations[s+1].name];
                  var prevLoc = prevStation.gridLoc;
                  var h = prevLoc.h;
                  var v = prevLoc.v;
                  //now use it to get the next position
                  direction = this.allocateGridPosition(h, v, this.stations[this.lines[l].stations[s].name], prevStation, this.lines[l], -1, direction);
                  //this.allocateStation(this.lines[l].stations[s], newLoc);
                  stationsDrawn.push(this.lines[l].stations[s].name);
                }
              }
              currentCheckpoint = currentStation+1;
            }
            else {
              //there were no shared stations that have been drawn, so we start from the current checkpoint and work upwards
              for(var i=currentCheckpoint;i<this.lines[l].stations.length;i++){
                if(i==0){
                  //we're on a new line with no shared stations
                  var y = this.getFreeY(1);
                  direction = this.allocateGridPosition(1,y, this.stations[this.lines[l].stations[i].name], null, this.lines[l], 1, 6);
                  stationsDrawn.push(this.lines[l].stations[i].name);
                }
                else {
                  //get the grid position of the last station
                  var prevStation = this.stations[this.lines[l].stations[i-1].name];
                  var h = prevStation.gridLoc.h;
                  var v = prevStation.gridLoc.v;
                  //now use it to get the next position
                  direction = this.allocateGridPosition(h, v, this.stations[this.lines[l].stations[i].name], prevStation, this.lines[l], 1, 6);
                  stationsDrawn.push(this.lines[l].stations[i].name);
                }
              }
              currentCheckpoint = this.lines[l].stations.length;
            }
          }    
        }
      }

    },
    useCell:{
      value: function(h, v, item){
        if(this.debug){
          console.log("Using cell "+h+":"+v+" as ("+item+")");
        }
        var cellWidth = this.cellWidth, cellHeight = this.cellHeight;
        var currX = h*cellWidth, currY = v*cellHeight;
        if(!this.grid[h]){
          this.grid[h] = {};
        }
        if(!this.grid[h][v]){
          this.createNewGridCell(h, v);
        }
        this.grid[h][v].occupied = true;
        this.grid[h][v].item = item;
        if(this.debug){
          this.debugPaper.pen.beginPath();
          switch (item) {
            case "station":
              this.debugPaper.pen.fillStyle = "blue";
              break;
            case "label":
              this.debugPaper.pen.fillStyle = "yellow";
              break;
            case "blocked":
              this.debugPaper.pen.fillStyle = "#CCC";
              break;
            default:
              this.debugPaper.pen.fillStyle = "red"; //an error has occured
              break;
          }
          this.debugPaper.pen.arc(this.grid[h][v].center.x, this.grid[h][v].center.y, this.stationRadius, 0, Math.PI * 2);
          //this.pen.rect(this.grid[h][v].locs.a.x, this.grid[h][v].locs.a.y, this.cellWidth, this.cellHeight);
          this.debugPaper.pen.fill();
        }
        this.boundLeft = Math.min(this.boundLeft, this.grid[h][v].locs.a.x);
        this.boundRight = Math.max(this.boundRight, this.grid[h][v].locs.c.x);
        this.boundTop = Math.min(this.boundTop, this.grid[h][v].locs.a.y);
        this.boundBottom = Math.max(this.boundBottom, this.grid[h][v].locs.g.y);
      }

    },
    getLabelInfo:{
      value: function(){
        //determines the labels size and the number of cells it consumes
        var labelSize = {};
        this.labelPaper.pen.beginPath();
        this.labelPaper.pen.font = this.font;
        for(var s in this.stations){
          var words = s.split(" ");
          var labelSize = this.labelPaper.pen.measureText(s);
          var label = {};
          // we should wrap the text based on the longest word
          if(words.length > 1){
            //set the max length
            //var longest = getLongestWord(words);
            var longest = this.cellWidth * this.labelWrapThreshold;
            this.labelPaper.pen.font = this.fontWeight+" "+ this.fontSize +"px "+this.fontFamily;
            var longestSize = this.labelPaper.pen.measureText(longest);
            var longestLine = 0;
            var hCount=0, vCount=0, lines=[];
            var line = "";
            for (var i=0;i<words.length;i++){
              var lineLength = this.labelPaper.pen.measureText(line+" "+words[i]);
              if(lineLength.width<=longest || line.split(" ").length <= 1){
                if(line.split("")[line.length-1]!=" "){
                  line += " ";
                }
                line += words[i];
                if(i<words.length){
                  line += " ";
                }
              }
              else{
                //we start a new line
                lines.push(line.trim());
                longestLine = lines[longestLine].length > lines[lines.length-1].length ? longestLine : lines.length-1;
                line = words[i];
              }
            }
            lines.push(line);
            longestLine = lines[longestLine].length > lines[lines.length-1].length ? longestLine : lines.length-1;
            var lineLength = this.labelPaper.pen.measureText(lines[longestLine]).width;
            for(var i=0;i<this.stations[s].lines.length;i++){
              for(var l=0;l<this.lines.length;l++){
                if(this.stations[s].lines[i]==this.lines[l].name){
                  // if(!this.lines[l].longestStation){
                  //   this.lines[l].longestStation = 0;
                  // }
                  // this.lines[l].longestStation = Math.max(this.lines[l].longestStation, Math.ceil(lineLength/this.cellWidth));
                  if(!this.longestLabelAllocation){
                    this.longestLabelAllocation = 0;
                  }
                  this.longestLabelAllocation = Math.max(this.longestLabelAllocation, Math.ceil(lineLength/this.cellWidth));
                }
              }
            }
            label.hCount = Math.ceil(lineLength / this.cellWidth);
            label.vCount = label.hCount;  //as the label is going diagonally at 45 degrees the space reserved should be a square
            label.lines = lines;
          }
          else{
            label.hCount = Math.ceil(labelSize.width / this.cellWidth);
            label.vCount = label.hCount;
            label.lines = [s];
          }

          this.stations[s].label = label;
        }

        function getLongestWord(words){
          var longestWord = "";
          for(var j=0;j<words.length;j++){
            longestWord = words[j].length > longestWord.length ? words[j] : longestWord;
          }
          return longestWord;
        }
      }

    },
    getFreeY:{
      value: function(x){
        var tries = 0;
        var foundValidY = false;
        var iteration = 0;
        var allocatedY;
        while(!foundValidY && tries < 1000){  //hopefully we don't span 500 rows (we change direction every 8 rows)
          //lets start by looking down
          for(var i=0;i<8;i++){
            if(!this.grid[x][this.baseY + (i*iteration)]){
              this.createNewGridCell(x, this.baseY + (i*iteration));
            }
            if(this.grid[x][this.baseY + (i*iteration)] && !this.grid[x][this.baseY + (i*iteration)].occupied){
              allocatedY = this.baseY + (i*iteration);
              foundValidY = true;
              return allocatedY;
            }
            tries++;
          }
          //then we try looking up
          for(var i=0;i<8;i++){
            if(!this.grid[x][this.baseY + (i*iteration)]){
              this.createNewGridCell(x, this.baseY + (i*iteration));
            }
            if(this.grid[x][this.baseY - (i*iteration)] && !this.grid[x][this.baseY - (i*iteration)].occupied){
              allocatedY = this.baseY - (i*iteration);
              foundValidY = true;
              return allocatedY;
            }
            tries++;
          }
          iteration++;
        }

        return false;
      }

    },
    createNewGridCell:{
      value: function(x, y){
        var h = x, v = y;
        var cellWidth = this.cellWidth, cellHeight = this.cellHeight;
        x = x*cellWidth, y=y*cellHeight;
        if(!this.grid[h]){
          this.grid[h] = {};
        }
        this.grid[h][v] = {
          center: {x: x+(cellWidth/2), y: y+(cellHeight/2)},
          h: h,
          v: v,
          locs: {
            a: {x: x, y: y},
            b: {x: x+(cellWidth/2), y: y},
            c: {x: x+cellWidth, y: y},
            d: {x: x, y: y+(cellHeight/2)},
            e: {x: x+(cellWidth/2), y: y+(cellHeight/2)},
            f: {x: x+(cellWidth), y: y+(cellHeight/2)},
            g: {x: x, y: y+cellHeight},
            h: {x: x+(cellWidth/2), y: y+cellHeight},
            i: {x: x+(cellWidth), y: y+cellHeight},
          },
          occupied: false,
          item: null
        };  
      }

    },
    centerMap:{
      value: function(){
        //using the boundary values set the start position of the map
        this.mapWidth = this.boundRight -  this.boundLeft + 60;   //the +60 gives us a margin
        this.mapHeight = this.boundBottom - this.boundTop;
        this.mapRatioY = this.mapWidth / this.mapHeight;
        this.elemRatioY = this.width / this.height;
        var xOverhang=0, yOverhang=0;
        //check if the map is wider than the element
        this.posX = ((this.width - this.mapWidth) / 2);
        this.posY = ((this.height - this.mapHeight) / 2) - this.boundTop;
        if(this.mapWidth > this.width){
          xOverhang = this.mapWidth - this.width;
          this.posX = 30;
        }
        //check if the map is taller than the element
        if(this.mapHeight > this.height){
          yOverhang = this.mapHeight - this.height;
          this.posY = Math.abs(this.boundTop)+((this.height - this.mapHeight)/2);
        }
        //if the zoomToFit option is set to true we need to resize the map so it fits inside the element
        //this means calculating a resize ratio for all of the draw functions
        if(this.allowZoom===true){
          var growX=1, growY=1;
          if(xOverhang > 0){
            growX = this.mapWidth / this.width;
          }
          if(yOverhang > 0){
            growY = this.mapHeight / this.height;
          }
          if(growY > growX){
            this.pixelMultiplier = 1 / growY;
          }
          else{
            this.pixelMultiplier = 1 / growX;
          }
        }
        if(this.pixelMultiplier < 1){
          this.canZoom = true;
          this.zoomLevel = 0;
          this.pixelMultiplier = decimalAdjust('floor', this.pixelMultiplier, -1);
          this.minZoom = this.pixelMultiplier;
          var minZoomRounded = decimalAdjust('floor', this.minZoom, -1);
          this.zoomSteps.push(this.minZoom);
          for (var i=(minZoomRounded*10)+1;i<11;i++){
            this.zoomSteps.push((i/10));
          }
          this.maxZoom = this.zoomSteps.length-1;
          if(this.zoomToFit===true){
            this.posX = Math.abs(this.boundLeft*this.pixelMultiplier)+(((this.width - (this.mapWidth*this.pixelMultiplier)))/2);
            this.posY = Math.abs(this.boundTop*this.pixelMultiplier)+(((this.height - (this.mapHeight*this.pixelMultiplier)))/2);
          }
          else{
            this.pixelMultiplier = this.zoomSteps[this.zoomSteps.length-1];
            this.zoomLevel = this.zoomSteps.length-1;
          }

        }
        function decimalAdjust(type, value, exp) {
          // If the exp is undefined or zero...
          if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
          }
          value = +value;
          exp = +exp;
          // If the value is not a number or the exp is not an integer...
          if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
          }
          // Shift
          value = value.toString().split('e');
          value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
          // Shift back
          value = value.toString().split('e');
          return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }
      }

    },
    buildGrid:{
      value: function(){
        var currX = 0, currY = 0;
        var gridCount = 0;
        var cellWidth = this.cellWidth, cellHeight = this.cellHeight;
        for (var i=0; i<this.gridSize.y; i++){
          for(var j=0; j<this.gridSize.x; j++){
            gridCount++;      
            if(!this.grid[j]){
              this.grid[j] = {};
            }
            if(!this.grid[j][i]){
              this.createNewGridCell(j, i);
            }
            currX += this.cellWidth;
          }
          currX = 0;
          currY += this.cellHeight;
        }
      }

    },
    drawGrid:{
      value: function(){
        if(this.debug){
          //debug function to draw the grid
          var currX = 0, currY = 0;
          var gridCount = 0;
          var cellWidth = this.cellWidth, cellHeight = this.cellHeight;
          this.debugPaper.canvas.width = this.width;
          this.debugPaper.pen.translate(this.posX, this.posY);
          this.debugPaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);  
          //draw the grid (debugging only) and calculate the cell structure
          this.debugPaper.pen.beginPath();
          this.debugPaper.pen.strokeStyle = "#E2E2E2";
          for (var h in this.grid){
            for(var v in this.grid[h]){
              this.debugPaper.pen.rect(this.grid[h][v].locs.a.x, this.grid[h][v].locs.a.y, this.cellWidth, this.cellHeight);
            }
          }
          this.debugPaper.pen.stroke();
        }
      }

    },
    drawLines:{
      value: function(panning){
        //function to draw the lines between the stations
        if(panning && panning == true){
          //reset linesdrawn to 0 otherwise our lines will offset for every pixel we move
          for(var s in this.stations){
            this.stations[s].vLinesDrawn = 0;
            this.stations[s].vLeftLinesDrawn = 0;
            this.stations[s].vRightLinesDrawn = 0;
            this.stations[s].hLinesDrawn = 0;
            this.stations[s].hAboveLinesDrawn = 0;
            this.stations[s].hBelowLinesDrawn = 0;
          }
        }
        this.linePaper.canvas.width = this.width;
        this.linePaper.pen.translate(this.posX, this.posY);
        this.linePaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);
        var currX, currY, newX, newY, adjustmentX, adjustmentY, adjustedH, adjustedV, directionOfLine, previousDirection, hLeft, vAbove;
        for (var l in this.lines){
          var stations = this.lines[l].stations;
          currX = this.stations[stations[0].name].gridLoc.center.x;
          currY = this.stations[stations[0].name].gridLoc.center.y;
          adjustmentX = 0;
          adjustmentY = 0;

          for (var i=0;i<stations.length;i++){
            this.linePaper.pen.beginPath();
            this.linePaper.pen.lineTo((currX+adjustmentX), (currY+adjustmentY));
            this.linePaper.pen.moveTo((currX+adjustmentX), (currY+adjustmentY));
            if(this.lines[l].colour){
              this.linePaper.pen.strokeStyle = this.lines[l].colour;
            }
            else if(Array.isArray(this.colours)){
              this.linePaper.pen.strokeStyle = this.colours[l];
            }
            else if(this.colours[this.lines[l].name]){
              this.linePaper.pen.strokeStyle = this.colours[this.lines[l].name];
            }
            else {
              this.linePaper.pen.strokeStyle = "black";
            }
            if(stations[i].status==0){
              this.linePaper.pen.strokeStyle = this.inactiveColour;
            }
            this.linePaper.pen.lineWidth = this.lineWidth;
            this.linePaper.pen.lineJoin = "bevel";
            this.linePaper.pen.lineCap = 'round';

            if(stations[i+1]){

              if(this.stations[stations[i].name].gridLoc.center.x == this.stations[stations[i+1].name].gridLoc.center.x){
                //the line runs vertically
                directionOfLine = "v";
                vLeft = (this.stations[stations[i].name].vLeftLinesDrawn <=  this.stations[stations[i].name].vRightLinesDrawn) == true ? -1 : 1;
                if(this.stations[stations[i].name].vLinesDrawn > 0 && this.stations[stations[i+1].name].vLinesDrawn > 0){
                  if(vLeft==-1){
                    adjustmentX = (this.lineSpacing * vLeft) + (this.lineSpacing * this.stations[stations[i].name].vLeftLinesDrawn * vLeft);
                  }
                  else{
                    adjustmentX = (this.lineSpacing * vLeft) + (this.lineSpacing * this.stations[stations[i].name].vRightLinesDrawn * vLeft);
                  }
                  this.linePaper.pen.lineTo((currX+adjustmentX), (currY));
                  this.linePaper.pen.moveTo((currX+adjustmentX), (currY));
                }
                else{
                  adjustmentX = 0;
                  this.linePaper.pen.lineTo((currX+adjustmentX), (currY));
                  this.linePaper.pen.moveTo((currX+adjustmentX), (currY));
                }
              }
              else if (this.stations[stations[i].name].gridLoc.center.y == this.stations[stations[i+1].name].gridLoc.center.y) {
                //the line runs horizontally
                directionOfLine = "h";
                hBelow = (this.stations[stations[i].name].hBelowLinesDrawn <=  this.stations[stations[i].name].hAboveLinesDrawn) == true ? 1 : -1;
                if(this.stations[stations[i].name].hLinesDrawn > 0 && this.stations[stations[i+1].name].hLinesDrawn > 0){
                  if(hBelow==1){
                    adjustmentY = (this.lineSpacing * hBelow) + (this.lineSpacing * this.stations[stations[i].name].hBelowLinesDrawn * hBelow);
                  }
                  else{
                    adjustmentY = (this.lineSpacing * hBelow) + (this.lineSpacing * this.stations[stations[i].name].hAboveLinesDrawn * hBelow);
                  }
                  this.linePaper.pen.lineTo((currX), (currY+adjustmentY));
                  this.linePaper.pen.moveTo((currX), (currY+adjustmentY));
                }
                else{
                  adjustmentY = 0;
                  this.linePaper.pen.lineTo((currX), (currY+adjustmentY));
                  this.linePaper.pen.moveTo((currX), (currY+adjustmentY));
                }
              }
              if(directionOfLine != previousDirection){
                if(directionOfLine == "h"){
                  adjustmentX = 0;
                }
                else{
                  adjustmentY = 0;
                }
              }
              currX = this.stations[stations[i+1].name].gridLoc.center.x;
              currY = this.stations[stations[i+1].name].gridLoc.center.y;
              if(stations[i].status==0 || stations[i+1].status==0){
                this.linePaper.pen.strokeStyle = this.inactiveColour;
              }
              this.linePaper.pen.lineTo((currX+adjustmentX), (currY+adjustmentY));
              this.linePaper.pen.stroke();

              if(directionOfLine=="h"){
                if(hBelow==1 && this.stations[stations[i].name].hLinesDrawn > 0){
                  this.stations[stations[i].name].hBelowLinesDrawn++;
                }
                else if(this.stations[stations[i].name].hLinesDrawn > 0){
                  this.stations[stations[i].name].hAboveLinesDrawn++;
                }
                this.stations[stations[i].name].hLinesDrawn++;
                if(previousDirection=="v"){
                  this.stations[stations[i].name].vLinesDrawn++;
                }
              }
              else{
                if(vLeft==-1 && this.stations[stations[i].name].vLinesDrawn > 0){
                  this.stations[stations[i].name].vLeftLinesDrawn++;
                }
                else if(this.stations[stations[i].name].vLinesDrawn > 0){
                  this.stations[stations[i].name].vRightLinesDrawn++;
                }
                this.stations[stations[i].name].vLinesDrawn++;
                if(previousDirection=="h"){
                  this.stations[stations[i].name].hLinesDrawn++;
                }
              }
              previousDirection = directionOfLine;
            }
            else{
              if(this.stations[stations[i].name].lines.length <=2){
                if(directionOfLine=="h"){
                  if(hBelow==1 && this.stations[stations[i].name].hLinesDrawn > 0){
                    this.stations[stations[i].name].hBelowLinesDrawn++;
                  }
                  else if(this.stations[stations[i].name].hLinesDrawn > 0){
                    this.stations[stations[i].name].hAboveLinesDrawn++;
                  }
                  this.stations[stations[i].name].hLinesDrawn++;
                  if(previousDirection=="v"){
                    this.stations[stations[i].name].vLinesDrawn++;
                  }
                }
                else{
                  if(vLeft==-1 && this.stations[stations[i].name].vLinesDrawn > 0){
                    this.stations[stations[i].name].vLeftLinesDrawn++;
                  }
                  else if(this.stations[stations[i].name].vLinesDrawn > 0){
                    this.stations[stations[i].name].vRightLinesDrawn++;
                  }
                  this.stations[stations[i].name].vLinesDrawn++;
                  if(previousDirection=="h"){
                    this.stations[stations[i].name].hLinesDrawn++;
                  }
                }
              }
            }
          }
        }
      }

    },
    drawStations:{
      value: function(){
        var that = this;
        this.stationPaper.canvas.width = this.width;
        this.stationPaper.pen.translate(this.posX, this.posY);
        this.stationPaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);  
        var stationsHandled = [];
        for(var l=0; l<this.lines.length;l++){
          for(var i=0; i<this.lines[l].stations.length;i++){
            if(this.stations[this.lines[l].stations[i].name].gridLoc && stationsHandled.indexOf(that.lines[l].stations[i].name)==-1){
              var station = this.stations[this.lines[l].stations[i].name]
              var x = station.gridLoc.center.x;
              var y = station.gridLoc.center.y;
              this.stationPaper.pen.beginPath();
              this.stationPaper.pen.strokeStyle = this.stationColour;
              this.stationPaper.pen.fillStyle = "white";
              if(station.status==0){
                this.stationPaper.pen.strokeStyle = this.inactiveColour;
              }
              this.stationPaper.pen.lineWidth = this.stationThickness;
              var qState = this.lines[l].stations[i].qState;

              var radius = Math.ceil(this.stationRadius - (this.lineWidth/2));
              if(this.lines[l].stations[i].mode=="highlight"){
                radius = radius * this.highlightScale;
              }
              if(this.lines[l].stations[i].custom){
                var custom = this.lines[l].stations[i].custom;
                if(custom.fill){
                  this.stationPaper.pen.fillStyle = custom.fill;
                }
                if(custom.stroke){
                  this.stationPaper.pen.strokeStyle = custom.stroke;
                }
                if(custom.scale){
                  radius = radius * custom.scale;
                }
              }
              this.stationPaper.pen.arc(x, y, radius, 0, Math.PI * 2);
              this.stationPaper.pen.stroke();
              this.stationPaper.pen.fill();
              stationsHandled.push(that.lines[l].stations[i].name);
            }
          }
        }

      }

    },
    drawImages:{
      value: function(){
        var that = this;
        this.imagePaper.canvas.width = this.width;
        this.imagePaper.pen.translate(this.posX, this.posY);
        this.imagePaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);
        for(var l=0; l<this.lines.length;l++){
          for(var i=0; i<this.lines[l].stations.length;i++){
            if(this.stations[this.lines[l].stations[i].name].gridLoc){
              var station = this.stations[this.lines[l].stations[i].name];
              var x = station.gridLoc.center.x;
              var y = station.gridLoc.center.y;
              var radius = this.stationRadius;
              this.imagePaper.pen.beginPath();
              if(this.lines[l].stations[i].custom){
                var custom = this.lines[l].stations[i].custom;
                if(custom.image){
                  if(custom.scale){
                    radius = (radius * custom.scale);
                  }
                  if(custom.imageSize){
                    radius = (custom.imageSize / 2);
                  }
                  renderImage(x, y, custom.image, radius, station)
                }
              }
            }
          }
        }

        function renderImage(x, y, url, size, station){
          if(!station.customImage){
            var im = new Image();
            im.onload = function(){
              that.imagePaper.pen.drawImage(im, (x - size), (y-size) , size*2, size*2);
              station.customImage = im;
            };
            im.src = url;
          }
          else {
            that.imagePaper.pen.drawImage(station.customImage, (x - size), (y-size) , size*2, size*2);
          }
        }
      }

    },
    drawLabels:{
      value: function(){
        this.labelPaper.canvas.width = this.width;
        //this.labelPaper.pen.setTransform(this.PIXEL_RATIO, 0, 0, this.PIXEL_RATIO, 0, 0);
        this.labelPaper.pen.translate(this.posX, this.posY);
        this.labelPaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);  
        for(var s in this.stations){
          if(this.stations[s].labelLoc){
              var station = this.stations[s];
              var x = station.labelLoc.center.x;
              var y = station.labelLoc.center.y;
              var textX = 0, textY = 0;
              this.labelPaper.pen.save()
              this.labelPaper.pen.beginPath();
              //this.pen.moveTo(x,y);
              var fontSize = this.fontSize;
              if(station.mode=="highlight"){
                fontSize = fontSize * this.highlightScale;
              }
              // if(this.debug){
              //   this.labelPaper.pen.rect(station.labelLoc.locs.a.x, station.labelLoc.locs.a.y, this.cellWidth, this.cellHeight);
              // }
              this.labelPaper.pen.font = this.fontWeight+" "+ fontSize +"px "+this.fontFamily;
              this.labelPaper.pen.textAlign = "left";
              this.labelPaper.pen.textBaseline = "middle";
              this.labelPaper.pen.fillStyle = this.labelColour;
              if(station.status==0){
                this.labelPaper.pen.fillStyle = this.inactiveColour;
              }
              this.labelPaper.pen.translate(x, y);
              this.labelPaper.pen.rotate(-45*Math.PI / 180);

              if(!station.custom || !station.custom.drawLabel==undefined || station.custom.drawLabel!==false){
                for(var i=0;i<this.stations[s].label.lines.length;i++){
                  this.labelPaper.pen.fillText(this.stations[s].label.lines[i], textX, textY);
                  textY+= this.labelLineHeight;
                }
              }
              //this.pen.fillStyle = "white";
              //this.pen.lineWidth = 3;

              //this.pen.arc(x, y, this.stationRadius, 0, Math.PI * 2);
              //this.pen.stroke();

              this.labelPaper.pen.fill();
              this.labelPaper.pen.restore();
          }
        }
      }

    },
    drawLegend:{
      value: function(){
        //the legend calculations assume that the line will be 50px wide in the legend
        //first we calculate the size of the legend and render a semi-transparent background
        //the legend will have a 20px margin
        //each item will be separate by 10px
        this.legendPaper.canvas.width = this.width;
        var legendWidth = 100, legendHeight = 40, longestLabel = 0;
        for (var i=0;i<this.legend.length;i++){
          var labelWidth = this.legendPaper.pen.measureText(this.legend[i].name);
          longestLabel = Math.max(longestLabel, labelWidth.width);
          legendHeight+=10;
        }
        legendHeight-=10;
        legendWidth+=longestLabel;
        if((this.width / legendWidth) < 5 || (this.height / legendHeight) < 5){
          var multiplier = (this.width / legendWidth) / 5;
          this.legendPaper.pen.scale(multiplier,multiplier);
        }
        this.legendPaper.pen.save();
        this.legendPaper.pen.beginPath();
        this.legendPaper.pen.rect(0, 0, legendWidth, legendHeight);
        this.legendPaper.pen.fillStyle = this.legendBackgroundColour;
        this.legendPaper.pen.fill();
        this.legendPaper.pen.closePath();
        this.legendPaper.pen.restore();
        var startX = 20, startY = 20;
        for (var i=0;i<this.legend.length;i++){
          this.legendPaper.pen.beginPath();
          this.legendPaper.pen.moveTo(startX, startY);
          if(this.legend[i].colour){
            this.legendPaper.pen.strokeStyle = this.legend[i].colour;
          }
          else {
            this.legendPaper.pen.strokeStyle = "black";
          }
          this.legendPaper.pen.lineWidth = this.lineWidth;    
          this.legendPaper.pen.lineTo((startX+50), startY);
          this.legendPaper.pen.stroke();
          this.legendPaper.pen.beginPath();
          this.legendPaper.pen.moveTo((startX+60), startY);
          this.legendPaper.pen.font = this.legendFontWeight+" "+ this.legendFontSize +"px "+this.fontFamily;
          this.legendPaper.pen.textAlign = "left";
          this.legendPaper.pen.textBaseline = "middle";
          this.legendPaper.pen.fillStyle = this.legendFontColour;
          this.legendPaper.pen.fillText(this.legend[i].name, (startX+60), startY);
          this.legendPaper.pen.fill();
          startY+=(this.lineWidth+10);
        }
      }

    },
    drawZoomControls:{
      value: function(element){
        //interaction layer  
        if(!element){
          if(this.zoomPaper){
            element = this.zoomPaper.canvas.parentElement;
          }
          else{
            return;
          }
        }
        //first remove the existing canvas
        if(this.zoomPaper && this.zoomPaper.canvas){
          this.zoomPaper.canvas.remove();
        }
        //then add a new one
        var zoomCanvas = document.createElement('canvas');
        this.zoomPaper = {
          canvas: zoomCanvas,
          pen: zoomCanvas.getContext('2d')
        };
        this.zoomPaper.canvas.style.position = "absolute";
        this.zoomPaper.canvas.style.top = "0px";
        this.zoomPaper.canvas.style.left = "0px";
        this.zoomPaper.canvas.style.zIndex = "55";
        this.zoomPaper.canvas.width = this.width;
        this.zoomPaper.canvas.height = this.height;
        element.appendChild(this.zoomPaper.canvas);
        //this.zoomPaper.pen.restore();
        // this.zoomPaper.pen.translate(this.posX, this.posY);
        // this.zoomPaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);
        //draw the zoom controls
        //draw the zoom in control
        if(this.canZoom){
          var zoomX, zoomInY, zoomOutY;
          zoomX = (this.width / this.pixelMultiplier) - (30 / this.pixelMultiplier);
          zoomInY = (45 / this.pixelMultiplier);
          this.zoomPaper.pen.beginPath();
          if(this.zoomLevel < this.maxZoom){
            this.zoomPaper.pen.fillStyle = this.zoomControlBackgroundColour;
          }
          else{
            this.zoomPaper.pen.fillStyle = this.inactiveColour;
          }
          this.zoomPaper.pen.lineWidth = 3/this.pixelMultiplier;
          // this.zoomPaper.pen.arc((this.width / this.pixelMultiplier) - (15 / this.pixelMultiplier) - ((this.posX) / this.pixelMultiplier), (30 / this.pixelMultiplier) - ((this.posY) / this.pixelMultiplier), (12/this.pixelMultiplier), 0, Math.PI * 2);
          this.zoomPaper.pen.arc(this.width - 15, 30, 12, 0, Math.PI * 2);
          this.zoomPaper.pen.closePath();
          this.zoomPaper.pen.fill();
          this.zoomPaper.pen.beginPath();
          if(this.zoomLevel > this.minZoom){
            this.zoomPaper.pen.fillStyle = this.zoomControlBackgroundColour;
          }
          else{
            this.zoomPaper.pen.fillStyle = this.inactiveColour;
          }
          this.zoomPaper.pen.lineWidth = 3/this.pixelMultiplier;
          this.zoomPaper.pen.arc(this.width - 15, 60, 12, 0, Math.PI * 2);
          this.zoomPaper.pen.closePath();
          this.zoomPaper.pen.fill();

          this.zoomPaper.pen.beginPath();
          this.zoomPaper.pen.fillStyle = "white";
          this.zoomPaper.pen.font = "16px "+this.fontFamily
          this.zoomPaper.pen.textAlign = "center";
          this.zoomPaper.pen.textBaseline = "middle";
          this.zoomPaper.pen.fillText("+", this.width - 15, 31);
          // this.zoomPaper.pen.closePath();
          // this.zoomPaper.pen.fill();
          // this.zoomPaper.pen.beginPath();
          this.zoomPaper.pen.fillText("-", this.width - 15, 60);
          this.zoomPaper.pen.closePath();
          this.zoomPaper.pen.fill();

        }
      }

    },
    createEventListeners:{
      value: function(element){
        var that = this;
        //interaction layer
        if(!element){
          if(this.eventPaper){
            element = this.eventPaper.canvas.parentElement;
          }
          else{
            return;
          }
        }
        //first remove the existing canvas
        if(this.eventPaper && this.eventPaper.canvas){
          this.eventPaper.canvas.remove();
        }
        //then add a new one
        var eventCanvas = document.createElement('canvas');
        this.eventPaper = {
          canvas: eventCanvas,
          pen: eventCanvas.getContext('2d')
        };
        this.eventPaper.canvas.style.position = "absolute";
        this.eventPaper.canvas.style.top = "0px";
        this.eventPaper.canvas.style.left = "0px";
        this.eventPaper.canvas.style.zIndex = "60";
        this.eventPaper.canvas.width = this.width;
        this.eventPaper.canvas.height = this.height;
        element.appendChild(this.eventPaper.canvas);

        var events = new Events(this.eventPaper.canvas, this.eventPaper.pen);

        this.eventPaper.canvas.width = this.width;
        this.eventPaper.pen.translate(this.posX, this.posY);
        this.eventPaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);
        var context = events.getContext();
        context.save(); //save 1
        events.setStage(function(){
          this.clear();
          var stationsHandled = [];
          for(var l=0; l<that.lines.length;l++){
            for(var i=0; i<that.lines[l].stations.length;i++){
              if(that.stations[that.lines[l].stations[i].name].gridLoc && stationsHandled.indexOf(that.lines[l].stations[i].name)==-1){
                var station = that.stations[that.lines[l].stations[i].name];
                var x = station.gridLoc.locs.a.x;
                var y = station.gridLoc.locs.a.y;

                this.beginRegion();
                context.beginPath();

                context.strokeStyle = "transparent";
                if(that.debug){
                  context.strokeStyle = "red";
                }

                context.rect(x, y, that.cellWidth, that.cellHeight);
                context.closePath();
                context.stroke();

                this.addRegionEventListener("mousedown", that.preClick.bind(that, that.lines[l].stations[i], true));
                this.addRegionEventListener("touchdown", that.preClick.bind(that, that.lines[l].stations[i], true));
                this.addRegionEventListener("mouseover", that.highlightStation.bind(that, that.lines[l].stations[i], false));
                this.addRegionEventListener("mouseout", that.removeStationHighlight.bind(that, that.lines[l].stations[i], false));

                this.closeRegion();
                stationsHandled.push(that.lines[l].stations[i].name);
              }
            }
          }
          if(that.canZoom){
            var zoomX, zoomInY, zoomOutY;
            zoomX = (that.width / that.pixelMultiplier) - (30 / that.pixelMultiplier);
            zoomInY = (45 / that.pixelMultiplier);

            context.save();
            this.beginRegion();
            context.beginPath();
            // context.strokeStyle = that.legendFontColour;
            context.lineWidth = 3/that.pixelMultiplier;
            context.arc((that.width / that.pixelMultiplier) - (15 / that.pixelMultiplier) - ((that.posX) / that.pixelMultiplier), (30 / that.pixelMultiplier) - ((that.posY) / that.pixelMultiplier), (12/that.pixelMultiplier), 0, Math.PI * 2);
            context.closePath();
            if(!that.panning){
              context.stroke();
            }
            if(that.zoomLevel < that.maxZoom){
              this.addRegionEventListener("mousedown", that.zoomIn.bind(that, null, true));
              this.addRegionEventListener("touchdown", that.zoomIn.bind(that, null, true));
            }
            this.closeRegion();

            this.beginRegion();
            context.beginPath();
            context.lineWidth = 3/that.pixelMultiplier;
            context.arc((that.width / that.pixelMultiplier) - (15 / that.pixelMultiplier) - ((that.posX) / that.pixelMultiplier), (60 / that.pixelMultiplier) - ((that.posY) / that.pixelMultiplier), (12/that.pixelMultiplier), 0, Math.PI * 2);
            context.closePath();
            if(!that.panning){
              context.stroke();
            }
            if(that.zoomLevel > that.minZoom){
              this.addRegionEventListener("mousedown", that.zoomOut.bind(that, null, true));
              this.addRegionEventListener("touchdown", that.zoomOut.bind(that, null, true));
            }
            this.closeRegion();
          }
        });
      }

    },
    setupPanning:{
      value: function(){
        var that = this;
        var events = new Events(this.eventPaper.canvas, this.eventPaper.pen);
        var context = events.getContext();
        events.setStage(function(){
          this.clear();
          this.beginRegion();
          context.beginPath();
          context.rect(0, 0, that.width, that.height);
          this.addRegionEventListener("mousedown", that.startPan.bind(that, this, false));
          this.addRegionEventListener("mouseup", that.endPan.bind(that, this, false));
          this.addRegionEventListener("mousemove", that.pan.bind(that, this, false));
          context.closePath();
          context.stroke();
          this.closeRegion();
        });
      }

    },
    render:{
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
        //create the map zoom controls
        this.drawZoomControls(element);
      }

    },
    sampleData:{
      value: [
        {
          name: "Line1",
          colour: "#ff7373",
          stations: [
            {
              name: "Station A",
              status: 1,
              distanceToNext: 10,
              custom:{
                fill: "#ff7373",
                scale: 2
              }
            },
            {
              name: "Station B",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station C",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station D",
              status: 1,
              distanceToNext: 5,
            }
          ]
        },
        {
          name: "Line2",
          colour: "#ffd546",
          stations: [
            {
              name: "Station D",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station E",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station F",
              status: 1,
              distanceToNext: 15,
            },
            {
              name: "Station G",
              status: 1,
              distanceToNext: 5,
            }
          ]
        },
        {
          name: "Line3",
          colour: "#d47dbe",
          stations:[
            {
              name: "Station C",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station D",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station E",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station F",
              status: 1,
              distanceToNext: 15,
            },
            {
              name: "Station J",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station K",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station L",
              status: 1,
              distanceToNext: 5,
            }
          ]
        },
        {
          name: "Line4",
          colour: "#68b5de",
          stations: [
            {
              name: "Station D",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station E",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station H",
              status: 0,
              distanceToNext: 5,
            },
            {
              name: "Station I",
              status: 0,
              distanceToNext: 5,
            }
          ]
        },
        {
          name: "Line5",
          colour: "#86ae22",
          stations:[
            {
              name: "Station M",
              status: 1,
              distanceToNext: 5,
              custom:{
                fill: "#86ae22",
                scale: 2
              }
            },
            {
              name: "Station N",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station O",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station P",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station Q",
              status: 1,
              distanceToNext: 5,
            },
            {
              name: "Station R",
              status: 1,
              distanceToNext: 5,
            }
          ]
        }
      ]

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
      value: function(){
        
      }

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
