value: function(panning){
  //function to draw the lines between the stations
  if(panning && panning == true){
    //reset linesdrawn to 0 otherwise our lines will offset for every pixel we move
    for(var s in this.stations){
      this.stations[s].vLinesDrawn = 0;
      this.stations[s].hLinesDrawn = 0;
    }
  }
  this.linePaper.canvas.width = this.width;
  this.linePaper.pen.translate(this.posX, this.posY);
  var currX, currY, newX, newY, adjustmentX, adjustmentY, adjustedH, adjustedV, directionOfLine, hOdd, vOdd;
  for (var l in this.lines){
    var stations = this.lines[l].stations;
    currX = this.stations[stations[0].name].gridLoc.center.x;
    currY = this.stations[stations[0].name].gridLoc.center.y;
    adjustmentX = 0;
    adjustmentY = 0;
    for (var i=0;i<stations.length;i++){
      adjusted = false;
      this.linePaper.pen.beginPath();
      //check to see if this and the next station are shared
      if(this.stations[stations[i].name].lines.length > 1 && stations[i+1] && (this.stations[stations[i+1].name] && this.stations[stations[i+1].name].lines.length>1)){
        this.linePaper.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
        directionOfLine = (this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x) ? "h" : "v";
        if(this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x){
          hOdd = (this.stations[stations[i].name].hOddLinesDrawn <  this.stations[stations[i].name].hEvenLinesDrawn) == true ? 1 : -1;
          vOdd = (this.stations[stations[i].name].vOddLinesDrawn <  this.stations[stations[i].name].vEvenLinesDrawn) == true ? 1 : -1;
          //the 2 stations run horizontally so we can adjust the Y axis
          if(vOdd==1){
            adjustmentY = (this.lineSpacing * this.stations[stations[i].name].vOddLinesDrawn)*vOdd;
          }
          else{
            adjustmentY = (this.lineSpacing * this.stations[stations[i].name].vEvenLinesDrawn)*vOdd;
          }
          if(this.stations[stations[i].name].gridLoc.center.y != this.stations[stations[i+1].name].gridLoc.center.y){
            //the 2 stations run vertically either so we adjust both axis
            if(hOdd==1){
              adjustmentX = ((this.lineSpacing/2) * this.stations[stations[i].name].hOddLinesDrawn)*hOdd;
            }
            else{
              adjustmentX = ((this.lineSpacing/2) * this.stations[stations[i].name].hEvenLinesDrawn)*hOdd;
            }
          }
          adjustedH = (adjustmentX != 0);
          adjustedV = (adjustmentY != 0);
        }
        else{
          //we shift to the left
          vOdd = (this.stations[stations[i].name].vOddLinesDrawn <  this.stations[stations[i].name].vEvenLinesDrawn) == true ? 1 : -1;
          hOdd = (this.stations[stations[i].name].hOddLinesDrawn <  this.stations[stations[i].name].hEvenLinesDrawn) == true ? 1 : -1;
          if(vOdd==1){
            adjustmentY = (this.lineSpacing * this.stations[stations[i].name].vOddLinesDrawn)*vOdd;
          }
          else {
            adjustmentY = (this.lineSpacing * this.stations[stations[i].name].vEvenLinesDrawn)*vOdd;
          }
          if(this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x){
            //we shift to the right
            if(hOdd==1){
              adjustmentY = (this.lineSpacing * this.stations[stations[i].name].hOddLinesDrawn)*hOdd;
            }
            else {
              adjustmentY = (this.lineSpacing * this.stations[stations[i].name].hLinesDrawn)*hOdd;
            }
          }
          adjustedH = (adjustmentX != 0);
          adjustedV = (adjustmentY != 0);
        }
        if(i>0){
          this.linePaper.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
          this.linePaper.pen.stroke();
        }
        //this.stations[stations[i].name].linesDrawn++;
        //this.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
      }
      else if(this.stations[stations[i].name].lines.length > 1 && stations[i+1] && (this.stations[stations[i+1].name] && this.stations[stations[i+1].name].lines.length==1)){
        this.linePaper.pen.moveTo((currX+adjustmentX), (currY+adjustmentY));
        // if(this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x){
        //   //the 2 stations run horizontally so we can reset the Y adjustment
        //   isOdd = (this.stations[stations[i].name].hLinesDrawn % 2) == true ? -1 : 1;
        //   adjustmentY += adjustmentX;
        //   adjustmentX = 0;
        // }
        // if(this.stations[stations[i].name].gridLoc.center.y != this.stations[stations[i+1].name].gridLoc.center.y){
        //   //the 2 stations run vertically so we can reset the Y adjustment
        //   isOdd = (this.stations[stations[i].name].vLinesDrawn % 2) == true ? -1 : 1;
          adjustmentX = 0;
          adjustmentY = 0;
        //}
        adjustedH = (adjustmentX != 0);
        adjustedV = (adjustmentY != 0);
        //this.stations[stations[i].name].linesDrawn++;
        this.linePaper.pen.lineTo((currX+adjustmentX), (currY+adjustmentY));

        this.linePaper.pen.stroke();
      }

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
        currX = this.stations[stations[i+1].name].gridLoc.center.x;
        currY = this.stations[stations[i+1].name].gridLoc.center.y;
        if(stations[i].status==0 || stations[i+1].status==0){
          this.linePaper.pen.strokeStyle = this.inactiveColour;
        }
        this.linePaper.pen.lineTo((currX+adjustmentX), (currY+adjustmentY));
        this.linePaper.pen.stroke();
      }
      if(directionOfLine == "h"){
        // if(adjustedH){
        //   console.log("adj H");
          if(hOdd == 1){
            this.stations[stations[i].name].hOddLinesDrawn++;
          }
          else{
            this.stations[stations[i].name].hEvenLinesDrawn++;
          }
        // }
        // if(adjustedV){
        //   console.log("adj V");
          if(vOdd == 1){
            this.stations[stations[i].name].vOddLinesDrawn++;
          }
          else{
            this.stations[stations[i].name].vEvenLinesDrawn++;
          }
        // }
      }
      else if(directionOfLine == "v"){
        // if(adjustedH){
        //   console.log("adj H");
          if(hOdd == 1){
            this.stations[stations[i].name].hOddLinesDrawn++;
          }
          else{
            this.stations[stations[i].name].hEvenLinesDrawn++;
          }
        // }
        // if(adjustedV){
        //   console.log("adj V");
          if(vOdd == 1){
            this.stations[stations[i].name].vOddLinesDrawn++;
          }
          else{
            this.stations[stations[i].name].vEvenLinesDrawn++;
          }
        // }
      }
    }
  }
}
