define( ["jquery"], function ( $ ) {
	'use strict';

	return {
		initialProperties: {
			qHyperCubeDef: {
				qStateName: "tube",
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 0,
					qHeight: 0
				}]
			}
		},
		//property panel
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 2
				},
				measures: {
					uses: "measures",
					min: 0
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings"
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		controller: function($scope, $element){
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

      $scope.allocateStation = function(station, loc){
        loc.occupied = true;
        loc.item = "station";
        $scope.stations[station.qText].gridLoc = loc;
        station.gridLoc = loc;
        console.log('allocating grid position');
      }

      $scope.processFirstLine = function(){
        //this plots the points for the first line.
        //the first line is the one with the most shared stations
        //which we draw diagonally to set a baseline
        var stationCount = $scope.lines[0].stations.length;
        var startCellX, startCellY, startPixelY, gridLoc;

        //we should draw this line centrally to the grid horizontally

        //before understanding where the first station can go we need to understand how much room the label needs
        var label = $scope.stations[$scope.lines[0].stations[0].qText].label;
        startCellX = 0;
        startCellY = Math.ceil($scope.gridSize.y/2);

        //draw the first part of the line
        for (var s=0;s<stationCount;s++){
          //based on the width of the label mark the relevant cells unusable
          for(var i=0;i<label.hCount+1;i++){
            $scope.useCell(startCellX+i,startCellY, "blocked");
          }

          $scope.useCell(startCellX, startCellY, "station");
          gridLoc = $scope.grid[startCellX][startCellY];
          $scope.lines[0].stations[s].gridLoc = gridLoc;
          $scope.stations[$scope.lines[0].stations[s].qText].gridLoc = gridLoc
          var label = $scope.stations[$scope.lines[0].stations[s].qText].label;

          //allocate the position for the station label starting 1 cell immediately up and right of the station
          var labelY = startCellY-1, labelX = startCellX+1;
          for(var v=0;v<label.vCount;v++){
            for(var h=0;h<label.hCount;h++){
              if(v==0&&h==0){
                $scope.stations[$scope.lines[0].stations[s].qText].labelLoc = $scope.grid[labelX][labelY];
              }
              $scope.useCell(labelX+h,labelY-v, "label");
            }
          }
          var station = $scope.lines[0].stations[s];

          //now we move to what would effectively be the end of the label
          startCellX += label.hCount+1;

          if(s<stationCount){
            //$scope.pen.lineTo(startCellX * cellWidth, startCellY* cellHeight);
            // $scope.pen.arc(station.gridPosition.x, station.gridPosition.y, 1, 0, Math.PI * 2);
            // $scope.pen.stroke();
            // $scope.pen.fill()
          }
        }
      };

      //function to draw the lines between the stations
      $scope.drawLines = function(){
        var currX, currY, newX, newY, adjustmentX, adjustmentY;
        for (var l in $scope.lines){
          var stations = $scope.lines[l].stations;
          currX = $scope.stations[stations[0].qText].gridLoc.center.x;
          currY = $scope.stations[stations[0].qText].gridLoc.center.y;
          adjustmentX = 0;
          adjustmentY = 0;
          for (var i=0;i<stations.length;i++){
            $scope.pen.beginPath();
            //check to see if this and the next station are shared
            if($scope.stations[stations[i].qText].lines.length > 1 && stations[i+1] && ($scope.stations[stations[i+1].qText] && $scope.stations[stations[i+1].qText].lines.length>1)){
              $scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
              if($scope.stations[stations[i].qText].gridLoc.center.x != $scope.stations[stations[i+1].qText].gridLoc.center.x){
                //the 2 stations do not run vertically so we can adjust the Y axis
                adjustmentY = ($scope.lineSpacing * $scope.stations[stations[i].qText].linesDrawn);
                if($scope.stations[stations[i].qText].gridLoc.center.y != $scope.stations[stations[i+1].qText].gridLoc.center.y){
                  //the 2 stations do not run horizontally either so we adjust both axis
                  adjustmentX = (($scope.lineSpacing/2) * $scope.stations[stations[i].qText].linesDrawn);
                }
              }
              else{
                //we shift to the right
                adjustmentX = ($scope.lineSpacing * $scope.stations[stations[i].qText].linesDrawn);
                if($scope.stations[stations[i].qText].gridLoc.center.x != $scope.stations[stations[i+1].qText].gridLoc.center.x){
                  //we shift to the right
                  adjustmentY = ($scope.lineSpacing * $scope.stations[stations[i].qText].linesDrawn);
                }
              }
              if(i>0){
                $scope.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
                $scope.pen.stroke();
              }
              $scope.stations[stations[i].qText].linesDrawn++;
              //$scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
            }
            else if($scope.stations[stations[i].qText].lines.length > 1 && stations[i+1] && ($scope.stations[stations[i+1].qText] && $scope.stations[stations[i+1].qText].lines.length==1)){
              $scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
              if($scope.stations[stations[i].qText].gridLoc.center.x != $scope.stations[stations[i+1].qText].gridLoc.center.x){
                //the 2 stations do not run vertically so we can reset the Y adjustment
                adjustmentX += adjustmentY;
                adjustmentY = 0;
                //adjustmentX += ($scope.lineWidth*$scope.stations[stations[i].qText].linesDrawn);
              }
              if($scope.stations[stations[i].qText].gridLoc.center.y != $scope.stations[stations[i+1].qText].gridLoc.center.y){
                //the 2 stations do not run vertically so we can reset the X adjustment
                adjustmentY += adjustmentX;
                adjustmentX = 0;
                //adjustmentY += ($scope.lineWidth*$scope.stations[stations[i].qText].linesDrawn);
              }
              $scope.stations[stations[i].qText].linesDrawn++;
              $scope.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));

              $scope.pen.stroke();
            }

            $scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
            // $scope.stations[$scope.lines[l].stations[i].qText].gridLoc.center = {
            //   x: (currX+adjustmentX),
            //   y: (currY+adjustmentY)
            // };
            $scope.pen.strokeStyle = $scope.colours[l];
            $scope.pen.lineWidth = $scope.lineWidth;
            $scope.pen.lineJoin = 'round';
            $scope.pen.lineCap = 'round';

            if(stations[i+1]){
              currX = $scope.stations[stations[i+1].qText].gridLoc.center.x;
              currY = $scope.stations[stations[i+1].qText].gridLoc.center.y;

              $scope.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
              $scope.pen.stroke();
            }
          }
        }
      };

      $scope.drawStations = function(){
        for(var l=0; l<$scope.lines.length;l++){
          for(var i=0; i<$scope.lines[l].stations.length;i++){
            if($scope.stations[$scope.lines[l].stations[i].qText].gridLoc){
              var x = $scope.stations[$scope.lines[l].stations[i].qText].gridLoc.center.x;
              var y = $scope.stations[$scope.lines[l].stations[i].qText].gridLoc.center.y;

              $scope.pen.beginPath();
              $scope.pen.moveTo(x,y);

              $scope.pen.strokeStyle = "black";
              $scope.pen.lineWidth = 6;
              var qState = $scope.lines[l].stations[i].qState;
              $scope.pen.fillStyle = "white";

              $scope.pen.arc(x, y, $scope.stationRadius, 0, Math.PI * 2);
              $scope.pen.stroke();
              $scope.pen.fill()
            }
          }
        }
      };

			$scope.drawLabels = function(){
			  for(var s in $scope.stations){
			    if($scope.stations[s].labelLoc){
			        var x = $scope.stations[s].labelLoc.center.x;
			        var y = $scope.stations[s].labelLoc.center.y;        
			        var textX = 0, textY = 0;
			        $scope.pen.save()
			        $scope.pen.beginPath();
			        //$scope.pen.moveTo(x,y);
			        $scope.pen.textAlign = "left";
			        $scope.pen.textBaseline = "middle";
			        $scope.pen.fillStyle = "black";
			        $scope.pen.translate(x, y);
			        $scope.pen.rotate(-45*Math.PI / 180);

			        for(var i=0;i<$scope.stations[s].label.lines.length;i++){
			          $scope.pen.fillText($scope.stations[s].label.lines[i], textX, textY);
			          textY+= $scope.labelLineHeight;
			        }
			        //$scope.pen.fillStyle = "white";
			        //$scope.pen.lineWidth = 3;

			        //$scope.pen.arc(x, y, $scope.stationRadius, 0, Math.PI * 2);
			        //$scope.pen.stroke();
			        $scope.pen.fill()
			        $scope.pen.restore()
			    }
			  }
			};

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

			$scope.getGridLoc = function(pixelX, pixelY){
			  //gets the grid cell based on x and y pixels
			  var gridX = Math.round(pixelX / $scope.cellWidth);
			  var gridY = Math.round(pixelY / $scope.cellHeight);
			  return $scope.grid[gridX][gridY];
			};

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

			$scope.getLabelInfo = function(){
			  //determines the labels size and the number of cells it consumes
			  var labelSize = {};
			  $scope.pen.beginPath();
			  $scope.pen.font = $scope.font;
			  for(var s in $scope.stations){
			    var words = s.split(" ");
			    var labelSize = $scope.pen.measureText(s);
			    var label = {};
			    // we should wrap the text based on the longest word
			    if(words.length > 1){
			      //set the max length
			      //var longest = getLongestWord(words);
			      var longest = $scope.cellWidth * 5;
			      var longestSize = $scope.pen.measureText(longest);
			      var longestLine = 0;
			      var hCount=0, vCount=0, lines=[];
			      var line = "";
			      for (var i=0;i<words.length;i++){
			        var lineLength = $scope.pen.measureText(line+" "+words[i]);
			        if(lineLength.width<=longest){
			          line += words[i];
			          if(i<words.length-1){
			            line += " ";
			          }
			        }
			        else{
			          //we start a new line
			          lines.push(line);
			          longestLine = lines[longestLine].length > lines[lines.length-1].length ? longestLine : lines.length-1;
			          line = words[i];
			        }
			      }
			      lines.push(line);
			      var lineLength = $scope.pen.measureText(lines[longestLine]).width;
			      label.hCount = Math.ceil(lineLength / $scope.cellWidth);
			      label.vCount = label.hCount;  //as the label is going diagonally at 45 degrees the space reserved should be a square
			      label.lines = lines;
			    }
			    else{
			      label.hCount = Math.ceil(labelSize.width / $scope.cellWidth);
			      label.vCount = label.hCount;
			      label.lines = [s];
			    }

			    $scope.stations[s].label = label;
			  }

			  function getLongestWord(words){
			    var longestWord = "";
			    for(var j=0;j<words.length;j++){
			      longestWord = words[j].length > longestWord.length ? words[j] : longestWord;
			    }
			    return longestWord;
			  }
			};

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


			$scope.selections = {};
			$scope.lastrow = 0;
			$scope.debug = false;
			$scope.appHandle = $scope.backendApi.model.session.currentApp.handle;
			//properties that control the hypercube page height
			$scope.pageHeight = 100;
			//properties that control how the canvas is drawn
			$scope.pen;
			$scope.padding = 30;
			$scope.gridSize = {x:0, y:0};
			$scope.grid = [];
			$scope.stationRadius = 8;
			$scope.lineWidth = 5;
			$scope.lineSpacing = 5;
			$scope.labelLineHeight = 10;
			$scope.font = "10px Arial";
			$scope.paperWidth;
			$scope.paperHeight;
			$scope.gridWidth;
			$scope.gridHeight;
			$scope.cellWidth;
			$scope.cellHeight;
			$scope.dominentAxis;
			$scope.allocatedCells = {
				x:{},
				y:{}
			};
			$scope.firstStationColour = "#62A74A";
			//colour array for drawing the lines
			$scope.colours = [
				"#61A729",
				"#EE5A35",
				"#4591BA",
				"yellow",
				"pink"
			];
			//object to store the line definitions
			$scope.lines = [];
			//object to store the station definitions
			$scope.stations = {};

		},
		paint: function ( $element, layout ) {
			console.log(layout);
			var that = this;
			//make sure we clear out the previous lines/stations
			that.$scope.lines = [];
			that.$scope.stations = {};
			that.$scope.allocatedCells = {};
			that.$scope.grid = {};
			that.$scope.lastrow = 0;
			that.$scope.$parent.layout.qHyperCube.qDataPages = [];
			that.$scope.selections = {};

			that.$scope.paperWidth = $element.width() - (that.$scope.padding*2);
			that.$scope.paperHeight = $element.height() - (that.$scope.padding*2);

			that.$scope.cellWidth = that.$scope.stationRadius*2;
			that.$scope.cellHeight = that.$scope.stationRadius*2;

			that.$scope.gridSize.x = Math.floor(that.$scope.paperWidth / that.$scope.cellWidth);
			that.$scope.gridSize.y = Math.floor(that.$scope.paperHeight / that.$scope.cellHeight);

			console.log(that.$scope);

			that.$scope.getCurrentSelections(function(){
				that.$scope.downloadHypercubeData(function(){
					that.$scope.restructureData();
					//we need multiple canvas element to help with performance
					//debug canvas
					var debugPaper = document.createElement('canvas');
					debugPaper.width = $element.width();
					debugPaper.height = $element.height();
					//line canvas
					var linePaper = document.createElement('canvas');
					linePaper.width = $element.width();
					linePaper.height = $element.height();
					//station canvas
					var stationPaper = document.createElement('canvas');
					stationPaper.width = $element.width();
					stationPaper.height = $element.height();
					//label canvas
					var labelPaper = document.createElement('canvas');
					labelPaper.width = $element.width();
					labelPaper.height = $element.height();

					//canvas
					var paper = document.createElement('canvas');
					paper.width = $element.width();
					paper.height = $element.height();
					$element.html(paper);
					that.$scope.pen = paper.getContext('2d');

					//translate the canvas by the 'padding' amount
					that.$scope.pen.translate(that.$scope.padding, that.$scope.padding);

					that.$scope.getLabelInfo();

					that.$scope.drawGrid();

					that.$scope.processStations();
					that.$scope.drawLines();
					that.$scope.drawStations();
					that.$scope.drawLabels();
				});
			});

		}
	};
} );
