value: function(h, v, item){
  if(this.debug){
    console.log("Using cell "+h+":"+v+" as ("+item+")");
  }
  var cellWidth = this.cellWidth, cellHeight = this.cellHeight;
  var currX = h*cellWidth, currY = v*cellHeight;
  if(!this.grid[h]){
    this.grid[h] = {};
  }
  if(!this.grid[h][v]){
    this.createNewGridCell(h, v);
  }
  this.grid[h][v].occupied = true;
  this.grid[h][v].item = item;
  if(this.debug){
    this.debugPaper.pen.beginPath();
    switch (item) {
      case "station":
        this.debugPaper.pen.fillStyle = "blue";
        break;
      case "label":
        this.debugPaper.pen.fillStyle = "yellow";
        break;
      case "blocked":
        this.debugPaper.pen.fillStyle = "#CCC";
        break;
      default:
        this.debugPaper.pen.fillStyle = "red"; //an error has occured
        break;
    }
    this.debugPaper.pen.arc(this.grid[h][v].center.x, this.grid[h][v].center.y, this.stationRadius, 0, Math.PI * 2);
    //this.pen.rect(this.grid[h][v].locs.a.x, this.grid[h][v].locs.a.y, this.cellWidth, this.cellHeight);
    this.debugPaper.pen.fill();
  }
  this.boundLeft = Math.min(this.boundLeft, this.grid[h][v].locs.a.x);
  this.boundRight = Math.max(this.boundRight, this.grid[h][v].locs.c.x);
  this.boundTop = Math.min(this.boundTop, this.grid[h][v].locs.a.y);
  this.boundBottom = Math.max(this.boundBottom, this.grid[h][v].locs.g.y);
}
