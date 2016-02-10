$scope.createSelectionsObject = function(callbackFn){
  $scope.backendApi.model.session.rpc({handle: $scope.appHandle, method: "CreateSessionObject", params:[{qInfo:{qId:"",qType:"SessionLists"},qSelectionObjectDef:{}}]}).then(function(csoResponse) {
    $scope.csHandle = csoResponse.result.qReturn.qHandle;
    callbackFn.call(null);
  });
};

$scope.checkForSelectionObject = function(callbackFn){
  if(!$scope.csHandle){
    $scope.createSelectionsObject(callbackFn);
  }
  else{
    callbackFn.call(null);
  }
};

$scope.checkForSelections = function(callbackFn){
  $scope.backendApi.model.session.rpc({handle: $scope.csHandle, method: "GetLayout", params:[]}).then(function(response) {
    callbackFn.call(null, response.result.qLayout.qSelectionObject.qSelections.length > 0);
  });
};

$scope.getCurrentSelections = function(callbackFn){
  $scope.checkForSelectionObject(function(){
    $scope.checkForSelections(function(hasSelections){
      if(hasSelections){
        var dimensions = $scope.layout.qHyperCube.qDimensionInfo;
        var dimsChecked = 0;
        for(var i=0;i<dimensions.length;i++){
          console.log(dimensions);
          $scope.getField(dimensions[i].qFallbackTitle, function(handle){
            $scope.getFieldLayout(handle, function(layout){
              dimsChecked++;
              if(dimsChecked==dimensions.length){
                console.log('selections got');
                callbackFn.call(null);
              }
            });
          });
        }
      }
      else{
        callbackFn.call(null);
      }
    });
  });

};

$scope.getField = function(field, callbackFn){
  var lbDef = {
    qInfo:{qType:"ListObject"},
    qListObjectDef:{qDef:{qFieldDefs:[field]}}
  }
  $scope.backendApi.model.session.rpc({handle: $scope.appHandle, method: "CreateSessionObject", params:[lbDef]}).then(function(gfResponse) {
    callbackFn.call(null, gfResponse.result.qReturn.qHandle);
  });
};

$scope.getFieldLayout = function(handle, callbackFn){
  $scope.backendApi.model.session.rpc({handle: handle, method: "GetLayout", params:[]}).then(function(response) {
    var layout = response.result.qLayout;
    $scope.backendApi.model.session.rpc({handle: handle, method: "GetListObjectData", params:["/qListObjectDef",[{qTop:0, qLeft:0, qHeight:layout.qListObject.qSize.qcy, qWidth: 1 }]]}).then(function(glResponse) {
      $scope.selections[layout.qListObject.qDimensionInfo.qFallbackTitle] = {};
      var listMatrix = glResponse.result.qDataPages[0].qMatrix;
      for(var i=0;i<listMatrix.length;i++){
        if(listMatrix[i][0].qState=='O' || listMatrix[i][0].qState=='S'){
            $scope.selections[layout.qListObject.qDimensionInfo.qFallbackTitle][listMatrix[i][0].qText] = true;
        }
      }
      callbackFn.call(null, glResponse.result);
    });
  });
};
