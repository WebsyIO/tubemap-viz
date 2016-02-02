//function to assign grid positions to each station and draw them
$scope.processStations = function(){
  //use the first line as a starting point
  $scope.processFirstLine();

  for(var l=1; l < $scope.lines.length; l++){
    var stationCount = $scope.lines[l].stations.length;
    var startCellX;
    var startCellY;
    console.log($scope.lines[l].qText);
    var stationsDrawn = [];
    var currentStation = 0;
    var currentCheckpoint = 0;
    stationsDrawn = [];
    //now we continue drawing the rest of the lines
    //find the first shared station that's already been drawn
    while(stationsDrawn.length < $scope.lines[l].stations.length){
      for (var c=currentCheckpoint;c<stationCount;c++){
        if($scope.stations[$scope.lines[l].stations[c].qText].gridPosition){
          //we have a shared station
          currentStation = c;
          //stationsDrawn.push($scope.lines[l].stations[c].qText);
          break;
        }
        else{
          currentStation = null;
        }
      }
      if(currentStation!=null){
        for (var s=currentStation;s>currentCheckpoint-1;s--){
          if($scope.stations[$scope.lines[l].stations[s].qText].gridPosition){
            //then this is also a shared station and already drawn so we do nothing
            stationsDrawn.push($scope.lines[l].stations[s].qText);
          }
          else {
            //get the grid position of the last station
            var currX = $scope.stations[$scope.lines[l].stations[s+1].qText].gridPosition.x;
            var currY = $scope.stations[$scope.lines[l].stations[s+1].qText].gridPosition.y;
            //now use it to get the next position
            var newPos = $scope.allocateGridPosition(currX, currY, -1);
            $scope.allocateStation($scope.lines[l].stations[s], newPos.x, newPos.y);
            $scope.pen.beginPath();
            $scope.pen.strokeStyle = $scope.colours[l];
            $scope.pen.fillStyle = "white";
            $scope.pen.lineWidth = 3;
            $scope.pen.arc(newPos.x, newPos.y, 1, 0, Math.PI * 2);
            $scope.pen.stroke();
            $scope.pen.fill()
            stationsDrawn.push($scope.lines[l].stations[s].qText);
          }
        }
        currentCheckpoint = currentStation+1;
      }
      else {
        //there were no shared stations that have been drawn, so we start from the current checkpoint and work upwards
        for(var i=currentCheckpoint;i<$scope.lines[l].stations.length;i++){
          if(i==0){
            //then there are no shared stationsDrawn
            //we should draw this line at mid points between the y axis cells
            var currX = $scope.cellWidth;	//this puts it in the first x axis cell
            console.log('we got here but nothing is going to happen');
          }
          else {
            //get the grid position of the last station
            var currX = $scope.stations[$scope.lines[l].stations[i-1].qText].gridPosition.x;
            var currY = $scope.stations[$scope.lines[l].stations[i-1].qText].gridPosition.y;
            //now use it to get the next position
            var newPos = $scope.allocateGridPosition(currX, currY, 1);
            $scope.allocateStation($scope.lines[l].stations[i], newPos.x, newPos.y);
            stationsDrawn.push($scope.lines[l].stations[i].qText);
          }
        }
        currentCheckpoint = $scope.lines[l].stations.length;
      }
    }
  }
};
