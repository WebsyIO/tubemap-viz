value: function(element){
  var that = this;
  //interaction layer
  if(!element){
    if(this.eventPaper){
      element = this.eventPaper.canvas.parentElement;
    }
    else{
      return;
    }
  }
  //first remove the existing canvas
  if(this.eventPaper && this.eventPaper.canvas){
    this.eventPaper.canvas.remove();
  }
  //then add a new one
  var eventCanvas = document.createElement('canvas');
  this.eventPaper = {
    canvas: eventCanvas,
    pen: eventCanvas.getContext('2d')
  };
  this.eventPaper.canvas.style.position = "absolute";
  this.eventPaper.canvas.style.top = "0px";
  this.eventPaper.canvas.style.left = "0px";
  this.eventPaper.canvas.style.zIndex = "60";
  this.eventPaper.canvas.width = this.width;
  this.eventPaper.canvas.height = this.height;
  element.appendChild(this.eventPaper.canvas);

  var events = new Events(this.eventPaper.canvas, this.eventPaper.pen);

  this.eventPaper.canvas.width = this.width;
  this.eventPaper.pen.translate(this.posX, this.posY);
  var context = events.getContext();

  events.setStage(function(){
    this.clear();
    var stationsHandled = [];
    for(var l=0; l<that.lines.length;l++){
      for(var i=0; i<that.lines[l].stations.length;i++){
        if(that.stations[that.lines[l].stations[i].name].gridLoc && stationsHandled.indexOf(that.lines[l].stations[i].name)==-1){
          var station = that.stations[that.lines[l].stations[i].name];
          var x = station.gridLoc.locs.a.x;
          var y = station.gridLoc.locs.a.y;

          this.beginRegion();
          context.beginPath();

          context.strokeStyle = "transparent";
          if(that.debug){
            context.strokeStyle = "red";
          }

          context.rect(x, y, that.cellWidth, that.cellHeight);
          context.closePath();
          context.stroke();

          this.addRegionEventListener("mousedown", that.preClick.bind(that, that.lines[l].stations[i], true));
          this.addRegionEventListener("touchdown", that.preClick.bind(that, that.lines[l].stations[i], true));
          this.addRegionEventListener("mouseover", that.highlightStation.bind(that, that.lines[l].stations[i], false));
          this.addRegionEventListener("mouseout", that.removeStationHighlight.bind(that, that.lines[l].stations[i], false));

          this.closeRegion();
          stationsHandled.push(that.lines[l].stations[i].name);
        }
      }
    }
  });
}
