# BBPress Forum Stats Reporter

A WordPress admin plugin that provides a monthly snapshot reporting dashboard for bbPress forum activity.

## Features

- **Overview stats** — total members, topics, replies, and average monthly posts
- **Monthly activity chart** — interactive line chart showing topics, replies, and new member registrations per month with year selector
- **Monthly detail modal** — click any month on the chart to drill into top posters, forum activity, and new members for that specific month
- **Top posters table** — top 10 members ranked by combined topic and reply count
- **Forum activity table** — per-forum topic and reply counts with engagement ratio
- **Lurker count** — members who have never posted, with percentage of total
- **CSV export** — export annual monthly data or individual month detail reports as CSV files

## Requirements

- WordPress 6.0+
- PHP 7.4+
- bbPress (any recent version)

## Installation

### From source (development)

```bash
cd wp-content/plugins/bbpress-stats-reporter
npm install
npm run build
```

Then activate **BBPress Forum Stats Reporter** in WP Admin → Plugins.

### On a live site

Upload only these folders/files — the compiled assets are all that's needed:

```
bbpress-stats-reporter/
├── bbpress-stats-reporter.php
├── includes/
└── build/
```

## Usage

Once activated, a **Forum Stats** item appears in the WordPress admin sidebar (under the dashboard). The page is accessible only to administrators (`manage_options` capability).

### Exporting data

- **Export CSV** (chart header) — downloads a 12-row CSV of monthly totals for the selected year: `forum-stats-YYYY.csv`
- **Export this month** (modal header) — downloads a detailed CSV for the selected month including summary, top posters, forum activity, and new members: `forum-stats-january-2025.csv`

## Development

```bash
npm run build   # production build
npm run start   # watch mode
```

Built with `@wordpress/scripts` (webpack), React, shadcn/ui components, Tailwind CSS, and Recharts.

REST API endpoints (all require `manage_options`):

| Endpoint | Description |
|----------|-------------|
| `GET /bbpress-stats/v1/overview` | Totals: members, topics, replies, lurkers, avg monthly posts |
| `GET /bbpress-stats/v1/monthly?year=YYYY` | 12-month breakdown for a given year |
| `GET /bbpress-stats/v1/top-posters?limit=N` | Top N posters all-time |
| `GET /bbpress-stats/v1/forums` | Per-forum topic and reply counts |
| `GET /bbpress-stats/v1/monthly-detail?year=YYYY&month=M` | Full breakdown for a specific month |

## License

GPL-2.0-or-later
