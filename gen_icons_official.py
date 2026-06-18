"""
Render official BODYBVILDER icon using Pillow only.
Parses the SVG polygon points and draws them directly.
"""
from PIL import Image, ImageDraw
import re, math

BG  = (10, 10, 15)
FIG = (255, 255, 255)   # logo-white
ACC = (0, 255, 136)     # logo-accent #00FF88

# SVG original viewBox: 0 0 141 236
SVG_W, SVG_H = 141, 236

# The main logo path from the SVG (logo-white fill)
MAIN_PATH = "M 5 5 L 5 230 L 16 231 L 16 209 L 32 199 L 26 189 L 45 203 L 65 211 L 120 209 L 133 204 L 136 201 L 136 193 L 131 164 L 101 109 L 69 99 L 59 117 L 59 121 L 61 123 L 63 121 L 66 126 L 68 126 L 69 119 L 70 126 L 75 129 L 83 127 L 83 125 L 76 123 L 78 116 L 79 121 L 86 124 L 95 122 L 100 134 L 99 137 L 92 128 L 97 147 L 95 169 L 100 183 L 93 176 L 89 164 L 80 155 L 73 152 L 63 152 L 50 159 L 52 149 L 48 140 L 42 134 L 30 128 L 13 127 L 26 124 L 28 118 L 26 96 L 14 96 L 31 91 L 41 83 L 48 68 L 48 61 L 44 57 L 46 56 L 58 61 L 66 61 L 77 57 L 87 47 L 90 37 L 96 30 L 92 48 L 100 64 L 100 73 L 103 67 L 105 67 L 104 80 L 98 75 L 90 75 L 88 73 L 82 76 L 81 81 L 79 77 L 77 78 L 76 82 L 80 95 L 84 98 L 106 97 L 112 94 L 125 50 L 121 17 L 113 12 L 63 9 L 47 13 L 28 28 L 27 26 L 31 21 L 16 12 L 16 5 Z"

def parse_path(d):
    """Parse SVG M/L/Z path commands into list of polygon point lists."""
    tokens = re.findall(r'[MLZmlz]|[-+]?\d*\.?\d+', d)
    polys = []
    current = []
    i = 0
    cx, cy = 0, 0
    while i < len(tokens):
        t = tokens[i]
        if t in ('M', 'm'):
            if current:
                polys.append(current)
                current = []
            cx, cy = float(tokens[i+1]), float(tokens[i+2])
            current = [(cx, cy)]
            i += 3
        elif t in ('L', 'l'):
            while i+1 < len(tokens) and tokens[i+1] not in 'MLZmlz':
                cx, cy = float(tokens[i+1]), float(tokens[i+2])
                current.append((cx, cy))
                i += 2
            i += 1
        elif t in ('Z', 'z'):
            if current:
                polys.append(current)
                current = []
            i += 1
        else:
            i += 1
    if current:
        polys.append(current)
    return polys


def make_icon(size):
    pad   = int(size * 0.08)
    avail = size - 2 * pad
    sx    = avail / SVG_W
    sy    = avail / SVG_H
    scale = min(sx, sy)
    ox    = pad + (avail - SVG_W * scale) / 2
    oy    = pad + (avail - SVG_H * scale) / 2

    def transform(pts):
        return [(ox + x * scale, oy + y * scale) for x, y in pts]

    img = Image.new('RGB', (size, size), BG)
    d   = ImageDraw.Draw(img)

    # Rounded-square clip mask
    mask = Image.new('L', (size, size), 0)
    dm   = ImageDraw.Draw(mask)
    r    = int(size * 0.20)
    dm.rounded_rectangle([0, 0, size-1, size-1], radius=r, fill=255)

    # Draw main logo path
    polys = parse_path(MAIN_PATH)
    for poly in polys:
        pts = transform(poly)
        if len(pts) >= 3:
            d.polygon(pts, fill=FIG)

    # Apply rounded mask
    result = Image.new('RGB', (size, size), BG)
    result.paste(img, mask=mask)
    return result


for size, name in [(192, 'public/icon-192.png'), (512, 'public/icon-512.png')]:
    icon = make_icon(size)
    icon.save(name)
    print(f'  ✓ {name}  ({size}x{size})')

print('Done — official BODYBVILDER logo rendered!')
