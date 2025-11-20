import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-900/20 p-4 backdrop-blur-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-200">Yasal Uyarı / Disclaimer</h3>
          <div className="mt-1 text-sm text-amber-200/80">
            <p>
              Bu proje eğitim ve bilgilendirme amaçlı geliştirilmiş bir yapay zeka uygulamasıdır.
              Burada sunulan veriler, analizler ve raporlar <strong>yatırım tavsiyesi değildir</strong>.
              Yapay zeka modelleri hata yapabilir. Yatırım kararlarınızı profesyonel finansal danışmanlar eşliğinde alınız.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
