Blockly.Blocks['pipeline'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(120);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Pipeline name")
        .appendField(new Blockly.FieldTextInput(""), "pipeline_name");
    this.appendDummyInput()
        .appendField("Parameters")
        .appendField(new Blockly.FieldTextInput("{}"), "parameters");
    this.appendStatementInput("first_analysis")
        .setCheck(["conn_X_2_analysis"]);
    this.setTooltip('');
  }
};


Blockly.Blocks['analysis'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(210);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Analysis name")
        .appendField(new Blockly.FieldTextInput(""), "logic_name");
    this.appendValueInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Dataflows")
    this.appendDummyInput()
        .appendField("Module")
        .appendField(new Blockly.FieldTextInput("Hive::RunnableDB::SystemCmd"), "module");
    this.appendDummyInput()
        .appendField("Parameters")
        .appendField(new Blockly.FieldTextInput("{}"), "parameters");
    this.setPreviousStatement(true, ["conn_between_analysis", "conn_X_2_analysis", "conn_from_dataflow"]);
    this.setNextStatement(true, ["conn_between_analysis", "conn_analysis_2_semaphore", "conn_analysis_2_X"]);
    this.setTooltip('');
  }
};


Blockly.Blocks['named_analysis'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(210);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Analysis name")
        .appendField(new Blockly.FieldTextInput(""), "logic_name");
    this.setPreviousStatement(true, ["conn_analysis_2_X", "conn_X_2_analysis"]);
    this.setTooltip('');
  }
};

Blockly.Blocks['table'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(210);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Table name")
        .appendField(new Blockly.FieldTextInput(""), "table_name");
    this.setPreviousStatement(true, ['conn_analysis_2_X', "conn_from_dataflow"]);
    this.setTooltip('');
  }
};


Blockly.Blocks['accu'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(210);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Accumulator name")
        .appendField(new Blockly.FieldTextInput(""), "accu_name");
    this.appendDummyInput()
        .appendField("Signature")
        .appendField(new Blockly.FieldTextInput(""), "signature");
    this.setPreviousStatement(true, ['conn_analysis_2_X', "conn_from_dataflow"]);
    this.setTooltip('');
  }
};


/*
Blockly.Blocks['straight_dataflow'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(290);
    this.appendValueInput("var3")
        .setCheck(["dataflow_rule", "type_sem_dataflow"])
        .appendField("Non-blocking dataflow");
    this.setPreviousStatement(true, ["conn_X_2_analysis"]);
    this.setTooltip('');
  }
};
*/

Blockly.Blocks['semaphored_dataflow'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("var3")
        .setAlign(Blockly.ALIGN_CENTRE)
        .setCheck("conn_dataflow_rule")
        .appendField("Semaphore");
    this.appendDummyInput()
        .appendField("Funnel branch number")
        .appendField(new Blockly.FieldTextInput("1"), "NAME");
    this.setPreviousStatement(true, ["conn_analysis_2_semaphore", "conn_from_semaphore_adaptor"]);
    this.setNextStatement(true, ["conn_X_2_analysis"]);
    this.setTooltip('');
  }
};



Blockly.Blocks['dataflow_rule'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(260);
    this.appendValueInput("branch_number")
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Dataflow")
        .setCheck(["conn_dataflow_rule"]);
    this.appendDummyInput()
        .appendField("Branch number")
        .appendField(new Blockly.FieldTextInput("2"), "NAME");
    this.setOutput(true, ["conn_dataflow_rule", "conn_next_semaphore_adaptor"]);
    this.setNextStatement(true, ["conn_analysis_2_X", "conn_from_dataflow", "templated_dataflow"]);
    this.setTooltip('');
  }
};


Blockly.Blocks['template'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(65);
    this.appendDummyInput()
        .appendField("template")
        .appendField(new Blockly.FieldTextInput(""), "NAME");
    this.setPreviousStatement(true, ["conn_analysis_2_X", "templated_dataflow"]);
    this.setNextStatement(true, ["conn_X_2_analysis", "conn_from_dataflow", "conn_from_semaphore_adaptor"]);
    this.setTooltip('');
  }
};


Blockly.Blocks['spacer'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("other_analysis")
        .appendField("Extra semaphore adaptor");
    this.setOutput(true, ["conn_next_semaphore_adaptor"]);
    this.setNextStatement(true, ["conn_from_semaphore_adaptor", "templated_dataflow"]);
    this.setTooltip('');
  }
};
