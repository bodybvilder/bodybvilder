"""
BODYBVILDER — GIF Generator V2  (Professional Quality)
=======================================================
Improvements over V1:
  • Capsule-based limbs  — pill shape (2 circles + filled quad), real volume
  • Muscular torso       — trapezoid chest + narrower waist
  • Detailed equipment   — barbell with plates, bench with padding/legs, cables
  • Muscle highlight     — active muscles glow in accent (#C8FF00)
  • Smooth animation     — 20 frames ping-pong, ease-in-out
  • Depth shadow         — subtle ellipse under feet for ground contact
  • Anti-alias trick     — draw 2× size then resize down (4× smoother edges)

Run:
    python generate_gifs_pillow_v2.py

pip install Pillow
"""

import os, math
from PIL import Image, ImageDraw, ImageFilter

# ── Paths ─────────────────────────────────────────────────────────────────
OUT_DIR = os.path.join(os.path.dirname(__file__), "public", "exercise-gifs")
os.makedirs(OUT_DIR, exist_ok=True)

# ── Canvas — draw at 2× then downsample to 300×300 (free anti-alias) ─────
SCALE   = 2
WW, HH  = 300 * SCALE, 300 * SCALE   # internal draw size
W,  H   = 300, 300                    # output size

FRAMES  = 20          # per half-cycle (ping-pong = 38 unique frames)
DUR_MS  = 50          # ms per frame → ≈20fps, 1.9s loop

# ── Palette ───────────────────────────────────────────────────────────────
BG      = (10,  10,  10)
FIG     = (210, 210, 210)    # body fill
FIG_D   = (150, 150, 150)    # shadow / back limb
FIG_L   = (235, 235, 235)    # highlight / front limb
ACC     = (200, 255,   0)    # #C8FF00  accent — active muscle
EQP     = (90,  90,  90)     # equipment main
EQP_L   = (130, 130, 130)    # equipment highlight
EQP_D   = (55,  55,  55)     # equipment shadow
GND     = (40,  40,  40)     # ground line
SKN     = (220, 185, 145)    # skin tone (head / hands)
SHD     = (25,  25,  25)     # floor shadow ellipse


def s(v):
    """Scale a coordinate or list/tuple of coordinates."""
    if isinstance(v, (list, tuple)):
        return type(v)(s(x) for x in v)
    return v * SCALE


# ═══════════════════════════════════════════════════════════════════════════
#  CORE DRAWING PRIMITIVES
# ═══════════════════════════════════════════════════════════════════════════

def new_frame():
    img = Image.new("RGB", (WW, HH), BG)
    d   = ImageDraw.Draw(img)
    return img, d

def downscale(img):
    return img.resize((W, H), Image.LANCZOS)

def save_gif(frames, name, duration=DUR_MS):
    path = os.path.join(OUT_DIR, f"{name}.gif")
    frames[0].save(path, save_all=True, append_images=frames[1:],
                   loop=0, duration=duration, optimize=False)
    print(f"  ✓ {name}.gif  ({len(frames)} frames)")


# ── Math helpers ──────────────────────────────────────────────────────────
def lerp(a, b, t):   return a + (b - a) * t
def ease(t):         return t * t * (3 - 2 * t)   # smooth-step

def ping_pong(frames):
    return frames + list(reversed(frames[1:-1]))

def pt(x, y): return (int(x * SCALE), int(y * SCALE))


# ── Capsule (pill shape) ──────────────────────────────────────────────────
def capsule(d, x1, y1, x2, y2, r, color):
    """
    Draw a filled capsule from (x1,y1) to (x2,y2) with radius r.
    This is the fundamental limb primitive — gives volume to arms/legs.
    """
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy)
    if length < 1:
        d.ellipse([x1-r, y1-r, x1+r, y1+r], fill=color)
        return
    # Perpendicular unit vector
    px, py = -dy / length * r, dx / length * r
    # Quad polygon
    poly = [
        (x1 + px, y1 + py),
        (x2 + px, y2 + py),
        (x2 - px, y2 - py),
        (x1 - px, y1 - py),
    ]
    d.polygon(poly, fill=color)
    d.ellipse([x1-r, y1-r, x1+r, y1+r], fill=color)
    d.ellipse([x2-r, y2-r, x2+r, y2+r], fill=color)


def capsule_s(d, x1, y1, x2, y2, r, color):
    """capsule with auto-scaled coords."""
    capsule(d, x1*SCALE, y1*SCALE, x2*SCALE, y2*SCALE, r*SCALE, color)


# ── Head ─────────────────────────────────────────────────────────────────
def head(d, cx, cy, r=13, color=SKN, neck_color=FIG):
    # Neck
    capsule_s(d, cx, cy+r*0.6, cx, cy+r*1.8, r*0.38, neck_color)
    # Head circle
    cx2, cy2 = cx*SCALE, cy*SCALE
    r2 = r*SCALE
    d.ellipse([cx2-r2, cy2-r2, cx2+r2, cy2+r2], fill=color)


# ── Torso ─────────────────────────────────────────────────────────────────
def torso(d, sx, sy, sw, hw, h, color=FIG, accent_chest=False, accent_back=False):
    """
    sx, sy  = top-center of torso (shoulders midpoint)
    sw      = shoulder half-width
    hw      = hip half-width
    h       = torso height
    """
    # Trapezoid: wider at shoulders, narrower at waist
    pts = [
        pt(sx - sw, sy),
        pt(sx + sw, sy),
        pt(sx + hw, sy + h),
        pt(sx - hw, sy + h),
    ]
    d.polygon(pts, fill=color)
    # Chest muscle highlight
    if accent_chest:
        chest_pts = [
            pt(sx - sw*0.7, sy + h*0.05),
            pt(sx - sw*0.1, sy + h*0.05),
            pt(sx - sw*0.1, sy + h*0.45),
            pt(sx - sw*0.7, sy + h*0.4),
        ]
        d.polygon(chest_pts, fill=ACC)
        chest_pts2 = [
            pt(sx + sw*0.1, sy + h*0.05),
            pt(sx + sw*0.7, sy + h*0.05),
            pt(sx + sw*0.7, sy + h*0.4),
            pt(sx + sw*0.1, sy + h*0.45),
        ]
        d.polygon(chest_pts2, fill=ACC)
    # Back / lat highlight
    if accent_back:
        lat_l = [
            pt(sx - sw*0.95, sy + h*0.1),
            pt(sx - sw*0.3,  sy + h*0.2),
            pt(sx - hw*0.95, sy + h*0.9),
            pt(sx - sw*0.95, sy + h*0.9),
        ]
        d.polygon(lat_l, fill=ACC)
        lat_r = [
            pt(sx + sw*0.3,  sy + h*0.2),
            pt(sx + sw*0.95, sy + h*0.1),
            pt(sx + sw*0.95, sy + h*0.9),
            pt(sx + hw*0.95, sy + h*0.9),
        ]
        d.polygon(lat_r, fill=ACC)


# ── Ground & shadow ───────────────────────────────────────────────────────
def ground(d, y=274):
    d.line([s(15), s(y), s(285), s(y)], fill=GND, width=s(2))

def floor_shadow(d, cx, y, rx=28, ry=5):
    cx2, y2 = cx*SCALE, y*SCALE
    d.ellipse([cx2-rx*SCALE, y2-ry*SCALE, cx2+rx*SCALE, y2+ry*SCALE], fill=SHD)


# ── Equipment ─────────────────────────────────────────────────────────────
def barbell(d, cx, cy, angle_deg=0, bar_len=160, plate_w=14, plate_h=28):
    """Professional barbell with round plates."""
    a = math.radians(angle_deg)
    bx, by = math.cos(a) * bar_len/2 * SCALE, math.sin(a) * bar_len/2 * SCALE
    # Bar
    d.line([cx*SCALE-bx, cy*SCALE-by, cx*SCALE+bx, cy*SCALE+by],
           fill=EQP_L, width=5*SCALE)
    # Plates each side
    for sign in (-1, 1):
        ex = cx*SCALE + sign*bx
        ey = cy*SCALE + sign*by
        # Draw 3 stacked plates
        pa = math.radians(angle_deg + 90)
        for off in (-0.55, 0, 0.55):
            ox = math.cos(pa) * off * plate_w * SCALE
            oy = math.sin(pa) * off * plate_w * SCALE
            pr = plate_h/2 * SCALE
            d.ellipse([ex+ox-pr, ey+oy-pr, ex+ox+pr, ey+oy+pr], fill=EQP)
        # Collar
        cr = plate_h*0.35 * SCALE
        d.ellipse([ex-cr, ey-cr, ex+cr, ey+cr], fill=EQP_L)


def dumbbell(d, cx, cy, angle_deg=0, length=44, r_head=9):
    """Detailed dumbbell."""
    a  = math.radians(angle_deg)
    dx = math.cos(a) * length/2 * SCALE
    dy = math.sin(a) * length/2 * SCALE
    # Handle
    d.line([cx*SCALE-dx, cy*SCALE-dy, cx*SCALE+dx, cy*SCALE+dy],
           fill=EQP_L, width=4*SCALE)
    # Heads
    for sign in (-1, 1):
        hx = cx*SCALE + sign*dx
        hy = cy*SCALE + sign*dy
        rr = r_head * SCALE
        d.ellipse([hx-rr, hy-rr, hx+rr, hy+rr], fill=EQP)
        # inner ring highlight
        ri = rr * 0.55
        d.ellipse([hx-ri, hy-ri, hx+ri, hy+ri], fill=EQP_L)


def flat_bench(d, bx=35, by=200, bw=230, bh=16, pad_h=10):
    """Flat bench with padding + legs."""
    # Legs
    leg_positions = [(bx+18, by+bh), (bx+bw-18, by+bh)]
    for lx, ly in leg_positions:
        d.rectangle([s(lx-4), s(ly), s(lx+4), s(ly+28)], fill=EQP_D)
        d.rectangle([s(lx-10), s(ly+28), s(lx+10), s(ly+32)], fill=EQP_D)
    # Bench base
    d.rectangle([s(bx), s(by+pad_h), s(bx+bw), s(by+bh+pad_h)], fill=EQP_D)
    # Padding (lighter, slightly rounded top)
    d.rectangle([s(bx+2), s(by), s(bx+bw-2), s(by+pad_h+4)], fill=EQP)
    # Padding highlight line
    d.line([s(bx+8), s(by+3), s(bx+bw-8), s(by+3)], fill=EQP_L, width=s(2))


def incline_bench(d, ox=150, oy=165):
    """Incline bench ~40°, origin at seat hinge."""
    # Seat (flat part)
    d.polygon([pt(ox-60,oy), pt(ox+10,oy), pt(ox+10,oy+14), pt(ox-60,oy+14)], fill=EQP)
    # Back pad (inclined)
    back = [pt(ox+10,oy+14), pt(ox+10,oy), pt(ox+95,oy-60), pt(ox+95,oy-46)]
    d.polygon(back, fill=EQP)
    # Legs
    d.rectangle([s(ox-50), s(oy+14), s(ox-42), s(oy+36)], fill=EQP_D)
    d.rectangle([s(ox+5),  s(oy+14), s(ox+13), s(oy+36)], fill=EQP_D)
    # Highlight
    d.line([s(ox+12), s(oy-1), s(ox+93), s(oy-59)], fill=EQP_L, width=s(2))


def pull_bar(d, y=28, x1=55, x2=245):
    """Pull-up bar with mounting brackets."""
    # Mount lines
    d.line([s(x1+8), s(y-14), s(x1+8), s(y+6)],  fill=EQP_D, width=s(3))
    d.line([s(x2-8), s(y-14), s(x2-8), s(y+6)],  fill=EQP_D, width=s(3))
    # Bar
    d.rectangle([s(x1), s(y), s(x2), s(y+8)], fill=EQP)
    # Knurl marks
    for xx in range(x1+18, x2-15, 12):
        d.line([s(xx), s(y+1), s(xx), s(y+7)], fill=EQP_D, width=s(1))
    # Highlight
    d.line([s(x1+2), s(y+1), s(x2-2), s(y+1)], fill=EQP_L, width=s(1))


def cable_machine(d, anchor_x, anchor_y, hand_x, hand_y, side='right'):
    """Cable line + pulley."""
    # Pulley wheel
    pr = 7
    d.ellipse([s(anchor_x-pr), s(anchor_y-pr),
               s(anchor_x+pr), s(anchor_y+pr)], fill=EQP)
    d.ellipse([s(anchor_x-pr*0.5), s(anchor_y-pr*0.5),
               s(anchor_x+pr*0.5), s(anchor_y+pr*0.5)], fill=EQP_L)
    # Cable line
    d.line([s(anchor_x), s(anchor_y+pr), s(hand_x), s(hand_y)],
           fill=EQP_L, width=s(2))


def box_platform(d, bx=80, by=200, bw=140, bh=72):
    """Plyometric box with 3D depth effect."""
    # Front face
    d.rectangle([s(bx), s(by), s(bx+bw), s(by+bh)], fill=EQP_D)
    # Top face (lighter)
    d.polygon([pt(bx,by), pt(bx+bw,by),
               pt(bx+bw-10,by-12), pt(bx+10,by-12)], fill=EQP)
    # Right side face
    d.polygon([pt(bx+bw,by), pt(bx+bw,by+bh),
               pt(bx+bw-10,by+bh-5), pt(bx+bw-10,by-12)], fill=EQP_L)
    # Top highlight
    d.line([s(bx+12), s(by-11), s(bx+bw-11), s(by-11)],
           fill=EQP_L, width=s(1))


def machine_seat(d, bx=70, by=175, bw=160, bh=90):
    """Generic machine seat/frame."""
    # Back support
    d.rectangle([s(bx+bw-20), s(by-40), s(bx+bw), s(by+bh)], fill=EQP_D)
    # Seat
    d.rectangle([s(bx), s(by+bh-20), s(bx+bw-20), s(by+bh)], fill=EQP)
    d.line([s(bx+4), s(by+bh-18), s(bx+bw-24), s(by+bh-18)],
           fill=EQP_L, width=s(2))


# ═══════════════════════════════════════════════════════════════════════════
#  FULL BODY RENDERER
#  Every exercise calls draw_body() with a pose dict.
#  Pose keys (all in 300×300 space, scaled internally):
#    head_x, head_y
#    shoulder_x, shoulder_y   (midpoint)
#    shoulder_w               (half-width of shoulders)
#    hip_x, hip_y
#    hip_w                    (half-width of hips)
#    elbow_lx/ly, hand_lx/ly  (left arm)
#    elbow_rx/ry, hand_rx/ry  (right arm)
#    knee_lx/ly, foot_lx/ly   (left leg)
#    knee_rx/ry, foot_rx/ry   (right leg)
#
#  accent flags (True = draw that segment in #C8FF00):
#    acc_chest, acc_back, acc_shoulder_l, acc_shoulder_r
#    acc_bicep_l, acc_bicep_r, acc_tricep_l, acc_tricep_r
#    acc_quad_l,  acc_quad_r,  acc_glute,    acc_core
#    acc_calf_l,  acc_calf_r
# ═══════════════════════════════════════════════════════════════════════════

LIMB_R  = 7      # default capsule radius for arms (in 300px space)
LEG_R   = 9      # capsule radius for legs
FORE_R  = 6      # forearm radius
SHIN_R  = 7      # shin radius
JR      = 4      # joint dot radius (knee cap etc)


def draw_body(d, p, flip_x=False):
    """
    Draw a complete side-view or front-view body.
    p = pose dict with all coordinates in 300px space.
    flip_x = mirror horizontally (for exercises facing other direction)

    KEY FIX: torso is drawn from shoulder_y → hip_y (using actual hip coords),
    so it always connects to where the legs start. No more split body.
    """
    def fx(x):
        return 300 - x if flip_x else x

    def fp(key_x, key_y):
        return fx(p[key_x]), p[key_y]

    def col(flag_key, default=FIG):
        return ACC if p.get(flag_key) else default

    # Resolve actual hip position
    hip_x = fx(p['hip_x'])
    hip_y = p['hip_y']
    sh_x  = fx(p['shoulder_x'])
    sh_y  = p['shoulder_y']

    sw = p.get('shoulder_w', 32)
    hw = p.get('hip_w', 20)

    # ── Layer 1: back leg ─────────────────────────────────────────────────
    capsule_s(d, hip_x, hip_y, *fp('knee_rx','knee_ry'), LEG_R, FIG_D)
    capsule_s(d, *fp('knee_rx','knee_ry'), *fp('foot_rx','foot_ry'), SHIN_R, FIG_D)

    # Back arm
    capsule_s(d, sh_x + p.get('shldr_off_rx', 0), sh_y,
                 *fp('elbow_rx','elbow_ry'), LIMB_R, FIG_D)
    capsule_s(d, *fp('elbow_rx','elbow_ry'), *fp('hand_rx','hand_ry'), FORE_R, FIG_D)

    # ── Layer 2: torso — anchored shoulder→hip so it ALWAYS connects ──────
    # Draw torso as trapezoid from (sh_x, sh_y) down to (hip_x, hip_y)
    # This replaces the old fixed-height torso() that caused the gap.
    torso_color = col('acc_back', FIG)
    pts = [
        pt(sh_x - sw, sh_y),
        pt(sh_x + sw, sh_y),
        pt(hip_x + hw, hip_y),
        pt(hip_x - hw, hip_y),
    ]
    d.polygon(pts, fill=torso_color)

    # Chest highlight overlay
    if p.get('acc_chest'):
        th = hip_y - sh_y
        chest_l = [
            pt(sh_x - sw*0.7, sh_y + th*0.05),
            pt(sh_x - sw*0.1, sh_y + th*0.05),
            pt(hip_x - hw*0.1, sh_y + th*0.5),
            pt(sh_x - sw*0.7, sh_y + th*0.45),
        ]
        d.polygon(chest_l, fill=ACC)
        chest_r = [
            pt(sh_x + sw*0.1, sh_y + th*0.05),
            pt(sh_x + sw*0.7, sh_y + th*0.05),
            pt(sh_x + sw*0.7, sh_y + th*0.45),
            pt(hip_x + hw*0.1, sh_y + th*0.5),
        ]
        d.polygon(chest_r, fill=ACC)

    # Back/lat highlight
    if p.get('acc_back'):
        th = hip_y - sh_y
        d.polygon([
            pt(sh_x - sw*0.95, sh_y + th*0.1),
            pt(sh_x - sw*0.3,  sh_y + th*0.2),
            pt(hip_x - hw*0.9, sh_y + th*0.9),
            pt(sh_x - sw*0.95, sh_y + th*0.9),
        ], fill=ACC)
        d.polygon([
            pt(sh_x + sw*0.3,  sh_y + th*0.2),
            pt(sh_x + sw*0.95, sh_y + th*0.1),
            pt(sh_x + sw*0.95, sh_y + th*0.9),
            pt(hip_x + hw*0.9, sh_y + th*0.9),
        ], fill=ACC)

    # Hip junction — filled circle to blend torso→leg joint cleanly
    hw2 = int(hw * SCALE)
    hx2, hy2 = int(hip_x * SCALE), int(hip_y * SCALE)
    d.ellipse([hx2 - hw2, hy2 - hw2, hx2 + hw2, hy2 + hw2], fill=torso_color)

    # ── Layer 3: front leg ────────────────────────────────────────────────
    q_col = ACC if p.get('acc_quad_l') else FIG_L
    s_col = ACC if p.get('acc_calf_l') else FIG
    capsule_s(d, hip_x, hip_y, *fp('knee_lx','knee_ly'), LEG_R + 1, q_col)
    capsule_s(d, *fp('knee_lx','knee_ly'), *fp('foot_lx','foot_ly'), SHIN_R, s_col)

    # Knee cap dot
    kx, ky = fp('knee_lx','knee_ly')
    d.ellipse([int(kx*SCALE)-JR*SCALE, int(ky*SCALE)-JR*SCALE,
               int(kx*SCALE)+JR*SCALE, int(ky*SCALE)+JR*SCALE], fill=FIG_L)

    # ── Layer 4: front arm ────────────────────────────────────────────────
    ua_col = col('acc_bicep_l', col('acc_shoulder_l', FIG_L))
    fa_col = col('acc_bicep_l', col('acc_tricep_l',   FIG_L))

    capsule_s(d, sh_x + p.get('shldr_off_lx', 0), sh_y,
                 *fp('elbow_lx','elbow_ly'), LIMB_R, ua_col)
    capsule_s(d, *fp('elbow_lx','elbow_ly'), *fp('hand_lx','hand_ly'), FORE_R, fa_col)

    # ── Layer 5: head ─────────────────────────────────────────────────────
    head(d, fx(p['head_x']), p['head_y'], r=p.get('head_r', 12))


# ── Pose builder helpers ──────────────────────────────────────────────────
def base_standing(
        head_x=150, head_y=38,
        sh_x=150,   sh_y=62,  sh_w=30, hip_w=20, torso_h=72,
        hip_x=150,  hip_y=134,
        elbow_lx=115, elbow_ly=110, hand_lx=108, hand_ly=148,
        elbow_rx=185, elbow_ry=110, hand_rx=192, hand_ry=148,
        knee_lx=135, knee_ly=178,  foot_lx=128,  foot_ly=232,
        knee_rx=165, knee_ry=178,  foot_rx=172,  foot_ry=232,
        **extras):
    p = dict(
        head_x=head_x, head_y=head_y,
        shoulder_x=sh_x, shoulder_y=sh_y,
        shoulder_w=sh_w, hip_w=hip_w, torso_h=torso_h,
        hip_x=hip_x, hip_y=hip_y,
        elbow_lx=elbow_lx, elbow_ly=elbow_ly,
        hand_lx=hand_lx, hand_ly=hand_ly,
        elbow_rx=elbow_rx, elbow_ry=elbow_ry,
        hand_rx=hand_rx, hand_ry=hand_ry,
        knee_lx=knee_lx, knee_ly=knee_ly,
        foot_lx=foot_lx, foot_ly=foot_ly,
        knee_rx=knee_rx, knee_ry=knee_ry,
        foot_rx=foot_rx, foot_ry=foot_ry,
    )
    p.update(extras)
    return p


def interp_pose(p0, p1, t):
    """Interpolate two pose dicts. Boolean flags taken from p0."""
    t = ease(t)
    result = {}
    for k in p0:
        v0, v1 = p0[k], p1.get(k, p0[k])
        if isinstance(v0, bool):
            result[k] = v0
        elif isinstance(v0, (int, float)):
            result[k] = lerp(v0, v1, t)
        else:
            result[k] = v0
    return result


def make_gif(name, pose_a, pose_b, draw_extras=None, n=FRAMES, dur=DUR_MS, flip=False):
    """
    Interpolate from pose_a → pose_b → pose_a (ping-pong).
    draw_extras(d, t) draws equipment behind the figure.
    t ∈ [0,1]
    """
    frames_raw = []
    for i in range(n):
        t = i / (n - 1)
        p = interp_pose(pose_a, pose_b, t)
        img, d = new_frame()
        ground(d)
        # Floor shadow
        floor_shadow(d, p['hip_x'], 272)
        if draw_extras:
            draw_extras(d, t)
        draw_body(d, p, flip_x=flip)
        frames_raw.append(downscale(img))

    save_gif(ping_pong(frames_raw), name, duration=dur)


# ═══════════════════════════════════════════════════════════════════════════
#  CHEST EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_pushup():
    # Side-view plank. Figure is horizontal. Custom draw.
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        # top: arms straight; bottom: chest near floor, elbows bent
        chest_y = lerp(145, 168, t)
        elbow_y = lerp(168, 202, t)
        hand_y  = lerp(182, 218, t)
        img, d  = new_frame()
        ground(d, 222)
        floor_shadow(d, 150, 220, rx=50, ry=4)
        # Plank body — horizontal capsule
        capsule_s(d, 62, chest_y-8, 240, 185, 11, FIG)      # torso horizontal
        capsule_s(d, 240, 185, 268, 212, 9, FIG_D)            # legs
        # Arms
        capsule_s(d, 95,  chest_y, 85,  elbow_y, 7, ACC)     # upper arm L
        capsule_s(d, 85,  elbow_y, 72,  hand_y,  6, ACC)     # forearm L
        capsule_s(d, 125, chest_y, 118, elbow_y, 7, FIG_L)
        capsule_s(d, 118, elbow_y, 108, hand_y,  6, FIG_L)
        # Head
        head(d, 52, chest_y - 22, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'pushup')


def gen_incline_pushup():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        chest_y = lerp(148, 165, t)
        elbow_y = lerp(170, 196, t)
        img, d = new_frame()
        ground(d)
        box_platform(d, bx=22, by=178, bw=105, bh=50)
        floor_shadow(d, 190, 272, rx=45, ry=4)
        # Body diagonal (head high, feet low)
        capsule_s(d, 68, chest_y-12, 228, 210, 11, FIG)
        capsule_s(d, 228, 210, 262, 240, 9, FIG_D)
        capsule_s(d, 92, chest_y, 78, elbow_y, 7, ACC)
        capsule_s(d, 78, elbow_y, 62, 188, 6, ACC)
        capsule_s(d, 115, chest_y, 102, elbow_y, 7, FIG_L)
        capsule_s(d, 102, elbow_y, 88, 188, 6, FIG_L)
        head(d, 52, chest_y - 24, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'incline-pushup')


def gen_decline_pushup():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        chest_y = lerp(175, 196, t)
        elbow_y = lerp(196, 226, t)
        hand_y  = lerp(212, 242, t)
        img, d = new_frame()
        ground(d)
        box_platform(d, bx=170, by=185, bw=110, bh=68)
        floor_shadow(d, 105, 272, rx=45, ry=4)
        capsule_s(d, 58, chest_y-10, 210, 170, 11, FIG)
        capsule_s(d, 210, 170, 238, 190, 9, FIG_D)
        capsule_s(d, 88, chest_y, 74, elbow_y, 7, ACC)
        capsule_s(d, 74, elbow_y, 60, hand_y, 6, ACC)
        capsule_s(d, 112, chest_y, 100, elbow_y, 7, FIG_L)
        capsule_s(d, 100, elbow_y, 88, hand_y, 6, FIG_L)
        head(d, 44, chest_y - 26, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'decline-pushup')


def gen_diamond_pushup():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        chest_y = lerp(148, 170, t)
        elbow_y = lerp(172, 205, t)
        img, d = new_frame()
        ground(d, 222)
        floor_shadow(d, 150, 220, rx=50, ry=4)
        capsule_s(d, 62, chest_y-8, 240, 185, 11, FIG)
        capsule_s(d, 240, 185, 268, 212, 9, FIG_D)
        # Arms converge to diamond center
        capsule_s(d, 105, chest_y, 142, elbow_y, 7, ACC)
        capsule_s(d, 142, elbow_y, 148, 218, 6, ACC)
        capsule_s(d, 135, chest_y, 155, elbow_y, 7, FIG_L)
        capsule_s(d, 155, elbow_y, 152, 218, 6, FIG_L)
        # Diamond shape indicator
        diamond = [pt(142,210), pt(150,200), pt(158,210), pt(150,220)]
        d.polygon(diamond, outline=ACC, fill=None)
        head(d, 52, chest_y - 22, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'diamond-pushup')


def gen_wide_pushup():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        chest_y = lerp(148, 165, t)
        elbow_y = lerp(170, 200, t)
        img, d = new_frame()
        ground(d, 222)
        floor_shadow(d, 150, 220, rx=55, ry=4)
        capsule_s(d, 62, chest_y-8, 240, 185, 11, FIG)
        capsule_s(d, 240, 185, 268, 212, 9, FIG_D)
        # Arms flare wide
        capsule_s(d, 95, chest_y, 55, elbow_y, 7, ACC)
        capsule_s(d, 55, elbow_y, 38, 218, 6, ACC)
        capsule_s(d, 130, chest_y, 188, elbow_y, 7, FIG_L)
        capsule_s(d, 188, elbow_y, 210, 218, 6, FIG_L)
        head(d, 52, chest_y - 22, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'wide-pushup')


def gen_pike_pushup():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        # hips stay HIGH, head drops toward floor
        head_y  = lerp(195, 230, t)
        elbow_y = lerp(215, 248, t)
        img, d = new_frame()
        ground(d, 268)
        floor_shadow(d, 150, 266, rx=55, ry=4)
        # Inverted V shape
        capsule_s(d, 140, 108, 100, 258, 10, FIG)     # left leg
        capsule_s(d, 160, 108, 200, 258, 10, FIG_D)   # right leg
        # Torso from hips to shoulders
        capsule_s(d, 150, 108, 130, head_y-10, 11, FIG)
        # Arms
        capsule_s(d, 128, head_y-12, 88, elbow_y, 7, ACC)
        capsule_s(d, 88, elbow_y, 75, 260, 6, ACC)
        capsule_s(d, 132, head_y-12, 175, elbow_y, 7, FIG_L)
        capsule_s(d, 175, elbow_y, 188, 260, 6, FIG_L)
        head(d, 118, head_y, r=12)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'pike-pushup')


def gen_incline_dumbbell_press():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        hand_y  = lerp(118, 162, t)
        elbow_y = lerp(148, 180, t)
        img, d = new_frame()
        incline_bench(d, ox=148, oy=168)
        ground(d)
        floor_shadow(d, 140, 272)
        dumbbell(d, 100, hand_y, angle_deg=15)
        dumbbell(d, 204, hand_y, angle_deg=-15)
        p0 = base_standing(
            head_x=228, head_y=125,
            sh_x=195, sh_y=148, sh_w=28, hip_w=18, torso_h=62,
            hip_x=158, hip_y=210,
            elbow_lx=130, elbow_ly=elbow_y, hand_lx=100, hand_ly=hand_y,
            elbow_rx=210, elbow_ry=elbow_y, hand_rx=204, hand_ry=hand_y,
            knee_lx=138, knee_ly=242, foot_lx=122, foot_ly=268,
            knee_rx=162, knee_ry=244, foot_rx=178, foot_ry=270,
            acc_chest=True,
        )
        draw_body(d, p0)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'incline-dumbbell-press')


def gen_dumbbell_fly():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        hand_lx = lerp(65,  130, t)
        hand_rx = lerp(235, 170, t)
        hand_y  = lerp(178, 158, t)
        elbow_lx = lerp(85,  122, t)
        elbow_rx = lerp(215, 178, t)
        elbow_y  = lerp(188, 172, t)
        img, d = new_frame()
        flat_bench(d, bx=38, by=202)
        ground(d)
        floor_shadow(d, 150, 272)
        dumbbell(d, hand_lx, hand_y, angle_deg=0)
        dumbbell(d, hand_rx, hand_y, angle_deg=0)
        p0 = base_standing(
            head_x=238, head_y=148,
            sh_x=188, sh_y=172, sh_w=28, hip_w=18, torso_h=58,
            hip_x=155, hip_y=230,
            elbow_lx=elbow_lx, elbow_ly=elbow_y, hand_lx=hand_lx, hand_ly=hand_y,
            elbow_rx=elbow_rx, elbow_ry=elbow_y, hand_rx=hand_rx, hand_ry=hand_y,
            knee_lx=138, knee_ly=255, foot_lx=125, foot_ly=270,
            knee_rx=162, knee_ry=256, foot_rx=175, foot_ry=270,
            acc_chest=True,
        )
        draw_body(d, p0)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'dumbbell-fly')


def gen_cable_fly():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        hand_lx = lerp(42,  130, t)
        hand_rx = lerp(258, 170, t)
        hand_y  = lerp(158, 170, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        cable_machine(d, 20, 45, hand_lx, hand_y, 'left')
        cable_machine(d, 280, 45, hand_rx, hand_y, 'right')
        p0 = base_standing(
            head_x=150, head_y=38,
            sh_x=150, sh_y=62, sh_w=30, hip_w=20, torso_h=72,
            hip_x=150, hip_y=134,
            elbow_lx=lerp(82,120,ease(t)), elbow_ly=145,
            hand_lx=hand_lx, hand_ly=hand_y,
            elbow_rx=lerp(218,180,ease(t)), elbow_ry=145,
            hand_rx=hand_rx, hand_ry=hand_y,
            knee_lx=132, knee_ly=178, foot_lx=125, foot_ly=232,
            knee_rx=168, knee_ry=178, foot_rx=175, foot_ry=232,
            acc_chest=True,
        )
        draw_body(d, p0)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'cable-fly')


def gen_barbell_bench_press():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        bar_y   = lerp(128, 172, t)
        elbow_y = lerp(158, 188, t)
        img, d = new_frame()
        flat_bench(d, bx=38, by=200)
        ground(d)
        floor_shadow(d, 150, 272)
        barbell(d, 150, bar_y, bar_len=172)
        p0 = base_standing(
            head_x=238, head_y=148,
            sh_x=188, sh_y=172, sh_w=28, hip_w=18, torso_h=58,
            hip_x=155, hip_y=228,
            elbow_lx=112, elbow_ly=elbow_y, hand_lx=85,  hand_ly=bar_y,
            elbow_rx=228, elbow_ry=elbow_y, hand_rx=215, hand_ry=bar_y,
            knee_lx=138, knee_ly=252, foot_lx=125, foot_ly=268,
            knee_rx=162, knee_ry=254, foot_rx=175, foot_ry=270,
            acc_chest=True,
        )
        draw_body(d, p0)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'barbell-bench-press')


# ═══════════════════════════════════════════════════════════════════════════
#  BACK EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_dead_hang():
    frames = []
    for i in range(FRAMES):
        t = math.sin(i / (FRAMES-1) * math.pi)
        sway = lerp(-5, 5, t)
        cx = 150 + sway
        img, d = new_frame()
        pull_bar(d)
        floor_shadow(d, cx, 272, rx=28, ry=4)
        p = base_standing(
            head_x=cx, head_y=78,
            sh_x=cx, sh_y=98, sh_w=24, hip_w=16, torso_h=70,
            hip_x=cx, hip_y=168,
            elbow_lx=cx-20, elbow_ly=68, hand_lx=cx-16, hand_ly=36,
            elbow_rx=cx+20, elbow_ry=68, hand_rx=cx+16, hand_ry=36,
            knee_lx=cx-8,  knee_ly=218, foot_lx=cx-6,  foot_ly=268,
            knee_rx=cx+8,  knee_ry=218, foot_rx=cx+6,  foot_ry=268,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(frames + list(reversed(frames[1:-1])), 'dead-hang', duration=100)


def gen_pullup():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        rise = lerp(0, -85, t)
        elbow_y = lerp(68, 32, t)
        img, d = new_frame()
        pull_bar(d)
        floor_shadow(d, 150, 272, rx=28, ry=3)
        p = base_standing(
            head_x=150, head_y=78+rise,
            sh_x=150, sh_y=98+rise, sh_w=24, hip_w=16, torso_h=70,
            hip_x=150, hip_y=168+rise,
            elbow_lx=122, elbow_ly=elbow_y+rise, hand_lx=118, hand_ly=34,
            elbow_rx=178, elbow_ry=elbow_y+rise, hand_rx=182, hand_ry=34,
            knee_lx=138,  knee_ly=218+rise, foot_lx=132, foot_ly=272+rise,
            knee_rx=162,  knee_ry=220+rise, foot_rx=168, foot_ry=274+rise,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'pullup')


def gen_chinup():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        rise = lerp(0, -82, t)
        elbow_y = lerp(68, 30, t)
        img, d = new_frame()
        pull_bar(d)
        floor_shadow(d, 150, 272, rx=28, ry=3)
        p = base_standing(
            head_x=150, head_y=78+rise,
            sh_x=150, sh_y=98+rise, sh_w=24, hip_w=16, torso_h=70,
            hip_x=150, hip_y=168+rise,
            elbow_lx=124, elbow_ly=elbow_y+rise, hand_lx=126, hand_ly=34,
            elbow_rx=176, elbow_ry=elbow_y+rise, hand_rx=174, hand_ry=34,
            knee_lx=138,  knee_ly=218+rise, foot_lx=132, foot_ly=272+rise,
            knee_rx=162,  knee_ry=220+rise, foot_rx=168, foot_ry=274+rise,
            acc_back=True, acc_bicep_l=True, acc_bicep_r=False,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'chinup')


def gen_superman():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        lift = lerp(0, -30, t)
        img, d = new_frame()
        ground(d, 212)
        floor_shadow(d, 150, 210, rx=55, ry=5)
        # Prone figure — horizontal
        capsule_s(d, 58, 200+lift*0.5, 195, 202, 11, FIG)  # torso
        # Arms extended forward
        capsule_s(d, 58, 200+lift*0.5, 22, 195+lift, 7, ACC)
        capsule_s(d, 60, 202+lift*0.5, 24, 200+lift, 6, ACC)
        # Legs extended back
        capsule_s(d, 195, 202, 252, 198+lift, 9, ACC)
        capsule_s(d, 196, 204, 254, 202+lift, 9, FIG_D)
        # Head
        head(d, 46, 192+lift, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'superman')


def gen_barbell_row():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        bar_y   = lerp(218, 168, t)
        elbow_y = lerp(208, 160, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        barbell(d, 148, bar_y, bar_len=168)
        # Bent-over figure
        p = dict(
            head_x=218, head_y=108,
            shoulder_x=188, shoulder_y=128, shoulder_w=26, hip_w=18, torso_h=58,
            hip_x=148, hip_y=186,
            elbow_lx=130, elbow_ly=elbow_y, hand_lx=108, hand_ly=bar_y,
            elbow_rx=185, elbow_ry=elbow_y, hand_rx=200, hand_ry=bar_y,
            knee_lx=128, knee_ly=228, foot_lx=118, foot_ly=268,
            knee_rx=165, knee_ry=228, foot_rx=178, foot_ry=268,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'barbell-row')


def gen_dumbbell_row():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        elbow_y = lerp(195, 148, t)
        hand_y  = lerp(228, 180, t)
        img, d = new_frame()
        flat_bench(d, bx=55, by=185, bw=130, bh=12)
        ground(d)
        floor_shadow(d, 155, 272)
        dumbbell(d, 232, hand_y)
        p = dict(
            head_x=232, head_y=105,
            shoulder_x=195, shoulder_y=128, shoulder_w=25, hip_w=17, torso_h=58,
            hip_x=158, hip_y=186,
            elbow_lx=112, elbow_ly=162, hand_lx=88,  hand_ly=188,
            elbow_rx=215, elbow_ry=elbow_y, hand_rx=232, hand_ry=hand_y,
            knee_lx=118, knee_ly=188, foot_lx=100, foot_ly=212,
            knee_rx=178, knee_ry=232, foot_rx=192, foot_ry=268,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'dumbbell-row')


def gen_barbell_deadlift():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        # 0=bottom: hinge; 1=top: standing
        torso_ang = lerp(58, 5, t)  # degrees
        hx, hy = 150, 198
        sr = math.radians(torso_ang)
        sx = hx + math.sin(sr) * 88
        sy = hy - math.cos(sr) * 88
        bar_y = lerp(258, 198, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        barbell(d, 150, bar_y, bar_len=172)
        p = dict(
            head_x=sx + math.sin(sr)*18, head_y=sy - 16,
            shoulder_x=sx, shoulder_y=sy,
            shoulder_w=28, hip_w=20, torso_h=lerp(82, 72, t),
            hip_x=hx, hip_y=hy,
            elbow_lx=sx-12, elbow_ly=sy+52,
            hand_lx=lerp(112,132,t), hand_ly=bar_y,
            elbow_rx=sx+12, elbow_ry=sy+52,
            hand_rx=lerp(188,168,t), hand_ry=bar_y,
            knee_lx=lerp(128,133,t), knee_ly=lerp(238,245,t),
            foot_lx=125, foot_ly=268,
            knee_rx=lerp(172,167,t), knee_ry=lerp(238,245,t),
            foot_rx=175, foot_ry=268,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'barbell-deadlift')


def gen_romanian_deadlift():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        torso_ang = lerp(5, 68, t)
        bar_y     = lerp(195, 248, t)
        hx, hy = 150, 196
        sr = math.radians(torso_ang)
        sx = hx + math.sin(sr) * 86
        sy = hy - math.cos(sr) * 86
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        barbell(d, sx, bar_y, bar_len=162)
        p = dict(
            head_x=sx + math.sin(sr)*18, head_y=sy-16,
            shoulder_x=sx, shoulder_y=sy,
            shoulder_w=27, hip_w=19, torso_h=72,
            hip_x=hx, hip_y=hy,
            elbow_lx=sx-10, elbow_ly=sy+50,
            hand_lx=lerp(126,106,t), hand_ly=bar_y,
            elbow_rx=sx+10, elbow_ry=sy+50,
            hand_rx=lerp(174,194,t), hand_ry=bar_y,
            knee_lx=134, knee_ly=242,
            foot_lx=126, foot_ly=268,
            knee_rx=166, knee_ry=242,
            foot_rx=174, foot_ry=268,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'romanian-deadlift')


def gen_lat_pulldown():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        bar_y   = lerp(52, 118, t)
        elbow_y = lerp(72, 142, t)
        img, d = new_frame()
        # Cable machine top
        d.rectangle([s(55), s(18), s(245), s(30)], fill=EQP_D)
        cable_machine(d, 150, 30, 150, bar_y)
        d.line([s(65), s(bar_y), s(235), s(bar_y)], fill=EQP_L, width=s(5))
        flat_bench(d, bx=78, by=225, bw=144, bh=10)
        ground(d)
        floor_shadow(d, 150, 272)
        p = base_standing(
            head_x=150, head_y=152,
            sh_x=150, sh_y=172, sh_w=26, hip_w=18, torso_h=54,
            hip_x=150, hip_y=226,
            elbow_lx=85,  elbow_ly=elbow_y, hand_lx=70,  hand_ly=bar_y,
            elbow_rx=215, elbow_ry=elbow_y, hand_rx=230, hand_ry=bar_y,
            knee_lx=128, knee_ly=262, foot_lx=112, foot_ly=274,
            knee_rx=172, knee_ry=262, foot_rx=188, foot_ry=274,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'lat-pulldown')


def gen_seated_cable_row():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_x = lerp(218, 158, t)
        img, d = new_frame()
        d.rectangle([s(255), s(195), s(272), s(212)], fill=EQP_D)
        cable_machine(d, 268, 202, hand_x, 185)
        flat_bench(d, bx=55, by=196, bw=108, bh=10)
        ground(d)
        floor_shadow(d, 130, 272)
        p = dict(
            head_x=102, head_y=128,
            shoulder_x=110, shoulder_y=148, shoulder_w=24, hip_w=17, torso_h=50,
            hip_x=115, hip_y=198,
            elbow_lx=lerp(205,148,t), elbow_ly=178,
            hand_lx=hand_x, hand_ly=185,
            elbow_rx=lerp(210,152,t), elbow_ry=180,
            hand_rx=hand_x+5, hand_ry=187,
            knee_lx=162, knee_ly=200, foot_lx=218, foot_ly=210,
            knee_rx=165, knee_ry=202, foot_rx=222, foot_ry=212,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'seated-cable-row')


def gen_t_bar_row():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        bar_y   = lerp(228, 175, t)
        elbow_y = lerp(218, 168, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        d.line([s(150), s(268), s(150), s(bar_y)], fill=EQP_L, width=s(5))
        dumbbell(d, 150, bar_y, angle_deg=90)
        p = dict(
            head_x=218, head_y=108,
            shoulder_x=188, shoulder_y=130, shoulder_w=26, hip_w=18, torso_h=56,
            hip_x=148, hip_y=186,
            elbow_lx=145, elbow_ly=elbow_y,
            hand_lx=142, hand_ly=bar_y,
            elbow_rx=162, elbow_ry=elbow_y,
            hand_rx=158, hand_ry=bar_y,
            knee_lx=128, knee_ly=228, foot_lx=118, foot_ly=268,
            knee_rx=165, knee_ry=228, foot_rx=178, foot_ry=268,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 't-bar-row')


def gen_good_morning():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        torso_ang = lerp(5, 72, t)
        hx, hy = 150, 198
        sr = math.radians(torso_ang)
        sx = hx + math.sin(sr) * 86
        sy = hy - math.cos(sr) * 86
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        barbell(d, sx, sy+5, bar_len=158)
        p = dict(
            head_x=sx+math.sin(sr)*18, head_y=sy-16,
            shoulder_x=sx, shoulder_y=sy,
            shoulder_w=27, hip_w=19, torso_h=72,
            hip_x=hx, hip_y=hy,
            elbow_lx=sx-35, elbow_ly=sy+18,
            hand_lx=sx-55, hand_ly=sy+6,
            elbow_rx=sx+35, elbow_ry=sy+18,
            hand_rx=sx+55, hand_ry=sy+6,
            knee_lx=134, knee_ly=242,
            foot_lx=126, foot_ly=268,
            knee_rx=166, knee_ry=242,
            foot_rx=174, foot_ry=268,
            acc_back=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'good-morning')


def gen_barbell_shrug():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        sh_y   = lerp(62, 42, t)
        head_y = lerp(38, 22, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        barbell(d, 150, 222, bar_len=168)
        p = base_standing(
            head_x=150, head_y=head_y,
            sh_x=150, sh_y=sh_y, sh_w=30, hip_w=20, torso_h=72,
            hip_x=150, hip_y=134,
            elbow_lx=108, elbow_ly=158, hand_lx=102, hand_ly=218,
            elbow_rx=192, elbow_ry=158, hand_rx=198, hand_ry=218,
            knee_lx=132, knee_ly=178, foot_lx=122, foot_ly=232,
            knee_rx=168, knee_ry=178, foot_rx=178, foot_ry=232,
            acc_shoulder_l=True, acc_shoulder_r=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'barbell-shrug')


# ═══════════════════════════════════════════════════════════════════════════
#  SHOULDER EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def gen_lateral_raise():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        arm_y = lerp(152, 106, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        dumbbell(d, 82,  arm_y)
        dumbbell(d, 218, arm_y)
        p = base_standing(
            elbow_lx=92,  elbow_ly=arm_y-8, hand_lx=78,  hand_ly=arm_y,
            elbow_rx=208, elbow_ry=arm_y-8, hand_rx=222, hand_ry=arm_y,
            acc_shoulder_l=True, acc_shoulder_r=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'lateral-raise')


def gen_front_raise():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y  = lerp(215, 105, t)
        elbow_y = lerp(195, 125, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        dumbbell(d, 116, hand_y)
        p = base_standing(
            elbow_lx=116, elbow_ly=elbow_y, hand_lx=116, hand_ly=hand_y,
            elbow_rx=185, elbow_ry=155, hand_rx=188, hand_ry=185,
            acc_shoulder_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'front-raise')


def gen_overhead_press():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        bar_y  = lerp(122, 42, t)
        elbow_y = lerp(115, 72, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        barbell(d, 150, bar_y, bar_len=152)
        p = base_standing(
            elbow_lx=100, elbow_ly=elbow_y, hand_lx=108, hand_ly=bar_y,
            elbow_rx=200, elbow_ry=elbow_y, hand_rx=192, hand_ry=bar_y,
            acc_shoulder_l=True, acc_shoulder_r=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'overhead-press')


def gen_arnold_press():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y = lerp(148, 48, t)
        elbow_y = lerp(138, 78, t)
        rot = lerp(0, 180, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        dumbbell(d, 108, hand_y, angle_deg=rot)
        dumbbell(d, 192, hand_y, angle_deg=-rot)
        p = base_standing(
            elbow_lx=100, elbow_ly=elbow_y, hand_lx=108, hand_ly=hand_y,
            elbow_rx=200, elbow_ry=elbow_y, hand_rx=192, hand_ry=hand_y,
            acc_shoulder_l=True, acc_shoulder_r=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'arnold-press')


def gen_face_pull():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_lx = lerp(212, 115, t)
        hand_rx = lerp(212, 185, t)
        elbow_y = lerp(108, 85, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 135, 272)
        cable_machine(d, 268, 108, hand_lx, 108)
        cable_machine(d, 268, 108, hand_rx, 110)
        p = base_standing(
            head_x=118, head_y=38,
            sh_x=122, sh_y=62,
            elbow_lx=80,  elbow_ly=elbow_y, hand_lx=hand_lx, hand_ly=108,
            elbow_rx=222, elbow_ry=elbow_y, hand_rx=hand_rx, hand_ry=110,
            acc_shoulder_l=True, acc_shoulder_r=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'face-pull')


def gen_cable_lateral_raise():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y = lerp(188, 105, t)
        elbow_y = lerp(178, 112, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        cable_machine(d, 28, 242, 116, hand_y)
        p = base_standing(
            elbow_lx=100, elbow_ly=elbow_y, hand_lx=116, hand_ly=hand_y,
            elbow_rx=192, elbow_ry=148, hand_rx=196, hand_ry=175,
            acc_shoulder_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'cable-lateral-raise')


def gen_dumbbell_shoulder_press():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y = lerp(125, 45, t)
        elbow_y = lerp(118, 75, t)
        img, d = new_frame()
        flat_bench(d, bx=78, by=218, bw=144, bh=10)
        ground(d)
        floor_shadow(d, 150, 272)
        dumbbell(d, 100, hand_y+60)
        dumbbell(d, 200, hand_y+60)
        p = base_standing(
            head_x=150, head_y=142,
            sh_x=150, sh_y=162, sh_w=26, hip_w=18, torso_h=54,
            hip_x=150, hip_y=216,
            elbow_lx=95,  elbow_ly=elbow_y+60, hand_lx=100, hand_ly=hand_y+60,
            elbow_rx=205, elbow_ry=elbow_y+60, hand_rx=200, hand_ry=hand_y+60,
            knee_lx=128, knee_ly=252, foot_lx=112, foot_ly=272,
            knee_rx=172, knee_ry=252, foot_rx=188, foot_ry=272,
            acc_shoulder_l=True, acc_shoulder_r=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'dumbbell-shoulder-press')


def gen_upright_row():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        bar_y  = lerp(218, 128, t)
        elbow_y = lerp(205, 98, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        barbell(d, 150, bar_y, bar_len=102)
        p = base_standing(
            elbow_lx=95,  elbow_ly=elbow_y, hand_lx=120, hand_ly=bar_y,
            elbow_rx=205, elbow_ry=elbow_y, hand_rx=180, hand_ry=bar_y,
            acc_shoulder_l=True, acc_shoulder_r=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'upright-row')


def gen_reverse_fly():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_lx = lerp(138, 78, t)
        hand_rx = lerp(172, 235, t)
        hand_y  = lerp(205, 145, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        dumbbell(d, hand_lx, hand_y)
        dumbbell(d, hand_rx, hand_y)
        p = dict(
            head_x=218, head_y=108,
            shoulder_x=185, shoulder_y=128, shoulder_w=25, hip_w=17, torso_h=56,
            hip_x=140, hip_y=184,
            elbow_lx=hand_lx+22, elbow_ly=hand_y-15,
            hand_lx=hand_lx, hand_ly=hand_y,
            elbow_rx=hand_rx-22, elbow_ry=hand_y-15,
            hand_rx=hand_rx, hand_ry=hand_y,
            knee_lx=120, knee_ly=225, foot_lx=110, foot_ly=265,
            knee_rx=158, knee_ry=225, foot_rx=168, foot_ry=265,
            acc_shoulder_l=True, acc_shoulder_r=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'reverse-fly')


# ═══════════════════════════════════════════════════════════════════════════
#  TRICEPS & BICEPS
# ═══════════════════════════════════════════════════════════════════════════

def gen_dip():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        body_y = lerp(0, 32, t)
        img, d = new_frame()
        ground(d)
        d.line([s(72), s(112), s(72), s(245)], fill=EQP, width=s(8))
        d.line([s(228), s(112), s(228), s(245)], fill=EQP, width=s(8))
        d.line([s(58), s(112), s(242), s(112)], fill=EQP_L, width=s(5))
        floor_shadow(d, 150, 272)
        p = base_standing(
            head_x=150, head_y=55+body_y,
            sh_x=150, sh_y=72+body_y, sh_w=28, hip_w=18, torso_h=68,
            hip_x=150, hip_y=140+body_y,
            elbow_lx=75, elbow_ly=115, hand_lx=72, hand_ly=112,
            elbow_rx=225, elbow_ry=115, hand_rx=228, hand_ry=112,
            knee_lx=138, knee_ly=200+body_y, foot_lx=130, foot_ly=252+body_y,
            knee_rx=162, knee_ry=202+body_y, foot_rx=170, foot_ry=254+body_y,
            acc_tricep_l=True, acc_tricep_r=False,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'dip')


def gen_bench_dip():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hip_y   = lerp(185, 238, t)
        elbow_y = lerp(152, 178, t)
        img, d = new_frame()
        ground(d)
        flat_bench(d, bx=18, by=148, bw=118, bh=12)
        floor_shadow(d, 190, 272)
        dumbbell(d, 0, 0)  # placeholder hidden
        p = dict(
            head_x=188, head_y=98,
            shoulder_x=162, shoulder_y=118, shoulder_w=24, hip_w=16, torso_h=50,
            hip_x=198, hip_y=hip_y,
            elbow_lx=105, elbow_ly=elbow_y,
            hand_lx=62,  hand_ly=152,
            elbow_rx=178, elbow_ry=elbow_y,
            hand_rx=132, hand_ry=152,
            knee_lx=228, knee_ly=242, foot_lx=258, foot_ly=262,
            knee_rx=228, knee_ry=244, foot_rx=260, foot_ry=264,
            acc_tricep_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'bench-dip')


def gen_tricep_extension():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y = lerp(168, 72, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        dumbbell(d, 150, hand_y, angle_deg=90)
        p = base_standing(
            elbow_lx=130, elbow_ly=88,
            hand_lx=140, hand_ly=hand_y,
            elbow_rx=170, elbow_ry=88,
            hand_rx=160, hand_ry=hand_y,
            acc_tricep_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'tricep-extension')


def gen_skull_crusher():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        bar_y = lerp(118, 162, t)
        img, d = new_frame()
        flat_bench(d, bx=38, by=200)
        ground(d)
        floor_shadow(d, 150, 272)
        barbell(d, 150, bar_y, bar_len=130)
        p = base_standing(
            head_x=238, head_y=148,
            sh_x=185, sh_y=172, sh_w=26, hip_w=18, torso_h=56,
            hip_x=152, hip_y=228,
            elbow_lx=142, elbow_ly=lerp(125, 145, t),
            hand_lx=122, hand_ly=bar_y,
            elbow_rx=172, elbow_ry=lerp(125, 145, t),
            hand_rx=178, hand_ry=bar_y,
            knee_lx=135, knee_ly=250, foot_lx=122, foot_ly=268,
            knee_rx=162, knee_ry=252, foot_rx=175, foot_ry=270,
            acc_tricep_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'skull-crusher')


def gen_tricep_pushdown():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y = lerp(135, 212, t)
        img, d = new_frame()
        ground(d)
        d.rectangle([s(132), s(18), s(168), s(28)], fill=EQP_D)
        cable_machine(d, 150, 28, 150, hand_y)
        d.line([s(112), s(hand_y), s(188), s(hand_y)], fill=EQP_L, width=s(5))
        floor_shadow(d, 150, 272)
        p = base_standing(
            elbow_lx=116, elbow_ly=128, hand_lx=122, hand_ly=hand_y,
            elbow_rx=184, elbow_ry=128, hand_rx=178, hand_ry=hand_y,
            acc_tricep_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'tricep-pushdown')


def gen_cable_kickback():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_x = lerp(172, 255, t)
        hand_y = lerp(162, 148, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        cable_machine(d, 28, 162, 116, 162)
        p = dict(
            head_x=218, head_y=108,
            shoulder_x=182, shoulder_y=128, shoulder_w=24, hip_w=17, torso_h=56,
            hip_x=140, hip_y=184,
            elbow_lx=114, elbow_ly=162, hand_lx=48, hand_ly=162,
            elbow_rx=172, elbow_ry=155, hand_rx=hand_x, hand_ry=hand_y,
            knee_lx=120, knee_ly=225, foot_lx=110, foot_ly=265,
            knee_rx=158, knee_ry=225, foot_rx=168, foot_ry=265,
            acc_tricep_r=False, acc_tricep_l=False,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'cable-kickback')


# ── Biceps ────────────────────────────────────────────────────────────────

def _bicep_curl_base(name, has_barbell=False, dumbbell_neutral=False):
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y  = lerp(218, 105, t)
        elbow_y = lerp(198, 130, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        if has_barbell:
            barbell(d, 150, hand_y, bar_len=130)
        else:
            angle = 90 if dumbbell_neutral else 0
            dumbbell(d, 105, hand_y, angle_deg=angle)
            dumbbell(d, 195, hand_y, angle_deg=angle)
        p = base_standing(
            elbow_lx=108, elbow_ly=elbow_y, hand_lx=105, hand_ly=hand_y,
            elbow_rx=192, elbow_ry=elbow_y, hand_rx=195, hand_ry=hand_y,
            acc_bicep_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), name)


def gen_bicep_curl():       _bicep_curl_base('bicep-curl')
def gen_hammer_curl():      _bicep_curl_base('hammer-curl', dumbbell_neutral=True)
def gen_barbell_curl():     _bicep_curl_base('barbell-curl', has_barbell=True)


def gen_concentration_curl():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y = lerp(248, 138, t)
        img, d = new_frame()
        flat_bench(d, bx=78, by=218, bw=144, bh=12)
        ground(d)
        floor_shadow(d, 150, 272)
        dumbbell(d, 124, hand_y)
        p = dict(
            head_x=202, head_y=118,
            shoulder_x=175, shoulder_y=138, shoulder_w=22, hip_w=16, torso_h=52,
            hip_x=155, hip_y=220,
            elbow_lx=128, elbow_ly=lerp(228,162,t), hand_lx=124, hand_ly=hand_y,
            elbow_rx=195, elbow_ry=185, hand_rx=198, hand_ry=212,
            knee_lx=118, knee_ly=255, foot_lx=92,  foot_ly=268,
            knee_rx=190, knee_ry=255, foot_rx=218, foot_ry=268,
            acc_bicep_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'concentration-curl')


def gen_cable_curl():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y = lerp(248, 118, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        cable_machine(d, 150, 278, 138, hand_y)
        p = base_standing(
            elbow_lx=116, elbow_ly=lerp(220,138,t), hand_lx=138, hand_ly=hand_y,
            elbow_rx=185, elbow_ry=155, hand_rx=188, hand_ry=185,
            acc_bicep_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'cable-curl')


def gen_preacher_curl():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y = lerp(222, 115, t)
        img, d = new_frame()
        # Preacher pad
        d.polygon([pt(78,152), pt(202,152), pt(222,222), pt(58,222)], fill=EQP)
        d.line([s(80), s(152), s(200), s(152)], fill=EQP_L, width=s(2))
        ground(d)
        floor_shadow(d, 175, 272)
        barbell(d, 148, hand_y, bar_len=110)
        p = dict(
            head_x=228, head_y=118,
            shoulder_x=195, shoulder_y=138, shoulder_w=22, hip_w=16, torso_h=52,
            hip_x=215, hip_y=200,
            elbow_lx=148, elbow_ly=lerp(195,148,t), hand_lx=130, hand_ly=hand_y,
            elbow_rx=162, elbow_ry=lerp(195,148,t), hand_rx=166, hand_ry=hand_y,
            knee_lx=205, knee_ly=245, foot_lx=198, foot_ly=268,
            knee_rx=240, knee_ry=245, foot_rx=252, foot_ry=268,
            acc_bicep_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'preacher-curl')


def _incline_curl_base(name, neutral=False):
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hand_y = lerp(220, 112, t)
        img, d = new_frame()
        incline_bench(d, ox=148, oy=168)
        ground(d)
        floor_shadow(d, 138, 272)
        angle = 90 if neutral else 0
        dumbbell(d, 90,  hand_y, angle_deg=angle)
        dumbbell(d, 210, hand_y, angle_deg=angle)
        p = base_standing(
            head_x=232, head_y=125,
            sh_x=195, sh_y=148, sh_w=26, hip_w=18, torso_h=60,
            hip_x=158, hip_y=210,
            elbow_lx=125, elbow_ly=lerp(200,142,t), hand_lx=90, hand_ly=hand_y,
            elbow_rx=215, elbow_ry=lerp(200,142,t), hand_rx=210, hand_ry=hand_y,
            knee_lx=138, knee_ly=242, foot_lx=122, foot_ly=268,
            knee_rx=162, knee_ry=244, foot_rx=178, foot_ry=270,
            acc_bicep_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), name)


def gen_incline_dumbbell_curl():  _incline_curl_base('incline-dumbbell-curl')
def gen_incline_hammer_curl():    _incline_curl_base('incline-hammer-curl', neutral=True)


# ═══════════════════════════════════════════════════════════════════════════
#  LEGS EXERCISES
# ═══════════════════════════════════════════════════════════════════════════

def _squat_base(name, has_barbell=False, n=FRAMES):
    frames = []
    for i in range(n):
        t = ease(i / (n-1))
        hip_y  = lerp(134, 198, t)
        knee_y = lerp(178, 248, t)
        knl_x  = lerp(132, 108, t)
        knr_x  = lerp(168, 192, t)
        bar_y  = lerp(100, 118, t) if has_barbell else 0
        # Upper body drops with hip — torso stays same height above hip
        sh_y   = hip_y - 72     # shoulder always 72px above hip
        head_y = sh_y  - 24     # head always 24px above shoulder
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        if has_barbell:
            barbell(d, 150, bar_y if bar_y else sh_y - 14, bar_len=168)
        p = base_standing(
            head_x=150, head_y=head_y,
            sh_x=150, sh_y=sh_y,
            hip_x=150, hip_y=hip_y,
            knee_lx=knl_x, knee_ly=knee_y, foot_lx=118, foot_ly=268,
            knee_rx=knr_x, knee_ry=knee_y, foot_rx=182, foot_ry=268,
            elbow_lx=lerp(105,85,t), elbow_ly=lerp(sh_y+48, sh_y+78, t),
            hand_lx=lerp(108,78,t),
            hand_ly=(lerp(sh_y-14+6, bar_y+6, t) if has_barbell else lerp(sh_y+86, sh_y+106, t)),
            elbow_rx=lerp(195,215,t), elbow_ry=lerp(sh_y+48, sh_y+78, t),
            hand_rx=lerp(192,222,t),
            hand_ry=(lerp(sh_y-14+6, bar_y+6, t) if has_barbell else lerp(sh_y+86, sh_y+106, t)),
            acc_quad_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), name)


def gen_squat():         _squat_base('squat')
def gen_barbell_squat(): _squat_base('barbell-squat', has_barbell=True)


def gen_lunge():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        fknee_y = lerp(205, 252, t)
        bknee_y = lerp(195, 255, t)
        hip_y   = lerp(188, 210, t)   # hip drops slightly on lunge
        sh_y    = hip_y - 72
        head_y  = sh_y  - 24
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        p = base_standing(
            head_x=150, head_y=head_y, sh_x=150, sh_y=sh_y,
            hip_x=150, hip_y=hip_y,
            knee_lx=lerp(112,105,t), knee_ly=fknee_y, foot_lx=100, foot_ly=268,
            knee_rx=200, knee_ry=bknee_y, foot_rx=222, foot_ry=268,
            elbow_lx=108, elbow_ly=sh_y+86, hand_lx=112, hand_ly=sh_y+116,
            elbow_rx=192, elbow_ry=sh_y+86, hand_rx=188, hand_ry=sh_y+116,
            acc_quad_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'lunge')


def gen_glute_bridge():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hip_y = lerp(218, 168, t)
        img, d = new_frame()
        ground(d, 275)
        floor_shadow(d, 168, 272, rx=55, ry=4)
        # Supine figure
        capsule_s(d, 108, 240, 108, 240, 10, FIG)  # shoulders on floor
        capsule_s(d, 108, 238, 168, hip_y, 11, FIG if t < 0.5 else ACC)  # torso
        capsule_s(d, 88, 238, 62, 248, 8, FIG_D)
        capsule_s(d, 112, 238, 138, 248, 8, FIG_L)
        # Legs
        capsule_s(d, 168, hip_y, 210, 248, 10, FIG)
        capsule_s(d, 210, 248, 230, 268, 9, FIG)
        capsule_s(d, 170, hip_y+3, 212, 250, 10, FIG_D)
        capsule_s(d, 212, 250, 232, 270, 9, FIG_D)
        head(d, 64, 235, r=10)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'glute-bridge')


def gen_jump_squat():
    n = FRAMES + 4
    frames = []
    for i in range(n):
        t = i / (n-1)
        if t < 0.3:
            phase = ease(t/0.3)
            hip_y = lerp(134, 195, phase); knee_y = lerp(178,248,phase); oy = 0
        elif t < 0.6:
            phase = math.sin((t-0.3)/0.3 * math.pi)
            hip_y = 165; knee_y = 210; oy = -phase*62
        else:
            phase = ease((t-0.6)/0.4)
            hip_y = lerp(195, 134, phase); knee_y = lerp(248,178,phase); oy = 0
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272, rx=30 if oy < -20 else 50, ry=4)
        p = base_standing(
            head_x=150, head_y=38+oy, sh_x=150, sh_y=62+oy,
            hip_x=150, hip_y=hip_y+oy,
            knee_lx=128, knee_ly=knee_y+oy, foot_lx=118, foot_ly=268+oy,
            knee_rx=172, knee_ry=knee_y+oy, foot_rx=182, foot_ry=268+oy,
            elbow_lx=92, elbow_ly=135+oy, hand_lx=85, hand_ly=162+oy,
            elbow_rx=208, elbow_ry=135+oy, hand_rx=215, hand_ry=162+oy,
            acc_quad_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(frames, 'jump-squat', duration=45)


def gen_single_leg_squat():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hip_y   = lerp(134, 235, t)
        knee_y  = lerp(178, 270, t)
        ext_y   = lerp(200, 238, t)
        ext_x   = lerp(105, 65,  t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 138, 272, rx=30, ry=4)
        p = base_standing(
            hip_x=150, hip_y=hip_y,
            knee_lx=132, knee_ly=knee_y, foot_lx=125, foot_ly=268,
            knee_rx=ext_x+22, knee_ry=ext_y, foot_rx=ext_x, foot_ry=ext_y+26,
            elbow_lx=92,  elbow_ly=lerp(108,92,t),
            hand_lx=80,   hand_ly=lerp(148,108,t),
            elbow_rx=208, elbow_ry=lerp(108,92,t),
            hand_rx=220,  hand_ry=lerp(148,108,t),
            acc_quad_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'single-leg-squat')


def gen_calf_raise():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        rise = lerp(0, -22, t)
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272)
        p = base_standing(
            head_x=150, head_y=38+rise,
            sh_x=150, sh_y=62+rise, hip_x=150, hip_y=134+rise,
            knee_lx=132, knee_ly=178+rise, foot_lx=122, foot_ly=268,
            knee_rx=168, knee_ry=178+rise, foot_rx=178, foot_ry=268,
            elbow_lx=108, elbow_ly=155+rise, hand_lx=108, hand_ly=185+rise,
            elbow_rx=192, elbow_ry=155+rise, hand_rx=192, hand_ry=185+rise,
            acc_calf_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'calf-raise')


def gen_bulgarian_split_squat():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hip_y   = lerp(185, 242, t)
        fknee_y = lerp(228, 270, t)
        sh_y    = hip_y - 72
        head_y  = sh_y  - 24
        img, d = new_frame()
        ground(d)
        flat_bench(d, bx=162, by=185, bw=122, bh=12)
        floor_shadow(d, 130, 272)
        p = base_standing(
            head_x=148, head_y=head_y, sh_x=148, sh_y=sh_y,
            hip_x=148, hip_y=hip_y,
            knee_lx=108, knee_ly=fknee_y, foot_lx=98, foot_ly=268,
            knee_rx=198, knee_ry=218, foot_rx=225, foot_ry=188,
            elbow_lx=105, elbow_ly=sh_y+86, hand_lx=108, hand_ly=sh_y+113,
            elbow_rx=188, elbow_ry=sh_y+86, hand_rx=185, hand_ry=sh_y+113,
            acc_quad_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'bulgarian-split-squat')


def gen_leg_press():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        foot_y = lerp(112, 172, t)
        knee_y = lerp(158, 210, t)
        img, d = new_frame()
        # Machine frame
        d.line([s(52), s(38), s(272), s(272)], fill=EQP_D, width=s(4))
        d.rectangle([s(48), s(255), s(272), s(278)], fill=EQP_D)
        d.rectangle([s(45), s(foot_y-8), s(90), s(foot_y+8)], fill=EQP)
        ground(d)
        floor_shadow(d, 185, 272)
        p = dict(
            head_x=240, head_y=148,
            shoulder_x=215, shoulder_y=168, shoulder_w=24, hip_w=17, torso_h=55,
            hip_x=188, hip_y=262,
            elbow_lx=182, elbow_ly=222, hand_lx=175, hand_ly=250,
            elbow_rx=200, elbow_ry=222, hand_rx=208, hand_ry=250,
            knee_lx=120, knee_ly=knee_y, foot_lx=68, foot_ly=foot_y,
            knee_rx=124, knee_ry=knee_y+5, foot_rx=70, foot_ry=foot_y+5,
            acc_quad_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'leg-press')


def gen_leg_extension():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        foot_y = lerp(270, 185, t)
        foot_x = lerp(148, 198, t)
        img, d = new_frame()
        machine_seat(d)
        d.ellipse([s(foot_x-10), s(foot_y-8), s(foot_x+10), s(foot_y+8)], fill=ACC)
        ground(d)
        floor_shadow(d, 150, 272)
        p = base_standing(
            head_x=150, head_y=95,
            sh_x=150, sh_y=115, sh_w=24, hip_w=17, torso_h=52,
            hip_x=150, hip_y=167,
            knee_lx=126, knee_ly=250, foot_lx=foot_x-12, foot_ly=foot_y,
            knee_rx=174, knee_ry=250, foot_rx=foot_x+12, foot_ry=foot_y,
            elbow_lx=92,  elbow_ly=175, hand_lx=80, hand_ly=205,
            elbow_rx=208, elbow_ry=175, hand_rx=220, hand_ry=205,
            acc_quad_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'leg-extension')


def gen_leg_curl():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        foot_y = lerp(112, 68, t)
        foot_x = lerp(232, 208, t)
        img, d = new_frame()
        d.rectangle([s(28), s(188), s(275), s(210)], fill=EQP_D)
        d.ellipse([s(foot_x-10), s(foot_y-8), s(foot_x+10), s(foot_y+8)], fill=ACC)
        ground(d, 215)
        floor_shadow(d, 148, 210, rx=55, ry=4)
        # Prone figure
        capsule_s(d, 55, 200, 195, 202, 11, FIG)
        capsule_s(d, 195, 202, foot_x-8, foot_y, 9, FIG)
        capsule_s(d, 197, 204, foot_x+8, foot_y, 9, FIG_D)
        capsule_s(d, 55, 200, 22, 195, 7, FIG_D)
        capsule_s(d, 58, 202, 24, 200, 6, FIG_L)
        head(d, 44, 192, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'leg-curl')


def gen_hack_squat():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hip_y  = lerp(195, 248, t)
        knee_y = lerp(242, 270, t)
        sh_y   = hip_y - 72
        head_y = sh_y  - 24
        img, d = new_frame()
        ground(d)
        d.line([s(82), s(38), s(222), s(278)], fill=EQP_D, width=s(5))
        d.rectangle([s(100), s(sh_y-10), s(200), s(sh_y+4)], fill=EQP)  # shoulder pads move with body
        floor_shadow(d, 150, 272)
        p = base_standing(
            head_x=150, head_y=head_y, sh_x=150, sh_y=sh_y,
            hip_x=150, hip_y=hip_y,
            knee_lx=128, knee_ly=knee_y, foot_lx=115, foot_ly=268,
            knee_rx=172, knee_ry=knee_y, foot_rx=185, foot_ry=268,
            elbow_lx=lerp(95,88,t), elbow_ly=lerp(sh_y+48,sh_y+68,t),
            hand_lx=lerp(88,78,t), hand_ly=lerp(sh_y+72,sh_y+82,t),
            elbow_rx=lerp(205,212,t), elbow_ry=lerp(sh_y+48,sh_y+68,t),
            hand_rx=lerp(212,222,t), hand_ry=lerp(sh_y+72,sh_y+82,t),
            acc_quad_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'hack-squat')


def gen_barbell_hip_thrust():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        hip_y = lerp(225, 170, t)
        img, d = new_frame()
        ground(d)
        flat_bench(d, bx=28, by=185, bw=125, bh=14)
        floor_shadow(d, 178, 272)
        barbell(d, 178, hip_y, bar_len=152)
        capsule_s(d, 88, 196, 88, 196, 9, FIG)
        capsule_s(d, 88, 196, 178, hip_y, 11, ACC if t > 0.4 else FIG)
        capsule_s(d, 178, hip_y, 218, 250, 10, FIG)
        capsule_s(d, 218, 250, 235, 268, 9, FIG)
        capsule_s(d, 180, hip_y+4, 220, 252, 10, FIG_D)
        capsule_s(d, 220, 252, 237, 270, 9, FIG_D)
        capsule_s(d, 85, 196, 58, 205, 8, FIG_D)
        capsule_s(d, 90, 196, 118, 205, 8, FIG_L)
        head(d, 80, 180, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'barbell-hip-thrust')


def gen_step_up():
    frames = []
    for i in range(FRAMES):
        t = ease(i / (FRAMES-1))
        body_y = lerp(0, -65, t)
        img, d = new_frame()
        ground(d)
        box_platform(d, bx=78, by=200, bw=144, bh=72)
        floor_shadow(d, 150, 272)
        p = base_standing(
            head_x=150, head_y=38+body_y, sh_x=150, sh_y=62+body_y,
            hip_x=150, hip_y=134+body_y,
            knee_lx=130, knee_ly=178+body_y, foot_lx=118, foot_ly=lerp(268,200,t),
            knee_rx=170, knee_ry=178+body_y, foot_rx=182, foot_ry=lerp(268,200,t),
            elbow_lx=105, elbow_ly=lerp(148,130,t)+body_y,
            hand_lx=108, hand_ly=lerp(178,155,t)+body_y,
            elbow_rx=195, elbow_ry=lerp(148,130,t)+body_y,
            hand_rx=192, hand_ry=lerp(178,155,t)+body_y,
            acc_quad_l=True,
        )
        draw_body(d, p)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'step-up')


def gen_box_jump():
    n = FRAMES + 4
    frames = []
    for i in range(n):
        t = i / (n-1)
        if t < 0.25:
            p = ease(t/0.25); hip_y=lerp(134,195,p); knee_y=lerp(178,248,p); oy=0; on_box=False
        elif t < 0.55:
            arc = math.sin((t-0.25)/0.30 * math.pi)
            hip_y=198; knee_y=240; oy=-arc*82; on_box=False
        else:
            p = ease((t-0.55)/0.45); hip_y=lerp(195,134,p); knee_y=lerp(248,178,p)
            oy=-72; on_box=True
        img, d = new_frame()
        ground(d)
        box_platform(d, bx=78, by=200, bw=144, bh=72)
        floor_shadow(d, 150, 272 if not on_box else 200, rx=28 if oy<-40 else 45, ry=4)
        fty = (200+oy) if on_box else (268+oy)
        pose = base_standing(
            head_x=150, head_y=38+oy, sh_x=150, sh_y=62+oy,
            hip_x=150, hip_y=hip_y+oy,
            knee_lx=128, knee_ly=knee_y+oy, foot_lx=118, foot_ly=fty,
            knee_rx=172, knee_ry=knee_y+oy, foot_rx=182, foot_ry=fty,
            elbow_lx=92, elbow_ly=130+oy, hand_lx=82, hand_ly=155+oy,
            elbow_rx=208, elbow_ry=130+oy, hand_rx=218, hand_ry=155+oy,
            acc_quad_l=True,
        )
        draw_body(d, pose)
        frames.append(downscale(img))
    save_gif(frames, 'box-jump', duration=45)


# ═══════════════════════════════════════════════════════════════════════════
#  CORE + CARDIO
# ═══════════════════════════════════════════════════════════════════════════

def gen_plank():
    frames = []
    for i in range(FRAMES):
        t = math.sin(i/(FRAMES-1) * math.pi)
        breathe = lerp(0, -3, t)
        img, d = new_frame()
        ground(d, 238)
        floor_shadow(d, 150, 236, rx=58, ry=4)
        capsule_s(d, 68, 198+breathe, 245, 204, 11, FIG)
        capsule_s(d, 245, 204, 268, 225, 9, FIG_D)
        capsule_s(d, 92, 198+breathe, 78, 212, 7, ACC)
        capsule_s(d, 78, 212, 62, 228, 6, ACC)
        capsule_s(d, 118, 200+breathe, 105, 214, 7, FIG_L)
        capsule_s(d, 105, 214, 90, 230, 6, FIG_L)
        d.line([s(68), s(198+breathe), s(265), s(225)], fill=ACC, width=s(1))
        head(d, 54, 186+breathe, r=11)
        frames.append(downscale(img))
    save_gif(frames + list(reversed(frames[1:-1])), 'plank', duration=100)


def gen_hollow_body():
    frames = []
    for i in range(FRAMES):
        t = math.sin(i/(FRAMES-1)*math.pi)
        shake = lerp(0, 4, t)
        img, d = new_frame()
        ground(d, 275)
        floor_shadow(d, 165, 272, rx=58, ry=4)
        capsule_s(d, 128, 228, 178, 228, 11, FIG)
        capsule_s(d, 108, 228+shake, 92, 210+shake, 8, FIG_L)
        capsule_s(d, 92, 210+shake, 72, 192+shake, 7, FIG_L)
        capsule_s(d, 178, 228, 218, 218+shake, 10, ACC)
        capsule_s(d, 218, 218+shake, 255, 205+shake, 9, ACC)
        head(d, 82, 228, r=11)
        frames.append(downscale(img))
    save_gif(frames + list(reversed(frames[1:-1])), 'hollow-body', duration=100)


def gen_crunch():
    frames = []
    for i in range(FRAMES):
        t = ease(i/(FRAMES-1))
        head_y  = lerp(238, 210, t)
        sh_y    = lerp(248, 228, t)
        img, d = new_frame()
        ground(d, 275)
        floor_shadow(d, 165, 272, rx=52, ry=4)
        capsule_s(d, 128, 258, 175, 262, 11, FIG)
        capsule_s(d, 175, 262, 215, 250, 10, FIG)
        capsule_s(d, 215, 250, 235, 268, 9, FIG)
        capsule_s(d, 108, sh_y, 128, 258, 11, ACC if t > 0.3 else FIG)
        capsule_s(d, 80, head_y-8, 108, sh_y, 8, FIG_L)
        capsule_s(d, 128, head_y-8, 108, sh_y, 8, FIG_D)
        head(d, 88, head_y, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'crunch')


def gen_mountain_climber():
    frames = []
    for i in range(FRAMES*2):
        left = (i % 2 == 0)
        img, d = new_frame()
        ground(d, 238)
        floor_shadow(d, 150, 236, rx=52, ry=4)
        capsule_s(d, 68, 195, 245, 202, 11, FIG)
        capsule_s(d, 245, 202, 268, 222, 9, FIG_D)
        capsule_s(d, 92, 197, 78, 212, 7, FIG_L)
        capsule_s(d, 78, 212, 62, 228, 6, FIG_L)
        capsule_s(d, 118, 199, 105, 214, 7, FIG_D)
        capsule_s(d, 105, 214, 90, 230, 6, FIG_D)
        if left:
            capsule_s(d, 198, 202, 155, 192, 10, ACC)
            capsule_s(d, 155, 192, 145, 215, 9, ACC)
            capsule_s(d, 220, 204, 240, 222, 10, FIG)
            capsule_s(d, 240, 222, 258, 232, 9, FIG)
        else:
            capsule_s(d, 198, 202, 218, 222, 10, FIG)
            capsule_s(d, 218, 222, 235, 232, 9, FIG)
            capsule_s(d, 222, 204, 175, 192, 10, ACC)
            capsule_s(d, 175, 192, 162, 215, 9, ACC)
        head(d, 54, 182, r=11)
        frames.append(downscale(img))
    save_gif(frames, 'mountain-climber', duration=55)


def gen_leg_raise():
    frames = []
    for i in range(FRAMES):
        t = ease(i/(FRAMES-1))
        foot_y = lerp(268, 158, t)
        knee_y = lerp(265, 172, t)
        img, d = new_frame()
        ground(d, 275)
        floor_shadow(d, 165, 272, rx=52, ry=4)
        capsule_s(d, 110, 258, 168, 262, 11, FIG)
        capsule_s(d, 90, 258, 68, 268, 8, FIG_D)
        capsule_s(d, 112, 260, 138, 268, 8, FIG_L)
        capsule_s(d, 168, 262, 205, knee_y, 10, ACC)
        capsule_s(d, 205, knee_y, 232, foot_y, 9, ACC)
        capsule_s(d, 170, 264, 207, knee_y+3, 10, FIG_D)
        capsule_s(d, 207, knee_y+3, 234, foot_y+3, 9, FIG_D)
        head(d, 72, 245, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'leg-raise')


def gen_russian_twist():
    frames = []
    n = FRAMES * 2
    for i in range(n):
        t = i/(n-1)
        twist = math.sin(t * 2 * math.pi) * 42
        hx = int(150 + twist)
        img, d = new_frame()
        ground(d, 275)
        floor_shadow(d, 150, 272, rx=45, ry=4)
        capsule_s(d, 122, 250, 178, 252, 11, FIG)
        capsule_s(d, 105, 250, 84, 268, 9, FIG)
        capsule_s(d, 178, 250, 200, 268, 9, FIG_D)
        capsule_s(d, 150, 225, 122, 250, 11, ACC if abs(twist)>15 else FIG)
        capsule_s(d, hx-15, 218, hx, 212, 7, FIG_L)
        capsule_s(d, hx+15, 218, hx, 215, 7, FIG_D)
        capsule_s(d, hx, 212, hx, 215, 7, ACC)
        head(d, 150, 210, r=11)
        frames.append(downscale(img))
    save_gif(frames, 'russian-twist', duration=55)


def gen_burpee():
    n = FRAMES + 4
    frames = []
    phases = [
        # stand, squat, plank, jump
        dict(hx=150, hy=38, sx=150, sy=62, ipx=150, ipy=134,
             klx=132, kly=178, flx=122, fly=268,
             krx=168, kry=178, frx=178, fry=268,
             elx=105, ely=148, hlx=108, hly=178,
             erx=195, ery=148, hrx=192, hry=178),
        dict(hx=150, hy=105, sx=150, sy=120, ipx=150, ipy=225,
             klx=110, kly=258, flx=98, fly=268,
             krx=190, kry=258, frx=202, fry=268,
             elx=88, ely=158, hlx=70, hly=188,
             erx=212, ery=158, hrx=230, hry=188),
        dict(hx=52, hy=182, sx=110, sy=192, ipx=195, ipy=200,
             klx=232, kly=210, flx=268, fly=228,
             krx=234, kry=212, frx=270, fry=230,
             elx=88, ely=210, hlx=62, hly=228,
             erx=130, ery=210, hrx=152, hry=228),
        dict(hx=150, hy=18, sx=150, sy=38, ipx=150, ipy=110,
             klx=135, kly=152, flx=125, fly=198,
             krx=165, kry=152, frx=175, fry=198,
             elx=105, ely=32, hlx=112, hly=18,
             erx=195, ery=32, hrx=188, hry=18),
    ]
    frames_pp = n // len(phases)
    for pi, ph in enumerate(phases):
        nph = phases[(pi+1) % len(phases)]
        for fi in range(frames_pp):
            tt = ease(fi/frames_pp)
            def lv(k): return lerp(ph[k], nph[k], tt)
            img, d = new_frame()
            ground(d)
            floor_shadow(d, 150, 272)
            pose = base_standing(
                head_x=lv('hx'), head_y=lv('hy'),
                sh_x=lv('sx'), sh_y=lv('sy'), sh_w=28, hip_w=20, torso_h=72,
                hip_x=lv('ipx'), hip_y=lv('ipy'),
                knee_lx=lv('klx'), knee_ly=lv('kly'), foot_lx=lv('flx'), foot_ly=lv('fly'),
                knee_rx=lv('krx'), knee_ry=lv('kry'), foot_rx=lv('frx'), foot_ry=lv('fry'),
                elbow_lx=lv('elx'), elbow_ly=lv('ely'), hand_lx=lv('hlx'), hand_ly=lv('hly'),
                elbow_rx=lv('erx'), elbow_ry=lv('ery'), hand_rx=lv('hrx'), hand_ry=lv('hry'),
            )
            draw_body(d, pose)
            frames.append(downscale(img))
    save_gif(frames, 'burpee', duration=48)


# ═══════════════════════════════════════════════════════════════════════════
#  IFBB BODYBUILDING POSES  (static + flex pulse)
# ═══════════════════════════════════════════════════════════════════════════

def _pose_pulse(t):
    """Subtle muscle flex brightness oscillation 0→peak→0."""
    return math.sin(t * math.pi)

def _make_pose(name, draw_fn, n=FRAMES, dur=80):
    frames = []
    for i in range(n):
        t = i / (n-1)
        pulse = _pose_pulse(t)
        fc = tuple(min(255, int(c + pulse*45)) for c in FIG)
        ac = ACC
        img, d = new_frame()
        ground(d)
        floor_shadow(d, 150, 272, rx=38, ry=4)
        draw_fn(d, fc, ac)
        frames.append(downscale(img))
    save_gif(frames + list(reversed(frames[1:-1])), name, duration=dur)


def gen_pose_front_double_biceps():
    def draw(d, fc, ac):
        torso(d, 150, 108, 36, 22, 72, color=fc, accent_back=False)
        d.polygon([pt(114,108),pt(75,155),pt(114,175)],  fill=fc)
        d.polygon([pt(186,108),pt(225,155),pt(186,175)], fill=fc)
        capsule_s(d, 114,118, 72,118, 8, fc)
        capsule_s(d, 72,118,  72,70,  7, ac)
        capsule_s(d, 186,118, 228,118, 8, fc)
        capsule_s(d, 228,118, 228,70,  7, ac)
        d.ellipse([s(65),s(62),s(79),s(76)],  fill=ac)
        d.ellipse([s(221),s(62),s(235),s(76)], fill=ac)
        capsule_s(d, 150,180, 138,248, 10, fc)
        capsule_s(d, 138,248, 130,270, 9, fc)
        capsule_s(d, 150,180, 162,248, 10, fc)
        capsule_s(d, 162,248, 170,270, 9, fc)
        head(d, 150, 90, r=13, color=SKN)
    _make_pose('pose-front-double-biceps', draw)


def gen_pose_front_lat_spread():
    def draw(d, fc, ac):
        torso(d, 150, 105, 40, 22, 72, color=fc, accent_back=False)
        d.polygon([pt(110,108),pt(75,155),pt(110,178)],  fill=fc)
        d.polygon([pt(190,108),pt(225,155),pt(190,178)], fill=fc)
        capsule_s(d, 112,130, 82,155, 8, fc)
        capsule_s(d, 82,155,  90,178, 7, fc)
        capsule_s(d, 188,130, 218,155, 8, fc)
        capsule_s(d, 218,155, 210,178, 7, fc)
        d.ellipse([s(83),s(172),s(99),s(184)],  fill=ac)
        d.ellipse([s(201),s(172),s(217),s(184)], fill=ac)
        d.line([s(92),s(178),s(110),s(108)],  fill=ac, width=s(2))
        d.line([s(208),s(178),s(190),s(108)], fill=ac, width=s(2))
        capsule_s(d, 150,178, 138,248, 10, fc)
        capsule_s(d, 138,248, 130,270, 9, fc)
        capsule_s(d, 150,178, 162,248, 10, fc)
        capsule_s(d, 162,248, 170,270, 9, fc)
        head(d, 150, 88, r=13, color=SKN)
    _make_pose('pose-front-lat-spread', draw)


def gen_pose_side_chest():
    def draw(d, fc, ac):
        torso(d, 138, 80, 28, 18, 72, color=fc)
        d.line([s(140),s(92),s(165),s(118)], fill=ac, width=s(3))
        capsule_s(d, 138,112, 108,132, 8, fc)
        capsule_s(d, 108,132, 128,158, 7, ac)
        capsule_s(d, 140,118, 152,142, 7, fc)
        capsule_s(d, 152,142, 130,158, 6, fc)
        capsule_s(d, 140,152, 168,148, 7, fc)
        capsule_s(d, 168,148, 175,168, 6, fc)
        capsule_s(d, 138,152, 130,225, 11, fc)
        capsule_s(d, 130,225, 125,268, 9, fc)
        capsule_s(d, 142,152, 152,225, 9, fc)
        capsule_s(d, 152,225, 158,268, 8, fc)
        head(d, 128, 62, r=13, color=SKN)
    _make_pose('pose-side-chest', draw)


def gen_pose_back_double_biceps():
    def draw(d, fc, ac):
        torso(d, 150, 108, 36, 22, 72, color=fc, accent_back=True)
        d.line([s(150),s(108),s(150),s(178)], fill=(80,80,80), width=s(2))
        capsule_s(d, 118,118, 72,118,  8, fc)
        capsule_s(d, 72,118,  72,70,   7, ac)
        capsule_s(d, 182,118, 228,118, 8, fc)
        capsule_s(d, 228,118, 228,70,  7, ac)
        d.ellipse([s(65),s(62),s(79),s(76)],  fill=ac)
        d.ellipse([s(221),s(62),s(235),s(76)], fill=ac)
        capsule_s(d, 150,180, 135,240, 10, fc)
        capsule_s(d, 135,240, 118,268, 9, fc)
        capsule_s(d, 150,180, 165,238, 10, fc)
        capsule_s(d, 165,238, 182,258, 8, ac)
        d.ellipse([s(182),s(252),s(194),s(264)], fill=ac)
        head(d, 150, 90, r=13, color=SKN)
    _make_pose('pose-back-double-biceps', draw)


def gen_pose_back_lat_spread():
    def draw(d, fc, ac):
        torso(d, 150, 105, 42, 22, 72, color=fc, accent_back=True)
        capsule_s(d, 110,130, 82,155, 8, fc)
        capsule_s(d, 82,155,  90,178, 7, fc)
        capsule_s(d, 190,130, 218,155, 8, fc)
        capsule_s(d, 218,155, 210,178, 7, fc)
        d.ellipse([s(83),s(172),s(99),s(184)],  fill=ac)
        d.ellipse([s(201),s(172),s(217),s(184)], fill=ac)
        d.line([s(92),s(178),s(108),s(108)],  fill=ac, width=s(2))
        d.line([s(208),s(178),s(192),s(108)], fill=ac, width=s(2))
        capsule_s(d, 150,178, 135,242, 10, fc)
        capsule_s(d, 135,242, 118,268, 9, fc)
        capsule_s(d, 150,178, 165,242, 10, fc)
        capsule_s(d, 165,242, 182,268, 9, fc)
        head(d, 150, 88, r=13, color=SKN)
    _make_pose('pose-back-lat-spread', draw)


def gen_pose_side_triceps():
    def draw(d, fc, ac):
        torso(d, 140, 82, 26, 17, 72, color=fc)
        capsule_s(d, 140,112, 168,135, 8, fc)
        capsule_s(d, 168,135, 185,175, 7, ac)
        d.arc([s(155),s(128),s(180),s(162)], start=0, end=200, fill=ac, width=s(3))
        capsule_s(d, 140,118, 155,142, 7, fc)
        capsule_s(d, 155,142, 172,168, 6, fc)
        for yy in [128,140,152]:
            d.line([s(122),s(yy),s(138),s(yy-2)], fill=(70,70,70), width=s(1))
        capsule_s(d, 138,154, 130,228, 11, fc)
        capsule_s(d, 130,228, 125,268, 9, fc)
        capsule_s(d, 145,154, 152,228, 9, fc)
        capsule_s(d, 152,228, 158,268, 8, fc)
        head(d, 128, 64, r=13, color=SKN)
    _make_pose('pose-side-triceps', draw)


def gen_pose_abs_thighs():
    def draw(d, fc, ac):
        torso(d, 150, 108, 30, 20, 72, color=fc)
        for yy in [118,130,142,155,167]:
            d.line([s(136),s(yy),s(148),s(yy+2)], fill=ac, width=s(2))
            d.line([s(152),s(yy+2),s(164),s(yy)], fill=ac, width=s(2))
        capsule_s(d, 118,108, 85,95, 7, fc)
        capsule_s(d, 85,95,  76,75, 6, fc)
        capsule_s(d, 182,108, 215,95, 7, fc)
        capsule_s(d, 215,95, 224,75, 6, fc)
        d.ellipse([s(70),s(67),s(82),s(79)],  fill=SKN)
        d.ellipse([s(218),s(67),s(230),s(79)], fill=SKN)
        capsule_s(d, 150,180, 118,245, 11, ac)
        capsule_s(d, 118,245, 112,268, 9, fc)
        capsule_s(d, 150,180, 172,245, 10, fc)
        capsule_s(d, 172,245, 178,268, 9, fc)
        head(d, 150, 90, r=13, color=SKN)
    _make_pose('pose-abs-thighs', draw)


def gen_pose_most_muscular():
    def draw(d, fc, ac):
        d.polygon([pt(128,80),pt(172,80),pt(185,108),pt(115,108)], fill=ac)
        torso(d, 150, 108, 36, 24, 72, color=fc)
        d.line([s(118),s(108),s(150),s(130)], fill=ac, width=s(2))
        d.line([s(182),s(108),s(150),s(130)], fill=ac, width=s(2))
        capsule_s(d, 118,118, 80,145,  9, fc)
        capsule_s(d, 80,145,  128,172, 8, ac)
        capsule_s(d, 182,118, 220,145, 9, fc)
        capsule_s(d, 220,145, 172,172, 8, ac)
        d.ellipse([s(120),s(165),s(138),s(180)], fill=ac)
        d.ellipse([s(162),s(165),s(180),s(180)], fill=ac)
        capsule_s(d, 150,180, 135,242, 11, fc)
        capsule_s(d, 135,242, 118,268, 9, fc)
        capsule_s(d, 150,180, 165,242, 11, fc)
        capsule_s(d, 165,242, 182,268, 9, fc)
        head(d, 150, 62, r=13, color=SKN)
    _make_pose('pose-most-muscular', draw)


def gen_pose_mp_front():
    def draw(d, fc, ac):
        torso(d, 150, 108, 28, 18, 72, color=fc)
        capsule_s(d, 118,112, 108,158, 7, fc)
        capsule_s(d, 108,158, 108,198, 6, fc)
        capsule_s(d, 182,112, 205,148, 7, fc)
        capsule_s(d, 205,148, 197,178, 6, fc)
        d.ellipse([s(190),s(172),s(204),s(182)], fill=SKN)
        d.line([s(118),s(112),s(135),s(180)], fill=ac, width=s(1))
        d.line([s(182),s(112),s(165),s(180)], fill=ac, width=s(1))
        capsule_s(d, 150,180, 138,238, 10, fc)
        capsule_s(d, 138,238, 128,268, 9, fc)
        capsule_s(d, 150,180, 162,238, 10, fc)
        capsule_s(d, 162,238, 172,268, 9, fc)
        head(d, 150, 90, r=13, color=SKN)
    _make_pose('pose-mp-front', draw, dur=110)


def gen_pose_mp_back():
    def draw(d, fc, ac):
        torso(d, 150, 108, 28, 18, 72, color=fc)
        d.line([s(150),s(108),s(150),s(178)], fill=(70,70,70), width=s(2))
        capsule_s(d, 118,112, 108,158, 7, fc)
        capsule_s(d, 108,158, 110,198, 6, fc)
        capsule_s(d, 182,112, 205,148, 7, fc)
        capsule_s(d, 205,148, 200,178, 6, fc)
        d.ellipse([s(193),s(172),s(207),s(182)], fill=SKN)
        capsule_s(d, 152,180, 148,192, 10, fc)
        capsule_s(d, 152,192, 158,198, 10, fc)
        capsule_s(d, 150,180, 138,238, 10, fc)
        capsule_s(d, 138,238, 128,268, 9, fc)
        capsule_s(d, 150,180, 162,238, 10, fc)
        capsule_s(d, 162,238, 172,268, 9, fc)
        head(d, 150, 90, r=13, color=SKN)
    _make_pose('pose-mp-back', draw, dur=110)


def gen_pose_mp_side():
    def draw(d, fc, ac):
        torso(d, 140, 84, 24, 16, 72, color=fc)
        capsule_s(d, 140,112, 118,155, 7, fc)
        capsule_s(d, 118,155, 115,195, 6, fc)
        capsule_s(d, 142,118, 163,148, 7, fc)
        capsule_s(d, 163,148, 158,178, 6, fc)
        d.ellipse([s(151),s(172),s(165),s(182)], fill=SKN)
        capsule_s(d, 140,156, 130,228, 11, fc)
        capsule_s(d, 130,228, 125,268, 9, fc)
        capsule_s(d, 148,156, 155,228, 9, fc)
        capsule_s(d, 155,228, 160,268, 8, fc)
        head(d, 128, 66, r=13, color=SKN)
    _make_pose('pose-mp-side', draw, dur=110)


# ── shoulder-tap (core) ────────────────────────────────────────────────────
def gen_shoulder_tap():
    frames = []
    for i in range(FRAMES*2):
        left = (i % 2 == 0)
        img, d = new_frame()
        ground(d, 232)
        floor_shadow(d, 150, 230, rx=52, ry=4)
        capsule_s(d, 68, 196, 245, 202, 11, FIG)
        capsule_s(d, 245, 202, 268, 222, 9, FIG_D)
        if left:
            capsule_s(d, 95, 197, 80, 212, 7, FIG_L)
            capsule_s(d, 80, 212, 62, 228, 6, FIG_L)
            capsule_s(d, 120, 199, 148, 195, 7, ACC)
            capsule_s(d, 148, 195, 120, 197, 6, ACC)
        else:
            capsule_s(d, 95, 197, 80, 212, 7, ACC)
            capsule_s(d, 80, 212, 105, 196, 6, ACC)
            capsule_s(d, 120, 199, 105, 214, 7, FIG_L)
            capsule_s(d, 105, 214, 90, 230, 6, FIG_L)
        head(d, 54, 182, r=11)
        frames.append(downscale(img))
    save_gif(frames, 'shoulder-tap', duration=65)

# ═══════════════════════════════════════════════════════════════════════════
#  BODYWEIGHT ROW
# ═══════════════════════════════════════════════════════════════════════════
def gen_bodyweight_row():
    frames = []
    for i in range(FRAMES):
        t = ease(i/(FRAMES-1))
        chest_y = lerp(148, 112, t)
        elbow_y = lerp(138, 108, t)
        img, d = new_frame()
        pull_bar(d, y=112, x1=48, x2=252)
        ground(d)
        floor_shadow(d, 165, 272)
        capsule_s(d, 68, chest_y-22, 68, chest_y-22, 11, FIG)
        capsule_s(d, 68, chest_y-22, 220, chest_y+42, 11, FIG)
        capsule_s(d, 220, chest_y+42, 258, 268, 10, FIG_D)
        capsule_s(d, 95, chest_y-12, 78, elbow_y, 7, ACC)
        capsule_s(d, 78, elbow_y, 68, 114, 6, ACC)
        capsule_s(d, 125, chest_y-8, 148, elbow_y-5, 7, FIG_L)
        capsule_s(d, 148, elbow_y-5, 155, 114, 6, FIG_L)
        head(d, 52, chest_y-35, r=11)
        frames.append(downscale(img))
    save_gif(ping_pong(frames), 'bodyweight-row')

# ═══════════════════════════════════════════════════════════════════════════
#  MAIN RUNNER
# ═══════════════════════════════════════════════════════════════════════════

ALL_V2 = [
    # Chest
    gen_pushup, gen_incline_pushup, gen_decline_pushup, gen_diamond_pushup,
    gen_wide_pushup, gen_pike_pushup, gen_incline_dumbbell_press,
    gen_dumbbell_fly, gen_cable_fly, gen_barbell_bench_press,
    # Back
    gen_dead_hang, gen_pullup, gen_chinup, gen_bodyweight_row, gen_superman,
    gen_barbell_row, gen_dumbbell_row, gen_barbell_deadlift,
    gen_romanian_deadlift, gen_lat_pulldown, gen_seated_cable_row,
    gen_t_bar_row, gen_good_morning, gen_barbell_shrug,
    # Shoulders
    gen_lateral_raise, gen_front_raise, gen_shoulder_tap, gen_overhead_press,
    gen_arnold_press, gen_face_pull, gen_cable_lateral_raise,
    gen_dumbbell_shoulder_press, gen_upright_row, gen_reverse_fly,
    # Triceps
    gen_dip, gen_bench_dip, gen_tricep_extension, gen_skull_crusher,
    gen_tricep_pushdown, gen_cable_kickback,
    # Biceps
    gen_bicep_curl, gen_hammer_curl, gen_concentration_curl,
    gen_barbell_curl, gen_cable_curl, gen_preacher_curl,
    gen_incline_dumbbell_curl, gen_incline_hammer_curl,
    # Legs
    gen_squat, gen_barbell_squat, gen_lunge, gen_glute_bridge,
    gen_jump_squat, gen_single_leg_squat, gen_calf_raise,
    gen_bulgarian_split_squat, gen_leg_press, gen_leg_extension,
    gen_leg_curl, gen_hack_squat, gen_barbell_hip_thrust,
    gen_step_up, gen_box_jump,
    # Core
    gen_plank, gen_hollow_body, gen_crunch, gen_mountain_climber,
    gen_leg_raise, gen_russian_twist,
    # Cardio
    gen_burpee,
    # Poses – Classic
    gen_pose_front_double_biceps, gen_pose_front_lat_spread,
    gen_pose_side_chest, gen_pose_back_double_biceps,
    gen_pose_back_lat_spread, gen_pose_side_triceps,
    gen_pose_abs_thighs, gen_pose_most_muscular,
    # Poses – Men's Physique
    gen_pose_mp_front, gen_pose_mp_back, gen_pose_mp_side,
]

if __name__ == '__main__':
    import sys, time
    filter_names = sys.argv[1:] if len(sys.argv) > 1 else []
    print(f"\n{'='*55}")
    print(f"  BODYBVILDER GIF Generator  V2  (Professional)")
    print(f"  Output → {OUT_DIR}")
    print(f"  Canvas: {W}×{H}px  |  2× AA  |  {FRAMES} frames/half")
    print(f"{'='*55}\n")
    t0 = time.time()
    done = errors = 0
    for fn in ALL_V2:
        name = fn.__name__.replace('gen_','').replace('_','-')
        if filter_names and name not in filter_names:
            continue
        try:
            fn()
            done += 1
        except Exception as e:
            print(f"  ✗ {name}: {e}")
            import traceback; traceback.print_exc()
            errors += 1
    print(f"\n{'='*55}")
    print(f"  Done: {done} GIFs in {time.time()-t0:.1f}s  |  Errors: {errors}")
    print(f"{'='*55}\n")
