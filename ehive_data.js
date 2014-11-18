
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

        // Iterate through every enabled block and add each analysis to the list
        for (var x = 0; x < blocks_to_scan.length; x++) {
            var block = blocks_to_scan[x];
            if(! block.disabled) {
                var func = block.getAnalysis;
                if (func) {
                    var analysis_name = func.call(block);
                    analysis_names.push( analysis_name );
                }
            }
        }

        return analysis_names;
    }
}

