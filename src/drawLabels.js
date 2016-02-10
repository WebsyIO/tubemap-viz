$scope.drawLabels = function(){
  for(var s in $scope.stations){
    if($scope.stations[s].labelLoc){
        var x = $scope.stations[s].labelLoc.center.x;
        var y = $scope.stations[s].labelLoc.center.y;        
        var textX = 0, textY = 0;
        $scope.pen.save()
        $scope.pen.beginPath();
        //$scope.pen.moveTo(x,y);
        $scope.pen.textAlign = "left";
        $scope.pen.textBaseline = "middle";
        $scope.pen.fillStyle = "black";
        $scope.pen.translate(x, y);
        $scope.pen.rotate(-45*Math.PI / 180);

        for(var i=0;i<$scope.stations[s].label.lines.length;i++){
          $scope.pen.fillText($scope.stations[s].label.lines[i], textX, textY);
          textY+= $scope.labelLineHeight;
        }
        //$scope.pen.fillStyle = "white";
        //$scope.pen.lineWidth = 3;

        //$scope.pen.arc(x, y, $scope.stationRadius, 0, Math.PI * 2);
        //$scope.pen.stroke();
        $scope.pen.fill()
        $scope.pen.restore()
    }
  }
};
