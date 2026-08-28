# Renewal Ledger — visual thesis

## Direction

**Neo-brutalist utility.** This is a control board for a small team before money
leaves the account: sturdy black rails, paper-like panels, highlighter yellow
for dates that need a decision, and a precise ledger grid. It should feel like
a wall calendar annotated by an attentive operations lead, not a finance
dashboard.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#171716` | main text, rules |
| Paper | `#f6f1e7` | page background |
| Surface | `#fffdf7` | raised panels |
| Signal | `#f5d547` | primary actions, imminent dates |
| Coral | `#e85b45` | cancellation / high-cost warning |
| Moss | `#28664f` | kept / calm status |
| Fog | `#d8d1c5` | quiet fills and dividers |

Type is a self-host-free system pairing: `Arial Black` / `Impact` for
compressed display labels, and `Inter, Arial, sans-serif` for clear body
copy. Tabular figures are used for money and dates. The scale is 12, 14, 16,
20, 28, 44 px. Space follows a 4/8 px rhythm.

## Interaction grammar

Panels have 2 px black outlines and offset shadows, like index cards pinned to
a planning board. Buttons move down/right by 2 px when pressed. Calendar rows
use a colored left rail plus a written status, never color alone. At 390 px,
the calendar becomes a chronological decision list; controls stack instead of
shrinking.

The only motion is a 180 ms panel settle and an optional short highlighter
wipe when data is loaded. With reduced motion, changes are immediate and the
wipe is removed.

## Art plan and provenance

Hero art is an original generated illustration of a desk calendar, paper
receipts, and coloured decision tabs. It clarifies that the product turns
renewing charges into a human review queue. It contains no text, logos, people,
or financial brands. Generated on 2026-08-28 with the factory image deployment
via `/opt/fleet/lib/gen-image.sh`; prompt and source sidecar live next to the
asset. It is converted to WebP and kept below 300 KB. The remaining marks and
icons are hand-authored SVG/CSS.

**Prompt sheet:** editorial still life; overhead renewal planning board with a
blank month grid, small generic calendar pages, unsigned paper invoices,
yellow and coral index tabs, thick black ink outlines, recycled cream paper,
slight screenprint grain, flat hard daylight, palette of cream / charcoal /
mustard / coral / deep green; no readable text, no logos, no watermark, no
people, no trademarks.
