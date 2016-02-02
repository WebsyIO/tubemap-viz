//function to download all of the hypercube data
$scope.downloadHypercubeData = function(callbackFn){
  var lastrow = 0;
  for (var i=0;i< $scope.$parent.layout.qHyperCube.qDataPages.length;i++){
    lastrow += $scope.$parent.layout.qHyperCube.qDataPages[i].qArea.qHeight;
  }
  var requestPage = [{
    qTop: lastrow,
    qLeft: 0,
    qWidth: 3, //should be # of columns
    qHeight: Math.min( $scope.pageHeight, $scope.backendApi.getRowCount() - lastrow )
  }];
  $scope.backendApi.getData( requestPage ).then( function ( dataPages ) {
    lastrow += dataPages[0].qArea.qHeight;
    if(lastrow < $scope.backendApi.getRowCount()){
      $scope.downloadHypercubeData(callbackFn);
    }
    else {
      callbackFn.call(null);
    }
  } );
};
