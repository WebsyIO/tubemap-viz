//debug function to draw the grid
$scope.drawGrid = function(){
  var currX = 0, currY = 0;
  //draw the grid (debugging only)
  //we want a maximum of 10 possible stations across both axis
  //but we should have 20 grid cells to work with
  $scope.pen.beginPath();
  $scope.pen.strokeStyle = "#E2E2E2";
  for (var i=0; i<$scope.gridSize; i++){
    for(var j=0; j<($scope.gridSize); j++){
      $scope.pen.rect(currX, currY, $scope.cellWidth, $scope.cellHeight);
      currX += $scope.cellWidth;
    }
    currX = 0;
    currY += $scope.cellHeight;
  }
  $scope.pen.stroke();
};
