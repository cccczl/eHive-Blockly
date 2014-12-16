'use strict';


Blockly.Blocks['pipeline'] = {
  default_name: 'pipeline name',

  init: function() {
    this.setColour(120);
    this.setInputsInline(false);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Pipeline")
        .appendField(new Blockly.FieldTextInput( this.default_name ), 'pipeline_name');

    this.appendValueInput('parameters')
        .appendSelector(['dictionary']);

    this.appendDummyInput()
        .appendSelector(['analysis'], '↓', '⏚')

    this.setDeletable(false);
  }
};


Blockly.Blocks['dictionary'] = {
  length: 0,
  init: function() {
    this.setOutput(true, ['dictionary']);

    this.setColour(20);
    this.setInputsInline(false);

    this.appendDummyInput('open_bracket')
        .appendField(" { ")
        .appendField(new Blockly.FieldTextbutton('+', function() { this.sourceBlock_.appendKeyValuePair(); }) );

    this.appendDummyInput('close_bracket')
        .appendField(" } ");

  },

  appendKeyValuePair: function() {

        var lastIndex = this.length++;

        var appended_input = this.appendDummyInput('element_'+lastIndex);
        appended_input.appendField(new Blockly.FieldTextbutton('–', function() { this.sourceBlock_.deleteKeyValuePair(lastIndex); }) )
            .appendField(new Blockly.FieldTextInput('key_'+lastIndex), 'key_field_'+lastIndex)
            .appendField("⇒")
            .appendField(new Blockly.FieldTextInput('value_'+lastIndex), 'value_field_'+lastIndex);

        this.moveInputBefore('element_'+lastIndex, 'close_bracket');

        return appended_input;
  },

  deleteKeyValuePair: function(indexToDelete) {

        var lastIndex = --this.length;
        for(var i=indexToDelete; i<lastIndex; i++) { // shift up all the pairs to fill the gap
            var next_i      = i+1;
            var next_key    = this.getFieldValue( 'key_field_'+next_i );
            var next_value  = this.getFieldValue( 'value_field_'+next_i );

            this.setFieldValue(next_key,    'key_field_'+i);
            this.setFieldValue(next_value,  'value_field_'+i);
        }
        this.removeInput('element_'+lastIndex);         // then remove the last one
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
        .appendField(new Blockly.FieldTextInput( this.default_name ), 'analysis_name');

    this.appendDummyInput()
        .appendField("module:")
        .appendField(new Blockly.FieldTextInput( "Hive::RunnableDB::SystemCmd" ), 'module');

    this.appendValueInput('parameters')
        .appendSelector(['dictionary']);

    this.appendValueInput('dataflows')
        .appendSelector(['extra_semaphore', 'dataflow_rule']);

    this.appendValueInput('template')
        .appendSelector(['dictionary']);

    this.appendDummyInput()
        .appendSelector(['analysis', 'analysis_ref', 'table', 'accu', 'semaphored_dataflow'], '↓', '⏚')
        .appendField(" branch #1");

    this.onDrop = this.initValues;
  },

  initValues: function() {
    if((this.workspace == Blockly.getMainWorkspace()) && (this.getFieldValue('analysis_name') == this.default_name )) {
        this.setFieldValue( Blockly.Data.Analyses.getNewName(), 'analysis_name');   // API fault: counter-intuitive parameter order
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

    return dd_list.length ? dd_list : [[ 'analysis_1', 'analysis_1']];  // the vanilla DDL doesn't support an empty list (crashes)
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
        .appendField(new Blockly.FieldTextInput( this.default_name ), 'struct_name')
        .appendField("as")
        .appendField(new Blockly.FieldTextInput("[]"), 'signature_template');

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
        .appendField(new Blockly.FieldTextInput( this.default_name ), 'table_name');
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
        .appendSelector(['dictionary']);

    this.appendDummyInput()
        .appendSelector(['analysis','analysis_ref','table','accu','semaphored_dataflow'], '↓', '⏚')
        .appendField(" branch #")
        .appendField(new Blockly.FieldTextInput("2", Blockly.FieldTextInput.numberValidator), 'branch_number');

/*
    this.appendDummyInput()
        .appendField(" ⇊  branch #")
        .appendField(new Blockly.FieldTextInput("2", Blockly.FieldTextInput.numberValidator), 'branch_number');
*/

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
        .appendSelector(['dictionary']);

    this.appendDummyInput()
        .appendSelector(['analysis','analysis_ref'], '↓', '⏚')
        .appendField(" branch #")
        .appendField(new Blockly.FieldTextInput("1", Blockly.FieldTextInput.numberValidator), 'branch_number');
  }
};

