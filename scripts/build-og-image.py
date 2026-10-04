"""Erzeugt das Standard-Vorschaubild public/images/og-standard.png (1200 × 630).

Weißer Hintergrund, Logo und Krähe nebeneinander, beide nur proportional
verkleinert (nicht beschnitten, nicht verzerrt), mit Rand.

Voraussetzung: pip install pillow
Aufruf (im Projektordner): python scripts/build-og-image.py
"""

from PIL import Image

WIDTH, HEIGHT = 1200, 630
MARGIN = 60
GAP = 60

logo = Image.open("public/images/logo-krefelder-laden.webp").convert("RGBA")
crow = Image.open("public/images/kraehe.jpg").convert("RGBA")

# Krähe: volle Innenhöhe; Logo: restliche Breite, ebenfalls höchstens Innenhöhe.
inner_height = HEIGHT - 2 * MARGIN
crow_size = (round(crow.width * inner_height / crow.height), inner_height)
logo_width = WIDTH - 2 * MARGIN - GAP - crow_size[0]
logo_scale = min(logo_width / logo.width, inner_height / logo.height)
logo_size = (round(logo.width * logo_scale), round(logo.height * logo_scale))

crow = crow.resize(crow_size, Image.LANCZOS)
logo = logo.resize(logo_size, Image.LANCZOS)

canvas = Image.new("RGBA", (WIDTH, HEIGHT), "white")
content_width = logo_size[0] + GAP + crow_size[0]
x = (WIDTH - content_width) // 2
canvas.alpha_composite(logo, (x, (HEIGHT - logo_size[1]) // 2))
canvas.alpha_composite(crow, (x + logo_size[0] + GAP, (HEIGHT - crow_size[1]) // 2))

canvas.convert("RGB").save("public/images/og-standard.png", optimize=True)
print("public/images/og-standard.png", canvas.size, "Logo", logo_size, "Krähe", crow_size)
