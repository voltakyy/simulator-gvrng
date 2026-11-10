# 🤖 GvRng Studio — Web IDE & World Builder Guido van Robot NG

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-0066cc?style=for-the-badge&logo=github)](https://voltakyy.github.io/simulator-gvrng/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00a67e?style=for-the-badge)](LICENSE)
[![UMS Informatika](https://img.shields.io/badge/Informatika-UMS-blue?style=for-the-badge)](https://voltakyy.github.io/)

> **Simulator & Interactive World Builder Guido van Robot NG (GvRng) resmi.**  
> Dirancang khusus untuk mahasiswa dan praktikan Algoritma & Pemrograman (Alpro) agar dapat memecahkan masalah logika secara mandiri, interaktif, dan kompeten langsung dari smartphone (HP) maupun desktop laptop.

---

## 🌟 Fitur Unggulan

### 1. 🛠️ Interactive World Builder (Rancang Peta Kustom Bebas)
- **Gambar Tembok Titik-ke-Titik (Dot-to-Dot Walls)**: Cukup klik atau sentuh garis antar titik kisi untuk memasang atau melepas tembok horizontal dan vertikal.
- **Peletakan Robot & Beeper Intuitif**: Tentukan posisi awal robot `(x, y)`, arah hadap (`NORTH`, `EAST`, `SOUTH`, `WEST`), jumlah beeper di tas, dan beeper di setiap sudut labirin.
- **Ukuran Kisi Fleksibel**: Bebas mengubah dimensi labirin dari 5×5 hingga 35×35 avenues dan streets.
- **Dua Lapisan Desain**:
  - `🔵 Peta Awal (Initial State)`: Keadaan labirin saat program dimulai.
  - `🎯 Target Goal (Kondisi Selesai)`: Keadaan akhir yang harus dicapai agar misi dianggap **Selesai**.
- **Sinkronisasi Dua Arah Format `.gvrw`**: Teks kode `.gvrw` ter-update otomatis saat menggambar, dan sebaliknya!
- **Simpan ke Browser**: Simpan kreasi labirin buatanmu sendiri ke `localStorage`.

### 2. 🎮 Simulator IDE & Step Debugger Lengkap
- **Dukungan Penuh Sintaks GvRng**:
  - Perintah primitif: `move`, `turnleft`, `pickbeeper`, `putbeeper`, `turnoff`.
  - Struktur perulangan: `do <n>:`, `while <kondisi>:`.
  - Percabangan logika: `if <kondisi>:`, `elif <kondisi>:`, `else:`.
  - Subrutin / Fungsi kustom: `define <nama_fungsi>:`.
- **18 Sensor Otentik GvRng**:
  - `front_is_clear`, `front_is_blocked`, `left_is_clear`, `left_is_blocked`, `right_is_clear`, `right_is_blocked`.
  - `next_to_a_beeper`, `not_next_to_a_beeper`, `any_beepers_in_beeper_bag`, `no_beepers_in_beeper_bag`.
  - `facing_north`, `facing_east`, `facing_south`, `facing_west`, dan negasinya.
- **Kontrol Eksekusi Cepat**: `Run`, `Step` baris per baris, `Reset`, dan selektor kecepatan `1x` s/d `Max (60fps)`.
- **Tampilan Ganda (Dual View)**: `Simulasi Live`, `Target Output`, dan `Split View` berdampingan.

### 3. 📱 Keyboard Pembantu Virtual untuk Layar HP
- Mengetik sintaks GvRng di ponsel kini tanpa hambatan! Tombol bantuan cepat 1-sentuhan:
  `[move] [turnleft] [pickbeeper] [putbeeper] [turnoff] [do :] [while :] [if :] [else:] [front_is_clear] [next_to_a_beeper] [Tab ⇥]`

### 4. 🎯 Sistem Verifikasi Misi ("Cek Misi")
- Membandingkan hasil eksekusi kodemu terhadap target misi secara matematis.
- Mendeteksi tabrakan tembok, pengambilan beeper ilegal, atau posisi akhir robot.
- Menampilkan modal selebrasi dengan statistik langkah gerak, baris kode, dan efisiensi.

### 5. 📚 8 Misi Ujian Resmi Aslab & Kuis Interaktif 15 Soal
- Dilengkapi 8 studi kasus labirin resmi Quiz Dasprog B, Quiz Aslab, dan Diktat Praktikum Halaman 51–53 lengkap dengan kunci contekan terverifikasi.
- Modul Kuis Interaktif 15 soal logika pemrograman untuk melatih pemahaman alur eksekusi robot.

---

## 🚀 Menjalankan Secara Lokal

Cukup klon repositori dan buka file `index.html` di browser apa pun (Chrome, Edge, Firefox, Safari):

```bash
git clone https://github.com/voltakyy/simulator-gvrng.git
cd simulator-gvrng
# Buka di browser
start index.html  # Windows
# atau gunakan live-server
npx serve .
```

---

## 🎓 Pengembang & Kolaborasi

Inisiatif dikembangkan untuk mendukung praktikum mandiri mahasiswa:
- **Pengembang**: Rizky ([@voltakyy](https://github.com/voltakyy))
- **Dukungan**: Kelas B Informatika & Rekan Angkatan Informatika UMS
- **Portal Terpadu**: [Ruang Belajar Informatika UMS](https://voltakyy.github.io/)
