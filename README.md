# Care Companion

Care Companion is a cross-platform desktop application that performs real-time blink detection and automated emergency notifications. Built with Electron, React, and MediaPipe, the project demonstrates full-stack desktop development, computer-vision integration, and external API orchestration.

## Project Highlights

- **Real-time Blink Detection** – Utilises MediaPipe Face Mesh to calculate Eye Aspect Ratio (EAR) and identify blinks with millisecond precision.
- **Automated Emergency Calls** – Initiates outbound voice calls through the Bland AI platform when abnormal blink patterns indicate potential distress.
- **Patient Management** – Stores patient details and medical documents locally, ensuring data privacy while providing quick access during emergencies.
- **Modern UI** – Responsive React interface packaged via Webpack and delivered through Electron's Chromium renderer.

## Architecture Overview

```
┌──────────────┐       IPC        ┌──────────────────────┐
│ Renderer (UI)├─────────────────►│ Main (Electron Core) │
└──────────────┘◄─────────────────┤  – Emergency calls   │
       ▲  ▲   blink events        └──────────────────────┘
       │  │
       │  └─ MediaPipe + Web Workers (Blink detection)
       │
       └── React Components (Patient mgmt, UI)
```

Key technologies: Electron 28, React 18, Webpack 5, Babel 7, MediaPipe, Axios.

## Prerequisites

- Node.js 18 LTS or later (includes npm)
- Git
- A functional webcam

## Installation

```bash
# clone repository
$ git clone https://github.com/Sai3Karthi/rheumatoid_saver.git
$ cd rheumatoid_saver/my-electron-app

# install dependencies
$ npm install
```

### Environment Variables

Create a `.env` file in `my-electron-app`:

```env
BLAND_AI_API_KEY=<your_bland_ai_api_key>
```

### Build & Run

Development (hot-reload):

```bash
# in one terminal – bundle changes on save
$ npm run dev

# in a second terminal – launch Electron
$ npm start
```

Production bundle:

```bash
$ npm run build
$ npm start
```

## Usage Guide

1. Launch the application; the camera feed appears in the main window.
2. Open **Patient Details** to add or update personal data and medical records.
3. Select **Blink Detection** to begin monitoring. EAR statistics are displayed in real time.
4. If the application detects ≥ 5 blinks within 3 seconds, it sends an emergency voice notification via Bland AI or falls back to the system dialler.

## Contributing

Contributions are welcome. Please open an issue or create a feature branch:

```bash
git checkout -b feature/concise-name
```

Follow conventional commit messages and ensure that `npm run build` completes without errors before opening a pull request.

## License

This project is released under the MIT License. See `LICENSE` for details.

## Acknowledgements

- **MediaPipe** – Face Mesh solution
- **Bland AI** – Voice call API
- **Electron & React** – Core application stack 