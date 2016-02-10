//debug function to draw the grid
$scope.drawGrid = function(){
  var currX = 0, currY = 0;
  var gridCount = 0;
  var cellWidth = $scope.cellWidth, cellHeight = $scope.cellHeight;
  //draw the grid (debugging only) and calculate the cell structure
  $scope.pen.beginPath();
  $scope.pen.strokeStyle = "#E2E2E2";
  for (var i=0; i<$scope.gridSize.y; i++){
    for(var j=0; j<$scope.gridSize.x; j++){
      gridCount++;
      if($scope.debug){
        $scope.pen.rect(currX, currY, $scope.cellWidth, $scope.cellHeight);
      }
      if(!$scope.grid[j]){
        $scope.grid[j] = {};
      }
      if(!$scope.grid[j][i]){
        $scope.createNewGridCell(j, i);
      }
      currX += $scope.cellWidth;
    }
    currX = 0;
    currY += $scope.cellHeight;
  }
  $scope.pen.stroke();
};

$scope.createNewGridCell = function(x, y){
  var h = x, v = y;
  var cellWidth = $scope.cellWidth, cellHeight = $scope.cellHeight;
  x = x*cellWidth, y=y*cellHeight;
  $scope.grid[h][v] = {
    center: {x: x+(cellWidth/2), y: y+(cellHeight/2)},
    h: h,
    v: v,
    locs: {
      a: {x: x, y: y},
      b: {x: x+(cellWidth/2), y: y},
      c: {x: x+cellWidth, y: y},
      d: {x: x, y: y+(cellHeight/2)},
      e: {x: x+(cellWidth/2), y: y+(cellHeight/2)},
      f: {x: x+(cellWidth), y: y+(cellHeight/2)},
      g: {x: x, y: y+cellHeight},
      h: {x: x+(cellWidth/2), y: y+cellHeight},
      i: {x: x+(cellWidth), y: y+cellHeight},
    },
    occupied: false,
    item: null
  };
};
