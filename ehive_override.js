
    // slightly improved (by proper extension) OpenRoberta code
    // for disabling blocks lying around the workspace unconnected to our main start block:

var original_onMouseUp_ = Blockly.Block.prototype.onMouseUp_;

Blockly.Block.prototype.onMouseUp_ = function(e) {
    original_onMouseUp_.call(this, e);
    
        // Check if this block is part of a task:
    if (Blockly.selected) {
        var topBlocks = Blockly.getMainWorkspace().getTopBlocks(true);
        var rootBlock = Blockly.selected.getRootBlock();
        var found = false;
        for (var i = 0; !found && i < topBlocks.length; i++) {
            var block = topBlocks[i];
            var disabled = true;
            while (block) {
                if (block == rootBlock) {
                    if (block.type == 'pipeline') {
                        disabled = false;
                    }
                    found = true;
                }
                if (found) {
                    var descendants = rootBlock.getDescendants();
                    for (var j = 0; j < descendants.length; j++) {
                        descendants[j].setDisabled(disabled);
                    }
                }
                block = block.getNextBlock();
            }
            if (found)
                break;
        }
    }
};

