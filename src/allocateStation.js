$scope.allocateStation = function(station, loc){
  loc.occupied = true;
  loc.item = "station";
  $scope.stations[station.qText].gridLoc = loc;
  station.gridLoc = loc;  
}
