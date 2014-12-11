'use strict';


Blockly.Blocks['pipeline'] = {
  default_name: 'pipeline name',

  init: function() {
    this.setColour(120);
    this.setInputsInline(false);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Pipeline")
        .appendField(new Blockly.FieldTextInput( this.default_name ), "pipeline_name");

    this.appendValueInput('parameters')
        .appendSelector(['dictionary2']);

    this.appendDummyInput()
        .appendSelector(['analysis'], '↓', '⏚')
    this.setNextStatement(true, ['analysis']);

    this.setDeletable(false);
  }
};


Blockly.Blocks['dictionary2'] = {
  length: 0,
  init: function() {
    this.setOutput(true, ['dictionary2']);

    this.setColour(20);
    this.setInputsInline(false);

    this.appendDummyInput('open_bracket')
        .appendField(" { ")
        .appendField(new Blockly.FieldTextbutton('+', function() { this.sourceBlock_.updateShape_(undefined); }) );

    this.appendDummyInput('close_bracket')
        .appendField(" } ");

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
  }
};


Blockly.Blocks['analysis'] = {
  default_name: 'analysis name',

  init: function() {
    this.setPreviousStatement(true, ['analysis']);

    this.setColour(210);
    this.setInputsInline(false);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Analysis")
        .appendField(new Blockly.FieldTextInput( this.default_name ), "analysis_name");

    this.appendDummyInput()
        .appendField("module:")
        .appendField(new Blockly.FieldTextInput( "Hive::RunnableDB::SystemCmd" ), "module");

    this.appendValueInput('parameters')
        .appendSelector(['dictionary2']);

    this.appendValueInput('dataflows')
        .appendSelector(['extra_semaphore', 'dataflow_rule']);

    this.appendValueInput('template')
        .appendSelector(['dictionary2']);

    this.appendDummyInput()
        .appendSelector(['analysis','analysis_ref','table','accu','semaphored_dataflow'], '↓', '⏚')
        .appendField(" branch #1");

    this.setNextStatement(true, ['analysis', 'analysis_ref', 'accu', 'table', 'semaphored_dataflow']);


    this.onDrop = this.initValues;
  },

  initValues: function() {
    if((this.workspace == Blockly.getMainWorkspace()) && (this.getFieldValue('analysis_name') == this.default_name )) {
        this.setFieldValue('analysis_' + (++Blockly.Data.Analyses.counter), 'analysis_name');   // unfortunately, the parameters were in the wrong order
    }
  },

  getAnalysis: function() {
    return this.getFieldValue('analysis_name');
  }
};


Blockly.Blocks['analysis_ref'] = {
  default_name: 'analysis name',

  init: function() {
    this.setPreviousStatement(true, ['analysis_ref']);

    this.setColour(210);
    this.setInputsInline(false);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField(" ⤷  to Analysis")
        .appendField(new Blockly.FieldDropdown( this.analysesMenuInit ), 'ddl_analyses' );
  },

  analysesMenuInit: function() {
    var list_of_analyses    = Blockly.Data.Analyses.getAllNames();
    var dd_list             = [];

    for(var i in list_of_analyses) {
        dd_list.push( [ list_of_analyses[i], list_of_analyses[i] ] );
    }

    return dd_list.length ? dd_list : [[ 'first_analysis', 'first_analysis']];  // the vanilla DDL doesn't support an empty list (crashes)
  }
};


Blockly.Blocks['accu'] = {
  default_name: 'variable name',

  init: function() {
    this.setPreviousStatement(true, ['accu']);

    this.setColour(210);
    this.setInputsInline(false);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Accumulate");

    this.appendDummyInput()
        .appendField("instances of variable")
        .appendField(new Blockly.FieldTextInput( this.default_name ), "struct_name")
        .appendField("as")
        .appendField(new Blockly.FieldTextInput("[]"), "signature_template");

    this.appendDummyInput()
        .appendField("⤶");
        //.appendField("←+");
        //.appendField("⥺");
        //.appendField("←────∑");
        //.appendField("↙+");
        //.appendField("←");
  }
};


Blockly.Blocks['table'] = {
  default_name: 'table name',

  init: function() {
    this.setPreviousStatement(true, ['table']);

    this.setColour(210);
    this.setInputsInline(false);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Store in table")
        .appendField(new Blockly.FieldTextInput( this.default_name ), "table_name");
  }
};


Blockly.Blocks['dataflow_rule'] = {
  init: function() {
    this.setOutput(true, ['dataflow_rule']);

    this.setColour(260);
    this.setInputsInline(false);

    this.appendValueInput('more dataflows')
        .appendSelector(['dataflow_rule']);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Dataflow");

    this.appendValueInput('template')
        .appendSelector(['dictionary2']);

    this.appendDummyInput()
        .appendSelector(['analysis','analysis_ref','table','accu','semaphored_dataflow'], '↓', '⏚')
        .appendField(" branch #")
        .appendField(new Blockly.FieldTextInput("2", Blockly.FieldTextInput.numberValidator), "branch_number");

/*
    this.appendDummyInput()
        .appendField(" ⇊  branch #")
        .appendField(new Blockly.FieldTextInput("2", Blockly.FieldTextInput.numberValidator), "branch_number");
*/

    this.setNextStatement(true, ['analysis', 'analysis_ref']);
  }
};


Blockly.Blocks['semaphored_dataflow'] = {
  init: function() {
    this.setPreviousStatement(true, ['semaphored_dataflow']);

    this.setColour(330);
    this.setInputsInline(false);

    this.appendDummyInput()
        .appendField("Semaphore")

    this.appendValueInput('fan')
        .appendSelector(['dataflow_rule']);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Funnel");

    this.appendDummyInput()
        .appendSelector(['analysis','analysis_ref'], '↓', '⏚')
        .appendField(" branch #1");

    this.setNextStatement(true, ['analysis', 'analysis_ref']);
  }
};


Blockly.Blocks['extra_semaphore'] = {
  init: function() {
    this.setOutput(true, ['extra_semaphore']);

    this.setColour(330);
    this.setInputsInline(false);

    this.appendValueInput('more dataflows')
        .appendSelector(['extra_semaphore', 'dataflow_rule']);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Extra semaphore");

    this.appendValueInput('fan')
        .appendSelector(['dataflow_rule']);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Funnel");

    this.appendValueInput('template')
        .appendSelector(['dictionary2']);

    this.appendDummyInput()
        .appendSelector(['analysis','analysis_ref'], '↓', '⏚')
        .appendField(" branch #")
        .appendField(new Blockly.FieldTextInput("1", Blockly.FieldTextInput.numberValidator), "branch_number");

    this.setNextStatement(true, ['analysis', 'analysis_ref']);
  }
};

