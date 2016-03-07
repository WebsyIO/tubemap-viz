value: function(panning){
  //function to draw the lines between the stations
  if(panning && panning == true){
    //reset linesdrawn to 0 otherwise our lines will offset for every pixel we move
    for(var s in this.stations){
      this.stations[s].linesDrawn = 0;
    }
  }
  this.linePaper.canvas.width = this.width;
  this.linePaper.pen.translate(this.posX, this.posY);
  var currX, currY, newX, newY, adjustmentX, adjustmentY;
  for (var l in this.lines){
    var stations = this.lines[l].stations;
    currX = this.stations[stations[0].name].gridLoc.center.x;
    currY = this.stations[stations[0].name].gridLoc.center.y;
    adjustmentX = 0;
    adjustmentY = 0;
    for (var i=0;i<stations.length;i++){
      this.linePaper.pen.beginPath();
      //check to see if this and the next station are shared
      if(this.stations[stations[i].name].lines.length > 1 && stations[i+1] && (this.stations[stations[i+1].name] && this.stations[stations[i+1].name].lines.length>1)){
        this.linePaper.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
        if(this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x){
          //the 2 stations do not run vertically so we can adjust the Y axis
          adjustmentY = (this.lineSpacing * this.stations[stations[i].name].linesDrawn);
          if(this.stations[stations[i].name].gridLoc.center.y != this.stations[stations[i+1].name].gridLoc.center.y){
            //the 2 stations do not run horizontally either so we adjust both axis
            adjustmentX = ((this.lineSpacing/2) * this.stations[stations[i].name].linesDrawn);
          }
        }
        else{
          //we shift to the right
          adjustmentX = (this.lineSpacing * this.stations[stations[i].name].linesDrawn);
          if(this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x){
            //we shift to the right
            adjustmentY = (this.lineSpacing * this.stations[stations[i].name].linesDrawn);
          }
        }
        if(i>0){
          this.linePaper.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
          this.linePaper.pen.stroke();
        }
        this.stations[stations[i].name].linesDrawn++;
        //this.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
      }
      else if(this.stations[stations[i].name].lines.length > 1 && stations[i+1] && (this.stations[stations[i+1].name] && this.stations[stations[i+1].name].lines.length==1)){
        this.linePaper.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
        if(this.stations[stations[i].name].gridLoc.center.x != this.stations[stations[i+1].name].gridLoc.center.x){
          //the 2 stations do not run vertically so we can reset the Y adjustment
          adjustmentX += adjustmentY;
          adjustmentY = 0;
          //adjustmentX += (this.lineWidth*this.stations[stations[i].name].linesDrawn);
        }
        if(this.stations[stations[i].name].gridLoc.center.y != this.stations[stations[i+1].name].gridLoc.center.y){
          //the 2 stations do not run vertically so we can reset the X adjustment
          adjustmentY += adjustmentX;
          adjustmentX = 0;
          //adjustmentY += (this.lineWidth*this.stations[stations[i].name].linesDrawn);
        }
        this.stations[stations[i].name].linesDrawn++;
        this.linePaper.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));

        this.linePaper.pen.stroke();
      }

      this.linePaper.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
      // this.stations[this.lines[l].stations[i].name].gridLoc.center = {
      //   x: (currX+adjustmentX),
      //   y: (currY+adjustmentY)
      // };
      if(Array.isArray(this.colours)){
        this.linePaper.pen.strokeStyle = this.colours[l];
      }
      else if(this.colours[this.lines[l].name]){
        this.linePaper.pen.strokeStyle = this.colours[this.lines[l].name];
      }
      else {
        this.linePaper.pen.strokeStyle = "black";
      }
      if(stations[i].status==0){
        this.linePaper.pen.strokeStyle = "#E2E2E2";
      }
      this.linePaper.pen.lineWidth = this.lineWidth;
      this.linePaper.pen.lineJoin = 'round';
      this.linePaper.pen.lineCap = 'round';

      if(stations[i+1]){
        currX = this.stations[stations[i+1].name].gridLoc.center.x;
        currY = this.stations[stations[i+1].name].gridLoc.center.y;

        this.linePaper.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
        this.linePaper.pen.stroke();
      }
    }
  }
}
