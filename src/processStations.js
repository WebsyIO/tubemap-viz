//function to assign grid positions to each station and draw them
$scope.processStations = function(){
  //use the first line as a starting point
  $scope.processFirstLine();

  for(var l=1; l < $scope.lines.length; l++){
    var stationCount = $scope.lines[l].stations.length;
    var startCellX;
    var startCellY;

    var stationsDrawn = [];
    var currentStation = 0;
    var currentCheckpoint = 0;
    var direction;
    stationsDrawn = [];
    //now we continue drawing the rest of the lines
    //find the first shared station that's already been drawn
    while(stationsDrawn.length < $scope.lines[l].stations.length){
      for (var c=currentCheckpoint;c<stationCount;c++){
        if($scope.stations[$scope.lines[l].stations[c].qText].gridLoc){
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
          var newLoc, allocation;
          var baseStation = $scope.stations[$scope.lines[l].stations[currentStation].qText].gridLoc;
          var currLoc = $scope.stations[$scope.lines[l].stations[s].qText].gridLoc;
          if(currLoc){
            //this is a shared station, we'll compare it with the previous station to see what direction we're going in
            //we don't need to take any other action on a share station
            if($scope.lines[l].stations[s+1]){
              var prevLoc = $scope.stations[$scope.lines[l].stations[s+1].qText].gridLoc;
              if(prevLoc){
                if(prevLoc.v == currLoc.v){
                  //we're travelling horizontally
                  direction = 4;  //left because we're counting down through the stations
                }
                else if(prevLoc.h == currLoc.h){
                  //we're travelling vertically
                  direction = prevLoc.v > currLoc.v ? 2 : 8;  //2=up, 8=down
                }
                else{
                  //in theory we shouldn't get here because we're not drawing diagonal lines
                  console.log('something went wrong');
                }
              }
            }
            stationsDrawn.push($scope.lines[l].stations[s].qText);
          }
          else {
            //get the grid position of the last station
            var prevLoc = $scope.stations[$scope.lines[l].stations[s+1].qText].gridLoc;
            var h = prevLoc.h;
            var v = prevLoc.v;
            //now use it to get the next position
            direction = $scope.allocateGridPosition(h, v, $scope.stations[$scope.lines[l].stations[s].qText], -1, direction);
            //$scope.allocateStation($scope.lines[l].stations[s], newLoc);
            stationsDrawn.push($scope.lines[l].stations[s].qText);
          }
          // $scope.pen.beginPath();
          // $scope.pen.strokeStyle = $scope.colours[l];
          // $scope.pen.fillStyle = $scope.colours[l];
          // //$scope.pen.rect(newLoc.locs.a.x, newLoc.locs.a.y, $scope.cellWidth, $scope.cellHeight);
          // //$scope.pen.lineWidth = 3;
          // $scope.pen.arc(newLoc.center.x, newLoc.center.y, 5, 0, Math.PI * 2);
          // //$scope.pen.stroke();
          // $scope.pen.fill()

        }
        currentCheckpoint = currentStation+1;
      }
      else {
        //there were no shared stations that have been drawn, so we start from the current checkpoint and work upwards
        for(var i=currentCheckpoint;i<$scope.lines[l].stations.length;i++){
          if(i==0){
            //we're on a new line with no shared stations
            var y = $scope.getFreeY(0);
            direction = $scope.allocateGridPosition(0,y, $scope.lines[l].stations[i], 1, 6);
            // $scope.allocateStation($scope.lines[l].stations[i], newLoc);
            // $scope.pen.beginPath();
            // $scope.pen.fillStyle = $scope.colours[l];
            // //$scope.pen.rect(newLoc.locs.a.x, newLoc.locs.a.y, $scope.cellWidth, $scope.cellHeight);
            // $scope.pen.arc(newLoc.center.x, newLoc.center.y, 5, 0, Math.PI * 2);
            // $scope.pen.fill()
            stationsDrawn.push($scope.lines[l].stations[i].qText);
          }
          else {
            //get the grid position of the last station
            var h = $scope.stations[$scope.lines[l].stations[i-1].qText].gridLoc.h;
            var v = $scope.stations[$scope.lines[l].stations[i-1].qText].gridLoc.v;
            //now use it to get the next position
            direction = $scope.allocateGridPosition(h, v, $scope.stations[$scope.lines[l].stations[i].qText], 1, 6);
            // $scope.allocateStation($scope.lines[l].stations[i], newLoc);
            // $scope.pen.beginPath();
            // $scope.pen.fillStyle = $scope.colours[l];
            // //$scope.pen.rect(newLoc.locs.a.x, newLoc.locs.a.y, $scope.cellWidth, $scope.cellHeight);
            // $scope.pen.arc(newLoc.center.x, newLoc.center.y, 5, 0, Math.PI * 2);
            // $scope.pen.fill()
            stationsDrawn.push($scope.lines[l].stations[i].qText);
          }
        }
        currentCheckpoint = $scope.lines[l].stations.length;
      }
    }
  }
};
