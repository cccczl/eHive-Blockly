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

goog.provide('Blockly.Data');

goog.require('Blockly.Workspace');

Blockly.Data.Analyses = {
    counter : 0,

    getAllNames : function(opt_start_block) {

        var blocks_to_scan = opt_start_block
            ? opt_start_block.getDescendants()
            : Blockly.mainWorkspace.getAllBlocks();

        var analysis_names = [];

        for (var i in blocks_to_scan) {
            var block = blocks_to_scan[i];
            var func = block.getAnalysis;
            if (func) {
                var analysis_name = func.call(block);
                analysis_names.push( analysis_name );
            }
        }

        return analysis_names;
    },

    getNewName : function() {

        var allNames = Blockly.Data.Analyses.getAllNames();
        var namePattern = /^analysis_(\d+)$/;

        for(var i in allNames) {
            var aName = allNames[i];
            if( aName.match(namePattern) ) {
                var n = parseInt( aName.replace(namePattern, "$1") );
                if( n > Blockly.Data.Analyses.counter ) {
                    Blockly.Data.Analyses.counter = n;
                }
            }
        }
        return 'analysis_' + (++Blockly.Data.Analyses.counter);
    }
}

