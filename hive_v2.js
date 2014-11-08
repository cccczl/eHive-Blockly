Blockly.Blocks['pipeline'] = {
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Pipeline")
        .appendField(new Blockly.FieldTextInput(""), "pipeline_name");
    this.appendValueInput("pipeline_wide_parameters")
        .setCheck("conn_dictionary")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("[parameters] →");
    this.appendDummyInput()
        .appendField("analyses:");
    this.appendStatementInput("pipeline_analyses")
        .setCheck(["conn_X_2_analysis"]);
  }
};


Blockly.Blocks['analysis'] = {
  init: function() {
    this.setColour(210);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Analysis")
        .appendField(new Blockly.FieldTextInput(""), "logic_name");

    this.appendDummyInput()
        .appendField("module:")
        .appendField(new Blockly.FieldTextInput("Hive::RunnableDB::SystemCmd"), "module");

    this.appendValueInput("analysis_parameters")
        .setCheck("conn_dictionary")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("[parameters] →");

    this.appendValueInput("dataflows")
        .setCheck(["conn_dataflow_rule", "conn_next_semaphore_adaptor"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("[dataflows] →");

    this.appendValueInput("template")
        .setCheck("conn_dictionary")
        .appendField(" ↓  branch #1")
        .appendField("               [template] →");

    this.setPreviousStatement(true, ["conn_between_analysis", "conn_X_2_analysis", "conn_from_dataflow"]);
    this.setNextStatement(true, ["conn_between_analysis", "conn_analysis_2_semaphore", "conn_analysis_2_X"]);
    this.setInputsInline(false);
  }
};


Blockly.Blocks['named_analysis'] = {
  init: function() {
    this.setColour(210);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField(" ⤷  to Analysis")
        .appendField(new Blockly.FieldTextInput(""), "logic_name");

    this.setPreviousStatement(true, ["conn_analysis_2_X", "conn_X_2_analysis"]);
  }
};


Blockly.Blocks['accu'] = {
  init: function() {
    this.setColour(210);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Accumulate");

    this.appendDummyInput()
        .appendField("instances of variable")
        .appendField(new Blockly.FieldTextInput("foo"), "struct_name")
        .appendField("as")
        .appendField(new Blockly.FieldTextInput("[]"), "signature_template");

    this.appendDummyInput()
        .appendField("⤶");
        //.appendField("←+");
        //.appendField("⥺");
        //.appendField("←────∑");
        //.appendField("↙+");
        //.appendField("←");

    this.setPreviousStatement(true, ['conn_analysis_2_X', "conn_from_dataflow"]);
  }
};


Blockly.Blocks['table'] = {
  init: function() {
    this.setColour(210);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Store in table")
        .appendField(new Blockly.FieldTextInput("(table_name)"), "table_name");

    this.setPreviousStatement(true, ['conn_analysis_2_X', "conn_from_dataflow"]);
  }
};


Blockly.Blocks['dataflow_rule'] = {
  init: function() {
    this.setColour(260);
    this.setOutput(true, ["conn_dataflow_rule", "conn_next_semaphore_adaptor"]);

    this.appendValueInput("more_dataflows")
        .setCheck(["conn_dataflow_rule"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("[more] →");

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Dataflow");

    this.appendValueInput("template")
        .setCheck("conn_dictionary")
        .appendField(" ⇊  branch #")
        .appendField(new Blockly.FieldTextInput("2"), "branch_number")
        .appendField("        [template] →");

    this.setNextStatement(true, ["conn_analysis_2_X", "conn_from_dataflow"]);
    this.setInputsInline(false);
  }
};


Blockly.Blocks['semaphored_dataflow'] = {
  init: function() {
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Semaphore")

    this.appendValueInput("semaphored_fan")
        .setCheck("conn_dataflow_rule")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Fan →");

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Funnel");

    this.appendValueInput("template")
        .setCheck("conn_dictionary")
        .appendField(" ↓  branch #")
        .appendField(new Blockly.FieldTextInput("1"), "branch_number")
        .appendField("        [template] →");

    this.setPreviousStatement(true, ["conn_analysis_2_semaphore", "conn_from_semaphore_adaptor"]);
    this.setNextStatement(true, ["conn_X_2_analysis"]);
    this.setInputsInline(false);
  }
};


Blockly.Blocks['extra_semaphore'] = {
  init: function() {
    this.setColour(330);
    this.setOutput(true, ["conn_next_semaphore_adaptor"]);

    this.appendValueInput("more_dataflows")
        .setCheck(["conn_dataflow_rule"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("[more] →");

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Extra semaphore");

    this.appendValueInput("semaphored_fan")
        .setCheck("conn_dataflow_rule")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Fan →");

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Funnel");

    this.appendValueInput("template")
        .setCheck("conn_dictionary")
        .appendField(" ↓  branch #")
        .appendField(new Blockly.FieldTextInput("1"), "branch_number")
        .appendField("        [template] →");

    this.setNextStatement(true, ["conn_X_2_analysis"]);
    this.setInputsInline(false);
  }
};


Blockly.Blocks['dictionary'] = {
  init: function() {
    this.setColour(20);
    this.setOutput(true, ["conn_dictionary"]);

    this.appendDummyInput()
        .appendField(" { ");

    this.appendStatementInput("dictionary")
        .setCheck(["conn_kv_pair"]);

    this.appendDummyInput()
        .appendField(" } ");

    this.setInputsInline(false);
  }
};


Blockly.Blocks['key_value_pair'] = {
  init: function() {
    this.setColour(20);

    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("(key)"), "key")
        .appendField("⇒")
        .appendField(new Blockly.FieldTextInput("(value)"), "value");

    this.setPreviousStatement(true, ["conn_kv_pair"]);
    this.setNextStatement(true, ["conn_kv_pair"]);
  }
};

