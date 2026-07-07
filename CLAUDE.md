# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static wedding website for Gianluca & Sara (10 Dicembre 2026). No build system, no dependencies — pure HTML/CSS/JS. Hosted on GitHub Pages at `https://gborchielli95.github.io/matrimonio`.

## Architecture

All pages share a single `style.css` and `script.js`. The CSS uses CSS custom properties (`--gold`, `--dark`, `--ivory`, etc.) defined in `:root` — always use these variables rather than hardcoded colors.

| File | Purpose |
|------|---------|
| `index.html` | Home: hero, countdown, program, IBAN/gift list |
| `storia.html` | Photo gallery with lightbox |
| `info.html` | Logistics, maps (church + restaurant) |
| `rsvp.html` | RSVP form with multi-person support |
| `lista-nozze.html` | Wedding gift list — add new `info-card` blocks as new platforms are set up |
| `admin.html` | Guest list manager — public on GitHub Pages, no authentication |
| `script.js` | Countdown, mobile nav, scroll animations, FAQ accordion, RSVP form handler |

## Backend: Google Apps Script

All guest data lives in a Google Sheet ("Invitati" tab). Sheet columns: **A=ID, B=Nome, C=Cognome, D=Partecipa, E=N.Persone, F=Note, G=Aggiunto**.

A Google Apps Script web app acts as the API. The **API URL** must be kept in sync in both `admin.html` and `script.js` (search for `const API_URL`).

| Endpoint | Description |
|----------|-------------|
| `?action=list` | Returns all guests as JSON array |
| `?action=add&nome=...&cognome=...&partecipa=...&numero=...&note=...` | Adds a guest row |
| `?action=delete&id=...` | Deletes guest by row index |
| `?action=toggle&id=...&partecipa=...` | Updates participation status |
| `?action=checkDuplicates&people=[...]` | Checks if people already exist in sheet |
| `?action=update&nome=...&cognome=...&partecipa=...&numero=...&note=...` | Updates a guest found by nome+cognome |
| `?action=submitAll&people=[...]&forceUpdate=true/false` | Adds/updates all people in one call |

After any Apps Script code change, always create a **Nuovo deployment** (not update existing) — updating an existing deployment is unreliable. Update the new URL in both `script.js` and `admin.html`.

## RSVP form (`rsvp.html` + `script.js`)

Multi-person flow (wrapped in an IIFE at the bottom of `script.js`):

1. Main person fills nome/cognome/partecipa/note; `numero_ospiti` controls how many extra guest blocks appear
2. On submit: validates no internal duplicates (modal `#validationModal`), then calls `checkDuplicates`
3. If server duplicates found: shows `#duplicateModal` with Presente/Assente badge per person
4. Submits all people in one `submitAll` call (max 2 API calls total regardless of group size)

Each person gets their own row in the sheet with `numero=1`.

## Admin panel (`admin.html`)

- Published on GitHub Pages — no authentication, opens directly
- `id` field in guest objects = row index (1-based minus header), used for delete/toggle
- Nome/Cognome displayed uppercase client-side via `.toUpperCase()` — data in sheet unchanged
- ✏️ button on each row opens `#noteModal` to edit notes via `update` action
- Export to CSV and clipboard text are client-side only

## Deployment

Push to `main` branch → automatic GitHub Pages deployment. Uses HTTPS remote with GitHub Personal Access Token (repo scope) as password.

## Fonts

Loaded from Google Fonts — Great Vibes (script), Playfair Display (headings), Lato (body).
