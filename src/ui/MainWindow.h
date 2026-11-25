#pragma once

#include <QMainWindow>

class QButtonGroup;
class QStackedWidget;

// Jendela utama FINORA: sidebar navigasi di kiri, area halaman di kanan.
class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget* parent = nullptr);

private:
    void setupUi();
    QWidget* createSidebar();
    QWidget* createPlaceholderPage(const QString& title);

    QStackedWidget* m_pages = nullptr;    // tumpukan halaman (satu tampil sekaligus)
    QButtonGroup* m_navGroup = nullptr;   // mengelompokkan tombol sidebar
};
