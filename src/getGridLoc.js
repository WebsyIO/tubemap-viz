$scope.getGridLoc = function(pixelX, pixelY){
  //gets the grid cell based on x and y pixels
  var gridX = Math.round(pixelX / $scope.cellWidth);
  var gridY = Math.round(pixelY / $scope.cellHeight);
  return $scope.grid[gridX][gridY];
};
