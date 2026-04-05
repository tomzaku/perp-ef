import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MindMapChild {
  label: string;
  slug?: string;
}

interface MindMapBranch {
  id: string;
  label: string;
  icon: string;
  slug?: string;
  colorVar: string;
  side: 'left' | 'right';
  x: number; y: number; w: number; h: number;
  order?: number;
  children: MindMapChild[];
}

interface MindMapConfig {
  viewBox: string;
  rootLabel: string;
  rootIcon: string;
  root: { x: number; y: number; w: number; h: number };
  hint?: string;
  branches: MindMapBranch[];
}

// ─── Design Patterns Config ───────────────────────────────────────────────────

export const DESIGN_PATTERNS_MAP: MindMapConfig = {
  viewBox: '0 0 780 696',
  rootLabel: 'Design Patterns',
  rootIcon: 'DP',
  root: { x: 285, y: 298, w: 168, h: 52 },
  hint: 'Click any card to open the path · Numbers show the recommended learning order',
  branches: [
    {
      id: 'oop', label: 'OOP Fundamentals', icon: 'OO', slug: 'oop-fundamentals',
      colorVar: 'accent-cyan', side: 'left', x: 18, y: 75, w: 212, h: 157, order: 1,
      children: [
        { label: 'Encapsulation' }, { label: 'Abstraction' }, { label: 'Inheritance' },
        { label: 'Polymorphism' }, { label: 'Composition' },
      ],
    },
    {
      id: 'solid', label: 'SOLID Principles', icon: 'SL', slug: 'solid-principles',
      colorVar: 'accent-purple', side: 'left', x: 18, y: 368, w: 212, h: 157, order: 2,
      children: [
        { label: 'Single Responsibility' }, { label: 'Open / Closed' },
        { label: 'Liskov Substitution' }, { label: 'Interface Segregation' },
        { label: 'Dependency Inversion' },
      ],
    },
    {
      id: 'creational', label: 'Creational Patterns', icon: 'CR', slug: 'creational-patterns',
      colorVar: 'accent-orange', side: 'right', x: 498, y: 28, w: 242, h: 117, order: 3,
      children: [
        { label: 'Singleton' }, { label: 'Factory Method' }, { label: 'Builder' },
      ],
    },
    {
      id: 'structural', label: 'Structural Patterns', icon: 'ST', slug: 'structural-patterns',
      colorVar: 'accent-green', side: 'right', x: 498, y: 165, w: 242, h: 157, order: 4,
      children: [
        { label: 'Adapter' }, { label: 'Decorator' }, { label: 'Proxy' },
        { label: 'Facade' }, { label: 'Composite' },
      ],
    },
    {
      id: 'behavioral', label: 'Behavioral Patterns', icon: 'BV', slug: 'behavioral-patterns',
      colorVar: 'accent-blue', side: 'right', x: 498, y: 342, w: 242, h: 157, order: 5,
      children: [
        { label: 'Observer' }, { label: 'Strategy' }, { label: 'Command' },
        { label: 'Mediator / State' }, { label: '+ 4 more' },
      ],
    },
    {
      id: 'application', label: 'Application Patterns', icon: 'AP', slug: 'application-patterns',
      colorVar: 'accent-yellow', side: 'right', x: 498, y: 519, w: 242, h: 157, order: 6,
      children: [
        { label: 'Repository' }, { label: 'Module' }, { label: 'MVC / MVVM' },
        { label: 'Pub / Sub' }, { label: 'Dependency Injection' },
      ],
    },
  ],
};

// ─── Algorithm Config ─────────────────────────────────────────────────────────

export const ALGORITHM_MAP: MindMapConfig = {
  viewBox: '0 0 780 416',
  rootLabel: 'Algorithms',
  rootIcon: 'AL',
  root: { x: 280, y: 178, w: 172, h: 52 },
  hint: 'Click a path name to open it · Numbers show recommended group order',
  branches: [
    {
      id: 'foundation', label: 'Foundation', icon: 'F1',
      colorVar: 'accent-cyan', side: 'left', x: 18, y: 62, w: 210, h: 117, order: 1,
      children: [
        { label: 'Arrays & Hashing', slug: 'arrays-hashing' },
        { label: 'Two Pointers', slug: 'two-pointers' },
        { label: 'Sliding Window', slug: 'sliding-window' },
      ],
    },
    {
      id: 'data-structures', label: 'Core Data Structures', icon: 'DS',
      colorVar: 'accent-purple', side: 'left', x: 18, y: 212, w: 210, h: 137, order: 2,
      children: [
        { label: 'Stack', slug: 'stack' },
        { label: 'Linked List', slug: 'linked-list' },
        { label: 'Trees', slug: 'trees' },
        { label: 'Heap / Priority Queue', slug: 'heap' },
      ],
    },
    {
      id: 'graph-algo', label: 'Graph Algorithms', icon: 'GR',
      colorVar: 'accent-green', side: 'right', x: 498, y: 62, w: 250, h: 117, order: 3,
      children: [
        { label: 'Graphs', slug: 'graphs' },
        { label: 'BFS / DFS Deep Dive', slug: 'bfs-dfs' },
        { label: 'Trie', slug: 'trie' },
      ],
    },
    {
      id: 'advanced', label: 'Advanced Techniques', icon: 'A+',
      colorVar: 'accent-orange', side: 'right', x: 498, y: 212, w: 250, h: 157, order: 4,
      children: [
        { label: 'Binary Search', slug: 'binary-search' },
        { label: 'Greedy', slug: 'greedy' },
        { label: 'Dynamic Programming', slug: 'dynamic-programming' },
        { label: 'Brute Force & Backtracking', slug: 'brute-force' },
        { label: 'Bit Manipulation', slug: 'bit-manipulation' },
      ],
    },
  ],
};

// ─── Backend Config ───────────────────────────────────────────────────────────

export const BACKEND_MAP: MindMapConfig = {
  viewBox: '0 0 780 696',
  rootLabel: 'Backend',
  rootIcon: 'BE',
  root: { x: 295, y: 298, w: 152, h: 52 },
  hint: 'Click any card to open the path · Numbers show the recommended learning order',
  branches: [
    {
      id: 'os', label: 'Operating System', icon: 'OS', slug: 'operating-system',
      colorVar: 'accent-cyan', side: 'left', x: 18, y: 75, w: 212, h: 157, order: 1,
      children: [
        { label: 'Processes & Threads' }, { label: 'Concurrency & Locks' },
        { label: 'Memory Management' }, { label: 'System Calls' }, { label: 'File Systems' },
      ],
    },
    {
      id: 'database', label: 'Database Fundamentals', icon: 'DB', slug: 'database',
      colorVar: 'accent-purple', side: 'left', x: 18, y: 368, w: 212, h: 157, order: 2,
      children: [
        { label: 'SQL & Indexing' }, { label: 'Transactions (ACID)' },
        { label: 'Schema Design' }, { label: 'Query Optimization' }, { label: 'SQL vs NoSQL' },
      ],
    },
    {
      id: 'architecture', label: 'Backend Architecture', icon: 'AR', slug: 'architecture',
      colorVar: 'accent-orange', side: 'right', x: 492, y: 28, w: 242, h: 117, order: 3,
      children: [
        { label: 'HTTP & REST API' }, { label: 'Monolith vs Microservices' },
        { label: 'Message Queues' },
      ],
    },
    {
      id: 'networking', label: 'Networking Fundamentals', icon: 'NT', slug: 'networking',
      colorVar: 'accent-green', side: 'right', x: 492, y: 165, w: 242, h: 157, order: 4,
      children: [
        { label: 'TCP / UDP' }, { label: 'HTTP / HTTPS' }, { label: 'DNS & Load Balancing' },
        { label: 'WebSockets' }, { label: 'gRPC / Protobuf' },
      ],
    },
    {
      id: 'infra', label: 'Infrastructure & DevOps', icon: 'IN', slug: 'infrastructure',
      colorVar: 'accent-blue', side: 'right', x: 492, y: 342, w: 242, h: 157, order: 5,
      children: [
        { label: 'Docker & Containers' }, { label: 'CI / CD Pipelines' },
        { label: 'Logging & Monitoring' }, { label: 'Load Balancers' }, { label: 'Kubernetes' },
      ],
    },
    {
      id: 'security', label: 'Security & Scaling', icon: 'SS', slug: 'security-scaling',
      colorVar: 'accent-yellow', side: 'right', x: 492, y: 519, w: 242, h: 157, order: 6,
      children: [
        { label: 'OWASP Top 10' }, { label: 'Auth (JWT / OAuth)' },
        { label: 'Horizontal Scaling' }, { label: 'Caching Strategies' }, { label: 'Rate Limiting' },
      ],
    },
  ],
};

// ─── Connection path helper ───────────────────────────────────────────────────

function connPath(b: MindMapBranch, root: MindMapConfig['root']): string {
  const rootCY = root.y + root.h / 2;
  const bcy = b.y + b.h / 2;
  if (b.side === 'left') {
    const sx = root.x;
    const ex = b.x + b.w;
    return `M ${sx} ${rootCY} C ${sx - 30} ${rootCY} ${ex + 26} ${bcy} ${ex} ${bcy}`;
  } else {
    const sx = root.x + root.w;
    const ex = b.x;
    return `M ${sx} ${rootCY} C ${sx + 30} ${rootCY} ${ex - 26} ${bcy} ${ex} ${bcy}`;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LearningMindMap({ config, basePath }: { config: MindMapConfig; basePath: string }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredChild, setHoveredChild] = useState<string | null>(null);

  const { root } = config;
  const rootCY = root.y + root.h / 2;

  return (
    <div className="w-full overflow-x-auto py-4">
      <svg
        viewBox={config.viewBox}
        style={{ width: '100%', minWidth: 520, maxHeight: 660 }}
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${config.rootLabel} mind map`}
      >
        <defs>
          {config.branches.map(b => (
            <clipPath key={b.id} id={`hdr-${b.id}`}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={10} />
            </clipPath>
          ))}
          <linearGradient id="rootGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Connection curves */}
        {config.branches.map(b => (
          <path
            key={b.id}
            d={connPath(b, root)}
            fill="none"
            stroke={`var(--color-${b.colorVar})`}
            strokeWidth={hovered === b.id ? 2.5 : 1.8}
            strokeOpacity={hovered === b.id ? 0.8 : 0.35}
            strokeLinecap="round"
          />
        ))}

        {/* Root node */}
        <g>
          <rect x={root.x} y={root.y} width={root.w} height={root.h} rx={12}
            fill="var(--color-bg-card)" stroke="var(--color-accent-cyan)" strokeWidth={2}
          />
          <rect x={root.x} y={root.y} width={root.w} height={root.h} rx={12}
            fill="url(#rootGrad)"
          />
          {/* Icon badge */}
          <circle cx={root.x + 22} cy={rootCY} r={12}
            fill="var(--color-accent-cyan)" fillOpacity={0.18}
            stroke="var(--color-accent-cyan)" strokeWidth={1}
          />
          <text x={root.x + 22} y={rootCY}
            textAnchor="middle" dominantBaseline="central"
            fill="var(--color-accent-cyan)" fontSize={7.5} fontWeight="800"
            style={{ fontFamily: 'var(--font-code)' }}
          >
            {config.rootIcon}
          </text>
          {/* Label */}
          <text x={root.x + 40} y={rootCY}
            textAnchor="start" dominantBaseline="central"
            fill="var(--color-accent-cyan)" fontSize={12} fontWeight="700"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {config.rootLabel}
          </text>
        </g>

        {/* Branch nodes */}
        {config.branches.map(b => {
          const isHovered = hovered === b.id;
          const c = `var(--color-${b.colorVar})`;
          const isCardClickable = Boolean(b.slug);

          return (
            <g
              key={b.id}
              style={{ cursor: isCardClickable ? 'pointer' : 'default' }}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={isCardClickable ? () => navigate(`${basePath}/path/${b.slug}`) : undefined}
            >
              {/* Card background */}
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={10}
                fill="var(--color-bg-card)"
                stroke={c}
                strokeWidth={isHovered && isCardClickable ? 2 : 1}
              />

              {/* Header tint */}
              <rect x={b.x} y={b.y} width={b.w} height={40}
                fill={c}
                fillOpacity={isHovered && isCardClickable ? 0.22 : 0.13}
                clipPath={`url(#hdr-${b.id})`}
              />

              {/* Left accent bar */}
              <rect x={b.x} y={b.y + 9} width={4} height={b.h - 18} rx={2}
                fill={c} opacity={0.9}
              />

              {/* Icon badge */}
              <circle cx={b.x + 21} cy={b.y + 20} r={10}
                fill={c} fillOpacity={0.15} stroke={c} strokeWidth={1}
              />
              <text x={b.x + 21} y={b.y + 20}
                textAnchor="middle" dominantBaseline="central"
                fill={c} fontSize={7.5} fontWeight="800"
                style={{ fontFamily: 'var(--font-code)' }}
              >
                {b.icon}
              </text>

              {/* Step order badge */}
              {b.order !== undefined && (
                <>
                  <circle cx={b.x + b.w - 16} cy={b.y + 20} r={10}
                    fill="var(--color-bg-tertiary)" stroke={c} strokeWidth={1.5}
                  />
                  <text x={b.x + b.w - 16} y={b.y + 20}
                    textAnchor="middle" dominantBaseline="central"
                    fill={c} fontSize={9} fontWeight="700"
                  >
                    {b.order}
                  </text>
                </>
              )}

              {/* Branch title */}
              <text x={b.x + 36} y={b.y + 20}
                dominantBaseline="central" textAnchor="start"
                fill={c} fontSize={11} fontWeight="700"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {b.label}
              </text>

              {/* Divider */}
              <line x1={b.x + 10} y1={b.y + 40} x2={b.x + b.w - 10} y2={b.y + 40}
                stroke={c} strokeOpacity={0.2} strokeWidth={1}
              />

              {/* Children */}
              {b.children.map((child, i) => {
                const childKey = `${b.id}-${i}`;
                const isChildHovered = hoveredChild === childKey;
                const isChildLink = Boolean(child.slug);

                return (
                  <g
                    key={i}
                    style={{ cursor: isChildLink ? 'pointer' : 'default' }}
                    onClick={isChildLink ? (e) => {
                      e.stopPropagation();
                      navigate(`${basePath}/path/${child.slug}`);
                    } : undefined}
                    onMouseEnter={isChildLink ? (e) => { e.stopPropagation(); setHoveredChild(childKey); } : undefined}
                    onMouseLeave={isChildLink ? (e) => { e.stopPropagation(); setHoveredChild(null); } : undefined}
                  >
                    {/* Hover highlight background */}
                    {isChildHovered && (
                      <rect x={b.x + 8} y={b.y + 44 + i * 21} width={b.w - 16} height={18} rx={3}
                        fill={c} fillOpacity={0.1}
                      />
                    )}
                    <text
                      x={b.x + 16} y={b.y + 53 + i * 21}
                      dominantBaseline="central" textAnchor="start"
                      fill={isChildHovered ? c : 'var(--color-text-secondary)'}
                      fontSize={10}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {isChildLink ? '→' : '·'} {child.label}
                    </text>
                  </g>
                );
              })}

              {/* Hover hint */}
              {isHovered && isCardClickable && (
                <text x={b.x + b.w / 2} y={b.y + b.h - 8}
                  textAnchor="middle" dominantBaseline="auto"
                  fill={c} fontSize={8.5} opacity={0.55}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  open →
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {config.hint && (
        <p className="text-center text-[11px] text-text-muted mt-1">
          {config.hint}
        </p>
      )}
    </div>
  );
}
