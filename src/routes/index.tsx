import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
      { title: "Density — A coding agent" },
      {
        name: "description",
        content:
          "Density is a calm, focused coding agent for plan, build, and ship — designed with Apple-grade restraint.",
      },
    ],
  }),
  component: Density,
});

type Mode = "Auto" | "Plan" | "Build" | "Ask";
type RightTab = "git" | "browser" | "preview" | "terminal" | null;
type ChatMessage = { id: string; role: "user" | "assistant"; text: string; slash?: string; status?: string };
type SideView = "agent" | "automations" | "customize";

const FOOTER_HINTS = [
  { cmd: "/multitask", text: "to run subagents to parallelize your requests instead of queuing them" },
  { cmd: "/create-hook", text: "to control and extend the agent loop with custom scripts" },
  { cmd: "/simplify", text: "to have Cursor review all changed files for code quality and efficiency" },
  { cmd: "/review", text: "to have Cursor find bugs, regressions, security issues, and missing tests" },
];

const ASSISTANT_REPLIES = [
  "Hi — how can I help you today? I can assist with coding, debugging, exploring your project, or anything else you're working on in this workspace.",
  "On it. I'll plan the smallest set of changes first, then implement them in order.",
  "Got it. Let me look through the relevant files and come back with a focused diff.",
  "Understood. I'll keep the scope tight and explain each step as I go.",
];

function Density() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sideView, setSideView] = useState<SideView>("agent");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>(null);
  const [openTabs, setOpenTabs] = useState<Array<"powershell" | "browser">>([]);
  const [activeTab, setActiveTab] = useState<"powershell" | "browser" | null>(null);

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [appMenu, setAppMenu] = useState<null | "File" | "Edit" | "View" | "Help">(null);

  const [mode, setMode] = useState<Mode>("Auto");
  const [text, setText] = useState("");
  const [hintIdx, setHintIdx] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [running, setRunning] = useState(false);
  const [showHidePanelTip, setShowHidePanelTip] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setInterval(() => setHintIdx((i) => (i + 1) % FOOTER_HINTS.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (meta && e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setRightTab(null);
      } else if (meta && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
      } else if (meta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newChat();
      } else if (e.key === "Tab" && !messages.length && document.activeElement === document.body) {
        e.preventDefault();
        setText((t) => (t.length ? t : "Plan a new idea: "));
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setAddMenuOpen(false);
        setModeOpen(false);
        setFolderOpen(false);
        setLocalOpen(false);
        setMoreOpen(false);
        setAppMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [messages.length]);

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

  const newChat = () => {
    setMessages([]);
    setText("");
    setThinking(false);
    setRunning(false);
  };

  const handleSend = () => {
    if (running) {
      setRunning(false);
      setThinking(false);
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    let slash: string | undefined;
    let body = trimmed;
    const m = trimmed.match(/^(\/[a-zA-Z][\w-]*)\s*(.*)$/);
    if (m) { slash = m[1]; body = m[2] || ""; }
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: body || trimmed, slash };
    const replyIdx = messages.filter((mm) => mm.role === "user").length;
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setThinking(true);
    setRunning(true);
    setTimeout(() => {
      const reply = ASSISTANT_REPLIES[Math.min(replyIdx, ASSISTANT_REPLIES.length - 1)];
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: "assistant", text: reply,
        status: "Planning next moves",
      }]);
      setThinking(false);
      setTimeout(() => setRunning(false), 400);
    }, 900);
  };

  const hasConversation = messages.length > 0;

  const openTab = (t: "powershell" | "browser") => {
    setOpenTabs((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setActiveTab(t);
    setRightTab(t === "powershell" ? "terminal" : "browser");
  };
  const closeTab = (t: "powershell" | "browser") => {
    setOpenTabs((prev) => prev.filter((x) => x !== t));
    setActiveTab((prev) => (prev === t ? null : prev));
    setRightTab(null);
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground select-none">
      {/* Title bar (Mac-like) */}
      <TitleBar
        appMenu={appMenu}
        setAppMenu={setAppMenu}
        sidebarBadge={openTabs.length > 0 || hasConversation ? 1 : 0}
        onNew={newChat}
      />

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside
          className={`relative z-20 h-full shrink-0 border-r border-border bg-surface transition-[width] duration-300 ease-out ${
            sidebarOpen ? "w-[232px]" : "w-0"
          }`}
        >
          {sidebarOpen && (
            <SidebarPanel
              view={sideView}
              setView={setSideView}
              onClose={() => setSidebarOpen(false)}
              onNew={newChat}
            />
          )}
        </aside>

        {/* Main */}
        <main className="relative z-10 flex h-full min-w-0 flex-1 flex-col">
          <Toolbar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            onOpenPalette={() => setPaletteOpen(true)}
            onNew={newChat}
            hasConversation={hasConversation}
            rightTab={rightTab}
            onToggleRight={() => {
              if (rightTab) setRightTab(null);
              else setRightTab("browser");
            }}
            onShowHidePanelTip={setShowHidePanelTip}
            moreOpen={moreOpen}
            setMoreOpen={setMoreOpen}
            sidebarBadge={openTabs.length}
          />

          <div className="flex min-h-0 flex-1">
            {/* Center area */}
            <section className="relative flex min-w-0 flex-1 flex-col">
              {sideView === "automations" && sidebarOpen ? (
                <AutomationsView />
              ) : hasConversation ? (
                <>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
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
                        running={running}
                        inputRef={inputRef}
                        onSend={handleSend}
                        onOpenAdd={() => setAddMenuOpen((v) => !v)}
                        addMenuOpen={addMenuOpen}
                        onPickMode={(m) => { setMode(m); setModeOpen(false); }}
                        modeOpen={modeOpen}
                        onToggleMode={() => setModeOpen((v) => !v)}
                      />
                    </div>
                  </div>
                  <StatusFooter />
                </>
              ) : (
                <>
                  <div className="relative flex flex-1 flex-col items-center justify-center px-6">
                    <Composer
                      variant="hero"
                      text={text}
                      setText={setText}
                      mode={mode}
                      running={running}
                      inputRef={inputRef}
                      onSend={handleSend}
                      onOpenAdd={() => setAddMenuOpen((v) => !v)}
                      addMenuOpen={addMenuOpen}
                      onPickMode={(m) => { setMode(m); setModeOpen(false); }}
                      modeOpen={modeOpen}
                      onToggleMode={() => setModeOpen((v) => !v)}
                      folderOpen={folderOpen}
                      onToggleFolder={() => { setFolderOpen((v) => !v); setLocalOpen(false); }}
                      localOpen={localOpen}
                      onToggleLocal={() => { setLocalOpen((v) => !v); setFolderOpen(false); }}
                      onRunCursor={(target) => {
                        setFolderOpen(false);
                        if (target === "terminal") openTab("powershell");
                        if (target === "open") openTab("browser");
                      }}
                    />
                    <PlanPill onClick={() => { setText("Plan a new idea: "); inputRef.current?.focus(); }} />
                  </div>
                  <FooterHint hint={FOOTER_HINTS[hintIdx]} />
                </>
              )}
            </section>

            {/* Right panel */}
            {rightTab && (
              <aside className="relative z-10 flex w-[48%] min-w-[420px] flex-col border-l border-border bg-surface animate-fade-in">
                <RightPanel
                  tab={rightTab}
                  openTabs={openTabs}
                  activeTab={activeTab}
                  onPickTab={(t) => {
                    setActiveTab(t);
                    setRightTab(t === "powershell" ? "terminal" : "browser");
                  }}
                  onCloseTab={closeTab}
                  onClose={() => setRightTab(null)}
                  onSetRight={setRightTab}
                />
              </aside>
            )}
          </div>
        </main>
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      {showHidePanelTip && <HidePanelTip />}
    </div>
  );
}

/* ───────────────────────── Title Bar ───────────────────────── */

function TitleBar({
  appMenu, setAppMenu, sidebarBadge, onNew,
}: {
  appMenu: null | "File" | "Edit" | "View" | "Help";
  setAppMenu: (m: null | "File" | "Edit" | "View" | "Help") => void;
  sidebarBadge: number;
  onNew: () => void;
}) {
  const menus: Array<"File" | "Edit" | "View" | "Help"> = ["File", "Edit", "View", "Help"];
  const items: Record<string, Array<{ label: string; kbd?: string; onClick?: () => void; sep?: boolean }>> = {
    File: [
      { label: "New Agent", kbd: "Ctrl N", onClick: onNew },
      { label: "New Window", kbd: "Ctrl Shift N" },
      { label: "Open Folder…", kbd: "Ctrl O" },
      { sep: true, label: "" },
      { label: "Save", kbd: "Ctrl S" },
      { sep: true, label: "" },
      { label: "Quit", kbd: "Ctrl Q" },
    ],
    Edit: [
      { label: "Undo", kbd: "Ctrl Z" },
      { label: "Redo", kbd: "Ctrl Y" },
      { sep: true, label: "" },
      { label: "Cut", kbd: "Ctrl X" },
      { label: "Copy", kbd: "Ctrl C" },
      { label: "Paste", kbd: "Ctrl V" },
    ],
    View: [
      { label: "Toggle Sidebar", kbd: "Ctrl B" },
      { label: "Toggle Right Panel", kbd: "Ctrl Alt B" },
      { label: "Command Palette", kbd: "Ctrl K" },
    ],
    Help: [
      { label: "Documentation" },
      { label: "Keyboard Shortcuts" },
      { label: "About Density" },
    ],
  };
  return (
    <div className="relative z-30 flex h-9 shrink-0 items-center justify-between border-b border-border/60 bg-surface/95 backdrop-blur">
      {/* Left: app icon + menu */}
      <div className="flex h-full items-center gap-1 pl-3">
        <div className="relative flex size-5 items-center justify-center">
          <DensitySquareIcon />
          {sidebarBadge > 0 && (
            <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-accent-blue px-1 text-[9px] font-medium leading-none text-white shadow-sm">
              {sidebarBadge}
            </span>
          )}
        </div>
        <div className="ml-2 flex items-center" onMouseLeave={() => setAppMenu(null)}>
          {menus.map((m) => (
            <div key={m} className="relative">
              <button
                onClick={() => setAppMenu(appMenu === m ? null : m)}
                onMouseEnter={() => appMenu && setAppMenu(m)}
                className={`flex h-7 items-center rounded px-2 text-[12.5px] text-foreground/85 transition hover:bg-accent ${
                  appMenu === m ? "bg-accent" : ""
                }`}
              >
                {m}
              </button>
              {appMenu === m && (
                <div className="absolute left-0 top-full z-40 mt-0.5 w-[220px] rounded-lg border border-border bg-popover p-1 shadow-pop animate-scale-in">
                  {items[m].map((it, i) =>
                    it.sep ? (
                      <div key={i} className="my-1 h-px bg-border" />
                    ) : (
                      <button
                        key={i}
                        onClick={() => { it.onClick?.(); setAppMenu(null); }}
                        className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12.5px] text-foreground/85 transition hover:bg-accent"
                      >
                        <span>{it.label}</span>
                        {it.kbd && <span className="text-[10.5px] text-muted-foreground">{it.kbd}</span>}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center drag region */}
      <div className="flex-1" />

      {/* Right: window controls */}
      <div className="flex h-full items-center">
        <WinBtn aria-label="Minimize"><svg width="10" height="10" viewBox="0 0 10 10"><line x1="2" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1" /></svg></WinBtn>
        <WinBtn aria-label="Maximize"><svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="1.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" /></svg></WinBtn>
        <WinBtn aria-label="Close" danger><svg width="10" height="10" viewBox="0 0 10 10"><line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1" /><line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" strokeWidth="1" /></svg></WinBtn>
      </div>
    </div>
  );
}

function WinBtn({ children, danger, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      {...p}
      className={`flex h-full w-11 items-center justify-center text-foreground/65 transition ${
        danger ? "hover:bg-[oklch(0.6_0.22_27)] hover:text-white" : "hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function DensitySquareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4.5" stroke="currentColor" strokeWidth="1.5" opacity="0.85" />
      <path d="M8 8h5a4 4 0 0 1 0 8H8V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────────────────────── Toolbar ───────────────────────── */

function Toolbar({
  sidebarOpen, onToggleSidebar, onOpenPalette, onNew, hasConversation, rightTab, onToggleRight,
  onShowHidePanelTip, moreOpen, setMoreOpen, sidebarBadge,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenPalette: () => void;
  onNew: () => void;
  hasConversation: boolean;
  rightTab: RightTab;
  onToggleRight: () => void;
  onShowHidePanelTip: (b: boolean) => void;
  moreOpen: boolean;
  setMoreOpen: (b: boolean) => void;
  sidebarBadge: number;
}) {
  return (
    <div className="relative flex h-11 shrink-0 items-center justify-between border-b border-border/60 px-2">
      <div className="flex items-center gap-0.5">
        <IconBtn label="Toggle sidebar" onClick={onToggleSidebar} active={sidebarOpen} badge={!sidebarOpen ? sidebarBadge : 0}>
          <SidebarIcon size={15} />
        </IconBtn>
        <IconBtn label="Search ⌘K" onClick={onOpenPalette}>
          <SearchIcon size={15} />
        </IconBtn>
        {hasConversation && (
          <>
            <IconBtn label="New agent" onClick={onNew}>
              <PlusIcon size={15} />
            </IconBtn>
            <div className="ml-1 flex items-center gap-1.5 px-1.5 text-[12.5px] text-foreground/85">
              <span>New Agent</span>
              <LockIcon />
            </div>
          </>
        )}
      </div>

      {!hasConversation && (
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <span>Editor Window</span>
          <ArrowUpRightIcon size={11} />
        </button>
      )}

      <div className="flex items-center gap-0.5">
        {!hasConversation && (
          <div className="relative">
            <IconBtn label="More" onClick={() => setMoreOpen(!moreOpen)}>
              <DotsIcon />
            </IconBtn>
            {moreOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-[180px] rounded-lg border border-border bg-popover p-1 shadow-pop animate-scale-in">
                {["Move to new window", "Close window", "Reset layout"].map((l) => (
                  <button key={l} onClick={() => setMoreOpen(false)} className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-[12.5px] text-foreground/85 hover:bg-accent">
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <IconBtn label="Expand"><ExpandIcon size={14} /></IconBtn>
        <div
          onMouseEnter={() => rightTab && onShowHidePanelTip(true)}
          onMouseLeave={() => onShowHidePanelTip(false)}
        >
          <IconBtn label={rightTab ? "Hide panel" : "Show panel"} onClick={onToggleRight} active={!!rightTab}>
            <PanelRightIcon size={15} />
          </IconBtn>
        </div>
      </div>
    </div>
  );
}

function HidePanelTip() {
  return (
    <div className="pointer-events-none fixed right-3 top-[58px] z-40 flex items-center gap-2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11.5px] text-foreground/85 shadow-pop animate-fade-in">
      <span>Hide Panel</span>
      <Kbd>Ctrl</Kbd><Kbd>Alt</Kbd><Kbd>B</Kbd>
    </div>
  );
}

function DotsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconBtn({
  children, label, onClick, active, badge,
}: { children: React.ReactNode; label: string; onClick?: () => void; active?: boolean; badge?: number }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      title={label}
      className={`relative flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 transition-all duration-150 hover:bg-accent hover:text-foreground active:scale-[0.96] ${
        active ? "bg-accent text-foreground" : ""
      }`}
    >
      {children}
      {!!badge && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-accent-blue px-1 text-[9px] font-medium leading-none text-white shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ───────────────────────── Sidebar ───────────────────────── */

function SidebarPanel({
  view, setView, onClose, onNew,
}: { view: SideView; setView: (v: SideView) => void; onClose: () => void; onNew: () => void }) {
  const workspaces = [
    { label: "New folder (2)", icon: <FolderIcon size={14} />, active: true },
    { label: "Navigation to ceres folder", dot: "muted" as const },
    { label: "(1) Chat", dot: "muted" as const },
    { label: "cd ceres folder", dot: "accent" as const },
  ];
  const homes = [{ label: "Home", items: ["hi"] }, { label: "Home", items: ["hi"] }];

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center gap-0.5">
          <IconBtn label="Close sidebar" onClick={onClose} active>
            <SidebarIcon size={15} />
          </IconBtn>
          <IconBtn label="Search"><SearchIcon size={15} /></IconBtn>
        </div>
        <div className="flex items-center gap-0.5 text-foreground/40">
          <IconBtn label="Back"><ArrowLeftIcon size={13} /></IconBtn>
          <IconBtn label="Forward"><ArrowRightIcon size={13} /></IconBtn>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 text-[13px]">
        <NavRow icon={<FunnelIcon />} label="New Agent" shortcut="Ctrl+N" active={view === "agent"} onClick={() => { setView("agent"); onNew(); }} />
        <NavRow icon={<AutomationsIcon />} label="Automations" active={view === "automations"} onClick={() => setView("automations")} />
        <NavRow icon={<CustomizeIcon />} label="Customize" active={view === "customize"} onClick={() => setView("customize")} />

        <div className="mt-4 flex items-center justify-between px-2 pb-1 text-[11.5px] uppercase tracking-wider text-muted-foreground/80">
          <span>Workspaces</span>
          <div className="flex items-center gap-0.5 text-muted-foreground/60">
            <button className="rounded p-1 hover:bg-accent" title="Filter"><ListIcon size={12} /></button>
            <button className="rounded p-1 hover:bg-accent" title="Add"><PlusIcon size={12} /></button>
          </div>
        </div>

        {workspaces.map((w, i) => <WorkspaceRow key={i} {...w} />)}

        {homes.map((h, i) => (
          <div key={i} className="mt-3">
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-foreground/85">
              <HomeIcon /><span>{h.label}</span>
            </div>
            {h.items.map((it) => (
              <div key={it} className="ml-6 flex items-center gap-2 rounded-md px-2 py-1 text-[12.5px] text-muted-foreground">
                <span className="size-[5px] rounded-full bg-muted-foreground/50" />{it}
              </div>
            ))}
          </div>
        ))}

        <div className="mt-3 flex items-center gap-2 rounded-md px-2 py-2 text-[13px] text-muted-foreground hover:bg-accent cursor-pointer">
          <OpenWorkspaceIcon /><span>Open Workspace</span>
        </div>
      </div>

      <div className="border-t border-border px-2 py-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] text-foreground/85 shadow-soft transition hover:bg-accent">
          <DiamondIcon size={13} />Upgrade to a Pro account
        </button>
        <div className="mt-2 flex items-center gap-2 px-1.5 py-1.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.55_0.18_250)] to-[oklch(0.7_0.16_200)] text-[11px] font-medium text-white">S</div>
          <div className="flex-1 leading-tight">
            <div className="text-[12.5px] text-foreground">Sameer</div>
            <div className="text-[10.5px] text-muted-foreground">Free Plan</div>
          </div>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent" title="Filter"><ListIcon size={12} /></button>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent" title="Settings"><SettingsIcon /></button>
        </div>
      </div>
    </div>
  );
}

function NavRow({ icon, label, shortcut, active, onClick }: {
  icon: React.ReactNode; label: string; shortcut?: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${
        active ? "bg-accent text-foreground" : "text-foreground/85 hover:bg-accent"
      }`}
    >
      <span className={active ? "text-accent-blue" : "text-foreground/70"}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {shortcut && <span className="text-[10.5px] text-muted-foreground">{shortcut}</span>}
    </button>
  );
}

function WorkspaceRow({ label, icon, active, dot }: {
  label: string; icon?: React.ReactNode; active?: boolean; dot?: "muted" | "accent";
}) {
  return (
    <button className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors ${
      active ? "text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
    }`}>
      {icon ? (
        <span className={active ? "text-accent-blue" : "text-foreground/60"}>{icon}</span>
      ) : (
        <span className={`ml-1 size-[6px] rounded-full ${dot === "accent" ? "bg-accent-blue" : "bg-muted-foreground/50"}`} />
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
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M8 9h8M8 13h5" />
  </svg>
);
const CustomizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 7h9M5 12h6M5 17h12" /><circle cx="17" cy="7" r="1.8" /><circle cx="14" cy="12" r="1.8" /><circle cx="20" cy="17" r="1.8" />
  </svg>
);
const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11 12 4l8 7" /><path d="M5.5 10v9h13v-9" />
  </svg>
);
const OpenWorkspaceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7A2 2 0 0 1 20.5 9.5V17a2 2 0 0 1-2 2H5.5A2 2 0 0 1 3.5 17V7.5z" /><path d="M10 14l2 2 4-4" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2.6" />
    <path d="M19.5 12a7.5 7.5 0 0 0-.13-1.4l2.1-1.5-2-3.5-2.5.9a7.5 7.5 0 0 0-2.4-1.4L14 2.5h-4l-.6 2.6a7.5 7.5 0 0 0-2.4 1.4l-2.5-.9-2 3.5 2.1 1.5A7.5 7.5 0 0 0 4.5 12c0 .47.05.93.13 1.4l-2.1 1.5 2 3.5 2.5-.9a7.5 7.5 0 0 0 2.4 1.4l.57 2.6h4l.6-2.6a7.5 7.5 0 0 0 2.4-1.4l2.5.9 2-3.5-2.1-1.5c.08-.47.13-.93.13-1.4z" />
  </svg>
);

/* ───────────────────────── Chat bubbles ───────────────────────── */

function UserBubble({ text, slash }: { text: string; slash?: string }) {
  return (
    <div className="flex justify-end animate-fade-in">
      <div className="inline-flex max-w-[80%] items-center rounded-full border border-border bg-card px-4 py-2 text-[13.5px] leading-relaxed text-foreground/90 shadow-soft">
        {slash && <span className="mr-1.5 font-mono text-[12.5px] text-[oklch(0.65_0.15_55)]">{slash}</span>}
        <span className="truncate">{text}</span>
      </div>
    </div>
  );
}
function AssistantBubble({ text, status }: { text: string; status?: string }) {
  return (
    <div className="animate-fade-in px-2 py-1 text-[14px] leading-relaxed text-foreground/85">
      {text}
      {status && <div className="mt-2 text-[12.5px] text-muted-foreground"><span className="font-medium text-foreground/80">{status.split(" ")[0]}</span> {status.split(" ").slice(1).join(" ")}</div>}
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
      <span><span className="font-medium text-foreground/80">Planning</span> next moves</span>
    </div>
  );
}

function StatusFooter() {
  return (
    <div className="flex h-7 shrink-0 items-center justify-between border-t border-border/60 px-3 text-[11.5px] text-muted-foreground">
      <div className="flex items-center gap-1.5"><HardDriveIcon size={11} /><span>Local</span></div>
      <div className="flex items-center gap-1.5"><ContextRing /><span>8%</span></div>
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

/* ───────────────────────── Composer ───────────────────────── */

function Composer({
  variant = "hero", text, setText, mode, running, inputRef, onSend,
  onOpenAdd, addMenuOpen, onPickMode, modeOpen, onToggleMode,
  folderOpen, onToggleFolder, localOpen, onToggleLocal, onRunCursor,
}: {
  variant?: "hero" | "followup";
  text: string;
  setText: (v: string) => void;
  mode: Mode;
  running: boolean;
  inputRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  onSend: () => void;
  onOpenAdd: () => void;
  addMenuOpen: boolean;
  onPickMode: (m: Mode) => void;
  modeOpen: boolean;
  onToggleMode: () => void;
  folderOpen?: boolean;
  onToggleFolder?: () => void;
  localOpen?: boolean;
  onToggleLocal?: () => void;
  onRunCursor?: (target: "terminal" | "open" | "ssh" | "wsl" | "setup") => void;
}) {
  const isFollowup = variant === "followup";
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  return (
    <div className={`animate-fade-in ${isFollowup ? "w-full" : "w-full max-w-[640px]"}`}>
      {!isFollowup && (
        <div className="relative mb-3 flex items-center gap-3 px-1 text-[12.5px]">
          <button
            onClick={onToggleFolder}
            className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[oklch(0.65_0.15_55)] transition hover:bg-accent ${
              folderOpen ? "bg-accent" : ""
            }`}
          >
            <span className="font-medium">New folder (2)</span>
            <ChevronDownIcon size={11} />
          </button>
          <button
            onClick={onToggleLocal}
            className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-foreground/75 transition hover:bg-accent ${
              localOpen ? "bg-accent" : ""
            }`}
          >
            <HardDriveIcon size={13} /><span>Local</span><ChevronDownIcon size={11} />
          </button>

          {folderOpen && <RunCursorAnywhere onPick={(t) => onRunCursor?.(t)} />}
          {localOpen && <LocalMenu />}
        </div>
      )}

      <div className={`group relative border border-border bg-card shadow-soft transition-shadow focus-within:shadow-pop focus-within:border-border-strong ${
        isFollowup ? "flex items-center gap-1 rounded-full px-2 py-1" : "rounded-2xl"
      }`}>
        {isFollowup && (
          <button onClick={onOpenAdd}
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-foreground/60 transition hover:bg-accent active:scale-95 ${
              addMenuOpen ? "rotate-45 bg-accent" : ""
            }`}
            aria-label="Add context"
          ><PlusIcon size={14} /></button>
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
            <button onClick={onToggleMode}
              className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[12px] text-foreground/70 transition hover:bg-accent">
              <span>{mode}</span><ChevronDownIcon size={11} />
            </button>
            <button className="flex size-7 items-center justify-center rounded-full text-foreground/60 transition hover:bg-accent active:scale-95" aria-label="Voice">
              <MicIcon size={13} />
            </button>
            <button onClick={onSend}
              className="flex size-7 items-center justify-center rounded-full bg-foreground text-background transition active:scale-95"
              aria-label={running ? "Stop" : text.length ? "Send" : "Voice"}
            >
              {running ? (
                <span className="size-2.5 rounded-[2px] bg-background" />
              ) : text.length ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
                </svg>
              ) : (
                <MicIcon size={12} />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 pb-2.5 pt-1">
            <button onClick={onOpenAdd}
              className={`flex size-7 items-center justify-center rounded-full border border-border bg-secondary text-foreground/70 transition hover:bg-accent active:scale-95 ${
                addMenuOpen ? "rotate-45 bg-accent" : ""
              }`}
              aria-label="Add context"
            ><PlusIcon size={14} /></button>
            <button onClick={onToggleMode}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-foreground/80 transition hover:bg-accent">
              <span>{mode}</span><ChevronDownIcon size={12} />
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              {text.length > 0 ? (
                <button onClick={onSend}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-[12.5px] font-medium text-background shadow-soft transition-transform active:scale-95"
                  aria-label="Send"
                >
                  Send
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
                  </svg>
                </button>
              ) : (
                <button className="mic-pulse flex size-8 items-center justify-center rounded-full bg-foreground text-background transition active:scale-95" aria-label="Voice">
                  <MicIcon size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {addMenuOpen && <AddContextMenu />}
        {modeOpen && <ModeMenu current={mode} onPick={onPickMode} />}
      </div>
    </div>
  );
}

function RunCursorAnywhere({ onPick }: { onPick: (t: "terminal" | "open" | "ssh" | "wsl" | "setup") => void }) {
  const recents = [
    { p: "C:\\Users\\DELL\\Desktop\\New folder (2)", current: true },
    { p: "c:\\Users\\DELL\\Desktop" },
    { p: "c:\\Users\\DELL\\Desktop\\New folder (11)\\New folder (10)" },
    { p: "c:\\Users\\DELL\\Desktop\\New folder (8)" },
    { p: "c:\\Users\\DELL\\Desktop\\AI- FOR COOPERATION" },
  ];
  return (
    <div className="absolute left-0 top-full z-30 mt-1 w-[360px] rounded-xl border border-border bg-popover p-1.5 shadow-pop animate-scale-in">
      <input autoFocus placeholder="Run Cursor anywhere…"
        className="mb-1 w-full rounded-md bg-transparent px-2 py-1.5 text-[12.5px] placeholder:text-hint focus:outline-none" />
      <div className="h-px bg-border" />
      <div className="px-2 pb-1 pt-2 text-[10.5px] uppercase tracking-wider text-muted-foreground/80">Recents</div>
      {recents.map((r) => (
        <button key={r.p} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-foreground/85 hover:bg-accent">
          <FolderIcon size={13} className="text-foreground/60" />
          <span className="flex-1 truncate">{r.p}</span>
          {r.current && <CheckIcon />}
        </button>
      ))}
      <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-foreground/85 hover:bg-accent">
        <HomeIcon /><span>Home</span>
      </button>
      <div className="px-2 pb-1 pt-2 text-[10.5px] uppercase tracking-wider text-muted-foreground/80">Run On</div>
      <button onClick={() => onPick("open")} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-foreground/85 hover:bg-accent">
        <OpenWorkspaceIcon /><span>Open Folder</span>
      </button>
      <button onClick={() => onPick("setup")} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-foreground/85 hover:bg-accent">
        <FolderIcon size={13} /><span>Set Up Workspace</span>
      </button>
      <button onClick={() => onPick("ssh")} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-foreground/85 hover:bg-accent">
        <TerminalIcon /><span>Connect SSH</span>
      </button>
      <button onClick={() => onPick("wsl")} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-foreground/85 hover:bg-accent">
        <TerminalIcon /><span>Connect WSL</span>
      </button>
      <div className="my-1 h-px bg-border" />
      <button onClick={() => onPick("terminal")} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-accent-blue hover:bg-accent">
        <TerminalIcon /><span>Open Terminal in Folder</span>
      </button>
    </div>
  );
}

function LocalMenu() {
  return (
    <div className="absolute left-[160px] top-full z-30 mt-1 w-[200px] rounded-xl border border-border bg-popover p-1 shadow-pop animate-scale-in">
      {["Local", "SSH", "WSL", "Container"].map((l, i) => (
        <button key={l} className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12.5px] text-foreground/85 hover:bg-accent">
          <span>{l}</span>{i === 0 && <CheckIcon />}
        </button>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 12 10 17 19 7" />
    </svg>
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
      <input autoFocus placeholder="Add agents, context, tools…"
        className="mb-1 w-full rounded-md bg-transparent px-2 py-1.5 text-[12.5px] placeholder:text-hint focus:outline-none" />
      <div className="h-px bg-border" />
      <div className="pt-1">
        {items.slice(0, 4).map((it) => <MenuRow key={it.label} {...it} />)}
        <div className="my-1 h-px bg-border" />
        {items.slice(4).map((it) => <MenuRow key={it.label} {...it} />)}
      </div>
    </div>
  );
}
function ModeMenu({ current, onPick }: { current: Mode; onPick: (m: Mode) => void }) {
  const items: Mode[] = ["Auto", "Plan", "Build", "Ask"];
  return (
    <div className="absolute bottom-[calc(100%+6px)] left-12 z-30 w-[160px] rounded-xl border border-border bg-popover p-1 shadow-pop animate-scale-in">
      {items.map((m) => (
        <button key={m} onClick={() => onPick(m)}
          className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition ${
            current === m ? "bg-accent text-foreground" : "text-foreground/80 hover:bg-accent"
          }`}
        >
          {m}{current === m && <CheckIcon />}
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

function PlanPill({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="mt-3.5 flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-foreground/80 shadow-soft transition hover:bg-accent">
      <SparkleIcon size={12} />
      <span>Plan New Idea</span>
      <span className="flex items-center gap-1 text-muted-foreground">
        <Kbd>⇥</Kbd><span>Tab</span>
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
        <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11.5px] text-foreground/85">{hint.cmd}</span>{" "}
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

/* ───────────────────────── Right Panel ───────────────────────── */

function RightPanel({
  tab, openTabs, activeTab, onPickTab, onCloseTab, onClose, onSetRight,
}: {
  tab: RightTab;
  openTabs: Array<"powershell" | "browser">;
  activeTab: "powershell" | "browser" | null;
  onPickTab: (t: "powershell" | "browser") => void;
  onCloseTab: (t: "powershell" | "browser") => void;
  onClose: () => void;
  onSetRight: (t: RightTab) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* tab bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 px-2">
        <div className="flex items-center gap-0.5">
          <RightTabBtn active={tab === "git"} onClick={() => onSetRight("git")} label="Source control"><GitIcon /></RightTabBtn>
          <RightTabBtn active={tab === "browser"} onClick={() => onSetRight("browser")} label="Browser"><GlobeIcon /></RightTabBtn>
          <RightTabBtn active={tab === "preview"} onClick={() => onSetRight("preview")} label="Preview"><ImageIcon size={15} /></RightTabBtn>
          <RightTabBtn label="Duplicate"><CopyIcon /></RightTabBtn>
          {openTabs.map((t) => (
            <div key={t} className={`ml-1 flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[12px] ${
              activeTab === t ? "shadow-soft" : "text-foreground/70"
            }`}>
              <span className="flex size-3.5 items-center justify-center rounded bg-secondary text-[9px] font-mono text-foreground/70">›_</span>
              <button onClick={() => onPickTab(t)}>{t}</button>
              <button onClick={() => onCloseTab(t)} className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Close tab">
                <svg width="9" height="9" viewBox="0 0 10 10"><line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1.2" /><line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" strokeWidth="1.2" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          <IconBtn label="New tab"><PlusIcon size={14} /></IconBtn>
          <IconBtn label="Expand"><ExpandIcon size={14} /></IconBtn>
          <IconBtn label="Hide panel" onClick={onClose} active><PanelRightIcon size={15} /></IconBtn>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {tab === "terminal" || activeTab === "powershell" ? <TerminalView /> : null}
        {tab === "browser" && activeTab !== "powershell" ? <BrowserView /> : null}
        {tab === "git" && activeTab !== "powershell" ? <GitView /> : null}
        {tab === "preview" && activeTab !== "powershell" ? <PreviewView /> : null}
      </div>
    </div>
  );
}

function RightTabBtn({ active, onClick, children, label }: { active?: boolean; onClick?: () => void; children: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 transition hover:bg-accent hover:text-foreground ${
        active ? "bg-accent text-foreground" : ""
      }`}
    >{children}</button>
  );
}

function TerminalView() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border/60 px-3 text-[12px] text-muted-foreground">
        <ListIcon size={12} /><span>powershell</span>
      </div>
      <div className="flex-1 overflow-auto bg-card px-3 py-2 font-mono text-[12.5px] text-foreground/85">
        <div>PS C:\Users\DELL\Desktop\New folder (2)&gt; <span className="caret" /></div>
      </div>
    </div>
  );
}

function BrowserView() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-border/60 px-2">
        <IconBtn label="History"><ListIcon size={13} /></IconBtn>
        <IconBtn label="Back"><ArrowLeftIcon size={13} /></IconBtn>
        <IconBtn label="Forward"><ArrowRightIcon size={13} /></IconBtn>
        <IconBtn label="Reload"><ReloadIcon /></IconBtn>
        <div className="mx-1 flex h-7 flex-1 items-center gap-2 rounded-md bg-secondary px-2.5 text-[12px] text-hint">
          <StarIcon /><span>Search or enter URL</span>
        </div>
      </div>
      <div className="flex-1 bg-card" />
    </div>
  );
}
function GitView() {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center text-[12.5px] text-muted-foreground">No changes detected</div>
  );
}
function PreviewView() {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center text-[12.5px] text-muted-foreground">Preview empty</div>
  );
}

function GitIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="12" r="2" />
      <path d="M6 8v8M8 6h6a4 4 0 0 1 4 4" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}
function ReloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" /><path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" /><path d="M3 21v-5h5" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6L12 16.8 6.6 19.3l1.3-6L3.3 9.2l6.1-.6L12 3z" />
    </svg>
  );
}
function TerminalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="15" rx="2" /><polyline points="7 10 10 12 7 14" /><line x1="12" y1="15" x2="16" y2="15" />
    </svg>
  );
}

/* ───────────────────────── Automations ───────────────────────── */

function AutomationsView() {
  return (
    <div className="flex-1 overflow-y-auto px-10 py-8">
      <h1 className="text-[20px] font-semibold tracking-tight text-foreground">Automations</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">Automate repetitive tasks with always-on cloud agents that respond to environment triggers.</p>
      <div className="mt-6 grid grid-cols-4 gap-4">
        {["Total Automations", "Successful · 7d", "Failed · 7d", "Run History →"].map((l) => (
          <div key={l} className="rounded-xl border border-border bg-card p-4">
            <div className="text-[12px] text-muted-foreground">{l}</div>
            <div className="mt-3 h-3 w-16 rounded bg-secondary" />
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[13px]">
          <button className="rounded-md bg-accent px-2.5 py-1 font-medium">Mine <span className="text-muted-foreground">0</span></button>
          <button className="text-muted-foreground hover:text-foreground">Team <span>0</span></button>
        </div>
        <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12.5px] shadow-soft hover:bg-accent">
          <PlusIcon size={12} /> New Automation
        </button>
      </div>
      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-4 gap-4 border-b border-border pb-2 text-[12px] text-muted-foreground">
          <span>Automations</span><span>Author</span><span>Tools</span><span>Created</span>
        </div>
        {[0,1,2,3].map((i) => (
          <div key={i} className="grid grid-cols-4 gap-4 py-3">
            <div className="h-3 w-40 rounded bg-secondary" />
            <div className="h-3 w-20 rounded bg-secondary" />
            <div className="h-3 w-10 rounded bg-secondary" />
            <div className="h-3 w-8 rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Command Palette ───────────────────────── */

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const agents = [
    { icon: <FunnelIcon />, label: "New Agent" },
    { icon: <MicIcon size={14} />, label: "Use Voice" },
    { icon: <MicIcon size={14} />, label: "Dictate", kbd: "Ctrl Shift ." },
    { icon: <PinIcon />, label: "Pin / Unpin Agent" },
    { icon: <SplitHIcon />, label: "Split Tile Horizontally" },
    { icon: <SplitVIcon />, label: "Split Tile Vertically" },
    { icon: <XIcon />, label: "Remove from Tileset" },
    { icon: <ArrowLeftIcon size={14} />, label: "Go Back", kbd: "Alt ←" },
    { icon: <ArrowRightIcon size={14} />, label: "Go Forward", kbd: "Alt →" },
  ];
  const modes = [
    { icon: <ListIcon size={14} />, label: "Plan Mode" },
    { icon: <QuestionIcon size={14} />, label: "Ask Mode" },
  ];
  const filtered = useMemo(() => {
    if (!q) return { agents, modes };
    const f = (a: { label: string }) => a.label.toLowerCase().includes(q.toLowerCase());
    return { agents: agents.filter(f), modes: modes.filter(f) };
  }, [q]);
  const [hl, setHl] = useState(0);
  const flat = [...filtered.agents, ...filtered.modes];
  useEffect(() => { setHl(0); }, [q]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/10 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="mt-[18vh] w-[min(640px,92vw)] overflow-hidden rounded-2xl border border-border bg-popover shadow-pop animate-scale-in"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setHl((h) => Math.min(flat.length - 1, h + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHl((h) => Math.max(0, h - 1)); }
          else if (e.key === "Enter") onClose();
        }}
      >
        <div className="border-b border-border px-4 py-3">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search files, actions, agents…"
            className="w-full bg-transparent text-[14px] placeholder:text-hint focus:outline-none" />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-1.5">
          {filtered.agents.length > 0 && (
            <Section title="Agent">
              {filtered.agents.map((a, i) => <PaletteRow key={i} {...a} highlighted={hl === i} />)}
            </Section>
          )}
          {filtered.agents.length > 0 && filtered.modes.length > 0 && <div className="my-1 h-px bg-border" />}
          {filtered.modes.length > 0 && (
            <Section title="Mode">
              {filtered.modes.map((m, i) => <PaletteRow key={i} {...m} highlighted={hl === filtered.agents.length + i} />)}
            </Section>
          )}
          {flat.length === 0 && (
            <div className="px-3 py-6 text-center text-[12.5px] text-muted-foreground">No results</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-muted-foreground/80">{title}</div>
      {children}
    </div>
  );
}
function PaletteRow({ icon, label, kbd, highlighted }: { icon: React.ReactNode; label: string; kbd?: string; highlighted?: boolean }) {
  return (
    <button className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] transition ${
      highlighted ? "bg-accent text-foreground" : "text-foreground/85 hover:bg-accent"
    }`}>
      <span className="text-foreground/70">{icon}</span>
      <span className="flex-1">{label}</span>
      {kbd && <span className="flex items-center gap-1">{kbd.split(" ").map((k, i) => <Kbd key={i}>{k}</Kbd>)}</span>}
    </button>
  );
}
function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3l7 7-4 2-3 7-4-4-5 5 5-5-4-4 7-3 1-5z" />
    </svg>
  );
}
function SplitHIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><line x1="12" y1="4.5" x2="12" y2="19.5" />
    </svg>
  );
}
function SplitVIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><line x1="3.5" y1="12" x2="20.5" y2="12" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
