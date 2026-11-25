#include <QApplication>
#include <QFile>
#include <QString>

#include "ui/MainWindow.h"

namespace {

QString loadStyleSheet(const QString& resourcePath)
{
    QFile file(resourcePath);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        qWarning("Gagal membuka stylesheet: %s", qPrintable(resourcePath));
        return QString();
    }
    return QString::fromUtf8(file.readAll());
}

} 

int main(int argc, char* argv[])
{
    QApplication app(argc, argv);

    QApplication::setApplicationName("FINORA");
    QApplication::setOrganizationName("FINORA");
    QApplication::setApplicationVersion("0.1.0");

    app.setStyleSheet(loadStyleSheet(":/styles/finora_dark.qss"));

    MainWindow window;
    window.show();

    return app.exec();  // menjalankan event loop sampai jendela ditutup
}
