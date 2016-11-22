value: function(){
  //determines the labels size and the number of cells it consumes
  var labelSize = {};
  this.labelPaper.pen.beginPath();
  this.labelPaper.pen.font = this.font;
  for(var s in this.stations){
    var words = s.split(" ");
    var labelSize = this.labelPaper.pen.measureText(s);
    var label = {};
    // we should wrap the text based on the longest word
    if(words.length > 1){
      //set the max length
      //var longest = getLongestWord(words);
      var longest = this.cellWidth * this.labelWrapThreshold;
      this.labelPaper.pen.font = this.fontWeight+" "+ this.fontSize +"px "+this.fontFamily;
      var longestSize = this.labelPaper.pen.measureText(longest);
      var longestLine = 0;
      var hCount=0, vCount=0, lines=[];
      var line = "";
      for (var i=0;i<words.length;i++){
        var lineLength = this.labelPaper.pen.measureText(line+" "+words[i]);
        if(lineLength.width<=longest || line.split(" ").length <= 1){
          if(line.split("")[line.length-1]!=" "){
            line += " ";
          }
          line += words[i];
          if(i<words.length){
            line += " ";
          }
        }
        else{
          //we start a new line
          lines.push(line.trim());
          longestLine = lines[longestLine].length > lines[lines.length-1].length ? longestLine : lines.length-1;
          line = words[i];
        }
      }
      lines.push(line);
      longestLine = lines[longestLine].length > lines[lines.length-1].length ? longestLine : lines.length-1;
      var lineLength = this.labelPaper.pen.measureText(lines[longestLine]).width;
      for(var i=0;i<this.stations[s].lines.length;i++){
        for(var l=0;l<this.lines.length;l++){
          if(this.stations[s].lines[i]==this.lines[l].name){
            // if(!this.lines[l].longestStation){
            //   this.lines[l].longestStation = 0;
            // }
            // this.lines[l].longestStation = Math.max(this.lines[l].longestStation, Math.ceil(lineLength/this.cellWidth));
            if(!this.longestLabelAllocation){
              this.longestLabelAllocation = 0;
            }
            this.longestLabelAllocation = Math.max(this.longestLabelAllocation, Math.ceil(lineLength/this.cellWidth));
          }
        }
      }
      label.hCount = Math.ceil(lineLength / this.cellWidth);
      label.vCount = label.hCount;  //as the label is going diagonally at 45 degrees the space reserved should be a square
      label.lines = lines;
    }
    else{
      label.hCount = Math.ceil(labelSize.width / this.cellWidth);
      label.vCount = label.hCount;
      label.lines = [s];
    }

    this.stations[s].label = label;
  }

  function getLongestWord(words){
    var longestWord = "";
    for(var j=0;j<words.length;j++){
      longestWord = words[j].length > longestWord.length ? words[j] : longestWord;
    }
    return longestWord;
  }
}
