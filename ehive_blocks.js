'use strict';


Blockly.Blocks['pipeline'] = {
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Pipeline")
        .appendField(new Blockly.FieldTextInput(''), "pipeline_name");

/*
    this.appendDummyInput()
        .appendField("parameters:")
        .appendField(new Blockly.FieldCheckbox(false, function(option) {
                    this.sourceBlock_.updateShape_(option, 'analyses_label');
                }
        ), 'parameters_checkbox');
*/

    var name = 'parameters';
    this[name+'_counter'] = 0;

    this.appendDummyInput(name+'_input')
        .appendField(name+':', name+'_label')
//        .appendField(String(this[name+'_counter']), name+'_display')
        .appendField(new Blockly.FieldTextbutton('+', function() { this.sourceBlock_.updateShape_(name, undefined, 'analyses_label'); }) );

    this.appendDummyInput('analyses_label')
        .appendField("analyses:");
    this.appendStatementInput("pipeline_analyses")
        .setCheck(["conn_X_2_analysis"]);

    this.setDeletable(false);
  },
/*
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('parameters_counter', this['parameters_counter']);
    return container;
  },
  domToMutation: function(xmlElement) {
    this.updateShape_(xmlElement.getAttribute('parameters_counter')', 'analyses_label');
  },
*/
  updateShape_: function(name, indexToDelete, stickBefore) {

        var counter_ = this[name+'_counter'];
        if(indexToDelete===undefined) {
            this.appendDummyInput(name+'_input_'+counter_)
                .appendField(new Blockly.FieldTextInput('key_'+counter_), name+'_key_field_'+counter_)
                .appendField(" => ")
                .appendField(new Blockly.FieldTextInput('value_'+counter_), name+'_value_field_'+counter_)
                                // this counter-1 is still a puzzle for me. Isn't counter_ captured in a closure?
                .appendField(new Blockly.FieldTextbutton('–', function() { this.sourceBlock_.updateShape_(name, counter_-1, 'analyses_label'); }) );
            this.moveInputBefore(name+'_input_'+counter_, stickBefore);
            counter_++;
        } else {
            counter_--;
            if(indexToDelete!=counter_) {   // swap the one being deleted with the last one, then delete the last one
                var last_key    = this.getFieldValue( name+'_key_field_'+counter_ );
                var last_value  = this.getFieldValue( name+'_value_field_'+counter_ );

                this.setFieldValue(last_key,    name+'_key_field_'+indexToDelete);
                this.setFieldValue(last_value,  name+'_value_field_'+indexToDelete);
            }
            this.removeInput(name+'_input_'+counter_);
        }
        this[name+'_counter'] = counter_;
//        this.setFieldValue(String(counter_), name+'_display');
  }
};


Blockly.Blocks['dictionary'] = {
  init: function() {
    this.setColour(20);
    this.setOutput(true, ["conn_dictionary"]);

    this.appendDummyInput('open_bracket')
        .appendField(" { ");

    this.appendStatementInput("dictionary_pairs")
        .setCheck(["conn_kv_pair"]);

    this.appendDummyInput('close_bracket')
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

    this.appendDummyInput()
        .appendField("parameters:")
        .appendField(new Blockly.FieldCheckbox(false, function(option) {
                    this.sourceBlock_.updateShape_(option, 'dataflows');
                }
        ), 'parameters_checkbox');

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
  },

  onchange: function() {
    if(this.workspace && (this.getFieldValue('analysis_name') == '' )) {
        this.setFieldValue('analysis_' + (++Blockly.Data.Analyses.counter), 'analysis_name');   // unfortunately, the parameters were in the wrong order
    }
  },

  getAnalysis: function() {
    return this.getFieldValue('analysis_name');
  },

  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('parameters_on', this.getFieldValue('parameters_checkbox') == 'TRUE');
    return container;
  },
  domToMutation: function(xmlElement) {
    this.updateShape_(xmlElement.getAttribute('parameters_on') == 'TRUE', 'dataflows');
  },
  updateShape_: function(option, stickBefore) {
        var inputExists = this.getInput('parameters');
        if(option == true) {
            if(!inputExists) {
                this.appendDummyInput('open_bracket')
                    .appendField(" { ");
                this.appendStatementInput('parameters')
                    .setCheck(["conn_kv_pair"]);
                this.appendDummyInput('close_bracket')
                    .appendField(" } ");
                this.moveInputBefore('open_bracket', stickBefore);
                this.moveInputBefore('parameters', stickBefore);
                this.moveInputBefore('close_bracket', stickBefore);
            }
        } else if(inputExists) {
            this.removeInput('open_bracket');
            this.removeInput('parameters');
            this.removeInput('close_bracket');
        }
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
        .appendField(" ↓  branch #1")
        .appendField("               [template] →");

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
        .appendField("        [template] →");

    this.setNextStatement(true, ["conn_X_2_analysis"]);
    this.setInputsInline(false);
  }
};

