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
			include "downloadHypercubeData.js"
			include "restructureData.js"
      include "processStations.js"
      include "allocateStation.js"
      include "processFirstLine.js"
      include "drawLines.js"
      include "drawStations.js"
			include "drawLabels.js"
      include "drawGrid.js"
      include "allocateGridPosition.js"
			include "getGridLoc.js"
			include "transposeCell.js"
			include "getFreeY.js"
			include "getLabelInfo.js"
			include "useCell.js"
			include "getCurrentSelections.js"

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
