define( ["jquery"], function ( $ ) {
	'use strict';

	return {
		initialProperties: {
			qHyperCubeDef: {
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
					min: 2,
					max: 2
				},
				measures: {
					uses: "measures",
					min: 1,
					max: 1
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
			$scope.debug = true;
			//properties that control the hypercube page height
			$scope.pageHeight = 100;
			//properties that control how the canvas is drawn
			$scope.pen;
			$scope.padding = 30;
			$scope.gridSize = 20;
			$scope.stationRadius = 7;
			$scope.lineWidth = 7;
			$scope.lineSpacing = 14;
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
				"#EE5A35",
				"#4591BA",
				"green",
				"yellow",
				"pink"
			];
			//object to store the line definitions
			$scope.lines = [];
			//object to store the station definitions
			$scope.stations = {};
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

			//function to restructure the hypercube data
			$scope.restructureData = function(){
			  //restructure the hypercube to fit our needs
			  var lines = [];
			  var linesLoaded = [];
			  var stations = {};
			  var dimensions = $scope.layout.qHyperCube.qDimensionInfo;
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

			  //for each line, establish the number of shared stations
			  for (var l in $scope.lines){
			    var sharedStationCount = 0;
			    var sharedStations = [];
			    for (var l2 in $scope.lines){
			      if($scope.lines[l].qText != $scope.lines[l2].qText){
			        //no need for a line to check against itself
			        for(var lS in $scope.lines[l].stations){
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
			  //sort the lines by the number of shared stations
			  $scope.lines.sort(function(a,b){
			    if(a.sharedStationCount > b.sharedStationCount){
			      return -1;
			    }
			    else if (a.sharedStationCount == b.sharedStationCount) {
			      if(a.stations.length > b.stations.length){
			        return -1;
			      }
			      else {
			        return 1;
			      }
			    }
			    else {
			      return 1;
			    }
			  });
			  $scope.gridSize = $scope.lines[0].stations.length + 4;  //sets the grid to be the length of the longest line with the most shared stations + 4 for padding
			  console.log($scope.lines);
			  console.log($scope.stations);
			};

      //function to assign grid positions to each station and draw them
      $scope.processStations = function(){
        //use the first line as a starting point
        $scope.processFirstLine();

        for(var l=1; l < $scope.lines.length; l++){
          var stationCount = $scope.lines[l].stations.length;
          var startCellX;
          var startCellY;
          console.log($scope.lines[l].qText);
          var stationsDrawn = [];
          var currentStation = 0;
          var currentCheckpoint = 0;
          stationsDrawn = [];
          //now we continue drawing the rest of the lines
          //find the first shared station that's already been drawn
          while(stationsDrawn.length < $scope.lines[l].stations.length){
            for (var c=currentCheckpoint;c<stationCount;c++){
              if($scope.stations[$scope.lines[l].stations[c].qText].gridPosition){
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
                if($scope.stations[$scope.lines[l].stations[s].qText].gridPosition){
                  //then this is also a shared station and already drawn so we do nothing
                  stationsDrawn.push($scope.lines[l].stations[s].qText);
                }
                else {
                  //get the grid position of the last station
                  var currX = $scope.stations[$scope.lines[l].stations[s+1].qText].gridPosition.x;
                  var currY = $scope.stations[$scope.lines[l].stations[s+1].qText].gridPosition.y;
                  //now use it to get the next position
                  var newPos = $scope.allocateGridPosition(currX, currY, -1);
                  $scope.allocateStation($scope.lines[l].stations[s], newPos.x, newPos.y);
                  $scope.pen.beginPath();
                  $scope.pen.strokeStyle = $scope.colours[l];
                  $scope.pen.fillStyle = "white";
                  $scope.pen.lineWidth = 3;
                  $scope.pen.arc(newPos.x, newPos.y, 1, 0, Math.PI * 2);
                  $scope.pen.stroke();
                  $scope.pen.fill()
                  stationsDrawn.push($scope.lines[l].stations[s].qText);
                }
              }
              currentCheckpoint = currentStation+1;
            }
            else {
              //there were no shared stations that have been drawn, so we start from the current checkpoint and work upwards
              for(var i=currentCheckpoint;i<$scope.lines[l].stations.length;i++){
                if(i==0){
                  //then there are no shared stationsDrawn
                  //we should draw this line at mid points between the y axis cells
                  var currX = $scope.cellWidth;	//this puts it in the first x axis cell
                  console.log('we got here but nothing is going to happen');
                }
                else {
                  //get the grid position of the last station
                  var currX = $scope.stations[$scope.lines[l].stations[i-1].qText].gridPosition.x;
                  var currY = $scope.stations[$scope.lines[l].stations[i-1].qText].gridPosition.y;
                  //now use it to get the next position
                  var newPos = $scope.allocateGridPosition(currX, currY, 1);
                  $scope.allocateStation($scope.lines[l].stations[i], newPos.x, newPos.y);
                  stationsDrawn.push($scope.lines[l].stations[i].qText);
                }
              }
              currentCheckpoint = $scope.lines[l].stations.length;
            }
          }
        }
      };

      $scope.allocateStation = function(station, x, y){
        if(!$scope.allocatedCells[x]){
          $scope.allocatedCells[x] = {};
        }
        $scope.allocatedCells[x][y] = true;
        $scope.stations[station.qText].gridPosition = {
          x: x,
          y: y
        };
        station.gridPosition = {
          x: x,
          y: y
        };
        console.log('allocating grid position');
      }

      $scope.processFirstLine = function(){
        //this plots the points for the first line.
        //the first line is the one with the most shared stations
        //which we draw diagonally (with a nose and tail) to set a baseline
        //or if the line is bigger than our gridsize + 4 then we draw it in a circular formation
        var stationCount = $scope.lines[0].stations.length;
        var startCellX;
        var startCellY;
        if($scope.lines[0].stations.length > ($scope.gridSize+4)){
          //we should draw the line centrally to the grid in a circular formation

        }
        else{
          //we should draw this line centrally to the grid in a diagonal formation
          //find the starting x cell by
          startCellX = Math.floor((($scope.gridSize)-stationCount)/2);
          startCellY = Math.floor(($scope.gridSize-(stationCount))/2);
          //draw the first part of the line
          //$scope.pen.moveTo((startCellX*cellWidth), (startCellY*cellHeight));
          for (var s=0;s<stationCount;s++){
            //the first and last station links are horizontal, the rest are diagonal
            $scope.lines[0].stations[s].gridPosition = {x: startCellX * $scope.cellWidth, y: startCellY* $scope.cellHeight};
            $scope.stations[$scope.lines[0].stations[s].qText].gridPosition = $scope.lines[0].stations[s].gridPosition;
            var station = $scope.lines[0].stations[s];
            if(!$scope.allocatedCells[station.gridPosition.x]){
              $scope.allocatedCells[station.gridPosition.x] = {
              }
              $scope.allocatedCells[station.gridPosition.x][station.gridPosition.y] = true;
            }
            $scope.pen.beginPath();
            $scope.pen.moveTo(station.gridPosition.x, station.gridPosition.y);
            //$scope.pen.strokeStyle = station.qState!="X"?colours[l]:"#E2E2E2";
            //$scope.pen.lineWidth = lineWidth;
            $scope.pen.strokeStyle = "black";
            $scope.pen.fillStyle = "white";
            $scope.pen.lineWidth = 3;

              startCellX++;
              startCellY++;

            if(s<stationCount){
              //$scope.pen.lineTo(startCellX * cellWidth, startCellY* cellHeight);
              $scope.pen.arc(station.gridPosition.x, station.gridPosition.y, 1, 0, Math.PI * 2);
              $scope.pen.stroke();
              $scope.pen.fill()
            }
          }
        }
      };

      //function to draw the lines between the stations
      $scope.drawLines = function(){
        var currX, currY, newX, newY, adjustmentX, adjustmentY;
        for (var l in $scope.lines){
          var stations = $scope.lines[l].stations;
          currX = $scope.stations[stations[0].qText].gridPosition.x;
          currY = $scope.stations[stations[0].qText].gridPosition.y;
          adjustmentX = 0;
          adjustmentY = 0;
          for (var i=0;i<stations.length;i++){
            $scope.pen.beginPath();
            //check to see if this and the next station are shared
            if($scope.stations[stations[i].qText].lines.length > 1 && ($scope.stations[stations[i+1].qText] && $scope.stations[stations[i+1].qText].lines.length>1)){
              $scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
              if($scope.stations[stations[i].qText].gridPosition.x != $scope.stations[stations[i+1].qText].gridPosition.x){
                //the 2 stations do not run vertically so we can adjust the Y axis
                adjustmentY = ($scope.lineSpacing * $scope.stations[stations[i].qText].linesDrawn);
                if($scope.stations[stations[i].qText].gridPosition.y != $scope.stations[stations[i+1].qText].gridPosition.y){
                  //the 2 stations do not run horizontally either so we adjust both axis
                  adjustmentX = (($scope.lineSpacing/2) * $scope.stations[stations[i].qText].linesDrawn);
                }
              }
              else{
                //we shift to the right
                adjustmentX = ($scope.lineSpacing * $scope.stations[stations[i].qText].linesDrawn);
                if($scope.stations[stations[i].qText].gridPosition.x != $scope.stations[stations[i+1].qText].gridPosition.x){
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
            else if($scope.stations[stations[i].qText].lines.length > 1 && ($scope.stations[stations[i+1].qText] && $scope.stations[stations[i+1].qText].lines.length==1)){
              $scope.pen.moveTo((currX+adjustmentX), (currY-adjustmentY));
              if($scope.stations[stations[i].qText].gridPosition.x != $scope.stations[stations[i+1].qText].gridPosition.x){
                //the 2 stations do not run vertically so we can reset the Y adjustment
                adjustmentX += adjustmentY;
                adjustmentY = 0;
                //adjustmentX += ($scope.lineWidth*$scope.stations[stations[i].qText].linesDrawn);
              }
              if($scope.stations[stations[i].qText].gridPosition.y != $scope.stations[stations[i+1].qText].gridPosition.y){
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
            $scope.lines[l].stations[i].gridPosition = {
              x: (currX+adjustmentX),
              y: (currY+adjustmentY)
            };
            $scope.pen.strokeStyle = stations[i].qState!="X"?$scope.colours[l]:"#E2E2E2";
            $scope.pen.lineWidth = $scope.lineWidth;
            $scope.pen.lineJoin = 'round';
            $scope.pen.lineCap = 'round';

            if(stations[i+1]){
              currX = $scope.stations[stations[i+1].qText].gridPosition.x;
              currY = $scope.stations[stations[i+1].qText].gridPosition.y;

              $scope.pen.lineTo((currX+adjustmentX), (currY-adjustmentY));
              $scope.pen.stroke();
            }
          }
        }
      };

      $scope.drawStations = function(){
        for(var l in $scope.lines){
          for(var i=0; i<$scope.lines[l].stations.length;i++){
            var x = $scope.lines[l].stations[i].gridPosition.x;
            var y = $scope.lines[l].stations[i].gridPosition.y;

            $scope.pen.beginPath();
            $scope.pen.moveTo(x,y);

            $scope.pen.strokeStyle = "black";
            $scope.pen.fillStyle = "white";
            $scope.pen.lineWidth = 3;

            $scope.pen.arc(x, y, $scope.stationRadius, 0, Math.PI * 2);
            $scope.pen.stroke();
            $scope.pen.fill()
          }
        }
      };

      //debug function to draw the grid
      $scope.drawGrid = function(){
        var currX = 0, currY = 0;
        //draw the grid (debugging only)
        //we want a maximum of 10 possible stations across both axis
        //but we should have 20 grid cells to work with
        $scope.pen.beginPath();
        $scope.pen.strokeStyle = "#E2E2E2";
        for (var i=0; i<$scope.gridSize; i++){
          for(var j=0; j<($scope.gridSize); j++){
            $scope.pen.rect(currX, currY, $scope.cellWidth, $scope.cellHeight);
            currX += $scope.cellWidth;
          }
          currX = 0;
          currY += $scope.cellHeight;
        }
        $scope.pen.stroke();
      };

      //function to allocate the grid position for the current station
      $scope.allocateGridPosition = function(x, y, direction){
        //direction is either positive or negative
        //a positive value means the station should be progressing to the right and potentially up/down
        //a negative value means the station should be progressing to the left and potentially up/down
        //we search for a new cell in a semi-circular motion incrementing by 1 cell each pass
        var validAllocation = false;
        var iteration = 0;
        var newPos = {};
        //x = (x*direction);
        while (!validAllocation) {
          //can we move left/right
          if(!$scope.allocatedCells[(x+($scope.cellWidth*iteration))] || !$scope.allocatedCells[(x+($scope.cellWidth*iteration))][y]){
            newPos = {
              x: (x+($scope.cellWidth*iteration)),
              y: y
            };
            validAllocation = true;
            return newPos;
          }
          //can we move up
          if(!$scope.allocatedCells[x] || !$scope.allocatedCells[x][(y-($scope.cellHeight*iteration))]){
            newPos = {
              x: x,
              y: (y-($scope.cellHeight*iteration))
            };
            validAllocation = true;
            return newPos;
          }
          //can we move down
          if(!$scope.allocatedCells[x] || !$scope.allocatedCells[x][(y+($scope.cellHeight*iteration))]){
            newPos = {
              x: x,
              y: (y+($scope.cellHeight*iteration))
            };
            validAllocation = true;
            return newPos;
          }
          //can we move up & left/right
          if(!$scope.allocatedCells[(x+($scope.cellWidth*iteration))] || !$scope.allocatedCells[(x+($scope.cellWidth*iteration))][(y-($scope.cellHeight*iteration))]){
            newPos = {
              x: (x+($scope.cellWidth*iteration)),
              y: (y-($scope.cellHeight*iteration))
            };
            validAllocation = true;
            return newPos;
          }
          //can we move down & left/right
          if(!$scope.allocatedCells[(x+($scope.cellWidth*iteration))] || !$scope.allocatedCells[(x+($scope.cellWidth*iteration))][(y+($scope.cellHeight*iteration))]){
            newPos = {
              x: (x+($scope.cellWidth*iteration)),
              y: (y+($scope.cellHeight*iteration))
            };
            validAllocation = true;
            return newPos;
          }
          //if we get here we increment for the next pass
          iteration++;
        }
      };


			$scope.getFreeY = function(x, sharesStations){
				var yArray = [];
				for (var s in $scope.allocatedCells[x]){
					yArray.push[s]
				}
				yArray.sort();

			};

		},
		paint: function ( $element, layout ) {
			var that = this;
			//make sure we clear out the previous lines/stations
			that.$scope.lines = [];
			that.$scope.stations = {};
			that.$scope.allocatedCells = {};

			that.$scope.paperWidth = $element.width();
			that.$scope.paperHeight = $element.height();
			that.$scope.gridWidth = $element.width() - (that.$scope.padding*2);
			that.$scope.gridHeight = $element.height() - (that.$scope.padding*2);
			that.$scope.dominentAxis = (that.$scope.paperWidth > that.$scope.paperHeight)?"x":"y";

			that.$scope.downloadHypercubeData(function(){
				that.$scope.restructureData();
				//canvas
        that.$scope.cellWidth = (that.$scope.gridWidth / (that.$scope.gridSize+4));	//we add four to give us an extra 2 cells on each side of the grid
  			that.$scope.cellHeight = (that.$scope.gridHeight / that.$scope.gridSize);
				var paper = document.createElement('canvas');
				paper.width = that.$scope.paperWidth;
				paper.height = that.$scope.paperHeight;
				$element.html(paper);
				that.$scope.pen = paper.getContext('2d');
				//translate the canvas by the 'padding' amount
				that.$scope.pen.translate(that.$scope.padding, that.$scope.padding);

				if(that.$scope.debug){
					that.$scope.drawGrid();
				}
				that.$scope.processStations();
				//that.$scope.drawLines();
				//that.$scope.drawStations();

				//draw each station
				// $scope.pen.beginPath();
				// $scope.pen.strokeStyle = "black";
				// $scope.pen.fillStyle = "white";
				// $scope.pen.lineWidth = 3;
				// for(var l=0; l < 1; l++){
				// 	var stationCount = lines[l].stations.length;
				// 	for (var s=0;s<stationCount;s++){
				// 		var station = lines[l].stations[s];
				// 		$scope.pen.moveTo(station.gridPosition.x + stationRadius, station.gridPosition.y);
				// 		$scope.pen.arc(station.gridPosition.x, station.gridPosition.y, stationRadius, 0, Math.PI * 2);
				// 	}
				// }
				// $scope.pen.fill();
				// $scope.pen.stroke();
				// $scope.pen.closePath();
			});




		}
	};
} );
