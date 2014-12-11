'use strict';


Blockly.PipeConfig.toWorkspace = function(json_text, workspace) {

    var json_structure  = JSON.parse(json_text);

    workspace.clear();

    Blockly.PipeConfig.toWorkspace.pipeline(json_structure, workspace);
};


Blockly.PipeConfig.toWorkspace.pipeline = function(pipeline_node, workspace) {

    var pipeline_wide_parameters = pipeline_node['pipeline_wide_parameters'];

    var targetBlock = Blockly.Block.obtain(workspace, 'pipeline');
    targetBlock.initSvg();
    targetBlock.render();

    if(pipeline_wide_parameters) {
        Blockly.PipeConfig.toWorkspace.dictionary(pipeline_wide_parameters, targetBlock.getInput('parameters').connection);
    }

    var pipeline_analyses = pipeline_node['pipeline_analyses'] || [];
    var parentConnection = targetBlock.nextConnection;
    for(var i in pipeline_analyses) {
        var analysis_node = pipeline_analyses[i];

        var analysisBlock = Blockly.PipeConfig.toWorkspace.analysis(analysis_node, parentConnection);
        parentConnection = analysisBlock.nextConnection;
    }
};


Blockly.PipeConfig.toWorkspace.dictionary = function(dictionary_node, parentConnection) {
    var targetBlock = Blockly.Block.obtain(parentConnection.sourceBlock_.workspace, 'dictionary');
    targetBlock.initSvg();
    targetBlock.render();

    var childConnection = targetBlock.outputConnection;
    parentConnection.connect(childConnection);

    var i=0;
    for(var key in dictionary_node) {
        targetBlock.appendKeyValuePair();
        targetBlock.setFieldValue( key, 'key_field_'+i );
        targetBlock.setFieldValue( dictionary_node[key], 'value_field_'+i );
        i++;
    }

    return targetBlock;
};


Blockly.PipeConfig.toWorkspace.analysis = function(analysis_node, parentConnection) {

    var analysis_name       = analysis_node['analysis_name'];
    var module              = analysis_node['module'];
    var analysis_parameters = analysis_node['analysis_parameters'];
    var dataflows           = analysis_node['dataflows'];

    var targetBlock = Blockly.Block.obtain(parentConnection.sourceBlock_.workspace, 'analysis');

    targetBlock.setFieldValue( analysis_name, 'analysis_name');
    targetBlock.setFieldValue( module, 'module');

    targetBlock.initSvg();
    targetBlock.render();

    if(analysis_parameters) {
        Blockly.PipeConfig.toWorkspace.dictionary(analysis_parameters, targetBlock.getInput('parameters').connection);
    }

    var childConnection = targetBlock.previousConnection;
    parentConnection.connect(childConnection);

    return targetBlock;
};
