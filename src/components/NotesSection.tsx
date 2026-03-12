import { useState } from 'react';
import type { NoteVersion } from '../types/question';

interface NotesSectionProps {
  questionId: string;
  notes: NoteVersion[];
  onAddNote: (questionId: string, content: string) => void;
  onUpdateNote: (questionId: string, noteId: string, content: string) => void;
  onDeleteNote: (questionId: string, noteId: string) => void;
}

export function NotesSection({
  questionId,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: NotesSectionProps) {
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expanded, setExpanded] = useState(true);

  const handleAdd = () => {
    if (newContent.trim()) {
      onAddNote(questionId, newContent.trim());
      setNewContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAdd();
    }
  };

  const handleStartEdit = (note: NoteVersion) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onUpdateNote(questionId, editingId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-display font-bold text-accent-purple uppercase tracking-wider mb-4 mt-1 cursor-pointer hover:text-accent-purple/80 transition-colors"
      >
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
        >
          <path d="M4 2L8 6L4 10" />
        </svg>
        My Notes
        {notes.length > 0 && (
          <span className="text-[10px] bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded-full font-code">
            {notes.length}
          </span>
        )}
      </button>

      {expanded && <div className="space-y-3 animate-fade-in">
        {/* Always-visible input */}
        <div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your approach, thoughts, or solution here..."
            className="w-full bg-bg-card border border-border rounded-lg p-3 text-sm text-text-primary resize-y min-h-[400px] focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 font-code placeholder:text-text-muted"
          />
          {newContent.trim() && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 bg-accent-purple text-bg-primary text-xs font-semibold rounded-lg hover:bg-accent-purple/90 transition-colors cursor-pointer"
              >
                Save (v{notes.length + 1})
              </button>
              <span className="text-[10px] text-text-muted">
                {'\u2318'}+Enter
              </span>
            </div>
          )}
        </div>

        {/* Existing notes */}
        {notes.map((note, i) => (
          <div
            key={note.id}
            className="bg-bg-card border border-border rounded-lg p-3 relative group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-code text-accent-purple">
                v{i + 1} &mdash; {formatDate(note.createdAt)}
              </span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleStartEdit(note)}
                  className="text-[10px] text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteNote(questionId, note.id)}
                  className="text-[10px] text-text-muted hover:text-accent-red transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>

            {editingId === note.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-lg p-3 text-sm text-text-primary resize-y min-h-[80px] focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 font-code"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 bg-accent-purple/20 text-accent-purple text-xs rounded-lg hover:bg-accent-purple/30 transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 bg-bg-tertiary text-text-muted text-xs rounded-lg hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed font-code">
                {note.content}
              </div>
            )}
          </div>
        ))}
      </div>}
    </div>
  );
}
