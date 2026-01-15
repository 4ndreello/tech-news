import React, { useMemo } from "react";
import { NewsItem } from "../types";
import { X } from "lucide-react";

interface RankingInfoModalProps {
  item: NewsItem;
  onClose: () => void;
}

// Função simplificada para calcular fatores
function getRankingFactors(item: NewsItem) {
  const score = item.score || 0;
  const comments = item.commentCount || 0;
  const techScore = (item as any).techScore || 0;
  const COMMENT_WEIGHT = 0.3;
  const engagement = score + comments * COMMENT_WEIGHT;
  const publishedDate = new Date(item.publishedAt);
  const now = new Date();
  const ageInHours =
    (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
  return {
    score,
    comments,
    techScore,
    engagement,
    ageInHours,
    finalScore: score,
  };
}

export default function RankingInfoModal({
  item,
  onClose,
}: RankingInfoModalProps) {
  const factors = useMemo(() => getRankingFactors(item), [item]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900 border border-slate-700/50 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100">
            Como calculamos o score?
          </h2>
        </div>

        {/* Score Final */}
        <div className="text-center my-8">
          <p className="text-sm text-slate-400">Score final deste post</p>
          <p className="text-7xl font-bold text-white tracking-tighter">
            {factors.finalScore}
          </p>
        </div>

        {/* Resumo didático */}
        <div className="mb-8 text-slate-300 text-center text-base leading-relaxed">
          O score é calculado levando em conta:
          <ul className="mt-2 mb-0 text-slate-400 text-sm list-disc list-inside text-left max-w-xs mx-auto">
            <li>Popularidade (pontos + comentários)</li>
            <li>Tempo desde a publicação (quanto mais novo, maior o score)</li>
            <li>Relevância técnica (boost de IA)</li>
          </ul>
        </div>

        {/* Tabela de fatores */}
        <div className="mb-8 flex justify-center">
          <table className="min-w-[260px] text-sm text-slate-300 border-separate border-spacing-y-1">
            <tbody>
              <tr>
                <td className="pr-4 text-slate-400">Pontos</td>
                <td className="font-semibold text-slate-100">
                  {factors.score}
                </td>
              </tr>
              <tr>
                <td className="pr-4 text-slate-400">Comentários</td>
                <td className="font-semibold text-slate-100">
                  {factors.comments}
                </td>
              </tr>
              <tr>
                <td className="pr-4 text-slate-400">Idade (horas)</td>
                <td className="font-semibold text-slate-100">
                  {factors.ageInHours.toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="pr-4 text-slate-400">Relevância IA</td>
                <td className="font-semibold text-slate-100">
                  {factors.techScore}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Fórmula em texto */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">
            Fórmula utilizada
          </h3>
          <div className="bg-slate-800/70 p-4 rounded-lg text-sm text-slate-300 max-w-2xl mx-auto font-mono">
            Score = log₁₀(pontos + comentários × W<sub>c</sub>) / (horas + G)
            <sup>D</sup> × (1 + relevância × W<sub>r</sub>) × M
          </div>
          <a
            href="https://github.com/4ndreello/tech-news-api/blob/main/src/services/ranking.service.ts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Ver algoritmo de ranqueamento
          </a>
        </div>
      </div>
    </div>
  );
}
