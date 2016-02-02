$scope.processFirstLine = function(){
  //this plots the points for the first line.
  //the first line is the one with the most shared stations
  //which we draw diagonally (with a nose and tail) to set a baseline
  //or if the line is bigger than our gridsize + 4 then we draw it in a circular formation
  var stationCount = $scope.lines[0].stations.length;
  var startCellX;
  var startCellY;
  if($scope.lines[0].stations.length > ($scope.gridSize+4)){
    //we should draw the line centrally to the grid in a circular formation

  }
  else{
    //we should draw this line centrally to the grid in a diagonal formation
    //find the starting x cell by
    startCellX = Math.floor((($scope.gridSize)-stationCount)/2);
    startCellY = Math.floor(($scope.gridSize-(stationCount))/2);
    //draw the first part of the line
    //$scope.pen.moveTo((startCellX*cellWidth), (startCellY*cellHeight));
    for (var s=0;s<stationCount;s++){
      //the first and last station links are horizontal, the rest are diagonal
      $scope.lines[0].stations[s].gridPosition = {x: startCellX * $scope.cellWidth, y: startCellY* $scope.cellHeight};
      $scope.stations[$scope.lines[0].stations[s].qText].gridPosition = $scope.lines[0].stations[s].gridPosition;
      var station = $scope.lines[0].stations[s];
      if(!$scope.allocatedCells[station.gridPosition.x]){
        $scope.allocatedCells[station.gridPosition.x] = {
        }
        $scope.allocatedCells[station.gridPosition.x][station.gridPosition.y] = true;
      }
      $scope.pen.beginPath();
      $scope.pen.moveTo(station.gridPosition.x, station.gridPosition.y);
      //$scope.pen.strokeStyle = station.qState!="X"?colours[l]:"#E2E2E2";
      //$scope.pen.lineWidth = lineWidth;
      $scope.pen.strokeStyle = "black";
      $scope.pen.fillStyle = "white";
      $scope.pen.lineWidth = 3;

        startCellX++;
        startCellY++;

      if(s<stationCount){
        //$scope.pen.lineTo(startCellX * cellWidth, startCellY* cellHeight);
        $scope.pen.arc(station.gridPosition.x, station.gridPosition.y, 1, 0, Math.PI * 2);
        $scope.pen.stroke();
        $scope.pen.fill()
      }
    }
  }
};
