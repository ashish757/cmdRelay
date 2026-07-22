# ⚡ cmdRelay
A high-performance, context-aware PC controller that turns your mobile device into a smart macro pad

### quick idea
- cmdRelay basically helps you control your PC with your mobile device.
- But in a unique way not like any other remote controller
- **Read below to know how it's unique and more useful from the existing solutions**

![img_1.png](img_1.png)

## 1. High Performance
- Built on a custom Rust WebSocket server - Blazing Fast low level access
- control commands execute over your local network -  latency under 5ms


## 2. Context Aware Layouts
- The Rust server actively scans the host OS for tracking the the active window. 
- if you switch from your browser to your code editor then layout on your mobile automatically updates to match your target app.


## 3. System Telemetry Dashboard
- Live streaming of CPU usage, RAM consumption, and top memory-hogging processes. 
- Uses a smart subscription architecture to ensure zero battery or CPU waste when the dashboard is not used.

## 4. OS App Launcher 
- Automatically scans your host machine for installed applications
- allowing you to launch software directly from your mobile device.

## 5. Multi-Threaded Macro Engine 
- Safely handles complex, concurrent key combinations and macro executions without blocking the main server thread.


# 🛠️ Tech Stack
### Backend (App on computer)
- **`Rust`** core server and hardware interfacing.
- **`Tokio & Axum`** Asynchronous runtime and robust WebSocket/HTTP routing.
- **`Tauri`** Lightweight system tray integration and cross-platform native compilation.
- **`Sysinfo & Enigo`** Hardware telemetry extraction and OS-level keyboard/mouse simulation.

### Frontend (Mobile Client)

- **`React & TypeScript`** strictly typed, component-driven UI.
- **`Tailwind CSS`** utility-first styling for a fluid mobile experience.
- **`Lucide-react`** for SVG icons