
// Shamelessly copied from OpenRoberta

Blockly.Block.prototype.onMouseUp_ = function(e) {
    var this_ = this;
    Blockly.doCommand(function() {
        Blockly.terminateDrag_();
        if (Blockly.selected && Blockly.highlightedConnection_) {
            // Connect two blocks together.
            Blockly.localConnection_.connect(Blockly.highlightedConnection_);
            if (this_.svg_) {
                // Trigger a connection animation.
                // Determine which connection is inferior (lower in the source stack).
                var inferiorConnection;
                if (Blockly.localConnection_.isSuperior()) {
                    inferiorConnection = Blockly.highlightedConnection_;
                } else {
                    inferiorConnection = Blockly.localConnection_;
                }
                inferiorConnection.sourceBlock_.svg_.connectionUiEffect();
            }
            if (this_.workspace.trashcan && this_.workspace.trashcan.isOpen) {
                // Don't throw an object in the trash can if it just got connected.
                this_.workspace.trashcan.close();
            }
        } else if (this_.workspace.trashcan && this_.workspace.trashcan.isOpen) {
            var trashcan = this_.workspace.trashcan;
            goog.Timer.callOnce(trashcan.close, 100, trashcan);
            Blockly.selected.dispose(false, true);
            // Dropping a block on the trash can will usually cause the workspace to
            // resize to contain the newly positioned block.  Force a second resize
            // now that the block has been deleted.
            Blockly.fireUiEvent(window, 'resize');
        }
        if (Blockly.highlightedConnection_) {
            Blockly.highlightedConnection_.unhighlight();
            Blockly.highlightedConnection_ = null;
        }
        // Check if this block is part of a task
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
    });
};



