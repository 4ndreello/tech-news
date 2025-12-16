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
          <div className="bg-slate-800/70 p-4 rounded-lg text-sm text-slate-300 max-w-2xl mx-auto">
            Score = log10(pontos + comentários × 0.3) / (horas + 2)
            <sup>1.8</sup> × (1 + relevância × 0.005) × 1000
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Quanto maior o score, mais relevante e recente é o post!
          </p>
        </div>
      </div>
    </div>
  );
}
