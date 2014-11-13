Blockly.JavaScript['pipeline'] = function(block) {
    var pipeline_name = block.getFieldValue('pipeline_name');
    var pipeline_wide_parameters = Blockly.JavaScript.valueToCode(block, 'pipeline_wide_parameters', Blockly.JavaScript.ORDER_NONE);
    var pipeline_analyses        = Blockly.JavaScript.statementToCode(block, 'pipeline_analyses');

    var code = "var pipeline = {\n";

    if(pipeline_name) {
        code += ' "name" : "' + pipeline_name + '",\n';
    }

    if(pipeline_wide_parameters) {
        code += ' "parameters" : ' + pipeline_wide_parameters + ',\n';
    }

    if(pipeline_analyses) {
        code += ' "analyses" : [\n' + pipeline_analyses + ' ],\n';
    }

    code += '};\n';

    return code;
};


Blockly.JavaScript['dictionary'] = function(block) {
    var pairs = Blockly.JavaScript.statementToCode(block, 'dictionary_pairs');
    var code  = '{\n' + pairs + '}';
    return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.JavaScript['key_value_pair'] = function(block) {
    var pair_key   = block.getFieldValue('key');
    var pair_value = block.getFieldValue('value');
    var code = '"' + pair_key + '" : "' + pair_value + '",\n';
    return code;
};


Blockly.JavaScript['analysis'] = function(block) {
    var logic_name          = block.getFieldValue('logic_name');
    var module              = block.getFieldValue('module');
    var analysis_parameters = Blockly.JavaScript.valueToCode(block, 'analysis_parameters', Blockly.JavaScript.ORDER_NONE);

    var code    = '{\n';
        code   += '"logic_name" : "' + logic_name + '",\n';
        code   += '"module" : "' + module + '",\n';

    if(analysis_parameters) {
        code += '"parameters" : ' + analysis_parameters + ',\n';
    }

    code += '},\n';

    return code;
};
