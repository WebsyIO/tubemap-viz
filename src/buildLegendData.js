value: function(){
  if(this.customLegend){
    this.legend = this.customLegend;
  }
  else{
    for(var i=0;i<this.lines.length;i++){
      var leg = {
        name: this.lines[i].name
      };
      if(this.lines[i].colour){
        leg.colour = this.lines[i].colour;
      }
      else if(Array.isArray(this.colours)){
        leg.colour = this.colours[i];
      }
      else if(this.colours[this.lines[i].name]){
        leg.colour = this.colours[this.lines[i].name];
      }
      else {
        leg.colour = "black";
      }
      this.legend.push(leg);
    }
  }
}
