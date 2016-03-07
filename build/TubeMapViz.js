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
    while (obj.tagName != "BODY") {
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
        evt.preventDefault();
        that.touchStart = true;
        that.reset(evt);
    }, false);

    this.canvas.addEventListener("touchmove", function(evt){
        evt.preventDefault();
        that.reset(evt);
    }, false);

    this.canvas.addEventListener("touchend", function(evt){
        evt.preventDefault();
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
      value: function(element, data){
        if(element){
          element.innerHTML = "";
          if(!this.listening){
            element.addEventListener('resize', this.render.bind(this), false);
            element.addEventListener('wheel', this.zoom.bind(this), false);
            element.addEventListener('mousedown', this.startPan.bind(this), false);
            element.addEventListener('touchstart', this.startPan.bind(this), false);
            //element.addEventListener('mouseenter', this.startPan.bind(this), false);
            //element.addEventListener('touchenter', this.startPan.bind(this), false);
            element.addEventListener('mousemove', this.pan.bind(this), false);
            element.addEventListener('touchmove', this.pan.bind(this), false);
            element.addEventListener('mouseup', this.endPan.bind(this), false);
            element.addEventListener('touchend', this.endPan.bind(this), false);
            element.addEventListener('mouseout', this.endPan.bind(this), false);
            element.addEventListener('touchleave', this.endPan.bind(this), false);
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
          this.labelPaper.canvas.width = width;
          this.labelPaper.canvas.height = height;
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
          //interaction layer
          var eventCanvas = document.createElement('canvas');
          this.eventPaper = {
            canvas: eventCanvas,
            pen: eventCanvas.getContext('2d')
          };
          this.eventPaper.canvas.style.position = "absolute";
          this.eventPaper.canvas.style.top = "0px";
          this.eventPaper.canvas.style.left = "0px";
          this.eventPaper.canvas.style.zIndex = "60";
          this.eventPaper.canvas.width = width;
          this.eventPaper.canvas.height = height;
          element.appendChild(this.eventPaper.canvas);
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
        var potentialAllocationDistance = line.longestStation || 10;
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
          for (var i=0;i<potentialAllocationDistance;i++){
            var potX = startX+(hIndex*i)+((potentialAllocationDistance-1)*hIndex), potY = startY+(vIndex*i)+((potentialAllocationDistance-1)*vIndex)
            if(!this.grid[potX]){
              this.grid[potX] = {};
            }
            if(!this.grid[potX][potY]){
              this.createNewGridCell(potX, potY);
            }
            if(this.grid[potX][potY] && !this.grid[potX][potY].occupied){
              potentialAllocation = this.grid[potX][potY];
              break;
            }
            else if(this.grid[potX][potY] && this.grid[potX][potY].occupied){
              if(this.grid[potX][potY].item!="blocked"){
                potentialAllocation = null;
                break;
              }
            }
          }
          if(potentialAllocation && iterationTries < potentialAllocationDistance){
            labelTry++;
            var needToChangeDirection = false, keepgoing = true;
            //we have a potentialAllocation, we need to make sure there's clearance to the side in case we go in that direction next
            for(var i=1;i<station.label.hCount+1;i++){
              if(!this.grid[potentialAllocation.h+i]){
                this.grid[potentialAllocation.h+i] = {};
              }
              if(!this.grid[potentialAllocation.h+i][potentialAllocation.v]){
                this.createNewGridCell(potentialAllocation.h+i, potentialAllocation.v);
              }
              if(this.grid[potentialAllocation.h+i][potentialAllocation.v].occupied){
                potentialAllocation = null;
                keepgoing = false;
                restart = true;
                break;
              }
            }
            if(keepgoing){
              //now we need to see if the label will fit as well
              var labelY = potentialAllocation.v-1, labelX = potentialAllocation.h+1;
              var stationSpace = line.longestStation;
              console.log('stationSpace '+stationSpace);

              for(var v=0;v<stationSpace;v++){
                for(var h=0;h<stationSpace;h++){
                  if(!this.grid[labelX+h]){
                    this.createNewGridCell(labelX+h, labelY-v);
                  }
                    //no cell exists in that direction
                    //we should revisit this logic
                    // potentialAllocation = null;
                    // restart = true;
                    // break;
                  
                  if(this.grid[labelX+h][labelY-v] && this.grid[labelX+h][labelY-v].occupied){
                    //then the potential allocation won't work so we move on
                    potentialAllocation = null;
                    //needToChangeDirection = true; //just changed direction for now
                    // if(this.grid[labelX+h][labelY-v].item!="label"){
                    //   needToChangeDirection = true;
                    // }
                    restart = true;
                    break;
                  }
                  else{
                    // if(h==station.label.hCount-1){
                    //   //we have space horizontally
                    //   if(direction==4 || direction==6){
                    //     needToChangeDirection = true;
                    //   }
                    // }
                    if(!this.grid[labelX+h][labelY-v]){
                      this.createNewGridCell(labelX+h,labelY-v);
                    }
                    reservedCells.push(this.grid[labelX+h][labelY-v]);
                    if(v==stationSpace-1 && h==stationSpace-1){
                      //we have space for the label and the station
                      if(lastStation){
                        //connect the dots back to the last station if we're going up
                        var dotCount = (direction==2)?lastStation.label.hCount:station.label.hCount;
                        if(direction==2){
                          for(var i=0;i<lastStation.label.hCount+1;i++){
                            this.useCell(potentialAllocation.h,potentialAllocation.v+i, "blocked");
                          }
                        }
                        for(var i=1;i<stationSpace+1;i++){
                          this.useCell(potentialAllocation.h+i,potentialAllocation.v, "blocked");
                          this.useCell(potentialAllocation.h,potentialAllocation.v-i, "blocked");
                        }
                      }
                      this.useCell(potentialAllocation.h, potentialAllocation.v, "station");
                      for(var r=0;r<reservedCells.length;r++){
                        this.useCell(reservedCells[r].h, reservedCells[r].v, "label");
                      }
                      station.gridLoc = potentialAllocation;
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
          }
          else{
            console.log('we probably need to change the direction of the line');
            changeDirection.call(this);
          }
        }

        function changeDirection(){
            directionsTried.push(direction);
            switch (direction) {
              case 2: //up
              case 8:
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
                if(!this.stations[lines[l].stations[lS].name]){
                  this.stations[lines[l].stations[lS].name] = {lines:[lines[l].name], linesDrawn:0, status:lines[l].stations[lS].status, mode:"normal"};
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
        this.lines = lines;
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

        //before understanding where the first station can go we need to understand how much room the label needs
        var label = this.stations[this.lines[0].stations[0].name].label;
        startCellX = 1;
        startCellY = Math.ceil(this.gridSize.y/2);

        //draw the first part of the line
        for (var s=0;s<stationCount;s++){
          //based on the width of the label mark the relevant cells unusable
          var label = this.stations[this.lines[0].stations[s].name].label;
          if(s<stationCount){
            for(var i=0;i<this.lines[0].longestStation+1;i++){
              this.useCell(startCellX+i,startCellY, "blocked");
              this.useCell(startCellX,startCellY-i, "blocked");
            }
          }

          this.useCell(startCellX, startCellY, "station");
          gridLoc = this.grid[startCellX][startCellY];
          this.lines[0].stations[s].gridLoc = gridLoc;
          this.stations[this.lines[0].stations[s].name].gridLoc = gridLoc
          console.log('set gridloc for '+this.lines[0].stations[s].name);

          //allocate the position for the station label starting 1 cell immediately up and right of the station
          var labelY = startCellY-1, labelX = startCellX+1;
          for(var v=0;v<this.lines[0].longestStation;v++){
            for(var h=0;h<this.lines[0].longestStation;h++){
              this.useCell(labelX+h,labelY-v, "label");
              if(v==0&&h==0){
                this.stations[this.lines[0].stations[s].name].labelLoc = this.grid[labelX][labelY];
              }
            }
          }
          var station = this.lines[0].stations[s];

          //now we move to what would effectively be the end of the label
          startCellX += label.hCount+1;

          if(s<stationCount){
            //this.pen.lineTo(startCellX * cellWidth, startCellY* cellHeight);
            // this.pen.arc(station.gridPosition.x, station.gridPosition.y, 1, 0, Math.PI * 2);
            // this.pen.stroke();
            // this.pen.fill()
          }
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
          console.log('Processing '+this.lines[l].name);
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
                console.log(this.lines[l].stations[c].name+' is a shared station');
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
                        console.log('something went wrong');
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
          console.log(stationsDrawn);
        }
      }

    },
    useCell:{
      value: function(h, v, item){
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
            var longest = this.cellWidth * 5;
            this.labelPaper.pen.font = this.fontWeight+" "+ this.fontSize +"px "+this.fontFamily;
            var longestSize = this.labelPaper.pen.measureText(longest);
            var longestLine = 0;
            var hCount=0, vCount=0, lines=[];
            var line = "";
            for (var i=0;i<words.length;i++){
              var lineLength = this.labelPaper.pen.measureText(line+" "+words[i]);
              if(lineLength.width<=longest || line.split(" ").length <= 1){
                line += words[i];
                if(i<words.length-1){
                  line += " ";
                }
              }
              else{
                //we start a new line
                lines.push(line);
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
                  if(!this.lines[l].longestStation){
                    this.lines[l].longestStation = 0;
                  }
                  this.lines[l].longestStation = Math.max(this.lines[l].longestStation, Math.ceil(lineLength/this.cellWidth));
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
            if(!this.grid[x][this.baseY + (i*iteration)].occupied){
              allocatedY = this.baseY + (i*iteration);
              foundValidY = true;
              return allocatedY;
            }
            tries++;
          }
          //then we try looking up
          for(var i=0;i<8;i++){
            if(!this.grid[x][this.baseY - (i*iteration)].occupied){
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
        var mapWidth = this.boundRight -  this.boundLeft;
        var mapHeight = this.boundBottom - this.boundTop;
        if(mapWidth < this.width){
          this.posX = (this.width - mapWidth) / 2;
        }
        else{
          this.posX = 0;
        }
        this.posY = ((this.height - mapHeight) / 2) - this.boundTop;
        console.log('height '+this.height);
        console.log('top '+this.boundTop);
        console.log('bottom ' +this.boundBottom);
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
            this.stations[s].linesDrawn = 0;
          }
        }
        this.linePaper.canvas.width = this.width;
        this.linePaper.pen.translate(this.posX, this.posY);
        var currX, currY, newX, newY, adjustmentX, adjustmentY;
        for (var l in this.lines){
          var stations = this.lines[l].stations;
          currX = this.stations[stations[0].name].gridLoc.center.x;
          currY = this.stations[stations[0].name].gridLoc.center.y;
          adjustmentX = 0;
          adjustmentY = 0;
          for (var i=0;i<stations.length;i++){
            this.linePaper.pen.beginPath();
            //check to see if this and the next station are shared
            if(this.stations[stations[i].name].lines.length > 1 && stations[i+1] && (this.stations[stations[i+1].name] && this.stations[stations[i+1].name].lines.length>1)){
              this.linePaper.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
              if(this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x){
                //the 2 stations do not run vertically so we can adjust the Y axis
                adjustmentY = (this.lineSpacing * this.stations[stations[i].name].linesDrawn);
                if(this.stations[stations[i].name].gridLoc.center.y != this.stations[stations[i+1].name].gridLoc.center.y){
                  //the 2 stations do not run horizontally either so we adjust both axis
                  adjustmentX = ((this.lineSpacing/2) * this.stations[stations[i].name].linesDrawn);
                }
              }
              else{
                //we shift to the right
                adjustmentX = (this.lineSpacing * this.stations[stations[i].name].linesDrawn);
                if(this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x){
                  //we shift to the right
                  adjustmentY = (this.lineSpacing * this.stations[stations[i].name].linesDrawn);
                }
              }
              if(i>0){
                this.linePaper.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
                this.linePaper.pen.stroke();
              }
              this.stations[stations[i].name].linesDrawn++;
              //this.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
            }
            else if(this.stations[stations[i].name].lines.length > 1 && stations[i+1] && (this.stations[stations[i+1].name] && this.stations[stations[i+1].name].lines.length==1)){
              this.linePaper.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
              if(this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x){
                //the 2 stations do not run vertically so we can reset the Y adjustment
                adjustmentX += adjustmentY;
                adjustmentY = 0;
                //adjustmentX += (this.lineWidth*this.stations[stations[i].name].linesDrawn);
              }
              if(this.stations[stations[i].name].gridLoc.center.y != this.stations[stations[i+1].name].gridLoc.center.y){
                //the 2 stations do not run vertically so we can reset the X adjustment
                adjustmentY += adjustmentX;
                adjustmentX = 0;
                //adjustmentY += (this.lineWidth*this.stations[stations[i].name].linesDrawn);
              }
              this.stations[stations[i].name].linesDrawn++;
              this.linePaper.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));

              this.linePaper.pen.stroke();
            }

            this.linePaper.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
            // this.stations[this.lines[l].stations[i].name].gridLoc.center = {
            //   x: (currX+adjustmentX),
            //   y: (currY+adjustmentY)
            // };
            if(Array.isArray(this.colours)){
              this.linePaper.pen.strokeStyle = this.colours[l];
            }
            else if(this.colours[this.lines[l].name]){
              this.linePaper.pen.strokeStyle = this.colours[this.lines[l].name];
            }
            else {
              this.linePaper.pen.strokeStyle = "black";
            }
            if(stations[i].status==0){
              this.linePaper.pen.strokeStyle = "#E2E2E2";
            }
            this.linePaper.pen.lineWidth = this.lineWidth;
            this.linePaper.pen.lineJoin = 'round';
            this.linePaper.pen.lineCap = 'round';

            if(stations[i+1]){
              currX = this.stations[stations[i+1].name].gridLoc.center.x;
              currY = this.stations[stations[i+1].name].gridLoc.center.y;

              this.linePaper.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
              this.linePaper.pen.stroke();
            }
          }
        }
      }

    },
    drawStations:{
      value: function(){
        this.stationPaper.canvas.width = this.width;
        this.stationPaper.pen.translate(this.posX, this.posY);
        for(var l=0; l<this.lines.length;l++){
          for(var i=0; i<this.lines[l].stations.length;i++){
            if(this.stations[this.lines[l].stations[i].name].gridLoc){
              var station = this.stations[this.lines[l].stations[i].name]
              var x = station.gridLoc.center.x;
              var y = station.gridLoc.center.y;
              // this.stationPaper.pen.save();
              // this.stationPaper.pen.moveTo(this.posX, this.posY);
              this.stationPaper.pen.beginPath();
              this.stationPaper.pen.strokeStyle = this.stationColour;
              if(station.status==0){
                this.stationPaper.pen.strokeStyle = "#E2E2E2";
              }
              this.stationPaper.pen.lineWidth = this.stationThickness;
              var qState = this.lines[l].stations[i].qState;
              this.stationPaper.pen.fillStyle = "white";
              var radius = Math.ceil(this.stationRadius - (this.lineWidth/2));
              if(station.status==3){
                radius = radius * this.highlightScale;
              }
              this.stationPaper.pen.arc(x, y, radius, 0, Math.PI * 2);
              //this.stationPaper.pen.scale(1+(this.zoomSize/10), 1+(this.zoomSize/10));
              this.stationPaper.pen.stroke();
              this.stationPaper.pen.fill()
              // this.stationPaper.pen.restore();
            }
          }
        }
      }

    },
    drawLabels:{
      value: function(){
        this.labelPaper.canvas.width = this.width;
        this.labelPaper.pen.translate(this.posX, this.posY);
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
              this.labelPaper.pen.fillStyle = "black";        
              if(station.status==0){
                this.labelPaper.pen.fillStyle = "#E2E2E2";
              }
              this.labelPaper.pen.translate(x, y);
              this.labelPaper.pen.rotate(-45*Math.PI / 180);

              for(var i=0;i<this.stations[s].label.lines.length;i++){
                this.labelPaper.pen.fillText(this.stations[s].label.lines[i], textX, textY);
                textY+= this.labelLineHeight;
              }
              //this.pen.fillStyle = "white";
              //this.pen.lineWidth = 3;

              //this.pen.arc(x, y, this.stationRadius, 0, Math.PI * 2);
              //this.pen.stroke();
              this.labelPaper.pen.fill()
              this.labelPaper.pen.restore()
          }
        }
      }

    },
    createEventListeners:{
      value: function(){
        var that = this;
        var events = new Events(this.eventPaper.canvas, this.eventPaper.pen);
        this.eventPaper.canvas.width = this.width;
        this.eventPaper.pen.translate(this.posX, this.posY);
        var context = events.getContext();
        events.setStage(function(){
          this.clear();
          for(var l=0; l<that.lines.length;l++){
            for(var i=0; i<that.lines[l].stations.length;i++){
              if(that.stations[that.lines[l].stations[i].name].gridLoc){
                var station = that.stations[that.lines[l].stations[i].name]
                var x = station.gridLoc.locs.a.x;
                var y = station.gridLoc.locs.a.y;

                this.beginRegion();
                context.beginPath();
                //context.moveTo(x,y);

                context.strokeStyle = "transparent";
                if(that.debug){
                  context.strokeStyle = "red";
                }

                context.rect(x, y, that.cellWidth, that.cellHeight);
                context.closePath();
                context.stroke();

                this.addRegionEventListener("mousedown", that.stationClicked.bind(that, that.lines[l].stations[i], false));
                this.addRegionEventListener("mouseover", that.highlightStation.bind(that, that.lines[l].stations[i], false));
                this.addRegionEventListener("mouseout", that.removeStationHighlight.bind(that, that.lines[l].stations[i], false));
                // this.addRegionEventListener("mousedown", function(){
                //   that.stationClicked(station);
                // });
                // this.addRegionEventListener("mouseover", function(){
                //   that.highlightStation(station);
                // });
                // this.addRegionEventListener("mouseout", function(){
                //   that.removeStationHighlight(station);
                // });
                this.closeRegion();
                // this.stationPaper.pen.beginPath();
                // this.stationPaper.pen.moveTo(x,y);
                //
                // this.stationPaper.pen.strokeStyle = "black";
                // this.stationPaper.pen.lineWidth = this.lineWidth;
                // var qState = this.lines[l].stations[i].qState;
                // this.stationPaper.pen.fillStyle = "white";
                // var radius = Math.ceil(this.stationRadius - (this.lineWidth/2));
                // this.stationPaper.pen.arc(x, y, radius, 0, Math.PI * 2);
                // this.stationPaper.pen.stroke();
                // this.stationPaper.pen.fill()
              }
            }
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

    },
    sampleData:{
      value: [
        {
          name: "Line 1",
          status: 1,
          stations: [
            {
              name: "Station A",
              status: 1
            },
            {
              name: "Station B",
              status: 1
            },
            {
              name: "Station C",
              status: 1
            },
            {
              name: "Station D",
              status: 1
            }
          ]
        },
        {
          name: "Line 2",
          status: 1,
          stations: [
            {
              name: "Station D",
              status: 1
            },
            {
              name: "Station E",
              status: 1
            },
            {
              name: "Station F",
              status: 1
            },
            {
              name: "Station G",
              status: 1
            }
          ]
        },
        {
          name: "Line 3",
          status: 1,
          stations: [
            {
              name: "Station D",
              status: 1
            },
            {
              name: "Station E",
              status: 1
            },
            {
              name: "Station H",
              status: 1
            },
            {
              name: "Station I",
              status: 1
            }
          ]
        }
      ]

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
      value: function(){
        
      }

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
