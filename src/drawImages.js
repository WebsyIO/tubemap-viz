value: function(){
  var that = this;
  this.imagePaper.canvas.width = this.width;
  this.imagePaper.pen.translate(this.posX, this.posY);
  for(var l=0; l<this.lines.length;l++){
    for(var i=0; i<this.lines[l].stations.length;i++){
      if(this.stations[this.lines[l].stations[i].name].gridLoc){
        var station = this.stations[this.lines[l].stations[i].name]
        var x = station.gridLoc.center.x;
        var y = station.gridLoc.center.y;
        var radius = Math.ceil(this.stationRadius - (this.lineWidth/2));
        this.imagePaper.pen.beginPath();
        if(this.lines[l].stations[i].custom){
          var custom = this.lines[l].stations[i].custom;
          if(custom.image){
            if(custom.scale){
              radius = radius * custom.scale;
            }
            if(custom.imageSize){
              radius = (custom.imageSize / 2);
            }
            renderImage(x, y, custom.image, radius)
          }
        }
      }
    }
  }

  function renderImage(x, y, url, size){
    var im = new Image();
    im.onload = function(){
      var width = im.width;
      var height = im.height;
      var newWidth = (size*2);
      var newHeight = (size*2);
      that.imagePaper.pen.drawImage(im, (x - (newWidth/2)), (y-(newHeight/2)) , newWidth, newHeight);
    };
    im.src = url;
  }
}
