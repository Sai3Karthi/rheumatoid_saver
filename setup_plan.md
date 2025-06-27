# 🏗️ Project Setup Plan (Care Companion Electron App)

_Bro-friendly TL;DR on how we'll get this thing running._

## 1. Prereqs
- **Node.js 18+** (comes with npm) – install from nodejs.org if you don't have it.
- **Git** – already here if you cloned.

## 2. Install deps
1. `cd my-electron-app`
2. `npm install` – pulls all prod & dev packages listed in `package.json`.

## 2.5. Extra dev deps we just installed
If `npm run build` complains about missing plugins, add them:
```bash
npm i -D html-webpack-plugin worker-loader
```

## 3. Environment vars
- Create a `.env` file next to `package.json` with your Bland AI key:
  ```env
  BLAND_AI_API_KEY=YOUR_KEY_HERE
  ```
- (Optional) commit an `env.example` for reference later.

## 4. Build / run
- **Dev**: `npm run dev` (webpack watch) _+_ `npm start` (launch Electron).
- **Prod**: `npm run build` then `npm start`.

## 5. Next steps
- Verify webcam works.
- Test blink detection.

---
Stick to the steps above; we'll reference each chunk as we automate the setup.