//function to allocate the grid position for the current station
$scope.allocateGridPosition = function(x, y, direction){
  //direction is either positive or negative
  //a positive value means the station should be progressing to the right and potentially up/down
  //a negative value means the station should be progressing to the left and potentially up/down
  //we search for a new cell in a semi-circular motion incrementing by 1 cell each pass
  var validAllocation = false;
  var iteration = 0;
  var newPos = {};
  //x = (x*direction);
  while (!validAllocation) {
    //can we move left/right
    if(!$scope.allocatedCells[(x+($scope.cellWidth*iteration))] || !$scope.allocatedCells[(x+($scope.cellWidth*iteration))][y]){
      newPos = {
        x: (x+(($scope.cellWidth*iteration)*direction)),
        y: y
      };
      validAllocation = true;
      return newPos;
    }
    //can we move up
    if(!$scope.allocatedCells[x] || !$scope.allocatedCells[x][(y-($scope.cellHeight*iteration))]){
      newPos = {
        x: x,
        y: (y-($scope.cellHeight*iteration))
      };
      validAllocation = true;
      return newPos;
    }
    //can we move down
    if(!$scope.allocatedCells[x] || !$scope.allocatedCells[x][(y+($scope.cellHeight*iteration))]){
      newPos = {
        x: x,
        y: (y+($scope.cellHeight*iteration))
      };
      validAllocation = true;
      return newPos;
    }
    //can we move up & left/right
    if(!$scope.allocatedCells[(x+($scope.cellWidth*iteration))] || !$scope.allocatedCells[(x+($scope.cellWidth*iteration))][(y-($scope.cellHeight*iteration))]){
      newPos = {
        x: (x+($scope.cellWidth*iteration)),
        y: (y-($scope.cellHeight*iteration))
      };
      validAllocation = true;
      return newPos;
    }
    //can we move down & left/right
    if(!$scope.allocatedCells[(x+($scope.cellWidth*iteration))] || !$scope.allocatedCells[(x+($scope.cellWidth*iteration))][(y+($scope.cellHeight*iteration))]){
      newPos = {
        x: (x+($scope.cellWidth*iteration)),
        y: (y+($scope.cellHeight*iteration))
      };
      validAllocation = true;
      return newPos;
    }
    //if we get here we increment for the next pass
    iteration++;
  }
};
