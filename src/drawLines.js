//function to draw the lines between the stations
$scope.drawLines = function(){
  var currX, currY, newX, newY, adjustmentX, adjustmentY;
  for (var l in $scope.lines){
    var stations = $scope.lines[l].stations;
    currX = $scope.stations[stations[0].qText].gridPosition.x;
    currY = $scope.stations[stations[0].qText].gridPosition.y;
    adjustmentX = 0;
    adjustmentY = 0;
    for (var i=0;i<stations.length;i++){
      $scope.pen.beginPath();
      //check to see if this and the next station are shared
      if($scope.stations[stations[i].qText].lines.length > 1 && ($scope.stations[stations[i+1].qText] && $scope.stations[stations[i+1].qText].lines.length>1)){
        $scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
        if($scope.stations[stations[i].qText].gridPosition.x != $scope.stations[stations[i+1].qText].gridPosition.x){
          //the 2 stations do not run vertically so we can adjust the Y axis
          adjustmentY = ($scope.lineSpacing * $scope.stations[stations[i].qText].linesDrawn);
          if($scope.stations[stations[i].qText].gridPosition.y != $scope.stations[stations[i+1].qText].gridPosition.y){
            //the 2 stations do not run horizontally either so we adjust both axis
            adjustmentX = (($scope.lineSpacing/2) * $scope.stations[stations[i].qText].linesDrawn);
          }
        }
        else{
          //we shift to the right
          adjustmentX = ($scope.lineSpacing * $scope.stations[stations[i].qText].linesDrawn);
          if($scope.stations[stations[i].qText].gridPosition.x != $scope.stations[stations[i+1].qText].gridPosition.x){
            //we shift to the right
            adjustmentY = ($scope.lineSpacing * $scope.stations[stations[i].qText].linesDrawn);
          }
        }
        if(i>0){
          $scope.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
          $scope.pen.stroke();
        }
        $scope.stations[stations[i].qText].linesDrawn++;
        //$scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
      }
      else if($scope.stations[stations[i].qText].lines.length > 1 && ($scope.stations[stations[i+1].qText] && $scope.stations[stations[i+1].qText].lines.length==1)){
        $scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
        if($scope.stations[stations[i].qText].gridPosition.x != $scope.stations[stations[i+1].qText].gridPosition.x){
          //the 2 stations do not run vertically so we can reset the Y adjustment
          adjustmentX += adjustmentY;
          adjustmentY = 0;
          //adjustmentX += ($scope.lineWidth*$scope.stations[stations[i].qText].linesDrawn);
        }
        if($scope.stations[stations[i].qText].gridPosition.y != $scope.stations[stations[i+1].qText].gridPosition.y){
          //the 2 stations do not run vertically so we can reset the X adjustment
          adjustmentY += adjustmentX;
          adjustmentX = 0;
          //adjustmentY += ($scope.lineWidth*$scope.stations[stations[i].qText].linesDrawn);
        }
        $scope.stations[stations[i].qText].linesDrawn++;
        $scope.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));

        $scope.pen.stroke();
      }

      $scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
      $scope.lines[l].stations[i].gridPosition = {
        x: (currX+adjustmentX),
        y: (currY+adjustmentY)
      };
      $scope.pen.strokeStyle = stations[i].qState!="X"?$scope.colours[l]:"#E2E2E2";
      $scope.pen.lineWidth = $scope.lineWidth;
      $scope.pen.lineJoin = 'round';
      $scope.pen.lineCap = 'round';

      if(stations[i+1]){
        currX = $scope.stations[stations[i+1].qText].gridPosition.x;
        currY = $scope.stations[stations[i+1].qText].gridPosition.y;

        $scope.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
        $scope.pen.stroke();
      }
    }
  }
};
