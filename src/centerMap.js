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
