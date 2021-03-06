/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';


    // Disable blocks lying around the workspace unconnected to our main start block.
    // (original idea stolen from OpenRoberta and optimized)

var original_onMouseUp_ = Blockly.Block.prototype.onMouseUp_;

Blockly.Block.prototype.onMouseUp_ = function(e) {
    original_onMouseUp_.call(this, e);

    if (Blockly.selected) {
        var onDrop = Blockly.selected.onDrop;
        if(onDrop) {
            onDrop.call(Blockly.selected);
        }

        var rootBlock   = Blockly.selected.getRootBlock();
        var isDisabled  = (rootBlock.type != 'pipeline');
        var descendants = Blockly.selected.getDescendants();
        for(var i in descendants) {
            descendants[i].setDisabled(isDisabled);
        }
    }
};


Blockly.FieldDropdown.prototype.setValue = function(newValue) {      // Allow the label on the closed menu to differ from values of the open menu
  this.value_ = newValue;
  // Look up and display the human-readable text.
  var options = this.getOptions_();
  for(var x = 0; x < options.length; x++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[x][1] == newValue) {
      var shortValue = options[x][2] || options[x][0];
      this.setText(shortValue);
      return;
    }
  }
  // Value not found.  Add it, maybe it will become valid once set
  // (like variable names).
  this.setText(newValue);
};


Blockly.Input.prototype.appendSelector = function(allowedBlocks, presenceLabel, absenceLabel) {

    var presenceLabel   = presenceLabel || this.name;
    var absenceLabel    = absenceLabel  || 'no '+this.name;
    var ddl_name        = 'ddl_' + ((this.type == Blockly.DUMMY_INPUT) ? 'NEXT' : this.name);

    var dd_list = [
        [ absenceLabel, ':REMOVE', absenceLabel]
    ];
    if(allowedBlocks.length == 1) {
        dd_list.push( [presenceLabel+': ', allowedBlocks[0], presenceLabel ] );
    } else {
        for(var i = 0; i < allowedBlocks.length; i++) {
            dd_list.push( [allowedBlocks[i], allowedBlocks[i], presenceLabel ] );
        }
    }

        // The following automagic checks assume your application follows
        // a special convention for naming connection labels:
        //      "Prev/Output" connection labels must be identical to the block.type .
        //
    if(this.type == Blockly.DUMMY_INPUT) {  // "verical" connection
        this.sourceBlock_.setNextStatement(true, allowedBlocks);
    } else {    // "horizontal" types of connection
        this.setCheck(allowedBlocks);
    }

    var this_input = this;

    this.setAlign( this.type == Blockly.INPUT_VALUE ? Blockly.ALIGN_RIGHT : Blockly.ALIGN_LEFT)
        .appendField(new Blockly.FieldDropdown( dd_list, function(targetType) {

                    return this.sourceBlock_.toggleTargetBlock(this_input, targetType);
                }
        ), ddl_name);

    return this;
};


Blockly.Block.prototype.toggleTargetBlock = function(input, targetType) {     // universal version: can create any type of targetBlocks

    var targetBlock = (input.type == Blockly.DUMMY_INPUT) ? this.getNextBlock() : this.getInputTargetBlock(input.name);
    if( targetType==':REMOVE' ) {
        if(targetBlock) {
            targetBlock.dispose(true, true);    // or targetBlock.unplug(...)
        }
    } else {
        if(targetBlock) {   // Don't remove it, but return the "override" value to make sure the DDL is up to date:
            return targetBlock.type;
        } else {            // add a new kind of block:
            targetBlock = Blockly.Block.obtain(Blockly.getMainWorkspace(), targetType);
            var initValues = targetBlock.initValues;
            if(initValues) {
                initValues.call(targetBlock);
            }
            targetBlock.initSvg();
            targetBlock.render();


            var parentConnection = (input.type == Blockly.DUMMY_INPUT) ? this.nextConnection : this.getInput(input.name).connection;
            var childConnection = targetBlock.outputConnection || targetBlock.previousConnection;          // vertical or horizontal
            parentConnection.connect(childConnection);
        }
    }
};


    // A very useful mapping from connection back to input
Blockly.Connection.prototype.getInput = function() {
    var inputList = this.sourceBlock_.inputList;

    for(var i in inputList) {
        var connection = inputList[i].connection;
        if(connection == this) {
            return inputList[i];
        }
    }
};


    // If there is a ddl linked with the input, update its label to the type of the block plugged in:
Blockly.Connection.prototype.updateLinkedDDL = function() {

    var input       = this.getInput();
    var ddl_name    = 'ddl_' + (input ? input.name : 'NEXT');
    var ddl_field   = this.sourceBlock_.getField_(ddl_name);
    if(ddl_field) {
        var targetBlock = this.targetBlock();
        var type = targetBlock ? targetBlock.type : ':REMOVE';
        ddl_field.setValue(type);
    }
}


    // Update the DDL on connect() :
var original_connect = Blockly.Connection.prototype.connect;

Blockly.Connection.prototype.connect = function(otherConnection) {

    original_connect.call(this, otherConnection);

    var parentConnection = this.isSuperior() ? this : otherConnection;  // since connect() is symmetrical we never know which way it is called

    parentConnection.updateLinkedDDL();
};


    // Update the DDL on disconnect() :
var original_disconnect = Blockly.Connection.prototype.disconnect;

Blockly.Connection.prototype.disconnect = function() {

    var parentConnection = this.isSuperior() ? this : this.targetConnection;  // since disconnect() is symmetrical we never know which way it is called

    original_disconnect.call(this);

    parentConnection.updateLinkedDDL();
};

