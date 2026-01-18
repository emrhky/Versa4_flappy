<svg>
  <image id="background" href="bg.png" x="0" y="0" width="336" height="336" />
  <image id="ground" href="ground.png" x="0" y="300" width="336" height="112" layer="3" />

  <image id="bird" x="63" y="156" width="34" height="24" href="bird.png" layer="4" />

  <defs>
    <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5e9a2b" />
      <stop offset="20%" stop-color="#89e044" />
      <stop offset="80%" stop-color="#89e044" />
      <stop offset="100%" stop-color="#487621" />
    </linearGradient>

    <symbol id="top-pipe-symbol">
      <rect id="body" x="2" y="0" width="48" height="100" fill="url(#pipeGradient)" stroke="#2d4b15" stroke-width="2" />
      <rect id="cap" x="0" y="100" width="52" height="26" fill="url(#pipeGradient)" stroke="#2d4b15" stroke-width="2" />
    </symbol>

    <symbol id="bottom-pipe-symbol">
      <rect id="cap" x="0" y="0" width="52" height="26" fill="url(#pipeGradient)" stroke="#2d4b15" stroke-width="2" />
      <rect id="body" x="2" y="26" width="48" height="100" fill="url(#pipeGradient)" stroke="#2d4b15" stroke-width="2" />
    </symbol>
  </defs>

  <g id="pipe-pair-1" transform="translate(350,0)" layer="2">
    <use id="top-pipe-1" href="#top-pipe-symbol" />
    <use id="bottom-pipe-1" href="#bottom-pipe-symbol" />
  </g>
  
  <g id="pipe-pair-2" transform="translate(550,0)" layer="2">
    <use id="top-pipe-2" href="#top-pipe-symbol" />
    <use id="bottom-pipe-2" href="#bottom-pipe-symbol" />
  </g>

  <text id="score-text" x="50%" y="50" font-family="System-Bold" fill="white" font-size="40" text-anchor="middle" font-weight="bold" stroke-width="2" stroke="black" layer="5">0</text>
  
  <svg id="game-over-screen" display="none" layer="6">
    <rect width="100%" height="100%" fill="black" opacity="0.7" pointer-events="visible" />
    <text x="50%" y="40%" fill="white" font-family="System-Bold" font-size="40" text-anchor="middle">GAME OVER</text>
    <text x="50%" y="60%" fill="white" font-size="24" text-anchor="middle">Tekrar Dokun</text>
  </svg>
  
  <rect id="touch-layer" width="100%" height="100%" opacity="0" pointer-events="visible" layer="7" />
</svg>
