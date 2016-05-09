value: function(element, data){
  if(element){
    element.innerHTML = "";
    if(!this.listening){
      console.log('adding event listeners to element');
      element.addEventListener('resize', this.render.bind(this), false);
      //element.addEventListener('wheel', this.zoom.bind(this), false);
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
