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
    if(this.zoomControlBorderColour){
      this.zoomPaper.pen.strokeStyle = this.zoomControlBorderColour;
    }
    this.zoomPaper.pen.lineWidth = 1/this.pixelMultiplier;

    if(this.zoomControlStyle=="square"){
      this.zoomPaper.pen.rect(this.width - 37, 28, 24, 24);
    }
    else{
      this.zoomPaper.pen.arc(this.width - 25, 40, 12, 0, Math.PI * 2);
    }
    this.zoomPaper.pen.closePath();
    this.zoomPaper.pen.fill();
    if(this.zoomControlBorderColour){
      this.zoomPaper.pen.stroke();
    }
    this.zoomPaper.pen.beginPath();
    if(this.zoomLevel > this.minZoom){
      this.zoomPaper.pen.fillStyle = this.zoomControlBackgroundColour;
    }
    else{
      this.zoomPaper.pen.fillStyle = this.inactiveColour;
    }
    if(this.zoomControlBorderColour){
      this.zoomPaper.pen.strokeStyle = this.zoomControlBorderColour;
    }
    this.zoomPaper.pen.lineWidth = 1/this.pixelMultiplier;
    if(this.zoomControlStyle=="square"){
      this.zoomPaper.pen.rect(this.width - 37, 58, 24, 24);
    }
    else{
      this.zoomPaper.pen.arc(this.width - 25, 70, 12, 0, Math.PI * 2);
    }
    this.zoomPaper.pen.closePath();
    this.zoomPaper.pen.fill();
    if(this.zoomControlBorderColour){
      this.zoomPaper.pen.stroke();
    }
    this.zoomPaper.pen.beginPath();
    this.zoomPaper.pen.fillStyle = this.zoomControlTextColour;
    this.zoomPaper.pen.font = "16px "+this.fontFamily
    this.zoomPaper.pen.textAlign = "center";
    this.zoomPaper.pen.textBaseline = "middle";
    this.zoomPaper.pen.fillText("+", this.width - 25, 41);
    // this.zoomPaper.pen.closePath();
    // this.zoomPaper.pen.fill();
    // this.zoomPaper.pen.beginPath();
    this.zoomPaper.pen.fillText("-", this.width - 25, 69);
    this.zoomPaper.pen.closePath();
    this.zoomPaper.pen.fill();

  }
}
