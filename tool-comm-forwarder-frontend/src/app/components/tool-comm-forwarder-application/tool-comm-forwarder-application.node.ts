import { ApplicationNode } from '@universal-robots/contribution-api';

export interface ToolCommForwarderApplicationNode extends ApplicationNode {
  type: string;
  version: string;
}
