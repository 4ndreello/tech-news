import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { NewsItem, Comment } from "../types";
import { timeAgo } from "../utils/date";
import { fetchTabNewsComments } from "../services/api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: NewsItem | null;
}

// Recursively render comments
const CommentTree = ({ comments }: { comments: Comment[] }) => {
  if (!comments || comments.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 mt-6">
      {comments.map((comment) => (
        <div key={comment.id} className="pl-4 border-l border-slate-800">
          <div className="flex items-center gap-3 mb-2 text-sm text-slate-500">
            <a
              href={`https://www.tabnews.com.br/${comment.owner_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 hover:text-slate-200 hover:underline transition-colors"
            >
              {comment.owner_username}
            </a>
            <span>·</span>
            <span>{timeAgo(comment.created_at)}</span>
            {comment.tabcoins !== undefined && comment.tabcoins > 0 && (
              <span className="text-slate-400">{comment.tabcoins} pts</span>
            )}
          </div>

          <div className="markdown-body !text-base text-slate-300 mb-2">
            <ReactMarkdown>{comment.body}</ReactMarkdown>
          </div>

          {comment.children && comment.children.length > 0 && (
            <CommentTree comments={comment.children} />
          )}
        </div>
      ))}
    </div>
  );
};

export default function Modal({ isOpen, onClose, item }: ModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch comments when item changes
  useEffect(() => {
    if (isOpen && item && item.source === "TabNews") {
      setLoadingComments(true);
      setComments([]); // Reset

      if (item.owner_username && item.slug) {
        fetchTabNewsComments(item.owner_username, item.slug)
          .then((data) => setComments(data))
          .catch((err) => console.error("Failed to load comments", err))
          .finally(() => setLoadingComments(false));
      } else {
        setLoadingComments(false);
      }
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  // Determine external URL for TabNews "Open Original" button
  const tabNewsPostUrl = `https://www.tabnews.com.br/${item.owner_username}/${item.slug}`;
  const externalUrl = item.sourceUrl || tabNewsPostUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0f172a] border border-slate-800/50 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50 flex-shrink-0">
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white leading-snug mb-3">
                {item.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <a
                  href={`https://www.tabnews.com.br/${item.author}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-300 hover:underline transition-colors"
                >
                  {item.author}
                </a>
                <span>·</span>
                <span>{timeAgo(item.publishedAt)}</span>
                <span>·</span>
                <span>{item.commentCount || 0} comentários</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {/* Post Body (if text post) */}
          {item.body && (
            <div className="markdown-body text-slate-200 pb-8 mb-8 border-b border-slate-800/50">
              <ReactMarkdown>{item.body}</ReactMarkdown>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">
              Comentários
            </h3>

            {loadingComments ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-slate-400" size={28} />
              </div>
            ) : comments.length > 0 ? (
              <CommentTree comments={comments} />
            ) : (
              <p className="text-slate-500 text-base">
                Nenhum comentário encontrado.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50 flex justify-end">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            <span>
              {item.sourceUrl ? "Acessar link original" : "Ver no TabNews"}
            </span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
