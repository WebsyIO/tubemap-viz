value: function(){
  this.labelPaper.canvas.width = this.width;
  //this.labelPaper.pen.setTransform(this.PIXEL_RATIO, 0, 0, this.PIXEL_RATIO, 0, 0);
  this.labelPaper.pen.translate(this.posX, this.posY);
  this.labelPaper.pen.scale(this.pixelMultiplier,this.pixelMultiplier);  
  for(var s in this.stations){
    if(this.stations[s].labelLoc){
        var station = this.stations[s];
        var x = station.labelLoc.center.x;
        var y = station.labelLoc.center.y;
        var textX = 0, textY = 0;
        this.labelPaper.pen.save()
        this.labelPaper.pen.beginPath();
        //this.pen.moveTo(x,y);
        var fontSize = this.fontSize;
        if(station.mode=="highlight"){
          fontSize = fontSize * this.highlightScale;
        }
        // if(this.debug){
        //   this.labelPaper.pen.rect(station.labelLoc.locs.a.x, station.labelLoc.locs.a.y, this.cellWidth, this.cellHeight);
        // }
        this.labelPaper.pen.font = this.fontWeight+" "+ fontSize +"px "+this.fontFamily;
        this.labelPaper.pen.textAlign = "left";
        this.labelPaper.pen.textBaseline = "middle";
        this.labelPaper.pen.fillStyle = this.labelColour;
        if(station.status==0){
          this.labelPaper.pen.fillStyle = this.inactiveColour;
        }
        this.labelPaper.pen.translate(x, y);
        this.labelPaper.pen.rotate(-45*Math.PI / 180);

        if(!station.custom || !station.custom.drawLabel==undefined || station.custom.drawLabel!==false){
          for(var i=0;i<this.stations[s].label.lines.length;i++){
            this.labelPaper.pen.fillText(this.stations[s].label.lines[i], textX, textY);
            textY+= this.labelLineHeight;
          }
        }
        //this.pen.fillStyle = "white";
        //this.pen.lineWidth = 3;

        //this.pen.arc(x, y, this.stationRadius, 0, Math.PI * 2);
        //this.pen.stroke();

        this.labelPaper.pen.fill();
        this.labelPaper.pen.restore();
    }
  }
}
