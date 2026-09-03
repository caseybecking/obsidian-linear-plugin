# Linear Plugin for Obsidian

This plugin integrates Linear (https://linear.app) with Obsidian (https://obsidian.md), allowing you to embed and filter Linear issues directly in your notes.

**Note: This plugin is currently desktop-only and does not support mobile devices.**

## Features

- Fetch and embed one or more Linear issues by their IDs directly in your notes

### Fetch Linear Issues by ID

You can pull one or more specific Linear issues into your notes using a code block with the issue IDs:

#### Single Issue

````markdown
```linear
id: ISSUE_ID
```
````

- Replace `ISSUE_ID` with the actual Linear issue ID (e.g., `1234`, `LIN-123`, or the unique identifier from Linear).
- You can also use `issueId` as the key if you prefer.

#### Multiple Issues

````markdown
```linear
ids:
  - LIN-123
  - LIN-456
  - LIN-789
```
````

- List as many IDs as you want under `ids:` (YAML array format).
- The plugin will fetch and render each issue in the order listed.
- If an ID is not found, an error message will be shown for that ID.

This is useful for referencing or embedding individual issues from your team's projects directly into your Obsidian notes.

### Display Options

You can customize how issues are displayed using YAML options in the code block:

#### Limit Number of Issues

To limit the number of issues displayed, use the `limit` option:

```linear
limit: 5
```

This will show only the 5 most recent issues. If no limit is specified, all issues will be displayed.

#### Filter by Team

To show issues from a specific team, use the `team` option with the team's name:

```linear
team: Engineering
```

#### Filter by Status

To show issues with a specific status, use the `status` option with the status name:

```linear
status: In Progress
```

The status name matching is case-insensitive and forgiving of special characters, so "inprogress" and "In Progress" will work the same way.

#### Filter by Assignee

To show issues assigned to a specific person, use the `assignee` option with their email address:

```linear
assignee: user@example.com
```

#### Sort by Due Date

To sort issues by their due date, use the `sorting` option:

```linear
sorting: dateascending   # Sort by due date, oldest first
sorting: datedescending  # Sort by due date, newest first
```

#### Hide Description

To show only issue titles without descriptions, use the `hideDescription` option:

```linear
hideDescription: true
```

#### Hide Title or Due Date

To render a more compact card, hide the title text with `hideTitle` and the due date badge with `hideDueDate`. `hideTitle` keeps the issue identifier as a link. Combined with `hideDescription`, the card shows just the identifier and status badge, e.g. `ENG-123  Done`:

```linear
id: ENG-123
hideDescription: true
hideTitle: true
hideDueDate: true
```

### Combining Options

You can combine multiple options to create specific views:

```linear
team: Engineering
status: In Progress
assignee: user@example.com
sorting: dateascending
hideDescription: true
limit: 3
```

This will show the 3 oldest In Progress issues from the Engineering team that are assigned to the specified user, without descriptions.

### Visual Enhancements

#### Due Date Indicators

Issues display due dates with color-coded badges and emoji indicators:
- 📅 Due Today (orange)
- 📅 Due Tomorrow (blue)
- ⚠️ Overdue (red)
- 📅 Upcoming (green)
- 📅 No due date (gray)

#### Status Colors

Each status is displayed with a color-coded badge matching your Linear workflow states.

### Debug Mode

The plugin includes a debug mode that can be enabled in settings. When enabled, it provides comprehensive logging (prefixed with 🔄) in the developer console, helping you troubleshoot:
- Plugin initialization and settings changes
- API requests and responses
- Filter applications and option parsing
- Due date calculations
- Status matching
- Team identification
- Description rendering decisions

To use debug mode:
1. Open Obsidian Settings
2. Go to Community Plugins > Linear
3. Enable the "Debug Mode" toggle
4. Open the developer console (Ctrl+Shift+I or Cmd+Option+I)
5. Look for messages prefixed with 🔄

Debug logs are only shown when debug mode is enabled, keeping your console clean during normal operation.

### Error Handling

The plugin includes comprehensive error handling:
- Detailed error messages showing both team and status context
- Graceful fallback for invalid status names
- Automatic status name normalization
- Cache management for workflow states
- Clear distinction between expected conditions and actual errors

## Installation

**Requirements:**
- Obsidian Desktop (Mobile devices are not supported)

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Linear"
4. Install the plugin and enable it

## Configuration

1. Get your Linear API key from Linear's settings
2. Open the plugin settings in Obsidian
3. Enter your Linear API key
4. (Optional) Enable debug mode to see detailed logs in the developer console

## Development

### Prerequisites

- NodeJS v16 or higher (v20.19 or higher to run the unit tests)
- npm or yarn

### Setup

1. Clone this repository
2. Run `npm install` or `yarn` to install dependencies
3. Run `npm run dev` to start compilation in watch mode

### Building

Run `npm run build` to create a production build.

### Testing

Run the unit tests with:

```bash
npm test
```

The tests live in `tests/` and run with [Vitest](https://vitest.dev) in a jsdom environment. Since the `obsidian` package ships types only, `tests/mocks/obsidian.ts` provides a minimal runtime stand-in and `tests/setup.ts` recreates the DOM helpers Obsidian adds to `HTMLElement`.

To test the plugin manually in Obsidian:
1. Build the plugin using `npm run build`
2. Copy `main.js`, `manifest.json`, and `styles.css` to your Obsidian plugins directory
3. Enable the plugin in Obsidian
4. Create a code block with the language set to `linear`
5. Check the developer console (Ctrl+Shift+I or Cmd+Option+I) for debug logs 