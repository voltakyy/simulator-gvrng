/**
 * Bank Soal Kuis Interaktif GvRng (Guido van Robot NG)
 * Mencakup 15 Soal Teruji Sesuai Silabus Praktikum Alpro Informatika UMS
 */

window.GVR_QUIZ_QUESTIONS = [
  // --- BAB 1: GERAK DASAR & KOORDINAT ---
  {
    id: 1,
    bab: 'Bab 1: Gerak Dasar & Orientasi',
    title: 'Orientasi dan Putaran Arah',
    question: 'Robot Guido mula-mula berada di koordinat (2, 3) menghadap ke arah TIMUR (EAST). Diberikan instruksi berikut:\n\nturnleft\nturnleft\nturnleft\n\nMenghadap ke manakah robot sekarang?',
    code: `turnleft\nturnleft\nturnleft`,
    options: [
      { text: 'UTARA (NORTH)', isCorrect: false },
      { text: 'BARAT (WEST)', isCorrect: false },
      { text: 'SELATAN (SOUTH)', isCorrect: true },
      { text: 'TIMUR (EAST)', isCorrect: false }
    ],
    explanation: 'Setiap perintah `turnleft` memutar robot 90 derajat berlawanan arah jarum jam (counter-clockwise). Jika robot menghadap East:\n1x turnleft → North\n2x turnleft → West\n3x turnleft → South. Jadi 3x turnleft sama dengan belok kanan (turnright).'
  },
  {
    id: 2,
    bab: 'Bab 1: Gerak Dasar & Orientasi',
    title: 'Perpindahan Koordinat Sumbu Kartesius',
    question: 'Posisi awal robot berada di koordinat (4, 5) menghadap ke UTARA (NORTH). Robot mengeksekusi instruksi berikut:\n\nmove\nmove\nturnleft\nmove\n\nDi manakah koordinat akhir robot?',
    code: `move\nmove\nturnleft\nmove`,
    options: [
      { text: '(3, 7)', isCorrect: true },
      { text: '(5, 7)', isCorrect: false },
      { text: '(4, 7)', isCorrect: false },
      { text: '(3, 5)', isCorrect: false }
    ],
    explanation: 'Awal di (4, 5) hadap North:\n- 2x `move` ke arah North menambah nilai y sebanyak 2: y = 5 + 2 = 7 → posisi (4, 7).\n- `turnleft` mengubah arah hadap dari North ke WEST.\n- 1x `move` ke arah West mengurangi nilai x sebanyak 1: x = 4 - 1 = 3.\nMaka koordinat akhir adalah (3, 7).'
  },
  {
    id: 3,
    bab: 'Bab 1: Gerak Dasar & Orientasi',
    title: 'Penanganan Beeper di Tas vs Dunia',
    question: 'Robot berada di sebuah petak yang memiliki 2 beeper. Tas robot mula-mula memiliki 0 beeper. Setelah mengeksekusi perintah:\n\npickbeeper\npickbeeper\nputbeeper\n\nBerapa jumlah beeper yang tersisa di tas robot dan di petak tersebut?',
    code: `pickbeeper\npickbeeper\nputbeeper`,
    options: [
      { text: 'Tas: 1 beeper, Petak: 1 beeper', isCorrect: true },
      { text: 'Tas: 2 beeper, Petak: 0 beeper', isCorrect: false },
      { text: 'Tas: 0 beeper, Petak: 2 beeper', isCorrect: false },
      { text: 'Terjadi Error karena tas kosong', isCorrect: false }
    ],
    explanation: 'Mula-mula: Petak = 2, Tas = 0.\n1. `pickbeeper` → Petak = 1, Tas = 1.\n2. `pickbeeper` → Petak = 0, Tas = 2.\n3. `putbeeper` → Petak = 1, Tas = 1.\nRobot berhasil menyimpan 1 beeper di tas dan meninggalkan 1 beeper di petak.'
  },

  // --- BAB 2: FUNGSI KUSTOM (DEFINE) ---
  {
    id: 4,
    bab: 'Bab 2: Fungsi Kustom (define)',
    title: 'Sintaks Penulisan Blok define',
    question: 'Di antara potongan kode GvRng berikut, manakah penulisan pembuatan fungsi yang BENAR sesuai aturan sintaks GvRng?',
    code: null,
    options: [
      {
        text: 'define turnright():\n    turnleft\n    turnleft\n    turnleft',
        isCorrect: false
      },
      {
        text: 'define turnright:\n    turnleft\n    turnleft\n    turnleft',
        isCorrect: true
      },
      {
        text: 'function turnright:\n    turnleft\n    turnleft\n    turnleft',
        isCorrect: false
      },
      {
        text: 'def turnright():\n    turnleft\n    turnleft\n    turnleft',
        isCorrect: false
      }
    ],
    explanation: 'Di GvRng (Guido van Robot NG), pembuatan fungsi menggunakan kata kunci `define` diikuti nama fungsi dan tanda titik dua `:` TANPA tanda kurung `()`. Format: `define <nama_fungsi>:`.'
  },
  {
    id: 5,
    bab: 'Bab 2: Fungsi Kustom (define)',
    title: 'Efisiensi Pemanggilan Fungsi do 3',
    question: 'Perhatikan fungsi berikut:\n\ndefine move3:\n    do 3:\n        move\n\nJika dipanggil:\ndo 4:\n    move3\n\nBerapa total langkah (move) yang dilakukan oleh robot?',
    code: `define move3:\n    do 3:\n        move\n\ndo 4:\n    move3`,
    options: [
      { text: '7 langkah', isCorrect: false },
      { text: '12 langkah', isCorrect: true },
      { text: '4 langkah', isCorrect: false },
      { text: '9 langkah', isCorrect: false }
    ],
    explanation: 'Setiap pemanggilan `move3` melakukan 3 kali `move`. Loop `do 4:` memanggil fungsi `move3` sebanyak 4 kali. Total langkah = 4 × 3 = 12 langkah.'
  },

  // --- BAB 3: LOOPING (DO vs WHILE) ---
  {
    id: 6,
    bab: 'Bab 3: Looping (do vs while)',
    title: 'Kasus Tumpukan Beeper Tak Tentu',
    question: 'Pada Soal 2 Quiz Aslab, di sebuah petak terdapat jumlah beeper yang tidak diketahui (bisa 1, 2, atau 3 beeper). Instruksi manakah yang paling tepat untuk mengosongkan seluruh beeper di petak tersebut?',
    code: null,
    options: [
      { text: 'pickbeeper', isCorrect: false },
      { text: 'do 3:\n    pickbeeper', isCorrect: false },
      { text: 'while next_to_a_beeper:\n    pickbeeper', isCorrect: true },
      { text: 'if next_to_a_beeper:\n    pickbeeper', isCorrect: false }
    ],
    explanation: 'Jika jumlah beeper bervariasi/tidak diketahui, `while next_to_a_beeper: pickbeeper` akan terus mengambil beeper hingga tidak ada lagi beeper di petak tersebut. `do 3:` berisiko error jika di petak tersebut hanya ada 1 beeper (karena mencoba pickbeeper saat petak sudah kosong).'
  },
  {
    id: 7,
    bab: 'Bab 3: Looping (do vs while)',
    title: 'Pencegahan Terjebak Infinite Loop',
    question: 'Perhatikan kode berikut di mana robot berada di ruangan tertutup tanpa beeper:\n\nwhile not_next_to_a_beeper:\n    turnleft\n\nApa yang akan terjadi pada robot?',
    code: `while not_next_to_a_beeper:\n    turnleft`,
    options: [
      { text: 'Robot belok 4 kali lalu berhenti', isCorrect: false },
      { text: 'Terjadi Infinite Loop (robot berputar selamanya tanpa henti)', isCorrect: true },
      { text: 'Muncul pesan Robot turned off', isCorrect: false },
      { text: 'Robot menabrak dinding', isCorrect: false }
    ],
    explanation: 'Karena robot tidak pernah berpindah ke petak yang ada beeper-nya (hanya memutar badan di tempat dengan `turnleft`), maka kondisi `not_next_to_a_beeper` akan SELALU bernilai True. Akibatnya terjadi loop tak terhingga (Infinite Loop).'
  },

  // --- BAB 4: SENSOR & PERCABANGAN (IF-ELSE) ---
  {
    id: 8,
    bab: 'Bab 4: Sensor & Percabangan',
    title: 'Sensor Dinding (front_is_clear)',
    question: 'Di depan robot persis terdapat dinding tebal. Kode berikut dieksekusi:\n\nif front_is_clear:\n    move\nelse:\n    turnleft\n    move\n\nManakah pernyataan yang BENAR?',
    code: `if front_is_clear:\n    move\nelse:\n    turnleft\n    move`,
    options: [
      { text: 'Robot akan menabrak dinding di depannya', isCorrect: false },
      { text: 'Blok if dijalankan dan blok else diabaikan', isCorrect: false },
      { text: 'Blok else dijalankan: robot belok kiri lalu melangkah jika sisi kiri tidak ada dinding', isCorrect: true },
      { text: 'Program langsung error pada baris pertama', isCorrect: false }
    ],
    explanation: 'Karena di depan robot ada dinding, kondisi `front_is_clear` bernilai False. Oleh karena itu, eksekusi melompat ke blok `else:`, robot berputar `turnleft` lalu melangkah (`move`). Ini adalah pola dasar untuk menghindari rintangan dinding.'
  },
  {
    id: 9,
    bab: 'Bab 4: Sensor & Percabangan',
    title: 'Trik Belok di Soal Spiral Pak Mukhlis',
    question: 'Pada Soal 1 Quiz Aslab (Spiral), kode 7 baris resmi berikut digunakan:\n\nwhile front_is_clear:\n    move\n    if next_to_a_beeper:\n        pickbeeper\n    if front_is_blocked:\n        turnleft\n\nMengapa kode ini berhasil berhenti saat mencapai tengah ruangan spiral?',
    code: `while front_is_clear:\n    move\n    if next_to_a_beeper:\n        pickbeeper\n    if front_is_blocked:\n        turnleft`,
    options: [
      { text: 'Karena robot kehabisan energi', isCorrect: false },
      { text: 'Di tengah spiral (jalan buntu), setelah robot turnleft depannya tetap terhalang dinding (front_is_blocked), sehingga while front_is_clear bernilai False dan loop berhenti', isCorrect: true },
      { text: 'Karena beeper di dunia sudah habis', isCorrect: false },
      { text: 'Karena otomatis ada perintah turnoff di dalam while', isCorrect: false }
    ],
    explanation: 'Pada lorong spiral, di sudut belokan biasa robot hanya terhalang di depan; setelah `turnleft`, depannya menjadi kosong (clear). Namun di pusat jalan buntu (dead-end) tengah spiral, setelah `turnleft` robot tetap menghadap dinding. Akibatnya saat `while front_is_clear` dicek kembali, nilainya False dan perulangan selesai dengan elegan!'
  },

  // --- BAB 5: ANALISIS EFISIENSI & KETENTUAN UJIAN ---
  {
    id: 10,
    bab: 'Bab 5: Analisis Efisiensi & Aturan Ujian',
    title: 'Aturan Batas Maksimal Baris Kode di Quiz Dasprog B',
    question: 'Pada Soal 1 Quiz Dasprog B (Robot Inspeksi Lorong Gedung), terdapat batasan ketentuan: "Program maksimal terdiri dari 35 baris kode". Bagaimanakah cara paling efektif memadatkan kode agar tidak melebihi kuota 35 baris?',
    code: null,
    options: [
      { text: 'Menghapus spasi indentasi', isCorrect: false },
      { text: 'Membuat fungsi modular dengan define dan perulangan while/do untuk pola lorong yang berulang', isCorrect: true },
      { text: 'Mengganti semua turnleft dengan move', isCorrect: false },
      { text: 'Menuliskan beberapa perintah dalam satu baris dengan tanda koma', isCorrect: false }
    ],
    explanation: 'Di GvRng, setiap perintah harus berada di baris tersendiri dengan indentasi Python yang disiplin. Cara mereduksi jumlah baris adalah dengan abstraksi fungsi (`define`) untuk aksi yang sering dipanggil (seperti `turnright` atau `susur_lorong`) dan menggunakan perulangan (`while` / `do`) untuk melintasi lintasan berulang.'
  },
  {
    id: 11,
    bab: 'Bab 5: Analisis Efisiensi & Aturan Ujian',
    title: 'Perbandingan Energi: Alternatif 1 vs Alternatif 2 (Buku Hal 53)',
    question: 'Pada Buku Praktikum hal 53 (Soal Mengelilingi 3 Kotak), catatan resmi aslab menyatakan:\n"Program pertama memiliki instruksi yang lebih sedikit, yaitu 20 baris. Pada program kedua, robot mengeksekusi 22 gerakan, sedangkan program pertama 26 gerakan."\n\nKesimpulan apakah yang didapat dari catatan tersebut?',
    code: null,
    options: [
      { text: 'Kode yang barisnya paling sedikit pasti selalu paling cepat dijalankan oleh robot', isCorrect: false },
      { text: 'Program kedua lebih hemat energi robot karena mengeksekusi pergerakan fisik yang lebih sedikit (22 gerakan vs 26 gerakan)', isCorrect: true },
      { text: 'Program kedua salah karena baris kodenya lebih panjang', isCorrect: false },
      { text: 'Kedua program memerlukan jumlah energi listrik yang persis sama', isCorrect: false }
    ],
    explanation: 'Dalam analisis algoritma praktikum, ada perbedaan antara "panjang kode sumber (LOC)" dengan "kompleksitas/langkah eksekusi runtime". Alternatif 2 menuliskan fungsi `circumference` yang lebih cerdas sehingga robot tidak melangkah mundur atau berputar berlebih, menghemat 4 gerakan fisik (22 vs 26).'
  },
  {
    id: 12,
    bab: 'Bab 3: Looping (do vs while)',
    title: 'Pola Papan Catur 4x4 (Quiz Aslab 3)',
    question: 'Pada Soal 3 Quiz Aslab, mengapa untuk menyusuri 4 baris papan catur digunakan kombinasi perulangan baris ganjil dan genap?',
    code: null,
    options: [
      { text: 'Karena di akhir baris ganjil robot berbelok ke kiri untuk naik ke baris berikutnya, sedangkan di akhir baris genap robot berbelok ke kanan', isCorrect: true },
      { text: 'Karena robot hanya boleh belok kiri', isCorrect: false },
      { text: 'Karena beeper hanya boleh diambil di baris genap', isCorrect: false },
      { text: 'Karena batas baris kode mewajibkan hanya 2 baris', isCorrect: false }
    ],
    explanation: 'Pola lintasan zig-zag horizontal (boustrophedon): baris 1 berjalan ke Timur, lalu belok kiri naik ke baris 2 (berjalan ke Barat). Di ujung baris 2, robot belok kanan untuk naik ke baris 3 (kembali berjalan ke Timur). Inilah yang membuat fungsi `next_row_left` dan `next_row_right` sangat efisien dibuat.'
  }
];

