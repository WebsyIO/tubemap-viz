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
