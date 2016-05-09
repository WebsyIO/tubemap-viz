value: function(){
  var that = this;
  this.stationPaper.canvas.width = this.width;
  this.stationPaper.pen.translate(this.posX, this.posY);
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
