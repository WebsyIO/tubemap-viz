$scope.transposeCell = function(loc, direction){ //direction is 1 - 9 which equates to the 9 points of 4 axis (the center point (5) is not valid)
  var h = loc.h,v=loc.v, iteration=0, validAllocation=false;
  while(!validAllocation && iteration<100){
    switch (direction) {
      case 1:
        h-=1;
        v-=1;
        break;
      case 2:
        v-=1
        break;
      case 3:
        h+=1;
        v-=1;
        break;
      case 4:
        h-=1;
        break;
      case 5:
        //not valid
        break;
      case 6:
        h+=1;
        break;
      case 7:
        h-=1;
        v+=1;
        break;
      case 8:
        v+=1;
        break;
      case 9:
        h+=1;
        v+=1;
        break;
      default:
        break;
    }
    if(!$scope.grid[h][v].occupied){
      validAllocation = true;
    }
    iteration++;
  }
  return $scope.grid[h][v];
};
