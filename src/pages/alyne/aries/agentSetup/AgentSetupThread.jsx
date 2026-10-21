import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Database, PlayCircle, Route } from 'lucide-react';
import { useAries } from '../AriesContext';
import { ariesFocus } from '../ariesUi';
import { cn } from '../../../../utils/cn';
import {
  CANCELLED_MESSAGE,
  DECLINED_MESSAGE,
  MORE_INFO_MESSAGE,
  SUMMARY_INTRO_MESSAGE,
  SETUP_TURNS,
  agentName,
  buildRegistryAgent,
  creationBullets,
  creationTasks,
  optionLabel,
  summarySections,
  visibleTurns,
} from './agentSetupScript';

const TASK_MS = 850;
const SETTLE_MS = 400;
const TASK_ICONS = [Route, Database, PlayCircle];

const primaryButton = cn(
  'inline-flex h-9 items-center justify-center rounded-full bg-[#0067D2] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#004D9E] disabled:opacity-60',
  ariesFocus
);

const secondaryButton = cn(
  'inline-flex h-9 items-center justify-center rounded-full border border-[#e2e8f0] bg-white px-4 text-[13px] font-medium text-[#1e293b] transition-colors hover:bg-[#f8fafc] disabled:opacity-60',
  ariesFocus
);

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useTypedText(text, onDone) {
  const [count, setCount] = useState(() => (reducedMotion() ? text.length : 0));
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (reducedMotion()) {
      setCount(text.length);
      onDoneRef.current?.();
      return undefined;
    }
    setCount(0);
    const timer = window.setInterval(() => {
      setCount((current) => {
        const next = Math.min(text.length, current + 2);
        if (next >= text.length) {
          window.clearInterval(timer);
          window.setTimeout(() => onDoneRef.current?.(), 0);
        }
        return next;
      });
    }, 16);
    return () => window.clearInterval(timer);
  }, [text]);

  return { shown: text.slice(0, count), typing: count < text.length };
}

function TypedPrompt({ message, progress, onDone }) {
  const { shown, typing } = useTypedText(message, onDone);
  return (
    <div>
      <p className="m-0 text-[15px] leading-7 text-[#1e293b]">
        {shown}
        {typing ? <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-[#0f172a]" aria-hidden /> : null}
      </p>
      {progress && !typing ? <p className="m-0 mt-2 text-[12px] text-[#94a3b8]">{progress}</p> : null}
    </div>
  );
}

function AnswerBubble({ children }) {
  return (
    <div className="flex justify-end">
      <p className="m-0 max-w-[80%] whitespace-pre-wrap rounded-2xl bg-[#eef1f5] px-4 py-2.5 text-[15px] leading-6 text-[#0f172a]">
        {children}
      </p>
    </div>
  );
}

function HistoryTurn({ question, answer }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[15px] leading-7 text-[#1e293b]">{question}</p>
      <AnswerBubble>{answer}</AnswerBubble>
    </div>
  );
}

function OptionRow({ index, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 text-left transition-colors hover:border-[#93c5fd] hover:bg-[#e8f2fc]',
        ariesFocus
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded border border-[#e2e8f0] text-[12px] font-semibold text-[#64748b] transition-colors group-hover:border-[#93c5fd] group-hover:text-[#0067D2]">
        {index}
      </span>
      <span className="text-[15px] leading-6 text-[#0f172a]">{label}</span>
    </button>
  );
}

function SummaryReview({ responses, onApprove, onDeny }) {
  const [context, setContext] = useState('');
  return (
    <section
      aria-labelledby="agent-setup-review"
      className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div className="px-4 py-4">
        <h3 id="agent-setup-review" className="m-0 text-[14px] font-semibold text-[#0f172a]">
          Approve agent creation
        </h3>
        <p className="m-0 mt-1 text-[12px] leading-5 text-[#64748b]">
          Review the configuration below and approve to create this agent in your workspace.
        </p>
        <div className="mt-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-3">
          <h4 className="m-0 text-[13px] font-semibold text-[#0f172a]">Agent summary</h4>
          <dl className="m-0 mt-3 flex flex-col gap-4">
            {summarySections(responses).map((section) => (
              <div key={section.label}>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-[#64748b]">{section.label}</dt>
                <dd className="m-0 mt-1 whitespace-pre-wrap text-[14px] leading-6 text-[#0f172a]">{section.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <label className="mt-3 flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[#64748b]">Add context (optional)</span>
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            rows={2}
            placeholder="e.g. Focus on Tier 1 vendors exceeding the risk threshold."
            className="resize-none rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 text-[14px] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0067D2] focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,103,210,0.08)]"
          />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-[#e2e8f0] px-4 py-3">
        <button type="button" onClick={onDeny} className={secondaryButton}>
          Cancel
        </button>
        <button type="button" onClick={onApprove} className={primaryButton}>
          Create agent
        </button>
      </div>
    </section>
  );
}

function CreatingSteps({ responses, onComplete }) {
  const tasks = useMemo(() => creationTasks(responses), [responses]);
  const [active, setActive] = useState(0);
  const done = active >= tasks.length;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (done) {
      const timer = window.setTimeout(() => onCompleteRef.current(), reducedMotion() ? 0 : SETTLE_MS);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setActive((current) => current + 1), reducedMotion() ? 0 : TASK_MS);
    return () => window.clearTimeout(timer);
  }, [active, done]);

  const name = agentName(responses);

  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite">
      <p className="m-0 text-[14px] font-semibold leading-6 text-[#0f172a]">
        {done ? `${name} is ready` : `Creating ${name}`}
      </p>
      <ol className="m-0 flex list-none flex-col p-0">
        {tasks.map((task, index) => {
          if (!done && index > active) return null;
          const complete = done || index < active;
          const Icon = TASK_ICONS[index] ?? Route;
          return (
            <li key={task} className="grid grid-cols-[16px_1fr] gap-3">
              <div className="flex flex-col items-center">
                {complete ? (
                  <span className="mt-3 flex size-4 items-center justify-center rounded-full bg-[#16a34a] text-white">
                    <Check className="size-2.5" strokeWidth={3} aria-hidden />
                  </span>
                ) : (
                  <span className="mt-3 size-4 shrink-0 animate-spin rounded-full border-2 border-[#e2e8f0] border-t-[#0f172a]" />
                )}
                {index < tasks.length - 1 && complete ? (
                  <span className="mt-1 w-px flex-1 bg-[#e2e8f0]" />
                ) : (
                  <span className="flex-1" />
                )}
              </div>
              <div className="mb-2 flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5">
                <Icon className="size-4 shrink-0 text-[#475569]" strokeWidth={1.75} aria-hidden />
                <span className={cn('min-w-0 flex-1 text-[14px]', complete ? 'text-[#475569]' : 'font-medium text-[#0f172a]')}>
                  {task}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CreatedSummary({ responses, onView }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[15px] leading-7 text-[#1e293b]">
        All set — I&apos;ve created <strong className="font-semibold text-[#0f172a]">{agentName(responses)}</strong>.
        Here&apos;s what I configured:
      </p>
      <section className="rounded-xl border border-[#e2e8f0] bg-white p-4">
        <h3 className="m-0 text-[14px] font-semibold text-[#0f172a]">What I set up</h3>
        <ul className="m-0 mt-3 flex flex-col gap-2 pl-4">
          {creationBullets(responses).map((bullet) => (
            <li key={bullet} className="list-disc text-[14px] leading-6 text-[#475569]">
              {bullet}
            </li>
          ))}
        </ul>
      </section>
      <div>
        <button type="button" onClick={onView} className={secondaryButton}>
          View agent details
        </button>
      </div>
    </div>
  );
}

export default function AgentSetupThread({ chat, onComposerChange }) {
  const navigate = useNavigate();
  const { addRegistryAgent, newAgentId, saveSetupResult } = useAries();
  const saved = chat.setupResult;

  const [phase, setPhase] = useState(saved ? saved.outcome : 'thinking');
  const [turnIndex, setTurnIndex] = useState(0);
  const [responses, setResponses] = useState(saved?.responses ?? {});
  const [history, setHistory] = useState(saved?.history ?? []);
  const [supplemental, setSupplemental] = useState(saved?.message ?? null);
  const [revealed, setRevealed] = useState(Boolean(saved));
  const [agentId, setAgentId] = useState(saved?.agentId ?? null);
  const responsesRef = useRef(responses);
  const timers = useRef([]);
  const createdRef = useRef(Boolean(saved));
  const bottomRef = useRef(null);

  const turns = useMemo(() => visibleTurns(responses), [responses]);
  const currentTurn = turns[turnIndex];
  const activeMessage = supplemental ?? currentTurn?.assistantMessage ?? '';

  const later = useCallback((action, ms) => {
    const timer = window.setTimeout(action, reducedMotion() ? 0 : ms);
    timers.current.push(timer);
  }, []);

  useEffect(() => {
    if (saved) return undefined;
    later(() => setPhase('awaiting-input'), SETUP_TURNS[0].thinkingMs);
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, [later, saved]);

  const advance = useCallback(
    (turn, label, value) => {
      const nextResponses = { ...responsesRef.current, [turn.id]: value };
      responsesRef.current = nextResponses;
      setResponses(nextResponses);
      setHistory((current) => [...current, { question: supplemental ?? turn.assistantMessage, answer: label }]);
      setSupplemental(null);
      setRevealed(false);
      setPhase('thinking');

      const nextTurns = visibleTurns(nextResponses);
      const position = nextTurns.findIndex((candidate) => candidate.id === turn.id);
      if (position >= nextTurns.length - 1) {
        later(() => setPhase('summary'), turn.thinkingMs ?? 500);
        return;
      }
      later(() => {
        setTurnIndex(position + 1);
        setPhase('awaiting-input');
      }, turn.thinkingMs ?? 500);
    },
    [later, supplemental]
  );

  const finish = useCallback(
    (outcome, extra = {}) => {
      saveSetupResult(chat.id, {
        outcome,
        responses: responsesRef.current,
        ...extra,
      });
    },
    [chat.id, saveSetupResult]
  );

  const chooseOption = useCallback(
    (value) => {
      if (!currentTurn || phase !== 'awaiting-input' || currentTurn.input !== 'options') return;
      const label = optionLabel(currentTurn, value);
      if (currentTurn.id === 'confirm' && value === 'more') {
        setHistory((current) => [...current, { question: activeMessage, answer: label }]);
        setSupplemental(MORE_INFO_MESSAGE);
        setRevealed(false);
        return;
      }
      if (currentTurn.id === 'confirm' && value === 'no') {
        const nextHistory = [...history, { question: activeMessage, answer: label }];
        setHistory(nextHistory);
        setSupplemental(DECLINED_MESSAGE);
        setPhase('complete');
        finish('complete', { history: nextHistory, message: DECLINED_MESSAGE });
        return;
      }
      advance(currentTurn, label, value);
    },
    [activeMessage, advance, currentTurn, finish, history, phase]
  );

  const submitText = useCallback(
    (text) => {
      if (!currentTurn || phase !== 'awaiting-input' || currentTurn.input !== 'text') return;
      const trimmed = text.trim();
      if (!trimmed) return;
      advance(currentTurn, trimmed, trimmed);
    },
    [advance, currentTurn, phase]
  );

  const cancel = useCallback(() => {
    setSupplemental(CANCELLED_MESSAGE);
    setPhase('complete');
    finish('complete', { history, message: CANCELLED_MESSAGE });
  }, [finish, history]);

  const completeCreation = useCallback(() => {
    if (createdRef.current) return;
    createdRef.current = true;
    const id = newAgentId();
    addRegistryAgent(buildRegistryAgent(id, responsesRef.current));
    setAgentId(id);
    setPhase('created');
    finish('created', { history, agentId: id, agentName: agentName(responsesRef.current) });
  }, [addRegistryAgent, finish, history, newAgentId]);

  useEffect(() => {
    if (phase === 'awaiting-input' && revealed && currentTurn?.input === 'text') {
      onComposerChange({ placeholder: currentTurn.placeholder ?? 'Type your answer…', disabled: false, onSend: submitText });
      return;
    }
    const placeholders = {
      'awaiting-input': 'Select an option above…',
      thinking: 'ARIES is thinking…',
      summary: 'Review the summary above, then approve to create your agent.',
      creating: 'Creating your agent…',
    };
    onComposerChange({ placeholder: placeholders[phase] ?? 'Ask ARIES anything…', disabled: true, onSend: () => {} });
  }, [currentTurn, onComposerChange, phase, revealed, submitText]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [phase, turnIndex, revealed, history.length]);

  const reveal = useCallback(() => setRevealed(true), []);
  const progress = supplemental ? null : `${turnIndex + 1} of ${turns.length}`;

  return (
    <div className="flex flex-col gap-6">
      {history.map((turn, index) => (
        <HistoryTurn key={`${turn.question}-${index}`} question={turn.question} answer={turn.answer} />
      ))}

      {phase === 'thinking' ? <p className="m-0 text-[13px] text-[#94a3b8]">ARIES is thinking…</p> : null}

      {phase === 'awaiting-input' && activeMessage ? (
        <div className="flex flex-col gap-4">
          <TypedPrompt key={`${turnIndex}-${supplemental ?? 'turn'}`} message={activeMessage} progress={progress} onDone={reveal} />
          {revealed && currentTurn?.input === 'options' ? (
            <div className="flex flex-col gap-2">
              {currentTurn.options.map((option, index) => (
                <OptionRow
                  key={option.value}
                  index={index + 1}
                  label={option.label}
                  onClick={() => chooseOption(option.value)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {phase === 'summary' ? (
        <div className="flex flex-col gap-4">
          <TypedPrompt key="summary" message={SUMMARY_INTRO_MESSAGE} onDone={reveal} />
          {revealed ? (
            <SummaryReview responses={responses} onApprove={() => setPhase('creating')} onDeny={cancel} />
          ) : null}
        </div>
      ) : null}

      {phase === 'creating' ? <CreatingSteps responses={responses} onComplete={completeCreation} /> : null}

      {phase === 'created' && agentId ? (
        <CreatedSummary responses={responses} onView={() => navigate(`/aries/agents?agent=${agentId}`)} />
      ) : null}

      {phase === 'complete' && supplemental ? (
        <p className="m-0 text-[15px] leading-7 text-[#1e293b]">{supplemental}</p>
      ) : null}

      <div ref={bottomRef} />
    </div>
  );
}
