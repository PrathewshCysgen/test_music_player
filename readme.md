# Rhythmix – Music Player

Rhythmix is a web-based YouTube music player that allows you to search, play, queue, and manage your favorite songs in a sleek, responsive interface.

---

## 📦 Features & Updates (Today)

### New Features

- **YouTube API Integration**
  - Search and play songs directly from YouTube.
  - Added “official audio” suffix to prioritize music results.
- **Queue Enhancements**
  - Added **Remove from Queue** button for each song.
  - Dynamic queue updates when items are added, removed, or played.
  - Queue persists in `localStorage` for session continuity.
- **Library / Likes**
  - Heart icon to add/remove songs to/from library.
  - Library persists in `localStorage`.
- **Explore Tab**
  - Auto-load trending/popular songs from YouTube API.
  - Like and add songs to queue directly from Explore.
- **Home Tab**
  - Placeholder text on first load: _“Welcome to Rhythmix – Start searching…”_
  - **Recently played history** below placeholder.
  - History saved in `localStorage` and independent of queue.
  - Rendered as a **uniform 5-card grid** with fixed image sizes, padding, and ellipsis for long titles.

### Improvements

- **UI / UX**
  - Fully responsive sidebar, navbar, player, and content.
  - Hamburger menu for mobile to toggle sidebar.
  - Player controls centered and responsive.
  - Tab contents properly aligned without overlapping sidebar or player.
  - Search bar visible only in Home tab and styled consistently.
- **CSS / Layout**
  - Unified `tab-item` design for queue, library, explore, and home search items.
  - Sidebar off-canvas in mobile, slides in/out smoothly.
  - History grid shows exactly 5 items per row.
  - Fixed image sizes and consistent padding across all cards.
  - Long titles truncated with ellipsis for a clean layout.

### Bug Fixes

- Home placeholder now shows correctly on page load.
- Fixed search results that sometimes failed to play.
- Queue auto-play fixed and properly saved/loaded.
- Sidebar no longer overlaps content in mobile or desktop.
- Volume control and progress bar properly update.
- Corrected text overflow in history and tab items.

---

## ⚡ Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/rhythmix.git
```
