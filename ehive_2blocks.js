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

'use strict';


Blockly.PipeConfig.toWorkspace = function(json_text, workspace) {

    var json_structure  = JSON.parse(json_text);

    workspace.clear();

    Blockly.PipeConfig.toWorkspace.pipeline(json_structure, workspace);
};


Blockly.PipeConfig.toWorkspace.pipeline = function(pipeline_node, workspace) {

    var pipeline_wide_parameters    = pipeline_node['pipeline_wide_parameters'];
    var pipeline_analyses           = pipeline_node['pipeline_analyses'] || [];

    var targetBlock = Blockly.Block.obtain(workspace, 'pipeline');
    targetBlock.initSvg();
    targetBlock.render();

    if(pipeline_wide_parameters) {
        Blockly.PipeConfig.toWorkspace.dictionary(pipeline_wide_parameters, targetBlock.getInput('parameters').connection);
    }


    Blockly.PipeConfig.toWorkspace.analyses(pipeline_analyses, targetBlock.nextConnection);
};


Blockly.PipeConfig.toWorkspace.dictionary = function(dictionary_node, parentConnection) {

    var targetBlock = Blockly.Block.obtain(parentConnection.sourceBlock_.workspace, 'dictionary');

    targetBlock.initSvg();
    targetBlock.render();
    parentConnection.connect( targetBlock.outputConnection );   // establish the horizontal link

    var i=0;
    for(var key in dictionary_node) {
        targetBlock.appendKeyValuePair();
        targetBlock.setFieldValue( key, 'key_field_'+i );
        targetBlock.setFieldValue( dictionary_node[key], 'value_field_'+i );
        i++;
    }

    return targetBlock;
};


Blockly.PipeConfig.toWorkspace.analyses = function(analyses, parentConnection) {

    if(analyses.length == 0) return;

    var analysis_node       = analyses.shift();

    var analysis_name       = analysis_node['analysis_name'];
    var module              = analysis_node['module'];
    var analysis_parameters = analysis_node['analysis_parameters'];
    var dataflows           = analysis_node['dataflows'] || [];

    var targetBlock = Blockly.Block.obtain(parentConnection.sourceBlock_.workspace, 'analysis');

    targetBlock.setFieldValue( analysis_name, 'analysis_name');
    targetBlock.setFieldValue( module, 'module');

    targetBlock.initSvg();
    targetBlock.render();

    if(analysis_parameters) {
        Blockly.PipeConfig.toWorkspace.dictionary(analysis_parameters, targetBlock.getInput('parameters').connection);
    }

    parentConnection.connect( targetBlock.previousConnection ); // establish the vertical link

    var dataflows_connect_here = targetBlock.getInput('dataflows').connection;

    for(var i in dataflows) {
        var dataflow_node   = dataflows[i];
        var template        = dataflow_node['template'];

        var isBackbone  = ! dataflow_node.hasOwnProperty('branch_number');
        var isSemaphore =   dataflow_node.hasOwnProperty('semaphore_fan');

        if(isBackbone) {        // (links DOWN)

            if(template) {
                Blockly.PipeConfig.toWorkspace.dictionary(template, targetBlock.getInput('template').connection);
            }

            if(isSemaphore) {   // semaphored_dataflow:
                Blockly.PipeConfig.toWorkspace.semaphored_dataflow(dataflow_node, analyses, targetBlock.nextConnection);
            } else {            // next analysis:
                Blockly.PipeConfig.toWorkspace.analyses(analyses, targetBlock.nextConnection);
            }
        } else {                // (links to the RIGHT)
            if(isSemaphore) {   // extra_semaphore:
                dataflows_connect_here = Blockly.PipeConfig.toWorkspace.extra_semaphore(dataflow_node, dataflows_connect_here);
            } else {            // dataflow_rule:
                dataflows_connect_here = Blockly.PipeConfig.toWorkspace.dataflow_rule(dataflow_node, dataflows_connect_here);
            }
        }
    }

    return targetBlock;
};


Blockly.PipeConfig.toWorkspace.dataflow_rule = function(dataflow_node, parentConnection) {

    var branch_number       = dataflow_node['branch_number'];
    var template            = dataflow_node['template'];
    var target_chain        = dataflow_node['target_chain'];
    var target_ref          = dataflow_node['target_ref'];

    var targetBlock = Blockly.Block.obtain(parentConnection.sourceBlock_.workspace, 'dataflow_rule');

    targetBlock.setFieldValue( branch_number, 'branch_number');

    targetBlock.initSvg();
    targetBlock.render();
    parentConnection.connect( targetBlock.outputConnection );   // establish the horizontal link

    if(template) {
        Blockly.PipeConfig.toWorkspace.dictionary(template, targetBlock.getInput('template').connection);
    }

    if(target_chain) {
        Blockly.PipeConfig.toWorkspace.analyses(target_chain, targetBlock.nextConnection);
    } else if(target_ref) {
        console.log('TODO: target_refs not implemented yet');
    } else {
        console.log('ERROR: unexpected lack of target');
    }

    return targetBlock.getInput('more dataflows').connection;
};


Blockly.PipeConfig.toWorkspace.semaphored_dataflow = function(dataflow_node, analyses, parentConnection) {

    if(analyses.length == 0) return;

    var targetBlock = Blockly.Block.obtain(parentConnection.sourceBlock_.workspace, 'semaphored_dataflow');

    targetBlock.initSvg();
    targetBlock.render();
    parentConnection.connect( targetBlock.previousConnection ); // establish the vertical link

    var semaphore_fan           = dataflow_node['semaphore_fan'];
    var semaflows_connect_here  = targetBlock.getInput('fan').connection;

    for(var i in semaphore_fan) {
        var semaflow_node   = semaphore_fan[i];

        semaflows_connect_here = Blockly.PipeConfig.toWorkspace.dataflow_rule(semaflow_node, semaflows_connect_here );
    }

    Blockly.PipeConfig.toWorkspace.analyses(analyses, targetBlock.nextConnection);
};


Blockly.PipeConfig.toWorkspace.extra_semaphore = function(dataflow_node, parentConnection) {

    var branch_number       = dataflow_node['branch_number'];
    var template            = dataflow_node['template'];
    var target_chain        = dataflow_node['target_chain'];

    if(target_chain.length == 0) return;

    var targetBlock = Blockly.Block.obtain(parentConnection.sourceBlock_.workspace, 'extra_semaphore');

    targetBlock.setFieldValue( branch_number, 'branch_number');

    targetBlock.initSvg();
    targetBlock.render();
    parentConnection.connect( targetBlock.outputConnection );   // establish the horizontal link

    if(template) {
        Blockly.PipeConfig.toWorkspace.dictionary(template, targetBlock.getInput('template').connection);
    }

    var semaphore_fan           = dataflow_node['semaphore_fan'];
    var semaflows_connect_here  = targetBlock.getInput('fan').connection;

    for(var i in semaphore_fan) {
        var semaflow_node   = semaphore_fan[i];

        semaflows_connect_here = Blockly.PipeConfig.toWorkspace.dataflow_rule(semaflow_node, semaflows_connect_here );
    }

    Blockly.PipeConfig.toWorkspace.analyses(target_chain, targetBlock.nextConnection);

    return targetBlock.getInput('more dataflows').connection;
};

