export type Language = "en" | "tr";

export const translations = {
  en: {
    common: {
      signIn: "Sign In",
      signOut: "Sign Out",
      settings: "Settings",
      close: "Close",
      cancel: "Cancel",
      save: "Save Configuration",
      loading: "Loading...",
      error: "Error",
    },
    home: {
      subtitle: "MARKETMIND",
      title: "Multi-agent investment intelligence built for decisive portfolio moves.",
      description: "Combine live market data, AI-powered research, and risk discipline inside one orchestrated workflow.",
      recentAnalyses: "Recent analyses",
      noAnalyses: "Run your first analysis to see it appear here.",
      viewDashboard: "View dashboard →",
      searchPlaceholder: "Search symbol...",
      analyzeButton: "Analyze",
    },
    landing: {
      heroTitle: "AI-Powered Financial Intelligence",
      heroSubtitle: "Harness the power of multi-agent AI to analyze markets, assess risks, and generate comprehensive financial reports.",
      launchButton: "Launch MarketMind",
      features: {
        multiAgent: {
          title: "Multi-Agent Architecture",
          description: "Specialized AI agents working in concert for fundamental, technical, and sentiment analysis."
        },
        realTime: {
          title: "Real-Time Data",
          description: "Live market data integration for accurate and up-to-date financial insights."
        },
        risk: {
          title: "Risk Management",
          description: "Advanced risk assessment models to protect your portfolio and optimize returns."
        }
      }
    },
    analyze: {
      dashboard: "ANALYSIS DASHBOARD",
      running: "Running analysis...",
      rerun: "Re-run analysis",
      searchPlaceholder: "Search symbol...",
      exportPDF: "Export PDF",
      generatedAt: "Generated at",
      sources: "Sources",
    },
    auth: {
      whySignIn: "Why sign in?",
      infoText: "We use Google for secure sign-in. We don't see your password or private data, we only verify your identity to save your analysis history.",
    },
    settings: {
      title: "API Configuration",
      description: "Your keys are stored locally in your browser. If left empty, the app will use the default server keys or Mock Mode.",
      openaiKey: "OpenAI API Key",
      openaiKeyDesc: "Optional. If not provided, the application will use the default server configuration.",
    },
    disclaimer: {
      title: "Disclaimer",
      text: "This platform is for educational and informational purposes only. No content provided constitutes investment advice, trading recommendations, or financial consulting.",
      points: [
        "AI models can produce erroneous results",
        "Past performance does not guarantee future results",
        "Investing involves risk, you may lose capital",
        "You are solely responsible for your investment decisions"
      ],
      footer: "Please consult with licensed financial advisors before making any investment decisions. By using this platform, you are deemed to have accepted the above conditions.",
      accept: "I have read and accept the warning",
    },
    tabs: {
      overview: "Overview",
      technical: "Technical",
      fundamental: "Fundamental",
      sentiment: "Sentiment",
      risk: "Risk",
      fullReport: "Full Report",
      signals: "Signals",
      reportUnavailable: "Report unavailable.",
    },
    analysisHeader: {
      updated: "Updated",
      vsPreviousClose: "vs previous close",
    },
    visualization: {
      executionPipeline: "Execution Pipeline",
      overallProgress: "Overall progress",
      error: "Error",
      completed: "Completed",
      running: "Running",
      pending: "Pending",
      agents: {
        marketData: "Market Data",
        technical: "Technical",
        fundamental: "Fundamental",
        sentiment: "Sentiment",
        risk: "Risk",
        reporter: "Report",
      },
    },
    scoreCard: {
      composite: "Composite",
      confidence: "Confidence",
      technical: "Technical",
      fundamental: "Fundamental",
      sentiment: "Sentiment",
      risk: "Risk (lower is better)",
    },
    riskGauge: {
      risk: "Risk",
      lowRisk: "low risk",
      mediumRisk: "medium risk",
      highRisk: "high risk",
    },
  },
  tr: {
    common: {
      signIn: "Giriş Yap",
      signOut: "Çıkış Yap",
      settings: "Ayarlar",
      close: "Kapat",
      cancel: "İptal",
      save: "Kaydet",
      loading: "Yükleniyor...",
      error: "Hata",
    },
    home: {
      subtitle: "MARKETMIND",
      title: "Kararlı portföy hamleleri için çok ajanlı yatırım zekâsı.",
      description: "Canlı piyasa verilerini, yapay zekâ destekli araştırmayı ve risk disiplinini tek bir iş akışında birleştirin.",
      recentAnalyses: "Son analizler",
      noAnalyses: "İlk analizinizi çalıştırın, burada görünecektir.",
      viewDashboard: "Paneli görüntüle →",
      searchPlaceholder: "Sembol ara...",
      analyzeButton: "Analiz Et",
    },
    landing: {
      heroTitle: "AI Destekli Finansal Asistan",
      heroSubtitle: "Piyasaları analiz etmek, riskleri değerlendirmek ve kapsamlı finansal raporlar oluşturmak için çok ajanlı yapay zekânın gücünden yararlanın.",
      launchButton: "MarketMind'ı Başlat",
      features: {
        multiAgent: {
          title: "Çok Ajanlı Mimari",
          description: "Temel, teknik ve duygu analizi için uyum içinde çalışan özelleşmiş yapay zekâ ajanları."
        },
        realTime: {
          title: "Gerçek Zamanlı Veri",
          description: "Doğru ve güncel finansal içgörüler için canlı piyasa verisi entegrasyonu."
        },
        risk: {
          title: "Risk Yönetimi",
          description: "Portföyünüzü korumak ve getirileri optimize etmek için gelişmiş risk değerlendirme modelleri."
        }
      }
    },
    analyze: {
      dashboard: "ANALİZ PANELİ",
      running: "Analiz yapılıyor...",
      rerun: "Analizi tekrarla",
      searchPlaceholder: "Sembol ara...",
      exportPDF: "PDF İndir",
      generatedAt: "Oluşturulma Tarihi",
      sources: "Kaynaklar",
    },
    auth: {
      whySignIn: "Neden giriş yapmalıyım?",
      infoText: "Google ile güvenli giriş yapın. Şifreniz veya özel verileriniz bizimle paylaşılmaz, sadece analiz geçmişinizi kaydetmek için kimliğinizi doğrularız.",
    },
    settings: {
      title: "API Yapılandırması",
      description: "Anahtarlarınız tarayıcınızda yerel olarak saklanır. Boş bırakılırsa, uygulama varsayılan sunucu anahtarlarını veya Mock Modunu kullanır.",
      openaiKey: "OpenAI API Anahtarı",
      openaiKeyDesc: "İsteğe bağlı. Sağlanmazsa, uygulama varsayılan sunucu yapılandırmasını kullanır.",
    },
    disclaimer: {
      title: "Yasal Uyarı",
      text: "Bu platform yalnızca eğitim ve bilgilendirme amaçlıdır. Sunulan hiçbir içerik yatırım tavsiyesi, alım-satım önerisi veya finansal danışmanlık değildir.",
      points: [
        "Yapay zekâ modelleri hatalı sonuçlar üretebilir",
        "Geçmiş performans gelecekteki sonuçları garanti etmez",
        "Yatırım riski taşır, sermaye kaybı yaşayabilirsiniz",
        "Yatırım kararlarınızdan yalnızca siz sorumlusunuz"
      ],
      footer: "Yatırım kararı vermeden önce mutlaka lisanslı finansal danışmanlara danışın. Bu platformu kullanarak yukarıdaki şartları kabul etmiş sayılırsınız.",
      accept: "Uyarıyı okudum ve kabul ediyorum",
    },
    tabs: {
      overview: "Genel Bakış",
      technical: "Teknik",
      fundamental: "Temel",
      sentiment: "Duygu",
      risk: "Risk",
      fullReport: "Tam Rapor",
      signals: "Sinyaller",
      reportUnavailable: "Rapor mevcut değil.",
    },
    analysisHeader: {
      updated: "Güncellendi",
      vsPreviousClose: "önceki kapanışa göre",
    },
    visualization: {
      executionPipeline: "Yürütme Hattı",
      overallProgress: "Genel ilerleme",
      error: "Hata",
      completed: "Tamamlandı",
      running: "Çalışıyor",
      pending: "Bekliyor",
      agents: {
        marketData: "Piyasa Verisi",
        technical: "Teknik",
        fundamental: "Temel",
        sentiment: "Duygu",
        risk: "Risk",
        reporter: "Rapor",
      },
    },
    scoreCard: {
      composite: "Kompozit",
      confidence: "Güven",
      technical: "Teknik",
      fundamental: "Temel",
      sentiment: "Duygu",
      risk: "Risk (düşük daha iyi)",
    },
    riskGauge: {
      risk: "Risk",
      lowRisk: "düşük risk",
      mediumRisk: "orta risk",
      highRisk: "yüksek risk",
    },
  },
};
