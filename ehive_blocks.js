'use strict';


Blockly.FieldDropdown.prototype.setValue = function(newValue) {      // interfere with the way Dropdown updates its own label
  this.value_ = newValue;
  // Look up and display the human-readable text.
  var options = this.getOptions_();
  for (var x = 0; x < options.length; x++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[x][1] == newValue) {
      var shortValue = options[x][0].replace(/: \w*/, '');
      this.setText(shortValue);
      return;
    }
  }
  // Value not found.  Add it, maybe it will become valid once set
  // (like variable names).
  this.setText(newValue);
};


Blockly.Input.prototype.appendSelector = function(allowedBlocks) {

    var targetName  = this.name;
    var displayName = targetName || '↓';

    var dd_list = [
        [ 'no '+displayName, ':REMOVE']
    ];
    if(allowedBlocks.length == 1) {
        dd_list.push( [displayName+': ', allowedBlocks[0] ] );
    } else {
        for (var i = 0; i < allowedBlocks.length; i++) {
            dd_list.push( [displayName+': '+allowedBlocks[i], allowedBlocks[i] ] );
        }
    }

    this//.setCheck(allowedBlocks)  // FIXME: we'll need to re-establish the connection rules somehow!
        .setAlign( this.type == Blockly.INPUT_VALUE ? Blockly.ALIGN_RIGHT : Blockly.ALIGN_LEFT)
        .appendField(new Blockly.FieldDropdown( dd_list, function(targetType) {

                    this.sourceBlock_.triggerTargetBlock(targetName, targetType);
                }
        ));

    return this;
};


Blockly.Block.prototype.triggerTargetBlock = function(targetName, targetType) {     // universal version: can create any type of targetBlocks

    var targetBlock = targetName ? this.getInputTargetBlock(targetName) : this.getNextBlock();              // named input or next
    if(targetType==':REMOVE' && targetBlock) {
        targetBlock.dispose(true, true);    // or targetBlock.unplug(...)
    } else if(targetType!=':REMOVE' && !targetBlock) {
        targetBlock = Blockly.Block.obtain(Blockly.getMainWorkspace(), targetType);
        targetBlock.initSvg();
        targetBlock.render();

        var parentConnection = targetName ? this.getInput(targetName).connection : this.nextConnection;     // named input or next
        var childConnection = targetBlock.outputConnection || targetBlock.previousConnection;               // vertical or horizontal
        parentConnection.connect(childConnection);
    }
}


Blockly.Blocks['pipeline'] = {
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Pipeline")
        .appendField(new Blockly.FieldTextInput('pipeline_name'), "pipeline_name");

    this.appendValueInput('parameters')
        .appendSelector(['dictionary2']);

/*
    this.appendStatementInput('pipeline_analyses')
        .appendSelector(['analysis']);
*/
    this.appendDummyInput()
        .appendSelector(['analysis'])
    this.setNextStatement(true, ["conn_between_analysis", "conn_analysis_2_semaphore", "conn_analysis_2_X"]);
    this.setInputsInline(false);

    this.setDeletable(false);
  }
};


Blockly.Blocks['dictionary2'] = {
  length: 0,
  init: function() {
    this.setColour(20);
    this.setOutput(true, ["dictionary2"]);

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

    this.appendValueInput('parameters')
        .appendSelector(['dictionary2']);

    this.appendValueInput('dataflows')
        .appendSelector(['extra_semaphore', 'dataflow_rule']);

    this.appendValueInput('template')
        .appendSelector(['dictionary2']);

    this.appendDummyInput()
        .appendSelector(['analysis','analysis_ref','table','accu','semaphored_dataflow'])
        .appendField(" branch #1");

    this.setPreviousStatement(true, ["conn_between_analysis", "analysis", "conn_from_dataflow"]);
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

    this.setPreviousStatement(true, ["conn_analysis_2_X", "analysis"]);
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
    this.setOutput(true, ["dataflow_rule", "extra_semaphore"]);

    this.appendValueInput('more dataflows')
        .appendSelector(['dataflow_rule']);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Dataflow");

    this.appendValueInput('template')
        .appendSelector(['dictionary2']);

    this.appendDummyInput()
        .appendSelector(['analysis','analysis_ref','table','accu','semaphored_dataflow'])
        .appendField(" branch #")
        .appendField(new Blockly.FieldTextInput("2", Blockly.FieldTextInput.numberValidator), "branch_number");

/*
    this.appendDummyInput()
        .appendField(" ⇊  branch #")
        .appendField(new Blockly.FieldTextInput("2", Blockly.FieldTextInput.numberValidator), "branch_number");
*/

    this.setNextStatement(true, ["conn_analysis_2_X", "conn_from_dataflow"]);
    this.setInputsInline(false);
  }
};


Blockly.Blocks['semaphored_dataflow'] = {
  init: function() {
    this.setColour(330);
    this.appendDummyInput()
        .appendField("Semaphore")

    this.appendValueInput('fan')
        .appendSelector(['dataflow_rule']);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_LEFT)
        .appendField("Funnel");

    this.appendDummyInput()
        .appendSelector(['analysis','analysis_ref'])
        .appendField(" branch #1");

    this.setPreviousStatement(true, ["conn_analysis_2_semaphore", "conn_from_semaphore_adaptor"]);
    this.setNextStatement(true, ["analysis"]);
    this.setInputsInline(false);
  }
};


Blockly.Blocks['extra_semaphore'] = {
  init: function() {
    this.setColour(330);
    this.setOutput(true, ["extra_semaphore"]);

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
        .appendSelector(['analysis','analysis_ref'])
        .appendField(" branch #")
        .appendField(new Blockly.FieldTextInput("1", Blockly.FieldTextInput.numberValidator), "branch_number");

    this.setNextStatement(true, ["analysis"]);
    this.setInputsInline(false);
  }
};

