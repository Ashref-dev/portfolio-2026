import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
  type Transition,
  type Variants,
} from 'motion/react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Folder,
  GalleryHorizontal,
  LayoutGrid,
  List,
  Minus,
  Plus,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';

import { track } from '../../lib/analytics';
import { cn } from '../../lib/utils';
import { tools, type Tool } from './data';
import { GlassPill, PillArrow } from './GlassPill';

gsap.registerPlugin(ScrollTrigger);

type View = 'icons' | 'list' | 'gallery';
type TagId = 'macos' | 'web' | 'private' | 'oss';
type Ghost = { key: number; src: string; left: number; top: number; size: number };

const PRIVATE_IDS = new Set(['ots', 'blank', 'diff', 'md', 'excel']);

const isMacApp = (tool: Tool) => tool.runsOn.startsWith('macOS');
const kindOf = (tool: Tool) => (isMacApp(tool) ? 'macOS app' : 'Web app');
const toolUrl = (tool: Tool) => `https://${tool.domain}`;
const repoUrl = (tool: Tool) => `https://github.com/${tool.repo}`;
const iconSrc = (tool: Tool) => `/assets/tools/${tool.id}-icon.webp`;
const ogSrc = (tool: Tool) => `/assets/tools/${tool.id}-og.webp`;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TAGS: readonly { id: TagId; label: string; dot: string; test: (tool: Tool) => boolean }[] = [
  { id: 'macos', label: 'macOS', dot: 'bg-[#af52de]', test: isMacApp },
  { id: 'web', label: 'Web', dot: 'bg-[#007aff]', test: (tool) => !isMacApp(tool) },
  { id: 'private', label: 'Private by design', dot: 'bg-[#34c759]', test: (tool) => PRIVATE_IDS.has(tool.id) },
  { id: 'oss', label: 'Open source', dot: 'bg-[#ff9500]', test: () => true },
];

const VIEWS: readonly { id: View; label: string; Icon: LucideIcon }[] = [
  { id: 'icons', label: 'Icons', Icon: LayoutGrid },
  { id: 'list', label: 'List', Icon: List },
  { id: 'gallery', label: 'Gallery', Icon: GalleryHorizontal },
];

const INFO: readonly { label: string; value: (tool: Tool) => string }[] = [
  { label: 'Kind', value: kindOf },
  { label: 'Where', value: (tool) => tool.domain },
  { label: 'Source', value: (tool) => `github.com/${tool.repo}` },
  { label: 'Runs on', value: (tool) => tool.runsOn },
];

const LIGHTS = [
  { color: 'bg-[#ff5f57]', Icon: X },
  { color: 'bg-[#febc2e]', Icon: Minus },
  { color: 'bg-[#28c840]', Icon: Plus },
] as const;

const matches = (tool: Tool, needle: string) =>
  tool.name.toLowerCase().includes(needle) ||
  tool.domain.toLowerCase().includes(needle) ||
  tool.description.toLowerCase().includes(needle);

const filterTools = (tag: TagId | null, query: string) => {
  const needle = query.trim().toLowerCase();
  const test = TAGS.find((entry) => entry.id === tag)?.test;
  return tools.filter((tool) => (!test || test(tool)) && (!needle || matches(tool, needle)));
};

const SPRING: Transition = { type: 'spring', stiffness: 520, damping: 42 };
const PRESS_SPRING: Transition = { type: 'spring', stiffness: 700, damping: 32 };
const EASE_OUT: Transition['ease'] = [0.22, 1, 0.36, 1];
const ITEM_TRANSITION: Transition = { duration: 0.22, ease: EASE_OUT, layout: SPRING };
const VIEW_IN: Transition = { duration: 0.25, ease: EASE_OUT };

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  shown: { opacity: 1, scale: 1 },
};
const ROW_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  shown: { opacity: 1, scale: 1 },
};
const ICON_PRESS: Variants = {
  shown: { scale: 1, transition: PRESS_SPRING },
  press: { scale: 0.94, transition: PRESS_SPRING },
};

const STACK = "grid [grid-template-areas:'stack'] *:[grid-area:stack] *:min-w-0";
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent';
const HAIRLINE = 'border-black/[0.07]';
const PRESSABLE = 'transition-[transform,background-color,color,filter,box-shadow] duration-150 active:scale-[0.97]';
const CROSSFADE = 'transition-[opacity,filter,visibility] duration-[260ms] ease-out motion-reduce:transition-none';
const SHOWN = 'opacity-100 [filter:blur(0px)]';
const HIDDEN = 'invisible opacity-0 [filter:blur(4px)]';
const LIST_COLUMNS =
  'grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1fr)]';
const ROW_HEIGHT = 'h-7 max-md:h-11 pointer-coarse:h-11';
const LIST_STRIPES =
  'bg-origin-content bg-clip-content bg-[repeating-linear-gradient(180deg,transparent_0_1.75rem,rgb(0_0_0/0.028)_1.75rem_3.5rem)] max-md:bg-[repeating-linear-gradient(180deg,transparent_0_2.75rem,rgb(0_0_0/0.028)_2.75rem_5.5rem)] pointer-coarse:bg-[repeating-linear-gradient(180deg,transparent_0_2.75rem,rgb(0_0_0/0.028)_2.75rem_5.5rem)]';
const COLUMN_DIVIDER =
  'relative before:absolute before:-left-1.5 before:inset-y-0 before:w-px before:bg-black/[0.07]';

const TrafficLights = ({ className }: { className?: string }) => (
  <div aria-hidden='true' className={cn('group/lights flex shrink-0 items-center gap-2', className)}>
    {LIGHTS.map(({ color, Icon }) => (
      <span
        key={color}
        className={cn(
          'grid size-3 place-items-center rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.22)] transition-[filter] duration-100 active:brightness-[0.78]',
          color,
        )}
      >
        <Icon
          strokeWidth={3}
          className='size-2 text-black/55 opacity-0 transition-opacity duration-150 group-hover/lights:opacity-100'
        />
      </span>
    ))}
  </div>
);

const ViewSwitch = ({ view, onChange }: { view: View; onChange: (view: View) => void }) => (
  <div role='group' aria-label='View' className='flex shrink-0 items-center rounded-lg bg-black/[0.05] p-0.5'>
    {VIEWS.map(({ id, label, Icon }) => {
      const active = id === view;
      return (
        <button
          key={id}
          type='button'
          aria-pressed={active}
          aria-label={`View as ${label}`}
          title={`as ${label}`}
          onClick={() => onChange(id)}
          className={cn(
            'relative grid h-7 w-9 place-items-center rounded-md max-md:h-10 max-md:w-11 pointer-coarse:h-10 pointer-coarse:w-11',
            PRESSABLE,
            FOCUS_RING,
            active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900',
          )}
        >
          {active ? (
            <motion.span
              layoutId='view-thumb'
              transition={SPRING}
              className='absolute inset-0 rounded-md bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.12)]'
            />
          ) : null}
          <Icon aria-hidden='true' strokeWidth={1.75} className='relative size-4' />
        </button>
      );
    })}
  </div>
);

const SidebarItem = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type='button'
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'relative flex h-7 w-full items-center rounded-md px-2 text-left text-[13px]',
      PRESSABLE,
      FOCUS_RING,
      active ? 'font-medium text-neutral-900' : 'text-neutral-600 hover:bg-black/[0.03] hover:text-neutral-900',
    )}
  >
    {active ? (
      <motion.span layoutId='sidebar-selection' transition={SPRING} className='absolute inset-0 rounded-md bg-black/[0.06]' />
    ) : null}
    <span className='relative flex min-w-0 items-center gap-2'>{children}</span>
  </button>
);

const SearchField = ({ value, onChange, onArrowDown }: { value: string; onChange: (value: string) => void; onArrowDown: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && value) {
      event.preventDefault();
      onChange('');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      onArrowDown();
    }
  };

  return (
    <div className='relative hidden md:block'>
      <Search
        aria-hidden='true'
        strokeWidth={2}
        className='pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400'
      />
      <input
        ref={inputRef}
        type='search'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Search'
        aria-label='Search tools'
        autoComplete='off'
        autoCorrect='off'
        spellCheck={false}
        className={cn(
          'block h-7 appearance-none rounded-lg bg-black/[0.05] pl-7 pr-7 text-[13px] text-neutral-900 outline-none transition-[width,background-color,box-shadow] duration-200 ease-out placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-[#0a84ff]/50 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
          value ? 'w-48' : 'w-36 focus:w-48',
        )}
      />
      {value ? (
        <button
          type='button'
          tabIndex={-1}
          aria-label='Clear search'
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className='absolute right-1.5 top-1/2 grid size-4 -translate-y-1/2 place-items-center rounded-full bg-neutral-400/80 text-white transition-colors duration-150 hover:bg-neutral-500'
        >
          <X aria-hidden='true' strokeWidth={3} className='size-2.5' />
        </button>
      ) : null}
    </div>
  );
};

const RollingCount = ({ value }: { value: number }) => (
  <span className='relative inline-flex h-4 overflow-hidden tabular-nums'>
    <AnimatePresence mode='popLayout' initial={false}>
      <motion.span
        key={value}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        exit={{ y: '-100%', opacity: 0 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
        className='block leading-4'
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);

const OgStack = ({ selectedId, className, ref }: { selectedId: string; className?: string; ref?: Ref<HTMLDivElement> }) => (
  <div
    ref={ref}
    className={cn('relative aspect-[1200/630] overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-black/10', className)}
  >
    {tools.map((tool) => (
      <img
        key={tool.id}
        src={ogSrc(tool)}
        alt={tool.id === selectedId ? tool.name : ''}
        width={1200}
        height={630}
        loading='lazy'
        decoding='async'
        draggable={false}
        className={cn('absolute inset-0 block h-full w-full', CROSSFADE, tool.id === selectedId ? SHOWN : HIDDEN)}
      />
    ))}
  </div>
);

const Actions = ({ tool, onLaunch }: { tool: Tool; onLaunch: (tool: Tool) => void }) => (
  <div className='flex flex-wrap items-center gap-2'>
    <a
      href={toolUrl(tool)}
      target='_blank'
      rel='noopener noreferrer'
      onClick={() => onLaunch(tool)}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-md bg-[#0a84ff] px-4 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:brightness-110 max-md:h-10 pointer-coarse:h-10',
        PRESSABLE,
        FOCUS_RING,
      )}
    >
      Open<span className='sr-only'> {tool.name} in a new tab</span>
      <ArrowUpRight aria-hidden='true' strokeWidth={2} className='size-3.5' />
    </a>
    <a
      href={repoUrl(tool)}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'inline-flex h-8 items-center rounded-md border border-black/10 bg-white px-4 text-[13px] font-medium text-neutral-800 shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-neutral-50 max-md:h-10 pointer-coarse:h-10',
        PRESSABLE,
        FOCUS_RING,
      )}
    >
      GitHub<span className='sr-only'> repository for {tool.name}</span>
    </a>
  </div>
);

const Details = ({
  tool,
  layout,
  onQuickLook,
  onLaunch,
}: {
  tool: Tool;
  layout: 'side' | 'below';
  onQuickLook: () => void;
  onLaunch: (tool: Tool) => void;
}) => {
  const header = (
    <div className='flex items-center gap-2'>
      <h3 className='min-w-0 flex-1 truncate text-xl font-semibold tracking-tight text-neutral-900'>{tool.name}</h3>
      <button
        type='button'
        aria-label={`Quick Look ${tool.name}`}
        aria-haspopup='dialog'
        title='Quick Look (Space)'
        onClick={onQuickLook}
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-md text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900 max-md:size-10 pointer-coarse:size-10',
          PRESSABLE,
          FOCUS_RING,
        )}
      >
        <Eye aria-hidden='true' strokeWidth={1.75} className='size-4' />
      </button>
    </div>
  );

  const info = (
    <dl className={cn('grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-y-1.5 border-y py-3', HAIRLINE)}>
      {INFO.map(({ label, value }) => {
        const text = value(tool);
        return (
          <div key={label} className='contents'>
            <dt className='text-[11px] text-neutral-400'>{label}</dt>
            <dd title={text} className='truncate text-xs text-neutral-700'>
              {text}
            </dd>
          </div>
        );
      })}
    </dl>
  );

  const description = <p className='text-sm leading-relaxed text-neutral-600 lg:text-[15px]'>{tool.description}</p>;
  const actions = <Actions tool={tool} onLaunch={onLaunch} />;

  if (layout === 'below') {
    return (
      <div className='grid gap-x-8 gap-y-4 md:grid-cols-2'>
        <div className='flex min-w-0 flex-col gap-2'>
          {header}
          {info}
        </div>
        <div className='flex min-w-0 flex-col gap-4 md:pt-10'>
          {description}
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        {header}
        {info}
      </div>
      {description}
      {actions}
    </div>
  );
};

const DetailsStack = ({
  selectedId,
  ...rest
}: {
  selectedId: string;
  layout: 'side' | 'below';
  onQuickLook: () => void;
  onLaunch: (tool: Tool) => void;
}) => (
  <div className={STACK}>
    {tools.map((tool) => {
      const on = tool.id === selectedId;
      return (
        <div key={tool.id} inert={!on} className={cn(CROSSFADE, on ? SHOWN : HIDDEN)}>
          <Details tool={tool} {...rest} />
        </div>
      );
    })}
  </div>
);

const ViewPane = ({
  active,
  view,
  className,
  children,
}: {
  active: boolean;
  view?: View;
  className?: string;
  children: ReactNode;
}) => (
  <motion.div
    data-view={view}
    inert={!active}
    initial={false}
    animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
    transition={active ? VIEW_IN : { duration: 0 }}
    className={cn('relative', !active && 'invisible', className)}
  >
    {children}
  </motion.div>
);

const EmptyNote = ({ show, label }: { show: boolean; label: string }) => (
  <AnimatePresence initial={false}>
    {show ? (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        className='pointer-events-none absolute inset-0 grid place-items-center text-[13px] text-neutral-400'
      >
        {label}
      </motion.p>
    ) : null}
  </AnimatePresence>
);

const QuickLook = ({
  tool,
  getSource,
  onClosed,
}: {
  tool: Tool;
  getSource: () => HTMLElement | null;
  onClosed: () => void;
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const originRef = useRef<{ transformOrigin: string; scale: number } | null>(null);

  useLayoutEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const backdrop = backdropRef.current;
    const card = cardRef.current;
    if (!backdrop || !card || prefersReducedMotion()) return;

    const source = getSource();
    const cardRect = card.getBoundingClientRect();
    const sourceRect = source?.getBoundingClientRect();
    if (sourceRect && sourceRect.width > 0 && cardRect.width > 0) {
      const x = sourceRect.left + sourceRect.width / 2 - cardRect.left;
      const y = sourceRect.top + sourceRect.height / 2 - cardRect.top;
      originRef.current = {
        transformOrigin: `${x}px ${y}px`,
        scale: Math.min(0.6, Math.max(0.08, sourceRect.width / cardRect.width)),
      };
    }
    const from = originRef.current ?? { transformOrigin: '50% 50%', scale: 0.94 };

    const tl = gsap
      .timeline()
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power1.out' }, 0)
      .fromTo(
        card,
        { opacity: 0, scale: from.scale, transformOrigin: from.transformOrigin },
        { opacity: 1, scale: 1, duration: 0.38, ease: 'expo.out' },
        0,
      );
    return () => {
      tl.kill();
      gsap.killTweensOf([backdrop, card]);
    };
    // Measured once on open: the source cannot move while the dialog is modal.
  }, []);

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const backdrop = backdropRef.current;
    const card = cardRef.current;
    if (!backdrop || !card || prefersReducedMotion()) {
      onClosed();
      return;
    }
    const to = originRef.current ?? { transformOrigin: '50% 50%', scale: 0.94 };
    gsap.to(backdrop, { opacity: 0, duration: 0.2, ease: 'power1.in', overwrite: true });
    gsap.to(card, {
      opacity: 0,
      scale: to.scale,
      transformOrigin: to.transformOrigin,
      duration: 0.24,
      ease: 'power3.in',
      overwrite: true,
      onComplete: onClosed,
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) requestClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = Array.from(cardRef.current?.querySelectorAll<HTMLElement>('a[href], button') ?? []);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    const current = document.activeElement;
    const outside = !cardRef.current?.contains(current);
    if (event.shiftKey && (current === first || outside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === last || outside)) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      className='absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/10 p-4 backdrop-blur-[3px] sm:p-10'
    >
      <div
        ref={cardRef}
        role='dialog'
        aria-modal='true'
        aria-label={`Quick Look: ${tool.name}`}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => {
          if (event.key === ' ') event.preventDefault();
        }}
        className='w-full max-w-[40rem] overflow-hidden rounded-2xl bg-white shadow-[0_0_0_0.5px_rgba(0,0,0,0.12),0_30px_70px_-20px_rgba(0,0,0,0.45)] will-change-transform'
      >
        <div className={cn('grid h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b px-2', HAIRLINE)}>
          <button
            ref={closeRef}
            type='button'
            aria-label='Close Quick Look'
            onClick={requestClose}
            className={cn(
              'grid size-8 place-items-center rounded-full text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900 max-md:size-10 pointer-coarse:size-10',
              PRESSABLE,
              FOCUS_RING,
            )}
          >
            <X aria-hidden='true' strokeWidth={2} className='size-4' />
          </button>
          <div className='min-w-0 text-center leading-tight'>
            <p className='truncate text-[13px] font-semibold text-neutral-900'>{tool.name}</p>
            <p title={tool.domain} className='truncate text-[11px] text-neutral-500'>
              {tool.domain}
            </p>
          </div>
          <a
            href={toolUrl(tool)}
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
              'inline-flex h-8 items-center rounded-md bg-[#0a84ff] px-3 text-xs font-medium text-white hover:brightness-110 max-md:h-10 pointer-coarse:h-10',
              PRESSABLE,
              FOCUS_RING,
            )}
          >
            Open<span className='sr-only'> {tool.name} in a new tab</span>
          </a>
        </div>
        <img
          src={ogSrc(tool)}
          alt={tool.name}
          width={1200}
          height={630}
          decoding='async'
          draggable={false}
          className='block aspect-[1200/630] h-auto w-full bg-neutral-100'
        />
      </div>
    </div>
  );
};

export const ToolsFinder = () => {
  const containerRef = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const galleryOgRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<string, HTMLDivElement>());
  const pointerTypeRef = useRef('mouse');
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const ghostKeyRef = useRef(0);

  const baseId = useId();
  const [view, setView] = useState<View>('icons');
  const [tag, setTag] = useState<TagId | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(tools[0]?.id ?? '');
  const [quickLook, setQuickLook] = useState(false);
  const [ghost, setGhost] = useState<Ghost | null>(null);

  const visible = filterTools(tag, query);
  const selected = visible.find((tool) => tool.id === selectedId) ?? visible[0];
  const selectedKey = selected?.id ?? '';
  const isEmpty = visible.length === 0;

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      '(prefers-reduced-motion: no-preference)',
      (context) => {
        gsap.set('.finder-window', { opacity: 0, y: 30, scale: 0.92, filter: 'blur(8px)', transformOrigin: '50% 40%' });
        gsap.set('.finder-pop', { opacity: 0, scale: 0.85 });

        let started = false;
        const start = () => {
          if (started) return;
          started = true;
          context.add(() => {
            gsap
              .timeline({ scrollTrigger: { trigger: windowRef.current, start: 'top 80%', once: true } })
              .to('.finder-window', {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 0.9,
                ease: 'expo.out',
                clearProps: 'opacity,transform,filter',
              })
              .to(
                '.finder-pop',
                { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)', stagger: 0.045, clearProps: 'opacity,transform' },
                0.3,
              );
          });
        };

        window.addEventListener('app-ready', start);
        const fallback = window.setTimeout(start, 2200);
        if (document.documentElement.dataset.appReady === 'true') start();

        return () => {
          window.clearTimeout(fallback);
          window.removeEventListener('app-ready', start);
        };
      },
      containerRef,
    );

    return () => mm.revert();
  }, []);

  useEffect(() => {
    if (quickLook) return;
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  }, [quickLook]);

  const optionKey = (v: View, id: string) => `${v}:${id}`;

  const launchIcon = (tool: Tool) =>
    windowRef.current?.querySelector<HTMLElement>(`[data-view='${view}'] [data-launch-icon='${tool.id}']`) ?? null;

  const playLaunch = (tool: Tool) => {
    const win = windowRef.current;
    const icon = launchIcon(tool);
    if (!win || !icon || prefersReducedMotion()) return;
    const winRect = win.getBoundingClientRect();
    const rect = icon.getBoundingClientRect();
    if (rect.width === 0) return;
    ghostKeyRef.current += 1;
    setGhost({
      key: ghostKeyRef.current,
      src: iconSrc(tool),
      left: rect.left - winRect.left - win.clientLeft,
      top: rect.top - winRect.top - win.clientTop,
      size: rect.width,
    });
    const lift = Math.max(3, rect.height * 0.16);
    gsap
      .timeline({ onComplete: () => gsap.set(icon, { clearProps: 'transform' }) })
      .to(icon, { y: -lift, duration: 0.16, ease: 'power2.out', overwrite: true })
      .to(icon, { y: 0, duration: 0.5, ease: 'bounce.out' });
  };

  const launchTool = (tool: Tool) => {
    const url = toolUrl(tool);
    window.open(url, '_blank', 'noopener,noreferrer');
    track('cta_clicked', { action: 'open_tool', destination: url, label: tool.name, location: 'tools', page: 'home' });
    playLaunch(tool);
  };

  const applyFilter = (nextTag: TagId | null, nextQuery: string) => {
    setTag(nextTag);
    setQuery(nextQuery);
    const next = filterTools(nextTag, nextQuery);
    const first = next[0];
    if (first && !next.some((tool) => tool.id === selectedId)) setSelectedId(first.id);
  };

  const quickLookSource = () =>
    view === 'gallery' ? galleryOgRef.current : selected ? launchIcon(selected) : null;

  const openQuickLook = () => {
    if (!selected || quickLook) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuickLook(true);
  };

  const focusOption = (v: View, tool: Tool) => {
    setSelectedId(tool.id);
    optionRefs.current.get(optionKey(v, tool.id))?.focus();
  };

  const columnCount = () => {
    const firstTool = visible[0];
    const first = firstTool ? optionRefs.current.get(optionKey('icons', firstTool.id)) : undefined;
    if (!first) return 1;
    let count = 0;
    for (const tool of visible) {
      if (optionRefs.current.get(optionKey('icons', tool.id))?.offsetTop !== first.offsetTop) break;
      count += 1;
    }
    return Math.max(1, count);
  };

  const handleListKeyDown = (v: View) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selected || event.altKey || event.ctrlKey || event.metaKey) return;
    const last = visible.length - 1;
    const index = visible.findIndex((tool) => tool.id === selected.id);
    const horizontal = v !== 'list';
    const vertical = v !== 'gallery';
    let next = index;

    switch (event.key) {
      case 'ArrowRight':
        if (!horizontal) return;
        next = Math.min(last, index + 1);
        break;
      case 'ArrowLeft':
        if (!horizontal) return;
        next = Math.max(0, index - 1);
        break;
      case 'ArrowDown':
      case 'ArrowUp': {
        if (!vertical) return;
        const step = v === 'icons' ? columnCount() : 1;
        if (event.key === 'ArrowUp') {
          next = index - step >= 0 ? index - step : index;
        } else if (index + step <= last) {
          next = index + step;
        } else if (Math.floor(index / step) < Math.floor(last / step)) {
          next = last;
        }
        break;
      }
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      case 'Enter':
        event.preventDefault();
        if (!event.repeat) launchTool(selected);
        return;
      case ' ':
        event.preventDefault();
        if (!event.repeat) openQuickLook();
        return;
      default: {
        if (event.key.length !== 1 || !/\S/.test(event.key)) return;
        const letter = event.key.toLowerCase();
        const ordered = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
        const hit = ordered.find((tool) => tool.name.toLowerCase().startsWith(letter));
        if (!hit) return;
        next = visible.indexOf(hit);
      }
    }

    event.preventDefault();
    const target = visible[next];
    if (target) focusOption(v, target);
  };

  const listboxProps = (v: View) => ({
    role: 'listbox' as const,
    'aria-label': 'Tools',
    onKeyDown: handleListKeyDown(v),
    onPointerDown: (event: { pointerType: string }) => {
      pointerTypeRef.current = event.pointerType;
    },
  });

  const optionProps = (v: View, tool: Tool) => {
    const isSelected = tool.id === selected?.id;
    return {
      id: `${baseId}-${v}-${tool.id}`,
      role: 'option' as const,
      'aria-selected': isSelected,
      tabIndex: isSelected ? 0 : -1,
      ref: (el: HTMLDivElement | null) => {
        if (el) optionRefs.current.set(optionKey(v, tool.id), el);
        else optionRefs.current.delete(optionKey(v, tool.id));
      },
      onClick: () => setSelectedId(tool.id),
      onDoubleClick: () => {
        if (pointerTypeRef.current !== 'touch') launchTool(tool);
      },
    };
  };

  const iconView = (
    <div
      {...listboxProps('icons')}
      className='relative grid grid-cols-3 content-start gap-x-1 gap-y-2 p-3 sm:grid-cols-[repeat(auto-fill,6.5rem)] sm:gap-x-2 sm:p-4'
    >
      <AnimatePresence mode='popLayout' initial={false}>
        {visible.map((tool) => {
          const on = tool.id === selected?.id;
          return (
            <motion.div
              key={tool.id}
              {...optionProps('icons', tool)}
              layout
              variants={ITEM_VARIANTS}
              initial='hidden'
              animate='shown'
              exit='hidden'
              whileTap='press'
              transition={ITEM_TRANSITION}
              className={cn(
                'group/option flex min-w-0 cursor-default touch-manipulation select-none justify-center rounded-lg py-1',
                FOCUS_RING,
              )}
            >
              <span className='finder-pop flex min-w-0 max-w-full flex-col items-center gap-1'>
                <span className='relative grid size-[76px] place-items-center rounded-[14px] transition-colors duration-150 group-hover/option:bg-black/[0.035]'>
                  {on ? (
                    <motion.span
                      layoutId='icon-selection'
                      transition={SPRING}
                      className='absolute inset-0 rounded-[14px] bg-black/[0.07]'
                    />
                  ) : null}
                  <span data-launch-icon={tool.id} className='relative block'>
                    <motion.img
                      variants={ICON_PRESS}
                      src={iconSrc(tool)}
                      alt=''
                      width={256}
                      height={256}
                      decoding='async'
                      draggable={false}
                      className='block size-16 rounded-[22%] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_6px_14px_-6px_rgba(0,0,0,0.3)]'
                    />
                  </span>
                </span>
                <span
                  title={tool.name}
                  className={cn(
                    'max-w-full truncate rounded-[5px] px-1.5 py-px text-[13px] leading-tight transition-colors duration-150',
                    on ? 'bg-[#0a84ff] text-white' : 'text-neutral-800',
                  )}
                >
                  {tool.name}
                </span>
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const listView = (
    <div className='flex h-full min-w-0 flex-col'>
      <div
        aria-hidden='true'
        className={cn('grid shrink-0 gap-3 border-b px-5 py-1.5 text-[11px] font-medium text-neutral-500', HAIRLINE, LIST_COLUMNS)}
      >
        <span>Name</span>
        <span className={cn('hidden sm:block', COLUMN_DIVIDER)}>Kind</span>
        <span className={COLUMN_DIVIDER}>Where</span>
      </div>
      <div
        {...listboxProps('list')}
        aria-orientation='vertical'
        className={cn('relative flex-1 px-2 pb-2 pt-1', LIST_STRIPES)}
      >
        <AnimatePresence mode='popLayout' initial={false}>
          {visible.map((tool) => {
            const on = tool.id === selected?.id;
            const muted = cn('truncate transition-colors duration-150', on ? 'text-white/85' : 'text-neutral-500');
            return (
              <motion.div
                key={tool.id}
                {...optionProps('list', tool)}
                layout
                variants={ROW_VARIANTS}
                initial='hidden'
                animate='shown'
                exit='hidden'
                transition={ITEM_TRANSITION}
                className={cn(
                  'relative grid cursor-default touch-manipulation select-none items-center gap-3 rounded-md px-3 text-[13px] transition-colors duration-150',
                  ROW_HEIGHT,
                  FOCUS_RING,
                  LIST_COLUMNS,
                  on ? 'text-white' : 'text-neutral-800 hover:bg-black/[0.035]',
                )}
              >
                {on ? (
                  <motion.span layoutId='list-selection' transition={SPRING} className='absolute inset-0 rounded-md bg-[#0a84ff]' />
                ) : null}
                <span className='relative flex min-w-0 items-center gap-2'>
                  <span data-launch-icon={tool.id} className='block shrink-0'>
                    <img
                      src={iconSrc(tool)}
                      alt=''
                      width={256}
                      height={256}
                      decoding='async'
                      draggable={false}
                      className='block size-4 rounded-[22%]'
                    />
                  </span>
                  <span className='truncate'>{tool.name}</span>
                </span>
                <span className={cn('relative hidden sm:block', muted)}>{kindOf(tool)}</span>
                <span title={tool.domain} className={cn('relative', muted)}>
                  {tool.domain}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );

  const galleryStrip = (
    <motion.div
      {...listboxProps('gallery')}
      layoutScroll
      aria-orientation='horizontal'
      className='relative flex max-w-full gap-0.5 overflow-x-auto p-1.5 sm:gap-1'
    >
      <AnimatePresence mode='popLayout' initial={false}>
        {visible.map((tool) => {
          const on = tool.id === selected?.id;
          return (
            <motion.div
              key={tool.id}
              {...optionProps('gallery', tool)}
              layout
              variants={ITEM_VARIANTS}
              initial='hidden'
              animate='shown'
              exit='hidden'
              whileTap='press'
              transition={ITEM_TRANSITION}
              aria-label={tool.name}
              title={tool.name}
              className={cn(
                'relative shrink-0 cursor-default touch-manipulation select-none rounded-[10px] p-1 transition-colors duration-150',
                FOCUS_RING,
                !on && 'hover:bg-black/[0.035]',
              )}
            >
              {on ? (
                <motion.span
                  layoutId='strip-selection'
                  transition={SPRING}
                  className='absolute inset-0 rounded-[10px] bg-black/[0.07] shadow-[inset_0_0_0_1.5px_#0a84ff]'
                />
              ) : null}
              <span data-launch-icon={tool.id} className='relative block'>
                <motion.img
                  variants={ICON_PRESS}
                  src={iconSrc(tool)}
                  alt=''
                  width={256}
                  height={256}
                  decoding='async'
                  draggable={false}
                  className='block size-9 rounded-[22%] sm:size-10'
                />
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );

  const tagsLabelId = `${baseId}-tags`;
  const favoritesLabelId = `${baseId}-favorites`;
  const countLabel = `${visible.length} ${visible.length === 1 ? 'item' : 'items'}`;

  return (
    <section
      id='tools'
      ref={containerRef}
      aria-labelledby='tools-title'
      className='relative z-10 scroll-mt-24 bg-[#fafafa] px-6 pb-24 md:scroll-mt-32 md:pb-32'
    >
      <div className='landing-shell'>
        <div className='mb-12 flex items-end justify-between gap-6 md:mb-16'>
          <h2
            id='tools-title'
            className='text-[clamp(2.5rem,5vw,4.75rem)] font-bold leading-[0.9] tracking-tighter text-neutral-900'
          >
            Tools I
            <span className='mt-2 block font-serif font-normal italic text-amber-600 md:mt-0 md:inline md:pl-4'>
              Built.
            </span>
          </h2>
          <a
            href='/tools'
            aria-label='See all tools'
            className='group mb-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fafafa]'
          >
            <GlassPill label='All tools'>
              <PillArrow />
            </GlassPill>
          </a>
        </div>

        <MotionConfig reducedMotion='user'>
          <LayoutGroup id={baseId}>
            <div
              ref={windowRef}
              role='region'
              aria-label='Tools window'
              className='finder-window relative flex overflow-hidden rounded-2xl border border-black/10 bg-white font-sans text-neutral-900 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_30px_80px_-30px_rgba(0,0,0,0.35)]'
            >
              <div inert={quickLook} className='flex min-w-0 flex-1'>
                <aside
                  aria-label='Sidebar'
                  className={cn('hidden w-[180px] shrink-0 flex-col border-r bg-neutral-50/80 md:flex', HAIRLINE)}
                >
                  <div className='flex h-[52px] shrink-0 items-center px-4'>
                    <TrafficLights />
                  </div>
                  <div className='flex flex-col gap-4 px-2 pb-4 pt-2'>
                    <div role='group' aria-labelledby={favoritesLabelId}>
                      <p id={favoritesLabelId} className='mb-1 px-2 text-[11px] font-semibold text-neutral-400'>
                        Favorites
                      </p>
                      <SidebarItem active={tag === null} onClick={() => applyFilter(null, query)}>
                        <Folder aria-hidden='true' strokeWidth={1.75} className='size-4 shrink-0 text-[#0a84ff]' />
                        All Tools
                      </SidebarItem>
                    </div>
                    <div role='group' aria-labelledby={tagsLabelId}>
                      <p id={tagsLabelId} className='mb-1 px-2 text-[11px] font-semibold text-neutral-400'>
                        Tags
                      </p>
                      <div className='flex flex-col gap-px'>
                        {TAGS.map((entry) => (
                          <SidebarItem
                            key={entry.id}
                            active={tag === entry.id}
                            onClick={() => applyFilter(tag === entry.id ? null : entry.id, query)}
                          >
                            <span
                              aria-hidden='true'
                              className={cn(
                                'mx-[3px] size-2.5 shrink-0 rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]',
                                entry.dot,
                              )}
                            />
                            <span className='truncate'>{entry.label}</span>
                          </SidebarItem>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>

                <div className='flex min-w-0 flex-1 flex-col'>
                  <div className={cn('flex h-[52px] shrink-0 items-center gap-3 border-b px-3 sm:px-4', HAIRLINE)}>
                    <TrafficLights className='mr-1 md:hidden' />
                    <div aria-hidden='true' className='hidden items-center text-neutral-300 sm:flex'>
                      <ChevronLeft strokeWidth={2} className='size-5' />
                      <ChevronRight strokeWidth={2} className='size-5' />
                    </div>
                    <p className='min-w-0 truncate text-[13px] font-semibold text-neutral-800'>Tools</p>
                    <div className='ml-auto flex items-center gap-2'>
                      <ViewSwitch view={view} onChange={setView} />
                      <SearchField
                        value={query}
                        onChange={(value) => applyFilter(tag, value)}
                        onArrowDown={() => {
                          if (selected) optionRefs.current.get(optionKey(view, selected.id))?.focus();
                        }}
                      />
                    </div>
                  </div>

                  <div className={cn(STACK, 'flex-1')}>
                    <ViewPane active={view !== 'gallery'} className='flex flex-col md:flex-row'>
                      <div className={cn(STACK, 'flex-1')}>
                        <ViewPane view='icons' active={view === 'icons'}>
                          {iconView}
                          <EmptyNote show={isEmpty} label='No items' />
                        </ViewPane>
                        <ViewPane view='list' active={view === 'list'}>
                          {listView}
                          <EmptyNote show={isEmpty} label='No items' />
                        </ViewPane>
                      </div>
                      <div
                        role='region'
                        aria-label='Preview'
                        className={cn(
                          'relative border-t p-4 sm:p-6 md:w-[42%] md:shrink-0 md:border-l md:border-t-0',
                          HAIRLINE,
                        )}
                      >
                        <div className={cn('flex flex-col gap-4', CROSSFADE, selected ? SHOWN : HIDDEN)}>
                          <OgStack selectedId={selectedKey} />
                          <DetailsStack
                            selectedId={selectedKey}
                            layout='side'
                            onQuickLook={openQuickLook}
                            onLaunch={playLaunch}
                          />
                        </div>
                        <EmptyNote show={!selected} label='No selection' />
                      </div>
                    </ViewPane>

                    <ViewPane view='gallery' active={view === 'gallery'}>
                      <div
                        className={cn(
                          'mx-auto flex h-full max-w-[44rem] flex-col items-center gap-4 p-4 sm:p-6 md:justify-center',
                          CROSSFADE,
                          selected ? SHOWN : HIDDEN,
                        )}
                      >
                        <OgStack ref={galleryOgRef} selectedId={selectedKey} className='w-full max-w-[30rem]' />
                        {galleryStrip}
                        <div className='w-full'>
                          <DetailsStack
                            selectedId={selectedKey}
                            layout='below'
                            onQuickLook={openQuickLook}
                            onLaunch={playLaunch}
                          />
                        </div>
                      </div>
                      <EmptyNote show={isEmpty} label='No items' />
                    </ViewPane>
                  </div>

                  <div
                    className={cn(
                      'flex h-7 shrink-0 items-center justify-between gap-4 border-t bg-neutral-50/60 px-4 text-[11px] text-neutral-500',
                      HAIRLINE,
                    )}
                  >
                    <span aria-hidden='true' className='flex items-center gap-1'>
                      <RollingCount value={visible.length} />
                      {visible.length === 1 ? 'item' : 'items'}
                    </span>
                    <span role='status' className='sr-only'>
                      {countLabel}
                    </span>
                    <span aria-hidden='true' className='hidden md:block pointer-coarse:hidden'>
                      Double-click to open · Space for Quick Look
                    </span>
                  </div>
                </div>
              </div>

              {ghost ? (
                <motion.img
                  key={ghost.key}
                  src={ghost.src}
                  alt=''
                  aria-hidden='true'
                  width={256}
                  height={256}
                  draggable={false}
                  initial={{ opacity: 0.9, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ duration: 0.45, ease: [0.2, 0.7, 0.3, 1] }}
                  onAnimationComplete={() => setGhost((current) => (current?.key === ghost.key ? null : current))}
                  style={{ left: ghost.left, top: ghost.top, width: ghost.size, height: ghost.size }}
                  className='pointer-events-none absolute z-30 rounded-[22%]'
                />
              ) : null}

              {quickLook && selected ? (
                <QuickLook tool={selected} getSource={quickLookSource} onClosed={() => setQuickLook(false)} />
              ) : null}
            </div>
          </LayoutGroup>
        </MotionConfig>

        <ul aria-label='All tools' className='sr-only'>
          {tools.map((tool) => (
            <li key={tool.id}>
              <p>{tool.name}</p>
              <a href={toolUrl(tool)} tabIndex={-1}>
                {tool.domain}
              </a>
              <a href={repoUrl(tool)} tabIndex={-1}>
                github.com/{tool.repo}
              </a>
              <p>{tool.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
