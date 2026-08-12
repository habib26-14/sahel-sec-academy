/**
 * Illustration « Sahel Cyber Network » :
 * silhouette stylisée de l'Afrique (projection équirectangulaire, villes
 * positionnées géographiquement), bouclier cyber connecté au réseau,
 * liaisons de données animées et HUD Intelligence Center. 100 % SVG.
 */

const NODES: Array<{ x: number; y: number; label: string }> = [
  { x: 51, y: 139, label: 'Dakar' },
  { x: 60, y: 120, label: 'Nouakchott' },
  { x: 105, y: 150, label: 'Bamako' },
  { x: 142, y: 152, label: 'Ouagadougou' },
  { x: 163, y: 146, label: 'Niamey' },
  { x: 237, y: 153, label: "N'Djamena" },
  { x: 128, y: 191, label: 'Abidjan' },
  { x: 170, y: 184, label: 'Lagos' },
  { x: 206, y: 198, label: 'Douala' },
  { x: 238, y: 245, label: 'Kinshasa' },
  { x: 227, y: 270, label: 'Luanda' },
  { x: 361, y: 228, label: 'Nairobi' },
  { x: 311, y: 366, label: 'Johannesburg' },
]

const LINKS: Array<[number, number]> = [
  [1, 0],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [0, 2],
  [2, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [3, 6],
  [4, 7],
  [4, 8],
  [5, 9],
  [9, 11],
  [11, 12],
  [7, 11],
]

/* Liaisons portant un flux lumineux animé (réseau « actif »). */
const PULSED_LINKS = [1, 3, 6, 8, 10, 15, 17]

/* Connexions bouclier -> noeuds sahéliens (Dakar, Nouakchott, Bamako). */
const SHIELD_LINKS: Array<[number, number, number, number]> = [
  [50, 36, 105, 150],
  [51, 56, 60, 120],
  [52, 80, 51, 139],
]

const AFRICA_PATH =
  'M88 21 Q115 18 141 17 Q160 14 180 13 Q182 24 183 34 Q210 38 237 40 ' +
  'Q272 42 306 47 Q306 50 307 54 Q322 62 337 71 Q340 100 347 134 Q358 142 370 150 ' +
  'Q384 153 397 157 Q405 160 414 163 Q414 174 413 187 Q398 204 383 223 Q370 229 357 233 ' +
  'Q355 256 353 281 Q342 300 331 320 Q328 330 326 340 Q319 356 311 371 Q296 388 280 407 ' +
  'Q268 411 256 413 Q242 412 228 410 Q224 406 219 403 Q213 390 206 376 Q198 346 191 318 ' +
  'Q192 284 193 253 Q191 249 190 245 Q184 226 177 207 Q174 201 171 197 Q162 193 154 190 ' +
  'Q145 188 137 186 Q130 188 123 188 Q115 190 106 192 Q94 196 83 196 Q72 190 60 173 ' +
  'Q53 170 46 168 Q40 162 34 154 Q27 147 23 139 Q26 124 30 104 Q34 90 40 73 Q44 67 49 62 ' +
  'Q58 50 69 37 Q77 29 88 21 Z'

export default function AfricaNetwork() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10"
      style={{ backgroundColor: '#020B12' }}
    >
      <div className="grid-bg absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="scanline absolute inset-0" aria-hidden="true" />

      {/* Étiquette de service */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-md border border-white/10 bg-[#020B12]/70 px-2.5 py-1.5 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-night-100/70">
          Sahel Cyber Network
        </span>
      </div>

      <svg
        viewBox="0 0 480 430"
        className="relative w-full"
        role="img"
        aria-label="Réseau cyber de Sahel Sec Academy : bouclier de protection connecté à une carte de l'Afrique reliant les pôles cyber africains"
      >
        <defs>
          <radialGradient id="hub-glow" cx="55%" cy="45%" r="62%">
            <stop offset="0%" stopColor="rgba(15,168,100,0.13)" />
            <stop offset="100%" stopColor="rgba(15,168,100,0)" />
          </radialGradient>
          <linearGradient id="africa-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#071425" />
            <stop offset="100%" stopColor="#030A12" />
          </linearGradient>
        </defs>

        {/* Halo réseautique */}
        <ellipse cx="245" cy="205" rx="205" ry="210" fill="url(#hub-glow)" />

        {/* Madagascar (île, contour subtil) */}
        <g transform="translate(28 0)" className="animate-float-slow">
          <ellipse
            cx="391"
            cy="322"
            rx="10"
            ry="36"
            fill="rgba(4,12,22,0.6)"
            stroke="rgba(15,168,100,0.3)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
        </g>

        {/* Carte de l'Afrique */}
        <g transform="translate(28 0)" className="animate-float-slow">
          <path
            d={AFRICA_PATH}
            fill="none"
            stroke="rgba(15,168,100,0.1)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d={AFRICA_PATH}
            fill="url(#africa-fill)"
            stroke="rgba(15,168,100,0.55)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d={AFRICA_PATH}
            fill="none"
            stroke="rgba(15,168,100,0.16)"
            strokeWidth="1"
            strokeDasharray="2 7"
            strokeLinejoin="round"
          />
        </g>

        {/* Bouclier cyber (protection), connecté au réseau */}
        <g aria-hidden="true">
          <g transform="translate(10 128)">
            <path
              d="M28 2 L54 12 V38 c0 24-15 42-26 52 C17 80 2 62 2 38 V12 Z"
              fill="rgba(4,10,20,0.85)"
              stroke="rgba(15,168,100,0.85)"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M28 13 L46 19 V36 c0 17-9 30-18 37 C19 66 10 53 10 36 V19 Z"
              fill="none"
              stroke="rgba(15,168,100,0.35)"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeDasharray="2 4"
            />
            <circle
              cx="28"
              cy="30"
              r="8"
              fill="none"
              stroke="rgba(15,168,100,0.22)"
              strokeWidth="1"
              className="animate-pulse-node"
            />
            <circle cx="28" cy="30" r="3.4" fill="#0FA864" />
            <circle cx="28" cy="30" r="1.4" fill="#9CFFD4" />
            <path
              d="M28 36 v10"
              stroke="rgba(15,168,100,0.9)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Liaisons bouclier -> Sahel */}
          {SHIELD_LINKS.map(([x1, y1, x2, y2], i) => (
            <line
              key={`shield-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(15,168,100,0.4)"
              strokeWidth="1"
              strokeDasharray="2 5"
              className="animate-dash-flow"
              style={{ animationDelay: `${i * 0.9}s` }}
            />
          ))}
        </g>

        {/* Liaisons de données entre pôles cyber */}
        {LINKS.map(([a, b], i) => {
          const na = NODES[a]
          const nb = NODES[b]
          return (
            <g key={`link-${i}`}>
              <line
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke="rgba(15,168,100,0.06)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <line
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke="rgba(15,168,100,0.32)"
                strokeWidth="1"
                className="animate-dash-flow"
                style={{ animationDelay: `${i * 0.55}s` }}
              />
              {PULSED_LINKS.includes(i) && (
                <circle r="1.6" fill="#66F0AE" opacity="0.9">
                  <animateMotion
                    dur={`${2.4 + (i % 5) * 0.5}s`}
                    repeatCount="indefinite"
                    begin={`${i * 0.7}s`}
                    path={`M${na.x} ${na.y} L${nb.x} ${nb.y}`}
                  />
                </circle>
              )}
            </g>
          )
        })}

        {/* Pôles cyber africains */}
        {NODES.map((node, i) => (
          <g key={node.label}>
            <circle
              cx={node.x}
              cy={node.y}
              r="9"
              fill="rgba(15,168,100,0.07)"
              aria-hidden="true"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="5"
              fill="rgba(4,10,20,0.92)"
              stroke="rgba(15,168,100,0.9)"
              strokeWidth="1.5"
              className="animate-pulse-node"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
            <circle cx={node.x} cy={node.y} r="1.8" fill="#0FA864" />
            <text
              x={node.x + 9}
              y={node.y - 6}
              fill="rgba(226,232,240,0.6)"
              fontSize="8.5"
              fontFamily="ui-monospace, monospace"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* HUD Intelligence Center */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-white/10 bg-[#020B12]/85 px-4 py-2.5 backdrop-blur">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-night-100/75">
            Sahel Sec · Intelligence Center
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-teal/60">
            Réseau de veille · Sahel
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-teal">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
          [ Opérationnel ]
        </span>
      </div>
    </div>
  )
}