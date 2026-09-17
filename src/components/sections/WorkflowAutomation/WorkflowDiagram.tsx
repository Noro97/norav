import { useEffect, useState } from 'react'
import gsap from 'gsap'
import {
  Zap, Brain, MessageSquare, BarChart3, Clock,
  CheckCircle, Rocket, GitBranch, FlaskConical, Hammer, Cloud,
} from 'lucide-react'
import type { Workflow, WorkflowNode } from './workflow.data'

const WORKFLOW_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  zap: Zap, brain: Brain, messageSquare: MessageSquare, barChart3: BarChart3,
  clock: Clock, checkCircle: CheckCircle, rocket: Rocket, gitBranch: GitBranch,
  flaskConical: FlaskConical, hammer: Hammer, cloud: Cloud,
}

interface WorkflowDiagramProps {
  workflow: Workflow
  animate: boolean
}

const NODE_STYLES: Record<WorkflowNode['type'], { border: string; glow: string }> = {
  trigger: { border: 'border-secondary-500/40', glow: 'shadow-[0_0_12px_color-mix(in_srgb,_var(--color-secondary-500)_30%,_transparent)]' },
  action: { border: 'border-primary-500/40', glow: 'shadow-[0_0_12px_color-mix(in_srgb,_var(--color-primary-500)_30%,_transparent)]' },
  ai: { border: 'border-secondary-500/50', glow: 'shadow-[0_0_12px_color-mix(in_srgb,_var(--color-secondary-500)_40%,_transparent)]' },
  output: { border: 'border-tertiary-ink/40', glow: 'shadow-[0_0_12px_color-mix(in_srgb,_var(--color-tertiary-ink)_20%,_transparent)]' },
}

const NODE_INACTIVE = 'border-tertiary-ink/[0.06]'

export function WorkflowDiagram({ workflow, animate }: WorkflowDiagramProps) {
  const [activeNode, setActiveNode] = useState<number>(-1)

  useEffect(() => {
    if (!animate) return

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })

    workflow.nodes.forEach((_, i) => {
      tl.call(() => setActiveNode(i), [], i * 0.6)
    })

    tl.call(() => setActiveNode(-1), [], workflow.nodes.length * 0.6 + 1)

    return () => {
      tl.kill()
      setActiveNode(-1)
    }
  }, [animate, workflow.nodes])

  const hasBranching = new Set(workflow.nodes.map((n) => n.y)).size > 1

  if (hasBranching) {
    return <BranchingLayout workflow={workflow} activeNode={activeNode} />
  }

  return <LinearLayout workflow={workflow} activeNode={activeNode} />
}

function NodeBox({ node, isActive }: { node: WorkflowNode; isActive: boolean }) {
  const styles = NODE_STYLES[node.type]
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-tertiary-ink/[0.02] transition-all duration-300 ${
        isActive ? `${styles.border} ${styles.glow}` : NODE_INACTIVE
      }`}
    >
      {(() => {
        const Icon = WORKFLOW_ICONS[node.icon]
        return Icon ? <Icon size={18} className="shrink-0" /> : null
      })()}
      <span
        className={`font-mono text-body-small transition-colors duration-300 ${
          isActive ? 'text-tertiary-ink/90' : 'text-tertiary-ink/40'
        }`}
      >
        {node.label}
      </span>
    </div>
  )
}

function VerticalArrow({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center shrink-0 py-0.5">
      <div
        className={`w-px h-4 transition-colors duration-500 ${
          active ? 'bg-secondary-500/60' : 'bg-tertiary-ink/10'
        }`}
      />
      <div
        className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] transition-colors duration-500 ${
          active ? 'border-t-violet-500/60' : 'border-t-white/10'
        }`}
      />
    </div>
  )
}

function LinearLayout({ workflow, activeNode }: { workflow: Workflow; activeNode: number }) {
  return (
    <div className="flex flex-col items-stretch gap-0">
      {workflow.nodes.map((node, i) => {
        const isActive = i <= activeNode
        return (
          <div key={node.id} className="flex flex-col items-stretch">
            <NodeBox node={node} isActive={isActive} />
            {i < workflow.nodes.length - 1 && (
              <VerticalArrow active={activeNode > i} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function BranchingLayout({ workflow, activeNode }: { workflow: Workflow; activeNode: number }) {
  const outgoing = new Map<string, string[]>()
  workflow.edges.forEach((e) => {
    const arr = outgoing.get(e.from) || []
    arr.push(e.to)
    outgoing.set(e.from, arr)
  })

  const branchSource = workflow.nodes.find((n) => (outgoing.get(n.id)?.length ?? 0) > 1)
  const branchTargetIds = branchSource ? outgoing.get(branchSource.id) ?? [] : []
  const branchTargets = branchTargetIds.map((id) => workflow.nodes.find((n) => n.id === id)!).filter(Boolean)

  const before = branchSource
    ? workflow.nodes.filter((n) => n.x < branchSource.x && !branchTargetIds.includes(n.id))
    : []

  return (
    <div className="flex flex-col items-stretch gap-0">
      {/* Pre-branch nodes */}
      {before.map((node, i) => {
        const idx = workflow.nodes.indexOf(node)
        const isActive = idx <= activeNode
        return (
          <div key={node.id} className="flex flex-col items-stretch">
            <NodeBox node={node} isActive={isActive} />
            <VerticalArrow active={activeNode > i} />
          </div>
        )
      })}

      {/* Branch source */}
      {branchSource && (
        <div className="flex flex-col items-stretch">
          <NodeBox node={branchSource} isActive={workflow.nodes.indexOf(branchSource) <= activeNode} />
          <VerticalArrow active={activeNode > workflow.nodes.indexOf(branchSource)} />
        </div>
      )}

      {/* Branch targets side-by-side */}
      {branchTargets.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {branchTargets.map((node) => {
            const idx = workflow.nodes.indexOf(node)
            const isActive = idx <= activeNode
            return <NodeBox key={node.id} node={node} isActive={isActive} />
          })}
        </div>
      )}
    </div>
  )
}
