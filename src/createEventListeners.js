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
