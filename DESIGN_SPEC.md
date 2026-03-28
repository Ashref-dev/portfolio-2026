 # PORTFOLIO DESIGN SPECIFICATION

## 1. CORE COLOR PALETTE
These are the four primary accent colors used for categorization, highlights, and visual identity.

| Name | Tailwind Class | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Rose (Red)** | `rose-600` | `#e11d48` | Problems, SaaS, Critical Highlights |
| **Amber (Orange)** | `amber-600` | `#d97706` | Systems, Awards, Warm Accents |
| **Blue** | `blue-600` | `#2563eb` | Infrastructure, Cloud, Professional Accents |
| **Emerald (Green)** | `emerald-600` | `#059669` | Microservices, Success, Availability |

### Neutral Tones
- **Background (Light):** `#fafafa` (Off-white)
- **Background (Dark):** `#171717` (Neutral 900)
- **Text (Primary):** `#0a0a0a` (Neutral 950)
- **Text (Secondary):** `#737373` (Neutral 500)

---

## 2. TYPOGRAPHY
We use a high-contrast pairing of a classic serif and a modern sans-serif.

- **Primary Serif:** `Instrument Serif`
  - *Role:* Headlines, Logo, Italic accents, Project titles.
  - *Feel:* Elegant, Architectural, Bespoke.
- **Primary Sans:** `Inter`
  - *Role:* Body copy, descriptions, UI elements.
  - *Feel:* Functional, Clean, Readable.

---

## 3. COMPONENT RULES
- **Border Radius:** Standardize on `rounded-2xl` (16px) for cards and `rounded-full` for pills/buttons.
- **Spacing:** Section vertical padding should be `py-24` (96px) or `py-32` (128px).
- **Transitions:** Use `power3.out` for GSAP reveals and `duration-500` for CSS transitions.