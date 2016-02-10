$scope.processFirstLine = function(){
  //this plots the points for the first line.
  //the first line is the one with the most shared stations
  //which we draw diagonally to set a baseline
  var stationCount = $scope.lines[0].stations.length;
  var startCellX, startCellY, startPixelY, gridLoc;

  //we should draw this line centrally to the grid horizontally

  //before understanding where the first station can go we need to understand how much room the label needs
  var label = $scope.stations[$scope.lines[0].stations[0].qText].label;
  startCellX = 0;
  startCellY = Math.ceil($scope.gridSize.y/2);

  //draw the first part of the line
  for (var s=0;s<stationCount;s++){
    //based on the width of the label mark the relevant cells unusable
    for(var i=0;i<label.hCount+1;i++){
      $scope.useCell(startCellX+i,startCellY, "blocked");
    }

    $scope.useCell(startCellX, startCellY, "station");
    gridLoc = $scope.grid[startCellX][startCellY];
    $scope.lines[0].stations[s].gridLoc = gridLoc;
    $scope.stations[$scope.lines[0].stations[s].qText].gridLoc = gridLoc
    var label = $scope.stations[$scope.lines[0].stations[s].qText].label;

    //allocate the position for the station label starting 1 cell immediately up and right of the station
    var labelY = startCellY-1, labelX = startCellX+1;
    for(var v=0;v<label.vCount;v++){
      for(var h=0;h<label.hCount;h++){
        if(v==0&&h==0){
          $scope.stations[$scope.lines[0].stations[s].qText].labelLoc = $scope.grid[labelX][labelY];
        }
        $scope.useCell(labelX+h,labelY-v, "label");
      }
    }
    var station = $scope.lines[0].stations[s];

    //now we move to what would effectively be the end of the label
    startCellX += label.hCount+1;

    if(s<stationCount){
      //$scope.pen.lineTo(startCellX * cellWidth, startCellY* cellHeight);
      // $scope.pen.arc(station.gridPosition.x, station.gridPosition.y, 1, 0, Math.PI * 2);
      // $scope.pen.stroke();
      // $scope.pen.fill()
    }
  }
};
