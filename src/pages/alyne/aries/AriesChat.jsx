import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, BarChart3, Check, ChevronDown, ChevronUp, ChevronsUpDown, Copy, CornerDownRight, Database, Download, FileText, GitBranch, ListChecks, Maximize2, MoreHorizontal, Plus, Search, Share, Shield, Shuffle, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { publicPath } from '../../../lib/publicPath';
import { selectChevronClass } from '../../../components/ui/selectField';
import { useAries } from './AriesContext';
import AgentSetupThread from './agentSetup/AgentSetupThread';
import { BCP_TABLE_ROWS, exportCsv } from './ariesData';
import { ContextTab, DocumentTab, WidgetTab } from './AriesOutputs';
import { HOME_USE_CASES } from './welcomeCardsConfig';
import { ariesFocus } from './ariesUi';
import { cn } from '../../../utils/cn';

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M8 3L8 12.5M8 3L4.5 6.5M8 3L11.5 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Composer({
  onSend,
  placeholder = 'Ask ARIES anything…',
  headerMessage = 'Want an agent that generates reports for you?',
  showHeader = true,
  showDisclaimer = true,
  disabled = false,
  className,
}) {
  const [value, setValue] = useState('');
  const ref = useRef(null);
  const wasDisabled = useRef(disabled);

  useEffect(() => {
    if (wasDisabled.current && !disabled) ref.current?.focus();
    wasDisabled.current = disabled;
  }, [disabled]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  const canSubmit = !disabled && Boolean(value.trim());

  return (
    <div className={cn('mx-auto w-full max-w-[720px] px-6', className)}>
      <div className="composer-panel w-full">
        {showHeader && headerMessage ? (
          <div className="flex items-center justify-between gap-3 px-3.5 pb-1.5 pt-3">
            <p className="m-0 min-w-0 truncate text-[13px] font-medium tracking-[-0.01em] text-[#475569]">
              {headerMessage}
            </p>
          </div>
        ) : null}
        <div className="p-[2px]">
          <div className="composer-panel-field">
            <textarea
              ref={ref}
              rows={2}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              aria-label="Ask ARIES anything"
              className="max-h-[120px] min-h-[48px] w-full resize-none bg-transparent text-[15px] leading-relaxed text-[#001a35] placeholder:text-[#94a3b8] focus:outline-none disabled:cursor-not-allowed"
            />
            <div className="flex shrink-0 items-center justify-between">
              <button
                type="button"
                aria-label="Add files or skills"
                className={cn(
                  'flex size-8 items-center justify-center rounded-full bg-[#FAFAFA] text-[#64748B] transition-colors hover:bg-[#f1f5f9] hover:text-[#001A35]',
                  ariesFocus
                )}
              >
                <Plus size={16} strokeWidth={1.75} aria-hidden />
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                aria-label="Send"
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full transition-colors',
                  ariesFocus,
                  canSubmit
                    ? 'cursor-pointer bg-[#0067D2] text-white hover:bg-[#005bb8]'
                    : 'cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]'
                )}
              >
                <ArrowUpIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
      {showDisclaimer && (
        <p className="mt-2 text-center text-[11px] text-[#64748b]">
          ARIES can make mistakes. Verify answers against your policies and records.
        </p>
      )}
    </div>
  );
}

const USE_CASE_ICONS = {
  sparkles: Sparkles,
  database: Database,
  chart: BarChart3,
  file: FileText,
  search: Search,
  book: BookOpen,
  shield: Shield,
  list: ListChecks,
};

function shuffleCases(list) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

function HomeSuggestionChips({ onSelect }) {
  const scrollerRef = useRef(null);
  const [cases, setCases] = useState(HOME_USE_CASES);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    const onWheel = (event) => {
      if (scroller.scrollWidth <= scroller.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      scroller.scrollLeft += event.deltaY;
    };
    scroller.addEventListener('wheel', onWheel, { passive: false });
    return () => scroller.removeEventListener('wheel', onWheel);
  }, []);

  function shuffle() {
    setCases((current) => shuffleCases(current));
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }

  return (
    <div className="mt-4 flex w-full items-center gap-1.5" aria-label="Use cases">
      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollerRef}
          className="flex min-w-0 items-center gap-2 overflow-x-auto overflow-y-hidden pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {cases.map((item) => {
            const Icon = USE_CASE_ICONS[item.icon] ?? Sparkles;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.prompt)}
                className={cn(
                  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#e6e6e6] bg-white px-2.5 text-[13px] font-normal text-[#171717] transition-colors hover:bg-[#f6f6f6]',
                  ariesFocus
                )}
              >
                <Icon className="size-3.5 shrink-0 text-[#737373]" strokeWidth={1.75} aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-transparent to-[#f8fafc]"
        />
      </div>
      <button
        type="button"
        onClick={shuffle}
        aria-label="Shuffle ideas"
        className={cn(
          'group relative flex size-8 shrink-0 items-center justify-center rounded-md text-[#a3a3a3] transition-colors hover:bg-[#f1f1f1] hover:text-[#525252]',
          ariesFocus
        )}
      >
        <Shuffle className="size-3.5" strokeWidth={1.75} aria-hidden />
        <span
          role="tooltip"
          aria-hidden
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0f172a] px-2 py-1 text-[12px] font-medium text-white opacity-0 shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Shuffle ideas
        </span>
      </button>
    </div>
  );
}

function NewChatHome() {
  const { createChat } = useAries();
  const navigate = useNavigate();

  function start(prompt, skillId) {
    const id = createChat(prompt, skillId);
    navigate(`/aries/chat/${id}`);
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#f8fafc]">
      <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 pb-16 pt-16">
        <div className="flex w-full max-w-[720px] flex-col items-center">
          <img
            src={publicPath('aries/sparkle-blue.svg')}
            alt=""
            aria-hidden
            width={35}
            height={40}
            className="mb-4"
          />
          <h1 className="mb-8 m-0 text-center font-[Poppins,sans-serif] text-[28px] font-medium leading-tight tracking-[-0.02em] text-[#001a35]">
            How can I help you today?
          </h1>

          <Composer
            onSend={(prompt) => start(prompt)}
            showHeader={false}
            showDisclaimer
            className="px-0"
          />

          <HomeSuggestionChips onSelect={(prompt) => start(prompt)} />
        </div>
      </div>
    </div>
  );
}

const WORK_STEPS = ['Understanding the question', 'Reading company profile'];

function turnsFrom(messages) {
  const turns = [];
  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];
    if (message.role !== 'user') continue;
    const next = messages[index + 1];
    const assistant = next?.role === 'assistant' ? next : null;
    turns.push({ user: message, assistant });
    if (assistant) index += 1;
  }
  return turns;
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-[#001a35]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function AnswerBody({ content, citation }) {
  const blocks = content.trim().split(/\n{2,}/);
  const lastParagraph = blocks.findLastIndex((block) => {
    const lines = block.split('\n').filter(Boolean);
    return !lines.every((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line));
  });
  return (
    <div className="space-y-3 text-[15px] leading-7 text-[#1e293b]">
      {blocks.map((block, index) => {
        const lines = block.split('\n').filter(Boolean);
        const unordered = lines.every((line) => /^[-*]\s+/.test(line));
        const ordered = lines.every((line) => /^\d+\.\s+/.test(line));
        const chip = citation && index === lastParagraph ? citation : null;
        if (unordered) {
          return (
            <ul key={index} className="m-0 list-disc space-y-1 pl-5">
              {lines.map((line) => (
                <li key={line}>{renderInline(line.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }
        if (ordered) {
          return (
            <ol key={index} className="m-0 list-decimal space-y-1 pl-5">
              {lines.map((line) => (
                <li key={line}>{renderInline(line.replace(/^\d+\.\s+/, ''))}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={index} className="m-0">
            {renderInline(lines.join(' '))}
            {chip}
          </p>
        );
      })}
      {citation && lastParagraph === -1 ? <div>{citation}</div> : null}
    </div>
  );
}

function WorkingState({ step }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-2 p-0">
      {WORK_STEPS.map((label, index) => {
        const active = index <= step;
        return (
          <li
            key={label}
            className={cn('text-[14px]', active ? 'text-[#001a35]' : 'text-[#94a3b8]')}
          >
            {label}
            {index === step ? '…' : ''}
          </li>
        );
      })}
    </ol>
  );
}

const SOURCE_MARKS = ['#e11d48', '#111827', '#f59e0b'];

function iconButtonClass(active) {
  return cn(
    'inline-flex size-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#eef2f6] hover:text-[#0f172a]',
    active && 'text-[#0f172a]',
    ariesFocus
  );
}

function AnswerActions({ content, sources, revealOnHover }) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content.replace(/\*\*/g, ''));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        'mt-3 flex items-center gap-0.5',
        revealOnHover &&
          'opacity-0 transition-opacity group-hover/answer:opacity-100 focus-within:opacity-100'
      )}
    >
      <button type="button" onClick={copy} aria-label={copied ? 'Copied' : 'Copy'} className={iconButtonClass(copied)}>
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" strokeWidth={1.75} aria-hidden />}
      </button>
      <button type="button" aria-label="Share" className={iconButtonClass()}>
        <Share className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Good response"
        aria-pressed={vote === 'up'}
        onClick={() => setVote((current) => (current === 'up' ? null : 'up'))}
        className={iconButtonClass(vote === 'up')}
      >
        <ThumbsUp className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Bad response"
        aria-pressed={vote === 'down'}
        onClick={() => setVote((current) => (current === 'down' ? null : 'down'))}
        className={iconButtonClass(vote === 'down')}
      >
        <ThumbsDown className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      <button type="button" aria-label="Rewrite" className={iconButtonClass()}>
        <GitBranch className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
      {sources.length > 0 && (
        <span className="ml-1.5 inline-flex items-center gap-1.5 text-[13px] text-[#334155]">
          <span className="flex">
            {sources.slice(0, 3).map((source, index) => (
              <span
                key={source}
                className="size-4 rounded-full border border-[#f8fafc]"
                style={{ background: SOURCE_MARKS[index % SOURCE_MARKS.length], marginLeft: index === 0 ? 0 : -6 }}
                title={source}
              />
            ))}
          </span>
          {sources.length} {sources.length === 1 ? 'source' : 'sources'}
        </span>
      )}
      <button type="button" aria-label="More" className={cn(iconButtonClass(), 'ml-auto')}>
        <MoreHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}

function AgentSetupConversation({ chat }) {
  const [composer, setComposer] = useState({ placeholder: 'ARIES is thinking…', disabled: true, onSend: () => {} });

  return (
    <div className="flex h-full min-w-0 bg-[#f8fafc]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-16">
          <div className="mx-auto max-w-[720px]">
            <AgentSetupThread chat={chat} onComposerChange={setComposer} />
          </div>
        </div>

        <Composer
          onSend={composer.onSend}
          placeholder={composer.placeholder}
          disabled={composer.disabled}
          showHeader={false}
          showDisclaimer={false}
          className="bg-[#f8fafc] pb-5 pt-2"
        />
      </div>
    </div>
  );
}

function Conversation() {
  const { chatId } = useParams();
  const { getChat, sendMessage, settleMessage } = useAries();
  const chat = getChat(chatId);
  const lastTurnRef = useRef(null);
  const seenTurns = useRef(null);
  const [workStep, setWorkStep] = useState(0);
  const pendingId = chat?.messages.find((message) => message.role === 'assistant' && message.pending)?.id;
  const turnCount = chat?.messages.filter((message) => message.role === 'user').length ?? 0;

  useEffect(() => {
    if (seenTurns.current === null || seenTurns.current === turnCount) {
      seenTurns.current = turnCount;
      return;
    }
    seenTurns.current = turnCount;
    lastTurnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [turnCount]);

  useEffect(() => {
    if (!pendingId) return undefined;
    setWorkStep(0);
    const reading = window.setTimeout(() => setWorkStep(1), 800);
    const done = window.setTimeout(() => settleMessage(chatId, pendingId), 1600);
    return () => {
      window.clearTimeout(reading);
      window.clearTimeout(done);
    };
  }, [chatId, pendingId, settleMessage]);

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f8fafc] text-sm text-[#64748b]">
        Chat not found.
      </div>
    );
  }

  if (chat.kind === 'agent-setup') return <AgentSetupConversation key={chat.id} chat={chat} />;

  const turns = turnsFrom(chat.messages);

  return (
    <div className="flex h-full min-w-0 bg-[#f8fafc]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-16">
          <div className="mx-auto flex max-w-[720px] flex-col gap-12">
            {turns.map((turn, index) => (
              <article
                key={turn.user.id}
                ref={index === turns.length - 1 ? lastTurnRef : null}
                className="group/answer scroll-mt-16"
              >
                <div className="flex justify-end">
                  <p className="m-0 max-w-[80%] whitespace-pre-wrap rounded-2xl bg-[#eef1f5] px-4 py-2.5 text-[15px] leading-6 text-[#0f172a]">
                    {turn.user.content}
                  </p>
                </div>
                <div className="mt-6">
                  {!turn.assistant || turn.assistant.pending ? (
                    <WorkingState step={turn.assistant ? workStep : 0} />
                  ) : (
                    <AnswerDocument
                      message={turn.assistant}
                      latest={index === turns.length - 1}
                      onFollowUp={(prompt) => sendMessage(chat.id, prompt)}
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <Composer
          onSend={(prompt) => sendMessage(chatId, prompt)}
          placeholder="Ask a follow-up"
          showHeader={false}
          showDisclaimer={false}
          className="bg-[#f8fafc] pb-5 pt-2"
        />
      </div>
    </div>
  );
}

const RECOVERY_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'rating', label: 'Rating' },
  { key: 'recovery', label: 'Recovery' },
  { key: 'owner', label: 'Owner' },
];

const RATING_ORDER = { High: 0, Medium: 1, Low: 2 };

const tableField =
  'h-9 rounded-lg border border-[#e2e8f0] bg-white text-[13px] text-[#001a35] outline-none transition-colors focus:border-[#0067D2] focus:ring-[3px] focus:ring-[rgba(0,103,210,0.08)]';

function recoveryHours(value) {
  const match = String(value).match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function compareRecoveryRows(a, b, key) {
  if (key === 'rating') return (RATING_ORDER[a.rating] ?? 9) - (RATING_ORDER[b.rating] ?? 9);
  if (key === 'recovery') return recoveryHours(a.recovery) - recoveryHours(b.recovery);
  return String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true });
}

function recoveryTableText(rows) {
  const header = RECOVERY_COLUMNS.map((column) => column.label).join('\t');
  const body = rows.map((row) => RECOVERY_COLUMNS.map((column) => row[column.key]).join('\t'));
  return [header, ...body].join('\n');
}

function RecoveryCells({ row }) {
  return RECOVERY_COLUMNS.map((column) => {
    const value = row[column.key];
    if (column.key === 'id') {
      return (
        <td key={column.key} className="whitespace-nowrap px-4 py-3 text-[13px] font-medium text-[#0067D2]">
          {value}
        </td>
      );
    }
    if (column.key === 'title') {
      return (
        <td key={column.key} className="px-4 py-3 text-[13px] text-[#001a35]">
          {value}
        </td>
      );
    }
    return (
      <td key={column.key} className="whitespace-nowrap px-4 py-3 text-[13px] text-[#475569]">
        {value}
      </td>
    );
  });
}

function TableIconButton({ label, onClick, disabled, children, buttonRef, tip = 'above' }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'group relative inline-flex size-8 items-center justify-center rounded-md text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#001a35] disabled:pointer-events-none disabled:opacity-40',
        ariesFocus
      )}
    >
      {children}
      <span
        role="tooltip"
        aria-hidden
        className={cn(
          'pointer-events-none absolute right-0 z-20 whitespace-nowrap rounded-md bg-[#0f172a] px-2 py-1 text-[12px] font-medium text-white opacity-0 shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
          tip === 'below' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
        )}
      >
        {label}
      </span>
    </button>
  );
}

function RecoveryTableActions({ rows, expandRef, onExpand, tip }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(recoveryTableText(rows));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <TableIconButton label={copied ? 'Copied' : 'Copy table'} onClick={copy} disabled={!rows.length} tip={tip}>
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" strokeWidth={1.75} aria-hidden />}
      </TableIconButton>
      <TableIconButton label="Download CSV" onClick={() => exportCsv(rows)} disabled={!rows.length} tip={tip}>
        <Download className="size-4" strokeWidth={1.75} aria-hidden />
      </TableIconButton>
      {onExpand && (
        <TableIconButton label="Expand table" onClick={onExpand} buttonRef={expandRef} tip={tip}>
          <Maximize2 className="size-4" strokeWidth={1.75} aria-hidden />
        </TableIconButton>
      )}
    </>
  );
}

function RecoveryTableDialog({ onClose }) {
  const [query, setQuery] = useState('');
  const [rating, setRating] = useState('all');
  const [owner, setOwner] = useState('all');
  const [sort, setSort] = useState(null);
  const searchRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    searchRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const owners = useMemo(
    () => [...new Set(BCP_TABLE_ROWS.map((row) => row.owner))].sort((a, b) => a.localeCompare(b)),
    []
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return BCP_TABLE_ROWS.filter((row) => {
      if (rating !== 'all' && row.rating !== rating) return false;
      if (owner !== 'all' && row.owner !== owner) return false;
      if (!needle) return true;
      return [row.id, row.title, row.owner].some((value) => value.toLowerCase().includes(needle));
    });
  }, [query, rating, owner]);

  const rows = useMemo(() => {
    if (!sort) return filtered;
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => compareRecoveryRows(a, b, sort.key) * direction);
  }, [filtered, sort]);

  const filtersActive = query.trim() !== '' || rating !== 'all' || owner !== 'all';

  function toggleSort(key) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    });
  }

  function clearFilters() {
    setQuery('');
    setRating('all');
    setOwner('all');
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f172a]/40 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recovery-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
      >
        <div className="flex items-center gap-3 border-b border-[#e2e8f0] px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="recovery-dialog-title" className="m-0 text-[16px] font-semibold text-[#001a35]">
              Recovery priorities
            </h2>
            <p className="m-0 mt-0.5 text-[12px] text-[#64748b]" aria-live="polite">
              {rows.length} of {BCP_TABLE_ROWS.length}
            </p>
          </div>
          <div className="relative z-20 flex items-center gap-0.5">
            <RecoveryTableActions rows={rows} tip="below" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-md text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#001a35]',
              ariesFocus
            )}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e8f0] px-5 py-3">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" aria-hidden />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label="Search risks"
              className={cn(tableField, 'w-full pl-9 pr-3')}
            />
          </label>
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            aria-label="Rating"
            className={cn(tableField, 'px-3', selectChevronClass)}
          >
            <option value="all">All ratings</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            aria-label="Owner"
            className={cn(tableField, 'px-3', selectChevronClass)}
          >
            <option value="all">All owners</option>
            {owners.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                'inline-flex h-9 items-center rounded-lg px-2.5 text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#001a35]',
                ariesFocus
              )}
            >
              Clear
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#f1f5f9]">
              <tr>
                {RECOVERY_COLUMNS.map((column) => {
                  const active = sort?.key === column.key;
                  const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={ariaSort}
                      className="whitespace-nowrap px-2 py-1 text-left"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748b] transition-colors hover:bg-[#e2e8f0] hover:text-[#001a35]',
                          ariesFocus
                        )}
                      >
                        {column.label}
                        {active ? (
                          sort.direction === 'asc' ? (
                            <ChevronUp className="size-3.5" aria-hidden />
                          ) : (
                            <ChevronDown className="size-3.5" aria-hidden />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-40" aria-hidden />
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={RECOVERY_COLUMNS.length} className="px-4 py-12 text-center text-[13px] text-[#64748b]">
                    No risks match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-[#e2e8f0] transition-colors hover:bg-[#f8fafc]">
                    <RecoveryCells row={row} />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
}

const OUTPUT_TABS = {
  v1: [
    { id: 'table', label: 'Table' },
    { id: 'context', label: 'Context' },
  ],
  v2: [
    { id: 'widget', label: 'Widget' },
    { id: 'table', label: 'Table' },
    { id: 'document', label: 'Document' },
    { id: 'context', label: 'Context' },
  ],
};

function InlineRecoveryTable() {
  const { version } = useAries();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('table');
  const expandRef = useRef(null);
  const tabs = OUTPUT_TABS[version] || OUTPUT_TABS.v1;
  const activeTab = tabs.some((item) => item.id === tab) ? tab : 'table';

  function close() {
    setOpen(false);
    expandRef.current?.focus();
  }

  return (
    <>
      <div className="mt-5">
        <h3 id="recovery-table-title" className="m-0 text-[14px] font-semibold text-[#001a35]">
          Recovery priorities
        </h3>
        <p className="m-0 mt-0.5 text-[12px] text-[#64748b]">{BCP_TABLE_ROWS.length} open risks</p>
        <div className="mt-3 flex gap-4 border-b border-[#e2e8f0]" role="tablist" aria-label="Output view">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeTab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'relative -mb-px pb-2 text-[13px] font-medium transition-colors',
                ariesFocus,
                activeTab === item.id ? 'text-[#0067D2]' : 'text-[#64748b] hover:text-[#001a35]'
              )}
            >
              {item.label}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-0 -bottom-px h-0.5 rounded-full',
                  activeTab === item.id ? 'bg-[#0067D2]' : 'bg-transparent'
                )}
              />
            </button>
          ))}
        </div>
        {activeTab !== 'table' ? (
          <section className="mt-3 rounded-xl border border-[#e2e8f0] bg-white p-4" aria-labelledby="recovery-table-title">
            {activeTab === 'widget' && <WidgetTab />}
            {activeTab === 'document' && <DocumentTab />}
            {activeTab === 'context' && <ContextTab />}
          </section>
        ) : (
        <section className="relative mt-3 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white" aria-labelledby="recovery-table-title">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left">
              <thead className="bg-[#f1f5f9]">
                <tr>
                  {RECOVERY_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748b]"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BCP_TABLE_ROWS.map((row) => (
                  <tr key={row.id} className="border-t border-[#e2e8f0]">
                    <RecoveryCells row={row} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-0.5 rounded-lg border border-[#e2e8f0] bg-white p-0.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
            <RecoveryTableActions rows={BCP_TABLE_ROWS} expandRef={expandRef} onExpand={() => setOpen(true)} />
          </div>
        </section>
        )}
      </div>
      {open && <RecoveryTableDialog onClose={close} />}
    </>
  );
}

function SourceCitation({ sources }) {
  if (!sources.length) return null;
  const extra = sources.length - 1;
  return (
    <span className="ml-1.5 inline-flex translate-y-[-1px] items-center rounded-md bg-[#f1f5f9] px-1.5 py-0.5 align-middle text-[12px] font-medium leading-4 text-[#64748b]">
      {sources[0]}
      {extra > 0 ? ` +${extra}` : ''}
    </span>
  );
}

function AnswerDocument({ message, latest, onFollowUp }) {
  const sources = message.sources || [];
  const related = message.related || [];
  return (
    <div>
      <AnswerBody content={message.content} citation={<SourceCitation sources={sources} />} />
      {message.outputId === 'out-bcp' && <InlineRecoveryTable />}
      <AnswerActions content={message.content} sources={sources} revealOnHover={!latest} />
      {latest && related.length > 0 && (
        <div className="mt-2 border-t border-[#e6e6e6] pt-2">
          <ul className="m-0 list-none p-0">
            {related.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => onFollowUp(prompt)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] leading-snug text-[#0f172a] transition-colors hover:bg-[#eef2f6]',
                    ariesFocus
                  )}
                >
                  <CornerDownRight className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span>{prompt}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AriesChat() {
  const { chatId } = useParams();
  if (chatId) return <Conversation />;
  return <NewChatHome />;
}
