'use strict';


Blockly.Block.prototype.addNewDictionaryBlock = function(dictionary_name) {

    if(! this.getInputTargetBlock(dictionary_name)) {
        var paramBlock = Blockly.Block.obtain(Blockly.getMainWorkspace(), 'dictionary2');
        paramBlock.initSvg();
        paramBlock.render();

        var parentConnection = this.getInput(dictionary_name).connection;
        var childConnection = paramBlock.outputConnection;
        parentConnection.connect(childConnection);
    }
};


Blockly.Blocks['pipeline'] = {
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Pipeline")
        .appendField(new Blockly.FieldTextInput(''), "pipeline_name");

    this.appendValueInput("parameters")
        .setCheck("conn_dictionary")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("[parameters]")
        .appendField(new Blockly.FieldTextbutton('→', function() { this.sourceBlock_.addNewDictionaryBlock('parameters'); }) );

    this.appendDummyInput('analyses_label')
        .appendField("analyses:");
    this.appendStatementInput("pipeline_analyses")
        .setCheck(["conn_X_2_analysis"]);

    this.setDeletable(false);
  }
};


Blockly.Blocks['dictionary2'] = {
  length: 0,
  init: function() {
    this.setColour(20);
    this.setOutput(true, ["conn_dictionary"]);

    this.appendDummyInput('open_bracket')
        .appendField(" { ")
//        .appendField(String(this.length), name+'_display')
        .appendField(new Blockly.FieldTextbutton('+', function() { this.sourceBlock_.updateShape_(undefined); }) );

    this.appendDummyInput('close_bracket')
        .appendField(" } ");

    this.setInputsInline(false);
  },
  updateShape_: function(indexToDelete) {

        var counter_ = this.length;
        if(indexToDelete===undefined) {
            this.appendDummyInput('pair_'+counter_)
                                // this counter-1 is still a puzzle for me. Isn't counter_ captured in a closure?
                .appendField(new Blockly.FieldTextbutton('–', function() { this.sourceBlock_.updateShape_(counter_-1); }) )
                .appendField(new Blockly.FieldTextInput('key_'+counter_), 'key_field_'+counter_)
                .appendField("⇒")
                .appendField(new Blockly.FieldTextInput('value_'+counter_), 'value_field_'+counter_);
            this.moveInputBefore('pair_'+counter_, 'close_bracket');
            counter_++;
        } else {
            counter_--;
            for(var i=indexToDelete; i<counter_; i++) { // shift up all the pairs to fill the gap
                var next_i      = i+1;
                var next_key    = this.getFieldValue( 'key_field_'+next_i );
                var next_value  = this.getFieldValue( 'value_field_'+next_i );

                this.setFieldValue(next_key,    'key_field_'+i);
                this.setFieldValue(next_value,  'value_field_'+i);
            }
            this.removeInput('pair_'+counter_);         // then remove the last one
        }
        this.length = counter_;
 //       this.setFieldValue(String(counter_), name+'_display');
  }
};


Blockly.Blocks['analysis'] = {
  init: function() {
    this.setColour(210);

    // init() is called much more frequently than just to create a visible widget,
    //        so it's not a good place to count the widgets placed onto the workspace.

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Analysis")
        .appendField(new Blockly.FieldTextInput( '' ), "analysis_name");

    this.appendDummyInput()
        .appendField("module:")
        .appendField(new Blockly.FieldTextInput( "Hive::RunnableDB::SystemCmd" ), "module");

    this.appendValueInput("parameters")
        .setCheck("conn_dictionary")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("[parameters]")
        .appendField(new Blockly.FieldTextbutton('→', function() { this.sourceBlock_.addNewDictionaryBlock('parameters'); }) );

    this.appendValueInput("dataflows")
        .setCheck(["conn_dataflow_rule", "conn_next_semaphore_adaptor"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("[dataflows] →");

    this.appendValueInput("template")
        .setCheck("conn_dictionary")
        .appendField(" ↓  branch #1")
        .appendField("                      [template]")
        .appendField(new Blockly.FieldTextbutton('→', function() { this.sourceBlock_.addNewDictionaryBlock('template'); }) );

    this.setPreviousStatement(true, ["conn_between_analysis", "conn_X_2_analysis", "conn_from_dataflow"]);
    this.setNextStatement(true, ["conn_between_analysis", "conn_analysis_2_semaphore", "conn_analysis_2_X"]);
    this.setInputsInline(false);
  },

  onchange: function() {
    if(this.workspace && (this.getFieldValue('analysis_name') == '' )) {
        this.setFieldValue('analysis_' + (++Blockly.Data.Analyses.counter), 'analysis_name');   // unfortunately, the parameters were in the wrong order
    }
  },

  getAnalysis: function() {
    return this.getFieldValue('analysis_name');
  }
};


Blockly.Blocks['analysis_ref'] = {
  init: function() {
    this.setColour(210);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField(" ⤷  to Analysis")
        .appendField(new Blockly.FieldTextInput( '' ), "analysis_name");

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
        .appendField(new Blockly.FieldTextInput("2", Blockly.FieldTextInput.numberValidator), "branch_number")
        .appendField("                      [template]")
        .appendField(new Blockly.FieldTextbutton('→', function() { this.sourceBlock_.addNewDictionaryBlock('template'); }) );

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

    this.appendDummyInput()
        .appendField(" ↓  branch #1");

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
        .appendField(new Blockly.FieldTextInput("1", Blockly.FieldTextInput.numberValidator), "branch_number")
        .appendField("                      [template]")
        .appendField(new Blockly.FieldTextbutton('→', function() { this.sourceBlock_.addNewDictionaryBlock('template'); }) );

    this.setNextStatement(true, ["conn_X_2_analysis"]);
    this.setInputsInline(false);
  }
};

