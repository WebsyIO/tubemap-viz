value: function(lines){
  //takes the lines information and uses it to build a distinct station list
  for (var l in lines){
    var sharedStationCount = 0;
    var sharedStations = [];
    for (var l2 in lines){
      if(lines[l].name != lines[l2].name || lines.length == 1){
        //no need for a line to check against itself
        for(var lS in lines[l].stations){
          if(lines[l].stations[lS].distanceToNext){
            if(!this.shortestDistance){
              this.shortestDistance = lines[l].stations[lS].distanceToNext;
            }
            if(!this.longestDistance){
              this.longestDistance = lines[l].stations[lS].distanceToNext;
            }
            this.shortestDistance = Math.min(this.shortestDistance, lines[l].stations[lS].distanceToNext);
            this.longestDistance = Math.max(this.longestDistance, lines[l].stations[lS].distanceToNext);
          }
          else{
            lines[l].stations[lS].distanceToNext = 1;
          }
          if(!this.stations[lines[l].stations[lS].name]){
            //this.stations[lines[l].stations[lS].name] = {lines:[lines[l].name], hLinesDrawn:0, vLinesDrawn:0, status:lines[l].stations[lS].status, mode:"normal"};
            this.stations[lines[l].stations[lS].name] = {lines:[lines[l].name], hLinesDrawn:0, vLinesDrawn:0, hAboveLinesDrawn:0, hBelowLinesDrawn:0, vLeftLinesDrawn:0, vRightLinesDrawn:0, mode:"normal"};
            for (var p in lines[l].stations[lS]){
              this.stations[lines[l].stations[lS].name][p] = lines[l].stations[lS][p];
            }
          }
          for (var l2S in lines[l2].stations){
            if(lines[l].stations[lS].name == lines[l2].stations[l2S].name){
              if(lines[l2].stations[l2S].status>0){
                this.stations[lines[l].stations[lS].name].status = lines[l2].stations[l2S].status;
              }
              if(this.stations[lines[l].stations[lS].name].lines.indexOf(lines[l].name)==-1){
                this.stations[lines[l].stations[lS].name].lines.push(lines[l].name);
              }
            }
          }
        }
      }
    }
  }
  console.log(this.shortestDistance);
  console.log(this.longestDistance);
  if(!this.shortestDistance || this.shortestDistance == "NaN"){
    this.shortestDistance = 1;
  }
  if(!this.longestDistance || this.longestDistance == "NaN"){
    this.longestDistance = 1;
  }
  this.distanceMultiplier = (this.shortestDistance / this.longestDistance);
  console.log(this.distanceMultiplier);
  this.lines = lines;
}
