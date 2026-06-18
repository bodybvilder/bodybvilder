"""
BODYBVILDER — GIF Generator
Generates all exercise & pose animated GIFs using Pillow.

Output: public/exercise-gifs/[exercise-id].gif
Spec  : 300x300px, #0a0a0a bg, #e0e0e0 figure, #C8FF00 accent, 16fps looping

Run:
    python generate_gifs_pillow.py

Dependencies:
    pip install Pillow
"""

import os
import math
from PIL import Image, ImageDraw

# ── Output directory ──────────────────────────────────────────────────────
OUT_DIR = os.path.join(os.path.dirname(__file__), "public", "exercise-gifs")
os.makedirs(OUT_DIR, exist_ok=True)

# ── Global constants ──────────────────────────────────────────────────────
W, H    = 300, 300          # canvas size
FPS     = 16                # frames per second
DURATION = 60               # ms per frame  (1000/16 ≈ 62ms)
BG      = (10, 10, 10)      # #0a0a0a
FIG     = (224, 224, 224)   # #e0e0e0  figure
ACC     = (200, 255, 0)     # #C8FF00  accent / joints
DIM     = (80, 80, 80)      # props / equipment
GND     = (45, 45, 45)      # ground line

LW      = 6                 # default limb width
JR      = 5                 # joint dot radius
HR      = 14                # head radius


# ═══════════════════════════════════════════════════════════════════════════
#  DRAWING HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def new_frame():
    img = Image.new("RGB", (W, H), BG)
    return img, ImageDraw.Draw(img)

def head(d, cx, cy, r=HR, color=FIG):
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=color)

def joint(d, x, y, r=JR, color=ACC):
    d.ellipse([x-r, y-r, x+r, y+r], fill=color)

def limb(d, x1, y1, x2, y2, w=LW, color=FIG):
    d.line([x1, y1, x2, y2], fill=color, width=w)
    # round caps via small ellipse
    hw = w // 2
    d.ellipse([x1-hw, y1-hw, x1+hw, y1+hw], fill=color)
    d.ellipse([x2-hw, y2-hw, x2+hw, y2+hw], fill=color)

def ground(d, y=275):
    d.line([20, y, W-20, y], fill=GND, width=2)

def bar(d, y=30, x1=60, x2=240):
    """Horizontal pull-up bar"""
    d.rectangle([x1, y, x2, y+8], fill=DIM)

def bench(d, bx=40, by=200, bw=220, bh=18):
    """Flat bench"""
    d.rectangle([bx, by, bx+bw, by+bh], fill=DIM)
    d.rectangle([bx+20,  by+bh, bx+40,  by+bh+30], fill=DIM)
    d.rectangle([bx+bw-40, by+bh, bx+bw-20, by+bh+30], fill=DIM)

def incline_bench(d):
    """Incline bench ~45°"""
    pts = [(80,260),(200,200),(220,200),(200,220),(90,278)]
    d.polygon(pts, fill=DIM)

def box_platform(d, bx=90, by=210, bw=120, bh=70):
    d.rectangle([bx, by, bx+bw, by+bh], fill=DIM)

def dumbbell(d, cx, cy, angle_deg=0, color=DIM):
    """Small dumbbell at (cx,cy) rotated angle_deg"""
    r = math.radians(angle_deg)
    dx, dy = math.cos(r)*22, math.sin(r)*22
    d.line([cx-dx, cy-dy, cx+dx, cy+dy], fill=color, width=5)
    for sx, sy in [(-1,-1),(+1,+1)]:
        ex, ey = cx+sx*dx, cy+sy*dy
        d.ellipse([ex-7, ey-7, ex+7, ey+7], fill=color)

def barbell(d, cx, cy, angle_deg=0, length=160, color=DIM):
    """Barbell at (cx,cy)"""
    r = math.radians(angle_deg)
    dx, dy = math.cos(r)*length/2, math.sin(r)*length/2
    d.line([cx-dx, cy-dy, cx+dx, cy+dy], fill=color, width=5)
    for sx, sy in [(-1,-1),(+1,+1)]:
        ex, ey = cx+sx*dx, cy+sy*dy
        for off in [-10, 0, 10]:
            ox = -math.sin(r)*off; oy = math.cos(r)*off
            d.ellipse([ex+ox-8, ey+oy-8, ex+ox+8, ey+oy+8], fill=color)

def cable_line(d, x1, y1, x2, y2):
    d.line([x1, y1, x2, y2], fill=DIM, width=3)

def save_gif(frames, name, duration=DURATION):
    path = os.path.join(OUT_DIR, f"{name}.gif")
    frames[0].save(
        path,
        save_all=True,
        append_images=frames[1:],
        loop=0,
        duration=duration,
        optimize=False,
    )
    print(f"  ✓ {name}.gif  ({len(frames)} frames)")


# ═══════════════════════════════════════════════════════════════════════════
#  INTERPOLATION HELPER
# ═══════════════════════════════════════════════════════════════════════════

def lerp(a, b, t):
    return a + (b - a) * t

def ease(t):
    """Smooth ease-in-out"""
    return t * t * (3 - 2 * t)

def interp_poses(pose_a, pose_b, n_frames):
    """
    pose_a, pose_b: dicts of {key: (x,y) or float}
    Returns list of n_frames interpolated pose dicts.
    """
    frames = []
    for i in range(n_frames):
        t = ease(i / (n_frames - 1)) if n_frames > 1 else 0
        p = {}
        for k in pose_a:
            va, vb = pose_a[k], pose_b[k]
            if isinstance(va, tuple):
                p[k] = (lerp(va[0], vb[0], t), lerp(va[1], vb[1], t))
            else:
                p[k] = lerp(va, vb, t)
        frames.append(p)
    return frames

def ping_pong(forward_frames):
    """Forward + backward (ping-pong) loop without duplicate endpoints"""
    return forward_frames + list(reversed(forward_frames[1:-1]))


# ═══════════════════════════════════════════════════════════════════════════
#  FIGURE RENDERER — side-view stick figure
#  All coordinates relative to 300x300 canvas.
#
#  Skeleton joints passed as a dict:
#    head   : (cx, cy)
#    neck   : (x, y)
#    shoulder_l / shoulder_r : (x, y)
#    elbow_l / elbow_r       : (x, y)
#    hand_l  / hand_r        : (x, y)
#    hip     : (x, y)
#    knee_l  / knee_r        : (x, y)
#    foot_l  / foot_r        : (x, y)
#
#  Missing keys are skipped gracefully.
#  Accent joints: elbow_l, elbow_r, knee_l, knee_r by default.
# ═══════════════════════════════════════════════════════════════════════════

ACCENT_JOINTS = {'elbow_l', 'elbow_r', 'knee_l', 'knee_r'}

def draw_figure(d, pose, accent_joints=None, lw=LW):
    if accent_joints is None:
        accent_joints = ACCENT_JOINTS

    def pt(k):
        v = pose.get(k)
        if v is None:
            return None
        return (int(v[0]), int(v[1]))

    def seg(a, b, color=FIG, w=None):
        pa, pb = pt(a), pt(b)
        if pa and pb:
            limb(d, pa[0], pa[1], pb[0], pb[1], w=w or lw, color=color)

    def dot(k):
        p = pt(k)
        if p:
            color = ACC if k in accent_joints else FIG
            joint(d, p[0], p[1], r=JR if k in accent_joints else 4, color=color)

    # Torso
    seg('neck', 'hip')
    # Head
    ph = pt('head')
    if ph:
        head(d, ph[0], ph[1])
    pn = pt('neck')
    if pn:
        head(d, pn[0], pn[1], r=5, color=FIG)   # neck dot

    # Arms
    seg('shoulder_l', 'elbow_l')
    seg('elbow_l',    'hand_l')
    seg('shoulder_r', 'elbow_r')
    seg('elbow_r',    'hand_r')

    # Legs
    seg('hip',    'knee_l',  w=lw+1)
    seg('knee_l', 'foot_l')
    seg('hip',    'knee_r',  w=lw+1)
    seg('knee_r', 'foot_r')

    # Accent dots on key joints
    for k in ['elbow_l', 'elbow_r', 'knee_l', 'knee_r']:
        dot(k)


def rotate_point(px, py, cx, cy, deg):
    """Rotate (px,py) around (cx,cy) by deg degrees"""
    r = math.radians(deg)
    dx, dy = px - cx, py - cy
    nx = dx * math.cos(r) - dy * math.sin(r)
    ny = dx * math.sin(r) + dy * math.cos(r)
    return cx + nx, cy + ny


# ═══════════════════════════════════════════════════════════════════════════
#  CHEST EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_pushup():
    # Side view plank — arms extend/flex, body stays rigid horizontal
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        # top = arms straight, bottom = elbows bent, chest near floor
        # Body diagonal: head at left ~(80,155), feet at right ~(255,210)
        shoulder_y = lerp(155, 170, t)
        elbow_x    = lerp(110, 120, t)
        elbow_y    = lerp(175, 210, t)
        hand_x     = lerp(80,  90,  t)
        hand_y     = lerp(180, 220, t)

        img, d = new_frame()
        ground(d, 230)
        pose = {
            'head':       (55,  145),
            'neck':       (75,  155),
            'shoulder_l': (120, shoulder_y),
            'elbow_l':    (elbow_x, elbow_y),
            'hand_l':     (hand_x,  hand_y),
            'shoulder_r': (120, shoulder_y),
            'elbow_r':    (elbow_x, elbow_y),
            'hand_r':     (hand_x,  hand_y),
            'hip':        (190, 185),
            'knee_l':     (220, 200),
            'foot_l':     (260, 218),
            'knee_r':     (220, 200),
            'foot_r':     (260, 220),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'pushup')

def gen_incline_pushup():
    # Hands on elevated surface (box at ~y=180), feet on floor
    N = 10
    frames = []
    box_y = 190
    for i in range(N):
        t = ease(i / (N - 1))
        elbow_y = lerp(box_y - 10, box_y + 20, t)
        chest_y = lerp(box_y - 5,  box_y + 25, t)
        img, d = new_frame()
        ground(d, 275)
        box_platform(d, bx=30, by=box_y, bw=100, bh=20)
        pose = {
            'head':       (55,  130),
            'neck':       (75,  145),
            'shoulder_l': (120, 160),
            'elbow_l':    (85,  elbow_y),
            'hand_l':     (65,  box_y),
            'shoulder_r': (120, 160),
            'elbow_r':    (85,  elbow_y),
            'hand_r':     (65,  box_y),
            'hip':        (185, 205),
            'knee_l':     (225, 240),
            'foot_l':     (260, 270),
            'knee_r':     (225, 240),
            'foot_r':     (260, 272),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'incline-pushup')

def gen_decline_pushup():
    # Feet elevated on box, hands on floor
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        elbow_y = lerp(195, 225, t)
        hand_y  = lerp(215, 245, t)
        img, d = new_frame()
        ground(d, 275)
        box_platform(d, bx=180, by=190, bw=110, bh=70)
        pose = {
            'head':       (55,  120),
            'neck':       (75,  130),
            'shoulder_l': (120, 145),
            'elbow_l':    (85,  elbow_y),
            'hand_l':     (65,  hand_y),
            'shoulder_r': (120, 145),
            'elbow_r':    (85,  elbow_y),
            'hand_r':     (65,  hand_y),
            'hip':        (195, 175),
            'knee_l':     (230, 195),
            'foot_l':     (255, 205),
            'knee_r':     (230, 195),
            'foot_r':     (255, 207),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'decline-pushup')

def gen_diamond_pushup():
    # Hands close together under chest
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        elbow_y = lerp(185, 218, t)
        img, d = new_frame()
        ground(d, 230)
        # Diamond hand indicator
        d.polygon([(135,225),(150,210),(165,225),(150,240)], outline=ACC, fill=None, width=2)
        pose = {
            'head':       (55,  145),
            'neck':       (75,  155),
            'shoulder_l': (120, 168),
            'elbow_l':    (138, elbow_y),
            'hand_l':     (145, 225),
            'shoulder_r': (120, 168),
            'elbow_r':    (155, elbow_y),
            'hand_r':     (155, 225),
            'hip':        (190, 185),
            'knee_l':     (220, 200),
            'foot_l':     (260, 220),
            'knee_r':     (220, 200),
            'foot_r':     (260, 222),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'diamond-pushup')

def gen_wide_pushup():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        elbow_y = lerp(178, 208, t)
        img, d = new_frame()
        ground(d, 235)
        pose = {
            'head':       (55,  148),
            'neck':       (75,  158),
            'shoulder_l': (120, 170),
            'elbow_l':    (65,  elbow_y),   # wide flare
            'hand_l':     (40,  225),
            'shoulder_r': (120, 170),
            'elbow_r':    (175, elbow_y),
            'hand_r':     (210, 225),
            'hip':        (195, 188),
            'knee_l':     (230, 205),
            'foot_l':     (265, 224),
            'knee_r':     (230, 205),
            'foot_r':     (265, 226),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'wide-pushup')

def gen_pike_pushup():
    # Inverted-V: hips high, head toward floor
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        head_y   = lerp(195, 225, t)
        elbow_y  = lerp(208, 238, t)
        img, d = new_frame()
        ground(d, 270)
        pose = {
            'head':       (130, head_y),
            'neck':       (140, head_y - 15),
            'shoulder_l': (155, 175),
            'elbow_l':    (120, elbow_y),
            'hand_l':     (100, 265),
            'shoulder_r': (155, 175),
            'elbow_r':    (190, elbow_y),
            'hand_r':     (210, 265),
            'hip':        (175, 110),     # hips HIGH
            'knee_l':     (165, 175),
            'foot_l':     (155, 265),
            'knee_r':     (185, 175),
            'foot_r':     (195, 265),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'pike-pushup')

def gen_incline_dumbbell_press():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(110, 160, t)
        elbow_y = lerp(145, 180, t)
        img, d = new_frame()
        incline_bench(d)
        dumbbell(d, 95,  hand_y, angle_deg=0)
        dumbbell(d, 205, hand_y, angle_deg=0)
        pose = {
            'head':       (230, 130),
            'neck':       (215, 150),
            'shoulder_l': (165, 175),
            'elbow_l':    (120, elbow_y),
            'hand_l':     (95,  hand_y),
            'shoulder_r': (165, 175),
            'elbow_r':    (210, elbow_y),
            'hand_r':     (205, hand_y),
            'hip':        (110, 215),
            'knee_l':     (75,  250),
            'foot_l':     (45,  268),
            'knee_r':     (75,  252),
            'foot_r':     (45,  270),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'incline-dumbbell-press')

def gen_dumbbell_fly():
    # Arc motion — arms open wide then close above chest, elbows fixed slightly bent
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_lx = lerp(60,  130, t)   # open → close
        hand_rx = lerp(240, 170, t)
        hand_y  = lerp(175, 155, t)   # slight arc up
        elbow_lx = lerp(80,  120, t)
        elbow_rx = lerp(220, 180, t)
        elbow_y  = lerp(185, 170, t)
        img, d = new_frame()
        bench(d, by=200)
        dumbbell(d, int(hand_lx), int(hand_y))
        dumbbell(d, int(hand_rx), int(hand_y))
        pose = {
            'head':       (240, 145),
            'neck':       (220, 160),
            'shoulder_l': (175, 185),
            'elbow_l':    (elbow_lx, elbow_y),
            'hand_l':     (hand_lx,  hand_y),
            'shoulder_r': (175, 185),
            'elbow_r':    (elbow_rx, elbow_y),
            'hand_r':     (hand_rx,  hand_y),
            'hip':        (120, 200),
            'knee_l':     (90,  240),
            'foot_l':     (70,  268),
            'knee_r':     (90,  242),
            'foot_r':     (70,  270),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'dumbbell-fly')

def gen_cable_fly():
    # Standing, arms arc from wide to center
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_lx = lerp(40,  130, t)
        hand_rx = lerp(260, 170, t)
        hand_y  = lerp(160, 175, t)
        elbow_lx = lerp(75,  120, t)
        elbow_rx = lerp(225, 180, t)
        img, d = new_frame()
        ground(d)
        # Cable lines from top sides
        cable_line(d, 20, 30, int(hand_lx), int(hand_y))
        cable_line(d, 280, 30, int(hand_rx), int(hand_y))
        pose = {
            'head':       (150, 60),
            'neck':       (150, 75),
            'shoulder_l': (125, 110),
            'elbow_l':    (elbow_lx, 145),
            'hand_l':     (hand_lx, hand_y),
            'shoulder_r': (175, 110),
            'elbow_r':    (elbow_rx, 145),
            'hand_r':     (hand_rx, hand_y),
            'hip':        (150, 185),
            'knee_l':     (135, 230),
            'foot_l':     (125, 272),
            'knee_r':     (165, 230),
            'foot_r':     (175, 272),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'cable-fly')

def gen_barbell_bench_press():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        bar_y   = lerp(125, 175, t)
        elbow_y = lerp(155, 185, t)
        img, d = new_frame()
        bench(d, by=200)
        barbell(d, 150, int(bar_y), length=180)
        pose = {
            'head':       (240, 145),
            'neck':       (220, 162),
            'shoulder_l': (170, 185),
            'elbow_l':    (110, int(elbow_y)),
            'hand_l':     (80,  int(bar_y)),
            'shoulder_r': (170, 185),
            'elbow_r':    (230, int(elbow_y)),
            'hand_r':     (220, int(bar_y)),
            'hip':        (115, 200),
            'knee_l':     (85,  240),
            'foot_l':     (65,  268),
            'knee_r':     (85,  242),
            'foot_r':     (65,  270),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'barbell-bench-press')


# ═══════════════════════════════════════════════════════════════════════════
#  BACK EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_dead_hang():
    # Static hang — gentle sway
    N = 8
    frames = []
    for i in range(N):
        t = math.sin(i / (N - 1) * math.pi)  # 0→1→0
        sway = lerp(-6, 6, t)
        img, d = new_frame()
        bar(d, y=25)
        cx = 150 + sway
        pose = {
            'head':       (cx, 85),
            'neck':       (cx, 100),
            'shoulder_l': (cx - 20, 112),
            'elbow_l':    (cx - 18, 80),
            'hand_l':     (cx - 16, 40),
            'shoulder_r': (cx + 20, 112),
            'elbow_r':    (cx + 18, 80),
            'hand_r':     (cx + 16, 40),
            'hip':        (cx, 175),
            'knee_l':     (cx - 8, 225),
            'foot_l':     (cx - 6, 275),
            'knee_r':     (cx + 8, 225),
            'foot_r':     (cx + 6, 275),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(frames + list(reversed(frames[1:-1])), 'dead-hang', duration=120)

def gen_pullup():
    # Hang at bottom, pull chin above bar
    N = 12
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        # bottom: body fully extended; top: chin over bar
        body_y   = lerp(0, -80, t)   # whole figure rises
        elbow_y  = lerp(80, 40, t)
        img, d = new_frame()
        bar(d, y=28)
        pose = {
            'head':       (150, 90  + body_y),
            'neck':       (150, 106 + body_y),
            'shoulder_l': (128, 118 + body_y),
            'elbow_l':    (120, elbow_y + body_y + 30),
            'hand_l':     (118, 36),
            'shoulder_r': (172, 118 + body_y),
            'elbow_r':    (180, elbow_y + body_y + 30),
            'hand_r':     (182, 36),
            'hip':        (150, 180 + body_y),
            'knee_l':     (140, 232 + body_y),
            'foot_l':     (138, 278 + body_y),
            'knee_r':     (160, 232 + body_y),
            'foot_r':     (162, 278 + body_y),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'pullup')

def gen_chinup():
    # Same as pullup but underhand (palms facing — visual difference in hand angle)
    N = 12
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        body_y  = lerp(0, -78, t)
        elbow_y = lerp(80, 38, t)
        img, d = new_frame()
        bar(d, y=28)
        # Underhand grip indicator — accent on hands
        pose = {
            'head':       (150, 90  + body_y),
            'neck':       (150, 106 + body_y),
            'shoulder_l': (130, 118 + body_y),
            'elbow_l':    (122, elbow_y + body_y + 28),
            'hand_l':     (126, 36),   # hands closer = underhand
            'shoulder_r': (170, 118 + body_y),
            'elbow_r':    (178, elbow_y + body_y + 28),
            'hand_r':     (174, 36),
            'hip':        (150, 180 + body_y),
            'knee_l':     (140, 232 + body_y),
            'foot_l':     (138, 278 + body_y),
            'knee_r':     (160, 232 + body_y),
            'foot_r':     (162, 278 + body_y),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r','hand_l','hand_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'chinup')

def gen_bodyweight_row():
    # Diagonal under low bar, heels on floor, pull chest to bar
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        # top = arms bent, chest to bar; bottom = arms straight
        chest_y = lerp(145, 110, t)
        elbow_y = lerp(135, 105, t)
        img, d = new_frame()
        bar(d, y=110, x1=50, x2=250)
        ground(d, 272)
        pose = {
            'head':       (65, chest_y - 25),
            'neck':       (85, chest_y - 12),
            'shoulder_l': (120, chest_y),
            'elbow_l':    (100, elbow_y),
            'hand_l':     (85,  112),
            'shoulder_r': (120, chest_y),
            'elbow_r':    (140, elbow_y),
            'hand_r':     (155, 112),
            'hip':        (185, chest_y + 40),
            'knee_l':     (220, chest_y + 70),
            'foot_l':     (255, 268),
            'knee_r':     (220, chest_y + 72),
            'foot_r':     (255, 270),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'bodyweight-row')

def gen_superman():
    # Prone on floor, lift arms+chest+legs
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        lift = lerp(0, -28, t)   # upward lift
        img, d = new_frame()
        ground(d, 210)
        pose = {
            'head':       (55,  195 + lift),
            'neck':       (75,  200 + lift),
            'shoulder_l': (115, 205 + lift * 0.8),
            'elbow_l':    (80,  200 + lift),
            'hand_l':     (45,  198 + lift),
            'shoulder_r': (115, 205 + lift * 0.8),
            'elbow_r':    (80,  205 + lift),
            'hand_r':     (45,  203 + lift),
            'hip':        (175, 208),
            'knee_l':     (220, 205 + lift * 0.5),
            'foot_l':     (265, 200 + lift),
            'knee_r':     (220, 207 + lift * 0.5),
            'foot_r':     (265, 202 + lift),
        }
        draw_figure(d, pose, accent_joints={'hand_l','hand_r','foot_l','foot_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'superman')

def gen_barbell_row():
    # Bent-over, barbell pulled to waist
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        bar_y  = lerp(215, 165, t)
        elbow_y = lerp(205, 158, t)
        img, d = new_frame()
        ground(d)
        barbell(d, 150, int(bar_y), length=160)
        pose = {
            'head':       (215, 110),
            'neck':       (198, 128),
            'shoulder_l': (165, 155),
            'elbow_l':    (130, int(elbow_y)),
            'hand_l':     (105, int(bar_y)),
            'shoulder_r': (165, 155),
            'elbow_r':    (195, int(elbow_y)),
            'hand_r':     (210, int(bar_y)),
            'hip':        (135, 175),
            'knee_l':     (120, 220),
            'foot_l':     (110, 268),
            'knee_r':     (160, 220),
            'foot_r':     (170, 268),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'barbell-row')

def gen_dumbbell_row():
    # One knee on bench, one arm rows
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        elbow_y = lerp(190, 148, t)
        hand_y  = lerp(220, 178, t)
        img, d = new_frame()
        bench(d, bx=60, by=185, bw=130, bh=14)
        dumbbell(d, 235, int(hand_y))
        pose = {
            'head':       (230, 105),
            'neck':       (215, 122),
            'shoulder_l': (180, 148),
            'elbow_l':    (115, 162),    # support arm on bench
            'hand_l':     (90,  188),
            'shoulder_r': (180, 148),
            'elbow_r':    (215, int(elbow_y)),
            'hand_r':     (235, int(hand_y)),
            'hip':        (155, 185),
            'knee_l':     (120, 188),    # knee on bench
            'foot_l':     (100, 210),
            'knee_r':     (175, 232),
            'foot_r':     (185, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_r','knee_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'dumbbell-row')

def gen_barbell_deadlift():
    N = 12
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        # bottom: hinge forward; top: standing upright
        head_y    = lerp(115, 65,  t)
        neck_y    = lerp(132, 82,  t)
        torso_ang = lerp(55,  5,   t)   # torso angle from vertical (degrees)
        bar_y     = lerp(255, 195, t)
        img, d = new_frame()
        ground(d)
        barbell(d, 150, int(bar_y), length=170)
        # Hip pivot at (150, 200)
        hx, hy = 150, 200
        # Shoulder position from hip via torso angle
        sr = math.radians(torso_ang)
        sx = hx + math.sin(sr) * 90
        sy = hy - math.cos(sr) * 90
        pose = {
            'head':       (sx + math.sin(sr)*20, sy - 18),
            'neck':       (sx, sy),
            'shoulder_l': (sx - 18, sy + 5),
            'elbow_l':    (sx - 15, sy + 55),
            'hand_l':     (lerp(115, 135, t), int(bar_y)),
            'shoulder_r': (sx + 18, sy + 5),
            'elbow_r':    (sx + 15, sy + 55),
            'hand_r':     (lerp(185, 165, t), int(bar_y)),
            'hip':        (hx, hy),
            'knee_l':     (lerp(130, 135, t), lerp(235, 245, t)),
            'foot_l':     (125, 268),
            'knee_r':     (lerp(170, 165, t), lerp(235, 245, t)),
            'foot_r':     (175, 268),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'barbell-deadlift')

def gen_romanian_deadlift():
    # Knees fixed slight bend, pure hip hinge, bar stops above floor
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        torso_ang = lerp(5, 65, t)
        bar_y     = lerp(195, 245, t)
        hx, hy = 150, 195
        sr = math.radians(torso_ang)
        sx = hx + math.sin(sr) * 88
        sy = hy - math.cos(sr) * 88
        img, d = new_frame()
        ground(d)
        barbell(d, int(sx), int(bar_y), length=160)
        pose = {
            'head':       (sx + math.sin(sr)*18, sy - 17),
            'neck':       (sx, sy),
            'shoulder_l': (sx - 16, sy + 5),
            'elbow_l':    (sx - 12, sy + 52),
            'hand_l':     (lerp(128, 108, t), int(bar_y)),
            'shoulder_r': (sx + 16, sy + 5),
            'elbow_r':    (sx + 12, sy + 52),
            'hand_r':     (lerp(172, 192, t), int(bar_y)),
            'hip':        (hx, hy),
            'knee_l':     (135, 240),   # fixed slight bend
            'foot_l':     (128, 268),
            'knee_r':     (165, 240),
            'foot_r':     (172, 268),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'romanian-deadlift')

def gen_lat_pulldown():
    # Seated, pull wide bar down to upper chest
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        bar_y  = lerp(55, 120, t)
        elbow_y = lerp(75, 140, t)
        img, d = new_frame()
        # Machine frame
        d.rectangle([60, 20, 240, 30], fill=DIM)  # top bar
        cable_line(d, 150, 30, 150, int(bar_y))
        d.line([70, int(bar_y), 230, int(bar_y)], fill=DIM, width=6)  # pulldown bar
        bench(d, bx=80, by=225, bw=140, bh=12)
        ground(d)
        pose = {
            'head':       (150, 155),
            'neck':       (150, 172),
            'shoulder_l': (122, 192),
            'elbow_l':    (85,  int(elbow_y)),
            'hand_l':     (75,  int(bar_y)),
            'shoulder_r': (178, 192),
            'elbow_r':    (215, int(elbow_y)),
            'hand_r':     (225, int(bar_y)),
            'hip':        (150, 228),
            'knee_l':     (125, 265),
            'foot_l':     (110, 275),
            'knee_r':     (175, 265),
            'foot_r':     (190, 275),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'lat-pulldown')

def gen_seated_cable_row():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_x  = lerp(215, 160, t)   # pull toward stomach
        elbow_x = lerp(205, 150, t)
        img, d = new_frame()
        ground(d)
        # Footplate
        d.rectangle([220, 195, 260, 210], fill=DIM)
        cable_line(d, 265, 202, int(hand_x), 185)
        bench(d, bx=60, by=195, bw=100, bh=10)
        pose = {
            'head':       (100, 130),
            'neck':       (108, 147),
            'shoulder_l': (120, 168),
            'elbow_l':    (int(elbow_x) - 10, 175),
            'hand_l':     (int(hand_x),  182),
            'shoulder_r': (120, 168),
            'elbow_r':    (int(elbow_x) + 10, 175),
            'hand_r':     (int(hand_x),  188),
            'hip':        (118, 198),
            'knee_l':     (165, 200),
            'foot_l':     (222, 202),
            'knee_r':     (165, 202),
            'foot_r':     (222, 204),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'seated-cable-row')

def gen_t_bar_row():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        bar_y  = lerp(225, 175, t)
        elbow_y = lerp(215, 168, t)
        img, d = new_frame()
        ground(d)
        # T-bar pivot at floor center
        d.line([150, 270, 150, int(bar_y)], fill=DIM, width=5)
        dumbbell(d, 150, int(bar_y), angle_deg=90)
        pose = {
            'head':       (215, 108),
            'neck':       (198, 126),
            'shoulder_l': (165, 152),
            'elbow_l':    (145, int(elbow_y)),
            'hand_l':     (140, int(bar_y)),
            'shoulder_r': (165, 152),
            'elbow_r':    (160, int(elbow_y)),
            'hand_r':     (160, int(bar_y)),
            'hip':        (138, 175),
            'knee_l':     (125, 218),
            'foot_l':     (115, 265),
            'knee_r':     (158, 218),
            'foot_r':     (168, 265),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 't-bar-row')

def gen_good_morning():
    # Barbell on back, hip hinge
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        torso_ang = lerp(5, 70, t)
        hx, hy = 150, 198
        sr = math.radians(torso_ang)
        sx = hx + math.sin(sr) * 85
        sy = hy - math.cos(sr) * 85
        img, d = new_frame()
        ground(d)
        # Barbell behind neck/shoulders
        barbell(d, int(sx), int(sy) + 5, length=155)
        pose = {
            'head':       (sx + math.sin(sr)*22, sy - 16),
            'neck':       (sx, sy),
            'shoulder_l': (sx - 18, sy + 6),
            'elbow_l':    (sx - 35, sy + 20),
            'hand_l':     (sx - 55, sy + 8),
            'shoulder_r': (sx + 18, sy + 6),
            'elbow_r':    (sx + 35, sy + 20),
            'hand_r':     (sx + 55, sy + 8),
            'hip':        (hx, hy),
            'knee_l':     (135, 242),
            'foot_l':     (128, 268),
            'knee_r':     (165, 242),
            'foot_r':     (172, 268),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'good-morning')

def gen_barbell_shrug():
    N = 8
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        shrug = lerp(0, -22, t)   # shoulders rise
        img, d = new_frame()
        ground(d)
        barbell(d, 150, 220, length=165)
        pose = {
            'head':       (150, 60 + shrug * 0.3),
            'neck':       (150, 78 + shrug * 0.5),
            'shoulder_l': (115, 105 + shrug),
            'elbow_l':    (105, 160),
            'hand_l':     (100, 215),
            'shoulder_r': (185, 105 + shrug),
            'elbow_r':    (195, 160),
            'hand_r':     (200, 215),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'shoulder_l','shoulder_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'barbell-shrug')


# ═══════════════════════════════════════════════════════════════════════════
#  SHOULDER EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_lateral_raise():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        arm_y = lerp(155, 108, t)   # arms rise to shoulder height
        img, d = new_frame()
        ground(d)
        dumbbell(d, 80,  int(arm_y))
        dumbbell(d, 220, int(arm_y))
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (90,  int(arm_y) - 8),
            'hand_l':     (75,  int(arm_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (210, int(arm_y) - 8),
            'hand_r':     (225, int(arm_y)),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r','hand_l','hand_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'lateral-raise')

def gen_front_raise():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y  = lerp(210, 108, t)
        elbow_y = lerp(195, 125, t)
        img, d = new_frame()
        ground(d)
        dumbbell(d, 118, int(hand_y))
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (118, int(elbow_y)),
            'hand_l':     (118, int(hand_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (185, 155),
            'hand_r':     (188, 185),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','hand_l'})
        frames.append(img)
    save_gif(ping_pong(frames), 'front-raise')

def gen_shoulder_tap():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        # Plank position, alternating hand taps shoulder
        tap_phase = int(t * 2) % 2
        img, d = new_frame()
        ground(d, 230)
        if tap_phase == 0:
            pose = {
                'head':       (55, 148),
                'neck':       (75, 158),
                'shoulder_l': (120, 170),
                'elbow_l':    (105, 195),
                'hand_l':     (90,  220),
                'shoulder_r': (120, 170),
                'elbow_r':    (148, 158),  # right hand taps left shoulder
                'hand_r':     (120, 170),
                'hip':        (195, 188),
                'knee_l':     (230, 205),
                'foot_l':     (265, 222),
                'knee_r':     (230, 205),
                'foot_r':     (265, 224),
            }
        else:
            pose = {
                'head':       (55, 148),
                'neck':       (75, 158),
                'shoulder_l': (120, 170),
                'elbow_l':    (92,  158),  # left hand taps right shoulder
                'hand_l':     (120, 170),
                'shoulder_r': (120, 170),
                'elbow_r':    (135, 195),
                'hand_r':     (150, 220),
                'hip':        (195, 188),
                'knee_l':     (230, 205),
                'foot_l':     (265, 222),
                'knee_r':     (230, 205),
                'foot_r':     (265, 224),
            }
        draw_figure(d, pose, accent_joints={'hand_l','hand_r'})
        frames.append(img)
    save_gif(frames, 'shoulder-tap', duration=80)

def gen_overhead_press():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        bar_y  = lerp(125, 48, t)
        elbow_y = lerp(118, 80, t)
        img, d = new_frame()
        ground(d)
        barbell(d, 150, int(bar_y), length=150)
        pose = {
            'head':       (150, 65),
            'neck':       (150, 82),
            'shoulder_l': (118, 108),
            'elbow_l':    (100, int(elbow_y)),
            'hand_l':     (108, int(bar_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (200, int(elbow_y)),
            'hand_r':     (192, int(bar_y)),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'overhead-press')

def gen_arnold_press():
    # Rotation of wrists as pressing up
    N = 12
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y  = lerp(148, 55,  t)
        elbow_y = lerp(138, 82,  t)
        rot     = lerp(0,   180, t)   # wrist rotation for dumbbell
        img, d = new_frame()
        ground(d)
        dumbbell(d, 108, int(hand_y), angle_deg=rot)
        dumbbell(d, 192, int(hand_y), angle_deg=-rot)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (100, int(elbow_y)),
            'hand_l':     (108, int(hand_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (200, int(elbow_y)),
            'hand_r':     (192, int(hand_y)),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r','hand_l','hand_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'arnold-press')

def gen_face_pull():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_x_l = lerp(210, 118, t)
        hand_x_r = lerp(210, 182, t)
        elbow_y  = lerp(108, 88,  t)   # elbows flare high
        img, d = new_frame()
        ground(d)
        cable_line(d, 265, 108, int(hand_x_l), 108)
        cable_line(d, 265, 108, int(hand_x_r), 108)
        pose = {
            'head':       (115, 62),
            'neck':       (118, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (80,  int(elbow_y)),
            'hand_l':     (int(hand_x_l), 108),
            'shoulder_r': (182, 108),
            'elbow_r':    (220, int(elbow_y)),
            'hand_r':     (int(hand_x_r), 108),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'face-pull')

def gen_cable_lateral_raise():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(185, 105, t)
        elbow_y = lerp(175, 112, t)
        img, d = new_frame()
        ground(d)
        cable_line(d, 30, 240, 118, int(hand_y))
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (100, int(elbow_y)),
            'hand_l':     (118, int(hand_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (192, 148),
            'hand_r':     (195, 175),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','hand_l'})
        frames.append(img)
    save_gif(ping_pong(frames), 'cable-lateral-raise')

def gen_dumbbell_shoulder_press():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y  = lerp(128, 48, t)
        elbow_y = lerp(120, 78, t)
        img, d = new_frame()
        bench(d, bx=80, by=215, bw=140, bh=12)
        ground(d)
        dumbbell(d, 100, int(hand_y))
        dumbbell(d, 200, int(hand_y))
        pose = {
            'head':       (150, 145),
            'neck':       (150, 162),
            'shoulder_l': (118, 185),
            'elbow_l':    (95,  int(elbow_y) + 60),
            'hand_l':     (100, int(hand_y) + 60),
            'shoulder_r': (182, 185),
            'elbow_r':    (205, int(elbow_y) + 60),
            'hand_r':     (200, int(hand_y) + 60),
            'hip':        (150, 218),
            'knee_l':     (128, 255),
            'foot_l':     (115, 275),
            'knee_r':     (172, 255),
            'foot_r':     (185, 275),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'dumbbell-shoulder-press')

def gen_upright_row():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        bar_y  = lerp(215, 130, t)
        elbow_y = lerp(200, 100, t)
        img, d = new_frame()
        ground(d)
        barbell(d, 150, int(bar_y), length=100)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (95,  int(elbow_y)),
            'hand_l':     (120, int(bar_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (205, int(elbow_y)),
            'hand_r':     (180, int(bar_y)),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'upright-row')

def gen_reverse_fly():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_ly = lerp(200, 142, t)
        hand_lx = lerp(140, 80,  t)
        hand_ry = lerp(200, 142, t)
        hand_rx = lerp(175, 238, t)
        img, d = new_frame()
        ground(d)
        dumbbell(d, int(hand_lx), int(hand_ly))
        dumbbell(d, int(hand_rx), int(hand_ry))
        pose = {
            'head':       (218, 110),
            'neck':       (202, 128),
            'shoulder_l': (165, 155),
            'elbow_l':    (int(hand_lx) + 25, int(hand_ly) - 15),
            'hand_l':     (int(hand_lx), int(hand_ly)),
            'shoulder_r': (165, 155),
            'elbow_r':    (int(hand_rx) - 25, int(hand_ry) - 15),
            'hand_r':     (int(hand_rx), int(hand_ry)),
            'hip':        (135, 178),
            'knee_l':     (120, 222),
            'foot_l':     (110, 265),
            'knee_r':     (158, 222),
            'foot_r':     (168, 265),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'reverse-fly')


# ═══════════════════════════════════════════════════════════════════════════
#  TRICEPS EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_dip():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        body_y = lerp(0, 30, t)   # body drops
        img, d = new_frame()
        ground(d)
        # Parallel bars
        d.line([75, 115, 75, 240], fill=DIM, width=8)
        d.line([225, 115, 225, 240], fill=DIM, width=8)
        d.line([60, 115, 240, 115], fill=DIM, width=5)
        pose = {
            'head':       (150, 58  + body_y),
            'neck':       (150, 75  + body_y),
            'shoulder_l': (118, 102 + body_y),
            'elbow_l':    (78,  118),
            'hand_l':     (75,  115),
            'shoulder_r': (182, 102 + body_y),
            'elbow_r':    (222, 118),
            'hand_r':     (225, 115),
            'hip':        (150, 158 + body_y),
            'knee_l':     (138, 205 + body_y),
            'foot_l':     (130, 252 + body_y),
            'knee_r':     (162, 205 + body_y),
            'foot_r':     (170, 252 + body_y),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'dip')

def gen_bench_dip():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hip_y = lerp(185, 235, t)
        elbow_y = lerp(152, 175, t)
        img, d = new_frame()
        ground(d)
        bench(d, bx=20, by=152, bw=120, bh=12)
        pose = {
            'head':       (185, 100),
            'neck':       (185, 118),
            'shoulder_l': (158, 142),
            'elbow_l':    (108, int(elbow_y)),
            'hand_l':     (65,  155),
            'shoulder_r': (158, 142),
            'elbow_r':    (175, int(elbow_y)),
            'hand_r':     (135, 155),
            'hip':        (195, int(hip_y)),
            'knee_l':     (225, 240),
            'foot_l':     (255, 262),
            'knee_r':     (225, 242),
            'foot_r':     (255, 264),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'bench-dip')

def gen_tricep_extension():
    # Overhead — upper arm fixed vertical, elbow hinge behind head
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(165, 80, t)   # extend up
        img, d = new_frame()
        ground(d)
        dumbbell(d, 150, int(hand_y), angle_deg=90)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (130, 92),   # upper arms fixed near ears
            'hand_l':     (140, int(hand_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (170, 92),
            'hand_r':     (160, int(hand_y)),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'tricep-extension')

def gen_skull_crusher():
    # Lying on bench, upper arms vertical, lower bar to forehead
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        bar_y  = lerp(115, 158, t)   # bar lowers toward forehead
        elbow_y = lerp(125, 142, t)
        img, d = new_frame()
        bench(d, by=200)
        barbell(d, 150, int(bar_y), length=130)
        pose = {
            'head':       (230, 150),
            'neck':       (210, 168),
            'shoulder_l': (165, 190),
            'elbow_l':    (145, int(elbow_y)),
            'hand_l':     (125, int(bar_y)),
            'shoulder_r': (165, 190),
            'elbow_r':    (175, int(elbow_y)),
            'hand_r':     (175, int(bar_y)),
            'hip':        (110, 200),
            'knee_l':     (80,  238),
            'foot_l':     (58,  265),
            'knee_r':     (80,  240),
            'foot_r':     (58,  267),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'skull-crusher')

def gen_tricep_pushdown():
    # Standing, upper arms fixed, push bar down
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(138, 210, t)
        elbow_y = lerp(130, 128, t)
        img, d = new_frame()
        ground(d)
        cable_line(d, 150, 20, 150, int(hand_y))
        d.line([115, int(hand_y), 185, int(hand_y)], fill=DIM, width=5)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (118, 128),   # upper arms fixed at sides
            'hand_l':     (125, int(hand_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (182, 128),
            'hand_r':     (175, int(hand_y)),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'tricep-pushdown')

def gen_cable_kickback():
    # Bent over, one arm extends back
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_x = lerp(175, 255, t)   # arm kicks back
        hand_y = lerp(162, 148, t)
        img, d = new_frame()
        ground(d)
        cable_line(d, 30, 162, 118, 162)
        pose = {
            'head':       (218, 110),
            'neck':       (202, 128),
            'shoulder_l': (165, 155),
            'elbow_l':    (118, 162),
            'hand_l':     (50,  162),   # support arm
            'shoulder_r': (165, 155),
            'elbow_r':    (175, 155),
            'hand_r':     (int(hand_x), int(hand_y)),
            'hip':        (138, 180),
            'knee_l':     (122, 225),
            'foot_l':     (112, 265),
            'knee_r':     (158, 225),
            'foot_r':     (168, 265),
        }
        draw_figure(d, pose, accent_joints={'elbow_r','hand_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'cable-kickback')

# ═══════════════════════════════════════════════════════════════════════════
#  BICEPS EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_dumbbell_curl():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(215, 105, t)
        elbow_y = lerp(195, 130, t)
        img, d = new_frame()
        ground(d)
        dumbbell(d, 105, int(hand_y))
        dumbbell(d, 195, int(hand_y))
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (108, int(elbow_y)),
            'hand_l':     (105, int(hand_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (192, int(elbow_y)),
            'hand_r':     (195, int(hand_y)),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'dumbbell-curl')

def gen_hammer_curl():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(215, 105, t)
        elbow_y = lerp(195, 130, t)
        img, d = new_frame()
        ground(d)
        # Neutral grip — dumbbell vertical
        dumbbell(d, 105, int(hand_y), angle_deg=90)
        dumbbell(d, 195, int(hand_y), angle_deg=90)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (108, int(elbow_y)),
            'hand_l':     (105, int(hand_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (192, int(elbow_y)),
            'hand_r':     (195, int(hand_y)),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'hammer-curl')

def gen_concentration_curl():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y  = lerp(245, 138, t)
        elbow_y = lerp(225, 162, t)
        img, d = new_frame()
        bench(d, bx=80, by=218, bw=140, bh=12)
        ground(d)
        dumbbell(d, 125, int(hand_y))
        pose = {
            'head':       (200, 118),
            'neck':       (190, 135),
            'shoulder_l': (168, 158),
            'elbow_l':    (130, int(elbow_y)),   # elbow braced on inner thigh
            'hand_l':     (125, int(hand_y)),
            'shoulder_r': (168, 158),
            'elbow_r':    (195, 185),
            'hand_r':     (195, 210),
            'hip':        (155, 220),
            'knee_l':     (120, 252),
            'foot_l':     (95,  268),
            'knee_r':     (188, 252),
            'foot_r':     (215, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l'})
        frames.append(img)
    save_gif(ping_pong(frames), 'concentration-curl')

def gen_barbell_curl():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        bar_y  = lerp(225, 112, t)
        elbow_y = lerp(200, 132, t)
        img, d = new_frame()
        ground(d)
        barbell(d, 150, int(bar_y), length=130)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (110, int(elbow_y)),
            'hand_l':     (118, int(bar_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (190, int(elbow_y)),
            'hand_r':     (182, int(bar_y)),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'barbell-curl')

def gen_cable_curl():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(245, 118, t)
        elbow_y = lerp(218, 138, t)
        img, d = new_frame()
        ground(d)
        cable_line(d, 150, 280, 140, int(hand_y))
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (118, int(elbow_y)),
            'hand_l':     (138, int(hand_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (185, 155),
            'hand_r':     (188, 185),
            'hip':        (150, 185),
            'knee_l':     (132, 228),
            'foot_l':     (122, 268),
            'knee_r':     (168, 228),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l'})
        frames.append(img)
    save_gif(ping_pong(frames), 'cable-curl')

def gen_preacher_curl():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(218, 115, t)
        elbow_y = lerp(195, 148, t)
        img, d = new_frame()
        # Preacher bench pad
        pts = [(80,155),(200,155),(220,220),(60,220)]
        d.polygon(pts, fill=DIM)
        ground(d)
        barbell(d, 145, int(hand_y), length=110)
        pose = {
            'head':       (228, 118),
            'neck':       (212, 136),
            'shoulder_l': (180, 158),
            'elbow_l':    (148, int(elbow_y)),
            'hand_l':     (130, int(hand_y)),
            'shoulder_r': (180, 158),
            'elbow_r':    (162, int(elbow_y)),
            'hand_r':     (160, int(hand_y)),
            'hip':        (215, 200),
            'knee_l':     (210, 245),
            'foot_l':     (205, 268),
            'knee_r':     (240, 245),
            'foot_r':     (250, 268),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'preacher-curl')

def gen_incline_dumbbell_curl():
    # Lying back on incline, arms hang behind body line
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(218, 115, t)
        elbow_y = lerp(198, 140, t)
        img, d = new_frame()
        incline_bench(d)
        dumbbell(d, 90,  int(hand_y))
        dumbbell(d, 210, int(hand_y))
        pose = {
            'head':       (232, 128),
            'neck':       (215, 148),
            'shoulder_l': (168, 172),
            'elbow_l':    (120, int(elbow_y)),
            'hand_l':     (90,  int(hand_y)),
            'shoulder_r': (168, 172),
            'elbow_r':    (215, int(elbow_y)),
            'hand_r':     (210, int(hand_y)),
            'hip':        (108, 215),
            'knee_l':     (75,  250),
            'foot_l':     (48,  268),
            'knee_r':     (75,  252),
            'foot_r':     (48,  270),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'incline-dumbbell-curl')

def gen_incline_hammer_curl():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hand_y = lerp(218, 115, t)
        elbow_y = lerp(198, 140, t)
        img, d = new_frame()
        incline_bench(d)
        dumbbell(d, 90,  int(hand_y), angle_deg=90)
        dumbbell(d, 210, int(hand_y), angle_deg=90)
        pose = {
            'head':       (232, 128),
            'neck':       (215, 148),
            'shoulder_l': (168, 172),
            'elbow_l':    (120, int(elbow_y)),
            'hand_l':     (90,  int(hand_y)),
            'shoulder_r': (168, 172),
            'elbow_r':    (215, int(elbow_y)),
            'hand_r':     (210, int(hand_y)),
            'hip':        (108, 215),
            'knee_l':     (75,  250),
            'foot_l':     (48,  268),
            'knee_r':     (75,  252),
            'foot_r':     (48,  270),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'incline-hammer-curl')


# ═══════════════════════════════════════════════════════════════════════════
#  LEGS EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_squat():
    N = 12
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        # top=standing, bottom=thighs parallel
        hip_y    = lerp(185, 230, t)
        knee_lx  = lerp(132, 115, t)
        knee_rx  = lerp(168, 185, t)
        knee_y   = lerp(228, 255, t)
        img, d = new_frame()
        ground(d)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (105, 148),
            'hand_l':     (112, 178),
            'shoulder_r': (182, 108),
            'elbow_r':    (195, 148),
            'hand_r':     (188, 178),
            'hip':        (150, int(hip_y)),
            'knee_l':     (int(knee_lx), int(knee_y)),
            'foot_l':     (118, 268),
            'knee_r':     (int(knee_rx), int(knee_y)),
            'foot_r':     (182, 268),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'squat')

def gen_barbell_squat():
    N = 12
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hip_y   = lerp(185, 230, t)
        knee_y  = lerp(228, 258, t)
        knee_lx = lerp(132, 112, t)
        knee_rx = lerp(168, 188, t)
        # bar stays on shoulders
        bar_y   = lerp(100, 118, t)
        img, d = new_frame()
        ground(d)
        barbell(d, 150, int(bar_y), length=168)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (88,  int(bar_y) + 8),
            'hand_l':     (78,  int(bar_y)),
            'shoulder_r': (182, 108),
            'elbow_r':    (212, int(bar_y) + 8),
            'hand_r':     (222, int(bar_y)),
            'hip':        (150, int(hip_y)),
            'knee_l':     (int(knee_lx), int(knee_y)),
            'foot_l':     (115, 268),
            'knee_r':     (int(knee_rx), int(knee_y)),
            'foot_r':     (185, 268),
        }
        draw_figure(d, pose)
        frames.append(img)
    save_gif(ping_pong(frames), 'barbell-squat')

def gen_lunge():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        # Front knee bends, back knee drops to floor
        fknee_y  = lerp(205, 250, t)
        fknee_x  = lerp(112, 105, t)
        bknee_y  = lerp(195, 252, t)
        img, d = new_frame()
        ground(d)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (120, 108),
            'elbow_l':    (110, 148),
            'hand_l':     (115, 178),
            'shoulder_r': (180, 108),
            'elbow_r':    (190, 148),
            'hand_r':     (185, 178),
            'hip':        (150, 188),
            'knee_l':     (int(fknee_x), int(fknee_y)),   # front
            'foot_l':     (100, 268),
            'knee_r':     (198, int(bknee_y)),              # back
            'foot_r':     (218, 268),
        }
        draw_figure(d, pose, accent_joints={'knee_l'})
        frames.append(img)
    save_gif(ping_pong(frames), 'lunge')

def gen_glute_bridge():
    # Supine, hips thrust up
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hip_y = lerp(215, 168, t)
        img, d = new_frame()
        ground(d, 275)
        # Shoulders on floor
        pose = {
            'head':       (65,  248),
            'neck':       (82,  242),
            'shoulder_l': (108, 238),
            'elbow_l':    (90,  258),
            'hand_l':     (78,  270),
            'shoulder_r': (108, 238),
            'elbow_r':    (125, 258),
            'hand_r':     (130, 270),
            'hip':        (165, int(hip_y)),
            'knee_l':     (210, 245),
            'foot_l':     (228, 268),
            'knee_r':     (210, 247),
            'foot_r':     (228, 270),
        }
        draw_figure(d, pose, accent_joints={'hip','knee_l','knee_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'glute-bridge')

def gen_jump_squat():
    N = 14
    frames = []
    for i in range(N):
        t = i / (N - 1)
        # 0-0.3 squat down, 0.3-0.6 airborne, 0.6-1 land
        if t < 0.3:
            phase_t = ease(t / 0.3)
            hip_y   = lerp(185, 228, phase_t)
            knee_y  = lerp(228, 260, phase_t)
            off_y   = 0
        elif t < 0.6:
            phase_t = ease((t - 0.3) / 0.3)
            hip_y   = lerp(228, 185, phase_t)
            knee_y  = lerp(260, 228, phase_t)
            off_y   = lerp(0, -55, math.sin(phase_t * math.pi))
        else:
            phase_t = ease((t - 0.6) / 0.4)
            hip_y   = lerp(185, 228, phase_t)
            knee_y  = lerp(228, 260, phase_t)
            off_y   = 0
        img, d = new_frame()
        ground(d)
        oy = int(off_y)
        pose = {
            'head':       (150, 62  + oy),
            'neck':       (150, 78  + oy),
            'shoulder_l': (118, 108 + oy),
            'elbow_l':    (95,  138 + oy),
            'hand_l':     (88,  165 + oy),
            'shoulder_r': (182, 108 + oy),
            'elbow_r':    (205, 138 + oy),
            'hand_r':     (212, 165 + oy),
            'hip':        (150, int(hip_y) + oy),
            'knee_l':     (128, int(knee_y) + oy),
            'foot_l':     (118, 268 + oy),
            'knee_r':     (172, int(knee_y) + oy),
            'foot_r':     (182, 268 + oy),
        }
        draw_figure(d, pose, accent_joints={'knee_l','knee_r','foot_l','foot_r'})
        frames.append(img)
    save_gif(frames, 'jump-squat', duration=55)

def gen_single_leg_squat():
    # Pistol squat — one leg extended forward
    N = 12
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hip_y   = lerp(185, 245, t)
        knee_y  = lerp(228, 268, t)
        # Extended leg goes forward and lower
        ext_foot_y = lerp(200, 235, t)
        ext_foot_x = lerp(105, 65,  t)
        img, d = new_frame()
        ground(d)
        pose = {
            'head':       (150, 62),
            'neck':       (150, 78),
            'shoulder_l': (118, 108),
            'elbow_l':    (95,  128),
            'hand_l':     (82,  148),   # arms forward for balance
            'shoulder_r': (182, 108),
            'elbow_r':    (205, 128),
            'hand_r':     (218, 148),
            'hip':        (150, int(hip_y)),
            'knee_l':     (132, int(knee_y)),   # standing leg
            'foot_l':     (125, 268),
            'knee_r':     (int(ext_foot_x) + 20, int(ext_foot_y)),  # extended leg
            'foot_r':     (int(ext_foot_x), int(ext_foot_y) + 25),
        }
        draw_figure(d, pose, accent_joints={'knee_l','foot_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'single-leg-squat')

def gen_calf_raise():
    N = 8
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        rise = lerp(0, -20, t)   # whole body rises slightly
        img, d = new_frame()
        ground(d)
        pose = {
            'head':       (150, 62  + rise),
            'neck':       (150, 78  + rise),
            'shoulder_l': (118, 108 + rise),
            'elbow_l':    (108, 155 + rise),
            'hand_l':     (108, 185 + rise),
            'shoulder_r': (182, 108 + rise),
            'elbow_r':    (192, 155 + rise),
            'hand_r':     (192, 185 + rise),
            'hip':        (150, 185 + rise),
            'knee_l':     (132, 228 + rise),
            'foot_l':     (122, 268),        # foot stays on ground
            'knee_r':     (168, 228 + rise),
            'foot_r':     (178, 268),
        }
        draw_figure(d, pose, accent_joints={'foot_l','foot_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'calf-raise')

def gen_bulgarian_split_squat():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hip_y  = lerp(185, 238, t)
        fknee_y = lerp(228, 268, t)
        img, d = new_frame()
        ground(d)
        # Rear foot on bench
        bench(d, bx=165, by=185, bw=120, bh=12)
        pose = {
            'head':       (145, 62),
            'neck':       (145, 78),
            'shoulder_l': (115, 108),
            'elbow_l':    (105, 148),
            'hand_l':     (110, 175),
            'shoulder_r': (175, 108),
            'elbow_r':    (185, 148),
            'hand_r':     (180, 175),
            'hip':        (148, int(hip_y)),
            'knee_l':     (112, int(fknee_y)),   # front leg
            'foot_l':     (100, 268),
            'knee_r':     (195, 215),              # rear leg on bench
            'foot_r':     (220, 188),
        }
        draw_figure(d, pose, accent_joints={'knee_l'})
        frames.append(img)
    save_gif(ping_pong(frames), 'bulgarian-split-squat')

def gen_leg_press():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        foot_y  = lerp(110, 168, t)
        knee_y  = lerp(155, 205, t)
        img, d = new_frame()
        # Machine sled — diagonal rail
        d.line([50, 40, 270, 270], fill=DIM, width=4)
        d.rectangle([45, 255, 270, 278], fill=DIM)  # seat base
        # Platform
        d.rectangle([48, int(foot_y)-8, 90, int(foot_y)+8], fill=DIM)
        pose = {
            'head':       (238, 148),
            'neck':       (222, 162),
            'shoulder_l': (195, 182),
            'elbow_l':    (185, 220),
            'hand_l':     (178, 248),
            'shoulder_r': (195, 182),
            'elbow_r':    (205, 220),
            'hand_r':     (210, 248),
            'hip':        (172, 262),
            'knee_l':     (118, int(knee_y)),
            'foot_l':     (68,  int(foot_y)),
            'knee_r':     (122, int(knee_y) + 5),
            'foot_r':     (70,  int(foot_y) + 5),
        }
        draw_figure(d, pose, accent_joints={'knee_l','knee_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'leg-press')

def gen_leg_extension():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        foot_y  = lerp(268, 185, t)
        foot_x  = lerp(148, 195, t)
        knee_y  = lerp(255, 248, t)
        img, d = new_frame()
        # Machine seat
        d.rectangle([55, 180, 245, 268], fill=DIM)
        d.rectangle([55, 268, 245, 278], fill=DIM)
        # Pad on shins
        d.ellipse([int(foot_x)-10, int(foot_y)-8, int(foot_x)+10, int(foot_y)+8], fill=ACC)
        pose = {
            'head':       (150, 98),
            'neck':       (150, 115),
            'shoulder_l': (118, 138),
            'elbow_l':    (92,  175),
            'hand_l':     (80,  205),
            'shoulder_r': (182, 138),
            'elbow_r':    (208, 175),
            'hand_r':     (220, 205),
            'hip':        (150, 215),
            'knee_l':     (128, int(knee_y)),
            'foot_l':     (int(foot_x)-12, int(foot_y)),
            'knee_r':     (172, int(knee_y)),
            'foot_r':     (int(foot_x)+12, int(foot_y)),
        }
        draw_figure(d, pose, accent_joints={'knee_l','knee_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'leg-extension')

def gen_leg_curl():
    # Prone on machine, heels curl to glutes
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        foot_y  = lerp(112, 72,  t)
        foot_x  = lerp(228, 205, t)
        img, d = new_frame()
        # Machine pad
        d.rectangle([30, 188, 275, 210], fill=DIM)
        ground(d, 215)
        # Ankle pad
        d.ellipse([int(foot_x)-10, int(foot_y)-8, int(foot_x)+10, int(foot_y)+8], fill=ACC)
        pose = {
            'head':       (55,  172),
            'neck':       (75,  180),
            'shoulder_l': (112, 192),
            'elbow_l':    (85,  205),
            'hand_l':     (62,  210),
            'shoulder_r': (112, 192),
            'elbow_r':    (140, 205),
            'hand_r':     (158, 210),
            'hip':        (178, 198),
            'knee_l':     (215, 202),
            'foot_l':     (int(foot_x)-8, int(foot_y)),
            'knee_r':     (215, 204),
            'foot_r':     (int(foot_x)+8, int(foot_y)),
        }
        draw_figure(d, pose, accent_joints={'knee_l','knee_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'leg-curl')

def gen_hack_squat():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hip_y  = lerp(195, 245, t)
        knee_y = lerp(240, 270, t)
        img, d = new_frame()
        ground(d)
        # Diagonal machine rail
        d.line([80, 40, 220, 278], fill=DIM, width=5)
        # Shoulder pads
        d.rectangle([100, 108, 200, 122], fill=DIM)
        pose = {
            'head':       (150, 65),
            'neck':       (150, 82),
            'shoulder_l': (118, 115),
            'elbow_l':    (95,  148),
            'hand_l':     (88,  172),
            'shoulder_r': (182, 115),
            'elbow_r':    (205, 148),
            'hand_r':     (212, 172),
            'hip':        (150, int(hip_y)),
            'knee_l':     (128, int(knee_y)),
            'foot_l':     (115, 268),
            'knee_r':     (172, int(knee_y)),
            'foot_r':     (185, 268),
        }
        draw_figure(d, pose, accent_joints={'knee_l','knee_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'hack-squat')

def gen_barbell_hip_thrust():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        hip_y = lerp(225, 172, t)
        img, d = new_frame()
        ground(d)
        bench(d, bx=30, by=185, bw=120, bh=14)
        barbell(d, 175, int(hip_y), length=150)
        pose = {
            'head':       (88,  162),
            'neck':       (100, 178),
            'shoulder_l': (118, 195),
            'elbow_l':    (90,  215),
            'hand_l':     (72,  235),
            'shoulder_r': (118, 195),
            'elbow_r':    (138, 215),
            'hand_r':     (148, 235),
            'hip':        (175, int(hip_y)),
            'knee_l':     (215, 248),
            'foot_l':     (232, 268),
            'knee_r':     (215, 250),
            'foot_r':     (232, 270),
        }
        draw_figure(d, pose, accent_joints={'hip','knee_l','knee_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'barbell-hip-thrust')

def gen_step_up():
    N = 12
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        # Step up: figure rises from floor to top of box
        body_off = lerp(0, -62, t)
        img, d = new_frame()
        ground(d)
        box_platform(d, bx=80, by=200, bw=140, bh=70)
        pose = {
            'head':       (150, 70  + body_off),
            'neck':       (150, 86  + body_off),
            'shoulder_l': (118, 115 + body_off),
            'elbow_l':    (105, 152 + body_off),
            'hand_l':     (108, 178 + body_off),
            'shoulder_r': (182, 115 + body_off),
            'elbow_r':    (195, 152 + body_off),
            'hand_r':     (192, 178 + body_off),
            'hip':        (150, 192 + body_off),
            'knee_l':     (130, 238 + body_off),
            'foot_l':     (118, lerp(268, 202, t)),
            'knee_r':     (170, 238 + body_off),
            'foot_r':     (182, lerp(268, 202, t)),
        }
        draw_figure(d, pose, accent_joints={'knee_l','foot_l'})
        frames.append(img)
    save_gif(ping_pong(frames), 'step-up')

def gen_box_jump():
    N = 16
    frames = []
    for i in range(N):
        t = i / (N - 1)
        if t < 0.25:
            p = ease(t / 0.25)
            hip_y = lerp(185, 232, p); knee_y = lerp(228, 268, p); off_y = 0; on_box = False
        elif t < 0.55:
            p = ease((t - 0.25) / 0.30)
            arc = math.sin(p * math.pi)
            hip_y = 200; knee_y = 240; off_y = -arc * 80; on_box = False
        else:
            p = ease((t - 0.55) / 0.45)
            hip_y = lerp(232, 185, p); knee_y = lerp(268, 228, p)
            off_y = -68; on_box = True
        img, d = new_frame()
        ground(d)
        box_platform(d, bx=80, by=200, bw=140, bh=70)
        oy = int(off_y)
        foot_y = (202 + oy) if on_box else (268 + oy)
        pose = {
            'head':       (150, 65  + oy),
            'neck':       (150, 82  + oy),
            'shoulder_l': (118, 110 + oy),
            'elbow_l':    (92,  140 + oy),
            'hand_l':     (82,  162 + oy),
            'shoulder_r': (182, 110 + oy),
            'elbow_r':    (208, 140 + oy),
            'hand_r':     (218, 162 + oy),
            'hip':        (150, int(hip_y) + oy),
            'knee_l':     (128, int(knee_y) + oy),
            'foot_l':     (118, foot_y),
            'knee_r':     (172, int(knee_y) + oy),
            'foot_r':     (182, foot_y),
        }
        draw_figure(d, pose, accent_joints={'knee_l','knee_r','foot_l','foot_r'})
        frames.append(img)
    save_gif(frames, 'box-jump', duration=55)


# ═══════════════════════════════════════════════════════════════════════════
#  CORE EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_plank():
    # Static — subtle breathing shimmer
    N = 8
    frames = []
    for i in range(N):
        t = math.sin(i / (N - 1) * math.pi)
        breathe = lerp(0, -3, t)
        img, d = new_frame()
        ground(d, 238)
        # Forearm plank
        pose = {
            'head':       (52,  172 + breathe),
            'neck':       (72,  180 + breathe),
            'shoulder_l': (112, 190 + breathe),
            'elbow_l':    (90,  205),           # forearm on floor
            'hand_l':     (62,  215),
            'shoulder_r': (112, 190 + breathe),
            'elbow_r':    (130, 205),
            'hand_r':     (148, 215),
            'hip':        (192, 195 + breathe),
            'knee_l':     (232, 205 + breathe),
            'foot_l':     (268, 220),
            'knee_r':     (232, 207 + breathe),
            'foot_r':     (268, 222),
        }
        draw_figure(d, pose, accent_joints={'elbow_l','elbow_r'})
        # Body line accent
        d.line([72, int(180+breathe), 268, 220], fill=ACC, width=2)
        frames.append(img)
    save_gif(frames + list(reversed(frames[1:-1])), 'plank', duration=110)

def gen_hollow_body():
    N = 8
    frames = []
    for i in range(N):
        t = math.sin(i / (N - 1) * math.pi)
        shake = lerp(0, 4, t)
        img, d = new_frame()
        ground(d, 275)
        # Supine hollow: shoulders up, legs up, lower back flat
        pose = {
            'head':       (82,  205 + shake),
            'neck':       (100, 215 + shake),
            'shoulder_l': (132, 225),
            'elbow_l':    (112, 208 + shake),
            'hand_l':     (90,  190 + shake),   # arms overhead
            'shoulder_r': (132, 225),
            'elbow_r':    (152, 208 + shake),
            'hand_r':     (172, 190 + shake),
            'hip':        (175, 228),
            'knee_l':     (215, 215 + shake),
            'foot_l':     (252, 200 + shake),
            'knee_r':     (215, 217 + shake),
            'foot_r':     (252, 202 + shake),
        }
        draw_figure(d, pose, accent_joints={'hand_l','hand_r','foot_l','foot_r'})
        frames.append(img)
    save_gif(frames + list(reversed(frames[1:-1])), 'hollow-body', duration=110)

def gen_crunch():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        # Only upper shoulders lift ~30°, lower back stays flat
        head_y  = lerp(235, 208, t)
        neck_y  = lerp(245, 220, t)
        shldr_y = lerp(255, 235, t)
        img, d = new_frame()
        ground(d, 275)
        pose = {
            'head':       (82,  int(head_y)),
            'neck':       (102, int(neck_y)),
            'shoulder_l': (128, int(shldr_y)),
            'elbow_l':    (82,  int(head_y) - 8),   # hands behind head
            'hand_l':     (70,  int(head_y) - 15),
            'shoulder_r': (128, int(shldr_y)),
            'elbow_r':    (148, int(head_y) - 8),
            'hand_r':     (158, int(head_y) - 15),
            'hip':        (175, 262),
            'knee_l':     (212, 248),
            'foot_l':     (235, 268),
            'knee_r':     (212, 250),
            'foot_r':     (235, 270),
        }
        draw_figure(d, pose, accent_joints={'shoulder_l','shoulder_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'crunch')

def gen_mountain_climber():
    # Plank, knees alternate driving to chest — fast
    N = 8
    frames = []
    for i in range(N):
        left_drive = (i % 2 == 0)
        img, d = new_frame()
        ground(d, 238)
        if left_drive:
            pose = {
                'head':       (55,  155),
                'neck':       (75,  165),
                'shoulder_l': (118, 178),
                'elbow_l':    (95,  210),
                'hand_l':     (72,  230),
                'shoulder_r': (118, 178),
                'elbow_r':    (140, 210),
                'hand_r':     (158, 230),
                'hip':        (195, 192),
                'knee_l':     (148, 190),   # left knee drives in
                'foot_l':     (140, 215),
                'knee_r':     (232, 208),
                'foot_r':     (265, 230),
            }
        else:
            pose = {
                'head':       (55,  155),
                'neck':       (75,  165),
                'shoulder_l': (118, 178),
                'elbow_l':    (95,  210),
                'hand_l':     (72,  230),
                'shoulder_r': (118, 178),
                'elbow_r':    (140, 210),
                'hand_r':     (158, 230),
                'hip':        (195, 192),
                'knee_l':     (232, 208),
                'foot_l':     (265, 230),
                'knee_r':     (148, 190),   # right knee drives in
                'foot_r':     (140, 215),
            }
        draw_figure(d, pose, accent_joints={'knee_l','knee_r'})
        frames.append(img)
    save_gif(frames, 'mountain-climber', duration=65)

def gen_leg_raise():
    N = 10
    frames = []
    for i in range(N):
        t = ease(i / (N - 1))
        foot_y  = lerp(265, 160, t)
        knee_y  = lerp(262, 175, t)
        hip_ang = lerp(0, -25, t)   # slight lower back stays flat
        img, d = new_frame()
        ground(d, 275)
        pose = {
            'head':       (72,  242),
            'neck':       (90,  250),
            'shoulder_l': (115, 258),
            'elbow_l':    (92,  268),
            'hand_l':     (75,  272),
            'shoulder_r': (115, 258),
            'elbow_r':    (138, 268),
            'hand_r':     (155, 272),
            'hip':        (162, 262),
            'knee_l':     (198, int(knee_y)),
            'foot_l':     (228, int(foot_y)),
            'knee_r':     (200, int(knee_y) + 3),
            'foot_r':     (230, int(foot_y) + 3),
        }
        draw_figure(d, pose, accent_joints={'knee_l','knee_r','foot_l','foot_r'})
        frames.append(img)
    save_gif(ping_pong(frames), 'leg-raise')

def gen_russian_twist():
    N = 10
    frames = []
    for i in range(N):
        t = i / (N - 1)
        # Twist left then right
        twist = math.sin(t * 2 * math.pi) * 40   # px side shift of hands
        img, d = new_frame()
        ground(d, 275)
        hx = int(150 + twist)
        pose = {
            'head':       (150, 192),
            'neck':       (150, 208),
            'shoulder_l': (125, 228),
            'elbow_l':    (hx - 15, 218),
            'hand_l':     (hx,      212),
            'shoulder_r': (175, 228),
            'elbow_r':    (hx + 15, 218),
            'hand_r':     (hx,      215),
            'hip':        (150, 252),
            'knee_l':     (122, 265),
            'foot_l':     (102, 272),
            'knee_r':     (178, 265),
            'foot_r':     (198, 272),
        }
        draw_figure(d, pose, accent_joints={'hand_l','hand_r'})
        frames.append(img)
    save_gif(frames, 'russian-twist', duration=70)

# ═══════════════════════════════════════════════════════════════════════════
#  CARDIO
# ═══════════════════════════════════════════════════════════════════════════

def gen_burpee():
    # 4-phase: stand → squat-hands-down → plank → jump up
    N = 16
    frames = []
    phases = [
        # (head, shoulder, hip, knee, foot, arms)
        # STANDING
        {'head':(150,65),'neck':(150,82),'shl':(118,112),'shr':(182,112),
         'ell':(108,152),'elr':(192,152),'hnl':(108,182),'hnr':(192,182),
         'hip':(150,188),'knl':(132,232),'knr':(168,232),'ftl':(122,268),'ftr':(178,268)},
        # SQUAT DOWN
        {'head':(150,105),'neck':(150,118),'shl':(118,138),'shr':(182,138),
         'ell':(90,160),'elr':(210,160),'hnl':(72,188),'hnr':(228,188),
         'hip':(150,225),'knl':(112,258),'knr':(188,258),'ftl':(100,268),'ftr':(200,268)},
        # PLANK
        {'head':(52,172),'neck':(72,182),'shl':(112,192),'shr':(112,192),
         'ell':(90,210),'elr':(132,210),'hnl':(68,228),'hnr':(152,228),
         'hip':(195,200),'knl':(232,212),'knr':(232,214),'ftl':(268,228),'ftr':(268,230)},
        # JUMP UP
        {'head':(150,42),'neck':(150,58),'shl':(118,88),'shr':(182,88),
         'ell':(105,52),'elr':(195,52),'hnl':(112,32),'hnr':(188,32),
         'hip':(150,165),'knl':(135,205),'knr':(165,205),'ftl':(125,250),'ftr':(175,250)},
    ]
    frames_per_phase = N // len(phases)
    for pi, ph in enumerate(phases):
        next_ph = phases[(pi + 1) % len(phases)]
        for fi in range(frames_per_phase):
            t = ease(fi / frames_per_phase)
            def lp(k1, k2): return int(lerp(ph[k1][0], next_ph[k2][0], t)), int(lerp(ph[k1][1], next_ph[k2][1], t))
            img, d = new_frame()
            ground(d)
            pose = {
                'head':       lp('head','head'),
                'neck':       lp('neck','neck'),
                'shoulder_l': lp('shl','shl'),
                'shoulder_r': lp('shr','shr'),
                'elbow_l':    lp('ell','ell'),
                'elbow_r':    lp('elr','elr'),
                'hand_l':     lp('hnl','hnl'),
                'hand_r':     lp('hnr','hnr'),
                'hip':        lp('hip','hip'),
                'knee_l':     lp('knl','knl'),
                'knee_r':     lp('knr','knr'),
                'foot_l':     lp('ftl','ftl'),
                'foot_r':     lp('ftr','ftr'),
            }
            draw_figure(d, pose, accent_joints={'knee_l','knee_r','hand_l','hand_r'})
            frames.append(img)
    save_gif(frames, 'burpee', duration=55)


# ═══════════════════════════════════════════════════════════════════════════
#  IFBB BODYBUILDING POSES
#  Each pose is a static hold with a subtle "flex pulse" animation
#  (slight scale/brightness oscillation to indicate muscle contraction).
# ═══════════════════════════════════════════════════════════════════════════

def flex_pulse(t):
    """Subtle brightness pulse 0→1→0 for flex effect"""
    return math.sin(t * math.pi) * 0.18   # max ±18% shift

def pose_frame(pose_fn, t):
    """Render one frame of a pose with flex-pulse overlay at time t∈[0,1]"""
    img, d = new_frame()
    ground(d)
    pulse = flex_pulse(t)
    # Brighten figure slightly during pulse
    fig_color = tuple(min(255, int(c + pulse * 60)) for c in FIG)
    acc_color  = tuple(min(255, int(c + pulse * 40)) for c in ACC)
    pose_fn(d, fig_color, acc_color)
    return img

def make_pose_gif(name, pose_fn, n=12, dur=90):
    frames = []
    for i in range(n):
        t = i / (n - 1)
        frames.append(pose_frame(pose_fn, t))
    save_gif(frames + list(reversed(frames[1:-1])), name, duration=dur)


# ── 1. Front Double Biceps ────────────────────────────────────────────────
def gen_pose_front_double_biceps():
    def draw(d, fc, ac):
        # Torso wider — lats flared
        d.ellipse([112,108, 188,175], fill=fc)       # torso block
        # Head
        head(d, 150, 72, color=fc)
        # Neck
        limb(d, 150,82, 150,108, color=fc, w=10)
        # Upper arms horizontal at shoulder height
        limb(d, 120,118, 75,118,  color=fc, w=8)     # left upper arm
        limb(d, 180,118, 225,118, color=fc, w=8)     # right upper arm
        # Forearms vertical UP — fists clenched
        limb(d, 75,118, 75,72,   color=ac, w=7)      # left forearm
        limb(d, 225,118, 225,72, color=ac, w=7)      # right forearm
        # Fist indicators
        d.ellipse([68,62, 82,76],  fill=ac)
        d.ellipse([218,62, 232,76], fill=ac)
        # Lats flare (wide triangles at sides)
        d.polygon([(120,118),(75,162),(112,175)],  fill=fc)
        d.polygon([(180,118),(225,162),(188,175)], fill=fc)
        # Waist narrower
        d.polygon([(112,175),(138,195),(162,195),(188,175),(175,182),(125,182)], fill=fc)
        # Legs
        limb(d, 138,195, 128,248, color=fc, w=10)
        limb(d, 128,248, 122,272, color=fc, w=8)
        limb(d, 162,195, 172,248, color=fc, w=10)
        limb(d, 172,248, 178,272, color=fc, w=8)
        # Front leg slightly bent forward
        limb(d, 128,248, 118,270, color=fc, w=8)
        joint(d, 75,118,  r=6, color=ac)
        joint(d, 225,118, r=6, color=ac)
    make_pose_gif('pose-front-double-biceps', draw)


# ── 2. Front Lat Spread ───────────────────────────────────────────────────
def gen_pose_front_lat_spread():
    def draw(d, fc, ac):
        head(d, 150, 72, color=fc)
        limb(d, 150,82, 150,108, color=fc, w=10)
        # Very wide torso — lats maximally spread
        d.polygon([(108,108),(192,108),(210,175),(90,175)], fill=fc)
        # Arms: hands on hips, elbows pulled FORWARD (seen as wide from front)
        limb(d, 108,130, 82,152,  color=fc, w=8)    # left upper arm going wide
        limb(d, 82,152,  88,175,  color=fc, w=7)    # left forearm to hip
        limb(d, 192,130, 218,152, color=fc, w=8)
        limb(d, 218,152, 212,175, color=fc, w=7)
        # Hip hands
        joint(d, 90,175,  r=7, color=ac)
        joint(d, 210,175, r=7, color=ac)
        # Waist narrow
        limb(d, 90,175, 100,195, color=fc, w=12)
        limb(d, 210,175, 200,195, color=fc, w=12)
        # Legs
        limb(d, 100,195, 128,248, color=fc, w=10)
        limb(d, 128,248, 122,272, color=fc, w=8)
        limb(d, 200,195, 172,248, color=fc, w=10)
        limb(d, 172,248, 178,272, color=fc, w=8)
        # Lat accent lines
        d.line([90,175, 108,108],  fill=ac, width=2)
        d.line([210,175, 192,108], fill=ac, width=2)
    make_pose_gif('pose-front-lat-spread', draw)


# ── 3. Side Chest ─────────────────────────────────────────────────────────
def gen_pose_side_chest():
    def draw(d, fc, ac):
        # True side profile (90°) — figure faces LEFT
        head(d, 138, 72, color=fc)
        # Torso side profile — chest pushed forward
        d.polygon([(138,82),(165,95),(162,175),(125,175),(122,82)], fill=fc)
        limb(d, 138,82, 138,175, color=fc, w=4)   # spine center
        # Front arm crosses chest — elbow bent
        limb(d, 138,118, 110,138, color=fc, w=8)   # upper arm
        limb(d, 110,138, 128,158, color=ac,  w=7)  # forearm crossing chest
        joint(d, 110,138, r=6, color=ac)
        # Rear arm grips front wrist
        limb(d, 138,125, 148,142, color=fc, w=7)
        limb(d, 148,142, 130,158, color=fc, w=6)
        joint(d, 130,158, r=5, color=ac)
        # Chest peak accent
        d.line([138,95, 165,118], fill=ac, width=2)
        # Legs — front leg slightly bent
        limb(d, 138,175, 132,225, color=fc, w=11)
        limb(d, 132,225, 128,268, color=fc, w=9)
        limb(d, 138,175, 148,225, color=fc, w=9)
        limb(d, 148,225, 152,268, color=fc, w=8)
        joint(d, 132,225, r=5, color=ac)
    make_pose_gif('pose-side-chest', draw)


# ── 4. Back Double Biceps ─────────────────────────────────────────────────
def gen_pose_back_double_biceps():
    def draw(d, fc, ac):
        head(d, 150, 72, color=fc)
        limb(d, 150,82, 150,108, color=fc, w=10)
        # Back view — wide lats + spine line
        d.polygon([(108,108),(192,108),(205,175),(95,175)], fill=fc)
        d.line([150,108, 150,175], fill=DIM, width=2)   # spine
        # Arms same W shape as front double biceps
        limb(d, 118,118, 72,118,  color=fc, w=8)
        limb(d, 72,118,  72,72,   color=ac, w=7)
        limb(d, 182,118, 228,118, color=fc, w=8)
        limb(d, 228,118, 228,72,  color=ac, w=7)
        d.ellipse([65,62, 79,76],  fill=ac)
        d.ellipse([221,62, 235,76], fill=ac)
        joint(d, 72,118,  r=6, color=ac)
        joint(d, 228,118, r=6, color=ac)
        # Leg — one drawn back, heel raised
        limb(d, 138,175, 125,235, color=fc, w=10)
        limb(d, 125,235, 118,268, color=fc, w=8)
        limb(d, 162,175, 175,232, color=fc, w=10)
        limb(d, 175,232, 185,255, color=ac, w=8)   # raised heel accent
        joint(d, 185,255, r=5, color=ac)
    make_pose_gif('pose-back-double-biceps', draw)


# ── 5. Back Lat Spread ────────────────────────────────────────────────────
def gen_pose_back_lat_spread():
    def draw(d, fc, ac):
        head(d, 150, 72, color=fc)
        limb(d, 150,82, 150,108, color=fc, w=10)
        # Massive back width
        d.polygon([(100,108),(200,108),(215,182),(85,182)], fill=fc)
        d.line([150,108, 150,182], fill=DIM, width=2)
        # Hands on hips from behind — elbows pulled forward
        limb(d, 108,132, 85,158,  color=fc, w=8)
        limb(d, 85,158,  92,182,  color=fc, w=7)
        limb(d, 192,132, 215,158, color=fc, w=8)
        limb(d, 215,158, 208,182, color=fc, w=7)
        joint(d, 92,182,  r=7, color=ac)
        joint(d, 208,182, r=7, color=ac)
        # Lat accent lines
        d.line([85,182, 100,108],  fill=ac, width=2)
        d.line([215,182, 200,108], fill=ac, width=2)
        # Legs
        limb(d, 130,182, 125,240, color=fc, w=10)
        limb(d, 125,240, 118,268, color=fc, w=8)
        limb(d, 170,182, 175,240, color=fc, w=10)
        limb(d, 175,240, 182,268, color=fc, w=8)
    make_pose_gif('pose-back-lat-spread', draw)


# ── 6. Side Triceps ───────────────────────────────────────────────────────
def gen_pose_side_triceps():
    def draw(d, fc, ac):
        # Side profile facing LEFT
        head(d, 138, 72, color=fc)
        d.polygon([(138,82),(162,95),(158,175),(122,175),(120,82)], fill=fc)
        limb(d, 138,82, 138,175, color=fc, w=4)
        # Rear arm FULLY EXTENDED behind torso — tricep horseshoe
        limb(d, 138,118, 168,138, color=fc, w=8)   # upper arm back
        limb(d, 168,138, 185,175, color=ac,  w=7)  # forearm extended down-back
        joint(d, 168,138, r=6, color=ac)
        # Horseshoe accent
        d.arc([155,132, 178,162], start=0, end=180, fill=ac, width=3)
        # Front arm assists (grips rear wrist)
        limb(d, 138,122, 155,145, color=fc, w=6)
        limb(d, 155,145, 172,168, color=fc, w=5)
        joint(d, 172,168, r=4, color=ac)
        # Abs contraction lines
        for yy in [128,140,152]:
            d.line([122,yy, 138,yy-2], fill=DIM, width=1)
        # Legs front leg bent
        limb(d, 138,175, 130,228, color=fc, w=11)
        limb(d, 130,228, 125,268, color=fc, w=9)
        limb(d, 138,175, 150,225, color=fc, w=9)
        limb(d, 150,225, 155,268, color=fc, w=8)
        joint(d, 130,228, r=5, color=ac)
    make_pose_gif('pose-side-triceps', draw)


# ── 7. Abdominals & Thighs ────────────────────────────────────────────────
def gen_pose_abs_thighs():
    def draw(d, fc, ac):
        # Front facing, slight crunch, hands behind head, one leg forward
        head(d, 150, 72, color=fc)
        # Torso slightly crunched forward
        limb(d, 150,82, 148,165, color=fc, w=12)
        # Abs definition lines
        for yy in [115,130,145,160]:
            d.line([135,yy, 148,yy+2], fill=ac, width=2)
            d.line([152,yy+2, 165,yy], fill=ac, width=2)
        # Hands behind head
        limb(d, 120,108, 88,98,  color=fc, w=7)
        limb(d, 88,98,   78,78,  color=fc, w=6)
        limb(d, 180,108, 212,98, color=fc, w=7)
        limb(d, 212,98,  222,78, color=fc, w=6)
        joint(d, 78,78,  r=5, color=ac)
        joint(d, 222,78, r=5, color=ac)
        # Hips
        limb(d, 148,165, 148,185, color=fc, w=14)
        # Front leg stepped forward — quad accent
        limb(d, 138,185, 118,242, color=ac, w=11)   # front thigh accent
        limb(d, 118,242, 112,268, color=fc, w=9)
        joint(d, 118,242, r=5, color=ac)
        # Back leg
        limb(d, 162,185, 178,242, color=fc, w=10)
        limb(d, 178,242, 185,268, color=fc, w=8)
    make_pose_gif('pose-abs-thighs', draw)


# ── 8. Most Muscular / Crab ───────────────────────────────────────────────
def gen_pose_most_muscular():
    def draw(d, fc, ac):
        # Front facing, slight forward lean, elbows drive DOWN and IN
        head(d, 150, 78, color=fc)
        # Thick neck/traps — highest point
        d.polygon([(128,82),(172,82),(182,108),(118,108)], fill=ac)   # trap elevation
        # Torso wide + forward lean
        d.polygon([(108,108),(192,108),(198,182),(102,182)], fill=fc)
        limb(d, 150,82, 150,182, color=fc, w=5)
        # Arms: elbows pulled DOWN and IN to front of waist
        limb(d, 118,118, 82,145,  color=fc, w=9)    # left upper arm going out-down
        limb(d, 82,145,  128,172, color=ac,  w=8)   # left forearm driving IN and DOWN
        limb(d, 182,118, 218,145, color=fc, w=9)
        limb(d, 218,145, 172,172, color=ac,  w=8)
        joint(d, 82,145,  r=6, color=ac)
        joint(d, 218,145, r=6, color=ac)
        # Fists meeting near waist
        d.ellipse([120,166, 138,180], fill=ac)
        d.ellipse([162,166, 180,180], fill=ac)
        # Chest accent
        d.line([118,108, 150,130], fill=ac, width=2)
        d.line([182,108, 150,130], fill=ac, width=2)
        # Legs
        limb(d, 130,182, 122,242, color=fc, w=11)
        limb(d, 122,242, 118,268, color=fc, w=9)
        limb(d, 170,182, 178,242, color=fc, w=11)
        limb(d, 178,242, 182,268, color=fc, w=9)
    make_pose_gif('pose-most-muscular', draw)


# ── 9. Men's Physique Front ───────────────────────────────────────────────
def gen_pose_mp_front():
    def draw(d, fc, ac):
        # Relaxed — natural V-taper, one hand on hip
        head(d, 150, 70, color=fc)
        limb(d, 150,82, 150,180, color=fc, w=9)
        # Natural shoulder width
        limb(d, 150,105, 118,108, color=fc, w=7)
        limb(d, 150,105, 182,108, color=fc, w=7)
        # Left arm relaxed at side
        limb(d, 118,108, 108,158, color=fc, w=6)
        limb(d, 108,158, 110,198, color=fc, w=5)
        # Right hand on hip (casual)
        limb(d, 182,108, 205,145, color=fc, w=6)
        limb(d, 205,145, 195,175, color=fc, w=5)
        joint(d, 195,175, r=5, color=ac)   # hand on hip
        # Waist narrow
        limb(d, 118,108, 132,180, color=fc, w=8)
        limb(d, 182,108, 168,180, color=fc, w=8)
        # V-taper accent
        d.line([118,108, 135,180], fill=ac, width=1)
        d.line([182,108, 165,180], fill=ac, width=1)
        # Legs relaxed
        limb(d, 135,180, 128,235, color=fc, w=9)
        limb(d, 128,235, 122,268, color=fc, w=7)
        limb(d, 165,180, 172,235, color=fc, w=9)
        limb(d, 172,235, 178,268, color=fc, w=7)
    make_pose_gif('pose-mp-front', draw, dur=110)


# ── 10. Men's Physique Back ───────────────────────────────────────────────
def gen_pose_mp_back():
    def draw(d, fc, ac):
        # Back view, relaxed, slight hip pop
        head(d, 150, 70, color=fc)
        limb(d, 150,82, 150,180, color=fc, w=9)
        d.line([150,82, 150,180], fill=DIM, width=2)  # spine
        # Shoulders
        limb(d, 150,108, 118,112, color=fc, w=7)
        limb(d, 150,108, 182,112, color=fc, w=7)
        # Left arm relaxed
        limb(d, 118,112, 108,160, color=fc, w=6)
        limb(d, 108,160, 110,198, color=fc, w=5)
        # Right hand on hip
        limb(d, 182,112, 205,148, color=fc, w=6)
        limb(d, 205,148, 198,178, color=fc, w=5)
        joint(d, 198,178, r=5, color=ac)
        # Back width
        limb(d, 118,112, 132,180, color=fc, w=8)
        limb(d, 182,112, 168,180, color=fc, w=8)
        # Slight hip pop to right
        limb(d, 132,180, 140,188, color=fc, w=10)
        limb(d, 168,180, 158,188, color=fc, w=10)
        # Legs
        limb(d, 140,188, 130,240, color=fc, w=9)
        limb(d, 130,240, 122,268, color=fc, w=7)
        limb(d, 158,188, 168,240, color=fc, w=9)
        limb(d, 168,240, 175,268, color=fc, w=7)
    make_pose_gif('pose-mp-back', draw, dur=110)


# ── 11. Men's Physique Side ───────────────────────────────────────────────
def gen_pose_mp_side():
    def draw(d, fc, ac):
        # True side profile, relaxed chest up, one hand on hip
        head(d, 140, 70, color=fc)
        # Torso side — chest naturally lifted
        d.polygon([(140,82),(162,95),(158,178),(125,178),(122,82)], fill=fc)
        limb(d, 140,82, 140,178, color=fc, w=4)
        # Front arm relaxed
        limb(d, 140,115, 118,155, color=fc, w=6)
        limb(d, 118,155, 115,192, color=fc, w=5)
        # Rear hand on hip
        limb(d, 140,115, 162,148, color=fc, w=6)
        limb(d, 162,148, 158,178, color=fc, w=5)
        joint(d, 158,178, r=5, color=ac)
        # Legs side profile
        limb(d, 138,178, 132,232, color=fc, w=10)
        limb(d, 132,232, 128,268, color=fc, w=8)
        limb(d, 145,178, 148,232, color=fc, w=8)
        limb(d, 148,232, 152,268, color=fc, w=7)
    make_pose_gif('pose-mp-side', draw, dur=110)


# ═══════════════════════════════════════════════════════════════════════════
#  MAIN — run all generators
# ═══════════════════════════════════════════════════════════════════════════

ALL_GENERATORS = [
    # ── Chest ──
    gen_pushup, gen_incline_pushup, gen_decline_pushup, gen_diamond_pushup,
    gen_wide_pushup, gen_pike_pushup, gen_incline_dumbbell_press,
    gen_dumbbell_fly, gen_cable_fly, gen_barbell_bench_press,
    # ── Back ──
    gen_dead_hang, gen_pullup, gen_chinup, gen_bodyweight_row, gen_superman,
    gen_barbell_row, gen_dumbbell_row, gen_barbell_deadlift,
    gen_romanian_deadlift, gen_lat_pulldown, gen_seated_cable_row,
    gen_t_bar_row, gen_good_morning, gen_barbell_shrug,
    # ── Shoulders ──
    gen_lateral_raise, gen_front_raise, gen_shoulder_tap, gen_overhead_press,
    gen_arnold_press, gen_face_pull, gen_cable_lateral_raise,
    gen_dumbbell_shoulder_press, gen_upright_row, gen_reverse_fly,
    # ── Triceps ──
    gen_dip, gen_bench_dip, gen_tricep_extension, gen_skull_crusher,
    gen_tricep_pushdown, gen_cable_kickback,
    # ── Biceps ──
    gen_dumbbell_curl, gen_hammer_curl, gen_concentration_curl,
    gen_barbell_curl, gen_cable_curl, gen_preacher_curl,
    gen_incline_dumbbell_curl, gen_incline_hammer_curl,
    # ── Legs ──
    gen_squat, gen_barbell_squat, gen_lunge, gen_glute_bridge,
    gen_jump_squat, gen_single_leg_squat, gen_calf_raise,
    gen_bulgarian_split_squat, gen_leg_press, gen_leg_extension,
    gen_leg_curl, gen_hack_squat, gen_barbell_hip_thrust,
    gen_step_up, gen_box_jump,
    # ── Core ──
    gen_plank, gen_hollow_body, gen_crunch, gen_mountain_climber,
    gen_leg_raise, gen_russian_twist,
    # ── Cardio ──
    gen_burpee,
    # ── IFBB Poses – Classic / Open ──
    gen_pose_front_double_biceps, gen_pose_front_lat_spread,
    gen_pose_side_chest, gen_pose_back_double_biceps,
    gen_pose_back_lat_spread, gen_pose_side_triceps,
    gen_pose_abs_thighs, gen_pose_most_muscular,
    # ── IFBB Poses – Men's Physique ──
    gen_pose_mp_front, gen_pose_mp_back, gen_pose_mp_side,
]

if __name__ == '__main__':
    import sys
    import time

    # Optional: run only specific IDs passed as CLI args
    # e.g.  python generate_gifs_pillow.py pushup pullup
    filter_names = sys.argv[1:] if len(sys.argv) > 1 else []

    print(f"\n{'='*55}")
    print(f"  BODYBVILDER GIF Generator")
    print(f"  Output: {OUT_DIR}")
    print(f"{'='*55}\n")

    total   = len(ALL_GENERATORS)
    skipped = 0
    done    = 0
    errors  = []
    t0      = time.time()

    for i, fn in enumerate(ALL_GENERATORS, 1):
        name = fn.__name__.replace('gen_', '').replace('_', '-')
        # Map python name back to gif filename
        gif_name = name

        if filter_names and gif_name not in filter_names:
            skipped += 1
            continue

        try:
            fn()
            done += 1
        except Exception as e:
            errors.append((gif_name, str(e)))
            print(f"  ✗ {gif_name}: {e}")

    elapsed = time.time() - t0
    print(f"\n{'='*55}")
    print(f"  Done: {done}/{total - skipped} GIFs in {elapsed:.1f}s")
    if skipped:
        print(f"  Skipped: {skipped}")
    if errors:
        print(f"\n  Errors ({len(errors)}):")
        for name, err in errors:
            print(f"    {name}: {err}")
    print(f"\n  Files saved to:")
    print(f"  {OUT_DIR}")
    print(f"{'='*55}\n")
