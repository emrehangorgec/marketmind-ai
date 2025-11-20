import { AlertTriangle } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-900/20 p-4 backdrop-blur-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-200">Disclaimer</h3>
          <div className="mt-1 text-sm text-amber-200/80">
            <p>
              This project is an AI application developed for educational and informational purposes only.
              The data, analysis, and reports presented here <strong>do not constitute investment advice</strong>.
              AI models can make mistakes. Please consult with professional financial advisors before making any investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
