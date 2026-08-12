/**
 * Illustration « Carte de l'Afrique » stylisée : silhouette géographique,
 * réseaux interconnectés et flux de données. 100 % SVG, sans image externe.
 */

const NODES: Array<{ x: number; y: number; label: string }> = [
  { x: 188, y: 152, label: 'Dakar' },
  { x: 210, y: 118, label: 'Nouakchott' },
  { x: 226, y: 168, label: 'Ouagadougou' },
  { x: 244, y: 180, label: 'Niamey' },
  { x: 262, y: 148, label: 'Tombouctou' },
  { x: 300, y: 176, label: "N'Djamena" },
  { x: 218, y: 200, label: 'Abidjan' },
  { x: 246, y: 212, label: 'Lagos' },
  { x: 282, y: 220, label: 'Douala' },
  { x: 308, y: 246, label: 'Kinshasa' },
  { x: 336, y: 216, label: 'Khartoum' },
  { x: 284, y: 262, label: 'Luanda' },
  { x: 342, y: 300, label: 'Nairobi' },
  { x: 352, y: 380, label: 'Johannesburg' },
]

const LINKS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
  [2, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [5, 11],
  [9, 12],
  [11, 12],
  [12, 13],
  [3, 10],
  [10, 12],
]

function AfricaPath() {
  return (
    <path
      d="M148 92 Q160 70 190 68 Q215 66 238 82 Q252 90 258 108 L282 116 Q292 128 288 142 Q300 152 306 170 L318 186 Q314 200 306 212 Q296 232 292 250 Q290 268 292 286 Q292 308 288 326 Q280 342 268 352 Q256 360 244 356 Q230 350 226 336 Q222 318 220 300 Q216 280 212 262 Q208 244 200 232 Q214 224 220 210 Q226 196 218 186 Q206 174 196 162 Q180 150 160 148 Q142 150 132 138 Q122 124 132 110 Q138 98 148 92 Z"
      fill="rgba(15,168,100,0.05)"
      stroke="rgba(15,168,100,0.45)"
      strokeWidth="1.4"
    />
  )
}

export default function AfricaNetwork() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-night-800/80">
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <div className="scanline absolute inset-0" aria-hidden="true" />

      <svg
        viewBox="0 0 440 430"
        className="relative w-full"
        role="img"
        aria-label="Carte stylisée de l’Afrique avec réseau de données cyber"
      >
        <defs>
          <radialGradient id="hube" cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor="rgba(15,168,100,0.16)" />
            <stop offset="100%" stopColor="rgba(15,168,100,0)" />
          </radialGradient>
        </defs>

        {/* Halo réseautique */}
        <ellipse cx="240" cy="200" rx="190" ry="200" fill="url(#hube)" />

        {/* Carte Afrique */}
        <AfricaPath />

        {/* Bouclier central façon "sécurité" */}
        <g transform="translate(60 120)" opacity="0.9">
          <path
            d="M40 4 L70 14 v26 c0 24-14 40-30 50 C24 80 10 64 10 40 V14 Z"
            fill="rgba(4,10,20,0.7)"
            stroke="rgba(15,168,100,0.8)"
            strokeWidth="1.6"
          />
          <path
            d="M40 18 L58 24 v18 c0 16-9 28-18 35 C31 70 22 58 22 42 V24 Z"
            fill="none"
            stroke="rgba(15,168,100,0.35)"
            strokeWidth="1"
          />
          <path d="M33 40 h14 M33 46 h14 M33 52 h9" stroke="rgba(15,168,100,0.9)" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Liens de données (animés) */}
        {LINKS.map(([a, b], i) => {
          const na = NODES[a]
          const nb = NODES[b]
          return (
            <line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke="rgba(15,168,100,0.35)"
              strokeWidth="1"
              strokeDasharray="3 5"
              className="animate-dash-flow"
              style={{ animationDelay: `${i * 0.6}s` }}
            />
          )
        })}

        {/* Nœuds */}
        {NODES.map((node, i) => (
          <g key={node.label}>
            <circle
              cx={node.x}
              cy={node.y}
              r="6"
              fill="rgba(4,10,20,0.9)"
              stroke="rgba(15,168,100,0.9)"
              strokeWidth="1.6"
              className="animate-pulse-node"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
            <circle cx={node.x} cy={node.y} r="1.8" fill="#0FA864" />
            <text
              x={node.x + 9}
              y={node.y - 6}
              fill="rgba(237,241,247,0.55)"
              fontSize="8.5"
              fontFamily="ui-monospace, monospace"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Étiquette de service */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-teal/25 bg-night-900/80 px-2.5 py-1.5 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-teal">
          Réseau de veille · Sahel
        </span>
      </div>
    </div>
  )
}