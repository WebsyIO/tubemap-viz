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
