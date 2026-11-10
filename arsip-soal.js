/**
 * Praktikum Alpro GvRng — Arsip Soal Ujian & Pembahasan Resmi
 * Formatted from QUIZ Dasprog B, Soal Quiz Aslab, and Ujian Jangka Panjang
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('arsipSoalContainer');
  if (!container) return;

  const soalList = [
    {
      mapKey: 'spiral',
      title: 'Soal 1: Ruangan Spiral Pak Mukhlis (Quiz Aslab)',
      badge: 'Quiz Aslab 30 Okt 2026',
      badgeClass: 'badge-blue',
      constraints: [
        'Program tidak boleh lebih dari 9 baris kode (LOC <= 9).',
        'Robot harus menyapu semua sampah beeper di tiap sudut ruangan.',
        'Robot harus berhenti secara otomatis di tengah ruangan.'
      ],
      description: 'Pak Mukhlis ingin menyapu setiap sudut ruangan yang berbentuk spiral. Di tiap sudut terdapat sejumlah sampah (beeper). Program harus mengarahkan robot hingga semua beeper terambil dan berhenti di pusat spiral.',
      analysis: 'Kunci efisiensi 7 baris: Di lorong spiral, saat robot menabrak sudut dinding, robot cukup mengeksekusi `if front_is_blocked: turnleft`. Karena ini spiral, setelah belok kiri jalannya terbuka kembali! Loop `while front_is_clear:` baru akan berhenti ketika robot tiba di pusat jalan buntu (dead-end) spiral, di mana setelah belok kiri depannya tetap terhalang dinding.',
      code: `while front_is_clear:
    move
    if next_to_a_beeper:
        pickbeeper
    if front_is_blocked:
        turnleft
turnoff`
    },
    {
      mapKey: 'inspeksi',
      title: 'Soal 2: Robot Inspeksi Lorong Gedung (Quiz Dasprog B Soal 1)',
      badge: 'Quiz Dasprog B — Soal 1',
      badgeClass: 'badge-red',
      constraints: [
        'Program wajib menggunakan `define` dan percabangan `if-else`.',
        'Program maksimal terdiri dari 35 baris kode.',
        'Robot harus menyusuri seluruh jalur lorong sesuai gambar menara berundak.',
        'Robot harus kembali ke posisi awal di (4, 7).'
      ],
      description: 'Sebuah robot inspeksi ditugaskan memeriksa lorong-lorong menara berundak di sebuah gedung. Robot menyusuri seluruh rute menara naik-turun hingga mencapai titik akhir di (10, 8), lalu kembali melalui lorong dasar ke posisi awal.',
      analysis: 'Kunci efisiensi 26 baris: Mengabstraksikan fungsi `inspect_corridor` dengan sensor `right_is_clear`. Saat melangkah maju, jika ada belokan kanan robot masuk dan memeriksa lorong. Kembali ke posisi awal dilakukan secara direct menggunakan koridor bawah tanpa perlu mengulang rute menara.',
      code: `define turnright:
    do 3:
        turnleft
define turnaround:
    turnleft
    turnleft
define inspect_corridor:
    while front_is_clear:
        move
    if right_is_clear:
        turnright
        move
        if right_is_clear:
            turnright
        else:
            turnleft
    else:
        turnleft
while not_facing_south:
    inspect_corridor
while front_is_clear:
    move
turnright
while front_is_clear:
    move
turnright
turnoff`
    },
    {
      mapKey: 'pembersih',
      title: 'Soal 3: Robot Pembersih Gedung & Sampah Beeper (Quiz Dasprog B Soal 2)',
      badge: 'Quiz Dasprog B — Soal 2',
      badgeClass: 'badge-red',
      constraints: [
        'Robot harus mengambil seluruh sampah yang ditandai dengan beeper (6 titik).',
        'Program wajib menggunakan `while`, `if-else`, dan `define`.',
        'Tidak ada batas maksimal jumlah baris kode.',
        'Setelah seluruh sampah terkumpul, robot harus kembali ke posisi awal dan berhenti.'
      ],
      description: 'Robot pembersih membersihkan lorong persegi bertingkat dengan sampah beeper di 6 titik strategis. Robot bergerak teratur, mengambil beeper, dan kembali ke titik start (4, 7).',
      analysis: 'Wajib mengombinasikan `while` (untuk mengecek kondisi belum selesai), `if-else` (untuk memeriksa keberadaan beeper di petak dan mengecek persimpangan dinding), serta `define` untuk membuat fungsi pembersih modular.',
      code: `define turnright:
    do 3:
        turnleft
define check_and_pick:
    if next_to_a_beeper:
        pickbeeper
define step_and_clean:
    check_and_pick
    if front_is_clear:
        move
    else:
        turnright
        if front_is_clear:
            move
        else:
            turnright
while any_beepers_in_world:
    step_and_clean
while not_facing_south:
    turnleft
while front_is_clear:
    move
turnright
while front_is_clear:
    move
turnright
turnoff`
    },
    {
      mapKey: 'menara',
      title: 'Soal 4: Lintasan Menara Beeper Bertumpuk (Quiz Aslab Soal 2)',
      badge: 'Quiz Aslab 30 Okt 2026',
      badgeClass: 'badge-blue',
      constraints: [
        'Program tidak lebih dari 22 baris kode.',
        'Wajib menggunakan `while` & `define`.',
        'Jumlah beeper di tiap titik berbeda (bervariasi 1, 2, atau 3 beeper).',
        'Robot harus kembali sekitar titik awal.'
      ],
      description: 'Robot menyusuri 4 menara berulang dengan tumpukan beeper bervariasi di setiap puncak dan lembah lintasan.',
      analysis: 'Jebakan maut: Jika menggunakan `pickbeeper` biasa, tumpukan beeper bernilai 2 atau 3 tidak akan habis! Solusinya wajib mendefinisikan fungsi `ambil_semua` berisi `while next_to_a_beeper: pickbeeper`. Kode ini hanya memakan 18 baris (jauh di bawah batas 22 baris).',
      code: `define turnright:
    do 3:
        turnleft
define ambil_semua:
    while next_to_a_beeper:
        pickbeeper
define susur_menara:
    while front_is_clear:
        move
        ambil_semua
    if left_is_clear:
        turnleft
    else:
        turnright
while not_facing_west:
    susur_menara
while front_is_clear:
    move
turnoff`
    },
    {
      mapKey: 'catur',
      title: 'Soal 5: Pola Papan Catur Beeper 4x4 (Quiz Aslab Soal 3)',
      badge: 'Quiz Aslab 30 Okt 2026',
      badgeClass: 'badge-blue',
      constraints: [
        'Program tidak lebih dari 24 baris kode.',
        'Wajib menggunakan `while`, `do`, dan `define`.',
        'Beeper tersusun dengan pola papan catur (berselang-seling).'
      ],
      description: 'Menyusuri area 4x4 tertutup dinding dan mengumpulkan 8 beeper yang tersusun seperti petak catur.',
      analysis: 'Trik zig-zag baris: Fungsi `sweep_row` menyusuri satu baris penuh sambil memungut beeper jika ada (`if next_to_a_beeper: pickbeeper`). Lalu dibuat transisi baris ganjil (`next_row_left`) dan baris genap (`next_row_right`) agar baris kode tetap ringkas (hanya 20 baris).',
      code: `define turnright:
    do 3:
        turnleft
define pick_if_any:
    if next_to_a_beeper:
        pickbeeper
define sweep_row:
    while front_is_clear:
        pick_if_any
        move
    pick_if_any
define next_row_left:
    turnleft
    move
    turnleft
define next_row_right:
    turnright
    move
    turnright
sweep_row
next_row_left
sweep_row
next_row_right
sweep_row
next_row_left
sweep_row
turnoff`
    },
    {
      mapKey: 'tiga_kotak',
      title: 'Soal 6: Analisis Efisiensi Energi: Mengelilingi 3 Kotak (Buku Hal 52-53)',
      badge: 'Buku Praktikum — Hal 52-53',
      badgeClass: 'badge-green',
      constraints: [
        'Maksimal 30 baris kode.',
        'Mengelilingi 3 kotak balok dan mengambil beeper bila ditemukan.',
        'Membandingkan efisiensi: Baris Kode (LOC) vs Energi Langkah Fisik.'
      ],
      description: 'Materi ujian praktikum mendalam: Membandingkan Alternatif 1 (20 baris, 26 gerakan) versus Alternatif 2 (24 baris, 22 gerakan).',
      analysis: 'Catatan Resmi Aslab: "Program pertama memiliki instruksi yang lebih sedikit, yaitu 20 baris. Pada program kedua, robot mengeksekusi instruksi gerakan yang lebih sedikit, yaitu 22 kali, sedangkan program pertama 26 instruksi gerakan. Program kedua lebih hemat energi robot!"',
      code: `define circumference:
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
turnoff`
    }
  ];

  let html = '<div class="soal-card-wrapper">';

  soalList.forEach((soal, idx) => {
    const highlighted = soal.code.split('\n').map(l => GvrInterpreter.highlightLine(l)).join('\n');
    html += `
      <div class="soal-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span class="soal-header-badge ${soal.badgeClass}">${soal.badge}</span>
          <button class="btn-ctrl btn-step btn-test-map" data-map="${soal.mapKey}" style="padding: 0.35rem 0.8rem; font-size: 0.8rem;">
            🎮 Uji di Visualizer Simulator
          </button>
        </div>
        <h3 style="font-family: var(--display); font-size: 1.25rem; margin: 0 0 0.5rem; color: #1e293b;">${soal.title}</h3>
        <p style="color: var(--color-text-muted); font-size: 0.92rem; margin-bottom: 0.75rem;">${soal.description}</p>
        
        <div class="soal-constraints-list">
          <strong style="color: #0f172a; display: block; margin-bottom: 0.3rem;">📋 Ketentuan Pengerjaan:</strong>
          <ul style="margin: 0; padding-left: 1.25rem;">
            ${soal.constraints.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>

        <div class="analysis-tip-box">
          <strong>💡 Analisis Logika &amp; Trik Aslab:</strong>
          <p style="margin: 0.3rem 0 0;">${soal.analysis}</p>
        </div>

        <div style="margin-top: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <span style="font-size: 0.82rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Kode Solusi Resmi GvRng:</span>
            <span style="font-size: 0.78rem; color: #0284c7; font-weight: 600;">${GvrInterpreter.countEffectiveLines(soal.code)} Baris Efektif</span>
          </div>
          <pre class="code-solution-box"><code>${highlighted}</code></pre>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;

  // Click handler for "Uji di Visualizer Simulator" buttons
  const testBtns = container.querySelectorAll('.btn-test-map');
  testBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mapKey = btn.getAttribute('data-map');
      // Switch tab to Simulator
      const simTabBtn = document.querySelector('.nav-tab-btn[data-tab="tabSimulator"]');
      if (simTabBtn) simTabBtn.click();

      // Change select dropdown and load map
      const mapSelect = document.getElementById('mapSelect') || document.getElementById('puzzleSelect');
      if (mapSelect) {
        mapSelect.value = mapKey;
      }
      if (window.loadMapAndSolution) {
        window.loadMapAndSolution(mapKey);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
});

