# BugSnagBar

> **Note**: This is an experimental project for personal use. If it helps someone else, great! No guarantees are provided regarding stability or maintenance.

A macOS menu bar app for [Bugsnag](https://www.bugsnag.com) — Track errors at a glance.

## Features

### Menu Bar Icon

BugSnagBar lives in your macOS menu bar with a color-coded icon that reflects your current status:

| Icon Color | Meaning |
|------------|---------|
| **Red** | Critical errors (`error` severity) detected |
| **Orange** | Warnings detected |
| **Green** | Data present, no critical issues |
| **Gray** | No data or no active account |

### Error Tracking

- View open errors across all your watched projects
- Errors sorted by last seen, with severity indicators
- Click to expand and see full details: events count, users affected, first/last seen, release stages, comments
- One click to open the error in the Bugsnag dashboard
- Dismiss errors you don't want to see, restore them anytime

### Dismiss & Restore

1. Expand an error and click **Hide** to dismiss it
2. Dismissed items are excluded from the tray icon status
3. Click **Restore hidden** in the footer to bring them back

### Multi-Account Support

Connect multiple Bugsnag accounts with Personal Auth Tokens.

### Watched Projects

Select specific projects to monitor for errors. Search by name from the Preferences.

### Notifications

Receive native macOS notifications for new errors. Can be enabled/disabled in Preferences.

### Settings

- **Refresh interval**: 30 seconds to 5 minutes
- **Error age limit**: Only show errors seen in the last X hours (or never hide)
- **Unhandled only**: Filter to show only unhandled exceptions
- **Dark mode**: Automatically adapts to your macOS appearance

## Installation

### Quick Install (one-liner)

**Install or upgrade with a single command:**

```bash
curl -fsSL https://raw.githubusercontent.com/yoanbernabeu/BugSnagBar/main/install.sh | bash
```

The script automatically detects if BugSnagBar is already installed and handles the upgrade (stop, replace, relaunch).

> Your configuration (accounts, watched projects, settings) is preserved across upgrades.

### From Releases (manual)

1. Download the latest `.dmg` file from the [Releases](https://github.com/yoanbernabeu/BugSnagBar/releases) page
2. Open the `.dmg` file
3. Drag **BugSnagBar** to your Applications folder
4. Launch BugSnagBar from Applications

### Bypassing macOS Gatekeeper

Since BugSnagBar is not signed with an Apple Developer certificate, macOS will block the app on first launch. The one-liner command above handles this automatically via `xattr -cr`. If you installed manually:

#### Method 1: Right-click to Open (Simplest)

1. Right-click (or Control-click) on BugSnagBar in your Applications folder
2. Select **Open** from the context menu
3. Click **Open** in the dialog that appears

#### Method 2: System Preferences

1. Try to open BugSnagBar normally (it will be blocked)
2. Go to **System Settings** → **Privacy & Security**
3. Click **Open Anyway**

#### Method 3: Terminal Command

```bash
xattr -cr /Applications/BugSnagBar.app
```

## Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [npm](https://www.npmjs.com/) 9 or later
- macOS (for building the macOS app)

### Steps

1. Clone the repository:

```bash
git clone https://github.com/yoanbernabeu/BugSnagBar.git
cd BugSnagBar
```

2. Install dependencies:

```bash
npm install
```

3. Generate tray icons:

```bash
npm run generate-icons
```

4. Run in development mode:

```bash
npm start
```

5. Build the application:

```bash
npm run make
```

The built application will be available in the `out/make` directory.

## Configuration

### Adding a Bugsnag Account

1. Click the BugSnagBar icon in your menu bar
2. Right-click → **Preferences**
3. Go to the **Accounts** tab
4. Enter an account name and your Personal Auth Token
5. Click **Add account**

### Creating a Personal Auth Token

1. Log in to [Bugsnag](https://app.bugsnag.com)
2. Go to **Settings** → **My account** → **Personal auth tokens**
3. Create a new token and copy it

### Setting Up Watched Projects

1. Go to **Preferences** → **Projects**
2. Search for projects by name
3. Click to toggle watching

## Tech Stack

- [Electron](https://www.electronjs.org/) - Cross-platform desktop app framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Fast build tool
- [Electron Forge](https://www.electronforge.io/) - Electron tooling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Yoan Bernabeu** - [GitHub](https://github.com/yoanbernabeu)
