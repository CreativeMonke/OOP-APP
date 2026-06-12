# OOP Academy — Build Guide

## Prerequisites

1. **macOS 13+ (Ventura or later)** — required for `@property` CSS and vibrancy effects.

2. **Xcode Command Line Tools** — provides `clang++` for compiling student code:

   ```bash
   xcode-select --install
   ```

3. **Rust** — the Tauri backend:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

4. **Node.js 20+** — via [nvm](https://github.com/nvm-sh/nvm) or [nodejs.org](https://nodejs.org):
   ```bash
   nvm install 20 && nvm use 20
   ```

## Development

```bash
cd OOP_app
npm install
npm run tauri dev
```

The app opens automatically. Hot-reload works for the frontend; Rust changes require restart.

## Build for Distribution

```bash
npm run tauri build
```

Output: `src-tauri/target/release/bundle/dmg/OOP Academy_0.0.1-alpha_aarch64.dmg`

## Install (for classmates)

1. Open the `.dmg` file
2. Drag **OOP Academy.app** to your Applications folder
3. **First launch**: right-click → Open (bypasses Gatekeeper for unsigned apps)
4. macOS will ask to confirm — click Open

## Notes

- The app reads Course-1.pdf through Course-12.pdf from its bundled resources. These are embedded at build time from `../../Course-*.pdf` (the parent OOP directory).
- Progress is saved to `~/Library/Application Support/com.oop-academy.app/progress.json`.
- `clang++` must be available (from Xcode Command Line Tools) to compile and run exercises.
- The app is Apple Silicon native (aarch64). It will not run on Intel Macs without a separate build targeting `x86_64-apple-darwin`.
