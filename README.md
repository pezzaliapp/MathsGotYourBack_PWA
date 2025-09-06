# Math’s got your back — PWA

> **Math’s got your back.**  
> Una micro–PWA minimale: un piccolo satellite che orbita e lascia una scia elegante.  
> Pensata per presentazioni, landing, post social e schermate “about” di progetti STEM.

## Perché
La frase “Math’s got your back” sintetizza un’idea semplice: **la matematica è dalla tua parte**.  
Questa app la visualizza in modo essenziale, senza distrazioni: **un punto** e **la sua scia**.

## Caratteristiche
- 🎯 **Design minimale:** solo satellite + scia, nessun elemento superfluo
- ⚙️ **Controlli live:** *Speed* (s/giro), *Trail length* (campioni di scia) e **Precession** (°/giro)
- 🧭 **Precessione ellittica:** l’orbita cambia inclinazione mentre il satellite corre (puoi invertire il verso)
- 📱 **Installabile:** PWA “Add to Home Screen” su iOS/Android/Desktop
- 📡 **Offline-ready:** service worker con cache automatica
- 🔐 **Zero tracking:** nessun analytics, nessun cookie
- 🧩 **Single-folder:** tutto in una cartella, perfetto per GitHub Pages

## Utilizzi consigliati
- Hero banner per progetti educativi/STEM
- Slide d’apertura per talk e workshop
- Landing/portfolio con claim tecnico
- Post LinkedIn/IG (screenshot o screencast)

## Come usare
1. Pubblica la cartella su un hosting statico (GitHub Pages, Netlify, Vercel, ecc.).  
2. Apri `index.html`.  
3. (Opzionale) Installa la PWA dal browser.

> **Nota cache:** se aggiorni i file, esegui un “hard refresh” per forzare il service worker a riprendere le nuove versioni.

## Controlli
- **Speed** — secondi per rivoluzione (3–20s)  
- **Trail length** — numero di “tracce” dietro al satellite (10–140). Valori alti = scia più lunga/continua.  
- **Precession** — gradi di rotazione dell’ellisse **per ogni giro** (da −60° a +60°).

Le preferenze vengono salvate in `localStorage`.

## Struttura
```
index.html
app.js
manifest.json
sw.js
icon-192.png
icon-512.png
README.md  / README.html
```

## Personalizzazione rapida
- **Motto/titolo:** modifica l’`<h1>` in `index.html`
- **Preset social:** `Speed=6s`, `Trail length=120`, `Precession=+12°/giro`
- **Colore sfondo/tema:** cambia le variabili CSS in `index.html` (`--bg`, `--fg`)

## Tecnico (in breve)
- Rendering su **Canvas 2D**
- Scia tramite **campionamento discreto** di posizioni precedenti con **blending “lighter”**
- **Precessione** implementata come tilt(t) = tilt₀ + k·θ, dove **θ** è l’angolo orbitale e **k** è (gradi/giro) convertito in radianti
- Service Worker semplice (cache-first) per offline

## Licenza
MIT © 2025 Alessandro Pezzali / PezzaliAPP — usa e modifica liberamente con attribuzione.

---
**Motto:** *Math’s got your back.*
