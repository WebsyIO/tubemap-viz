$scope.drawStations = function(){
  for(var l in $scope.lines){
    for(var i=0; i<$scope.lines[l].stations.length;i++){
      var x = $scope.lines[l].stations[i].gridPosition.x;
      var y = $scope.lines[l].stations[i].gridPosition.y;

      $scope.pen.beginPath();
      $scope.pen.moveTo(x,y);

      $scope.pen.strokeStyle = "black";
      $scope.pen.fillStyle = "white";
      $scope.pen.lineWidth = 3;

      $scope.pen.arc(x, y, $scope.stationRadius, 0, Math.PI * 2);
      $scope.pen.stroke();
      $scope.pen.fill()
    }
  }
};
