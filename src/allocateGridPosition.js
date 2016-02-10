//function to allocate the grid position for the current station
$scope.allocateGridPosition = function(x, y, station, progression, direction){
  //when allocating a grid position for a station we need to accommodate for how much space we need for the label as well
  var lastDirection = direction || 6;
  direction = progression==1 ? 6 : 4; //if we don't have a direction (like on a new line with no share stations) we'll start by trying to go right or left
  var suitableAllocationFound = false;
  var tries = 0;
  var requiredAllocation = station.label.hCount + 1;
  var potentialAllocation;
  var restart = false;
  var startCell = $scope.grid[x][y];
  var labelTry = 0;
  while(!suitableAllocationFound && tries < 1000){  //hopefully we don't reach 1000 tries but just in case
    tries++;
    restart = false;
    var hIndex = 0, vIndex = 0;
    switch (direction) {
      case 2: //up
        vIndex = -1;
        break;
      case 4: //left
        hIndex = -1;
        break;
      case 6: //right
        hIndex = 1;
        break;
      case 8: //down
        vIndex = 1;
        break;
      default:
    }
    var startX = x+(tries*hIndex), startY = y+(tries*vIndex);
    var reservedCells = [];
    //start by finding a free cell for the station. we don't want to go further than 8 cells away
    for (var i=0;i<8;i++){
      if(!$scope.grid[startX+(hIndex*i)]){
        $scope.grid[startX+(hIndex*i)] = {};
      }
      if(!$scope.grid[startX+(hIndex*i)][startY+(vIndex*i)]){
        $scope.createNewGridCell(startX+(hIndex*i), startY+(vIndex*i));
      }
      if($scope.grid[startX+(hIndex*i)][startY+(vIndex*i)] && !$scope.grid[startX+(hIndex*i)][startY+(vIndex*i)].occupied){
        potentialAllocation = $scope.grid[startX+(hIndex*i)][startY+(vIndex*i)];
        break;
      }
    }
    if(potentialAllocation){
      labelTry++;
      var needToChangeDirection = false;
      //we have a potentialAllocation, now we need to see if the label will fit as well
      var labelY = potentialAllocation.v-1, labelX = potentialAllocation.h+1;
      for(var v=0;v<station.label.vCount;v++){
        for(var h=0;h<station.label.hCount;h++){
          if(!$scope.grid[labelX+h]){
            //no cell exists in that direction
            //we should revisit this logic
            potentialAllocation = null;
            restart = true;
            break;
          }
          else if($scope.grid[labelX+h][labelY-v] && $scope.grid[labelX+h][labelY-v].occupied){
            //then the potential allocation won't work so we move on
            potentialAllocation = null;
            restart = true;
            break;
          }
          else{
            if(h==station.label.hCount-1){
              //we have space horizontally
              if(direction==4 || direction==6){
                needToChangeDirection = true;
              }
            }
            reservedCells.push($scope.grid[labelX+h][labelY-v]);
            if(v==station.label.vCount-1 && h==station.label.hCount-1){
              //we have space for the label and the station
              for(var i=0;i<station.label.hCount+1;i++){
                $scope.useCell(potentialAllocation.h+i,potentialAllocation.v, "blocked");
              }
              $scope.useCell(potentialAllocation.h, potentialAllocation.v, "station");
              for(var r=0;r<reservedCells.length;r++){
                $scope.useCell(reservedCells[r].h, reservedCells[r].v, "label");
              }
              station.gridLoc = potentialAllocation;
              station.labelLoc = reservedCells[0];
              suitableAllocationFound = true;
              return direction;
            }
          }
        }
        if(restart){
          restart = false;
          if(labelTry > 8 || needToChangeDirection){
            changeDirection();
          }
          break;
        }
      }
    }
    else{
      console.log('we probably need to change the direction of the line');
      changeDirection();
    }
  }

  function changeDirection(){
    if(lastDirection && direction!= lastDirection){
        direction = lastDirection;
        lastDirection = null;
    }
    else{
      switch (direction) {
        case 2: //up
        case 8:
          direction = progression==-1?4:6;
            break;
        case 4: //left
        case 6: //right
          //at this point we probably want to see where we have more space
          direction = progression==-1?2:8;
          break;
        default:

      }
    }
  }
};
