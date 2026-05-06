import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class NetworkSpeedMeterExtension extends Extension {
    enable() {
        this._label = new St.Label({
            text: 'Loading...',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'network-speed-meter-label'
        });

        // Add to the top bar status area
        Main.panel._rightBox.insert_child_at_index(this._label, 0);

        this._lastRx = 0;
        this._lastTx = 0;
        
        // Polling every 1 second
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            this._updateSpeed();
            return GLib.SOURCE_CONTINUE;
        });
        
        this._updateSpeed();
    }

    disable() {
        if (this._timeout) {
            GLib.Source.remove(this._timeout);
            this._timeout = null;
        }

        if (this._label) {
            this._label.destroy();
            this._label = null;
        }
    }

    async _updateSpeed() {
        try {
            const file = Gio.File.new_for_path('/proc/net/dev');
            const [success, contents] = await new Promise((resolve, reject) => {
                file.load_contents_async(null, (file_, result) => {
                    try {
                        const res = file_.load_contents_finish(result);
                        resolve(res); // [success, contents, etag]
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            if (!success) return;

            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(contents);
            const lines = text.split('\n');

            let totalRx = 0;
            let totalTx = 0;

            // Skip first two header lines
            for (let i = 2; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = line.split(/:?\s+/);
                // format: interface_name: rx_bytes rx_packets ... tx_bytes tx_packets ...
                if (parts.length >= 10 && parts[0] !== 'lo:') {
                    totalRx += parseInt(parts[1], 10) || 0;
                    totalTx += parseInt(parts[9], 10) || 0;
                }
            }

            if (this._lastRx !== 0 && this._lastTx !== 0) {
                const rxDiff = totalRx - this._lastRx;
                const txDiff = totalTx - this._lastTx;

                const down = this._formatSpeed(rxDiff);
                const up = this._formatSpeed(txDiff);

                if (this._label) {
                    this._label.set_text(`▼ ${down}  ▲ ${up}`);
                }
            }

            this._lastRx = totalRx;
            this._lastTx = totalTx;

        } catch (e) {
            console.error('Network Speed Meter:', e);
            if (this._label) {
                this._label.set_text('Error');
            }
        }
    }

    _formatSpeed(bytes) {
        if (bytes < 1024) return `${bytes} B/s`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
    }
}
