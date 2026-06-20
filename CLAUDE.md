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
| `info.html` | Logistics, maps, dress code |
| `rsvp.html` | RSVP form |
| `lista-nozze.html` | Wedding gift list page — add new `info-card` blocks here as new list links are created |
| `admin.html` | Private guest list manager (not committed to git — see below) |
| `script.js` | Countdown, mobile nav, scroll animations, FAQ accordion, RSVP form handler |

**Note:** `index.html` links to `faq.html` but that file does not exist yet.

## Backend: Google Apps Script

All guest data lives in a Google Sheet ("Invitati" tab). A Google Apps Script web app acts as the API:

- **API URL** is stored in both `admin.html` and `script.js`
- **Endpoint:** `?action=list` — returns all guests as JSON
- **Endpoint:** `?action=add&nome=...&cognome=...&partecipa=...&numero=...&note=...` — adds a guest
- **Endpoint:** `?action=delete&id=...` — deletes a guest by ID
- **Endpoint:** `?action=toggle&id=...&partecipa=...` — updates participation status
- **Endpoint:** `?action=verifyPassword&pwd=...` — verifies admin password (returns `{ok:true/false}`)

The admin password is stored in Apps Script **Script Properties** under key `ADMIN_PASSWORD` — never hardcoded in any file. To change the password, update the Script Property directly in Apps Script settings.

After any change to the Apps Script code, a new deployment must be created (Esegui il deployment → Nuovo deployment) to make it live.

## Admin panel (`admin.html`)

- Listed in `.gitignore` — not published on GitHub, lives only on the local PC
- Login is verified server-side via `?action=verifyPassword` — no password in the source code
- Reads/writes guest data via the Apps Script API using `fetch`
- Dates returned from the API are ISO strings; `formatDate()` converts them to `dd/mm/yyyy`
- Export to CSV and clipboard text are client-side only

## RSVP form (`rsvp.html` + `script.js`)

On submit, the form sends a GET request to the Apps Script `?action=add&...` and shows a success message. Data goes directly to Google Sheets.

## Deployment

Push to `main` branch triggers automatic GitHub Pages deployment. To push, a GitHub Personal Access Token with `repo` scope is required (use as password with HTTPS remote).

## Pending items

- `lista-nozze.html` currently has only Amazon — add more gift list cards as new platforms are set up

## Fonts

Loaded from Google Fonts — Great Vibes (script), Playfair Display (headings), Lato (body).
