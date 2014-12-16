
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

