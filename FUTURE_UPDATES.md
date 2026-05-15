# MindGrid Future Update Map

This file maps the `stitch_mindgrid_modern_game_ui` references into the current MindGrid page structure.
Only the screen ideas already present in the stitch folder are listed here.

## Live Page Map

### `/`
- Source direction:
  - `stitch_mindgrid_modern_game_ui/mindgrid_home_dashboard_1`
  - `stitch_mindgrid_modern_game_ui/mindgrid_home_dashboard_2`
  - `stitch_mindgrid_modern_game_ui/mindgrid_home_dashboard_3`
- Current role:
  - Separate landing page
  - Brand intro
  - Entry links to login and register

### `/login`
- Source direction:
  - `stitch_mindgrid_modern_game_ui/mindgrid_login_register`
- Current role:
  - Separate login page
  - Username and password entry

### `/register`
- Source direction:
  - `stitch_mindgrid_modern_game_ui/mindgrid_create_account`
  - `stitch_mindgrid_modern_game_ui/mindgrid_login_register`
- Current role:
  - Separate register page
  - Username, password, and avatar selection

### `/play`
- Source direction:
  - `stitch_mindgrid_modern_game_ui/mindgrid_home_dashboard_1`
  - `stitch_mindgrid_modern_game_ui/mindgrid_home_dashboard_2`
  - `stitch_mindgrid_modern_game_ui/mindgrid_home_dashboard_3`
- Current role:
  - Main dashboard
  - Setup for theme and grid size
  - Entry point into Classic mode

### `/play/classic`
- Source direction:
  - `stitch_mindgrid_modern_game_ui/mindgrid_memory_grid`
  - `stitch_mindgrid_modern_game_ui/mindgrid_combo_streak_active`
  - `stitch_mindgrid_modern_game_ui/mindgrid_match_success`
- Current role:
  - Live classic board
  - Memory grid
  - Round HUD

### `/results/:runId`
- Source direction:
  - `stitch_mindgrid_modern_game_ui/mindgrid_game_over_summary`
- Current role:
  - End-of-round summary
  - Score breakdown

### `/hall-of-fame`
- Source direction:
  - `stitch_mindgrid_modern_game_ui/mindgrid_leaderboard`
- Current role:
  - Separate Hall of Fame page
  - Top players and ranked runs

### `/profile`
- Source direction:
  - `stitch_mindgrid_modern_game_ui/mindgrid_profile`
- Current role:
  - Separate profile page
  - Player identity, XP, and account summary

## Stitch Features Reserved For Future Passes

### Auth
- `stitch_mindgrid_modern_game_ui/mindgrid_forgot_password`
- Future page:
  - `/forgot-password`
- Future use:
  - Password recovery flow

### Lobby and social
- `stitch_mindgrid_modern_game_ui/mindgrid_lobby`
- Future page:
  - `/lobby`
- Future use:
  - Party members
  - Invite flow
  - Matchmaking shell

### Pause and settings
- `stitch_mindgrid_modern_game_ui/mindgrid_pause_settings`
- Future page:
  - in-game overlay on `/play/classic`
- Future use:
  - Pause menu
  - Settings overlay

### Combo and success overlays
- `stitch_mindgrid_modern_game_ui/mindgrid_combo_streak_active`
- `stitch_mindgrid_modern_game_ui/mindgrid_match_success`
- Future page:
  - in-game overlay on `/play/classic`
- Future use:
  - Combo callout
  - Match success feedback

### Power-up presentation
- `stitch_mindgrid_modern_game_ui/mindgrid_power_up_effects_active`
- `stitch_mindgrid_modern_game_ui/a_set_of_three_modern_premium_game_power_up_icons_for_a_memory_puzzle_game`
- Future page:
  - in-game overlay on `/play/classic`
- Future use:
  - Power-up effects
  - Premium icon treatment

### Prototype reference
- `stitch_mindgrid_modern_game_ui/untitled_prototype`
- Future use:
  - loose experimental layout reference only
