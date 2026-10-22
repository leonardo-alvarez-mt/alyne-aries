import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, BarChart3, Check, ChevronDown, ChevronRight, ChevronUp, Copy, CornerDownRight, Database, Download, FileText, GitBranch, ListChecks, MoreHorizontal, Plus, Search, Share, Shield, Shuffle, Sparkles, Table2, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { publicPath } from '../../../lib/publicPath';
import { useAries } from './AriesContext';
import AgentSetupThread from './agentSetup/AgentSetupThread';
import { BCP_TABLE_ROWS, VENDOR_BRIEFING_HTML, exportCsv } from './ariesData';
import { ContextTab, DocumentTab, WidgetTab } from './AriesOutputs';
import { AriesVersionPill } from './AriesVersionPill';
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

const ATTACHMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'xlsx', 'csv', 'md', 'markdown', 'png', 'jpg', 'jpeg', 'gif', 'webp']);
const ATTACHMENT_ACCEPT = '.pdf,.doc,.docx,.xlsx,.csv,.md,.markdown,.png,.jpg,.jpeg,.gif,.webp';
const LONG_PASTE_LENGTH = 2000;

function pastedTextName(files) {
  const used = new Set(files.map((file) => file.name));
  if (!used.has('Pasted text.txt')) return 'Pasted text.txt';
  let index = 2;
  while (used.has(`Pasted text (${index}).txt`)) index += 1;
  return `Pasted text (${index}).txt`;
}

function attachmentExt(name) {
  return name.split('.').pop()?.toLowerCase() || '';
}

function attachmentLabel(name) {
  const ext = attachmentExt(name);
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'IMG';
  if (ext === 'markdown') return 'MD';
  return ext.slice(0, 4).toUpperCase();
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileChip({ file, onRemove }) {
  return (
    <span className="inline-flex max-w-[240px] items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white py-1 pl-1 pr-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#e8f2fc] text-[9px] font-semibold tracking-[0.04em] text-[#0067D2]">
        {attachmentLabel(file.name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12px] font-medium leading-4 text-[#0f172a]">{file.name}</span>
        <span className="block text-[11px] leading-4 text-[#64748b]">{formatFileSize(file.size)}</span>
      </span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className={cn(
            'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#001a35]',
            ariesFocus
          )}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </span>
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
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const ref = useRef(null);
  const fileInputRef = useRef(null);
  const wasDisabled = useRef(disabled);

  useEffect(() => {
    if (wasDisabled.current && !disabled) ref.current?.focus();
    wasDisabled.current = disabled;
  }, [disabled]);

  function addFiles(list) {
    const rejected = [];
    const accepted = [];
    for (const file of list) {
      if (!ATTACHMENT_EXTENSIONS.has(attachmentExt(file.name))) {
        rejected.push(file.name);
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        type: file.type || '',
      });
    }
    if (accepted.length) {
      setFiles((current) => {
        const seen = new Set(current.map((file) => file.id));
        return [...current, ...accepted.filter((file) => !seen.has(file.id))];
      });
    }
    setFileError(rejected.length ? 'Only PDF, Word, Excel, CSV, Markdown, and images can be attached.' : '');
  }

  function addPastedText(text) {
    setFiles((current) => [
      ...current,
      {
        id: `paste-${Date.now()}-${current.length}`,
        name: pastedTextName(current),
        size: new Blob([text]).size,
        type: 'text/plain',
        text,
      },
    ]);
    setFileError('');
  }

  function onPaste(event) {
    if (disabled) return;
    const text = event.clipboardData?.getData('text/plain') ?? '';
    if (text.trim().length < LONG_PASTE_LENGTH) return;
    event.preventDefault();
    addPastedText(text);
  }

  function submit() {
    const trimmed = value.trim();
    if (disabled || (!trimmed && files.length === 0)) return;
    onSend(trimmed, files);
    setValue('');
    setFiles([]);
    setFileError('');
  }

  const canSubmit = !disabled && (Boolean(value.trim()) || files.length > 0);

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
          <div
            className={cn('composer-panel-field', dragOver && 'is-dropping')}
            onDragOver={(event) => {
              if (disabled) return;
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              if (disabled) return;
              event.preventDefault();
              setDragOver(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            {files.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {files.map((file) => (
                  <FileChip key={file.id} file={file} onRemove={() => setFiles((current) => current.filter((item) => item.id !== file.id))} />
                ))}
              </div>
            )}
            <textarea
              ref={ref}
              rows={2}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onPaste={onPaste}
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
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ATTACHMENT_ACCEPT}
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                aria-label="Add files"
                disabled={disabled}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex size-8 items-center justify-center rounded-full bg-[#FAFAFA] text-[#64748B] transition-colors hover:bg-[#f1f5f9] hover:text-[#001A35] disabled:cursor-not-allowed disabled:opacity-40',
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
      {fileError ? <p className="mt-2 text-center text-[12px] text-[#b45309]">{fileError}</p> : null}
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

  function start(prompt, skillId, attachments) {
    const id = createChat(prompt, skillId, attachments);
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
            onSend={(prompt, attachments) => start(prompt, undefined, attachments)}
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
  const outputCardRef = useRef(null);
  const [workStep, setWorkStep] = useState(0);
  const [openOutputMessageId, setOpenOutputMessageId] = useState(null);

  function closeOutput() {
    setOpenOutputMessageId(null);
    outputCardRef.current?.focus();
  }

  useEffect(() => {
    setOpenOutputMessageId(null);
  }, [chatId]);
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
  const openOutput = chat.messages.find((message) => message.id === openOutputMessageId);

  return (
    <div className="flex h-full min-w-0 bg-[#f8fafc]">
      <div className="relative flex min-w-0 flex-1 flex-col">
        {openOutputMessageId && <AriesVersionPill />}
        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-16">
          <div className="mx-auto flex max-w-[720px] flex-col gap-12">
            {turns.map((turn, index) => (
              <article
                key={turn.user.id}
                ref={index === turns.length - 1 ? lastTurnRef : null}
                className="group/answer scroll-mt-16"
              >
                <div className="flex justify-end">
                  <div className="flex max-w-[80%] flex-col items-end gap-2">
                    {turn.user.attachments?.length > 0 && (
                      <div className="flex flex-wrap justify-end gap-2">
                        {turn.user.attachments.map((file) => (
                          <FileChip key={`${file.name}-${file.size}`} file={file} />
                        ))}
                      </div>
                    )}
                    {turn.user.content ? (
                      <p className="m-0 whitespace-pre-wrap rounded-2xl bg-[#eef1f5] px-4 py-2.5 text-[15px] leading-6 text-[#0f172a]">
                        {turn.user.content}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-6">
                  {!turn.assistant || turn.assistant.pending ? (
                    <WorkingState step={turn.assistant ? workStep : 0} />
                  ) : (
                    <AnswerDocument
                      message={turn.assistant}
                      latest={index === turns.length - 1}
                      onFollowUp={(prompt) => sendMessage(chat.id, prompt)}
                      outputOpen={openOutputMessageId === turn.assistant.id}
                      onOpenOutput={() => setOpenOutputMessageId(turn.assistant.id)}
                      outputCardRef={openOutputMessageId === turn.assistant.id ? outputCardRef : undefined}
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <Composer
          onSend={(prompt, attachments) => sendMessage(chatId, prompt, attachments)}
          placeholder="Ask a follow-up"
          showHeader={false}
          showDisclaimer={false}
          className="bg-[#f8fafc] pb-5 pt-2"
        />
      </div>
      {openOutput && <RecoveryOutputPanel outputId={openOutput.outputId} onClose={closeOutput} />}
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

const GRID_COLUMNS = [
  { key: 'title', label: 'Title', width: 'min-w-[280px]' },
  { key: 'rating', label: 'Rating', width: 'min-w-[120px]' },
  { key: 'recovery', label: 'Recovery', width: 'min-w-[130px]' },
  { key: 'owner', label: 'Owner', width: 'min-w-[180px]' },
];

const gridCell = 'border-r border-[#eef2f6] last:border-r-0';

function useRecoveryRows() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? BCP_TABLE_ROWS.filter((row) =>
          RECOVERY_COLUMNS.some((column) => String(row[column.key]).toLowerCase().includes(needle))
        )
      : BCP_TABLE_ROWS;
    if (!sort) return filtered;
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => compareRecoveryRows(a, b, sort.key) * direction);
  }, [query, sort]);

  function toggleSort(key) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    });
  }

  return { rows, query, setQuery, sort, toggleSort };
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

function RecoveryTableActions({ rows, tip }) {
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
    </>
  );
}

function RecoveryTableView({ rows, sort, onSort }) {
  const scrollRef = useRef(null);
  const [moreColumns, setMoreColumns] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const update = () => setMoreColumns(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [rows.length]);

  function showMoreColumns() {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: el.clientWidth * 0.6, behavior: 'smooth' });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} className="h-full overflow-auto border-t border-[#e2e8f0]">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#e2e8f0]">
                <th scope="col" className={cn(gridCell, 'w-10 min-w-10 px-2 py-2.5')}>
                  <span className="sr-only">Row</span>
                </th>
                {GRID_COLUMNS.map((column) => {
                  const active = sort?.key === column.key;
                  const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
                  return (
                    <th key={column.key} scope="col" aria-sort={ariaSort} className={cn(gridCell, column.width, 'p-0')}>
                      <button
                        type="button"
                        onClick={() => onSort(column.key)}
                        className={cn(
                          'flex w-full items-center gap-1 px-3 py-2.5 text-left text-[13px] font-medium text-[#475569] transition-colors hover:bg-[#f8fafc] hover:text-[#001a35]',
                          ariesFocus
                        )}
                      >
                        {column.label}
                        {active &&
                          (sort.direction === 'asc' ? (
                            <ChevronUp className="size-3.5" aria-hidden />
                          ) : (
                            <ChevronDown className="size-3.5" aria-hidden />
                          ))}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={GRID_COLUMNS.length + 1} className="px-4 py-12 text-center text-[13px] text-[#64748b]">
                    No risks match this search.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id} className="border-b border-[#eef2f6] transition-colors hover:bg-[#f8fafc]">
                    <td className={cn(gridCell, 'px-2 py-2 text-center text-[12px] tabular-nums text-[#94a3b8]')}>
                      {index + 1}
                    </td>
                    <td className={cn(gridCell, 'px-3 py-2')}>
                      <span className="flex items-center gap-2.5">
                        <span className="shrink-0 rounded-md bg-[#e8f2fc] px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#0067D2]">
                          {row.id}
                        </span>
                        <span className="truncate text-[13px] text-[#0f172a]">{row.title}</span>
                      </span>
                    </td>
                    <td className={cn(gridCell, 'whitespace-nowrap px-3 py-2 text-[13px] text-[#334155]')}>{row.rating}</td>
                    <td className={cn(gridCell, 'whitespace-nowrap px-3 py-2 text-[13px] text-[#334155]')}>{row.recovery}</td>
                    <td className={cn(gridCell, 'whitespace-nowrap px-3 py-2 text-[13px] text-[#334155]')}>{row.owner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {moreColumns && (
          <button
            type="button"
            onClick={showMoreColumns}
            className={cn(
              'absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-full bg-[#0f172a] py-1.5 pl-3.5 pr-2.5 text-[13px] font-medium text-white shadow-[0_8px_24px_rgba(15,23,42,0.22)] transition-colors hover:bg-[#1e293b]',
              ariesFocus
            )}
          >
            More columns
            <ChevronRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
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

function OutputTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5" role="tablist" aria-label="Output view">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={activeTab === item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            'rounded-md px-1.5 py-1 text-[12.5px] font-medium transition-colors',
            ariesFocus,
            activeTab === item.id
              ? 'bg-[#e8f2fc] text-[#0067D2]'
              : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#001a35]'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function OutputFileCard({ title, subtitle, mark, selected, onOpen, cardRef }) {
  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onOpen}
      aria-expanded={selected}
      aria-controls="recovery-output-panel"
      className={cn(
        'group/card relative mt-5 flex w-full items-center gap-4 overflow-hidden rounded-xl border bg-white px-4 py-3 text-left transition-[border-color,box-shadow] duration-200',
        ariesFocus,
        selected
          ? 'border-[#93c5fd] shadow-[0_0_18px_-6px_rgba(0,103,210,0.28)]'
          : 'border-[#cfe1f7] shadow-[0_0_14px_-8px_rgba(0,103,210,0.16)] hover:border-[#a9cdf5] hover:shadow-[0_0_16px_-6px_rgba(0,103,210,0.22)]'
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,#ffffff_0%,#ffffff_35%,#f2f8ff_100%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,103,210,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(0,103,210,0.07)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(90deg,transparent_15%,rgba(0,0,0,0.5)_55%,#000_100%)]"
      />
      <span
        aria-hidden
        className={cn(
          'aries-glint-border transition-opacity duration-200',
          selected ? 'opacity-100' : 'opacity-80 group-hover/card:opacity-100'
        )}
      />
      <span className="relative min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-[#0f172a]">{title}</span>
        <span className="mt-0.5 block text-[13px] text-[#64748b]">{subtitle}</span>
      </span>
      <span
        aria-hidden
        className="relative flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#d6e6f8] bg-white/80 text-[#0067D2] shadow-[0_4px_12px_-4px_rgba(0,103,210,0.25)] backdrop-blur-[2px]"
      >
        {mark}
      </span>
    </button>
  );
}

function RecoveryFileCard(props) {
  return (
    <OutputFileCard
      {...props}
      title="Recovery priorities"
      subtitle={`${BCP_TABLE_ROWS.length} open risks`}
      mark={<Table2 className="size-5" strokeWidth={1.75} />}
    />
  );
}

function HtmlFileCard(props) {
  return (
    <OutputFileCard
      {...props}
      title="Northwind Cloud briefing"
      subtitle="HTML report"
      mark={<span className="font-mono text-[13px] font-semibold tracking-tight">&lt;/&gt;</span>}
    />
  );
}

const HTML_TABS = [
  { id: 'preview', label: 'Preview' },
  { id: 'code', label: 'Code' },
];

function downloadHtml() {
  const blob = new Blob([VENDOR_BRIEFING_HTML], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'northwind-cloud-briefing.html';
  anchor.click();
  URL.revokeObjectURL(url);
}

function RecoveryOutputPanel({ outputId, onClose }) {
  const { version } = useAries();
  const [tab, setTab] = useState('table');
  const [htmlTab, setHtmlTab] = useState('preview');
  const recovery = useRecoveryRows();
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const tabs = OUTPUT_TABS[version] || OUTPUT_TABS.v1;
  const activeTab = tabs.some((item) => item.id === tab) ? tab : 'table';
  const htmlView = outputId === 'out-vendor-html';

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-full w-[min(720px,52%)] min-w-[440px] shrink-0 py-3 pr-3">
      <section
        id="recovery-output-panel"
        aria-label={htmlView ? 'Northwind Cloud briefing' : 'Recovery priorities'}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
      >
        <div className="flex items-center gap-1.5 py-2.5 pl-3 pr-2">
          {htmlView ? (
            <span className="shrink-0 font-mono text-[12px] font-semibold text-[#475569]" aria-hidden>
              &lt;/&gt;
            </span>
          ) : (
            <Table2 className="size-4 shrink-0 text-[#475569]" strokeWidth={1.75} aria-hidden />
          )}
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <h2 className="m-0 min-w-0 truncate text-[15px] font-semibold text-[#0f172a]">
              {htmlView ? 'Northwind Cloud briefing' : 'Recovery priorities'}
            </h2>
            <span className="shrink-0 text-[13px] text-[#64748b]" aria-live="polite">
              {htmlView
                ? 'HTML report'
                : `${recovery.rows.length} ${recovery.rows.length === 1 ? 'Record' : 'Records'}`}
            </span>
          </div>
          <div className="relative z-20 flex shrink-0 items-center gap-0.5">
            {htmlView ? (
              <TableIconButton label="Download HTML" onClick={downloadHtml} tip="below">
                <Download className="size-4" strokeWidth={1.75} aria-hidden />
              </TableIconButton>
            ) : (
              <RecoveryTableActions rows={recovery.rows} tip="below" />
            )}
            <button
              ref={closeRef}
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
        </div>
        <div className="flex items-center gap-2 px-3 pb-3">
          {htmlView ? (
            <OutputTabs tabs={HTML_TABS} activeTab={htmlTab} onChange={setHtmlTab} />
          ) : (
            <>
          <OutputTabs tabs={tabs} activeTab={activeTab} onChange={setTab} />
          {activeTab === 'table' && (
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" aria-hidden />
              <input
                value={recovery.query}
                onChange={(event) => recovery.setQuery(event.target.value)}
                placeholder="Search table"
                aria-label="Search table"
                className={cn(tableField, 'w-full pl-9 pr-3')}
              />
            </label>
          )}
            </>
          )}
        </div>
        {htmlView ? (
          htmlTab === 'code' ? (
            <pre className="m-0 min-h-0 flex-1 overflow-auto border-t border-[#e2e8f0] bg-[#0f172a] p-4 font-mono text-[12px] leading-5 text-[#e2e8f0]">
              {VENDOR_BRIEFING_HTML}
            </pre>
          ) : (
            <iframe
              title="Northwind Cloud briefing"
              sandbox=""
              srcDoc={VENDOR_BRIEFING_HTML}
              className="min-h-0 w-full flex-1 border-0 border-t border-[#e2e8f0] bg-white"
            />
          )
        ) : activeTab === 'table' ? (
          <RecoveryTableView rows={recovery.rows} sort={recovery.sort} onSort={recovery.toggleSort} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#e2e8f0] p-5">
            {activeTab === 'widget' && <WidgetTab />}
            {activeTab === 'document' && <DocumentTab />}
            {activeTab === 'context' && <ContextTab />}
          </div>
        )}
      </section>
    </div>
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

function AnswerDocument({ message, latest, onFollowUp, outputOpen = false, onOpenOutput, outputCardRef }) {
  const sources = message.sources || [];
  const related = message.related || [];
  return (
    <div>
      <AnswerBody content={message.content} citation={<SourceCitation sources={sources} />} />
      {message.outputId === 'out-bcp' && (
        <RecoveryFileCard selected={outputOpen} onOpen={onOpenOutput} cardRef={outputCardRef} />
      )}
      {message.outputId === 'out-vendor-html' && (
        <HtmlFileCard selected={outputOpen} onOpen={onOpenOutput} cardRef={outputCardRef} />
      )}
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
