value: function(lines){
  //takes the lines information and uses it to build a distinct station list
  for (var l in lines){
    var sharedStationCount = 0;
    var sharedStations = [];
    for (var l2 in lines){
      if(lines[l].name != lines[l2].name || lines.length == 1){
        //no need for a line to check against itself
        for(var lS in lines[l].stations){
          if(!this.stations[lines[l].stations[lS].name]){
            //this.stations[lines[l].stations[lS].name] = {lines:[lines[l].name], hLinesDrawn:0, vLinesDrawn:0, status:lines[l].stations[lS].status, mode:"normal"};
            this.stations[lines[l].stations[lS].name] = {lines:[lines[l].name], hOddLinesDrawn:0, hEvenLinesDrawn:0, vOddLinesDrawn:0, vEvenLinesDrawn:0, mode:"normal"};
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
  this.lines = lines;
}