import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Branch {
  id: string;
  label: string;
  slug: string;
  colorVar: string;
  side: 'left' | 'right';
  x: number; y: number; w: number; h: number;
  children: string[];
}

const BRANCHES: Branch[] = [
  {
    id: 'oop', label: 'OOP Fundamentals', slug: 'oop-fundamentals', colorVar: 'accent-cyan',
    side: 'left', x: 15, y: 75, w: 195, h: 157,
    children: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism', 'Composition'],
  },
  {
    id: 'solid', label: 'SOLID Principles', slug: 'solid-principles', colorVar: 'accent-purple',
    side: 'left', x: 15, y: 368, w: 195, h: 157,
    children: ['SRP', 'OCP', 'LSP', 'ISP', 'DIP'],
  },
  {
    id: 'creational', label: 'Creational Patterns', slug: 'creational-patterns', colorVar: 'accent-orange',
    side: 'right', x: 475, y: 28, w: 228, h: 117,
    children: ['Singleton', 'Factory Method', 'Builder'],
  },
  {
    id: 'structural', label: 'Structural Patterns', slug: 'structural-patterns', colorVar: 'accent-green',
    side: 'right', x: 475, y: 165, w: 228, h: 157,
    children: ['Adapter', 'Decorator', 'Proxy', 'Facade', 'Composite'],
  },
  {
    id: 'behavioral', label: 'Behavioral Patterns', slug: 'behavioral-patterns', colorVar: 'accent-blue',
    side: 'right', x: 475, y: 342, w: 228, h: 157,
    children: ['Observer', 'Strategy', 'Command', 'Mediator / State', '+ 4 more'],
  },
  {
    id: 'application', label: 'Application Patterns', slug: 'application-patterns', colorVar: 'accent-yellow',
    side: 'right', x: 475, y: 519, w: 228, h: 157,
    children: ['Repository', 'Module', 'MVC / MVVM', 'Pub / Sub', 'Dependency Injection'],
  },
];

const ROOT = { x: 265, y: 293, w: 160, h: 50 };
const ROOT_CX = ROOT.x + ROOT.w / 2;
const ROOT_CY = ROOT.y + ROOT.h / 2;

function connPath(b: Branch): string {
  const bcy = b.y + b.h / 2;
  if (b.side === 'left') {
    const sx = ROOT.x;
    const ex = b.x + b.w;
    return `M ${sx} ${ROOT_CY} C ${sx - 28} ${ROOT_CY} ${ex + 22} ${bcy} ${ex} ${bcy}`;
  } else {
    const sx = ROOT.x + ROOT.w;
    const ex = b.x;
    return `M ${sx} ${ROOT_CY} C ${sx + 28} ${ROOT_CY} ${ex - 22} ${bcy} ${ex} ${bcy}`;
  }
}

// Learning order: OOP → SOLID → Creational → Structural → Behavioral → Application
const ORDER: Record<string, number> = {
  oop: 1, solid: 2, creational: 3, structural: 4, behavioral: 5, application: 6,
};

export function DesignPatternMindMap({ basePath }: { basePath: string }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full overflow-x-auto py-4">
      <svg
        viewBox="0 0 760 696"
        style={{ width: '100%', minWidth: 560, maxHeight: 640 }}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Design Patterns learning mind map"
      >
        <defs>
          {/* Clip header tint to card rounded rect */}
          {BRANCHES.map(b => (
            <clipPath key={b.id} id={`hdr-${b.id}`}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} />
            </clipPath>
          ))}
          {/* Root gradient */}
          <linearGradient id="rootGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Section hint labels */}
        <text x={112} y={55} textAnchor="middle" dominantBaseline="central"
          fill="var(--color-text-muted)" fontSize={9} style={{ fontStyle: 'italic' }}>
          Foundation
        </text>
        <text x={589} y={8} textAnchor="middle" dominantBaseline="central"
          fill="var(--color-text-muted)" fontSize={9} style={{ fontStyle: 'italic' }}>
          Gang of Four
        </text>
        <text x={589} y={499} textAnchor="middle" dominantBaseline="central"
          fill="var(--color-text-muted)" fontSize={9} style={{ fontStyle: 'italic' }}>
          Real-World
        </text>

        {/* Connection curves */}
        {BRANCHES.map(b => (
          <path
            key={b.id}
            d={connPath(b)}
            fill="none"
            stroke={`var(--color-${b.colorVar})`}
            strokeWidth={hovered === b.id ? 2 : 1.5}
            strokeOpacity={hovered === b.id ? 0.7 : 0.3}
            strokeLinecap="round"
          />
        ))}

        {/* Root node */}
        <g>
          <rect
            x={ROOT.x} y={ROOT.y} width={ROOT.w} height={ROOT.h} rx={10}
            fill="var(--color-bg-card)"
            stroke="var(--color-accent-cyan)" strokeWidth={1.5}
          />
          <rect
            x={ROOT.x} y={ROOT.y} width={ROOT.w} height={ROOT.h} rx={10}
            fill="url(#rootGrad)"
          />
          <text
            x={ROOT_CX} y={ROOT_CY}
            textAnchor="middle" dominantBaseline="central"
            fill="var(--color-accent-cyan)" fontSize={13} fontWeight="700"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Design Patterns
          </text>
        </g>

        {/* Branch nodes */}
        {BRANCHES.map(b => {
          const isHovered = hovered === b.id;
          const c = `var(--color-${b.colorVar})`;
          const tx = b.x + 22;
          const order = ORDER[b.id];

          return (
            <g
              key={b.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`${basePath}/path/${b.slug}`)}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Card background */}
              <rect
                x={b.x} y={b.y} width={b.w} height={b.h} rx={8}
                fill="var(--color-bg-card)"
                stroke={c}
                strokeWidth={isHovered ? 1.5 : 1}
              />

              {/* Header tint (clipped to card shape) */}
              <rect
                x={b.x} y={b.y} width={b.w} height={38}
                fill={c}
                fillOpacity={isHovered ? 0.2 : 0.12}
                clipPath={`url(#hdr-${b.id})`}
              />

              {/* Left accent bar */}
              <rect
                x={b.x} y={b.y + 8} width={3} height={b.h - 16} rx={2}
                fill={c} opacity={0.9}
              />

              {/* Step number badge */}
              <circle cx={b.x + b.w - 16} cy={b.y + 20} r={9}
                fill="var(--color-bg-tertiary)" stroke={c} strokeWidth={1} />
              <text
                x={b.x + b.w - 16} y={b.y + 20}
                textAnchor="middle" dominantBaseline="central"
                fill={c} fontSize={9} fontWeight="700"
              >
                {order}
              </text>

              {/* Branch title */}
              <text
                x={tx} y={b.y + 20}
                dominantBaseline="central" textAnchor="start"
                fill={c} fontSize={11.5} fontWeight="700"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {b.label}
              </text>

              {/* Divider */}
              <line
                x1={b.x + 10} y1={b.y + 38}
                x2={b.x + b.w - 10} y2={b.y + 38}
                stroke={c} strokeOpacity={0.2} strokeWidth={1}
              />

              {/* Children */}
              {b.children.map((child, i) => (
                <text
                  key={child}
                  x={tx - 4} y={b.y + 52 + i * 21}
                  dominantBaseline="central" textAnchor="start"
                  fill="var(--color-text-secondary)" fontSize={10}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  • {child}
                </text>
              ))}

              {/* Hover arrow indicator */}
              {isHovered && (
                <text
                  x={b.x + b.w - 30} y={b.y + b.h - 14}
                  textAnchor="middle" dominantBaseline="central"
                  fill={c} fontSize={9} opacity={0.6}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  click to open →
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <p className="text-center text-[11px] text-text-muted mt-1">
        Click any card to open the learning path · Follow the numbers 1–6 for the recommended order
      </p>
    </div>
  );
}
