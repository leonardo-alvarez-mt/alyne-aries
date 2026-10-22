import { useState } from 'react';
import { ArrowLeft, GitBranch, Plus, ShieldCheck, StopCircle, Trash2, X } from 'lucide-react';
import { selectChevronClass } from '../../../../components/ui/selectField';
import { cn } from '../../../../utils/cn';
import { focusRing } from './agentRegistryUi';

const OUTCOME = {
  ran: { label: 'Ran', className: 'bg-[#ecfdf3] text-[#067647]' },
  ended: { label: 'Ended', className: 'bg-[#e8f2fc] text-[#0067D2]' },
  skipped: { label: 'Skipped', className: 'bg-[#f1f5f9] text-[#64748b]' },
};

const KICKER = {
  trigger: 'Trigger',
  prompt: 'Prompt',
  decision: 'Decision',
};

const CAPABILITY_AGENTS = ['Vendor Survey Agent', 'Risk Mitigation Agent'];

let promptSerial = 0;

function cloneGraph(graph) {
  return structuredClone(graph);
}

function uniqueTitle(graph, base) {
  const titles = new Set(Object.values(graph.nodes).map((node) => node.title));
  if (!titles.has(base)) return base;
  let count = 2;
  while (titles.has(`${base} ${count}`)) count += 1;
  return `${base} ${count}`;
}

function insertPrompt(graph, branchIndex, index) {
  promptSerial += 1;
  const id = `prompt-new-${promptSerial}`;
  const node = {
    id,
    type: 'prompt',
    title: uniqueTitle(graph, 'New prompt'),
    agent: CAPABILITY_AGENTS[0],
    prompt: '',
    bindings: [],
    outputs: ['Result'],
  };
  const branch = graph.branches[branchIndex];
  const nodes = [...branch.nodes];
  nodes.splice(index, 0, id);
  return {
    id,
    graph: {
      ...graph,
      branches: graph.branches.map((item, itemIndex) =>
        itemIndex === branchIndex
          ? { ...item, stopWorkflow: false, stopReason: '', nodes }
          : item
      ),
      nodes: { ...graph.nodes, [id]: node },
    },
  };
}

function removePrompt(graph, nodeId) {
  const node = graph.nodes[nodeId];
  const branchIndex = graph.branches.findIndex((branch) => branch.nodes.includes(nodeId));
  if (!node || node.type !== 'prompt' || branchIndex < 0) return graph;
  const remaining = graph.branches[branchIndex].nodes.filter((id) => id !== nodeId);
  const nodes = {};
  for (const [id, item] of Object.entries(graph.nodes)) {
    if (id === nodeId) continue;
    nodes[id] = item.bindings
      ? { ...item, bindings: item.bindings.filter((binding) => binding.source !== node.title) }
      : item;
  }
  return {
    ...graph,
    branches: graph.branches.map((item, itemIndex) =>
      itemIndex === branchIndex
        ? {
            ...item,
            nodes: remaining,
            ...(remaining.length === 0
              ? { stopWorkflow: true, stopReason: 'No continuation step is configured.' }
              : {}),
          }
        : item
    ),
    nodes,
  };
}

function pathIds(graph, nodeId) {
  const trunkIndex = graph.trunk.indexOf(nodeId);
  if (trunkIndex >= 0) return graph.trunk.slice(0, trunkIndex);
  for (const branch of graph.branches) {
    const index = branch.nodes.indexOf(nodeId);
    if (index >= 0) return [...graph.trunk, ...branch.nodes.slice(0, index)];
  }
  return [];
}

function fieldsFrom(node) {
  if (!node) return [];
  if (node.produces) return node.produces.map((field) => ({ field, source: node.title }));
  if (node.outputs) return node.outputs.map((field) => ({ field, source: node.title }));
  if (node.type === 'decision') return [{ field: node.title, source: node.title }];
  return [];
}

function upstreamFields(graph, nodeId) {
  return pathIds(graph, nodeId).flatMap((id) => fieldsFrom(graph.nodes[id]));
}

function unboundFields(graph, node) {
  const bound = new Set((node.bindings || []).map((binding) => `${binding.source}::${binding.field}`));
  return upstreamFields(graph, node.id).filter((field) => !bound.has(`${field.source}::${field.field}`));
}

function branchOf(graph, nodeId) {
  return graph.branches.find((branch) => branch.nodes.includes(nodeId)) ?? null;
}

function routeSummary(graph, branch) {
  if (branch.stopWorkflow) return `Stops: ${branch.stopReason || 'No reason provided'}`;
  const prompts = branch.nodes.map((id) => graph.nodes[id]).filter((node) => node?.type === 'prompt');
  if (prompts.length === 0) return 'Continues; add the next step';
  return `Triggers ${prompts.map((node) => node.title).join(', then ')}`;
}

function removeBranchNodes(graph, branch) {
  const removed = new Set(branch.nodes);
  const removedTitles = new Set(branch.nodes.map((id) => graph.nodes[id]?.title).filter(Boolean));
  const nodes = {};
  for (const [id, node] of Object.entries(graph.nodes)) {
    if (removed.has(id)) continue;
    nodes[id] = node.bindings
      ? { ...node, bindings: node.bindings.filter((binding) => !removedTitles.has(binding.source)) }
      : node;
  }
  return nodes;
}

function responseBranches(responseType) {
  const labels = responseType === 'yes-no' ? ['Yes', 'No'] : ['Option 1', 'Option 2'];
  return labels.map((label, index) => ({
    id: `${responseType}-${index + 1}`,
    label,
    stopWorkflow: true,
    stopReason: 'No continuation step is configured.',
    nodes: [],
  }));
}

export default function WorkflowDesigner({ agent, onBack }) {
  const original = agent.graph;
  const [draft, setDraft] = useState(() => cloneGraph(original));
  const [mode, setMode] = useState('flow');
  const [selectedId, setSelectedId] = useState('decision');
  const [insertAt, setInsertAt] = useState(null);
  const shown = mode === 'run' ? original : draft;
  const activeId = shown.nodes[selectedId] ? selectedId : 'decision';
  const selected = { ...shown.nodes[activeId], id: activeId };
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  const editable = mode === 'flow';

  const reset = () => {
    setDraft(cloneGraph(original));
    setSelectedId('decision');
    setInsertAt(null);
  };

  const addPrompt = (branchIndex, index) => {
    const result = insertPrompt(draft, branchIndex, index);
    setDraft(result.graph);
    setSelectedId(result.id);
    setInsertAt(null);
  };

  const dropPrompt = (nodeId) => {
    setDraft((current) => removePrompt(current, nodeId));
    if (selectedId === nodeId) setSelectedId('decision');
  };

  const patchPrompt = (nodeId, patch) => {
    setDraft((current) => {
      const previous = current.nodes[nodeId];
      const next = { ...previous, ...patch };
      const nodes = { ...current.nodes, [nodeId]: next };
      if (patch.title && patch.title !== previous.title) {
        for (const [id, item] of Object.entries(nodes)) {
          if (!item.bindings) continue;
          nodes[id] = {
            ...item,
            bindings: item.bindings.map((binding) =>
              binding.source === previous.title ? { ...binding, source: patch.title } : binding
            ),
          };
        }
      }
      return { ...current, nodes };
    });
  };

  const addBinding = (nodeId, binding) => {
    setDraft((current) => {
      const node = current.nodes[nodeId];
      return {
        ...current,
        nodes: {
          ...current.nodes,
          [nodeId]: { ...node, bindings: [...node.bindings, binding] },
        },
      };
    });
  };

  const dropBinding = (nodeId, binding) => {
    setDraft((current) => {
      const node = current.nodes[nodeId];
      return {
        ...current,
        nodes: {
          ...current.nodes,
          [nodeId]: {
            ...node,
            bindings: node.bindings.filter((item) => item.field !== binding.field || item.source !== binding.source),
          },
        },
      };
    });
  };

  const patchDecision = (patch) => {
    setDraft((current) => ({
      ...current,
      nodes: {
        ...current.nodes,
        decision: { ...current.nodes.decision, ...patch },
      },
    }));
  };

  const patchBranch = (branchId, patch) => {
    setDraft((current) => {
      const branch = current.branches.find((item) => item.id === branchId);
      if (!branch) return current;
      const stopping = patch.stopWorkflow === true && !branch.stopWorkflow;
      return {
        ...current,
        nodes: stopping ? removeBranchNodes(current, branch) : current.nodes,
        branches: current.branches.map((item) =>
          item.id === branchId
            ? {
                ...item,
                ...patch,
                ...(stopping ? { nodes: [] } : {}),
              }
            : item
        ),
      };
    });
  };

  const changeResponseType = (responseType) => {
    if (responseType === draft.nodes.decision.responseType) return;
    if (!window.confirm('Changing the response type replaces the current answers and their route steps.')) return;
    setDraft((current) => {
      let nodes = current.nodes;
      for (const branch of current.branches) nodes = removeBranchNodes({ ...current, nodes }, branch);
      return {
        ...current,
        nodes: {
          ...nodes,
          decision: { ...nodes.decision, responseType },
        },
        branches: responseBranches(responseType),
      };
    });
    setInsertAt(null);
  };

  const addOption = () => {
    setDraft((current) => {
      if (current.branches.length >= 4) return current;
      const number = current.branches.length + 1;
      return {
        ...current,
        branches: [
          ...current.branches,
          {
            id: `option-${Date.now().toString(36)}-${number}`,
            label: `Option ${number}`,
            stopWorkflow: true,
            stopReason: 'No continuation step is configured.',
            nodes: [],
          },
        ],
      };
    });
  };

  const removeOption = (branchId) => {
    setDraft((current) => {
      if (current.branches.length <= 2) return current;
      const branch = current.branches.find((item) => item.id === branchId);
      if (!branch) return current;
      return {
        ...current,
        nodes: removeBranchNodes(current, branch),
        branches: current.branches.filter((item) => item.id !== branchId),
      };
    });
    setInsertAt(null);
  };

  return (
    <div className="flex h-full flex-col bg-[#f8fafc] px-8 pb-6 pt-16">
      <header className="flex shrink-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[#475569] hover:text-[#001a35]',
              focusRing
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Workflow agents
          </button>
          <h1 className="m-0 mt-2 text-2xl font-semibold leading-8 tracking-tight text-[#212121]">{agent.name}</h1>
          <p className="mt-1 text-sm text-cool-grey-700">
            {agent.cadence} · {agent.owner}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty ? (
            <button
              type="button"
              onClick={reset}
              className={cn('h-8 rounded-full px-3 text-sm font-medium text-[#475569] hover:bg-white', focusRing)}
            >
              Reset
            </button>
          ) : null}
          <div className="flex rounded-full border border-[#e2e8f0] bg-white p-0.5" role="tablist" aria-label="Designer view">
            {[
              { id: 'flow', label: 'Flow' },
              { id: 'run', label: 'Last run' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mode === tab.id}
                onClick={() => {
                  setMode(tab.id);
                  setInsertAt(null);
                  const next = tab.id === 'run' ? original : draft;
                  if (!next.nodes[selectedId]) setSelectedId('decision');
                }}
                className={cn(
                  'h-8 rounded-full px-3 text-sm font-medium',
                  focusRing,
                  mode === tab.id ? 'bg-[#f1f5f9] text-[#0f172a]' : 'text-[#64748b] hover:text-[#0f172a]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-4 flex min-h-0 flex-1 gap-4">
        <div className="min-w-0 flex-1 overflow-auto rounded-2xl border border-[#e2e8f0] bg-[radial-gradient(#d5dee8_1px,transparent_1px)] bg-[size:18px_18px] bg-white">
          <div
            className="mx-auto flex w-full flex-col items-center px-6 py-8"
            style={{ minWidth: Math.max(660, shown.branches.length * 210), maxWidth: Math.max(760, shown.branches.length * 230) }}
          >
            {shown.trunk.map((id, index) => (
              <div key={id} className="flex flex-col items-center">
                {index > 0 ? <Stem /> : null}
                <FlowCard
                  node={shown.nodes[id]}
                  selected={id === selected.id}
                  showOutcome={mode === 'run'}
                  onSelect={() => setSelectedId(id)}
                />
              </div>
            ))}
            <Fork labels={shown.branches.map((branch) => branch.label)} />
            <div
              className="grid w-full items-start gap-4"
              style={{ gridTemplateColumns: `repeat(${shown.branches.length}, minmax(180px, 1fr))` }}
            >
              {shown.branches.map((branch, branchIndex) => {
                return (
                  <div key={branch.id} className="flex flex-col items-center">
                    {branch.stopWorkflow ? (
                      <StopTerminal reason={branch.stopReason} />
                    ) : null}
                    {branch.nodes.map((id, index) => (
                      <div key={id} className="flex w-full flex-col items-center">
                        {editable ? (
                          <InsertControl
                            open={insertAt?.branchIndex === branchIndex && insertAt.index === index}
                            label={`Add a prompt step on ${branch.label}`}
                            onOpen={() =>
                              setInsertAt((current) =>
                                current?.branchIndex === branchIndex && current.index === index ? null : { branchIndex, index }
                              )
                            }
                            onInsert={() => addPrompt(branchIndex, index)}
                          />
                        ) : index > 0 ? (
                          <Stem />
                        ) : null}
                        <FlowCard
                          node={shown.nodes[id]}
                          selected={id === selected.id}
                          showOutcome={mode === 'run'}
                          onSelect={() => setSelectedId(id)}
                          onRemove={
                            editable && shown.nodes[id].type === 'prompt' ? () => dropPrompt(id) : null
                          }
                          className="w-full"
                        />
                      </div>
                    ))}
                    {editable && !branch.stopWorkflow ? (
                      <InsertControl
                        open={insertAt?.branchIndex === branchIndex && insertAt.index === branch.nodes.length}
                        label={`Add a prompt step on ${branch.label}`}
                        onOpen={() =>
                          setInsertAt((current) =>
                            current?.branchIndex === branchIndex && current.index === branch.nodes.length
                              ? null
                              : { branchIndex, index: branch.nodes.length }
                          )
                        }
                        onInsert={() => addPrompt(branchIndex, branch.nodes.length)}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside
          className="aries-side-panel flex w-[360px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white"
          aria-label={mode === 'run' ? 'Last run' : selected.title}
        >
          {mode === 'run' ? (
            <AuditList agent={agent} selectedId={selected.id} onSelect={setSelectedId} />
          ) : (
            <StepConfig
              node={selected}
              graph={draft}
              onPatch={(patch) => patchPrompt(selected.id, patch)}
              onPatchDecision={patchDecision}
              onChangeResponseType={changeResponseType}
              onPatchBranch={patchBranch}
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onAddBinding={(binding) => addBinding(selected.id, binding)}
              onRemoveBinding={(binding) => dropBinding(selected.id, binding)}
              onRemove={branchOf(draft, selected.id) && selected.type === 'prompt' ? () => dropPrompt(selected.id) : null}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function Stem() {
  return <span className="h-7 w-px bg-[#cbd5e1]" aria-hidden="true" />;
}

function InsertControl({ open, label, onOpen, onInsert }) {
  return (
    <span className="relative flex h-8 w-full items-center justify-center">
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#cbd5e1]" aria-hidden="true" />
      <button
        type="button"
        aria-expanded={open}
        aria-label={label}
        onClick={onOpen}
        className={cn(
          'relative z-10 flex size-5 items-center justify-center rounded-full border border-[#cbd5e1] bg-white text-[#475569] hover:border-[#93c5fd] hover:text-[#0067D2]',
          focusRing
        )}
      >
        <Plus className="size-3" aria-hidden="true" />
      </button>
      {open ? (
        <span className="absolute top-7 z-20 rounded-lg border border-[#e2e8f0] bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <button
            type="button"
            onClick={onInsert}
            className={cn(
              'whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-[#0f172a] hover:bg-[#f8fafc]',
              focusRing
            )}
          >
            Prompt step
          </button>
        </span>
      ) : null}
    </span>
  );
}

function Fork({ labels }) {
  const columns = labels.map((_, index) => `${((index + 0.5) / labels.length) * 100}%`);
  const first = columns[0];
  const last = columns[columns.length - 1];
  return (
    <div className="relative h-16 w-full">
      <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-[#cbd5e1]" aria-hidden="true" />
      <span
        className="absolute top-4 h-px bg-[#cbd5e1]"
        style={{ left: first, width: `calc(${last} - ${first})` }}
        aria-hidden="true"
      />
      {columns.map((left, index) => (
        <span key={left}>
          <span className="absolute top-4 h-5 w-px -translate-x-1/2 bg-[#cbd5e1]" style={{ left }} aria-hidden="true" />
          <span
            className="absolute top-6 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]"
            style={{ left }}
          >
            {labels[index]}
          </span>
        </span>
      ))}
    </div>
  );
}

function StopTerminal({ reason }) {
  return (
    <div className="mt-2 w-full rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
        <StopCircle className="size-3.5" aria-hidden="true" />
        Stops here
      </span>
      <span className="mt-1 block text-xs leading-5 text-[#475569]">
        {reason || 'Add a stop reason in the decision configuration.'}
      </span>
    </div>
  );
}

function FlowCard({ node, selected, showOutcome, onSelect, onRemove, className }) {
  return (
    <div
      className={cn(
        'flex w-[240px] items-start gap-1 rounded-xl border bg-white px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        selected ? 'border-[#93c5fd] shadow-[0_0_0_3px_rgba(0,103,210,0.12)]' : 'border-[#e2e8f0]',
        className
      )}
    >
      <button type="button" onClick={onSelect} aria-pressed={selected} className={cn('min-w-0 flex-1 text-left', focusRing)}>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
          {node.type === 'decision' ? <GitBranch className="size-3.5 text-[#0067D2]" aria-hidden="true" /> : null}
          {KICKER[node.type]}
        </span>
        <span className="mt-1 block text-sm font-medium text-[#0f172a]">{node.title}</span>
        {node.agent ? <span className="mt-0.5 block text-xs text-[#64748b]">{node.agent}</span> : null}
        {node.gate ? (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#0067D2]">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Approval
          </span>
        ) : null}
        {showOutcome && node.run ? (
          <span className="mt-2 block">
            <Outcome outcome={node.run.outcome} />
          </span>
        ) : null}
      </button>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${node.title}`}
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]',
            focusRing
          )}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function Outcome({ outcome }) {
  const meta = OUTCOME[outcome];
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold', meta.className)}>
      {meta.label}
    </span>
  );
}

function StepConfig({
  node,
  graph,
  onPatch,
  onPatchDecision,
  onChangeResponseType,
  onPatchBranch,
  onAddOption,
  onRemoveOption,
  onAddBinding,
  onRemoveBinding,
  onRemove,
}) {
  const available = node.type === 'prompt' ? unboundFields(graph, node) : [];
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">{KICKER[node.type]}</p>
      {node.type === 'prompt' ? (
        <input
          value={node.title}
          aria-label="Step name"
          onChange={(event) => onPatch({ title: event.target.value })}
          className={cn('mt-1 w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-base font-semibold text-[#0f172a]', focusRing)}
        />
      ) : (
        <h2 className="m-0 mt-1 text-base font-semibold text-[#0f172a]">{node.title}</h2>
      )}
      {node.detail ? <p className="mt-2 text-sm leading-6 text-[#475569]">{node.detail}</p> : null}
      {node.type === 'decision' ? (
        <>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-[#64748b]">Question</span>
            <textarea
              value={node.question}
              aria-label="Decision question"
              rows={2}
              onChange={(event) => onPatchDecision({ question: event.target.value })}
              className={cn(
                'mt-1 w-full resize-none rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm leading-5 text-[#0f172a]',
                focusRing
              )}
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-[#64748b]">Answer type</span>
            <select
              value={node.responseType}
              aria-label="Answer type"
              onChange={(event) => onChangeResponseType(event.target.value)}
              className={cn(
                'mt-1 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-2 text-sm text-[#0f172a]',
                selectChevronClass,
                focusRing
              )}
            >
              <option value="options">List of options</option>
              <option value="yes-no">Yes / No</option>
            </select>
            <span className="mt-1.5 block text-xs leading-5 text-[#64748b]">
              Changing this replaces the current answers and route steps.
            </span>
          </label>
        </>
      ) : null}
      {node.type === 'prompt' ? (
        <label className="mt-4 block">
          <span className="text-xs font-medium text-[#64748b]">Capability agent</span>
          <select
            value={node.agent}
            onChange={(event) => onPatch({ agent: event.target.value })}
            className={cn('mt-1 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-2 text-sm text-[#0f172a]', selectChevronClass, focusRing)}
          >
            {CAPABILITY_AGENTS.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {node.gate ? (
        <p className="mt-3 rounded-lg bg-[#e8f2fc] px-3 py-2 text-sm text-[#0f172a]">A person approves this step.</p>
      ) : null}
      {node.type === 'prompt' ? (
        <label className="mt-4 block">
          <span className="text-xs font-medium text-[#64748b]">Prompt</span>
          <textarea
            value={node.prompt}
            aria-label="Prompt"
            rows={4}
            placeholder="What should this step do?"
            onChange={(event) => onPatch({ prompt: event.target.value })}
            className={cn(
              'mt-1 w-full resize-none rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm leading-6 text-[#0f172a]',
              focusRing
            )}
          />
        </label>
      ) : null}
      {node.bindings ? (
        <Bindings
          bindings={node.bindings}
          withheld={available}
          onAdd={onAddBinding}
          onRemove={onRemoveBinding}
        />
      ) : null}
      {node.outputs ? <Field label="Output" value={node.outputs.join(', ')} /> : null}
      {node.produces ? <Field label="Fields produced" value={node.produces.join(', ')} /> : null}
      {node.type === 'decision' ? (
        <DecisionOptions
          graph={graph}
          node={node}
          onPatchBranch={onPatchBranch}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
        />
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className={cn('mt-5 text-sm font-medium text-[#b42318] hover:underline', focusRing)}
        >
          Remove from this route
        </button>
      ) : null}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-[#64748b]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[#0f172a]">{value}</p>
    </div>
  );
}

function Bindings({ bindings, withheld, onAdd, onRemove }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-[#64748b]">Receives</p>
      {bindings.length === 0 ? <p className="mt-2 text-sm text-[#64748b]">No fields are passed in.</p> : null}
      <ul className="mt-2 flex flex-col gap-2">
        {bindings.map((binding) => (
          <li
            key={`${binding.source}::${binding.field}`}
            className="flex items-start gap-2 rounded-lg border border-[#e2e8f0] px-3 py-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-[#0f172a]">{binding.field}</span>
              <span className="mt-0.5 block text-xs text-[#64748b]">From {binding.source}</span>
            </span>
            <button
              type="button"
              onClick={() => onRemove(binding)}
              aria-label={`Remove ${binding.field}`}
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]',
                focusRing
              )}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {withheld.length > 0 ? (
        <label className="mt-3 block">
          <span className="text-xs font-medium text-[#64748b]">Add field</span>
          <select
            value=""
            aria-label="Add field"
            onChange={(event) => {
              const [source, field] = event.target.value.split('::');
              if (field) onAdd({ field, source });
            }}
            className={cn('mt-1 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-2 text-sm text-[#0f172a]', selectChevronClass, focusRing)}
          >
            <option value="">Choose a field</option>
            {withheld.map((field) => (
              <option key={`${field.source}::${field.field}`} value={`${field.source}::${field.field}`}>
                {field.field} from {field.source}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {withheld.length > 0 ? (
        <p className="mt-2 text-xs leading-5 text-[#64748b]">Not passed: {withheld.map((field) => field.field).join(', ')}.</p>
      ) : null}
    </div>
  );
}

function DecisionOptions({ graph, node, onPatchBranch, onAddOption, onRemoveOption }) {
  const editableOptions = node.responseType === 'options';
  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-[#64748b]">Last decision</p>
      <p className="mt-1 text-sm text-[#0f172a]">
        {node.sample.choice}
        <span className="text-[#64748b]"> · confidence {node.sample.confidence}</span>
      </p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[#64748b]">Answers and routes</p>
        {editableOptions && graph.branches.length < 4 ? (
          <button
            type="button"
            onClick={onAddOption}
            className={cn('rounded text-xs font-medium text-[#0067D2] hover:underline', focusRing)}
          >
            Add option
          </button>
        ) : null}
      </div>
      <ul className="mt-2 flex flex-col gap-3">
        {graph.branches.map((branch) => (
          <li key={branch.id} className="rounded-xl border border-[#e2e8f0] p-3">
            <div className="flex items-center gap-2">
              <input
                value={branch.label}
                aria-label="Answer"
                disabled={!editableOptions}
                onChange={(event) => onPatchBranch(branch.id, { label: event.target.value })}
                className={cn(
                  'h-8 min-w-0 flex-1 rounded-md border border-[#e2e8f0] px-2 text-sm font-medium text-[#0f172a] disabled:border-transparent disabled:bg-transparent disabled:px-0',
                  focusRing
                )}
              />
              {editableOptions && graph.branches.length > 2 ? (
                <button
                  type="button"
                  onClick={() => onRemoveOption(branch.id)}
                  aria-label={`Remove ${branch.label}`}
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#b42318]',
                    focusRing
                  )}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <select
              value={branch.stopWorkflow ? 'stop' : 'continue'}
              aria-label={`${branch.label} behavior`}
              onChange={(event) =>
                onPatchBranch(branch.id, {
                  stopWorkflow: event.target.value === 'stop',
                  ...(event.target.value === 'stop' && !branch.stopReason
                    ? { stopReason: 'No continuation step is configured.' }
                    : {}),
                })
              }
              className={cn(
                'mt-2 h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-2 text-sm text-[#0f172a]',
                selectChevronClass,
                focusRing
              )}
            >
              <option value="continue">Continue workflow</option>
              <option value="stop">Stop workflow here</option>
            </select>
            {branch.stopWorkflow ? (
              <label className="mt-2 block">
                <span className="text-xs font-medium text-[#64748b]">Stop reason</span>
                <textarea
                  value={branch.stopReason || ''}
                  required
                  aria-label={`${branch.label} stop reason`}
                  rows={2}
                  onChange={(event) => onPatchBranch(branch.id, { stopReason: event.target.value })}
                  className={cn(
                    'mt-1 w-full resize-none rounded-lg border border-[#e2e8f0] px-2.5 py-2 text-xs leading-5 text-[#0f172a]',
                    !branch.stopReason && 'border-[#fda29b]',
                    focusRing
                  )}
                />
              </label>
            ) : (
              <span className="mt-2 block text-xs leading-5 text-[#475569]">{routeSummary(graph, branch)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuditList({ agent, selectedId, onSelect }) {
  const { graph } = agent;
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="border-b border-[#e2e8f0] px-5 py-4">
        <h2 className="m-0 text-base font-semibold text-[#0f172a]">Last run</h2>
        <p className="mt-1 text-sm leading-6 text-[#475569]">
          {agent.lastRun}. {agent.lastRunNote}
        </p>
      </div>
      <ol className="flex flex-col py-2">
        {graph.audit.map((id) => {
          const node = graph.nodes[id];
          const selected = id === selectedId;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-pressed={selected}
                className={cn(
                  'flex w-full flex-col items-start gap-1 px-5 py-3 text-left',
                  focusRing,
                  selected ? 'bg-[#e8f2fc]' : 'hover:bg-[#f8fafc]'
                )}
              >
                <span className="flex items-center gap-2">
                  <Outcome outcome={node.run.outcome} />
                  <span className="text-sm font-medium text-[#0f172a]">{node.title}</span>
                </span>
                <span className="text-xs leading-5 text-[#64748b]">{node.run.detail}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
