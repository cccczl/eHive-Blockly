
Blockly.PipeConfig = new Blockly.Generator('PipeConfig');


Blockly.PipeConfig['pipeline'] = function(block) {

    var pipeline_name               = block.getFieldValue( 'pipeline_name' );
    var pipeline_wide_parameters    = this.generalBlockToObj( block.getInputTargetBlock( 'pipeline_wide_parameters' ), false );   // null or dict
    var backbone_of_analyses        = this.generalBlockToObj( block.getInputTargetBlock( 'pipeline_analyses' ), true );           // null or list

    var obj = {
        'pipeline_name'             : pipeline_name,
        'pipeline_wide_parameters'  : pipeline_wide_parameters,
        'pipeline_analyses'         : backbone_of_analyses
    };

    return obj;
}


Blockly.PipeConfig['dictionary'] = function(block) {        // just pass it through

    var dictionary_pairs            = this.generalBlockToObj( block.getInputTargetBlock( 'dictionary_pairs' ), false ) || {};

    return dictionary_pairs;
}


Blockly.PipeConfig['key_value_pair'] = function(block) {    // special case where we want a dictionary, not a list

    var pair_key    = block.getFieldValue( 'key' );
    var pair_value  = block.getFieldValue( 'value' );

    var nextBlock = block.getNextBlock();
    var dict = nextBlock ? this.key_value_pair( nextBlock ) : {};
    dict[pair_key] = pair_value;

    return dict;
}


    // three types of dataflow target that do not leave a direct trace in the chain
Blockly.PipeConfig['analysis_ref'] = function(block) {
    return [] ;
}


Blockly.PipeConfig['table'] = function(block) {
    return [] ;
}


Blockly.PipeConfig['accu'] = function(block) {
    return [] ;
}


Blockly.PipeConfig['analysis'] = function(block) {          // vertical stack of analyses is a list

    var analysis_name       = block.getFieldValue( 'analysis_name' );
    var module              = block.getFieldValue( 'module' );
    var analysis_parameters = this.generalBlockToObj( block.getInputTargetBlock( 'analysis_parameters' ), false );// null or dict
    var dataflows           = this.generalBlockToObj( block.getInputTargetBlock( 'dataflows' ), true );           // a "horizontal" list
    var template            = this.generalBlockToObj( block.getInputTargetBlock( 'template' ), false );           // null or dict

    var analysis_obj = {
        'analysis_name'         : analysis_name,
        'module'                : module,
        'analysis_parameters'   : analysis_parameters,
        'dataflows'             : dataflows
    };

    var nextBlock = block.getNextBlock();

    if( nextBlock) {    // record implicit dataflow
        if( nextBlock.type == 'semaphored_dataflow' ) {
            var funnelBlock     = nextBlock.getNextBlock();
            var semaphored_fan  = this.generalBlockToObj( nextBlock.getInputTargetBlock( 'semaphored_fan' ), true );    // a "horizontal" list

            if(funnelBlock && ( funnelBlock.type == 'analysis' || funnelBlock.type == 'analysis_ref' ) ) {
                var dataflow_rule_obj = {
                    'branch_number'     : 1,
                    'template'          : template,
                    'target'            : funnelBlock.getFieldValue( 'analysis_name' )
                };

                if(semaphored_fan.length>0) {
                    dataflow_rule_obj.semaphored_fan = semaphored_fan;
                }

                dataflows.push( dataflow_rule_obj );
            }

            nextBlock = funnelBlock;

        } else {
            var dataflow_rule_obj = {
                'branch_number'     : 1,
                'template'          : template
            };

            if( nextBlock.type == 'analysis' || nextBlock.type == 'analysis_ref' ) {
                dataflow_rule_obj.target = nextBlock.getFieldValue( 'analysis_name' );
            } else if( nextBlock.type == 'table' ) {
                dataflow_rule_obj.target = ':////' + nextBlock.getFieldValue( 'table_name' );
            } else if( nextBlock.type == 'accu' ) {
                dataflow_rule_obj.target = ':////accu?' + nextBlock.getFieldValue( 'struct_name' ) + '=' + nextBlock.getFieldValue( 'signature_template' );
            }

            dataflows.push( dataflow_rule_obj );
        }
    }

    var tail = this.generalBlockToObj( nextBlock, true);
    tail.unshift( analysis_obj );

    return tail;
}


Blockly.PipeConfig['dataflow_rule'] = function(block) {     // horizontal chain of dataflows is a list

    var branch_number       = block.getFieldValue( 'branch_number' );
    var more_dataflows      = this.generalBlockToObj( block.getInputTargetBlock( 'more_dataflows' ), true );  // a "horizontal" list
    var template            = this.generalBlockToObj( block.getInputTargetBlock( 'template' ), false );       // null or dict

    var nextBlock = block.getNextBlock();
    if( nextBlock ) {

        var dataflow_rule_obj = {
            'branch_number'     : branch_number,
            'template'          : template,
        };

        if( nextBlock.type == 'analysis' ) {
            dataflow_rule_obj.target_chain = this.generalBlockToObj( nextBlock, true );
        } else if( nextBlock.type == 'analysis_ref' ) {
            dataflow_rule_obj.target = nextBlock.getFieldValue( 'analysis_name' );
        } else if( nextBlock.type == 'table' ) {
            dataflow_rule_obj.target = ':////' + nextBlock.getFieldValue( 'table_name' );
        } else if( nextBlock.type == 'accu' ) {
            dataflow_rule_obj.target = ':////accu?' + nextBlock.getFieldValue( 'struct_name' ) + '=' + nextBlock.getFieldValue( 'signature_template' );
        }

        more_dataflows.unshift( dataflow_rule_obj );
    }

    return more_dataflows;
}


Blockly.PipeConfig.generalBlockToObj = function(block, returnarray) {

    if(block) {

            // dispatcher:
        var func = this[block.type];
        if(func) {
            return func.call(this, block);
        }

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
                // var inputBlock = inputLine.connection.targetBlock();      // same trick here - we'd like to access an inputBlock using its name

                var inputBlock = block.getInputTargetBlock( inputLine.name );


                if (inputLine.type == Blockly.INPUT_VALUE) {
                    obj[inputLine.name + '(value)'] = this.generalBlockToObj( inputBlock, false );

                } else if (inputLine.type == Blockly.NEXT_STATEMENT) {
                    obj[inputLine.name + '(statement)'] = this.generalBlockToObj( inputBlock, false );
                }
            }
        }

        if( returnarray ) {
            var nextBlock = block.getNextBlock();
            if (nextBlock) {
                var tail = this.generalBlockToObj( nextBlock, true );
                tail.unshift( obj );
                return tail;
            } else {
                return [ obj ];
            }
        } else {
            return obj;
        }

    } else if( returnarray ) {
        return [];
    } else {
        return null;
    }
}


Blockly.PipeConfig.workspaceToJSON = function(workspace) {

    var json_text = '';

    var blocks = workspace.getTopBlocks(true);
    for (var i = 0, block; block = blocks[i]; i++) {

        var obj = this.generalBlockToObj( block, false );
        json_text += JSON.stringify(obj, null, 4) + '\n\n';
    }

    return json_text;
};

