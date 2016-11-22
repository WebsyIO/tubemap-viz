value: function(x, y){
  var h = x, v = y;
  var cellWidth = this.cellWidth, cellHeight = this.cellHeight;
  x = x*cellWidth, y=y*cellHeight;
  if(!this.grid[h]){
    this.grid[h] = {};
  }
  this.grid[h][v] = {
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
}
