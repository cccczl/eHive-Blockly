'use strict';


Blockly.PipeConfig = new Blockly.Generator('PipeConfig');


Blockly.PipeConfig.built_in_dict = function(block, name) {
    var counter_ = block[name+'_counter'];

    var dictionary = {};

    for (var i = 0; i<counter_; i++) {
        var input       = block.getInput(name+'_input_'+counter_);
        var pair_key    = block.getFieldValue( name+'_key_field_'+i );
        var pair_value  = block.getFieldValue( name+'_value_field_'+i );

        dictionary[pair_key] = pair_value;
    }

    return dictionary;
}


Blockly.PipeConfig['pipeline'] = function(block) {

    var pipeline_name               = block.getFieldValue( 'pipeline_name' );
//    var pipeline_wide_parameters    = this.generalBlockToObj( block.getInputTargetBlock( 'parameters' ), false );           // null or dict
    var pipeline_wide_parameters    = this.built_in_dict( block, 'parameters' );

    var backbone_of_analyses        = this.generalBlockToObj( block.getInputTargetBlock( 'pipeline_analyses' ), true );     // null or list

    var pipeline_obj = {};

    if(pipeline_name)                                       { pipeline_obj.pipeline_name            = pipeline_name; }
    if(pipeline_wide_parameters)                            { pipeline_obj.pipeline_wide_parameters = pipeline_wide_parameters; }
    if(backbone_of_analyses && backbone_of_analyses.length) { pipeline_obj.pipeline_analyses        = backbone_of_analyses; }

    return pipeline_obj;
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
    var analysis_parameters = this.generalBlockToObj( block.getInputTargetBlock( 'parameters' ), false );   // null or dict
    var dataflows           = this.generalBlockToObj( block.getInputTargetBlock( 'dataflows' ), true );     // a "horizontal" list
    var template            = this.generalBlockToObj( block.getInputTargetBlock( 'template' ), false );     // null or dict

    var analysis_obj = {
        'analysis_name'         : analysis_name,
        'module'                : module
    };
    if(analysis_parameters) { analysis_obj.analysis_parameters = analysis_parameters; }

    var nextBlock = block.getNextBlock();

    if( nextBlock) {    // record implicit dataflow
        if( nextBlock.type == 'semaphored_dataflow' ) {     // followed by a "backbone semaphore"
            var funnelBlock     = nextBlock.getNextBlock();
            var semaphored_fan  = this.generalBlockToObj( nextBlock.getInputTargetBlock( 'semaphored_fan' ), true );    // a "horizontal" list

            if(funnelBlock && ( funnelBlock.type == 'analysis' || funnelBlock.type == 'analysis_ref' ) ) {  // not expecting anything else to stick

                var dataflow_rule_obj = this.toDataflowObj(1, template, funnelBlock, true); // since it is the backbone, always treat the target as analysis_ref

                if(semaphored_fan.length) {       // otherwise silently skip the semaphore altogether
                    dataflow_rule_obj.semaphored_fan = semaphored_fan;
                }

                dataflows.push( dataflow_rule_obj );
            }

            nextBlock = funnelBlock;

        } else {    // any other autoflow rule
            var dataflow_rule_obj = this.toDataflowObj(1, template, nextBlock, true);

            dataflows.push( dataflow_rule_obj );
        }
    }

    if(dataflows.length) { analysis_obj.dataflows = dataflows; }

    var tail = this.generalBlockToObj( nextBlock, true);
    tail.unshift( analysis_obj );

    return tail;
}


Blockly.PipeConfig['extra_semaphore'] = function(block) {     // horizontal chain of dataflows is a list

    var dataflows           = this.generalBlockToObj( block.getInputTargetBlock( 'more_dataflows' ), true );  // a "horizontal" list
    var branch_number       = block.getFieldValue( 'branch_number' );
    var template            = this.generalBlockToObj( block.getInputTargetBlock( 'template' ), false );       // null or dict
    var semaphored_fan      = this.generalBlockToObj( block.getInputTargetBlock( 'semaphored_fan' ), true );  // a "horizontal" list
    var funnelBlock         = block.getNextBlock();

    if(funnelBlock && ( funnelBlock.type == 'analysis' || funnelBlock.type == 'analysis_ref' ) ) {

        var dataflow_rule_obj = this.toDataflowObj(branch_number, template, funnelBlock, false);

        if(semaphored_fan.length) {   // otherwise silently assume it is a non-semaphored dataflow
            dataflow_rule_obj.semaphored_fan = semaphored_fan;
        }

        dataflows.unshift( dataflow_rule_obj );
    }

    return dataflows;
}


Blockly.PipeConfig['dataflow_rule'] = function(block) {     // horizontal chain of dataflows is a list

    var dataflows           = this.generalBlockToObj( block.getInputTargetBlock( 'more_dataflows' ), true );  // a "horizontal" list
    var branch_number       = block.getFieldValue( 'branch_number' );
    var template            = this.generalBlockToObj( block.getInputTargetBlock( 'template' ), false );       // null or dict

    var nextBlock = block.getNextBlock();
    if( nextBlock ) {
        var dataflow_rule_obj = this.toDataflowObj(branch_number, template, nextBlock, false);

        dataflows.unshift( dataflow_rule_obj );
    }

    return dataflows;
}


Blockly.PipeConfig.toDataflowObj = function(branch_number, template, targetBlock, linkAnalyses) {

    var dataflow_rule_obj = {
        'branch_number'     : branch_number
    };
    if(template) { dataflow_rule_obj.template = template; }

    if(!linkAnalyses && targetBlock.type == 'analysis' ) {
        dataflow_rule_obj.target_chain = this.generalBlockToObj( targetBlock, true );
    } else if( targetBlock.type == 'analysis_ref' || (linkAnalyses && targetBlock.type == 'analysis') ) {
        dataflow_rule_obj.target_ref = targetBlock.getFieldValue( 'analysis_name' );
    } else if( targetBlock.type == 'table' ) {
        dataflow_rule_obj.target_ref = ':////' + targetBlock.getFieldValue( 'table_name' );
    } else if( targetBlock.type == 'accu' ) {
        dataflow_rule_obj.target_ref = ':////accu?' + targetBlock.getFieldValue( 'struct_name' ) + '=' + targetBlock.getFieldValue( 'signature_template' );
    }

    return dataflow_rule_obj;
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


Blockly.PipeConfig.workspaceToJSON = function(workspace, onlyPipelineBlock) {

    var json_text = '';

    var blocks = onlyPipelineBlock
        ? [ workspace.getBlockById( 1 ) ]   // assume pipeline block has been put first and has block.id=1
        : workspace.getTopBlocks(true);

    for (var i = 0, block; block = blocks[i]; i++) {

        var obj = this.generalBlockToObj( block, false );
        json_text += JSON.stringify(obj, null, 4) + '\n\n';
    }

    return json_text;
};

