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
