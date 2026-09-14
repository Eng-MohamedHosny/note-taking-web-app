# 📝 Pretty Notes App - Complete Features Guide & Showcase
### A Comprehensive, Visual Tour of Every Implemented Feature 🚀✨

<div align="center">

[![النسخة العربية](https://img.shields.io/badge/Language-النسخة%20العربية%20🇪🇬-green?style=for-the-badge)](./العربي.md)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-pretty--notes--app.pages.dev-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pretty-notes-app.pages.dev)

👉 **[اضغط هنا لقراءة الدليل بالعامية المصرية / Switch to Egyptian Arabic Version 🇪🇬](./العربي.md)**

</div>

---

> 🌐 **Live Production Application**: [https://pretty-notes-app.pages.dev](https://pretty-notes-app.pages.dev)  
> 💡 **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS v4, TipTap Rich Text, Supabase PostgreSQL, Brevo SMTP, Cloudflare Pages.

**Pretty Notes App** is a modern, high-performance digital workspace built from the ground up to combine a zero-latency local-first architecture (**Local-First**) with robust cloud persistence via **Supabase**, and an elegant editorial experience inspired by Notion and Apple Notes.

---

## 1. 🚀 Instant Frictionless Access: Guest Mode & Cloud Sync
No tedious registration hurdles just to jot down quick thoughts:

![Authentication & Instant Guest Mode](./images/01_auth_screen.png)

* **One-Click "Join as Guest"**: Jump immediately into your notes workspace without credentials. All notes, folders, and tags persist reliably in your browser storage (Local-First).
* **Encrypted Cloud Sync with Supabase**: Sign up with an email address to sync notes in real time across mobile phones, tablets, and laptops, protected by PostgreSQL **Row-Level Security (RLS)**.
* **Branded Brevo SMTP Deliverability**: Integrated custom SMTP relay ensures confirmation emails and password recovery messages land instantly in your inbox without spam flags.
* **Automated Password Recovery Flow**: Clicking the recovery link automatically detects the token, redirects safely, and opens the "Reset Password" modal cleanly.

---

## 2. 💻 Comprehensive Desktop Workspace
A high-productivity 3-column layout engineered for clarity and ergonomics:

![Desktop Workspace Overview](./images/02_desktop_overview.png)

* **Intuitive Navigation Sidebar**:
  - All Notes view with live count.
  - Dedicated Archived Notes & Trash containers.
  - Folders section with instant creation, renaming, and deletion.
  - Tags list with badge counters and pin-to-quick-bar toggles.
* **Top Navigation Header**:
  - `[☑ Select]` button to toggle multi-select mode instantly.
  - Real-time search bar querying titles, content, and tags in milliseconds.
  - Quick settings gear and profile management.

---

## 3. ✍️ Full-Featured TipTap Rich Text Editor
A distraction-free writing environment packed with formatting versatility:

![Rich Text Editor in Dark Mode](./images/03_desktop_editor.png)

* **Typography & Hierarchy**:
  - Headings: `H1`, `H2`, and `H3` with refined proportional scaling.
  - Formatting Shortcuts: **Bold** (`Ctrl+B`), *Italic* (`Ctrl+I`), <u>Underline</u> (`Ctrl+U`), ~~Strikethrough~~, and `Inline Code`.
  - Blocks: Styled Blockquotes, horizontal dividers, and syntax-styled Code Blocks.
* **Interactive Checklists (To-Do Lists)**: Checkable boxes with automated strikethrough animation for task tracking.
* **Curated Color Palette**: 11 hand-picked colors optimized for contrast, plus an integrated HEX Custom Color picker.
* **Rich Image Insertion**: Upload image files, paste URLs, or paste screenshots directly from your clipboard (`Ctrl + V`).
* **Real-Time Auto-Save**: Dynamic status badge indicating `Saving...` and `Saved` with zero latency.
* **Bilingual Arabic (RTL) & English (LTR) Support**: Automatic text direction detection for comfortable bilingual writing.

---

## 4. ⚡ Multi-Select & Floating Action Dock
Execute batch operations across multiple notes simultaneously:

![Desktop Multi-Select Mode & Floating Action Dock](./images/04_desktop_bulk_select.png)

* **Effortless Activation**:
  - **Desktop**: Click the `[☑ Select]` button in the top navigation header.
  - **Mobile**: Long-press (~450ms with subtle haptic vibration feedback) on any note card.
* **Floating Action Dock**:
  1. 🏷️ **Bulk Tag**: Apply tags across all selected notes in a single click.
  2. 📁 **Bulk Move**: Relocate selected notes to any folder instantly.
  3. 📦 **Bulk Archive / Unarchive**: Mass declutter your active view.
  4. 💾 **Bulk Export**: Download notes as Markdown (`.md`), Plain Text (`.txt`), JSON backup, or a bundled `.zip` archive.
  5. 🗑️ **Bulk Delete**: Safely send all selected notes to Trash.

---

## 5. 🎨 Customization, Themes & OLED Mode (Settings)
Tailor the workspace aesthetics to match your daily workflow:

![Settings Modal & Theme Switcher](./images/05_settings_modal.png)

* **Theme Modes**:
  - **Light Mode**: Crisp, high-contrast daylight clarity.
  - **Dark Mode**: Soft low-light dark aesthetic.
  - **Extra Dark Mode (OLED Black)**: Pure pitch-black background for battery conservation and zero screen glare.
  - **Notion Dark Mode**: Warm charcoal styling inspired by Notion's iconic canvas (`#191919`).
  - **System**: Dynamically adapts to your operating system's preference.
* **Accent Colors**:
  - Ocean Blue, Iris Purple, Emerald Green, Sunset Amber, Ruby Rose, and Aqua Teal.
* **Typography Switching**:
  - **Sans-serif**: Clean modern aesthetic (`Inter`).
  - **Serif**: Classic editorial typography (`Noto Serif`).
  - **Monospace**: Developer-friendly code typography (`Source Code Pro`).

---

## 6. 📱 Layout Innovation & Mobile-First UX
Engineered specifically for fluid, native-grade interactions on smaller screens:

![Balanced 2-Column Mobile Grid](./images/06_mobile_grid.png)

* **Balanced 2-Column Responsive CSS Grid**:
  - Even, side-by-side note cards on mobile without awkward single-column vertical stretches.
  - Systematic `mt-auto` card footers ensure dates and tags align on an identical horizontal baseline.
* **Smooth Collapsible Header (Apple Notes Feel)**:
  - Header and search input smoothly glide up and tuck under on scroll.
  - The Action Chips bar locks into a sleek sticky frosted-glass header (`backdrop-blur`) with **0% layout shift, 0% container resizing, and 0% jitter**.
* **Ergonomic Bottom Navigation Bar & FAB**:
  - Thumb-friendly navigation tabs for Home, Archive, Tags, and Folders, accompanied by a floating action button (`+`) for single-tap note creation.

---

## 7. 📲 Mobile Editorial Flow & Curved Chevron Navigation
Optimized touch interactions and crystal-clear feedback:

| Mobile Rich Text Editor | Mobile Multi-Select Dock |
| :---: | :---: |
| ![Mobile Editor](./images/07_mobile_editor.png) | ![Mobile Bulk Dock](./images/09_mobile_bulk_dock.png) |

* **Curved Chevron Back Button**:
  - Sleek `rounded-xl` box button positioned directly beside folder titles, synced with browser navigation history and mobile swipe gestures.
* **Centered Toast Notifications**:
  - Success and status messages are now perfectly centered horizontally on mobile and tablet screens (`left-1/2 -translate-x-1/2`), floating safely above the FAB and bottom bar.
* **Progressive Web App (PWA)**:
  - Installable directly to your phone's home screen under the name **Pretty Notes**, running in standalone mode with full offline functionality.

---

<div align="center">

👉 **[اضغط هنا لقراءة النسخة بالعامية المصرية / Read Egyptian Arabic Version 🇪🇬](./العربي.md)**

</div>
