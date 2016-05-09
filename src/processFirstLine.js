value: function(){
  //this plots the points for the first line.
  //the first line is the one with the most shared stations
  //which we draw diagonally to set a baseline
  var stationCount = this.lines[0].stations.length;
  var startCellX, startCellY, startPixelY, gridLoc;

  //we should draw this line centrally to the grid horizontally
  var label = this.stations[this.lines[0].stations[0].name].label;
  var longestStation = this.lines[0].longestStation || 10;
  startCellX = 1;
  startCellY = Math.ceil(this.gridSize.y/2);

  //draw the first part of the line
  for (var s=0;s<stationCount;s++){
    //based on the width of the label mark the relevant cells unusable
    var label = this.stations[this.lines[0].stations[s].name].label;
    if(s<stationCount){
      for(var i=0;i<this.lines[0].longestStation+1;i++){
        this.useCell(startCellX+i,startCellY, "blocked");
        this.useCell(startCellX,startCellY-i, "blocked");
      }
    }

    this.useCell(startCellX, startCellY, "station");
    gridLoc = this.grid[startCellX][startCellY];
    this.lines[0].stations[s].gridLoc = gridLoc;
    this.stations[this.lines[0].stations[s].name].gridLoc = gridLoc

    //allocate the position for the station label starting 1 cell immediately up and right of the station
    var labelY = startCellY-1, labelX = startCellX+1;
    for(var v=0;v<this.lines[0].longestStation;v++){
      for(var h=0;h<this.lines[0].longestStation;h++){
        this.useCell(labelX+h,labelY-v, "label");
        if(v==0&&h==0){
          this.stations[this.lines[0].stations[s].name].labelLoc = this.grid[labelX][labelY];
        }
      }
    }
    var station = this.lines[0].stations[s];

    //now we move to what would effectively be the end of the label
    startCellX += longestStation+1;
  }
}
