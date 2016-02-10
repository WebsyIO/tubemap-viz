$scope.getFreeY = function(x){
  var tries = 0;
  var foundValidY = false;
  var iteration = 0;
  var allocatedY;
  while(!foundValidY && tries < 1000){  //hopefully we don't span 500 rows (we change direction every 8 rows)
    //lets start by looking down
    for(var i=0;i<8;i++){
      if(!$scope.grid[x][$scope.baseY + (i*iteration)].occupied){
        allocatedY = $scope.baseY + (i*iteration);
        foundValidY = true;
        return allocatedY;
      }
      tries++;
    }
    //then we try looking up
    for(var i=0;i<8;i++){
      if(!$scope.grid[x][$scope.baseY - (i*iteration)].occupied){
        allocatedY = $scope.baseY - (i*iteration);
        foundValidY = true;
        return allocatedY;
      }
      tries++;
    }
    iteration++;
  }

  return false;
};