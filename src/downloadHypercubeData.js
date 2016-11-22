//function to download all of the hypercube data
$scope.downloadHypercubeData = function(callbackFn){
  if(!$scope.lastrow){
    $scope.lastrow = 0;
  }
  var totalRows = $scope.backendApi.getRowCount()
  if($scope.lastrow != totalRows){
    for (var i=0;i< $scope.$parent.layout.qHyperCube.qDataPages.length;i++){
      $scope.lastrow += $scope.$parent.layout.qHyperCube.qDataPages[i].qArea.qHeight;
    }
    var requestPage = [{
      qTop: $scope.lastrow,
      qLeft: 0,
      qWidth: 3, //should be # of columns
      qHeight: Math.min( $scope.pageHeight, totalRows - $scope.lastrow )
    }];
    $scope.backendApi.getData( requestPage ).then( function ( dataPages ) {
      $scope.lastrow += dataPages[0].qArea.qHeight;
      if($scope.lastrow < totalRows){
        $scope.downloadHypercubeData(callbackFn);
      }
      else {
        callbackFn.call(null);
      }
    } );
  }
};
