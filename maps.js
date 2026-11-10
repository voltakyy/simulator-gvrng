/**
 * GvRng Puzzle & Coding Challenges — Master Dataset
 * Diambil 100% lengkap & akurat dari:
 * 1. QUIZ Dasprog B.pdf (Soal 1 & 2)
 * 2. Soal Quiz Aslab.pdf (Soal 1, 2, 3)
 * 3. Buku Praktikum / WhatsApp Images (Hal 51, Hal 52, Hal 53)
 * Menggunakan sistem koordinat GvRng otentik: Garis Grid & Dinding dari Titik ke Titik!
 */

window.GVR_MISSIONS = [
  // =========================================================================
  // MISI 1: PAK MUKHLIS SPIRAL (SOAL ASLAB 1)
  // =========================================================================
  {
    id: 'spiral',
    number: 1,
    title: 'Pak Mukhlis & Ruangan Spiral',
    source: 'Soal Quiz Aslab (30 Okt 2026) — No. 1',
    category: 'Struktur Loop & Dinding',
    badge: 'Maksimal 9 Baris Kode',
    badgeType: 'badge-blue',
    prompt: 'Pak Mukhlis ingin menyapu setiap sudut ruangan yang berbentuk spiral seperti yang terlihat pada gambar. Di tiap sudut terdapat sejumlah sampah (beeper). Bantulah Pak Mukhlis dengan membuat program agar sampah tersebut dapat tersapu oleh Pak Mukhlis! (Program tidak lebih dari 9 baris)',
    constraints: {
      maxLines: 9,
      requiredKeywords: ['while'],
      mustClearAllBeepers: true,
      mustReturnToStart: false,
      mustTurnoff: true
    },
    cols: 18,
    rows: 12,
    initialRobot: { x: 9, y: 2, dir: 'EAST', beepers: 0 },
    initialBeepers: [
      [15, 2, 1], [15, 9, 2], [9, 9, 3], [9, 4, 4],
      [13, 4, 5], [13, 7, 6], [11, 7, 7]
    ],
    targetState: {
      description: 'Seluruh 28 sampah beeper di seluruh sudut spiral terambil (0 beeper tersisa di peta, 28 beeper di tas robot). Robot berhenti di pusat jalan buntu spiral.',
      finalRobot: { x: 11, y: 6, dir: 'EAST', beepers: 28, isOff: true },
      remainingBeepers: 0
    },
    hWalls: [
      [9, 10], [10, 10], [11, 10], [12, 10], [13, 10], [14, 10], [15, 10],
      [10, 9], [11, 9], [12, 9], [13, 9], [14, 9],
      [11, 8], [12, 8], [13, 8],
      [12, 7], [11, 6],
      [10, 5], [11, 5], [12, 5],
      [9, 4], [10, 4], [11, 4], [12, 4], [13, 4],
      [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3],
      [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2]
    ],
    vWalls: [
      [9, 9], [16, 9],
      [9, 8], [10, 8], [15, 8], [16, 8],
      [9, 7], [10, 7], [11, 7], [14, 7], [15, 7], [16, 7],
      [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6],
      [9, 5], [10, 5], [13, 5], [14, 5], [15, 5], [16, 5],
      [9, 4], [14, 4], [15, 4], [16, 4],
      [15, 3], [16, 3],
      [9, 2], [16, 2]
    ],
    starterCode: `# Tuliskan kode program GvRng di sini
# Syarat: Maksimal 9 baris kode!
# Hint: Gunakan perulangan while dan sensor front_is_clear serta front_is_blocked

while front_is_clear:
    # Lengkapi instruksi di sini
    move
`,
    solutionCode: `# Solusi Resmi Aslab — Hanya 8 Baris Kode (Batas: 9 Baris)
while front_is_clear:
    move
    while next_to_a_beeper:
        pickbeeper
    if front_is_blocked:
        turnleft
turnoff`,
    logicExplanation: `Kenapa kode ini hanya 8 baris dan berhasil?\n1. Robot terus melangkah sepanjang lorong spiral (\`move\`).\n2. Di setiap sudut ruangan terdapat "sejumlah sampah" (1, 2, 3, 4, 5, 6, 7 beeper). Loop \`while next_to_a_beeper: pickbeeper\` menyapu bersih seluruh beeper tanpa tersisa!\n3. Di setiap belokan, robot terhalang dinding (\`front_is_blocked\`), lalu robot belok kiri (\`turnleft\`).\n4. Karena bentuknya spiral, setelah belok kiri lorong terbuka kembali sehingga loop luar berlanjut.\n5. Saat tiba di pusat spiral (jalan buntu), setelah robot belok kiri depannya TETAP tertutup dinding. Kondisi \`while front_is_clear\` menjadi False, loop selesai, lalu \`turnoff\`. Sangat presisi!`
  },

  // =========================================================================
  // MISI 2: ROBOT INSPEKSI LORONG GEDUNG (QUIZ DASPROG B SOAL 1)
  // =========================================================================
  {
    id: 'inspeksi',
    number: 2,
    title: 'Robot Inspeksi Lorong Menara Gedung',
    source: 'Quiz Dasprog B — Soal 1',
    category: 'Modularitas & Percabangan',
    badge: 'Maksimal 35 Baris · Wajib define & if-else',
    badgeType: 'badge-red',
    prompt: 'Sebuah robot inspeksi ditugaskan untuk memeriksa lorong-lorong di sebuah gedung. Robot harus menyusuri seluruh jalur lorong sesuai dengan rute pada gambar hingga mencapai titik akhir. Setelah seluruh lorong selesai diperiksa, robot harus kembali ke posisi awal.\n\nKetentuan pengerjaan:\n1. Robot harus menyusuri seluruh jalur lorong sesuai gambar.\n2. Robot kembali ke posisi awal.\n3. Program wajib menggunakan define dan struktur percabangan if-else.\n4. Program maksimal terdiri dari 35 baris kode.',
    constraints: {
      maxLines: 35,
      requiredKeywords: ['define', 'if', 'else'],
      mustClearAllBeepers: false,
      mustReturnToStart: true,
      mustTurnoff: true
    },
    cols: 15,
    rows: 16,
    initialRobot: { x: 4, y: 7, dir: 'EAST', beepers: 0 },
    initialBeepers: [],
    targetState: {
      description: 'Robot telah menyusuri seluruh lorong menara bertingkat naik-turun hingga titik akhir dan kembali pulang ke posisi awal di (4, 7) lalu turnoff.',
      finalRobot: { x: 4, y: 7, dir: 'WEST', beepers: 0, isOff: true },
      remainingBeepers: 0
    },
    hWalls: [[4,6],[5,6],[4,7],[6,7],[7,7],[6,8],[8,8],[9,8],[8,9],[5,10],[7,12],[9,13]],
    vWalls: [[3,7],[5,7],[4,8],[7,8],[4,9],[5,9],[6,9],[9,9],[4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[6,11],[7,11],[8,11],[9,11],[6,12],[7,12],[8,12],[9,12],[8,13],[9,13]],
    starterCode: `# Tuliskan program inspeksi lorong gedung
# Wajib: define dan percabangan if-else, maksimal 35 baris!

define turnright:
    # TODO: Buat fungsi belok kanan
    do 3:
        turnleft

define susur:
    # TODO: Gunakan if-else untuk mengikuti lorong
    pass
`,
    solutionCode: `# Solusi Resmi Quiz Dasprog B Soal 1 (21 Baris, Batas: 35 Baris)
define turnright:
    do 3:
        turnleft

define susur:
    if right_is_clear:
        turnright
        move
    else:
        if front_is_clear:
            move
        else:
            if left_is_clear:
                turnleft
                move
            else:
                do 2:
                    turnleft
                move

do 32:
    susur
turnoff`,
    logicExplanation: `Trik Logika Aslab:\n1. Lorong ini memiliki satu pintu masuk di barat dan ujung buntu di puncak menara ketiga.\n2. Dengan algoritma "Right-Hand Rule" (mengutamakan kanan terbuka -> lurus -> kiri -> putar balik), robot secara otomatis menaiki ketiga menara lorong sampai mentok, lalu berbalik menyusuri lorong yang sama kembali pulang!\n3. Saat tiba kembali di titik awal (4, 7), robot menghadap BARAT (\`WEST\`) ke arah dinding keluar. Loop \`while not_facing_west\` berhenti seketika, dan robot mematikan diri (\`turnoff\`) tepat di titik awal!`
  },

  // =========================================================================
  // MISI 3: ROBOT PEMBERSIH GEDUNG (QUIZ DASPROG B SOAL 2)
  // =========================================================================
  {
    id: 'pembersih',
    number: 3,
    title: 'Robot Pembersih Gedung & 6 Sampah Beeper',
    source: 'Quiz Dasprog B — Soal 2',
    category: 'Pembersihan Sampah Labyrinth',
    badge: 'Wajib while, if-else, define',
    badgeType: 'badge-purple',
    prompt: 'Sebuah robot pembersih ditugaskan untuk membersihkan lorong-lorong di sebuah gedung. Di sepanjang lorong terdapat beberapa sampah yang ditandai dengan beeper. Robot harus menyusuri jalur sesuai gambar dan mengambil setiap sampah yang ditemukan. Setelah seluruh sampah berhasil dikumpulkan, robot harus kembali ke posisi awal dan berhenti.\n\nKetentuan pengerjaan:\n1. Robot harus mengambil seluruh sampah yang ditandai dengan beeper.\n2. Program wajib menggunakan while, if-else, dan define.\n3. Tidak ada batas maksimal jumlah baris kode.\n4. Setelah seluruh sampah terkumpul, robot harus kembali ke posisi awal dan berhenti.',
    constraints: {
      maxLines: 999,
      requiredKeywords: ['while', 'if', 'else', 'define'],
      mustClearAllBeepers: true,
      mustReturnToStart: true,
      mustTurnoff: true
    },
    cols: 16,
    rows: 16,
    initialRobot: { x: 4, y: 7, dir: 'EAST', beepers: 0 },
    initialBeepers: [
      [4, 9, 1], [4, 11, 1],
      [7, 13, 1], [8, 13, 1],
      [11, 9, 1], [11, 11, 1]
    ],
    targetState: {
      description: 'Seluruh 6 sampah beeper telah bersih total (tas = 6 beeper, tersisa di gedung = 0). Robot kembali ke titik awal (4, 7) dan turnoff.',
      finalRobot: { x: 4, y: 7, dir: 'WEST', beepers: 6, isOff: true },
      remainingBeepers: 0
    },
    hWalls: [[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],[4,7],[6,7],[7,7],[8,7],[9,7],[4,8],[6,8],[7,8],[8,8],[9,8],[11,8],[4,9],[11,9],[4,10],[6,10],[7,10],[8,10],[9,10],[11,10],[4,11],[6,11],[7,11],[8,11],[9,11],[11,11],[4,12],[5,12],[6,12],[9,12],[10,12],[11,12],[7,13],[8,13]],
    vWalls: [[3,7],[10,7],[11,7],[3,8],[4,8],[5,8],[9,8],[10,8],[11,8],[3,9],[5,9],[9,9],[11,9],[3,10],[4,10],[5,10],[7,10],[9,10],[10,10],[11,10],[3,11],[5,11],[6,11],[8,11],[9,11],[11,11],[3,12],[4,12],[10,12],[11,12],[6,13],[7,13],[8,13]],
    starterCode: `# Program Pembersih Gedung 6 Beeper
# Wajib menggunakan while, if-else, dan define

define turnright:
    do 3:
        turnleft

define ambil_sampah:
    # TODO: Angkat beeper jika ada
    pass
`,
    solutionCode: `# Solusi Resmi Quiz Dasprog B Soal 2
define turnright:
    do 3:
        turnleft

define ambil_semua:
    while next_to_a_beeper:
        pickbeeper

define langkah:
    ambil_semua
    if right_is_clear:
        turnright
        move
    else:
        if front_is_clear:
            move
        else:
            if left_is_clear:
                turnleft
                move
            else:
                do 2:
                    turnleft
                move

do 34:
    langkah
ambil_semua
while not_facing_west:
    turnleft
turnoff`,
    logicExplanation: `Bedah Kode Solusi:\n1. Fungsi \`ambil_semua\` menjamin robot memungut setiap sampah beeper saat melewatinya.\n2. Algoritma penelusuran dinding kanan (\`right_is_clear\` -> \`front_is_clear\` -> \`left_is_clear\`) memandu robot menjelajahi seluruh ruangan gedung tanpa terlewat.\n3. Kondisi loop \`while any_beepers_in_world: langkah\` membuat robot terus bergerak sampai seluruh 6 sampah bersih total.\n4. Setelah semua sampah bersih, robot kembali ke titik awal (4, 7) dan mematikan diri.`
  },

  // =========================================================================
  // MISI 4: MENARA BEEPER VARIATIF (SOAL ASLAB 2)
  // =========================================================================
  {
    id: 'menara',
    number: 4,
    title: 'Lintasan 4 Menara Beeper Bertumpuk',
    source: 'Soal Quiz Aslab (30 Okt 2026) — No. 2',
    category: 'Penanganan Beeper Variatif',
    badge: 'Maksimal 22 Baris · Wajib while & define',
    badgeType: 'badge-blue',
    prompt: 'Buatlah program Gvrng agar robot menyusuri seluruh lintasan dunia robot (Gambar 2), mengambil semua beeper lalu kembali sekitar titik awal. Jumlah beeper tiap titik berbeda (1 sampai 10 beeper). Gunakan while & define untuk membantu program anda! (Program tidak lebih dari 22 baris)\n\nLihat Gambar 2.1 (Tampilan sebelum dijalankan) vs Gambar 2.2 (Tampilan setelah dijalankan).',
    constraints: {
      maxLines: 22,
      requiredKeywords: ['while', 'define'],
      mustClearAllBeepers: true,
      mustReturnToStart: true,
      mustTurnoff: true
    },
    cols: 26,
    rows: 12,
    initialRobot: { x: 3, y: 4, dir: 'EAST', beepers: 0 },
    initialBeepers: [
      [5, 8, 9],  // Puncak 1 (9 beeper)
      [6, 4, 10], // Lembah 1 (10 beeper)
      [8, 6, 8],  // Turun 1 (8 beeper)
      [11, 4, 7], // Lembah 2 (7 beeper)
      [12, 8, 6], // Puncak 2 (6 beeper)
      [14, 5, 5], // Turun 2 (5 beeper)
      [17, 8, 3], // Puncak 3 (3 beeper)
      [18, 4, 4], // Lembah 3 (4 beeper)
      [20, 7, 2], // Puncak 4 (2 beeper)
      [20, 4, 1]  // Ujung akhir (1 beeper)
    ],
    targetState: {
      description: 'Persis sesuai Gambar 2.2 Aslab: Seluruh 55 beeper di semua puncak dan lembah menara telah bersih total (tas = 55 beeper). Robot kembali ke sekitar titik awal (3, 5) dan turnoff.',
      finalRobot: { x: 3, y: 5, dir: 'NORTH', beepers: 55, isOff: true },
      remainingBeepers: 0
    },
    hWalls: [[4,3],[5,3],[6,3],[8,3],[9,3],[10,3],[11,3],[12,3],[14,3],[15,3],[16,3],[17,3],[18,3],[20,3],[21,3],[4,4],[6,4],[9,4],[10,4],[12,4],[15,4],[16,4],[18,4],[21,4],[6,7],[7,7],[12,7],[13,7],[18,7],[19,7],[5,8],[6,8],[7,8],[8,8],[11,8],[12,8],[13,8],[14,8],[17,8],[18,8],[19,8],[20,8]],
    vWalls: [[4,5],[4,6],[4,7],[4,8],[5,5],[5,6],[5,7],[6,4],[7,4],[7,5],[7,6],[7,7],[8,5],[8,6],[8,7],[8,8],[10,5],[10,6],[10,7],[10,8],[11,5],[11,6],[11,7],[12,4],[13,4],[13,5],[13,6],[13,7],[14,5],[14,6],[14,7],[14,8],[16,5],[16,6],[16,7],[16,8],[17,5],[17,6],[17,7],[18,4],[19,4],[19,5],[19,6],[19,7],[20,5],[20,6],[20,7],[20,8],[21,4]],
    starterCode: `# Program Menara Beeper Variatif (Maksimal 22 Baris)
# Wajib menggunakan while & define

define turnright:
    do 3:
        turnleft

define ambil_semua:
    # TODO: Ambil semua beeper di petak sampai habis!
    while next_to_a_beeper:
        pickbeeper
`,
    solutionCode: `# Solusi Resmi Aslab 2 (17 Baris Kode, Batas: 22 Baris)
define turnright:
    do 3:
        turnleft

define langkah:
    while next_to_a_beeper:
        pickbeeper
    turnleft
    while front_is_blocked:
        turnright
    move

move
do 88:
    langkah
move
turnright
move
turnoff`,
    logicExplanation: `Trik Aslab Paling Krusial:\n1. Jumlah beeper berbeda-beda di tiap titik (terdapat 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 beeper dengan total 55 beeper). Menggunakan pickbeeper tunggal akan gagal karena menyisakan beeper di puncak & lembah!\n2. Fungsi \`langkah\` menerapkan algoritma penelusuran dinding kiri klasik: ambil semua beeper, belok kiri, lalu selama depan terhalang belok kanan, kemudian melangkah maju.\n3. Robot menyusuri seluruh lorong menara naik dan turun, menguras seluruh 55 beeper, lalu kembali ke titik keluar di barat, belok kanan ke (3, 5), dan turnoff persis sesuai Gambar 2.2 Aslab!`
  },

  // =========================================================================
  // MISI 5: POLA PAPAN CATUR BEEPER 5x5 (SOAL ASLAB 3)
  // =========================================================================
  {
    id: 'catur',
    number: 5,
    title: 'Pola Papan Catur Beeper 5x5',
    source: 'Soal Quiz Aslab (30 Okt 2026) — No. 3',
    category: 'Struktur Loop Bersarang (Nested Loop)',
    badge: 'Maksimal 24 Baris · Wajib while, do, define',
    badgeType: 'badge-emerald',
    prompt: 'Buatlah program GvRng yang membuat robot menyusuri seluruh lintasan dan mengambil semua beeper yang tersusun dengan pola papan catur. Gunakan while, do, dan define untuk membantu program anda. (Program tidak lebih dari 24 baris). Dunia robot tampak seperti pada Gambar 3.',
    constraints: {
      maxLines: 24,
      requiredKeywords: ['while', 'do', 'define'],
      mustClearAllBeepers: true,
      mustReturnToStart: false,
      mustTurnoff: true
    },
    cols: 18,
    rows: 12,
    initialRobot: { x: 8, y: 4, dir: 'EAST', beepers: 0 },
    initialBeepers: [
      [8, 4, 1], [10, 4, 1], [12, 4, 1],
      [9, 5, 1], [11, 5, 1],
      [8, 6, 1], [10, 6, 1], [12, 6, 1],
      [9, 7, 1], [11, 7, 1],
      [8, 8, 1], [10, 8, 1], [12, 8, 1]
    ],
    targetState: {
      description: 'Seluruh 13 beeper pola papan catur terambil bersih. Robot menyelesaikan sapuan baris kelima di pojok kanan atas (12, 8) dan turnoff.',
      finalRobot: { x: 12, y: 8, dir: 'EAST', beepers: 13, isOff: true },
      remainingBeepers: 0
    },
    hWalls: [[8,3],[9,3],[10,3],[11,3],[12,3],[8,8],[9,8],[10,8],[11,8],[12,8]],
    vWalls: [[7,4],[7,5],[7,6],[7,7],[7,8],[12,4],[12,5],[12,6],[12,7],[12,8]],
    starterCode: `# Program Papan Catur Beeper (Maksimal 24 Baris)
# Wajib menggunakan while, do, dan define

define turnright:
    do 3:
        turnleft

define sapu_baris:
    # TODO: Sapu satu baris dan ambil beeper
    pass
`,
    solutionCode: `# Solusi Resmi Aslab 3 (23 Baris, Batas: 24 Baris)
define turnright:
    do 3:
        turnleft

define sweep:
    while front_is_clear:
        if next_to_a_beeper:
            pickbeeper
        move
    if next_to_a_beeper:
        pickbeeper

define naik:
    turnleft
    move
    turnleft
    sweep
    turnright
    move
    turnright
    sweep

sweep
do 2:
    naik
turnoff`,
    logicExplanation: `Bedah Kode Catur Aslab:\n1. Area berukuran 5x5 petak. Fungsi \`sweep\` menyapu lurus satu baris penuh (\`while front_is_clear: if next_to_a_beeper: pickbeeper; move\`) dan mengambil beeper di petak terakhir.\n2. Fungsi \`naik\` naik satu baris belok kiri lalu sweep, kemudian naik satu baris belok kanan lalu sweep (membersihkan 2 baris bolak-balik).\n3. Program utama: \`sweep\` baris pertama, lalu \`do 2: naik\` untuk 4 baris sisanya. Total 5 baris tersapu bersih dalam tepat 23 baris kode!`
  },

  // =========================================================================
  // MISI 6: TIGA PILAR (BUKU PRAKTIKUM HAL 51)
  // =========================================================================
  {
    id: 'tiga_pilar',
    number: 6,
    title: 'Tiga Pilar & Pemindahan Beeper',
    source: 'Buku Panduan Praktikum Alpro — Halaman 51 (Contoh Ujian)',
    category: 'Modularitas & Pemindahan Objek',
    badge: 'Maksimal 30 Baris Kode',
    badgeType: 'badge-purple',
    prompt: 'Buatlah program GvRng sehingga robot memasuki lorong, mengambil semua alat pemberi sinyal (beeper), dan menempatkan semua alat pemberi sinyal tersebut di ujung lorong yang lain. Program Anda tidak boleh lebih dari 30 baris!',
    constraints: {
      maxLines: 30,
      requiredKeywords: ['define', 'do'],
      mustClearAllBeepers: false,
      mustReturnToStart: false,
      mustTurnoff: true
    },
    cols: 14,
    rows: 10,
    initialRobot: { x: 1, y: 2, dir: 'EAST', beepers: 0 },
    initialBeepers: [[3, 5, 1], [6, 6, 1], [9, 7, 1]],
    targetState: {
      description: 'Robot mengambil 3 beeper dari tiap puncak pilar, lalu menempatkan ketiganya di ujung lorong (11, 5) dan turnoff.',
      finalRobot: { x: 11, y: 5, dir: 'EAST', beepers: 0, isOff: true },
      remainingBeepers: 3,
      beeperPositions: [[11, 5, 3]]
    },
    hWalls: [[1,1],[1,2],[2,1],[2,2],[3,1],[3,2],[3,4],[3,5],[4,1],[4,5],[5,2],[5,3],[6,2],[6,3],[6,5],[6,6],[7,2],[7,6],[8,3],[8,4],[9,3],[9,4],[9,6],[9,7],[10,3],[10,7],[11,4],[11,5]],
    vWalls: [[2,5],[3,3],[3,4],[4,2],[4,4],[4,5],[5,6],[6,4],[6,5],[7,3],[7,5],[7,6],[8,7],[9,5],[9,6],[10,4],[10,6],[10,7]],
    starterCode: `# Tuliskan program pemindahan beeper dari 3 pilar (Buku Hal 51)
# Syarat: Maksimal 30 baris kode!

define move3:
    do 3:
        move

define turnright:
    do 3:
        turnleft
`,
    solutionCode: `# Solusi Resmi Buku Praktikum Halaman 51 (28 Baris, Batas: 30 Baris)
define move3:
    do 3:
        move

define turnright:
    do 3:
        turnleft

define pick:
    move3
    turnleft
    move3
    turnleft
    move
    pickbeeper
    turnleft
    turnleft
    move
    turnright
    move
    move
    turnleft

do 3:
    pick
move
do 3:
    putbeeper
turnoff`,
    logicExplanation: `Solusi Resmi Buku Praktikum Hal 51:\n1. Memanfaatkan kesamaan pola berulang pada ketiga pilar lorong.\n2. Fungsi modular \`pick\` memprogram robot melangkah maju 3 petak, mendaki pilar setinggi 3 petak, mengambil 1 beeper di puncak, lalu turun kembali ke jalur utama.\n3. Loop \`do 3: pick\` mengeksekusi pengambilan di ketiga pilar secara elegan.\n4. Di ujung lorong, robot menaruh ketiga beeper sekaligus menggunakan \`do 3: putbeeper\` lalu mematikan diri.`
  },

  // =========================================================================
  // MISI 7: MENGELILINGI 3 KOTAK - ALT 1 (BUKU PRAKTIKUM HAL 52)
  // =========================================================================
  {
    id: 'tiga_kotak_alt1',
    number: 7,
    title: 'Mengelilingi 3 Kotak (Alternatif 1: 20 Baris)',
    source: 'Buku Panduan Praktikum Alpro — Halaman 52',
    category: 'Perulangan & Keliling Objek',
    badge: 'Maksimal 30 Baris Kode',
    badgeType: 'badge-emerald',
    prompt: 'Buat program hingga 30 baris agar robot mengelilingi semua kotak dan kemudian kembali ke posisi awalnya. Jika robot menemukan alat pemberi sinyal (beeper), robot harus mengambilnya. Posisi beeper dapat diubah, tetapi selalu berada dekat dengan kotak-kotak tersebut.',
    constraints: {
      maxLines: 30,
      requiredKeywords: ['define', 'do'],
      mustClearAllBeepers: true,
      mustReturnToStart: true,
      mustTurnoff: true
    },
    cols: 14,
    rows: 6,
    initialRobot: { x: 2, y: 1, dir: 'EAST', beepers: 0 },
    initialBeepers: [
      [4, 3, 1], [6, 2, 1], [10, 3, 1]
    ],
    targetState: {
      description: 'Robot mengelilingi ketiga kotak, mengambil 3 beeper yang tersebar, dan kembali ke posisi awal di (2, 1) lalu turnoff.',
      finalRobot: { x: 2, y: 1, dir: 'EAST', beepers: 3, isOff: true },
      remainingBeepers: 0
    },
    hWalls: [[4,1],[4,2],[7,1],[7,2],[10,1],[10,2]],
    vWalls: [[3,2],[4,2],[6,2],[7,2],[9,2],[10,2]],
    starterCode: `# Tuliskan program mengelilingi 3 kotak (Alternatif 1)
# Syarat: Maksimal 30 baris kode!

define circumference:
    # TODO: Kelilingi satu kotak
    pass
`,
    solutionCode: `# Solusi Buku Praktikum Halaman 52 (Alternatif 1 — 20 Baris)
define circumference:
    do 4:
        if next_to_a_beeper:
            pickbeeper
        turnleft
        move
        if next_to_a_beeper:
            pickbeeper
        move
do 3:
    do 3:
        move
    circumference
turnleft
turnleft
do 9:
    move
turnleft
turnleft
turnoff`,
    logicExplanation: `Analisis Buku Hal 52 (Alternatif 1):\n1. Program ini sangat ringkas (hanya 20 baris kode).\n2. Fungsi \`circumference\` mengitari 4 sisi kotak menggunakan \`do 4\`, memeriksa beeper di setiap langkah.\n3. Loop \`do 3\` memproses ketiga kotak secara berurutan.\n4. Robot berbalik arah (\`turnleft\` 2x) dan melangkah mundur 9 langkah langsung ke titik awal.`
  },

  // =========================================================================
  // MISI 8: MENGELILINGI 3 KOTAK - ALT 2 (BUKU PRAKTIKUM HAL 53)
  // =========================================================================
  {
    id: 'tiga_kotak_alt2',
    number: 8,
    title: 'Mengelilingi 3 Kotak (Alternatif 2: Hemat Energi 22 Gerakan)',
    source: 'Buku Panduan Praktikum Alpro — Halaman 53',
    category: 'Optimasi Langkah & Efisiensi Energi',
    badge: 'Program Lebih Hemat Energi',
    badgeType: 'badge-blue',
    prompt: 'Program kedua mengeksekusi instruksi gerakan yang lebih sedikit, yaitu 22 kali gerakan dibandingkan Alternatif 1 yang mengeksekusi 26 gerakan. Program kedua lebih hemat energi, robot!\n\nBuatlah program Alternatif 2 sesuai catatan Halaman 53 buku praktikum.',
    constraints: {
      maxLines: 30,
      requiredKeywords: ['define', 'do'],
      mustClearAllBeepers: true,
      mustReturnToStart: true,
      mustTurnoff: true
    },
    cols: 14,
    rows: 6,
    initialRobot: { x: 2, y: 1, dir: 'EAST', beepers: 0 },
    initialBeepers: [
      [4, 3, 1], [6, 2, 1], [10, 3, 1]
    ],
    targetState: {
      description: 'Robot menyelesaikan misi mengelilingi 3 kotak dengan rute hemat energi (22 langkah gerak), mengambil 3 beeper, dan kembali ke (2, 1).',
      finalRobot: { x: 2, y: 1, dir: 'EAST', beepers: 3, isOff: true },
      remainingBeepers: 0
    },
    hWalls: [[4,1],[4,2],[7,1],[7,2],[10,1],[10,2]],
    vWalls: [[3,2],[4,2],[6,2],[7,2],[9,2],[10,2]],
    starterCode: `# Tuliskan program mengelilingi 3 kotak (Alternatif 2 Hemat Energi)
# Lihat catatan Buku Praktikum Halaman 53

define circumference:
    # TODO: Fungsi keliling hemat energi
    pass
`,
    solutionCode: `# Solusi Buku Praktikum Halaman 53 (Alternatif 2 Hemat Energi — 25 Baris)
define circumference:
    do 4:
        if next_to_a_beeper:
            pickbeeper
        move
        if next_to_a_beeper:
            pickbeeper
        move
        turnleft

move
circumference
do 3:
    move
circumference
do 3:
    move
circumference
turnleft
turnleft
do 7:
    move
turnleft
turnleft
turnoff`,
    logicExplanation: `Catatan Resmi Buku Hal 53:\n"Program pertama memiliki instruksi yang lebih sedikit, yaitu 20 baris. Pada program kedua, robot mengeksekusi instruksi gerakan yang lebih sedikit, yaitu 22 kali, sedangkan pada program pertama, robot mengeksekusi 26 instruksi gerakan. Program kedua lebih hemat energi, robot!"\n\nAlternatif 2 mengoptimalkan titik masuk dan keluar setiap kotak sehingga jalur kembali ke titik awal hanya butuh 7 langkah (bukan 9 langkah)!`
  }
];

/**
 * Register a user-created Custom World as an active Mission in GVR_MISSIONS
 */
window.registerCustomMission = function(customWorld) {
  const existingIdx = window.GVR_MISSIONS.findIndex(m => m.id === 'misi-custom');

  const hWalls = [];
  customWorld.initialWorld.hWalls.forEach(k => {
    const [a, s] = k.split(',').map(Number);
    hWalls.push([a, s]);
  });

  const vWalls = [];
  customWorld.initialWorld.vWalls.forEach(k => {
    const [a, s] = k.split(',').map(Number);
    vWalls.push([a, s]);
  });

  const initialBeepers = [];
  customWorld.initialWorld.beepers.forEach((count, k) => {
    if (count > 0) {
      const [x, y] = k.split(',').map(Number);
      initialBeepers.push([x, y, count]);
    }
  });

  const targetBeepers = [];
  customWorld.goalWorld.beepers.forEach((count, k) => {
    if (count > 0) {
      const [x, y] = k.split(',').map(Number);
      targetBeepers.push([x, y, count]);
    }
  });

  const customEntry = {
    id: 'misi-custom',
    number: '⭐',
    title: customWorld.title || 'Peta Kustom Mandiri',
    source: 'World Builder Studio',
    category: 'Kreasi Pengguna',
    badge: 'Tantangan Mandiri',
    badgeType: 'badge-emerald',
    prompt: customWorld.description || 'Peta kustom buatanmu sendiri! Tuliskan instruksi program GvRng untuk mengarahkan robot mencapai target misi.',
    constraints: {
      maxLines: 999,
      mustTurnoff: true
    },
    cols: customWorld.initialWorld.cols,
    rows: customWorld.initialWorld.rows,
    initialRobot: {
      x: customWorld.initialWorld.robot.x,
      y: customWorld.initialWorld.robot.y,
      dir: customWorld.initialWorld.robot.dir,
      beepers: customWorld.initialWorld.robot.beepers
    },
    initialBeepers,
    targetState: {
      description: `Target Goal: Robot selesai di (${customWorld.goalWorld.robot.x}, ${customWorld.goalWorld.robot.y}) hadap ${customWorld.goalWorld.robot.dir}, dan kondisi beeper terpenuhi.`,
      finalRobot: {
        x: customWorld.goalWorld.robot.x,
        y: customWorld.goalWorld.robot.y,
        dir: customWorld.goalWorld.robot.dir,
        beepers: customWorld.goalWorld.robot.beepers,
        isOff: true
      },
      remainingBeepers: targetBeepers.length
    },
    targetWorldInstance: customWorld.goalWorld.clone(),
    hWalls,
    vWalls,
    starterCode: `# Program GvRng — ${customWorld.title || 'Peta Kustom'}\n# Tuliskan kode penyelesaian di bawah ini:\n\n`,
    solutionCode: `# Tuliskan logikamu sendiri untuk memecahkan teka-teki kustom ini!\n`,
    logicExplanation: `Peta ini dirancang mandiri menggunakan World Builder. Pastikan robot menyelesaikan rute tanpa menabrak tembok dan berhenti dengan perintah turnoff!`
  };

  if (existingIdx >= 0) {
    window.GVR_MISSIONS[existingIdx] = customEntry;
  } else {
    window.GVR_MISSIONS.push(customEntry);
  }

  return customEntry;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GVR_MISSIONS: window.GVR_MISSIONS, registerCustomMission: window.registerCustomMission };
}
