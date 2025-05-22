'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSend, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { Comment } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

type CommentSectionProps = {
  projectId: string;
  isAuthenticated: boolean;
  currentUserId?: string;
};

export default function CommentSection({ projectId, isAuthenticated, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [projectId]);

  // Function to fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/comments`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await res.json();
      setComments(data);
      setError('');
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Yorumlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Function to submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Yorum içeriği boş olamaz');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Yorum gönderilirken bir hata oluştu');
      }
      
      const newCommentData = await res.json();
      
      // Add the new comment to the list
      setComments(prev => [newCommentData, ...prev]);
      
      // Clear the input
      setNewComment('');
      
      // Show success toast
      toast.success('Yorumunuz başarıyla eklendi!');
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      toast.error(err.message || 'Yorum gönderilirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle comment expansion
  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), {
      addSuffix: true,
      locale: tr
    });
  };

  // Determine if a comment should be collapsed
  const shouldCollapseComment = (content: string) => {
    return content.length > 300;
  };

  // Truncate comment content
  const truncateContent = (content: string) => {
    if (content.length <= 300) return content;
    return content.substring(0, 300) + '...';
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6 text-white">Yorumlar</h2>
      
      {/* Comment Form for authenticated users */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="relative mb-4">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Bu proje hakkında bir yorum yazın..."
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-y"
              disabled={submitting}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                submitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {submitting ? (
                <span className="animate-pulse">Gönderiliyor...</span>
              ) : (
                <>
                  <FiSend className="mr-2" /> Gönder
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-700 rounded-lg flex flex-col sm:flex-row items-center justify-between">
          <p className="text-gray-300 mb-3 sm:mb-0">Yorum yapmak için giriş yapmalısınız.</p>
          <Link 
            href="/login" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors text-white"
          >
            Giriş Yap
          </Link>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p>{error}</p>
          <button 
            onClick={() => setError('')}
            className="text-red-200 hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>
      )}
      
      {/* Comment List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-400">Yorumlar yükleniyor...</div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => {
            const isExpanded = expandedComments[comment.id];
            const needsExpansion = shouldCollapseComment(comment.content);
            const commentContent = isExpanded || !needsExpansion 
              ? comment.content 
              : truncateContent(comment.content);
            
            return (
              <div 
                key={comment.id} 
                className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-start mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-600 flex-shrink-0">
                    {comment.user.profileImage ? (
                      <Image 
                        src={comment.user.profileImage} 
                        alt={comment.user.username || comment.user.email.split('@')[0]} 
                        width={40} 
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Image 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.username || comment.user.email.split('@')[0])}&background=random`}
                        alt={comment.user.username || comment.user.email.split('@')[0]}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/u/${comment.user.username || comment.user.email.split('@')[0]}`}
                      className="font-medium text-blue-400 hover:text-blue-300 transition"
                    >
                      {comment.user.username || comment.user.email.split('@')[0]}
                    </Link>
                    <p className="text-gray-400 text-sm">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="pl-0 sm:pl-[52px]">
                  <p className="text-gray-200 whitespace-pre-line">{commentContent}</p>
                  
                  {/* Expand/Collapse button for long comments */}
                  {needsExpansion && (
                    <button 
                      onClick={() => toggleCommentExpansion(comment.id)}
                      className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center"
                    >
                      {isExpanded ? (
                        <>
                          <FiChevronUp className="mr-1" /> Daha az göster
                        </>
                      ) : (
                        <>
                          <FiChevronDown className="mr-1" /> Devamını göster
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-700 border border-gray-600 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-2 text-5xl">💬</div>
          <h3 className="text-lg font-medium text-white mb-2">Henüz yorum yok</h3>
          <p className="text-gray-400">
            Bu projede ilk yorumu yapan siz olun!
          </p>
        </div>
      )}
    </div>
  );
} 