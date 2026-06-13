@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Poppins:wght@450;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
@import "tailwindcss";

@theme {
  --color-menta: #A8D5C2;
  --color-azulCeu: #9CC6E8;
  --color-coral: #FFB6A6;
  --color-amarelo: #FFD166;
  --color-lilas: #CDB4DB;
  --color-areia: #F7F1E6;
  --color-marinho: #2D3A4A;
  
  --font-sans: "Poppins", "Inter", system-ui, sans-serif;
  --font-display: "Quicksand", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  
  --radius-scrapbook: 24px;
}

@layer base {
  body {
    font-family: var(--font-sans);
    background-color: #F7F1E6; /* areia */
    color: #2D3A4A; /* marinho */
  }
}

/* Scrapbook and organic decorative elements styling */
.scrapbook-border-dashed {
  border-style: dashed;
  border-width: 2px;
}

/* Organic blobs for beautiful designs */
.organic-blob-1 {
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
}

.organic-blob-2 {
  border-radius: 50% 50% 30% 70% / 40% 60% 30% 70%;
}

.organic-blob-3 {
  border-radius: 40% 60% 70% 30% / 50% 40% 60% 50%;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in-left {
  animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

