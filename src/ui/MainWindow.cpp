#include "ui/MainWindow.h"

#include <QButtonGroup>
#include <QHBoxLayout>
#include <QLabel>
#include <QPushButton>
#include <QStackedWidget>
#include <QStringList>
#include <QVBoxLayout>

MainWindow::MainWindow(QWidget* parent)
    : QMainWindow(parent)
{
    setWindowTitle("FINORA - Personal Finance Manager");
    resize(1100, 700);
    setMinimumSize(900, 600);
    setupUi();
}

void MainWindow::setupUi()
{
    auto* central = new QWidget(this);
    central->setObjectName("central");

    auto* rootLayout = new QHBoxLayout(central);
    rootLayout->setContentsMargins(0, 0, 0, 0);
    rootLayout->setSpacing(0);

    // m_pages harus dibuat SEBELUM sidebar, karena sidebar menyambungkan
    // tombolnya ke m_pages.
    m_pages = new QStackedWidget(central);
    m_pages->addWidget(createPlaceholderPage("Dashboard"));
    m_pages->addWidget(createPlaceholderPage("Transaksi"));
    m_pages->addWidget(createPlaceholderPage("Anggaran"));
    m_pages->addWidget(createPlaceholderPage("Analitik"));

    rootLayout->addWidget(createSidebar());
    rootLayout->addWidget(m_pages, 1);  // angka 1 = area ini mengambil sisa ruang

    setCentralWidget(central);
}

QWidget* MainWindow::createSidebar()
{
    auto* sidebar = new QWidget(this);
    sidebar->setObjectName("sidebar");
    sidebar->setFixedWidth(220);

    auto* layout = new QVBoxLayout(sidebar);
    layout->setContentsMargins(16, 24, 16, 24);
    layout->setSpacing(8);

    auto* logo = new QLabel("FINORA", sidebar);
    logo->setObjectName("logo");
    layout->addWidget(logo);
    layout->addSpacing(16);

    m_navGroup = new QButtonGroup(this);
    m_navGroup->setExclusive(true);

    const QStringList items = {"Dashboard", "Transaksi", "Anggaran", "Analitik"};
    for (int i = 0; i < items.size(); ++i) {
        auto* button = new QPushButton(items.at(i), sidebar);
        button->setObjectName("navButton");
        button->setCheckable(true);
        button->setCursor(Qt::PointingHandCursor);
        m_navGroup->addButton(button, i);  // id tombol = nomor halaman
        layout->addWidget(button);
    }
    m_navGroup->button(0)->setChecked(true);

    // Signal/slot: saat tombol dengan id N diklik, tampilkan halaman ke-N.
    connect(m_navGroup, &QButtonGroup::idClicked,
            m_pages, &QStackedWidget::setCurrentIndex);

    layout->addStretch(1);  // mendorong isi berikutnya ke bawah

    auto* version = new QLabel("v0.1.0", sidebar);
    version->setObjectName("versionLabel");
    layout->addWidget(version);

    return sidebar;
}

QWidget* MainWindow::createPlaceholderPage(const QString& title)
{
    auto* page = new QWidget(m_pages);
    page->setObjectName("page");

    auto* layout = new QVBoxLayout(page);
    layout->setContentsMargins(32, 32, 32, 32);

    auto* titleLabel = new QLabel(title, page);
    titleLabel->setObjectName("pageTitle");

    auto* subtitle = new QLabel("Halaman ini akan dibangun pada modul berikutnya.", page);
    subtitle->setObjectName("pageSubtitle");

    layout->addWidget(titleLabel);
    layout->addWidget(subtitle);
    layout->addStretch(1);

    return page;
}
