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
			include "downloadHypercubeData.js"
			include "restructureData.js"
      include "processStations.js"
      include "allocateStation.js"
      include "processFirstLine.js"
      include "drawLines.js"
      include "drawStations.js"
      include "drawGrid.js"
      include "allocateGridPosition.js"

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
