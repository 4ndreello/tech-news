import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, ExternalLink, Calendar, User, MessageCircle, Loader2, ArrowUp } from 'lucide-react';
import { NewsItem, Comment } from '../types';
import { timeAgo } from '../utils/date';
import { fetchTabNewsComments } from '../services/api';

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
                <div key={comment.id} className="pl-3 md:pl-5 border-l-2 border-white/5 relative">
                    <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
                         <span className="font-bold text-slate-300">{comment.owner_username}</span>
                         <span>•</span>
                         <span>{timeAgo(comment.created_at)}</span>
                         {comment.tabcoins !== undefined && (
                             <span className="flex items-center gap-0.5 text-green-500/80 bg-green-500/5 px-2 py-0.5 rounded text-xs font-medium">
                                 <ArrowUp size={12} />
                                 {comment.tabcoins}
                             </span>
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
    if (isOpen && item && item.source === 'TabNews') {
        setLoadingComments(true);
        setComments([]); // Reset
        
        if (item.owner_username && item.slug) {
            fetchTabNewsComments(item.owner_username, item.slug)
                .then(data => setComments(data))
                .catch(err => console.error("Failed to load comments", err))
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
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-[#1e293b] flex-shrink-0 z-10">
          <div className="flex justify-between items-start gap-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {item.title}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X size={28} />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm md:text-base text-slate-400">
            <div className="flex items-center gap-2">
              <User size={16} className="text-tabnews" />
              <span className="font-medium">{item.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{timeAgo(item.publishedAt)}</span>
            </div>
             <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <span>{item.commentCount || 0} comentários</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-8 custom-scrollbar flex-1 bg-[#0f172a]/30">
          {/* Post Body (if text post) */}
          {item.body && (
            <div className="markdown-body text-slate-200 pb-10 border-b border-white/5 mb-8">
               <ReactMarkdown>{item.body}</ReactMarkdown>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <MessageCircle size={20} />
                Comentários
            </h3>
            
            {loadingComments ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-blue-400" size={32} />
                </div>
            ) : comments.length > 0 ? (
                <CommentTree comments={comments} />
            ) : (
                <p className="text-slate-500 italic text-lg">Nenhum comentário encontrado.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-[#0f172a] flex justify-between items-center">
          <span className="text-sm text-slate-500">
             {item.source === 'TabNews' ? 'Conteúdo do TabNews' : 'Conteúdo Externo'}
          </span>
          <a 
            href={externalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-tabnews/10 text-tabnews hover:bg-tabnews hover:text-white rounded-lg transition-all font-medium text-base"
          >
            <span>{item.sourceUrl ? 'Acessar Link Original' : 'Ver no TabNews'}</span>
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}