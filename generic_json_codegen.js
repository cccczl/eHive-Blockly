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

Blockly.PipeConfig = new Blockly.Generator('PipeConfig');


Blockly.PipeConfig.workspaceToJSON = function(workspace) {

    var json_text = '';

    var blocks = workspace.getTopBlocks(true);
    for (var i = 0, block; block = blocks[i]; i++) {

        var obj = Blockly.PipeConfig.generalBlockToObj( block, false );
        json_text += JSON.stringify(obj, null, 4) + '\n\n';
    }

    return json_text;
};


Blockly.PipeConfig.generalBlockToObj = function(block, returnarray) {

    if(block) {
        var obj = {
            'ID'    : block.id,
            'CLASS' : block.type,
        };

        returnarray = returnarray || (block.nextConnection ? true : false);

        for (var i = 0, inputLine; inputLine = block.inputList[i]; i++) {

            for (var y = 0, field; field = inputLine.fieldRow[y]; y++) {
                if (field.name && field.EDITABLE) {
                    // inputnode.fields[field.name] = field.getValue();     // the direct way assumes we scan through fields in a 2D order (all fields or all inputLines)
                                                                            //
                    obj[field.name] = block.getFieldValue( field.name );    // however I'd like to make sure we can access the same data directly, by using field's name
                                                                            // it works!!!
                }
            }

            if (inputLine.type != Blockly.DUMMY_INPUT) {        // dummy means there may be fields, but no slots
                var inputBlock = inputLine.connection.targetBlock();

                if (inputLine.type == Blockly.INPUT_VALUE) {
                    obj[inputLine.name + '(value)'] = Blockly.PipeConfig.generalBlockToObj( inputBlock, false );

                } else if (inputLine.type == Blockly.NEXT_STATEMENT) {
                    obj[inputLine.name + '(statement)'] = Blockly.PipeConfig.generalBlockToObj( inputBlock, false );
                }
            }
        }

        if( returnarray ) {
            var nextBlock = block.getNextBlock();
            if (nextBlock) {
                var tail = Blockly.PipeConfig.generalBlockToObj( nextBlock, true );
                tail.unshift( obj );
                return tail;
            } else {
                return [ obj ];
            }
        } else {
            return obj;
        }

    } else {
        return null;
    }
}

