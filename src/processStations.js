value: function(){
  //function to assign grid positions to each station

  for(var l=1; l < this.lines.length; l++){
    var stationCount = this.lines[l].stations.length;
    var startCellX;
    var startCellY;
    var stationsDrawn = [];
    var currentStation = 0;
    var currentCheckpoint = 0;
    var direction;
    stationsDrawn = [];
    //now we continue drawing the rest of the lines
    //find the first shared station that's already been drawn
    while(stationsDrawn.length < this.lines[l].stations.length){
      for (var c=currentCheckpoint;c<stationCount;c++){
        if(this.stations[this.lines[l].stations[c].name].gridLoc){
          //we have a shared station
          currentStation = c;
          break;
        }
        else{
          currentStation = null;
        }
      }
      if(currentStation!=null){
        for (var s=currentStation;s>currentCheckpoint-1;s--){
          var newLoc, allocation;
          var baseStation = this.stations[this.lines[l].stations[currentStation].name].gridLoc;
          var currLoc = this.stations[this.lines[l].stations[s].name].gridLoc;
          if(currLoc){
            //this is a shared station, we'll compare it with the previous station to see what direction we're going in
            //we don't need to take any other action on a share station
            if(this.lines[l].stations[s+1]){
              var prevLoc = this.stations[this.lines[l].stations[s+1].name].gridLoc;
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
                }
              }
            }
            stationsDrawn.push(this.lines[l].stations[s].name);
          }
          else {
            //get the grid position of the last station
            var prevStation = this.stations[this.lines[l].stations[s+1].name];
            var prevLoc = prevStation.gridLoc;
            var h = prevLoc.h;
            var v = prevLoc.v;
            //now use it to get the next position
            direction = this.allocateGridPosition(h, v, this.stations[this.lines[l].stations[s].name], prevStation, this.lines[l], -1, direction);
            //this.allocateStation(this.lines[l].stations[s], newLoc);
            stationsDrawn.push(this.lines[l].stations[s].name);
          }
        }
        currentCheckpoint = currentStation+1;
      }
      else {
        //there were no shared stations that have been drawn, so we start from the current checkpoint and work upwards
        for(var i=currentCheckpoint;i<this.lines[l].stations.length;i++){
          if(i==0){
            //we're on a new line with no shared stations
            var y = this.getFreeY(1);
            direction = this.allocateGridPosition(1,y, this.stations[this.lines[l].stations[i].name], null, this.lines[l], 1, 6);
            stationsDrawn.push(this.lines[l].stations[i].name);
          }
          else {
            //get the grid position of the last station
            var prevStation = this.stations[this.lines[l].stations[i-1].name];
            var h = prevStation.gridLoc.h;
            var v = prevStation.gridLoc.v;
            //now use it to get the next position
            direction = this.allocateGridPosition(h, v, this.stations[this.lines[l].stations[i].name], prevStation, this.lines[l], 1, 6);
            stationsDrawn.push(this.lines[l].stations[i].name);
          }
        }
        currentCheckpoint = this.lines[l].stations.length;
      }
    }    
  }
}
