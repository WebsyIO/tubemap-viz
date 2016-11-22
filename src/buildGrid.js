value: function(){
  var currX = 0, currY = 0;
  var gridCount = 0;
  var cellWidth = this.cellWidth, cellHeight = this.cellHeight;
  for (var i=0; i<this.gridSize.y; i++){
    for(var j=0; j<this.gridSize.x; j++){
      gridCount++;      
      if(!this.grid[j]){
        this.grid[j] = {};
      }
      if(!this.grid[j][i]){
        this.createNewGridCell(j, i);
      }
      currX += this.cellWidth;
    }
    currX = 0;
    currY += this.cellHeight;
  }
}
