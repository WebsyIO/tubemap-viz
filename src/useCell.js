$scope.useCell = function(h, v, item){
  var cellWidth = $scope.cellWidth, cellHeight = $scope.cellHeight;
  var currX = h*cellWidth, currY = v*cellHeight;
  if(!$scope.grid[h]){
    $scope.grid[h] = {};
  }
  if(!$scope.grid[h][v]){
    $scope.grid[h][v] = {
      center: {x: currX+(cellWidth/2), y: currY+(cellHeight/2)},
      h: h,
      v: v,
      locs: {
        a: {x: currX, y: currY},
        b: {x: currX+(cellWidth/2), y: currY},
        c: {x: currX+cellWidth, y: currY},
        d: {x: currX, y: currY+(cellHeight/2)},
        e: {x: currX+(cellWidth/2), y: currY+(cellHeight/2)},
        f: {x: currX+(cellWidth), y: currY+(cellHeight/2)},
        g: {x: currX, y: currY+cellHeight},
        h: {x: currX+(cellWidth/2), y: currY+cellHeight},
        i: {x: currX+(cellWidth), y: currY+cellHeight},
      },
      occupied: false,
      item: null
    };
  }
  $scope.grid[h][v].occupied = true;
  $scope.grid[h][v].item = item;
  if($scope.debug){
    $scope.pen.beginPath();
    switch (item) {
      case "station":
        $scope.pen.fillStyle = "blue";
        break;
      case "label":
        $scope.pen.fillStyle = "yellow";
        break;
      case "blocked":
        $scope.pen.fillStyle = "#CCC";
        break;
      default:
        $scope.pen.fillStyle = "red"; //an error has occured
        break;
    }
    $scope.pen.arc($scope.grid[h][v].center.x, $scope.grid[h][v].center.y, $scope.stationRadius, 0, Math.PI * 2);
    //$scope.pen.rect($scope.grid[h][v].locs.a.x, $scope.grid[h][v].locs.a.y, $scope.cellWidth, $scope.cellHeight);
    $scope.pen.fill();
  }
};
