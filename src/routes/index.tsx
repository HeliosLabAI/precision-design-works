import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookIcon,
  BugSlashIcon,
  ChevronDownIcon,
  DiamondIcon,
  ExpandIcon,
  FolderIcon,
  HardDriveIcon,
  ImageIcon,
  InfinityIcon,
  ListIcon,
  MicIcon,
  PanelRightIcon,
  PlusIcon,
  QuestionIcon,
  SearchIcon,
  SidebarIcon,
  SparkleIcon,
  StackIcon,
} from "../components/density/icons";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Density — A calm coding agent" },
      {
        name: "description",
        content:
          "Density is a calm, focused coding agent for plan, build, and ship — designed with Apple-grade restraint.",
      },
      { property: "og:title", content: "Density — A calm coding agent" },
      {
        property: "og:description",
        content: "Density is a calm, focused coding agent for plan, build, and ship.",
      },
    ],
  }),
  component: Density,
});

type Mode = "Auto" | "Plan" | "Ask" | "Build";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  slash?: string;
  status?: string;
};

const FOOTER_HINTS = [
  { cmd: "/multitask", text: "to run subagents in parallel instead of queuing them" },
  { cmd: "/create-hook", text: "to control and extend the agent loop with custom scripts" },
  { cmd: "/simplify", text: "to have Density review all changed files for code quality" },
  { cmd: "/review", text: "to have Density find bugs, regressions, and missing tests" },
  { cmd: "@file", text: "to add precise context from anywhere in your workspace" },
];

const ASSISTANT_REPLIES = [
  "Hi — how can I help you today? I can assist with coding, debugging, exploring your project, or anything else you're working on in this workspace.",
  "On it. I'll plan the smallest set of changes first, then implement them in order.",
  "Got it. Let me look through the relevant files and come back with a focused diff.",
  "Understood. I'll keep the scope tight and explain each step as I go.",
];

function Density() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("Auto");
  const [text, setText] = useState("");
  const [hintIdx, setHintIdx] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setInterval(() => setHintIdx((i) => (i + 1) % FOOTER_HINTS.length), 4200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (meta && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setAddMenuOpen(false);
        setModeOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [text]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    let slash: string | undefined;
    let body = trimmed;
    const m = trimmed.match(/^(\/[a-zA-Z][\w-]*)\s*(.*)$/);
    if (m) {
      slash = m[1];
      body = m[2];
    }
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: body,
      slash,
    };
    const replyIdx = messages.filter((mm) => mm.role === "user").length;
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setThinking(true);
    setTimeout(() => {
      const reply =
        ASSISTANT_REPLIES[Math.min(replyIdx, ASSISTANT_REPLIES.length - 1)];
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply,
        status: slash ? "Planning next moves" : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setThinking(false);
    }, 650);
  };

  const hasConversation = messages.length > 0;

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background text-foreground select-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, oklch(0.5 0.08 250) 0, transparent 40%), radial-gradient(circle at 80% 80%, oklch(0.5 0.08 30) 0, transparent 45%)",
        }}
      />

      <aside
        className={`relative z-20 h-full shrink-0 border-r border-border bg-surface transition-[width] duration-300 ease-out ${
          sidebarOpen ? "w-[232px]" : "w-0"
        }`}
      >
        {sidebarOpen && <SidebarPanel onClose={() => setSidebarOpen(false)} />}
      </aside>

      <main className="relative z-10 flex h-full min-w-0 flex-1 flex-col">
        <Toolbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onOpenPalette={() => setPaletteOpen(true)}
          hasConversation={hasConversation}
          title={messages[0]?.text}
        />

        {hasConversation ? (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
              <div className="mx-auto w-full max-w-[760px] space-y-4">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <UserBubble key={m.id} text={m.text} slash={m.slash} />
                  ) : (
                    <AssistantBubble key={m.id} text={m.text} status={m.status} />
                  ),
                )}
                {thinking && <ThinkingIndicator />}
              </div>
            </div>
            <div className="shrink-0 px-6 pb-3">
              <div className="mx-auto w-full max-w-[760px]">
                <Composer
                  variant="followup"
                  text={text}
                  setText={setText}
                  mode={mode}
                  inputRef={inputRef}
                  onSend={handleSend}
                  onOpenAdd={() => setAddMenuOpen((v) => !v)}
                  addMenuOpen={addMenuOpen}
                  onPickMode={(m) => {
                    setMode(m);
                    setModeOpen(false);
                  }}
                  modeOpen={modeOpen}
                  onToggleMode={() => setModeOpen((v) => !v)}
                />
              </div>
            </div>
            <StatusBar />
          </>
        ) : (
          <>
            <div className="relative flex flex-1 flex-col items-center justify-center px-6">
              <Composer
                variant="hero"
                text={text}
                setText={setText}
                mode={mode}
                inputRef={inputRef}
                onSend={handleSend}
                onOpenAdd={() => setAddMenuOpen((v) => !v)}
                addMenuOpen={addMenuOpen}
                onPickMode={(m) => {
                  setMode(m);
                  setModeOpen(false);
                }}
                modeOpen={modeOpen}
                onToggleMode={() => setModeOpen((v) => !v)}
              />
              <PlanPill />
            </div>
            <FooterHint hint={FOOTER_HINTS[hintIdx]} />
          </>
        )}
      </main>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}

/* ───────────────────────── Chat bubbles ───────────────────────── */

function UserBubble({ text, slash }: { text: string; slash?: string }) {
  return (
    <div className="animate-fade-in rounded-2xl border border-border bg-card px-5 py-3.5 text-[14px] leading-relaxed text-foreground shadow-soft">
      {slash && (
        <span className="mr-1.5 font-mono text-[13px] text-[oklch(0.65_0.15_55)]">
          {slash}
        </span>
      )}
      <span>{text}</span>
    </div>
  );
}

function AssistantBubble({ text, status }: { text: string; status?: string }) {
  return (
    <div className="animate-fade-in px-2 py-1 text-[14px] leading-relaxed text-foreground/85">
      {text}
      {status && (
        <div className="mt-2 text-[12.5px] text-muted-foreground">{status}</div>
      )}
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-[12.5px] text-muted-foreground animate-fade-in">
      <span className="inline-flex gap-1">
        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:120ms]" />
        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:240ms]" />
      </span>
      Thinking
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-7 shrink-0 items-center justify-between border-t border-border/60 px-3 text-[11.5px] text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <HardDriveIcon size={11} />
        <span>Local</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ContextRing />
        <span>8%</span>
      </div>
    </div>
  );
}

function ContextRing() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" opacity="0.3" />
      <path d="M12 3 a9 9 0 0 1 2.5 17.6" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────────────────── Toolbar ───────────────────────── */

function Toolbar({
  sidebarOpen,
  onToggleSidebar,
  onOpenPalette,
  hasConversation,
  title,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenPalette: () => void;
  hasConversation: boolean;
  title?: string;
}) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 px-2.5">
      <div className="flex items-center gap-0.5">
        <IconBtn label="Toggle sidebar" onClick={onToggleSidebar} active={sidebarOpen}>
          <SidebarIcon size={16} />
          {!sidebarOpen && !hasConversation && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-accent-blue px-1 text-[9px] font-medium text-white shadow-sm">
              1
            </span>
          )}
        </IconBtn>
        <IconBtn label="Search ⌘K" onClick={onOpenPalette}>
          <SearchIcon size={16} />
        </IconBtn>
        <IconBtn label="New chat">
          <PlusIcon size={16} />
        </IconBtn>
        {hasConversation && title && (
          <div className="ml-1 flex items-center gap-1.5 px-1.5 text-[12.5px] text-foreground/80">
            <span className="max-w-[180px] truncate">{title}</span>
            <PrinterTinyIcon />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <span>Editor Window</span>
        <ArrowUpRightIcon size={12} />
      </div>

      <div className="flex items-center gap-0.5">
        <IconBtn label="Expand">
          <ExpandIcon size={15} />
        </IconBtn>
        <IconBtn label="Right panel">
          <PanelRightIcon size={16} />
        </IconBtn>
      </div>
    </div>
  );
}

function PrinterTinyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="9" width="12" height="8" rx="1.5" />
      <path d="M8 9V5h8v4M8 17v2h8v-2" />
    </svg>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`relative flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 transition-all duration-150 hover:bg-accent hover:text-foreground active:scale-[0.96] ${
        active ? "bg-accent text-foreground" : ""
      }`}
    >
      {children}
    </button>
  );
}

/* ───────────────────────── Sidebar ───────────────────────── */

function SidebarPanel({ onClose }: { onClose: () => void }) {
  const workspaces = [
    { label: "New folder (2)", icon: <FolderIcon size={14} />, active: true },
    { label: "Navigation to ceres folder", dot: "muted" as const },
    { label: "(1) Chat", dot: "muted" as const },
    { label: "cd ceres folder", dot: "accent" as const },
  ];
  const homes = [
    { label: "Home", items: ["hi"] },
    { label: "Home", items: ["hi"] },
  ];

  return (
    <div className="flex h-full flex-col animate-fade-in">
      {/* top bar */}
      <div className="flex items-center justify-between px-2.5 py-2">
        <div className="flex items-center gap-0.5">
          <IconBtn label="Close sidebar" onClick={onClose} active>
            <SidebarIcon size={16} />
          </IconBtn>
          <IconBtn label="Search">
            <SearchIcon size={16} />
          </IconBtn>
        </div>
        <div className="flex items-center gap-0.5 text-foreground/40">
          <IconBtn label="Back">
            <ArrowLeftIcon size={14} />
          </IconBtn>
          <IconBtn label="Forward">
            <ArrowRightIcon size={14} />
          </IconBtn>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 text-[13px]">
        <NavRow icon={<FunnelIcon />} label="New Agent" shortcut="⌘N" active />
        <NavRow icon={<AutomationsIcon />} label="Automations" />
        <NavRow icon={<CustomizeIcon />} label="Customize" />

        <div className="mt-4 flex items-center justify-between px-2 pb-1 text-[11.5px] uppercase tracking-wider text-muted-foreground/80">
          <span>Workspaces</span>
          <div className="flex items-center gap-0.5 text-muted-foreground/60">
            <button className="rounded p-1 hover:bg-accent">
              <ListIcon size={12} />
            </button>
            <button className="rounded p-1 hover:bg-accent">
              <PlusIcon size={12} />
            </button>
          </div>
        </div>

        {workspaces.map((w, i) => (
          <WorkspaceRow key={i} {...w} />
        ))}

        {homes.map((h, i) => (
          <div key={i} className="mt-3">
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-foreground/85">
              <HomeIcon />
              <span>{h.label}</span>
            </div>
            {h.items.map((it) => (
              <div
                key={it}
                className="ml-6 flex items-center gap-2 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground"
              >
                <span className="size-[5px] rounded-full bg-muted-foreground/50" />
                {it}
              </div>
            ))}
          </div>
        ))}

        <div className="mt-3 flex items-center gap-2 rounded-md px-2 py-2 text-[13px] text-muted-foreground hover:bg-accent">
          <OpenWorkspaceIcon />
          <span>Open Workspace</span>
        </div>
      </div>

      {/* upgrade */}
      <div className="border-t border-border px-2 py-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] text-foreground/85 shadow-soft transition hover:bg-accent">
          <DiamondIcon size={13} />
          Upgrade to a Pro account
        </button>
        <div className="mt-2 flex items-center gap-2 px-1.5 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.55_0.18_250)] to-[oklch(0.7_0.16_200)] text-[11px] font-medium text-white">
            S
          </div>
          <div className="flex-1 leading-tight">
            <div className="text-[12.5px] text-foreground">Sameer</div>
            <div className="text-[10.5px] text-muted-foreground">Free Plan</div>
          </div>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent">
            <ListIcon size={12} />
          </button>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent">
            <SettingsIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavRow({
  icon,
  label,
  shortcut,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
}) {
  return (
    <button
      className={`group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
        active ? "bg-accent text-foreground" : "text-foreground/85 hover:bg-accent"
      }`}
    >
      <span className={active ? "text-accent-blue" : "text-foreground/70"}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {shortcut && (
        <span className="text-[10.5px] text-muted-foreground">{shortcut}</span>
      )}
    </button>
  );
}

function WorkspaceRow({
  label,
  icon,
  active,
  dot,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  dot?: "muted" | "accent";
}) {
  return (
    <button
      className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {icon ? (
        <span className={active ? "text-accent-blue" : "text-foreground/60"}>{icon}</span>
      ) : (
        <span
          className={`ml-1 size-[6px] rounded-full ${
            dot === "accent" ? "bg-accent-blue" : "bg-muted-foreground/50"
          }`}
        />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}

const FunnelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 5h17l-6.5 8v5l-4 2v-7L3.5 5z" />
  </svg>
);
const AutomationsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <path d="M8 9h8M8 13h5" />
  </svg>
);
const CustomizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 7h9M5 12h6M5 17h12" />
    <circle cx="17" cy="7" r="1.8" />
    <circle cx="14" cy="12" r="1.8" />
    <circle cx="20" cy="17" r="1.8" />
  </svg>
);
const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11 12 4l8 7" />
    <path d="M5.5 10v9h13v-9" />
  </svg>
);
const OpenWorkspaceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7A2 2 0 0 1 20.5 9.5V17a2 2 0 0 1-2 2H5.5A2 2 0 0 1 3.5 17V7.5z" />
    <path d="M10 14l2 2 4-4" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2.6" />
    <path d="M19.5 12a7.5 7.5 0 0 0-.13-1.4l2.1-1.5-2-3.5-2.5.9a7.5 7.5 0 0 0-2.4-1.4L14 2.5h-4l-.6 2.6a7.5 7.5 0 0 0-2.4 1.4l-2.5-.9-2 3.5 2.1 1.5A7.5 7.5 0 0 0 4.5 12c0 .47.05.93.13 1.4l-2.1 1.5 2 3.5 2.5-.9a7.5 7.5 0 0 0 2.4 1.4l.57 2.6h4l.6-2.6a7.5 7.5 0 0 0 2.4-1.4l2.5.9 2-3.5-2.1-1.5c.08-.47.13-.93.13-1.4z" />
  </svg>
);

/* ───────────────────────── Composer ───────────────────────── */

function Composer({
  variant = "hero",
  text,
  setText,
  mode,
  inputRef,
  onSend,
  onOpenAdd,
  addMenuOpen,
  onPickMode,
  modeOpen,
  onToggleMode,
}: {
  variant?: "hero" | "followup";
  text: string;
  setText: (v: string) => void;
  mode: Mode;
  inputRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  onSend: () => void;
  onOpenAdd: () => void;
  addMenuOpen: boolean;
  onPickMode: (m: Mode) => void;
  modeOpen: boolean;
  onToggleMode: () => void;
}) {
  const isFollowup = variant === "followup";

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`animate-fade-in ${isFollowup ? "w-full" : "w-full max-w-[640px]"}`}>
      {!isFollowup && (
        <div className="mb-3 flex items-center gap-3 px-1 text-[12.5px]">
          <button className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-accent-blue transition hover:bg-accent">
            <span className="font-medium">New folder (2)</span>
            <ChevronDownIcon size={12} />
          </button>
          <button className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-foreground/75 transition hover:bg-accent">
            <HardDriveIcon size={13} />
            <span>Local</span>
            <ChevronDownIcon size={12} />
          </button>
        </div>
      )}

      <div
        className={`group relative border border-border bg-card shadow-soft transition-shadow focus-within:shadow-pop focus-within:border-border-strong ${
          isFollowup ? "flex items-center gap-1 rounded-full px-2 py-1" : "rounded-2xl"
        }`}
      >
        {isFollowup && (
          <button
            onClick={onOpenAdd}
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-foreground/60 transition hover:bg-accent active:scale-95 ${
              addMenuOpen ? "rotate-45 bg-accent" : ""
            }`}
            aria-label="Add context"
          >
            <PlusIcon size={14} />
          </button>
        )}

        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isFollowup ? "Send follow-up" : "Plan, Build, / for skills, @ for context"}
          className={
            isFollowup
              ? "block max-h-40 flex-1 resize-none bg-transparent px-1 py-1.5 text-[13.5px] leading-relaxed text-foreground placeholder:text-hint focus:outline-none"
              : "block max-h-60 w-full resize-none rounded-2xl bg-transparent px-5 pb-2 pt-4 text-[14px] leading-relaxed text-foreground placeholder:text-hint focus:outline-none"
          }
        />

        {isFollowup ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={onToggleMode}
              className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[12px] text-foreground/70 transition hover:bg-accent"
            >
              <span>{mode}</span>
              <ChevronDownIcon size={11} />
            </button>
            <button
              className="flex size-7 items-center justify-center rounded-full text-foreground/60 transition hover:bg-accent active:scale-95"
              aria-label="Voice"
            >
              <MicIcon size={13} />
            </button>
            <button
              onClick={onSend}
              className="flex size-7 items-center justify-center rounded-full bg-foreground text-background transition active:scale-95"
              aria-label={text.length > 0 ? "Send" : "Stop"}
            >
              {text.length > 0 ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              ) : (
                <span className="size-2.5 rounded-[2px] bg-background" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 pb-2.5 pt-1">
            <button
              onClick={onOpenAdd}
              className={`flex size-7 items-center justify-center rounded-full border border-border bg-secondary text-foreground/70 transition hover:bg-accent active:scale-95 ${
                addMenuOpen ? "rotate-45 bg-accent" : ""
              }`}
              aria-label="Add context"
            >
              <PlusIcon size={14} />
            </button>
            <button
              onClick={onToggleMode}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-foreground/80 transition hover:bg-accent"
            >
              <span>{mode}</span>
              <ChevronDownIcon size={12} />
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              {text.length > 0 ? (
                <button
                  onClick={onSend}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-[12.5px] font-medium text-background shadow-soft transition-transform active:scale-95"
                  aria-label="Send"
                >
                  Send
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 6 19 12 13 18" />
                  </svg>
                </button>
              ) : (
                <button
                  className="mic-pulse flex size-8 items-center justify-center rounded-full bg-foreground text-background transition active:scale-95"
                  aria-label="Voice"
                >
                  <MicIcon size={14} />
                </button>
              )}
            </div>
          </div>
        )}


        {/* Add context dropdown */}
        {addMenuOpen && <AddContextMenu />}
        {modeOpen && (
          <ModeMenu current={mode} onPick={onPickMode} />
        )}
      </div>
    </div>
  );
}

function AddContextMenu() {
  const items: Array<{ icon: React.ReactNode; label: string; arrow?: boolean }> = [
    { icon: <ListIcon size={14} />, label: "Plan" },
    { icon: <BugSlashIcon size={14} />, label: "Debug" },
    { icon: <InfinityIcon size={14} />, label: "Multitask" },
    { icon: <QuestionIcon size={14} />, label: "Ask" },
    { icon: <ImageIcon size={14} />, label: "Image" },
    { icon: <StackIcon size={14} />, label: "Models", arrow: true },
    { icon: <BookIcon size={14} />, label: "Skills", arrow: true },
    { icon: <DiamondIcon size={14} />, label: "MCP Servers", arrow: true },
  ];
  return (
    <div className="absolute bottom-[calc(100%+6px)] left-2 z-30 w-[240px] origin-bottom-left rounded-xl border border-border bg-popover p-1.5 shadow-pop animate-scale-in">
      <input
        autoFocus
        placeholder="Add agents, context, tools…"
        className="mb-1 w-full rounded-md bg-transparent px-2 py-1.5 text-[12.5px] placeholder:text-hint focus:outline-none"
      />
      <div className="h-px bg-border" />
      <div className="pt-1">
        {items.slice(0, 4).map((it) => (
          <MenuRow key={it.label} {...it} />
        ))}
        <div className="my-1 h-px bg-border" />
        {items.slice(4).map((it) => (
          <MenuRow key={it.label} {...it} />
        ))}
      </div>
    </div>
  );
}

function ModeMenu({ current, onPick }: { current: Mode; onPick: (m: Mode) => void }) {
  const items: Mode[] = ["Auto", "Plan", "Build", "Ask"];
  return (
    <div className="absolute bottom-[calc(100%+6px)] left-12 z-30 w-[160px] rounded-xl border border-border bg-popover p-1 shadow-pop animate-scale-in">
      {items.map((m) => (
        <button
          key={m}
          onClick={() => onPick(m)}
          className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition ${
            current === m ? "bg-accent text-foreground" : "text-foreground/80 hover:bg-accent"
          }`}
        >
          {m}
          {current === m && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="5 12 10 17 19 7" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

function MenuRow({ icon, label, arrow }: { icon: React.ReactNode; label: string; arrow?: boolean }) {
  return (
    <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12.5px] text-foreground/85 transition hover:bg-accent">
      <span className="text-foreground/65">{icon}</span>
      <span className="flex-1">{label}</span>
      {arrow && <ChevronDownIcon size={11} className="-rotate-90 text-muted-foreground" />}
    </button>
  );
}

function PlanPill() {
  return (
    <button className="mt-3.5 flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-foreground/80 shadow-soft transition hover:bg-accent">
      <SparkleIcon size={12} />
      <span>Plan New Idea</span>
      <span className="flex items-center gap-1 text-muted-foreground">
        <Kbd>⇥</Kbd>
        <span>Tab</span>
      </span>
    </button>
  );
}

/* ───────────────────────── Footer hint ───────────────────────── */

function FooterHint({ hint }: { hint: { cmd: string; text: string } }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-center px-6 text-[12px] text-muted-foreground">
      <span key={hint.cmd} className="animate-fade-in">
        Use{" "}
        <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11.5px] text-foreground/85">
          {hint.cmd}
        </span>{" "}
        {hint.text}
      </span>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-border bg-surface px-1 font-mono text-[10.5px] text-muted-foreground">
      {children}
    </span>
  );
}

/* ───────────────────────── Command Palette ───────────────────────── */

function CommandPalette({ onClose }: { onClose: () => void }) {
  const agents = [
    { icon: <FunnelIcon />, label: "New Agent" },
    { icon: <MicIcon size={14} />, label: "Use Voice" },
    { icon: <MicIcon size={14} />, label: "Dictate", kbd: "⌃ ⇧ ." },
    { icon: <PinIcon />, label: "Pin / Unpin Agent" },
    { icon: <SplitHIcon />, label: "Split Tile Horizontally" },
    { icon: <SplitVIcon />, label: "Split Tile Vertically" },
    { icon: <XIcon />, label: "Remove from Tileset" },
    { icon: <ArrowLeftIcon size={14} />, label: "Go Back", kbd: "⌥ ←" },
    { icon: <ArrowRightIcon size={14} />, label: "Go Forward", kbd: "⌥ →" },
  ];
  const modes = [
    { icon: <ListIcon size={14} />, label: "Plan Mode" },
    { icon: <QuestionIcon size={14} />, label: "Ask Mode" },
    { icon: <FlaskIconSmall />, label: "Build Mode" },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/10 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-[18vh] w-[min(640px,92vw)] overflow-hidden rounded-2xl border border-border bg-popover shadow-pop animate-scale-in"
      >
        <div className="border-b border-border px-4 py-3">
          <input
            autoFocus
            placeholder="Search files, actions, agents…"
            className="w-full bg-transparent text-[14px] placeholder:text-hint focus:outline-none"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-1.5">
          <Section title="Agent">
            {agents.map((a, i) => (
              <PaletteRow key={i} {...a} highlighted={i === 0} />
            ))}
          </Section>
          <div className="my-1 h-px bg-border" />
          <Section title="Mode">
            {modes.map((m, i) => (
              <PaletteRow key={i} {...m} />
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-muted-foreground/80">
        {title}
      </div>
      {children}
    </div>
  );
}

function PaletteRow({
  icon,
  label,
  kbd,
  highlighted,
}: {
  icon: React.ReactNode;
  label: string;
  kbd?: string;
  highlighted?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] transition ${
        highlighted ? "bg-accent text-foreground" : "text-foreground/85 hover:bg-accent"
      }`}
    >
      <span className="text-foreground/70">{icon}</span>
      <span className="flex-1">{label}</span>
      {kbd && (
        <span className="flex items-center gap-1">
          {kbd.split(" ").map((k, i) => (
            <Kbd key={i}>{k}</Kbd>
          ))}
        </span>
      )}
    </button>
  );
}

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3l6 6-4 1-5 5-1 5-7-7 5-1 5-5 1-4z" />
  </svg>
);
const SplitHIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <line x1="12" y1="4.5" x2="12" y2="19.5" />
  </svg>
);
const SplitVIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <line x1="3.5" y1="12" x2="20.5" y2="12" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);
const FlaskIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3.5h6M10 3.5v5.5L5 18a2 2 0 0 0 1.78 2.92h10.44A2 2 0 0 0 19 18l-5-9V3.5" />
  </svg>
);
