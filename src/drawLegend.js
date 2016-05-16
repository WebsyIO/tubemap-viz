value: function(){
  //the legend calculations assume that the line will be 50px wide in the legend
  //first we calculate the size of the legend and render a semi-transparent background
  //the legend will have a 20px margin
  //each item will be separate by 10px
  this.legendPaper.canvas.width = this.width;
  var legendWidth = 100, legendHeight = 40, longestLabel = 0;
  for (var i=0;i<this.legend.length;i++){
    var labelWidth = this.legendPaper.pen.measureText(this.legend[i].name);
    longestLabel = Math.max(longestLabel, labelWidth.width);
    legendHeight+=10;
  }
  legendHeight-=10;
  legendWidth+=longestLabel;
  this.legendPaper.pen.save();
  this.legendPaper.pen.beginPath();
  this.legendPaper.pen.rect(0, 0, legendWidth, legendHeight);
  this.legendPaper.pen.fillStyle = this.legendBackgroundColour;
  this.legendPaper.pen.fill();
  this.legendPaper.pen.closePath();
  this.legendPaper.pen.restore();
  var startX = 20, startY = 20;
  for (var i=0;i<this.legend.length;i++){
    this.legendPaper.pen.beginPath();
    this.legendPaper.pen.moveTo(startX, startY);
    if(this.legend[i].colour){
      this.legendPaper.pen.strokeStyle = this.legend[i].colour;
    }
    else {
      this.legendPaper.pen.strokeStyle = "black";
    }
    this.legendPaper.pen.lineWidth = this.lineWidth;
    this.legendPaper.pen.lineJoin = 'round';
    this.legendPaper.pen.lineCap = 'round';
    this.legendPaper.pen.lineTo((startX+50), startY);
    this.legendPaper.pen.stroke();
    this.legendPaper.pen.beginPath();
    this.legendPaper.pen.moveTo((startX+60), startY);
    this.legendPaper.pen.font = this.legendFontWeight+" "+ this.legendFontSize +"px "+this.fontFamily;
    this.legendPaper.pen.textAlign = "left";
    this.legendPaper.pen.textBaseline = "middle";
    this.legendPaper.pen.fillStyle = this.legendFontColour;
    this.legendPaper.pen.fillText(this.legend[i].name, (startX+60), startY);
    this.legendPaper.pen.fill();
    startY+=(this.lineWidth+10);
  }
}
