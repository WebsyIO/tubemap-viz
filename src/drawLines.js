value: function(panning){
  //function to draw the lines between the stations
  if(panning && panning == true){
    //reset linesdrawn to 0 otherwise our lines will offset for every pixel we move
    for(var s in this.stations){
      this.stations[s].vLinesDrawn = 0;
      this.stations[s].vLeftLinesDrawn = 0;
      this.stations[s].vRightLinesDrawn = 0;
      this.stations[s].hLinesDrawn = 0;
      this.stations[s].hAboveLinesDrawn = 0;
      this.stations[s].hBelowLinesDrawn = 0;
    }
  }
  this.linePaper.canvas.width = this.width;
  this.linePaper.pen.translate(this.posX, this.posY);
  this.linePaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);  
  var currX, currY, newX, newY, adjustmentX, adjustmentY, adjustedH, adjustedV, directionOfLine, previousDirection, hLeft, vAbove;
  for (var l in this.lines){
    var stations = this.lines[l].stations;
    currX = this.stations[stations[0].name].gridLoc.center.x;
    currY = this.stations[stations[0].name].gridLoc.center.y;
    adjustmentX = 0;
    adjustmentY = 0;

    for (var i=0;i<stations.length;i++){
      this.linePaper.pen.beginPath();
      this.linePaper.pen.moveTo((currX+adjustmentX), (currY+adjustmentY));
      if(this.lines[l].colour){
        this.linePaper.pen.strokeStyle = this.lines[l].colour;
      }
      else if(Array.isArray(this.colours)){
        this.linePaper.pen.strokeStyle = this.colours[l];
      }
      else if(this.colours[this.lines[l].name]){
        this.linePaper.pen.strokeStyle = this.colours[this.lines[l].name];
      }
      else {
        this.linePaper.pen.strokeStyle = "black";
      }
      if(stations[i].status==0){
        this.linePaper.pen.strokeStyle = this.inactiveColour;
      }
      this.linePaper.pen.lineWidth = this.lineWidth;
      this.linePaper.pen.lineJoin = 'round';
      this.linePaper.pen.lineCap = 'round';


      if(stations[i+1]){

        if(this.stations[stations[i].name].gridLoc.center.x == this.stations[stations[i+1].name].gridLoc.center.x){
          //the line runs vertically
          directionOfLine = "v";
          vLeft = (this.stations[stations[i].name].vLeftLinesDrawn <=  this.stations[stations[i].name].vRightLinesDrawn) == true ? -1 : 1;
          if(this.stations[stations[i].name].vLinesDrawn > 0 && this.stations[stations[i+1].name].vLinesDrawn > 0){
            if(vLeft==-1){
              adjustmentX = (this.lineSpacing * vLeft) + (this.lineSpacing * this.stations[stations[i].name].vLeftLinesDrawn * vLeft);
            }
            else{
              adjustmentX = (this.lineSpacing * vLeft) + (this.lineSpacing * this.stations[stations[i].name].vRightLinesDrawn * vLeft);
            }
            if(i==0){
              this.linePaper.pen.moveTo((currX+adjustmentX), (currY));
            }
          }
        }
        else if (this.stations[stations[i].name].gridLoc.center.y == this.stations[stations[i+1].name].gridLoc.center.y) {
          //the line runs horizontally
          directionOfLine = "h";
          hBelow = (this.stations[stations[i].name].hBelowLinesDrawn <=  this.stations[stations[i].name].hAboveLinesDrawn) == true ? 1 : -1;
          if(this.stations[stations[i].name].hLinesDrawn > 0 && this.stations[stations[i+1].name].hLinesDrawn > 0){
            if(hBelow==1){
              adjustmentY = (this.lineSpacing * hBelow) + (this.lineSpacing * this.stations[stations[i].name].hBelowLinesDrawn * hBelow);
            }
            else{
              adjustmentY = (this.lineSpacing * hBelow) + (this.lineSpacing * this.stations[stations[i].name].hAboveLinesDrawn * hBelow);
            }
            if(i==0){
              this.linePaper.pen.moveTo((currX), (currY+adjustmentY));
            }
          }
        }
        if(directionOfLine != previousDirection){
          if(directionOfLine == "h"){
            adjustmentX = 0;
          }
          else{
            adjustmentY = 0;
          }
        }
        currX = this.stations[stations[i+1].name].gridLoc.center.x;
        currY = this.stations[stations[i+1].name].gridLoc.center.y;
        if(stations[i].status==0 || stations[i+1].status==0){
          this.linePaper.pen.strokeStyle = this.inactiveColour;
        }
        this.linePaper.pen.lineTo((currX+adjustmentX), (currY+adjustmentY));
        this.linePaper.pen.stroke();

        if(directionOfLine=="h"){
          if(hBelow==1 && this.stations[stations[i].name].hLinesDrawn > 0){
            this.stations[stations[i].name].hBelowLinesDrawn++;
          }
          else if(this.stations[stations[i].name].hLinesDrawn > 0){
            this.stations[stations[i].name].hAboveLinesDrawn++;
          }
          this.stations[stations[i].name].hLinesDrawn++;
          if(previousDirection=="v"){
            this.stations[stations[i].name].vLinesDrawn++;
          }
        }
        else{
          if(vLeft==-1 && this.stations[stations[i].name].vLinesDrawn > 0){
            this.stations[stations[i].name].vLeftLinesDrawn++;
          }
          else if(this.stations[stations[i].name].vLinesDrawn > 0){
            this.stations[stations[i].name].vRightLinesDrawn++;
          }
          this.stations[stations[i].name].vLinesDrawn++;
          if(previousDirection=="h"){
            this.stations[stations[i].name].hLinesDrawn++;
          }
        }
        previousDirection = directionOfLine;
      }
    }
  }
}
