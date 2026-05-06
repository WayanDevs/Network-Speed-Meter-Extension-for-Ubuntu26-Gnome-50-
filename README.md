# Network Speed Meter Extension

<img width="299" height="29" alt="Screenshot From 2026-05-07 00-26-05" src="https://github.com/user-attachments/assets/4308246d-d088-4be0-9993-b332d3e5585a" />

**UUID:** `network-speed-meter@yan.com`

## Installation and Run Commands


1. **Link Stage**: Create an idempotent symlink from this `./src/` directory to your GNOME Shell extensions directory:
   ```bash
   ln -sf $(pwd) ~/.local/share/gnome-shell/extensions/network-speed-meter@yan.com
   ```
2. **Activation**: Enable the extension via the command line:
   ```bash
   gnome-extensions enable network-speed-meter@yan.com
   ```
3. **Wayland Note**: On Ubuntu 26.04, a session Log Out/Log In is required to load new extensions for the first time.

## Technical Specifications

- **Goal**: Real-time network speed indicator (Upload/Download) located in the GNOME Top Bar, adjacent to system icons.
- **Tech Stack**: GJS (GNOME JavaScript), CSS, Linux Shell.
- **Target OS**: Ubuntu 26.04 LTS (GNOME 48+).
- **Core Features**:
  - Real-time monitoring in KB/s or MB/s.
  - Auto-detection of active interfaces (Wi-Fi/Ethernet).
  - Byte differential calculations from `/proc/net/dev` every 1 second.
  - Clean, unobtrusive text display using the `St` toolkit.
- **Constraints**:
  - Uses modern ES6 Classes (Class-based extension).
  - Native support for Wayland and GNOME 48+.
  - Non-blocking asynchronous GLib/Gio data retrieval to prevent UI lag.
  - CPU usage MUST stay below 0.5%.

## Debugging

To track real-time errors and monitor stability, use the following command:
```bash
journalctl -f -o cat /usr/bin/gnome-shell
```
