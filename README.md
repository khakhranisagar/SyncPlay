# SyncPlay

Synchronized media player PWA — watch/listen together over WiFi, each device on its own Bluetooth speaker or earphones. No server, no cloud, pure peer-to-peer.



## Installing as a PWA on Android

1. Open the GitHub Pages URL in **Chrome**
2. Chrome shows an **"Install SyncPlay"** banner at the bottom — tap **Install**
3. Or: tap Chrome menu (⋮) → **"Add to Home screen"**
4. SyncPlay appears on your home screen like a native app

Both devices should install it for the best experience (standalone mode, no browser chrome).

---

## How to use

### Host (tablet)
1. Open SyncPlay → tap **"Create a room"**
2. Select your MKV/MP4/MP3 file
3. A QR code appears — show it to the peer device
4. Scan the peer's answer QR (or paste their code)
5. Wait for peer to select file and tap "I'm ready"
6. Tap **"Launch playback"** — you're in control

### Peer (phone)
1. Open SyncPlay → tap **"Join a room"**
2. Scan the host's QR code (camera opens automatically)
3. Your answer QR appears — show it to the host
4. Select the **same media file** from your storage
5. Tap **"I'm ready"** — audio plays in sync with host

---

## Notes

- Both devices must be on the **same WiFi network**
- The media file is **never transferred** — each device loads from local storage
- Video plays on the host (tablet); phone plays **audio only** (screen can dim)
- Pair your Bluetooth earphones/speakers via Android Settings before opening the app
- Sync drift correction runs every 8 seconds; resync is silent unless drift > 300ms
- Supports MKV, MP4, MP3, AAC, WebM — any size
