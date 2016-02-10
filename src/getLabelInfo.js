$scope.getLabelInfo = function(){
  //determines the labels size and the number of cells it consumes
  var labelSize = {};
  $scope.pen.beginPath();
  $scope.pen.font = $scope.font;
  for(var s in $scope.stations){
    var words = s.split(" ");
    var labelSize = $scope.pen.measureText(s);
    var label = {};
    // we should wrap the text based on the longest word
    if(words.length > 1){
      //set the max length
      //var longest = getLongestWord(words);
      var longest = $scope.cellWidth * 5;
      var longestSize = $scope.pen.measureText(longest);
      var longestLine = 0;
      var hCount=0, vCount=0, lines=[];
      var line = "";
      for (var i=0;i<words.length;i++){
        var lineLength = $scope.pen.measureText(line+" "+words[i]);
        if(lineLength.width<=longest){
          line += words[i];
          if(i<words.length-1){
            line += " ";
          }
        }
        else{
          //we start a new line
          lines.push(line);
          longestLine = lines[longestLine].length > lines[lines.length-1].length ? longestLine : lines.length-1;
          line = words[i];
        }
      }
      lines.push(line);
      var lineLength = $scope.pen.measureText(lines[longestLine]).width;
      label.hCount = Math.ceil(lineLength / $scope.cellWidth);
      label.vCount = label.hCount;  //as the label is going diagonally at 45 degrees the space reserved should be a square
      label.lines = lines;
    }
    else{
      label.hCount = Math.ceil(labelSize.width / $scope.cellWidth);
      label.vCount = label.hCount;
      label.lines = [s];
    }

    $scope.stations[s].label = label;
  }

  function getLongestWord(words){
    var longestWord = "";
    for(var j=0;j<words.length;j++){
      longestWord = words[j].length > longestWord.length ? words[j] : longestWord;
    }
    return longestWord;
  }
};
