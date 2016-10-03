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

/**
 * @fileoverview Textbutton field.
 * @author Leo Gordon
 */
'use strict';

goog.provide('Blockly.FieldTextbutton');

goog.require('Blockly.Field');


Blockly.FieldTextbutton = function(buttontext, changeHandler) {
  Blockly.FieldTextbutton.superClass_.constructor.call(this, '');

  this.buttontext_ = buttontext;
  this.changeHandler_ = changeHandler;
  this.setText(buttontext);
};
goog.inherits(Blockly.FieldTextbutton, Blockly.Field);


Blockly.FieldTextbutton.prototype.clone = function() {
  return new Blockly.FieldTextbutton(this.buttontext_, this.changeHandler_);
};


Blockly.FieldTextbutton.prototype.CURSOR = 'default';


Blockly.FieldTextbutton.prototype.showEditor_ = function() {
  if (this.changeHandler_) {
    this.changeHandler_();
  }
};


/*
    A usage example. You can add two independent MinusPlusCounters to a block by saying:

    Blockly.Block.appendMinusPlusCounter(this, 'age', 0, 0 );
    Blockly.Block.appendMinusPlusCounter(this, 'temperature', 37, 34, 42 );
*/

Blockly.Block.appendMinusPlusCounter = function(block, name, startValue, lowerLimit, upperLimit) {
    block.appendDummyInput(name+'_input')
        .appendField(name+':', name+'_label')
        .appendField(String(startValue || '0'), name)
        .appendField(new Blockly.FieldTextbutton('–', function() { var counter_=parseInt(this.sourceBlock_.getFieldValue(name))-1; if((lowerLimit===undefined) || counter_>=lowerLimit) { this.sourceBlock_.setFieldValue(String(counter_), name); } }), name+'_minus')
        .appendField(new Blockly.FieldTextbutton('+', function() { var counter_=parseInt(this.sourceBlock_.getFieldValue(name))+1; if((upperLimit===undefined) || counter_<=upperLimit) { this.sourceBlock_.setFieldValue(String(counter_), name); } }), name+'_plus');
}

