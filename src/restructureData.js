//function to restructure the hypercube data
$scope.restructureData = function(){
  //restructure the hypercube to fit our needs
  var lines = [];
  var linesLoaded = [];
  var stations = {};
  var dimensions = $scope.layout.qHyperCube.qDimensionInfo;
  var lineField = dimensions[0].qFallbackTitle;
  var stationField = dimensions[1].qFallbackTitle;

  for(var i=0;i<$scope.layout.qHyperCube.qDataPages.length;i++){
    var matrix = $scope.layout.qHyperCube.qDataPages[i].qMatrix;
    matrix.forEach(function ( row ) {
      var line;
      //cell 0 is treated as the Line
      //we only want to store 1 object per Lines
      if(linesLoaded.indexOf(row[0].qText)!=-1){
        line = $scope.lines[linesLoaded.indexOf(row[0].qText)];
      }
      else{
        line = row[0];
        line.stations = [];
        $scope.lines.push(line);
        linesLoaded.push(row[0].qText);
      }
      line.stations.push(row[1]);
    } );
  }
  console.log($scope.selections);
  //for each line, establish the number of shared stations
  for (var l in $scope.lines){
    var sharedStationCount = 0;
    var sharedStations = [];
    if($scope.selections[lineField] && $scope.selections[lineField][$scope.lines[l].qText]){
      $scope.lines[l].qState = $scope.selections[lineField][$scope.lines[l].qText];
    }
    for (var l2 in $scope.lines){
      if($scope.lines[l].qText != $scope.lines[l2].qText){
        //no need for a line to check against itself
        for(var lS in $scope.lines[l].stations){
          if($scope.selections[stationField] && $scope.selections[stationField][$scope.lines[l].stations[lS].qText]){
            $scope.lines[l].stations[lS].qState = $scope.selections[stationField][$scope.lines[l].stations[lS].qText];
          }
          console.log($scope.lines[l].stations[lS].qText," - ",$scope.lines[l].stations[lS].qState);
          if(!$scope.stations[$scope.lines[l].stations[lS].qText]){
            $scope.stations[$scope.lines[l].stations[lS].qText] = {lines:[$scope.lines[l].qText], linesDrawn:0};
          }
          for (var l2S in $scope.lines[l2].stations){
            //if the stations match we add a 1 to the sharedStationCount and store the station name
            if($scope.lines[l].stations[lS].qText == $scope.lines[l2].stations[l2S].qText){
              if($scope.stations[$scope.lines[l].stations[lS].qText].lines.indexOf($scope.lines[l].qText)==-1){
                $scope.stations[$scope.lines[l].stations[lS].qText].lines.push($scope.lines[l].qText);
              }
              if(sharedStations.indexOf($scope.lines[l].stations[lS].qText)==-1){
                sharedStationCount++;
                sharedStations.push($scope.lines[l].stations[lS].qText);
              }
            }
          }
        }
      }
    }
    $scope.lines[l].sharedStations = sharedStations;
    $scope.lines[l].sharedStationCount = sharedStationCount;
  }
  for (var s in $scope.stations){
    if ($scope.stations[s].lineCount == 0){
      $scope.stations[s].lineCount = 1;
    }
  }
};
