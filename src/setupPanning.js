value: function(){
  var that = this;
  var events = new Events(this.eventPaper.canvas, this.eventPaper.pen);
  var context = events.getContext();
  events.setStage(function(){
    this.clear();
    this.beginRegion();
    context.beginPath();
    context.rect(0, 0, that.width, that.height);
    this.addRegionEventListener("mousedown", that.startPan.bind(that, this, false));
    this.addRegionEventListener("mouseup", that.endPan.bind(that, this, false));
    this.addRegionEventListener("mousemove", that.pan.bind(that, this, false));
    context.closePath();
    context.stroke();
    this.closeRegion();
  });
}
