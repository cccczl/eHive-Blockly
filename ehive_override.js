
    // Disable blocks lying around the workspace unconnected to our main start block.
    // (original idea stolen from OpenRoberta and optimized)

var original_onMouseUp_ = Blockly.Block.prototype.onMouseUp_;

Blockly.Block.prototype.onMouseUp_ = function(e) {
    original_onMouseUp_.call(this, e);
    
    if (Blockly.selected) {
        var rootBlock = Blockly.selected.getRootBlock();

        var isDisabled = (rootBlock.type != 'pipeline');

        var descendants = Blockly.selected.getDescendants();
        for(var i in descendants) {
            descendants[i].setDisabled(isDisabled);
        }
    }
};

