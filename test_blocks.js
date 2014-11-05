Blockly.Blocks['green_block'] = {
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
        .appendField("Green Block");
    this.setPreviousStatement(true, ["blue_green"]);
    this.setNextStatement(true, ["green_blue", "green_purple"]);
  }
};


Blockly.Blocks['blue_block'] = {
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendField("Blue Block");
    this.setPreviousStatement(true, ["green_blue"]);
    this.setNextStatement(true, ["blue_green"]);
  }
};


Blockly.Blocks['purple_block'] = {
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendField("Purple Block");
    this.setPreviousStatement(true, ["green_purple"]);
  }
};

