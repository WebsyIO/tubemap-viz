$scope.drawStations = function(){
  for(var l=0; l<$scope.lines.length;l++){
    for(var i=0; i<$scope.lines[l].stations.length;i++){
      if($scope.stations[$scope.lines[l].stations[i].qText].gridLoc){
        var x = $scope.stations[$scope.lines[l].stations[i].qText].gridLoc.center.x;
        var y = $scope.stations[$scope.lines[l].stations[i].qText].gridLoc.center.y;

        $scope.pen.beginPath();
        $scope.pen.moveTo(x,y);

        $scope.pen.strokeStyle = "black";
        $scope.pen.lineWidth = 6;
        var qState = $scope.lines[l].stations[i].qState;
        $scope.pen.fillStyle = "white";

        $scope.pen.arc(x, y, $scope.stationRadius, 0, Math.PI * 2);
        $scope.pen.stroke();
        $scope.pen.fill()
      }
    }
  }
};
