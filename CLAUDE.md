# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static wedding website for Gianluca & Sara (10 Dicembre 2026). No build system, no dependencies — pure HTML/CSS/JS, open any `.html` file directly in a browser.

## Architecture

All pages share a single `style.css` and `script.js`. The CSS uses CSS custom properties (`--gold`, `--dark`, `--ivory`, etc.) defined in `:root` — always use these variables rather than hardcoded colors.

| File | Purpose |
|------|---------|
| `index.html` | Home: hero, countdown, program, IBAN/gift list |
| `storia.html` | Photo gallery with lightbox |
| `info.html` | Logistics, maps, dress code |
| `rsvp.html` | RSVP form |
| `admin.html` | Private guest list manager |
| `script.js` | Countdown, mobile nav, scroll animations, FAQ accordion, RSVP form handler |

**Note:** `index.html` links to `faq.html` but that file does not exist yet.

## Key implementation details

**RSVP form** (`rsvp.html` + `script.js`): The submit handler fakes success locally (hides the form, shows `#successMessage`) — it does **not** send data anywhere. To actually collect RSVPs, a backend or third-party service (e.g. Formspree, Google Forms embed) must be wired up.

**Admin panel** (`admin.html`): Fully client-side. Guest data is stored in `localStorage` under key `wedding_guests_v2`. The admin password is hardcoded in the JS as `gs2026` — change it before publishing. Authentication uses `sessionStorage` only (no server).

**Lista nozze link** (`index.html:146`): The button points to `href="#lista-nozze"` — a placeholder that must be replaced with the real link.

**Fonts**: Loaded from Google Fonts — Great Vibes (script), Playfair Display (headings), Lato (body).
