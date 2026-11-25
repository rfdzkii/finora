cmake_minimum_required(VERSION 3.21)

project(FINORA VERSION 0.1.0 LANGUAGES CXX)

# --- Standar bahasa ---------------------------------------------------------
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# --- Otomatisasi Qt ---------------------------------------------------------
# AUTOMOC: menjalankan Meta-Object Compiler untuk kelas ber-Q_OBJECT
# AUTORCC: mengompilasi file .qrc (resource) ke dalam executable
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

# --- Dependensi -------------------------------------------------------------
# Modul 0 hanya butuh Widgets. Sql, Charts, dan Test ditambahkan di modul berikutnya.
find_package(Qt6 6.5 REQUIRED COMPONENTS Widgets)

# --- Target aplikasi --------------------------------------------------------
add_executable(FINORA WIN32
    src/main.cpp
    src/ui/MainWindow.h
    src/ui/MainWindow.cpp
    resources/resources.qrc
)

# Agar #include "ui/MainWindow.h" bisa ditulis relatif terhadap folder src/
target_include_directories(FINORA PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src)

target_link_libraries(FINORA PRIVATE Qt6::Widgets)

# Aktifkan peringatan compiler agar bug cepat ketahuan
if(MSVC)
    target_compile_options(FINORA PRIVATE /W4 /utf-8)
else()
    target_compile_options(FINORA PRIVATE -Wall -Wextra -Wpedantic)
endif()
