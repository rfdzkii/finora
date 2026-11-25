# FINORA - Personal Finance Manager

Aplikasi pengelolaan keuangan pribadi berbasis C++17 + Qt 6 untuk Windows.

**Status:** Modul 0 (skeleton) - jendela utama dengan sidebar dan tema dark.

## Prasyarat
- Qt 6.5 atau lebih baru (komponen: MinGW 64-bit atau MSVC 2019/2022, CMake, Ninja)
- CMake 3.21+

## Build (command line, contoh MinGW)
```
cmake -S . -B build -G Ninja -DCMAKE_PREFIX_PATH=C:/Qt/6.x.x/mingw_64
cmake --build build
build\FINORA.exe
```
Ganti `6.x.x` dengan versi Qt yang terpasang. Jika memakai Qt Creator, cukup buka `CMakeLists.txt` lalu pilih kit yang sesuai.

Panduan lengkap akan diperluas di modul-modul berikutnya.
