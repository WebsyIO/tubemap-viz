$scope.allocateStation = function(station, x, y){
  if(!$scope.allocatedCells[x]){
    $scope.allocatedCells[x] = {};
  }
  $scope.allocatedCells[x][y] = true;
  $scope.stations[station.qText].gridPosition = {
    x: x,
    y: y
  };
  station.gridPosition = {
    x: x,
    y: y
  };
  console.log('allocating grid position');
}
