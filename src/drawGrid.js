value: function(){
  if(this.debug){
    //debug function to draw the grid
    var currX = 0, currY = 0;
    var gridCount = 0;
    var cellWidth = this.cellWidth, cellHeight = this.cellHeight;
    this.debugPaper.canvas.width = this.width;
    this.debugPaper.pen.translate(this.posX, this.posY);
    this.debugPaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);  
    //draw the grid (debugging only) and calculate the cell structure
    this.debugPaper.pen.beginPath();
    this.debugPaper.pen.strokeStyle = "#E2E2E2";
    for (var h in this.grid){
      for(var v in this.grid[h]){
        this.debugPaper.pen.rect(this.grid[h][v].locs.a.x, this.grid[h][v].locs.a.y, this.cellWidth, this.cellHeight);
      }
    }
    this.debugPaper.pen.stroke();
  }
}
