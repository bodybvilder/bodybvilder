# BODYBVILDER — Motion Spec Reference (Deep Dive)

Spesifikasi gerakan akurat untuk generate GIF exercise & pose. Setiap entry punya: silhouette diagnostik (ciri visual paling unik), fase gerakan dengan sudut sendi, catatan biomekanik kritis, dan prompt siap-pakai untuk AI image/GIF generator.

## 🎨 GIF Spec Global

- **Ukuran**: 200x200px or 300x300px
- **Background**: transparent or #0a0a0a
- **Warna figure**: #e0e0e0 (light gray/white)
- **Accent**: #C8FF00 (lime green)
- **Format**: looping animated GIF
- **FPS**: 12-24fps
- **Durasi**: 1.5-3 seconds per loop
- **Style**: minimalist flat vector, not photorealistic
- **Naming**: [exercise-id].gif

---


## 💪 CHEST

### `pushup` — Push-Up

**Ciri visual paling diagnostik:** Badan lurus horizontal (plank) menghadap lantai, tangan selebar bahu di lantai, siku fleksi-ekstensi naik turun

**Fase gerakan:**

- *top* — Lengan lurus, badan plank lurus dari kepala-pinggul-tumit
  - Sudut sendi: elbow: 175-180°, shoulder: vertical, ~90° to torso, hip: 175-180° (lurus), spine: neutral/flat
- *bottom* — Dada hampir sentuh lantai, siku fleksi penuh, badan tetap lurus (tidak sagging/piking)
  - Sudut sendi: elbow: 70-90°, shoulder: elbow tucked ~30-45° dari torso, hip: 175-180° tetap lurus, spine: neutral

**⚠️ Catatan kritis (jangan sampai salah):** Garis tubuh HARUS lurus dari kepala ke tumit di semua fase — kesalahan umum adalah pinggul turun (sagging) atau naik (piking). Siku tidak full flare 90° ke samping (itu salah, bikin cedera bahu), tapi tucked sedikit.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure in plank position on floor, body forming straight diagonal line from head to heels, hands directly under shoulders, performing push-up: arms extend straight (top) then elbows bend lowering chest near floor (bottom), loop. Flat vector style, white/light-gray figure on transparent or #0a0a0a background, lime green (#C8FF00) accent on bending elbow joint.

### `incline-pushup` — Incline Push-Up

**Ciri visual paling diagnostik:** Sama seperti push-up tapi tangan di permukaan tinggi (bench/box), badan miring dengan kepala lebih tinggi dari kaki

**Fase gerakan:**

- *top* — Lengan lurus, badan membentuk garis miring dari kepala (tinggi) ke kaki (lantai)
  - Sudut sendi: elbow: 175-180°, torso_incline: ~30-45° dari horizontal
- *bottom* — Dada mendekati permukaan elevated, siku fleksi
  - Sudut sendi: elbow: 70-90°

**⚠️ Catatan kritis (jangan sampai salah):** Sudut elevasi tangan lebih tinggi dari kaki adalah ciri pembeda utama vs push-up biasa — targetkan lower chest lebih sedikit, upper chest/shoulder lebih banyak terlibat secara visual tunjukkan kemiringan jelas.

**🤖 Prompt generate (siap pakai):**
> Side-view figure with hands placed on elevated platform/bench, body inclined diagonally with head higher than feet, performing push-up motion bending and extending elbows, loop. Flat minimalist vector, transparent/#0a0a0a background, lime green accent on elbows.

### `decline-pushup` — Decline Push-Up

**Ciri visual paling diagnostik:** Kaki di permukaan tinggi (bench), tangan di lantai, badan miring dengan kaki lebih tinggi dari kepala

**Fase gerakan:**

- *top* — Lengan lurus, badan miring kaki-tinggi kepala-rendah
  - Sudut sendi: elbow: 175-180°, torso_incline: ~20-30° feet elevated
- *bottom* — Dada mendekati lantai, siku fleksi
  - Sudut sendi: elbow: 70-90°

**⚠️ Catatan kritis (jangan sampai salah):** Kebalikan dari incline — kaki yang elevated, bukan tangan. Menekankan upper chest. Pastikan visual jelas kaki di platform tinggi, tangan tetap di lantai/level rendah.

**🤖 Prompt generate (siap pakai):**
> Side-view figure with feet elevated on platform/bench, hands on floor, body inclined with hips/feet higher than head, performing push-up bending elbows, loop. Flat vector style, transparent background, lime green accent on elbow joint.

### `diamond-pushup` — Diamond Push-Up

**Ciri visual paling diagnostik:** Push-up dengan tangan rapat membentuk diamond/triangle di bawah dada tengah, siku mengarah ke belakang bukan ke samping

**Fase gerakan:**

- *top* — Lengan lurus, tangan rapat di tengah membentuk diamond (jempol+telunjuk bersentuhan)
  - Sudut sendi: elbow: 175-180°, hand_position: rapat di garis tengah dada
- *bottom* — Siku fleksi mengarah ke belakang (dekat rusuk), dada hampir sentuh tangan
  - Sudut sendi: elbow: 60-80°, elbow_direction: menyempit ke arah pinggang, bukan flare ke samping

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda kunci dari push-up biasa adalah POSISI TANGAN — rapat membentuk diamond shape di bawah dada, bukan selebar bahu. Siku bergerak dekat ke tubuh (sempit), menekankan triceps.

**🤖 Prompt generate (siap pakai):**
> Side-and-top hybrid view minimalist figure in plank, hands close together forming diamond/triangle shape under chest, elbows tucked narrow pointing backward while bending and extending, loop. Flat vector, transparent background, lime green highlight on diamond hand shape.

### `wide-pushup` — Wide Push-Up

**Ciri visual paling diagnostik:** Push-up dengan tangan jauh lebih lebar dari bahu, siku flare ke samping lebih lebar

**Fase gerakan:**

- *top* — Lengan lurus, tangan diletakkan jauh lebih lebar dari lebar bahu
  - Sudut sendi: elbow: 175-180°, hand_width: >1.5x lebar bahu
- *bottom* — Siku fleksi dengan flare lebar ke samping, range of motion lebih pendek dari push-up biasa
  - Sudut sendi: elbow: 90-110° (ROM lebih terbatas)

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda utama: lebar tangan jauh melebihi bahu, dan siku flare lebih ke samping (bukan tucked). Range gerak lebih pendek dibanding push-up standar — jangan gambar turun terlalu dalam.

**🤖 Prompt generate (siap pakai):**
> Front/side-view minimalist figure in plank with hands placed much wider than shoulders, elbows flaring outward to the sides while bending, shorter range of motion, loop. Flat vector style, transparent background, lime green accent on wide-placed hands.

### `incline-dumbbell-press` — Incline Dumbbell Press

**Ciri visual paling diagnostik:** Berbaring di bench miring (kepala lebih tinggi), memegang dumbbell di kedua tangan, mendorong vertikal ke atas dari posisi dada

**Fase gerakan:**

- *bottom* — Berbaring di incline bench, dumbbell di samping dada, siku fleksi di bawah
  - Sudut sendi: elbow: 80-90°, shoulder: ~horizontal flare
- *top* — Dumbbell didorong lurus ke atas, lengan ekstensi penuh di atas dada
  - Sudut sendi: elbow: 170-180°

**⚠️ Catatan kritis (jangan sampai salah):** Bench HARUS terlihat miring (incline ~30-45°) — kalau flat, ini jadi exercise berbeda. Gerakan dumbbell vertikal lurus ke atas dari posisi dada bagian atas.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying on inclined bench (~45°), holding dumbbells at chest level, pressing them straight up overhead then lowering, loop. Flat vector, transparent background, lime green accent on dumbbells.

### `dumbbell-fly` — Dumbbell Fly

**Ciri visual paling diagnostik:** Berbaring di bench flat, lengan terbuka lebar ke samping seperti sayap lalu menutup di atas dada — gerakan arc/melengkung, siku tetap sedikit fleksi konstan (tidak menekuk-meluruskan)

**Fase gerakan:**

- *open* — Lengan terbuka lebar ke samping setinggi bahu, siku sedikit fleksi tetap (soft elbow), dumbbell di kedua sisi
  - Sudut sendi: elbow: ~150-160° (fixed slight bend), shoulder: horizontal abduction ~90°
- *closed* — Lengan menutup di atas dada dalam gerakan arc, dumbbell hampir bersentuhan
  - Sudut sendi: elbow: tetap ~150-160°, shoulder: horizontal adduction

**⚠️ Catatan kritis (jangan sampai salah):** Kunci pembeda: siku TIDAK menekuk-meluruskan seperti press, tapi tetap fixed slightly bent sepanjang gerakan — gerakannya dari bahu (arc/melengkung seperti sayap kupu-kupu), bukan dari siku.

**🤖 Prompt generate (siap pakai):**
> Side or top-down view minimalist figure lying on flat bench, arms opening wide to sides like wings then arcing closed above chest, elbows staying softly bent throughout (not straightening/bending), dumbbells in hand, loop. Flat vector, transparent background, lime green accent tracing the arc path.

### `cable-fly` — Cable Fly

**Ciri visual paling diagnostik:** Berdiri di antara dua cable pulley tinggi, lengan terbuka lebar ke samping lalu menutup di depan dada dalam gerakan arc, condong badan sedikit ke depan

**Fase gerakan:**

- *open* — Berdiri tegak, lengan terbuka lebar ke samping memegang handle cable, siku sedikit fleksi tetap
  - Sudut sendi: elbow: ~150-160° fixed, shoulder: horizontal abduction
- *closed* — Lengan menutup ke depan dada dalam arc, tangan bertemu di garis tengah
  - Sudut sendi: elbow: tetap ~150-160°, shoulder: horizontal adduction, hands meet center

**⚠️ Catatan kritis (jangan sampai salah):** Sama prinsip dengan dumbbell fly (siku fixed, gerakan arc dari bahu) tapi posisi BERDIRI dengan dua cable line dari atas/samping — ini pembeda visual utama vs dumbbell fly yang berbaring.

**🤖 Prompt generate (siap pakai):**
> Front-view minimalist figure standing between two cable pulleys, arms opening wide to sides then arcing forward to meet at center chest, slight forward lean, elbows softly bent throughout, loop. Flat vector, transparent background, lime green accent on cable lines and hands.

### `barbell-bench-press` — Barbell Bench Press

**Ciri visual paling diagnostik:** Berbaring di flat bench, memegang barbell lebar dengan dua tangan, mendorong vertikal dari dada ke atas

**Fase gerakan:**

- *bottom* — Barbell disentuhkan/mendekati dada tengah, siku fleksi di bawah sedikit flare
  - Sudut sendi: elbow: 75-90°
- *top* — Barbell didorong lurus ke atas, lengan ekstensi penuh di atas dada
  - Sudut sendi: elbow: 170-180°

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari dumbbell press: SATU barbell panjang dipegang dua tangan (bukan dua dumbbell terpisah), bench FLAT (bukan incline). Lintasan vertikal lurus naik-turun dari dada.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying on flat bench, gripping a long straight barbell with both hands, lowering it to touch chest then pressing straight up to full extension, loop. Flat vector, transparent background, lime green accent on barbell bar.


---


## 💪 CHEST / SHOULDERS

### `pike-pushup` — Pike Push-Up

**Ciri visual paling diagnostik:** Badan membentuk huruf V terbalik (pinggul tinggi di udara), kepala mengarah ke lantai, mirip downward dog yoga

**Fase gerakan:**

- *top* — Pinggul terangkat tinggi, badan membentuk inverted-V, lengan lurus
  - Sudut sendi: hip: ~70-90° (pike angle), elbow: 175-180°
- *bottom* — Kepala turun ke arah lantai di antara tangan, siku fleksi, pinggul tetap tinggi
  - Sudut sendi: elbow: 70-90°, hip: tetap ~70-90°

**⚠️ Catatan kritis (jangan sampai salah):** Bentuk inverted-V (pinggul tinggi, badan menekuk di pinggang) adalah ciri WAJIB yang membedakan dari semua push-up lain — ini paling penting untuk recognisability instan.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure in inverted-V pike position (hips high, like downward dog), head lowering toward floor between hands then pressing back up, loop. Flat vector, transparent background, lime green accent on shoulder/elbow joints.


---


## 🔙 BACK

### `dead-hang` — Dead Hang

**Ciri visual paling diagnostik:** Tubuh menggantung penuh di pull-up bar, lengan lurus total, kaki rileks menggantung, statis (bukan gerakan naik-turun)

**Fase gerakan:**

- *hang* — Tergantung penuh, lengan lurus, bahu rileks (tidak shrug), badan lurus vertikal
  - Sudut sendi: elbow: 175-180°, shoulder: full overhead extension

**⚠️ Catatan kritis (jangan sampai salah):** Ini POSE STATIS, bukan gerakan repetitif — animasi bisa berupa gentle sway/breathing subtle untuk indikasi 'hold', jangan tampilkan naik-turun (itu jadi pull-up).

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure hanging fully extended from a pull-up bar, straight arms, relaxed body, subtle gentle sway to indicate static hold (no up-down movement), loop. Flat vector, transparent background, lime green accent on hands gripping bar.

### `pullup` — Pull-Up

**Ciri visual paling diagnostik:** Menggantung di bar dengan grip overhand (telapak menjauh dari badan), menarik badan naik sampai dagu melewati bar

**Fase gerakan:**

- *bottom* — Tergantung penuh, lengan lurus, grip overhand lebar bahu
  - Sudut sendi: elbow: 175-180°
- *top* — Dagu melewati garis bar, siku fleksi penuh di bawah
  - Sudut sendi: elbow: 30-50°, shoulder: depressed and adducted

**⚠️ Catatan kritis (jangan sampai salah):** Grip overhand (knuckles ke arah wajah saat lihat dari depan) adalah pembeda dari chin-up. Dagu HARUS melewati level bar di top — ini diagnostic point penting.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure hanging from pull-up bar with overhand grip, pulling body upward until chin clears the bar, then lowering back to full hang, loop. Flat vector, transparent background, lime green accent on bar and gripping hands.

### `chinup` — Chin-Up

**Ciri visual paling diagnostik:** Sama seperti pull-up tapi grip underhand (telapak menghadap wajah), menarik badan naik

**Fase gerakan:**

- *bottom* — Tergantung penuh, grip underhand selebar bahu
  - Sudut sendi: elbow: 175-180°
- *top* — Dagu melewati bar, siku fleksi penuh
  - Sudut sendi: elbow: 30-50°

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda KUNCI dari pull-up: orientasi telapak tangan (underhand/supinated, menghadap ke wajah pelaku). Visual: pastikan jelas tangan terbalik dibanding pull-up.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure hanging from bar with underhand/supinated grip (palms facing toward face), pulling body upward until chin clears bar, loop. Flat vector, transparent background, lime green accent on hands showing underhand grip.

### `bodyweight-row` — Bodyweight Row

**Ciri visual paling diagnostik:** Badan miring di bawah bar rendah (atau TRX/rings), kaki di lantai, menarik dada ke arah bar dengan badan tetap lurus seperti plank miring

**Fase gerakan:**

- *bottom* — Lengan lurus, badan miring lurus dari kepala ke tumit, tumit di lantai, bar dipegang di atas
  - Sudut sendi: elbow: 175-180°, body_angle: diagonal, ~30-45° dari lantai
- *top* — Dada ditarik mendekati bar, siku fleksi, badan tetap lurus (tidak melengkung)
  - Sudut sendi: elbow: 60-80°, scapula: retracted

**⚠️ Catatan kritis (jangan sampai salah):** Badan harus tetap LURUS seperti plank miring sepanjang gerakan (tumit tetap di lantai sebagai titik tumpu) — bukan duduk/jongkok. Bar/handle berada DI ATAS badan, ditarik dari bawah.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying at an angle under a low bar with heels on floor, body straight like an inclined plank, pulling chest up toward the bar by bending elbows then extending, loop. Flat vector, transparent background, lime green accent on bar.

### `superman` — Superman Hold

**Ciri visual paling diagnostik:** Berbaring tengkurap di lantai, mengangkat dada dan kaki bersamaan ke atas sehingga hanya pinggul yang menyentuh lantai, lengan terentang ke depan seperti terbang

**Fase gerakan:**

- *lifted* — Dada, lengan (terentang ke depan), dan kaki terangkat dari lantai bersamaan, hanya pinggul/perut menyentuh lantai
  - Sudut sendi: spine: hyperextension, hip: extended, shoulder: extended overhead/forward

**⚠️ Catatan kritis (jangan sampai salah):** Posisi tengkurap (prone) di lantai adalah ciri utama. Lengan DAN kaki sama-sama terangkat bersamaan — ini membedakan dari exercise back lain. Bentuk badan menyerupai 'superman terbang'.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying face-down on floor, simultaneously lifting chest, arms (extended forward) and legs off the ground in a flying superman shape, holding then gently lowering, loop. Flat vector, transparent background, lime green accent on raised limbs.

### `barbell-row` — Barbell Row

**Ciri visual paling diagnostik:** Berdiri membungkuk ke depan (hip hinge) memegang barbell dengan dua tangan, menarik barbell ke arah perut bawah/pinggang

**Fase gerakan:**

- *bottom* — Badan membungkuk ~45-90° dari hip hinge, barbell menggantung lengan lurus di bawah
  - Sudut sendi: hip: ~45-90° flexion, elbow: 175-180°, spine: neutral flat back
- *top* — Barbell ditarik ke arah pinggang bawah/pusar, siku fleksi mengarah ke belakang
  - Sudut sendi: elbow: 40-60°, scapula: retracted

**⚠️ Catatan kritis (jangan sampai salah):** Badan membungkuk ke depan (hip hinge, punggung lurus bukan bulat) adalah posisi statis sepanjang gerakan — bedakan dari deadlift yang berdiri tegak di top. Barbell ditarik ke pinggang BAWAH, bukan dada.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing bent forward at the hips with flat back, holding a barbell hanging below, pulling it up toward the lower abdomen/waist by bending elbows back, then lowering, loop. Flat vector, transparent background, lime green accent on barbell.

### `dumbbell-row` — Dumbbell Row

**Ciri visual paling diagnostik:** Satu tangan dan satu lutut bertumpu di bench (posisi tripod), tangan lain memegang dumbbell menarik ke arah pinggang, badan sejajar lantai

**Fase gerakan:**

- *bottom* — Lengan kerja lurus menggantung ke bawah, badan sejajar/parallel lantai bertumpu pada bench
  - Sudut sendi: elbow: 175-180°, torso: parallel to floor
- *top* — Dumbbell ditarik ke arah pinggang/rusuk, siku fleksi mengarah ke belakang-atas
  - Sudut sendi: elbow: 40-60°

**⚠️ Catatan kritis (jangan sampai salah):** Posisi tripod (satu tangan + satu lutut di bench) unilateral adalah pembeda kunci dari barbell row (yang bilateral berdiri). Hanya SATU lengan bergerak, lengan lain menumpu.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure with one hand and one knee supported on a bench, torso parallel to floor, other arm holding a dumbbell pulling up toward the waist then lowering straight, loop. Flat vector, transparent background, lime green accent on dumbbell.

### `barbell-deadlift` — Barbell Deadlift

**Ciri visual paling diagnostik:** Mengangkat barbell dari lantai ke posisi berdiri tegak penuh dengan hip hinge, dimulai dari jongkok-membungkuk ke berdiri lurus

**Fase gerakan:**

- *bottom* — Badan membungkuk, pinggul ke belakang, lutut sedikit fleksi, barbell di lantai dipegang dua tangan, punggung lurus
  - Sudut sendi: hip: ~45-70° flexion, knee: ~30-40° flexion, spine: neutral flat
- *top* — Berdiri tegak penuh, pinggul dan lutut ekstensi penuh, barbell di depan paha
  - Sudut sendi: hip: 175-180°, knee: 175-180°

**⚠️ Catatan kritis (jangan sampai salah):** Mulai dari LANTAI (barbell di lantai di posisi bawah) dan berakhir BERDIRI TEGAK PENUH — ini beda dari Romanian deadlift yang tidak menyentuh lantai dan lutut lebih lurus sepanjang gerakan.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lifting a barbell from the floor, hips hinging back with slightly bent knees and flat back, rising to a fully upright standing position with bar in front of thighs, then lowering back to floor, loop. Flat vector, transparent background, lime green accent on barbell.

### `romanian-deadlift` — Romanian Deadlift

**Ciri visual paling diagnostik:** Berdiri memegang barbell, membungkuk ke belakang (hip hinge) dengan lutut tetap sedikit fleksi konstan, barbell tidak menyentuh lantai

**Fase gerakan:**

- *top* — Berdiri tegak, barbell di depan paha, lutut sedikit fleksi (soft knee)
  - Sudut sendi: hip: 175-180°, knee: ~160-170° (soft, fixed)
- *bottom* — Pinggul mendorong ke belakang, badan membungkuk ke depan, barbell turun di sepanjang tungkai sampai sekitar pertengahan betis, TIDAK menyentuh lantai
  - Sudut sendi: hip: ~60-90° flexion, knee: tetap ~160-170° (tidak menambah fleksi)

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda KUNCI dari deadlift biasa: lutut TETAP fixed slightly bent (tidak ikut menekuk lebih dalam), gerakan murni dari hip hinge, dan barbell TIDAK pernah menyentuh lantai (berhenti sekitar betis/shin).

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing holding barbell, knees fixed with slight bend, hinging hips backward to lower torso forward while barbell slides down along legs stopping above floor (not touching), then returning upright, loop. Flat vector, transparent background, lime green accent on barbell.

### `lat-pulldown` — Lat Pulldown

**Ciri visual paling diagnostik:** Duduk di mesin, menarik bar lebar dari atas kepala ke arah dada bagian atas

**Fase gerakan:**

- *top* — Duduk tegak, lengan terentang ke atas memegang bar lebar, siku hampir lurus
  - Sudut sendi: elbow: 160-180°, shoulder: full overhead flexion
- *bottom* — Bar ditarik turun ke dada bagian atas, siku fleksi mengarah ke bawah-belakang
  - Sudut sendi: elbow: 50-70°

**⚠️ Catatan kritis (jangan sampai salah):** Posisi DUDUK di mesin dengan cable line vertikal dari atas adalah ciri utama. Bar lebar (wide grip) ditarik turun lurus ke dada atas, siku mengarah ke bawah bukan ke belakang seperti row.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure seated at a cable machine, pulling a wide bar down from overhead to upper chest, elbows driving downward, then controlled return upward, loop. Flat vector, transparent background, lime green accent on the bar and cable line.

### `seated-cable-row` — Seated Cable Row

**Ciri visual paling diagnostik:** Duduk tegak di lantai/bench dengan kaki menapak ke footplate, menarik handle cable horizontal ke arah perut

**Fase gerakan:**

- *extended* — Badan tegak, lengan terentang lurus ke depan memegang handle, sedikit lean forward
  - Sudut sendi: elbow: 170-180°, torso: slight forward lean
- *pulled* — Handle ditarik ke arah perut/pinggang, siku fleksi ke belakang, badan tegak/sedikit lean back, dada terbuka
  - Sudut sendi: elbow: 50-70°, scapula: retracted

**⚠️ Catatan kritis (jangan sampai salah):** Cable line HORIZONTAL (bukan dari atas seperti lat pulldown) adalah pembeda utama. Posisi duduk tegak dengan kaki menapak footplate, gerakan tarik mendatar ke arah pusar.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure seated on floor with feet on footplate, pulling a horizontal cable handle toward the stomach with elbows driving back, then extending arms forward, loop. Flat vector, transparent background, lime green accent on cable handle.

### `t-bar-row` — T-Bar Row

**Ciri visual paling diagnostik:** Berdiri membungkuk di atas T-bar (landmine), memegang handle dengan dua tangan di antara kaki, menarik ke atas ke arah dada

**Fase gerakan:**

- *bottom* — Badan membungkuk ~45° hip hinge, lengan lurus ke bawah memegang handle T-bar yang berada di antara kaki
  - Sudut sendi: hip: ~45-60° flexion, elbow: 175-180°
- *top* — Handle ditarik ke atas mendekati dada bawah, siku fleksi ke belakang
  - Sudut sendi: elbow: 40-60°

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari barbell row: posisi handle T-bar berada DI ANTARA KEDUA KAKI pelaku (landmine setup), bukan di depan tubuh. Grip biasanya close/neutral dengan handle V-bar.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing bent forward straddling a T-bar landmine setup, pulling the handle positioned between the legs up toward the lower chest, then lowering, loop. Flat vector, transparent background, lime green accent on handle.

### `good-morning` — Good Morning

**Ciri visual paling diagnostik:** Berdiri dengan barbell di belakang leher/bahu atas (seperti squat position), membungkuk ke depan dari pinggul dengan lutut tetap sedikit fleksi, badan hampir sejajar lantai lalu kembali berdiri

**Fase gerakan:**

- *top* — Berdiri tegak, barbell di belakang leher/trap atas, lutut sedikit fleksi
  - Sudut sendi: hip: 175-180°, knee: ~165-175°
- *bottom* — Badan membungkuk ke depan dari pinggul mendekati sejajar lantai, lutut tetap fixed sedikit fleksi
  - Sudut sendi: hip: ~70-90° flexion, knee: tetap ~165-175°

**⚠️ Catatan kritis (jangan sampai salah):** Posisi barbell di BELAKANG LEHER/bahu (seperti back squat) adalah pembeda visual utama dari Romanian deadlift (yang barbell di depan/tangan). Lutut fixed, gerakan murni hip hinge.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing with a barbell resting on the back of the shoulders/neck (like squat position), hinging forward at the hips with knees fixed slightly bent until torso is near parallel to floor, then returning upright, loop. Flat vector, transparent background, lime green accent on the barbell behind the neck.

### `barbell-shrug` — Barbell Shrug

**Ciri visual paling diagnostik:** Berdiri tegak memegang barbell di depan paha, mengangkat bahu lurus ke atas mendekati telinga tanpa menekuk siku

**Fase gerakan:**

- *down* — Berdiri tegak, lengan lurus ke bawah memegang barbell, bahu rileks/netral
  - Sudut sendi: elbow: 175-180° (fixed), shoulder: neutral
- *up* — Bahu terangkat vertikal lurus ke atas mendekati telinga, siku tetap lurus
  - Sudut sendi: elbow: tetap 175-180°, shoulder_elevation: maksimal

**⚠️ Catatan kritis (jangan sampai salah):** Siku HARUS tetap lurus sepanjang gerakan (tidak menekuk) — yang bergerak murni hanya bahu naik-turun vertikal lurus seperti mengangkat bahu 'tidak tahu'. Tidak ada rotasi bahu.

**🤖 Prompt generate (siap pakai):**
> Front-view minimalist figure standing holding a barbell in front of thighs with straight arms, shoulders shrugging straight up toward the ears then lowering, elbows remaining fixed straight throughout, loop. Flat vector, transparent background, lime green accent on raised shoulders/traps.


---


## 🏋️ SHOULDERS

### `lateral-raise` — Lateral Raise

**Ciri visual paling diagnostik:** Berdiri tegak, mengangkat dua dumbbell ke samping membentuk huruf T, siku sedikit fleksi tetap, hanya sampai setinggi bahu

**Fase gerakan:**

- *down* — Lengan menggantung di samping badan, dumbbell di tangan
  - Sudut sendi: shoulder: neutral adduction, elbow: ~160-170° soft bend
- *up* — Lengan terangkat ke samping setinggi bahu membentuk garis T dengan tubuh, siku tetap soft bend
  - Sudut sendi: shoulder: ~90° abduction, elbow: tetap ~160-170°

**⚠️ Catatan kritis (jangan sampai salah):** Lengan terangkat HANYA setinggi bahu (90° abduction) membentuk huruf T sempurna — jangan lebih tinggi dari itu. Siku tetap fixed soft bend, bukan menekuk-meluruskan.

**🤖 Prompt generate (siap pakai):**
> Front-view minimalist figure standing, raising two dumbbells out to the sides up to shoulder height forming a T-shape with the body, elbows softly bent and fixed, then lowering, loop. Flat vector, transparent background, lime green accent on dumbbells at the T position.

### `front-raise` — Front Raise

**Ciri visual paling diagnostik:** Berdiri tegak, mengangkat dumbbell/barbell lurus ke DEPAN sampai setinggi bahu, lengan tetap relatif lurus

**Fase gerakan:**

- *down* — Lengan menggantung di depan/samping badan, dumbbell di tangan
  - Sudut sendi: shoulder: neutral
- *up* — Lengan terangkat lurus ke depan sampai setinggi bahu (sejajar lantai)
  - Sudut sendi: shoulder: ~90° flexion (forward), elbow: ~160-180° relatif lurus

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari lateral raise: arah angkat ke DEPAN tubuh (sagittal plane), bukan ke samping. Lengan terangkat sampai sejajar lantai di depan, tidak lebih tinggi.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing, raising a dumbbell straight forward up to shoulder height (parallel to floor) with a relatively straight arm, then lowering, loop. Flat vector, transparent background, lime green accent on dumbbell at top position.

### `shoulder-tap` — Shoulder Tap

**Ciri visual paling diagnostik:** Posisi plank/push-up top, secara bergantian mengangkat satu tangan untuk menyentuh bahu yang berlawanan, badan stabil tidak goyang

**Fase gerakan:**

- *plank* — Posisi plank tinggi, dua tangan di lantai, badan lurus
  - Sudut sendi: elbow: 175-180°, hip: 175-180° straight
- *tap* — Satu tangan terangkat menyentuh bahu berlawanan, badan tetap stabil bertumpu pada tangan dan kaki yang tersisa
  - Sudut sendi: shoulder_rotation: tangan menyentuh bahu kontralateral, hip: tetap stabil tidak rotasi

**⚠️ Catatan kritis (jangan sampai salah):** Posisi dasar adalah PLANK (bukan berdiri) — ciri utama adalah anti-rotasi core, badan harus stay stable/tidak goyang saat satu tangan terangkat menyentuh bahu seberang secara bergantian.

**🤖 Prompt generate (siap pakai):**
> Top-down or side-view minimalist figure in high plank position, alternately lifting one hand to tap the opposite shoulder while keeping hips and torso stable without rotating, loop. Flat vector, transparent background, lime green accent on the tapping hand.

### `overhead-press` — Overhead Press

**Ciri visual paling diagnostik:** Berdiri tegak, memegang barbell di depan bahu/dada atas, mendorong vertikal lurus ke atas kepala

**Fase gerakan:**

- *bottom* — Barbell di depan bahu/clavicle, siku fleksi di bawah depan
  - Sudut sendi: elbow: ~80-90°, shoulder: flexed forward at rack position
- *top* — Barbell didorong lurus ke atas kepala, lengan ekstensi penuh
  - Sudut sendi: elbow: 170-180°, shoulder: full overhead flexion

**⚠️ Catatan kritis (jangan sampai salah):** Posisi BERDIRI (bukan duduk) dengan barbell adalah ciri standar overhead press. Lintasan dorong vertikal lurus dari depan bahu ke atas kepala, badan tetap tegak (tidak melenting berlebihan).

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing, holding a barbell at shoulder/collarbone height, pressing it straight overhead to full arm extension, then lowering back to shoulders, loop. Flat vector, transparent background, lime green accent on barbell.

### `arnold-press` — Arnold Press

**Ciri visual paling diagnostik:** Duduk/berdiri, mulai dengan dumbbell di depan dada telapak menghadap wajah, mendorong ke atas SAMBIL memutar pergelangan sehingga di atas telapak menghadap depan

**Fase gerakan:**

- *bottom* — Dumbbell di depan dada/bahu, telapak tangan menghadap ke wajah (supinated), siku fleksi di depan
  - Sudut sendi: elbow: ~80-90°, wrist_rotation: palms facing face
- *top* — Dumbbell terdorong ke atas kepala SAMBIL rotasi pergelangan sehingga telapak menghadap ke depan
  - Sudut sendi: elbow: 170-180°, wrist_rotation: palms facing forward

**⚠️ Catatan kritis (jangan sampai salah):** Ciri PALING KHAS dan wajib divisualisasikan: ROTASI pergelangan tangan 180° selama gerakan naik (mulai menghadap wajah, akhir menghadap depan) — ini yang membedakan total dari overhead press biasa.

**🤖 Prompt generate (siap pakai):**
> Front-view minimalist figure seated or standing, starting with dumbbells in front of chest with palms facing the face, pressing upward overhead while simultaneously rotating wrists so palms end facing forward, then reversing on the way down, loop. Flat vector, transparent background, lime green accent on dumbbells highlighting the rotation.

### `face-pull` — Face Pull

**Ciri visual paling diagnostik:** Berdiri menghadap cable setinggi wajah, menarik rope/handle ke arah wajah dengan siku tinggi flare ke samping, tangan berpisah lebar di akhir

**Fase gerakan:**

- *extended* — Lengan terentang ke depan setinggi wajah memegang rope cable, kedua tangan rapat
  - Sudut sendi: elbow: 170-180°, shoulder: horizontal flexion
- *pulled* — Rope ditarik ke arah wajah, siku flare tinggi ke samping setinggi bahu/telinga, tangan terpisah lebar (external rotation)
  - Sudut sendi: elbow: 70-90°, shoulder: high elbow flare + external rotation

**⚠️ Catatan kritis (jangan sampai salah):** Ciri kunci: siku terangkat TINGGI flare ke samping (sejajar telinga/bahu) saat menarik, dan tangan berpisah lebar di akhir gerakan (external rotation) — bukan ditarik ke dada seperti row biasa.

**🤖 Prompt generate (siap pakai):**
> Top-down or side-view minimalist figure standing facing a cable machine at face height, pulling a rope attachment toward the face with elbows flaring high to the sides and hands separating wide at the end, then extending forward, loop. Flat vector, transparent background, lime green accent on rope handles.

### `cable-lateral-raise` — Cable Lateral Raise

**Ciri visual paling diagnostik:** Berdiri menyamping ke cable rendah, mengangkat satu lengan menyilang badan ke samping setinggi bahu menggunakan cable

**Fase gerakan:**

- *down* — Berdiri menyamping cable, lengan kerja menyilang ke bawah depan tubuh
  - Sudut sendi: shoulder: adducted across body
- *up* — Lengan terangkat ke samping setinggi bahu, siku soft bend tetap
  - Sudut sendi: shoulder: ~90° abduction, elbow: ~160-170° fixed

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari dumbbell lateral raise: SATU sisi badan menghadap cable rendah (cable line dari bawah/samping, bukan dumbbell gravity), tubuh berdiri menyamping ke arah mesin.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing sideways to a low cable pulley, raising one arm out to the side up to shoulder height with a cable attachment, elbow softly fixed, then lowering across the body, loop. Flat vector, transparent background, lime green accent on cable line and hand.

### `dumbbell-shoulder-press` — Dumbbell Shoulder Press

**Ciri visual paling diagnostik:** Duduk/berdiri, dua dumbbell di samping bahu, mendorong vertikal ke atas secara terpisah (independent) sampai lurus di atas kepala

**Fase gerakan:**

- *bottom* — Dumbbell di samping bahu kanan-kiri, siku fleksi di bawah
  - Sudut sendi: elbow: ~80-90°
- *top* — Dumbbell didorong lurus ke atas kepala, lengan ekstensi penuh
  - Sudut sendi: elbow: 170-180°

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari barbell overhead press: DUA dumbbell terpisah (bukan satu barbell), biasanya dilakukan duduk di bench dengan backrest. Lintasan sedikit arc karena dumbbell independen.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure seated on a bench, pressing two separate dumbbells from shoulder height straight up overhead to full extension, then lowering, loop. Flat vector, transparent background, lime green accent on dumbbells.

### `upright-row` — Upright Row

**Ciri visual paling diagnostik:** Berdiri tegak memegang barbell/EZ-bar dengan grip rapat di depan paha, menarik vertikal ke atas sampai setinggi dada/dagu dengan siku tinggi memimpin

**Fase gerakan:**

- *down* — Barbell di depan paha, lengan lurus, grip rapat
  - Sudut sendi: elbow: 175-180°
- *up* — Barbell ditarik vertikal ke atas sepanjang badan sampai setinggi dada/dagu, siku terangkat tinggi memimpin gerakan
  - Sudut sendi: elbow: ~90-110°, elbow_height: lebih tinggi dari pergelangan tangan

**⚠️ Catatan kritis (jangan sampai salah):** Lintasan barbell vertikal LURUS sepanjang depan tubuh (dekat badan), siku selalu lebih tinggi dari tangan dan memimpin gerakan ke atas — beda dari upright pull lain karena grip rapat dan lintasan dekat torso.

**🤖 Prompt generate (siap pakai):**
> Front-view minimalist figure standing, pulling a barbell with a close grip straight up along the front of the body from thighs to chest height, elbows leading high and wide, then lowering, loop. Flat vector, transparent background, lime green accent on barbell.

### `reverse-fly` — Reverse Fly

**Ciri visual paling diagnostik:** Badan membungkuk ke depan (hip hinge), lengan menggantung ke bawah lalu terangkat ke samping membentuk T dari posisi membungkuk, fokus rear delts/upper back

**Fase gerakan:**

- *down* — Badan membungkuk ~45-90°, lengan menggantung lurus ke bawah memegang dumbbell, siku soft bend
  - Sudut sendi: hip: ~45-90° flexion, shoulder: neutral hanging
- *up* — Lengan terangkat ke samping membentuk T dengan badan yang membungkuk, siku tetap soft bend
  - Sudut sendi: shoulder: ~90° horizontal abduction, elbow: ~160-170° fixed

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda KUNCI dari lateral raise berdiri: badan dalam posisi MEMBUNGKUK (bent-over) sepanjang gerakan, bukan berdiri tegak. Gerakan lengan tetap sama (arc ke samping, siku fixed).

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure bent forward at the hips, arms hanging down holding dumbbells then raising out to the sides forming a T-shape relative to the bent torso, elbows softly fixed, then lowering, loop. Flat vector, transparent background, lime green accent on dumbbells.


---


## 💪 TRICEPS

### `dip` — Tricep Dip

**Ciri visual paling diagnostik:** Badan tertopang dua tangan di parallel bars/kursi, badan tegak/sedikit condong, turun-naik vertikal dengan menekuk siku ke belakang

**Fase gerakan:**

- *top* — Lengan lurus, badan tertopang di atas bar, kaki menggantung/lurus ke depan
  - Sudut sendi: elbow: 175-180°
- *bottom* — Badan turun, siku fleksi mengarah ke belakang, bahu sejajar/sedikit di bawah siku
  - Sudut sendi: elbow: 70-90°

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari push-up: badan dalam posisi VERTIKAL/tegak (bukan horizontal plank), bertumpu pada dua bar parallel atau pinggir kursi/bench, gerakan turun-naik vertikal lurus ke bawah.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure supported on parallel bars or bench edge with body upright/vertical, lowering by bending elbows backward then pressing back up to straight arms, loop. Flat vector, transparent background, lime green accent on elbows.

### `bench-dip` — Bench Dip

**Ciri visual paling diagnostik:** Tangan di belakang menumpu pinggir bench, kaki terentang ke depan di lantai, badan turun-naik vertikal di depan bench

**Fase gerakan:**

- *top* — Lengan lurus, badan tertopang di belakang dengan tangan di bench, kaki lurus ke depan
  - Sudut sendi: elbow: 175-180°
- *bottom* — Badan turun ke arah lantai, siku fleksi mengarah ke belakang
  - Sudut sendi: elbow: 80-100°

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari tricep dip biasa: TANGAN DI BELAKANG TUBUH menumpu bench/kursi (bukan di samping seperti parallel bar dip), kaki terentang ke depan di lantai, badan agak condong ke depan.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure with hands behind the body gripping the edge of a bench, legs extended forward on the floor, lowering hips toward the ground by bending elbows then pressing back up, loop. Flat vector, transparent background, lime green accent on elbows.

### `tricep-extension` — Overhead Tricep Extension

**Ciri visual paling diagnostik:** Berdiri/duduk, memegang dumbbell dengan dua tangan di belakang kepala, menekuk-meluruskan siku secara vertikal di atas kepala

**Fase gerakan:**

- *bottom* — Siku fleksi penuh, dumbbell turun di belakang kepala/leher, lengan atas tetap vertikal dekat telinga
  - Sudut sendi: elbow: 60-80°, shoulder: fixed overhead
- *top* — Siku ekstensi penuh, dumbbell terangkat lurus di atas kepala, lengan atas tetap vertikal
  - Sudut sendi: elbow: 170-180°

**⚠️ Catatan kritis (jangan sampai salah):** Lengan ATAS tetap fixed vertikal dekat telinga sepanjang gerakan (tidak bergerak) — hanya lengan bawah/siku yang bergerak fleksi-ekstensi di belakang kepala. Ini hinge murni di siku.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing or seated, holding a dumbbell behind the head with both hands, upper arms fixed vertical near the ears, extending elbows to raise the dumbbell overhead then lowering behind the head, loop. Flat vector, transparent background, lime green accent on dumbbell.

### `skull-crusher` — Skull Crusher

**Ciri visual paling diagnostik:** Berbaring di bench, memegang barbell/EZ-bar dengan lengan atas vertikal tegak lurus ke atas, menekuk siku menurunkan bar ke arah dahi/belakang kepala

**Fase gerakan:**

- *top* — Lengan atas vertikal tegak lurus dari bahu, siku ekstensi penuh, bar di atas
  - Sudut sendi: elbow: 170-180°, shoulder: fixed perpendicular to bench
- *bottom* — Siku fleksi, bar turun ke arah dahi/atas kepala, lengan atas tetap vertikal tidak bergerak
  - Sudut sendi: elbow: 60-80°

**⚠️ Catatan kritis (jangan sampai salah):** Posisi BERBARING (lying down) adalah pembeda utama dari overhead extension (berdiri/duduk). Lengan atas tetap vertikal tegak lurus ke langit-langit sepanjang gerakan, hanya siku yang hinge menurunkan bar ke dahi.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying on a bench, upper arms held vertical perpendicular to the body, bending elbows to lower a barbell toward the forehead then extending back up, loop. Flat vector, transparent background, lime green accent on barbell.

### `tricep-pushdown` — Tricep Pushdown

**Ciri visual paling diagnostik:** Berdiri menghadap cable tinggi, siku terkunci di samping badan, mendorong bar/rope ke bawah dengan ekstensi siku

**Fase gerakan:**

- *top* — Siku fleksi ~90°, lengan atas fixed menempel di samping badan, bar di depan dada
  - Sudut sendi: elbow: ~80-90°, upper_arm: fixed at sides
- *bottom* — Siku ekstensi penuh, bar/rope terdorong ke bawah sampai lengan lurus di samping badan
  - Sudut sendi: elbow: 170-180°

**⚠️ Catatan kritis (jangan sampai salah):** Lengan ATAS terkunci menempel di samping badan sepanjang gerakan (tidak bergerak) — hanya lengan bawah yang bergerak hinge ke bawah dari cable tinggi. Badan tegak berdiri.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing facing a high cable pulley, upper arms fixed at the sides of the body, pushing a bar or rope straight down by extending the elbows, then controlled return up, loop. Flat vector, transparent background, lime green accent on the bar/rope.

### `cable-kickback` — Cable Kickback

**Ciri visual paling diagnostik:** Badan membungkuk ke depan, lengan atas sejajar lantai di samping badan (fixed), menekuk-meluruskan siku ke belakang menggunakan cable rendah

**Fase gerakan:**

- *bent* — Badan membungkuk ke depan, lengan atas sejajar lantai/badan, siku fleksi ~90°
  - Sudut sendi: hip: ~45-70° flexion, elbow: ~80-90°, upper_arm: parallel to torso/floor
- *extended* — Siku ekstensi penuh ke belakang, lengan lurus sejajar badan/lantai, cable tertarik
  - Sudut sendi: elbow: 170-180°

**⚠️ Catatan kritis (jangan sampai salah):** Badan membungkuk ke depan, lengan atas FIXED sejajar lantai/horizontal sepanjang gerakan — hanya siku yang hinge mengayun ke belakang. Cable line dari belakang/bawah.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure bent forward at the hips, upper arm fixed parallel to the torso, extending the elbow backward to kick a cable handle straight back, then bending forward again, loop. Flat vector, transparent background, lime green accent on cable handle.


---


## 💪 BICEPS / ARMS

### `bicep-curl` — Bicep Curl

**Ciri visual paling diagnostik:** Berdiri tegak, lengan atas fixed menempel di samping badan, menekuk siku mengangkat dumbbell ke arah bahu

**Fase gerakan:**

- *bottom* — Lengan lurus ke bawah di samping badan, dumbbell di tangan, telapak menghadap depan
  - Sudut sendi: elbow: 170-180°
- *top* — Siku fleksi penuh, dumbbell terangkat ke arah bahu/dada atas, lengan atas tetap fixed di samping
  - Sudut sendi: elbow: 30-45°

**⚠️ Catatan kritis (jangan sampai salah):** Lengan ATAS terkunci menempel di samping badan sepanjang gerakan (tidak swing/bergerak ke depan) — ini hinge murni di siku, ciri paling diagnostik untuk semua curl variant.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing, upper arms fixed at the sides of the body, curling dumbbells up toward the shoulders by bending the elbows, then lowering straight down, loop. Flat vector, transparent background, lime green accent on dumbbells.

### `hammer-curl` — Hammer Curl

**Ciri visual paling diagnostik:** Sama seperti bicep curl tapi telapak tangan menghadap ke dalam/satu sama lain (neutral grip) sepanjang gerakan, seperti memegang palu

**Fase gerakan:**

- *bottom* — Lengan lurus ke bawah, dumbbell dipegang vertikal dengan telapak menghadap ke dalam (neutral)
  - Sudut sendi: elbow: 170-180°, wrist: neutral grip, thumb up
- *top* — Siku fleksi penuh, dumbbell terangkat ke bahu, grip tetap neutral (tidak rotasi)
  - Sudut sendi: elbow: 30-45°, wrist: tetap neutral

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda KUNCI dari bicep curl biasa: grip NEUTRAL (telapak saling berhadapan, seperti pegang palu) sepanjang gerakan, TIDAK ada rotasi pergelangan tangan.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing, upper arms fixed at sides, curling dumbbells held vertically with neutral grip (palms facing each other, like holding a hammer) up toward shoulders, no wrist rotation, then lowering, loop. Flat vector, transparent background, lime green accent on dumbbells.

### `concentration-curl` — Concentration Curl

**Ciri visual paling diagnostik:** Duduk, siku ditopang/ditekan ke bagian dalam paha, lengan menekuk dumbbell ke atas dengan badan sedikit condong ke depan

**Fase gerakan:**

- *bottom* — Duduk, siku ditopang di bagian dalam paha, lengan lurus ke bawah memegang dumbbell
  - Sudut sendi: elbow: 170-180°, elbow_support: braced against inner thigh
- *top* — Siku fleksi penuh, dumbbell terangkat ke bahu, siku tetap bertumpu di paha
  - Sudut sendi: elbow: 30-45°

**⚠️ Catatan kritis (jangan sampai salah):** Ciri paling khas: posisi DUDUK dengan siku BERTUMPU/ditekan ke bagian dalam paha sebagai titik tumpu fixed — ini isolasi maksimal, beda total dari curl berdiri.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure seated, elbow braced against the inner thigh, curling a dumbbell up toward the shoulder with the upper body leaning slightly forward, then lowering, loop. Flat vector, transparent background, lime green accent on dumbbell.

### `barbell-curl` — Barbell Curl

**Ciri visual paling diagnostik:** Berdiri tegak memegang barbell dengan dua tangan grip lebar bahu, lengan atas fixed, menekuk siku mengangkat barbell ke dada atas

**Fase gerakan:**

- *bottom* — Lengan lurus ke bawah di depan paha, barbell dipegang dua tangan, telapak menghadap depan
  - Sudut sendi: elbow: 170-180°
- *top* — Siku fleksi penuh, barbell terangkat ke dada atas, lengan atas tetap fixed di samping
  - Sudut sendi: elbow: 30-45°

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari dumbbell curl: SATU barbell lurus dipegang dua tangan (bukan dua dumbbell terpisah), kedua lengan bergerak SIMETRIS bersamaan.

**🤖 Prompt generate (siap pakai):**
> Front-view minimalist figure standing, upper arms fixed at sides, curling a straight barbell with both hands up toward the upper chest by bending elbows, then lowering, loop. Flat vector, transparent background, lime green accent on barbell.

### `cable-curl` — Cable Bicep Curl

**Ciri visual paling diagnostik:** Berdiri menghadap cable rendah, lengan atas fixed di samping, menekuk siku menarik bar/handle cable ke atas

**Fase gerakan:**

- *bottom* — Lengan lurus ke bawah memegang handle cable dari bawah, lengan atas fixed di samping
  - Sudut sendi: elbow: 170-180°
- *top* — Siku fleksi penuh, handle tertarik ke dada atas/bahu
  - Sudut sendi: elbow: 30-45°

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari barbell/dumbbell curl: cable line dari BAWAH (low pulley), memberikan tension konstan sepanjang gerakan termasuk di posisi bawah — visual cable line vertikal dari lantai.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing facing a low cable pulley, upper arms fixed at sides, curling the cable handle up toward the chest by bending elbows, then lowering with constant tension, loop. Flat vector, transparent background, lime green accent on cable handle and line.

### `preacher-curl` — Preacher Curl

**Ciri visual paling diagnostik:** Lengan atas disandarkan/ditopang penuh pada bangku miring (preacher bench) di depan tubuh, menekuk siku mengangkat dumbbell/barbell

**Fase gerakan:**

- *bottom* — Lengan atas bersandar di preacher bench miring, lengan terentang ke bawah hampir lurus
  - Sudut sendi: elbow: 150-170°, upper_arm_support: fully braced on angled pad
- *top* — Siku fleksi penuh, beban terangkat, lengan atas tetap bersandar di pad
  - Sudut sendi: elbow: 40-60°

**⚠️ Catatan kritis (jangan sampai salah):** Ciri WAJIB: lengan atas bersandar penuh pada PREACHER BENCH yang miring (angled pad) di depan tubuh — pelaku biasanya duduk/berdiri di belakang bench dengan lengan ke depan-bawah di atas pad.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure with upper arms resting fully on an angled preacher bench pad in front of the body, curling a barbell or dumbbell up by bending the elbows, then lowering, loop. Flat vector, transparent background, lime green accent on the weight.

### `incline-dumbbell-curl` — Incline Dumbbell Curl

**Ciri visual paling diagnostik:** Duduk/berbaring di incline bench dengan badan miring ke belakang, lengan menggantung lurus ke bawah di samping, menekuk siku mengangkat dumbbell

**Fase gerakan:**

- *bottom* — Berbaring di incline bench, lengan menggantung lurus ke bawah ke belakang badan (full stretch)
  - Sudut sendi: elbow: 175-180°, shoulder: extended behind torso line
- *top* — Siku fleksi penuh, dumbbell terangkat ke bahu
  - Sudut sendi: elbow: 30-45°

**⚠️ Catatan kritis (jangan sampai salah):** Posisi badan BERSANDAR di incline bench (miring ke belakang ~45-60°) dengan lengan menggantung BEBAS ke bawah di belakang garis badan — ini memberikan stretch ekstra di bawah, ciri visual utama.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying back on an inclined bench, arms hanging straight down behind the body line, curling dumbbells up toward the shoulders, then lowering for a full stretch, loop. Flat vector, transparent background, lime green accent on dumbbells.

### `incline-hammer-curl` — Incline Hammer Curl

**Ciri visual paling diagnostik:** Sama seperti incline dumbbell curl tapi grip neutral (telapak menghadap ke dalam) sepanjang gerakan

**Fase gerakan:**

- *bottom* — Berbaring di incline bench, lengan menggantung lurus ke bawah, grip neutral (vertikal)
  - Sudut sendi: elbow: 175-180°, wrist: neutral grip
- *top* — Siku fleksi penuh, dumbbell terangkat ke bahu, grip tetap neutral
  - Sudut sendi: elbow: 30-45°

**⚠️ Catatan kritis (jangan sampai salah):** Kombinasi dua ciri: posisi incline bench (badan miring bersandar) DAN grip neutral (seperti hammer curl) — kedua elemen ini harus tervisualisasi bersamaan.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying back on an inclined bench, arms hanging straight down, curling dumbbells held with neutral grip (palms facing each other) up toward the shoulders, then lowering, loop. Flat vector, transparent background, lime green accent on dumbbells.


---


## 🦵 LEGS

### `squat` — Squat

**Ciri visual paling diagnostik:** Berdiri, jongkok dengan pinggul turun ke belakang-bawah dan lutut fleksi, dada tetap tegak, kembali berdiri — tanpa beban (bodyweight)

**Fase gerakan:**

- *top* — Berdiri tegak, lutut dan pinggul ekstensi penuh
  - Sudut sendi: hip: 175-180°, knee: 175-180°
- *bottom* — Pinggul turun ke belakang-bawah seperti duduk di kursi, lutut fleksi ~90° atau lebih dalam, dada tetap tegak, tumit tetap di lantai
  - Sudut sendi: hip: ~60-90° flexion, knee: ~80-100° flexion, spine: neutral upright

**⚠️ Catatan kritis (jangan sampai salah):** Tumit HARUS tetap menapak lantai (tidak jinjit), dada tegak (tidak membungkuk berlebihan ke depan), lutut sejajar arah jari kaki (tidak collapse ke dalam).

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing, squatting down with hips moving back and knees bending until thighs near parallel to floor, chest staying upright, heels planted, then standing back up, loop. Flat vector, transparent background, lime green accent on knee joints.

### `barbell-squat` — Barbell Squat

**Ciri visual paling diagnostik:** Sama seperti squat tapi dengan barbell diletakkan di belakang leher/trap atas (back squat), kedua tangan memegang bar di sisi

**Fase gerakan:**

- *top* — Berdiri tegak, barbell di belakang bahu/trap atas, lutut dan pinggul ekstensi penuh
  - Sudut sendi: hip: 175-180°, knee: 175-180°
- *bottom* — Jongkok dengan barbell tetap di belakang bahu, dada tegak, paha mendekati sejajar lantai
  - Sudut sendi: hip: ~60-90° flexion, knee: ~80-100° flexion

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari bodyweight squat: barbell terlihat jelas DI BELAKANG LEHER/bahu atas sepanjang gerakan, posisi ini harus stay fixed (tidak miring/jatuh ke depan).

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure with a barbell resting on the back of the shoulders, squatting down until thighs near parallel to floor with chest upright, then standing back up, loop. Flat vector, transparent background, lime green accent on the barbell.

### `lunge` — Lunge

**Ciri visual paling diagnostik:** Satu kaki melangkah jauh ke depan, kedua lutut menekuk turun sampai lutut belakang mendekati lantai, badan tegak vertikal

**Fase gerakan:**

- *standing* — Berdiri tegak, kedua kaki sejajar
  - Sudut sendi: knee: 175-180° both legs
- *lunge_down* — Satu kaki melangkah jauh ke depan, lutut depan fleksi ~90°, lutut belakang turun mendekati lantai, badan tetap tegak vertikal
  - Sudut sendi: front_knee: ~80-100°, back_knee: ~90-110°, torso: upright vertical

**⚠️ Catatan kritis (jangan sampai salah):** Satu kaki di DEPAN jauh dengan stance terbuka (split stance), lutut belakang turun mendekati lantai (bukan tetap tinggi), badan tetap tegak (tidak membungkuk ke depan).

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing, stepping one leg far forward and lowering until the front knee bends ~90° and the back knee drops near the floor, torso staying upright, then returning to standing, loop. Flat vector, transparent background, lime green accent on front knee joint.

### `glute-bridge` — Glute Bridge

**Ciri visual paling diagnostik:** Berbaring telentang, lutut fleksi kaki menapak lantai, mengangkat pinggul ke atas sampai badan membentuk garis lurus dari lutut ke bahu

**Fase gerakan:**

- *down* — Berbaring telentang, lutut fleksi, kaki menapak lantai, pinggul di lantai
  - Sudut sendi: hip: flexed, lying flat, knee: ~90° flexion
- *up* — Pinggul terangkat dari lantai sampai badan membentuk garis lurus dari lutut-pinggul-bahu, glutes terkontraksi
  - Sudut sendi: hip: 175-180° extension, knee: tetap ~90°

**⚠️ Catatan kritis (jangan sampai salah):** Posisi BERBARING TELENTANG (supine) di lantai adalah ciri utama. Hanya pinggul yang naik-turun, bahu dan kaki tetap di lantai sebagai titik tumpu fixed.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying on back with knees bent and feet flat on floor, lifting hips upward until body forms a straight line from knees to shoulders, then lowering, loop. Flat vector, transparent background, lime green accent on raised hips.

### `jump-squat` — Jump Squat

**Ciri visual paling diagnostik:** Squat turun lalu meledak melompat vertikal ke udara dengan kedua kaki meninggalkan lantai, mendarat kembali ke posisi squat

**Fase gerakan:**

- *squat_down* — Posisi squat dengan lutut fleksi, siap meledak
  - Sudut sendi: knee: ~90-100° flexion
- *airborne* — Kedua kaki melompat lepas dari lantai, badan ekstensi penuh di udara
  - Sudut sendi: knee: extended, feet off ground, hip: extended
- *landing* — Mendarat kembali ke posisi squat, lutut fleksi menyerap impact
  - Sudut sendi: knee: ~90° flexion absorbing landing

**⚠️ Catatan kritis (jangan sampai salah):** Ciri WAJIB yang membedakan dari squat biasa: fase AIRBORNE dengan kedua kaki jelas terlepas dari lantai — ini elemen paling penting untuk recognisability instan sebagai gerakan plyometric.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure squatting down then explosively jumping straight up with both feet leaving the ground, body extending fully in mid-air, then landing back into a squat absorbing impact, loop. Flat vector, transparent background, lime green accent on figure during the airborne phase.

### `single-leg-squat` — Pistol Squat

**Ciri visual paling diagnostik:** Berdiri satu kaki, kaki lain terangkat lurus ke depan sejajar lantai, jongkok turun penuh dengan satu kaki sambil kaki lain tetap terangkat lurus

**Fase gerakan:**

- *top* — Berdiri satu kaki, kaki lain terangkat lurus ke depan, lengan bisa terentang untuk balance
  - Sudut sendi: standing_knee: 175-180°, lifted_leg: extended forward, hip flexed ~80-90°
- *bottom* — Jongkok penuh dalam pada satu kaki, kaki yang terangkat tetap lurus terjulur ke depan tidak menyentuh lantai
  - Sudut sendi: standing_knee: deep flexion <60°, lifted_leg: tetap lurus terjulur ke depan

**⚠️ Catatan kritis (jangan sampai salah):** Ciri PALING diagnostik: SATU kaki menjulur lurus ke depan tidak menyentuh lantai sepanjang gerakan, sementara kaki lain melakukan deep squat penuh sendirian — sangat unik secara visual, jangan sampai terlihat seperti squat biasa.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure balancing on one leg, the other leg extended straight forward off the ground, performing a deep single-leg squat down and up while the extended leg stays straight throughout, arms forward for balance, loop. Flat vector, transparent background, lime green accent on standing knee.

### `calf-raise` — Calf Raise

**Ciri visual paling diagnostik:** Berdiri tegak, badan lurus dari kepala ke kaki, hanya tumit yang naik-turun mengangkat badan dengan jinjit

**Fase gerakan:**

- *down* — Berdiri tegak, tumit menapak lantai penuh
  - Sudut sendi: ankle: neutral, heel down
- *up* — Tumit terangkat tinggi dari lantai, berdiri jinjit di ujung kaki, badan tetap lurus vertikal
  - Sudut sendi: ankle: plantarflexion maksimal, heel high

**⚠️ Catatan kritis (jangan sampai salah):** Satu-satunya gerakan adalah di PERGELANGAN KAKI (ankle) — lutut dan pinggul tetap lurus statis sepanjang gerakan, badan keseluruhan naik-turun sedikit secara vertikal karena tumit terangkat.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing straight, body rising slightly as heels lift high off the ground onto tiptoes, knees and hips staying straight, then lowering heels back down, loop. Flat vector, transparent background, lime green accent on heels/ankles.

### `bulgarian-split-squat` — Bulgarian Split Squat

**Ciri visual paling diagnostik:** Satu kaki belakang diletakkan di atas bench tinggi (punggung kaki di atas bench), kaki depan melakukan squat turun-naik sendirian

**Fase gerakan:**

- *top* — Berdiri pada kaki depan, kaki belakang (punggung kaki) bertumpu di atas bench tinggi di belakang
  - Sudut sendi: front_knee: 175-180°, back_foot: elevated on bench behind
- *bottom* — Lutut depan fleksi turun dalam, lutut belakang mendekati lantai, kaki belakang tetap di atas bench
  - Sudut sendi: front_knee: ~80-100° flexion

**⚠️ Catatan kritis (jangan sampai salah):** Ciri WAJIB: KAKI BELAKANG terangkat/bertumpu di atas BENCH TINGGI di belakang tubuh (punggung kaki, bukan tumit) — ini pembeda visual utama dari lunge biasa yang kedua kaki di lantai.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure in a split stance with the rear foot elevated on top of a bench behind, front leg bending down into a deep lunge then pressing back up, loop. Flat vector, transparent background, lime green accent on front knee.

### `leg-press` — Leg Press

**Ciri visual paling diagnostik:** Duduk/berbaring miring di mesin leg press, kaki mendorong platform jauh di depan dengan menekuk-meluruskan lutut

**Fase gerakan:**

- *bottom* — Duduk di mesin dengan sandaran miring, lutut fleksi mendekati dada, kaki menapak platform
  - Sudut sendi: knee: ~80-100° flexion
- *top* — Lutut ekstensi mendorong platform jauh, kaki hampir lurus (tidak lock penuh)
  - Sudut sendi: knee: ~160-170° (slight bend, not locked)

**⚠️ Catatan kritis (jangan sampai salah):** Posisi DUDUK/BERBARING bersandar di mesin dengan platform yang didorong oleh kaki adalah ciri utama — badan tidak bergerak, hanya kaki yang fleksi-ekstensi mendorong beban di rel.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure seated reclined in a leg press machine, feet on a platform, pushing the platform away by extending the knees then bringing it back by bending knees, loop. Flat vector, transparent background, lime green accent on the platform.

### `leg-extension` — Leg Extension

**Ciri visual paling diagnostik:** Duduk di mesin dengan punggung tegak, kaki di bawah pad, mengangkat/meluruskan lutut ke depan-atas melawan tahanan pad

**Fase gerakan:**

- *bottom* — Duduk tegak, lutut fleksi ~90°, pad bertumpu di depan tulang kering bawah
  - Sudut sendi: knee: ~90° flexion
- *top* — Lutut ekstensi penuh mengangkat pad ke depan-atas, kaki hampir lurus
  - Sudut sendi: knee: 170-180°

**⚠️ Catatan kritis (jangan sampai salah):** Posisi duduk TEGAK (badan tidak bergerak, fixed di kursi mesin), hanya tungkai bawah yang bergerak fleksi-ekstensi dari lutut — gerakan ini isolasi murni quadriceps, bukan compound.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure seated upright in a leg extension machine, lower legs hooked under a padded bar, extending the knees to lift the pad up and forward, then lowering, loop. Flat vector, transparent background, lime green accent on the pad.

### `leg-curl` — Leg Curl

**Ciri visual paling diagnostik:** Berbaring tengkurap (atau duduk) di mesin, menekuk lutut menarik tumit ke arah pantat melawan tahanan pad

**Fase gerakan:**

- *start* — Berbaring tengkurap, kaki lurus, pad bertumpu di belakang tumit/betis bawah
  - Sudut sendi: knee: 170-180°
- *curled* — Lutut fleksi penuh menarik tumit ke arah pantat
  - Sudut sendi: knee: ~40-60° flexion

**⚠️ Catatan kritis (jangan sampai salah):** Posisi BERBARING TENGKURAP (prone) di mesin adalah varian paling umum — gerakan murni fleksi lutut menarik tumit ke pantat, paha tetap menempel di pad mesin (tidak terangkat).

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying face-down on a leg curl machine, curling the heels up toward the glutes by bending the knees, then extending back down, loop. Flat vector, transparent background, lime green accent on the ankle pad.

### `hack-squat` — Hack Squat

**Ciri visual paling diagnostik:** Bersandar miring di mesin hack squat (badan menempel platform bersudut), kaki mendorong turun-naik dengan punggung dan bahu tertahan pad

**Fase gerakan:**

- *top* — Berdiri bersandar di platform mesin yang miring, lutut hampir ekstensi penuh
  - Sudut sendi: knee: 160-180°
- *bottom* — Lutut fleksi dalam, badan turun mengikuti rel mesin yang miring, punggung tetap menempel pad
  - Sudut sendi: knee: ~70-90° flexion

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari leg press: badan dalam posisi BERDIRI/bersandar miring pada rel mesin (bukan duduk reclined), bergerak naik-turun mengikuti jalur diagonal mesin, bahu tertahan pad di atas.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure standing braced against an angled hack squat machine, shoulders under pads, sliding down along the diagonal rail by bending the knees deeply, then pressing back up, loop. Flat vector, transparent background, lime green accent on knee joints.

### `barbell-hip-thrust` — Hip Thrust

**Ciri visual paling diagnostik:** Punggung atas bersandar di bench, barbell di atas pinggul, kaki menapak lantai lutut fleksi, mendorong pinggul naik-turun

**Fase gerakan:**

- *down* — Punggung atas di bench, pinggul turun mendekati lantai, barbell di atas pinggul
  - Sudut sendi: hip: flexed, knee: ~90° flexion
- *up* — Pinggul terdorong naik sampai badan membentuk garis lurus dari lutut-pinggul-bahu, barbell terangkat
  - Sudut sendi: hip: 175-180° extension, knee: tetap ~90°

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari glute bridge: PUNGGUNG ATAS bersandar di BENCH (bukan di lantai), dan ada BARBELL di atas pinggul sebagai beban — setup ini lebih advance secara visual jelas berbeda.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure with upper back resting against a bench, a barbell positioned over the hips, feet flat on floor with knees bent, thrusting hips upward until body forms a straight line, then lowering, loop. Flat vector, transparent background, lime green accent on the barbell.

### `step-up` — Step-Up

**Ciri visual paling diagnostik:** Berdiri di depan box/platform tinggi, melangkah naik dengan satu kaki ke atas box sampai berdiri tegak penuh di atasnya, lalu turun kembali

**Fase gerakan:**

- *bottom* — Berdiri di lantai, satu kaki diletakkan di atas box/platform tinggi di depan
  - Sudut sendi: front_knee: ~80-90° flexion on box
- *top* — Badan terdorong naik penuh berdiri tegak di atas box dengan satu kaki, kaki lain menyusul naik
  - Sudut sendi: standing_knee: 175-180°

**⚠️ Catatan kritis (jangan sampai salah):** Box/platform yang TINGGI dan JELAS harus tervisualisasi sebagai elemen utama — gerakan naik penuh sampai berdiri tegak di atasnya (bukan cuma menyentuh), lalu turun terkontrol.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure stepping up onto a tall box/platform with one leg, pushing through to stand fully upright on top, then stepping back down, loop. Flat vector, transparent background, lime green accent on the box platform.

### `box-jump` — Box Jump

**Ciri visual paling diagnostik:** Berdiri di depan box, squat sedikit lalu melompat dengan kedua kaki ke atas mendarat berdiri di atas box

**Fase gerakan:**

- *load* — Squat sedikit bersiap meledak, lengan swing ke belakang
  - Sudut sendi: knee: ~110-130° flexion
- *airborne* — Kedua kaki melompat lepas dari lantai, badan terangkat melewati ketinggian box
  - Sudut sendi: hip: extending, knee: tucking up
- *landing* — Mendarat dengan kedua kaki di atas box, lutut fleksi menyerap impact, berdiri tegak
  - Sudut sendi: knee: absorbing then extending to stand

**⚠️ Catatan kritis (jangan sampai salah):** Box yang TINGGI harus tervisualisasi jelas, dan mendaratnya di ATAS box (bukan di lantai seperti jump squat) — ini pembeda kunci dari jump squat.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure crouching slightly then explosively jumping with both feet onto a tall box, landing on top of the box standing upright, loop. Flat vector, transparent background, lime green accent on the box edge.


---


## 🎯 CORE

### `plank` — Plank

**Ciri visual paling diagnostik:** Badan lurus horizontal bertumpu pada lengan bawah (forearm) dan ujung kaki, statis hold, garis tubuh lurus dari kepala ke tumit

**Fase gerakan:**

- *hold* — Bertumpu pada forearm dan ujung kaki, badan lurus dari kepala-pinggul-tumit, statis
  - Sudut sendi: elbow: ~90° (forearm flat on floor), hip: 175-180° straight, spine: neutral flat

**⚠️ Catatan kritis (jangan sampai salah):** Ini POSE STATIS — bertumpu pada LENGAN BAWAH (siku ~90°, forearm di lantai), bukan tangan lurus seperti push-up top. Garis tubuh harus benar-benar lurus, tidak sagging/piking. Bisa animasikan subtle breathing/shake untuk indikasi hold.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure holding a straight plank position supported on forearms and toes, body forming one straight line from head to heels, subtle shake/breathing to indicate a static hold, loop. Flat vector, transparent background, lime green accent outlining the straight body line.

### `hollow-body` — Hollow Body Hold

**Ciri visual paling diagnostik:** Berbaring telentang, punggung bawah menempel rapat ke lantai, lengan dan kaki terangkat membentuk bentuk 'pisang/hollow' melengkung

**Fase gerakan:**

- *hold* — Berbaring telentang, lower back menempel lantai (tidak ada gap), lengan terangkat ke atas kepala dan kaki terangkat lurus, membentuk lengkungan dangkal seperti perahu
  - Sudut sendi: spine: posterior pelvic tilt, lower back flat to floor, hip: slight flexion, legs raised, shoulder: overhead extended

**⚠️ Catatan kritis (jangan sampai salah):** Ciri WAJIB: punggung BAWAH menempel RAPAT ke lantai (tidak ada celah) — ini beda dari sit-up/superman. Bentuk keseluruhan badan seperti 'pisang' atau perahu dangkal, lengan dan kaki sama-sama terangkat.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying on back with lower back pressed flat to the floor, arms extended overhead and legs raised straight, body forming a shallow banana/boat curve, holding with subtle shake, loop. Flat vector, transparent background, lime green accent outlining the curved silhouette.

### `crunch` — Crunch

**Ciri visual paling diagnostik:** Berbaring telentang, lutut fleksi kaki menapak lantai, mengangkat kepala-bahu sedikit dari lantai (bukan duduk penuh), tangan di belakang kepala

**Fase gerakan:**

- *down* — Berbaring, kepala dan bahu di lantai, lutut fleksi kaki menapak
  - Sudut sendi: spine: flat on floor, knee: ~90° flexion
- *up* — Kepala dan bahu atas terangkat sedikit dari lantai (~30°), pinggul bawah TETAP di lantai
  - Sudut sendi: spine_flexion: upper spine curls ~30°, lower back stays down

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda KUNCI dari sit-up: hanya KEPALA dan BAHU ATAS yang terangkat sedikit (small range), PINGGUL dan punggung bawah TETAP menempel lantai sepanjang gerakan — ini bukan gerakan duduk penuh.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying on back with knees bent and feet flat, hands behind head, curling only the head and upper shoulders slightly off the floor while the lower back stays down, then lowering, loop. Flat vector, transparent background, lime green accent on upper torso lifting.

### `mountain-climber` — Mountain Climber

**Ciri visual paling diagnostik:** Posisi plank tinggi (tangan lurus), secara cepat dan bergantian menarik lutut ke arah dada seperti gerakan lari di tempat horizontal

**Fase gerakan:**

- *extended* — Posisi plank tinggi, satu kaki lurus ke belakang, kaki lain ditekuk ke depan dekat dada
  - Sudut sendi: elbow: 175-180°, front_knee: fleksi mendekati dada
- *switch* — Kaki bertukar cepat, kaki yang tadi belakang menarik ke depan dekat dada, kaki lain ekstensi ke belakang
  - Sudut sendi: alternating_hip_flexion: cepat dan dinamis

**⚠️ Catatan kritis (jangan sampai salah):** Posisi dasar PLANK TINGGI dengan tangan lurus (bukan forearm), dan kecepatan gerakan harus terlihat cepat/dinamis (seperti berlari secara horizontal) — bukan gerakan lambat terkontrol.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure in a high plank position with straight arms, rapidly and alternately driving knees up toward the chest like running horizontally, loop. Flat vector, transparent background, lime green accent on the driving knee.

### `leg-raise` — Leg Raise

**Ciri visual paling diagnostik:** Berbaring telentang, kaki lurus bersama-sama terangkat dari lantai ke atas (vertikal) lalu turun terkontrol, punggung bawah tetap menempel lantai

**Fase gerakan:**

- *down* — Kaki lurus di lantai/sedikit terangkat, punggung bawah menempel lantai
  - Sudut sendi: hip: near 0° (legs near floor)
- *up* — Kaki lurus terangkat vertikal ke atas (~90° dari lantai), punggung bawah tetap menempel rapat ke lantai
  - Sudut sendi: hip: ~80-90° flexion, knee: tetap lurus 170-180°

**⚠️ Catatan kritis (jangan sampai salah):** Kaki harus tetap LURUS (tidak menekuk lutut) sepanjang gerakan, dan punggung bawah HARUS tetap menempel lantai (tidak melengkung naik) — ini ciri form yang benar dan diagnostik visual penting.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure lying on back with arms at sides, legs straight, raising both legs together up to vertical while keeping lower back flat on the floor, then lowering with control, loop. Flat vector, transparent background, lime green accent on the raised legs.

### `russian-twist` — Russian Twist

**Ciri visual paling diagnostik:** Duduk dengan badan sedikit bersandar ke belakang, kaki terangkat dari lantai (atau menapak), memutar badan bagian atas bergantian ke kiri-kanan

**Fase gerakan:**

- *left* — Badan/tangan berputar ke sisi kiri, badan bersandar ~45° ke belakang, kaki terangkat
  - Sudut sendi: spine_rotation: rotated left, hip: flexed ~45°, feet off floor
- *right* — Badan/tangan berputar ke sisi kanan
  - Sudut sendi: spine_rotation: rotated right

**⚠️ Catatan kritis (jangan sampai salah):** Badan duduk bersandar ~45° ke belakang (V-sit-like), ROTASI badan bagian atas ke kiri-kanan bergantian adalah ciri paling diagnostik — kaki idealnya terangkat dari lantai untuk variasi penuh.

**🤖 Prompt generate (siap pakai):**
> Side or front-view minimalist figure seated leaning back at an angle with feet off the floor, rotating the upper torso and clasped hands side to side from left to right, loop. Flat vector, transparent background, lime green accent on hands tracing the twist.


---


## 🔥 CARDIO / COMPOUND

### `burpee` — Burpee

**Ciri visual paling diagnostik:** Sequence multi-fase: berdiri → jongkok tangan di lantai → tendang kaki ke belakang jadi plank/push-up → kembali jongkok → melompat berdiri dengan tangan ke atas

**Fase gerakan:**

- *standing* — Berdiri tegak, lengan di samping
  - Sudut sendi: hip: 175-180°, knee: 175-180°
- *squat_hands_down* — Jongkok cepat, tangan menyentuh lantai di depan kaki
  - Sudut sendi: knee: ~90° flexion, hip: flexed
- *plank_kick* — Kedua kaki menendang ke belakang dengan cepat, badan menjadi posisi plank/push-up
  - Sudut sendi: hip: extended, body: straight plank line
- *jump_up* — Kaki ditarik kembali ke jongkok lalu melompat tinggi berdiri dengan lengan terangkat ke atas
  - Sudut sendi: hip: extending to jump, knee: extending, shoulder: overhead at peak

**⚠️ Catatan kritis (jangan sampai salah):** Ini gerakan KOMPOSIT 4 fase berurutan — semua fase harus terlihat dalam satu loop untuk recognisability: berdiri-jongkok-plank kick-melompat. Jangan disederhanakan jadi cuma 2 fase, karena justru sequence inilah yang membuatnya instantly recognizable sebagai burpee.

**🤖 Prompt generate (siap pakai):**
> Side-view minimalist figure performing a full sequence: standing, dropping into a squat with hands on floor, kicking both legs back into a plank position, pulling legs back to squat, then jumping up with arms overhead, full loop. Flat vector, transparent background, lime green accent tracing the motion path.


---


## 🏆 CLASSIC PHYSIQUE (IFBB Mandatory Poses)

### `pose-front-double-biceps` — Front Double Biceps

**Ciri visual paling diagnostik:** Menghadap penuh ke depan (kamera), kedua lengan terangkat sejajar bahu membentuk huruf W/M, tinju mengarah ke atas, lats di-flare lebar

**Fase gerakan:**

- *pose* — Badan menghadap depan penuh, kedua siku terangkat setinggi bahu di samping kepala, lengan bawah tegak ke atas dengan tinju dikepalkan menghadap dalam, lats di-flare untuk memperlebar siluet, satu kaki sedikit ditekuk ke depan untuk definisi paha
  - Sudut sendi: shoulder: abducted ~90°, elbow at shoulder height, elbow: flexed ~90°, forearm vertical, fist: clenched, facing inward toward head, lats: maximally flared, torso: facing camera fully frontal

**⚠️ Catatan kritis (jangan sampai salah):** Ciri WAJIB: badan menghadap KAMERA SECARA PENUH (frontal), kedua siku setinggi bahu membentuk siluet W lebar, lats di-flare untuk memperlebar bagian tengah badan (V-taper terbalik sementara). Ini pose paling iconic bodybuilding — harus instant recognizable.

**🤖 Prompt generate (siap pakai):**
> Front-facing minimalist bodybuilder figure pose, both arms raised with elbows at shoulder height forming a wide W-shape, forearms vertical with clenched fists facing inward, lats flared wide, one leg slightly bent forward, static muscular pose held briefly with subtle flex animation, loop. Flat vector, transparent or #0a0a0a background, white/light-gray figure with lime green (#C8FF00) accent highlighting flexed biceps and flared lats.

### `pose-front-lat-spread` — Front Lat Spread

**Ciri visual paling diagnostik:** Menghadap depan, kedua tangan di pinggul dengan ibu jari mengarah ke belakang, siku ditarik ke depan, lats di-spread maksimal membentuk siluet sangat lebar di bagian tengah-atas

**Fase gerakan:**

- *pose* — Badan menghadap depan, kedua tangan diletakkan di pinggang dengan ibu jari menghadap ke belakang, siku ditarik maju ke depan, dada didorong keluar, lats di-spread selebar mungkin menciptakan siluet trapesium terbalik
  - Sudut sendi: hand_position: on hips, thumbs pointing back, elbow: drawn forward, lats: maximally spread, torso: facing camera fully frontal

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda KUNCI dari Front Double Biceps: TANGAN DI PINGGUL (bukan terangkat ke atas), siku ditarik ke DEPAN sehingga membuat lengan terlihat seperti 'sayap' dari samping. Siluet keseluruhan badan jadi sangat lebar di bagian punggung/lats, sempit di pinggang.

**🤖 Prompt generate (siap pakai):**
> Front-facing minimalist bodybuilder figure pose, both hands placed on the hips with thumbs pointing backward, elbows pulled forward like wings, chest pushed out, lats spread to maximum width creating a wide V-taper silhouette, static pose with subtle flex animation, loop. Flat vector, transparent background, lime green accent highlighting the spread lat muscles on the sides of the torso.

### `pose-side-chest` — Side Chest

**Ciri visual paling diagnostik:** Badan menyamping 90° ke kamera, satu lengan menekuk menyilang dada dengan tangan mengepal, lengan lain memegang pergelangan tangan yang menekuk untuk membantu menekan, dada didorong maju-atas

**Fase gerakan:**

- *pose* — Badan tegak menyamping penuh 90° ke kamera, lengan depan (sisi kamera) menekuk siku menyilang ke arah dada dengan tinju mengepal, tangan/lengan satunya dari belakang memegang pergelangan tangan tersebut untuk menambah tekanan, dada didorong ke depan-atas, kaki depan sedikit ditekuk
  - Sudut sendi: torso_rotation: 90° lateral to camera, front_elbow: flexed crossing chest, rear_hand: gripping front wrist for leverage, chest: pushed forward and up

**⚠️ Catatan kritis (jangan sampai salah):** Badan harus BENAR-BENAR menyamping 90° (profile penuh) ke kamera — ini ciri paling diagnostik, beda dari semua pose lain yang frontal. Satu lengan menyilang dada dengan bantuan tangan lain memegang pergelangan, menciptakan tekanan untuk memuncakkan dada dan bisep depan.

**🤖 Prompt generate (siap pakai):**
> Full side-profile (90°) minimalist bodybuilder figure pose, front arm bent crossing over the chest with a clenched fist, the other hand gripping the front wrist from behind for leverage, chest pushed forward and upward, front leg slightly bent, static pose with subtle flex animation, loop. Flat vector, transparent background, lime green accent highlighting the peaked chest and crossed arm.

### `pose-back-double-biceps` — Back Double Biceps

**Ciri visual paling diagnostik:** Sama seperti Front Double Biceps (kedua siku setinggi bahu, lengan bawah vertikal, tinju mengepal) tapi badan MEMBELAKANGI kamera, satu kaki ditarik ke belakang menunjukkan betis

**Fase gerakan:**

- *pose* — Badan membelakangi kamera penuh, kedua siku terangkat setinggi bahu membentuk W, lengan bawah vertikal dengan tinju mengepal, punggung di-flare lebar (lats dan punggung tengah), satu kaki ditarik ke belakang dengan tumit terangkat menunjukkan betis
  - Sudut sendi: torso: facing fully away from camera (back to viewer), shoulder: abducted ~90°, elbow: flexed ~90°, lats_and_back: maximally flared, rear_leg: drawn back, heel raised to flex calf

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda KUNCI dari Front Double Biceps: orientasi badan 180° terbalik — punggung yang menghadap kamera (bukan dada). Pose lengan identik (W-shape) tapi yang ditonjolkan adalah lebar dan detail otot punggung. Satu kaki ditarik ke belakang untuk pose betis tambahan.

**🤖 Prompt generate (siap pakai):**
> Back-facing minimalist bodybuilder figure pose (viewed from behind), both arms raised with elbows at shoulder height forming a wide W-shape with clenched fists, back and lats flared maximally wide, one leg drawn back with heel raised flexing the calf, static pose with subtle flex animation, loop. Flat vector, transparent background, lime green accent highlighting the flared back muscles.

### `pose-back-lat-spread` — Back Lat Spread

**Ciri visual paling diagnostik:** Sama seperti Front Lat Spread (tangan di pinggul, ibu jari ke belakang, siku ditarik maju) tapi badan MEMBELAKANGI kamera, menunjukkan lebar punggung dari belakang

**Fase gerakan:**

- *pose* — Badan membelakangi kamera, kedua tangan di pinggang dengan ibu jari menghadap belakang (ke arah badan), siku ditarik ke depan sehingga terlihat dari belakang seperti sayap, punggung dan lats di-spread maksimal
  - Sudut sendi: torso: facing fully away from camera, hand_position: on hips, thumbs pointing toward body, elbow: drawn forward, lats_and_back: maximally spread

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari Back Double Biceps: TANGAN DI PINGGUL (bukan terangkat), sama seperti Front Lat Spread tapi dilihat dari belakang. Siluet punggung jadi elemen visual utama — bagian terlebar dari pose manapun.

**🤖 Prompt generate (siap pakai):**
> Back-facing minimalist bodybuilder figure pose (viewed from behind), hands placed on hips with thumbs pointing toward the body, elbows pulled forward like wings seen from behind, back and lats spread to maximum width, static pose with subtle flex animation, loop. Flat vector, transparent background, lime green accent highlighting the wide back muscles.

### `pose-side-triceps` — Side Triceps

**Ciri visual paling diagnostik:** Badan menyamping 90° ke kamera, lengan belakang (sisi jauh dari kamera) diluruskan ke belakang badan menunjukkan triceps horseshoe, tangan dipegang oleh tangan lain dari depan

**Fase gerakan:**

- *pose* — Badan tegak menyamping 90° ke kamera, lengan yang jauh dari kamera diluruskan penuh ke belakang badan dengan triceps terkontraksi (horseshoe shape terlihat), tangan tersebut dipegang/ditarik sedikit oleh tangan yang lebih dekat kamera, dada/perut sedikit dikontraksikan, kaki depan ditekuk untuk definisi paha
  - Sudut sendi: torso_rotation: 90° lateral to camera, rear_arm: fully extended behind torso, tricep: maximally contracted, horseshoe visible, front_hand: assisting grip on rear wrist

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda KUNCI dari Side Chest: lengan LURUS/ekstensi penuh ke BELAKANG badan (bukan menekuk menyilang ke dada di depan) — fokus menunjukkan triceps horseshoe. Orientasi badan tetap sama-sama 90° menyamping, tapi arah lengan kerja berlawanan total.

**🤖 Prompt generate (siap pakai):**
> Full side-profile (90°) minimalist bodybuilder figure pose, the far arm fully extended straight behind the torso with the tricep maximally contracted showing a horseshoe shape, the near hand assisting by gripping the wrist, abs slightly contracted, front leg bent, static pose with subtle flex animation, loop. Flat vector, transparent background, lime green accent highlighting the contracted tricep.

### `pose-abs-thighs` — Abdominals & Thighs

**Ciri visual paling diagnostik:** Menghadap depan, kedua tangan di belakang kepala, badan melengkung sedikit ke depan (crunch position) menonjolkan abs, satu kaki melangkah ke depan menonjolkan paha

**Fase gerakan:**

- *pose* — Badan menghadap kamera, kedua tangan diletakkan di belakang kepala/leher, badan bagian atas sedikit membungkuk ke depan (crunch) untuk mengontraksikan abs, satu kaki melangkah ke depan dengan lutut sedikit ditekuk menunjukkan quad terkontraksi
  - Sudut sendi: torso: facing camera, slight forward flexion (crunch), hands: clasped behind head/neck, front_leg: stepped forward, knee slightly bent, abs: maximally contracted

**⚠️ Catatan kritis (jangan sampai salah):** Ciri WAJIB: tangan di BELAKANG KEPALA (bukan di pinggul atau terangkat ke samping), dan badan sedikit MEMBUNGKUK ke depan (crunch-like) untuk menonjolkan garis abs — ini satu-satunya pose dengan postur membungkuk ke depan secara sengaja, plus satu kaki melangkah maju jelas untuk paha.

**🤖 Prompt generate (siap pakai):**
> Front-facing minimalist bodybuilder figure pose, hands clasped behind the head/neck, upper torso slightly crunched forward to contract the abs, one leg stepped forward with knee slightly bent showing a flexed thigh, static pose with subtle flex animation, loop. Flat vector, transparent background, lime green accent highlighting the contracted abdominal muscles.

### `pose-most-muscular` — Most Muscular / Crab

**Ciri visual paling diagnostik:** Menghadap depan, badan sedikit condong ke depan, kedua siku ditarik turun ke arah pinggang/depan tubuh saling mendekat, traps dan dada di-flare maksimal membentuk siluet 'crab'

**Fase gerakan:**

- *pose* — Badan menghadap kamera dengan sedikit lean forward, kedua lengan ditarik ke bawah-dalam dengan siku mendekati satu sama lain di depan perut/pinggang (seperti mencengkeram sesuatu di depan tubuh), traps terangkat tinggi, dada dan punggung atas di-flare maksimal
  - Sudut sendi: torso: facing camera, slight forward lean, elbows: drawn down and inward, close together in front of waist, traps: maximally elevated, chest_and_upper_back: maximally flared

**⚠️ Catatan kritis (jangan sampai salah):** Ciri PALING khas: kedua siku ditarik ke BAWAH dan MENDEKAT satu sama lain di depan tubuh bagian bawah (bukan terangkat ke atas seperti double biceps) — ini menciptakan siluet 'crab' yang sangat berbeda dan traps terlihat sangat tinggi/menonjol di leher.

**🤖 Prompt generate (siap pakai):**
> Front-facing minimalist bodybuilder figure pose with a slight forward lean, both elbows pulled down and drawn close together in front of the waist as if gripping something, trapezius muscles maximally elevated near the neck, chest and upper back flared wide creating a crab-like silhouette, static pose with subtle flex animation, loop. Flat vector, transparent background, lime green accent highlighting the elevated traps.


---


## 🏆 MEN'S PHYSIQUE (IFBB Quarter Turns)

### `pose-mp-front` — Men's Physique Front

**Ciri visual paling diagnostik:** Berdiri rileks menghadap depan, satu tangan di pinggul, badan sedikit diputar membentuk pose santai (bukan flexing keras), menunjukkan V-taper alami

**Fase gerakan:**

- *pose* — Berdiri tegak rileks menghadap kamera, satu tangan diletakkan santai di pinggul, tangan lain menggantung rileks di samping, badan sedikit diputar/dimiringkan untuk menonjolkan V-taper dari pinggang ke bahu, ekspresi dan otot rileks (bukan flexing maksimal)
  - Sudut sendi: torso: facing camera, slight relaxed rotation, one_hand: resting casually on hip, other_arm: relaxed at side, overall_tension: low/relaxed compared to bodybuilding poses

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda PALING penting dari semua pose Classic Physique: postur RILEKS/santai (bukan flexing otot maksimal) — ini quarter-turn presentation style, menonjolkan bentuk tubuh natural, bukan kontraksi otot ekstrem. Hanya satu tangan di pinggul, tidak ada double-biceps atau lat spread.

**🤖 Prompt generate (siap pakai):**
> Front-facing minimalist figure standing relaxed, one hand resting casually on the hip, the other arm relaxed at the side, body angled slightly to show a natural V-taper physique, relaxed casual presentation pose (not maximal muscle flexing), subtle idle sway, loop. Flat vector, transparent background, lime green accent outlining the V-taper silhouette.

### `pose-mp-back` — Men's Physique Back

**Ciri visual paling diagnostik:** Sama seperti Men's Physique Front tapi badan membelakangi kamera, postur rileks menunjukkan punggung dan V-taper dari belakang

**Fase gerakan:**

- *pose* — Berdiri tegak rileks membelakangi kamera, satu tangan di pinggul, badan sedikit diputar, sedikit hip pop/menonjolkan bentuk punggung-pinggang secara natural, otot rileks tidak flexing maksimal
  - Sudut sendi: torso: facing away from camera, slight relaxed rotation, one_hand: resting on hip, hip: slight pop/shift to one side, overall_tension: low/relaxed

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari Back Double Biceps/Back Lat Spread: postur RILEKS (bukan flexing), tidak ada pose lengan dramatis — ini quarter-turn presentation, natural standing dengan sedikit hip pop untuk estetika.

**🤖 Prompt generate (siap pakai):**
> Back-facing minimalist figure standing relaxed (viewed from behind), one hand resting on the hip, body angled slightly with a subtle hip pop, relaxed casual presentation pose showing natural back V-taper, not maximal flexing, subtle idle sway, loop. Flat vector, transparent background, lime green accent outlining the back silhouette.

### `pose-mp-side` — Men's Physique Side

**Ciri visual paling diagnostik:** Badan menyamping 90° ke kamera, postur rileks dengan dada terangkat natural, satu tangan mungkin di pinggul, bukan flexing keras seperti Side Chest/Side Triceps

**Fase gerakan:**

- *pose* — Badan menyamping 90° ke kamera, berdiri tegak rileks dengan dada terangkat natural (chest up, good posture), satu tangan bisa diletakkan santai di pinggul atau menggantung rileks, tidak ada kontraksi otot ekstrem
  - Sudut sendi: torso_rotation: 90° lateral to camera, posture: chest up, relaxed natural stance, tension: low/relaxed compared to Side Chest or Side Triceps

**⚠️ Catatan kritis (jangan sampai salah):** Pembeda dari Side Chest/Side Triceps: postur RILEKS dengan dada terangkat secara natural (good posture), TIDAK ada lengan menyilang dada atau ekstensi triceps dramatis — cukup berdiri tegak menyamping menunjukkan profil tubuh natural.

**🤖 Prompt generate (siap pakai):**
> Full side-profile (90°) minimalist figure standing relaxed with chest naturally lifted and good posture, one hand resting casually on the hip or relaxed at the side, no dramatic arm flexing, natural presentation pose, subtle idle sway, loop. Flat vector, transparent background, lime green accent outlining the side body profile.


---
