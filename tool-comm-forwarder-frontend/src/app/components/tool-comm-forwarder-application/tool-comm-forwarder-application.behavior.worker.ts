/// <reference lib="webworker" />
import {
    ApplicationBehaviors,
    ApplicationNode, OptionalPromise,
    registerApplicationBehavior,
    ScriptBuilder
} from '@universal-robots/contribution-api';
import { ToolCommForwarderApplicationNode } from './tool-comm-forwarder-application.node';

// factory is required
const createApplicationNode = (): OptionalPromise<ToolCommForwarderApplicationNode> => ({
    type: 'universal-robots-tool-comm-forwarder-tool-comm-forwarder-application',    // type is required
    version: '1.0.0'     // version is required
});

// generatePreamble is optional
const generatePreambleScriptCode = (node: ToolCommForwarderApplicationNode): OptionalPromise<ScriptBuilder> => {
    const builder = new ScriptBuilder();
    return builder;
};

// upgradeNode is optional
const upgradeApplicationNode
  = (loadedNode: ApplicationNode, defaultNode: ToolCommForwarderApplicationNode): ToolCommForwarderApplicationNode =>
      defaultNode;

// downgradeNode is optional
const downgradeApplicationNode
  = (loadedNode: ApplicationNode, defaultNode: ToolCommForwarderApplicationNode): ToolCommForwarderApplicationNode =>
      defaultNode;

const behaviors: ApplicationBehaviors = {
    factory: createApplicationNode,
    generatePreamble: generatePreambleScriptCode,
    upgradeNode: upgradeApplicationNode,
    downgradeNode: downgradeApplicationNode
};

registerApplicationBehavior(behaviors);
