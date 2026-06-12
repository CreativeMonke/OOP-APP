# OOP Academy

Interactive OOP learning desktop app built with Tauri and React.

## Overview

- Desktop application for Object-Oriented Programming coursework.
- Bundles `Course-1.pdf` through `Course-12.pdf` as embedded resources.
- Includes coding exercises, local progress tracking, and compiled Rust backend support.

## Prerequisites

- macOS 13+ (Ventura or later)
- Xcode Command Line Tools
- Rust (for the Tauri backend)
- Node.js 20+

## Setup

```bash
cd "/Users/rares-cristiandarabana/Uni/Sem 2/OOP/OOP_app"
npm install
```

## Development

```bash
npm run tauri dev
```

## Build for distribution

```bash
npm run tauri build
```

The macOS installer output is located at:

`src-tauri/target/release/bundle/dmg/OOP Academy_0.0.1-alpha_aarch64.dmg`

## Installation (for classmates)

1. Open the generated `.dmg` file.
2. Drag `OOP Academy.app` to the Applications folder.
3. On first launch, right-click the app and choose **Open** to bypass Gatekeeper for unsigned apps.

## Notes

- Progress is saved to `~/Library/Application Support/com.oop-academy.app/progress.json`.
- The app requires `clang++` from Xcode Command Line Tools to compile and run exercises.
- This build is Apple Silicon native (`aarch64`).
