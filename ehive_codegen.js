Blockly.JavaScript['pipeline'] = function(block) {
    var pipeline_name = block.getFieldValue('pipeline_name');
    var pipeline_wide_parameters = Blockly.JavaScript.valueToCode(block, 'pipeline_wide_parameters', Blockly.JavaScript.ORDER_NONE) || 'null';
    var pipeline_analyses        = Blockly.JavaScript.statementToCode(block, 'pipeline_analyses');
    var name_code       = "var pipeline_name = '" + pipeline_name + "';\n";
    var params_code     = "var pipeline_wide_parameters = " + pipeline_wide_parameters + ";\n";
    var analyses_code   = "var pipeline_analyses = [\n" + pipeline_analyses + "];";
    return name_code + params_code + analyses_code;
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
    var logic_name  = block.getFieldValue('logic_name');
    var module      = block.getFieldValue('module');
    var code        = '{\n' + '"logic_name" : "' + logic_name + '",\n' + '"module" : "' + module + '",\n' + '},\n';
    return code;
};
