export interface WorkflowNode {
  id: string
  label: string
  icon: string
  type: 'trigger' | 'action' | 'ai' | 'output'
  x: number
  y: number
}

export interface WorkflowEdge {
  from: string
  to: string
}

export interface Workflow {
  id: string
  titleKey: string
  descriptionKey: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export const WORKFLOWS: Workflow[] = [
  {
    id: 'lead-pipeline',
    titleKey: 'workflows.lead.title',
    descriptionKey: 'workflows.lead.description',
    nodes: [
      { id: 'webhook', label: 'Webhook', icon: '⚡', type: 'trigger', x: 0, y: 50 },
      { id: 'claude', label: 'Claude AI', icon: '🧠', type: 'ai', x: 160, y: 50 },
      { id: 'slack', label: 'Slack', icon: '💬', type: 'output', x: 320, y: 20 },
      { id: 'crm', label: 'CRM', icon: '📊', type: 'output', x: 320, y: 80 },
    ],
    edges: [
      { from: 'webhook', to: 'claude' },
      { from: 'claude', to: 'slack' },
      { from: 'claude', to: 'crm' },
    ],
  },
  {
    id: 'content-gen',
    titleKey: 'workflows.content.title',
    descriptionKey: 'workflows.content.description',
    nodes: [
      { id: 'schedule', label: 'Schedule', icon: '⏰', type: 'trigger', x: 0, y: 50 },
      { id: 'claude', label: 'Claude API', icon: '🧠', type: 'ai', x: 140, y: 50 },
      { id: 'review', label: 'Review', icon: '✅', type: 'action', x: 280, y: 50 },
      { id: 'publish', label: 'Publish', icon: '🚀', type: 'output', x: 420, y: 50 },
    ],
    edges: [
      { from: 'schedule', to: 'claude' },
      { from: 'claude', to: 'review' },
      { from: 'review', to: 'publish' },
    ],
  },
  {
    id: 'ci-cd',
    titleKey: 'workflows.cicd.title',
    descriptionKey: 'workflows.cicd.description',
    nodes: [
      { id: 'github', label: 'GitHub Push', icon: '📦', type: 'trigger', x: 0, y: 50 },
      { id: 'test', label: 'Test', icon: '🧪', type: 'action', x: 130, y: 50 },
      { id: 'build', label: 'Build', icon: '🔨', type: 'action', x: 260, y: 50 },
      { id: 'deploy', label: 'Deploy', icon: '☁️', type: 'output', x: 390, y: 50 },
    ],
    edges: [
      { from: 'github', to: 'test' },
      { from: 'test', to: 'build' },
      { from: 'build', to: 'deploy' },
    ],
  },
]
