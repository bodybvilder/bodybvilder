"""
Generate PWA icons (192x192 and 512x512) for BODYBVILDER.
Draws the 'B' lettermark with accent color on dark background.
"""
from PIL import Image, ImageDraw

def make_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Background circle — dark
    d.ellipse([0, 0, size, size], fill=(10, 10, 15, 255))

    # Inner padding
    p = int(size * 0.12)
    w = size - 2 * p

    # Draw a bold 'B' lettermark using rectangles/ellipses
    # Proportional to size
    lw = max(4, int(w * 0.18))   # stroke width
    bx = p + int(w * 0.18)       # left x of vertical bar
    by = p + int(w * 0.08)       # top y
    bh = w - int(w * 0.16)       # total height

    # Vertical bar of B
    d.rectangle([bx, by, bx + lw, by + bh], fill=(200, 255, 0, 255))

    # Top bump of B
    bump_h = int(bh * 0.46)
    bump_r = int(w * 0.34)
    bump_cx = bx + lw
    d.ellipse([bump_cx, by, bump_cx + bump_r * 2, by + bump_h],
              fill=(200, 255, 0, 255))
    # Cut out inner top bump
    cut = max(2, int(lw * 0.6))
    d.ellipse([bump_cx + cut, by + cut,
               bump_cx + bump_r * 2 - cut, by + bump_h - cut],
              fill=(10, 10, 15, 255))

    # Bottom bump of B (slightly wider)
    bump_r2 = int(w * 0.38)
    bottom_y = by + int(bh * 0.45)
    d.ellipse([bump_cx, bottom_y, bump_cx + bump_r2 * 2, by + bh],
              fill=(200, 255, 0, 255))
    # Cut out inner bottom bump
    d.ellipse([bump_cx + cut, bottom_y + cut,
               bump_cx + bump_r2 * 2 - cut, by + bh - cut],
              fill=(10, 10, 15, 255))

    # Clean left side of bumps (make sure vertical bar dominates)
    d.rectangle([bx, by, bx + lw, by + bh], fill=(200, 255, 0, 255))

    return img

for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png')]:
    icon = make_icon(size)
    icon.save(f'public/{name}')
    print(f'  ✓ {name}  ({size}×{size})')

print('Done!')
