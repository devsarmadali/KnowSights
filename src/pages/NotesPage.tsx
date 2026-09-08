import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Pin, 
  Trash2, 
  History, 
  Sparkles, 
  Clock, 
  Eye, 
  Edit3, 
  Tag, 
  Folder, 
  Bookmark, 
  RotateCcw, 
  X, 
  ChevronDown, 
  ArrowUpDown, 
  LayoutGrid, 
  Columns, 
  Maximize2, 
  Minimize2, 
  Loader2, 
  Cloud, 
  CloudCheck,
  FileText,
  AlertCircle,
  Hash,
  BookOpen,
  Share2,
  Save,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { UserNote, UserNoteVersion, NoteBadge, NoteCategory } from '../types';
import { api, getLocalNotes, saveLocalNotes } from '../services/api';

interface NotesPageProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNotesCountChange?: (count: number) => void;
}

type ViewMode = 'grid' | 'split';
type SortOption = 'updated_desc' | 'created_desc' | 'created_asc' | 'title_asc' | 'word_count' | 'versions_desc';

const CATEGORIES: { id: NoteCategory; label: string }[] = [
  { id: 'all', label: 'All Notes & Prompts' },
  { id: 'prompts', label: 'AI Search Prompts' },
  { id: 'research', label: 'Research Notes' },
  { id: 'scripts', label: 'Script Hooks' },
  { id: 'templates', label: 'Templates' },
  { id: 'general', label: 'General' },
];

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Prompt: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  Research: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  Script: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  Hook: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  Template: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30' },
  Draft: { bg: 'bg-neutral-800', text: 'text-neutral-300', border: 'border-neutral-700' },
  Idea: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' }
};

const DEFAULT_STARTER_NOTES: Partial<UserNote>[] = [
  {
    title: 'Investigative Documentary Deep-Dive Prompt (Broad Public / High Retention)',
    content: `Act as an elite investigative documentary researcher and master storytelling fact-checker. Conduct an exhaustive, open-web, evidence-backed deep dive on the following topic:

• TARGET TOPIC: [Insert topic, site, lost civilization, or scientific anomaly]
• UNIQUE ANGLE & HOOK: [Insert the counterintuitive paradox or curiosity angle]

CORE EDITORIAL DIRECTIVE (ACCESSIBLE TO BROAD AUDIENCES • DEEPLY RIGOROUS):
1. ZERO ESOTERIC JARGON: Translate complex scientific, archaeological, or mechanical realities into vivid, intuitive analogies and narrative tension suitable for YouTube documentaries and a curious broad public.
2. DIG LESSER-KNOWN FACTS: Uncover buried archival anomalies, forgotten expedition logs, and primary source eyewitness accounts that mainstream pop-science summaries miss.
3. EXPLORE ALL ANGLES: Contrast the consensus with credible dissenting hypotheses and active debates.
4. TANGIBLE HUMAN DRAMA: Anchor claims in specific discoverer names, exact dates, measurements, and visual scenes.

OUTPUT FORMAT:
1. Executive Story Hook & The Core Mystery (The paradigm shift)
2. Lesser-Known Revelations & Buried Archival Facts
3. The Chronological Narrative & Key Human Figures
4. How It Actually Works / Core Mechanism (Vivid, accessible explanation)
5. Competing Angles, Debates & Unresolved Mysteries
6. Documentary Visual & Storytelling Asset Cues (Visual scene ideas & graphics)
7. Annotated Source Directory (with direct citable URLs and institutional authorities across the web)`,
    category: 'prompts',
    badge: 'Prompt',
    tags: ['Documentary', 'Deep Research', 'YouTube', 'Perplexity'],
    is_pinned: true,
  },
  {
    title: '30-Second Pattern Interrupt Hook Formula',
    content: `Engineered framework for opening YouTube documentary scripts with instant cognitive pattern interruption:

1. THE CONVENTIONAL BELIEF (0:00 - 0:08):
"For nearly a century, every standard history textbook claimed that [Conventional Fact] was settled science."

2. THE ANOMALOUS ARTIFACT (0:09 - 0:18):
"Until a team of excavators in [Location] recovered [Specific Artifact]—and discovered a microscopic layer of [Evidence] that shouldn't exist."

3. THE STAKES & PARADIGM SHIFT (0:19 - 0:30):
"It wasn't an anomaly. It was proof that our entire timeline of ancient global trade was wrong."`,
    category: 'scripts',
    badge: 'Hook',
    tags: ['YouTube', 'Scriptwriting', 'Retention'],
    is_pinned: false,
  },
  {
    title: 'Cross-Archive Verification & Primary Source Checklist',
    content: `Standard verification protocol before scripting or citing historical claims:

• ARCHIVAL GROUND TRUTH:
  [ ] Has this claim been confirmed by at least two independent primary excavation or archival logs?
  [ ] Does the institutional museum catalog (e.g. British Museum, Louvre, Bodleian) have physical custody of the cited object?
  [ ] Are the carbon dating or spectral analysis methodologies explicitly published with error margins?

• RED FLAGS TO ELIMINATE:
  [ ] Speculative sensationalist blogs quoting secondary news aggregators without primary DOIs.
  [ ] Outdated 19th-century colonial interpretations debunked by modern stratigraphy.`,
    category: 'research',
    badge: 'Research',
    tags: ['Fact-Checking', 'Methodology', 'Archives'],
    is_pinned: false,
  }
];

export const NotesPage: React.FC<NotesPageProps> = ({ showToast, onNotesCountChange }) => {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (onNotesCountChange) {
      onNotesCountChange(notes.length);
    }
  }, [notes.length, onNotesCountChange]);
  
  // Filtering & Sorting State
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Editor State
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorCategory, setEditorCategory] = useState('prompts');
  const [editorBadge, setEditorBadge] = useState<NoteBadge>('Prompt');
  const [editorTags, setEditorTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [editorIsPinned, setEditorIsPinned] = useState(false);
  const [editorVersion, setEditorVersion] = useState(1);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  // Sync & Auto-save State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef<boolean>(false);

  // Version History Drawer State
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<UserNoteVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<UserNoteVersion | null>(null);

  // 1. Initial Load from Cloudflare D1 (with local fallback)
  useEffect(() => {
    loadNotes();
  }, []);

  const [isManualSaving, setIsManualSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await api.getNotes();
      if (res && res.success && Array.isArray(res.notes)) {
        // Filter out phantom empty notes (empty title and empty content)
        const validNotes = res.notes.filter((n: UserNote) => 
          (n.title && n.title.trim() && n.title !== 'Untitled Note') || 
          (n.content && n.content.trim())
        );
        if (validNotes.length === 0) {
          // Initialize starter notes if completely empty
          await initializeStarterNotes();
        } else {
          setNotes(validNotes);
          saveLocalNotes(validNotes);
          if (!selectedNoteId && validNotes.length > 0) {
            loadNoteIntoEditor(validNotes[0]);
          }
        }
      } else {
        const local = getLocalNotes().filter((n: UserNote) => 
          (n.title && n.title.trim() && n.title !== 'Untitled Note') || 
          (n.content && n.content.trim())
        );
        if (local.length > 0) {
          setNotes(local);
          if (!selectedNoteId) loadNoteIntoEditor(local[0]);
        } else {
          await initializeStarterNotes();
        }
      }
    } catch (err) {
      console.warn("Failed to load notes from API, using local storage:", err);
      const local = getLocalNotes().filter((n: UserNote) => 
        (n.title && n.title.trim() && n.title !== 'Untitled Note') || 
        (n.content && n.content.trim())
      );
      setNotes(local);
      if (local.length > 0 && !selectedNoteId) {
        loadNoteIntoEditor(local[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Content preview helper that cleans raw markdown symbols into legible preview text
  const getContentPreview = (content: string | undefined): string => {
    if (!content) return '';
    const trimmed = content.trim();
    if (!trimmed) return '';
    const clean = trimmed
      .replace(/```[\s\S]*?```/g, ' [Code/Prompt] ')
      .replace(/^#+\s+/gm, '')
      .replace(/[*_~`]/g, '')
      .replace(/\n{2,}/g, '\n')
      .trim();
    return clean;
  };

  const initializeStarterNotes = async () => {
    if (localStorage.getItem('knowsights_starter_initialized')) {
      return;
    }
    localStorage.setItem('knowsights_starter_initialized', 'true');
    const createdNotes: UserNote[] = [];
    for (const starter of DEFAULT_STARTER_NOTES) {
      try {
        const res = await api.saveNote(starter, "Starter Template");
        if (res && res.success && res.note) {
          createdNotes.push(res.note);
        }
      } catch (e) {
        console.error("Error creating starter note", e);
      }
    }
    if (createdNotes.length > 0) {
      setNotes(createdNotes);
      saveLocalNotes(createdNotes);
      loadNoteIntoEditor(createdNotes[0]);
    }
  };

  // 2. Load Selected Note into Editor
  const loadNoteIntoEditor = (note: UserNote) => {
    setSelectedNoteId(note.id);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorCategory(note.category);
    setEditorBadge((note.badge as NoteBadge) || 'Prompt');
    setEditorTags(note.tags || []);
    setEditorIsPinned(note.is_pinned);
    setEditorVersion(note.version || 1);
    setLastSavedAt(new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setSyncStatus('synced');
    isDirtyRef.current = false;
  };

  // 3. Create New Note Handler (Safeguard against duplicate empty cards)
  const handleCreateNew = (category: string = 'prompts', badge: NoteBadge = 'Prompt') => {
    // If there is already an empty draft in the list, focus it instead of adding redundant cards!
    const existingEmpty = notes.find(n => !n.content || !n.content.trim());
    if (existingEmpty) {
      loadNoteIntoEditor(existingEmpty);
      setViewMode('split');
      showToast(`Switched to active empty draft. Write or paste content, then click Save & Close!`, 'info');
      return;
    }

    const defaultTitle = badge === 'Prompt' ? 'New AI Search Prompt' : 'New Research Note';
    const newNote: UserNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: defaultTitle,
      content: '',
      category,
      tags: [],
      badge,
      is_pinned: false,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    loadNoteIntoEditor(newNote);
    setViewMode('split');
    showToast(`Created new ${badge.toLowerCase()} draft. Paste content and click Save & Close!`, 'info');
  };

  // 4. Robust Save Engine (debounced + explicit manual save)
  const triggerAutoSave = (updatedFields: Partial<UserNote>) => {
    if (!selectedNoteId) return;
    const currentTitle = updatedFields.title !== undefined ? updatedFields.title : editorTitle;
    const currentContent = updatedFields.content !== undefined ? updatedFields.content : editorContent;
    // Safeguard: Never auto-save completely empty notes to prevent phantom card spam
    if (!currentContent.trim() && (!currentTitle.trim() || currentTitle.startsWith('New ') || currentTitle.startsWith('Untitled'))) {
      return;
    }

    isDirtyRef.current = true;
    setSyncStatus('saving');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      await executeSave(updatedFields, "Auto-saved edit");
    }, 1200);
  };

  const executeSave = async (extraFields: Partial<UserNote> = {}, summary?: string): Promise<boolean> => {
    if (!selectedNoteId) return false;

    const currentTitle = extraFields.title !== undefined ? extraFields.title : editorTitle;
    const currentContent = extraFields.content !== undefined ? extraFields.content : editorContent;
    const currentCategory = extraFields.category !== undefined ? extraFields.category : editorCategory;
    const currentBadge = extraFields.badge !== undefined ? extraFields.badge : editorBadge;
    const currentTags = extraFields.tags !== undefined ? extraFields.tags : editorTags;
    const currentIsPinned = extraFields.is_pinned !== undefined ? extraFields.is_pinned : editorIsPinned;

    // Do not save if title and content are both totally empty
    if (!currentTitle.trim() && !currentContent.trim()) {
      return false;
    }

    const trimmedTitle = currentTitle.trim() || (currentContent.trim() ? currentContent.trim().substring(0, 40) : 'Untitled Note');

    const notePayload: Partial<UserNote> = {
      id: selectedNoteId,
      title: trimmedTitle,
      content: currentContent,
      category: currentCategory,
      badge: currentBadge,
      tags: currentTags,
      is_pinned: currentIsPinned,
      ...extraFields
    };

    setSyncStatus('saving');

    try {
      const res = await api.saveNote(notePayload, summary || "Content revision");
      if (res && res.success && res.note) {
        const savedNote: UserNote = res.note;
        setEditorVersion(savedNote.version);
        setEditorTitle(savedNote.title);
        setNotes(prev => prev.map(n => n.id === selectedNoteId ? savedNote : n));
        
        const local = getLocalNotes();
        const existingIdx = local.findIndex(n => n.id === selectedNoteId);
        const updatedLocal = existingIdx >= 0 
          ? local.map(n => n.id === selectedNoteId ? savedNote : n)
          : [savedNote, ...local];
        saveLocalNotes(updatedLocal);

        setSyncStatus('synced');
        setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        isDirtyRef.current = false;
        return true;
      }
    } catch (err) {
      console.warn("API save note failed, saving to local fallback:", err);
    }

    // Local fallback save
    const now = new Date().toISOString();
    const fallbackNote: UserNote = {
      id: selectedNoteId,
      title: trimmedTitle,
      content: currentContent,
      category: currentCategory,
      badge: currentBadge,
      tags: currentTags,
      is_pinned: currentIsPinned,
      version: editorVersion + 1,
      created_at: now,
      updated_at: now
    };
    setEditorVersion(fallbackNote.version);
    setNotes(prev => prev.map(n => n.id === selectedNoteId ? fallbackNote : n));
    const local = getLocalNotes();
    const existingIdx = local.findIndex(n => n.id === selectedNoteId);
    const updatedLocal = existingIdx >= 0 
      ? local.map(n => n.id === selectedNoteId ? fallbackNote : n)
      : [fallbackNote, ...local];
    saveLocalNotes(updatedLocal);
    setSyncStatus('synced');
    setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    isDirtyRef.current = false;
    return true;
  };

  const handleManualSave = async (): Promise<boolean> => {
    if (!selectedNoteId) return false;
    setIsManualSaving(true);
    try {
      const ok = await executeSave({}, "Explicit user save");
      if (ok) {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
        showToast("Note & prompt saved successfully to D1 Vault!", 'success');
        return true;
      } else {
        showToast("Saved to local offline draft.", 'info');
        return true;
      }
    } catch (e) {
      showToast("Could not save note.", 'error');
      return false;
    } finally {
      setIsManualSaving(false);
    }
  };

  // Save changes and return to Card Grid view
  const handleSaveAndClose = async () => {
    if (!editorContent.trim() && (!editorTitle.trim() || editorTitle.startsWith('New ') || editorTitle.startsWith('Untitled'))) {
      showToast("Please enter a note title or content before saving.", 'info');
      return;
    }
    const ok = await handleManualSave();
    if (ok) {
      setViewMode('grid');
    }
  };

  // Close editor and return to Card Grid view, cleaning up any zero-content drafts
  const handleCloseEditor = () => {
    if (selectedNoteId && !editorContent.trim() && (!editorTitle.trim() || editorTitle.startsWith('New ') || editorTitle.startsWith('Untitled'))) {
      setNotes(prev => prev.filter(n => n.id !== selectedNoteId));
    }
    setViewMode('grid');
  };

  // 5. In-App Delete Confirmation State & Handlers (Zero browser dialogs)
  const [noteToDelete, setNoteToDelete] = useState<UserNote | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  const requestDeleteNote = (note: UserNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNoteToDelete(note);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    const id = noteToDelete.id;
    setIsDeletingNote(true);

    try {
      await api.deleteNote(id);
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      saveLocalNotes(updated);
      showToast(`Deleted "${noteToDelete.title || 'Note'}" and its revisions.`, 'info');

      if (selectedNoteId === id) {
        if (updated.length > 0) {
          loadNoteIntoEditor(updated[0]);
        } else {
          setSelectedNoteId(null);
          setEditorTitle('');
          setEditorContent('');
          setViewMode('grid');
        }
      }
    } catch (err) {
      showToast("Failed to delete note", 'error');
    } finally {
      setIsDeletingNote(false);
      setNoteToDelete(null);
    }
  };

  // 6. Copy Full Note / Prompt to Clipboard
  const handleCopyNote = async (text: string, id?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedNoteId(id);
        setTimeout(() => setCopiedNoteId(null), 2000);
      }
      showToast("Copied note & prompt to clipboard!", 'success');
    } catch (err) {
      showToast("Failed to copy note", 'error');
    }
  };

  // 7. Pin / Unpin Toggle
  const handleTogglePin = async (note: UserNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newPinned = !note.is_pinned;
    const updated = { ...note, is_pinned: newPinned };

    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    if (selectedNoteId === note.id) {
      setEditorIsPinned(newPinned);
    }

    try {
      await api.saveNote({ id: note.id, is_pinned: newPinned }, newPinned ? "Pinned note" : "Unpinned note");
      showToast(newPinned ? "Pinned to top" : "Unpinned", 'info');
    } catch (err) {
      console.error("Failed to toggle pin", err);
    }
  };

  // 8. Version History Inspection & Restore
  const handleOpenVersions = async (noteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVersionDrawerOpen(true);
    setLoadingVersions(true);
    setPreviewVersion(null);

    try {
      const res = await api.getNoteVersions(noteId);
      if (res && res.success && Array.isArray(res.versions)) {
        setVersionHistory(res.versions);
      } else {
        setVersionHistory([]);
      }
    } catch (err) {
      console.error("Failed to load note versions", err);
      showToast("Could not load revision history", 'error');
    } finally {
      setLoadingVersions(false);
    }
  };

  // In-App Version Restoration Confirmation
  const [versionToRestore, setVersionToRestore] = useState<UserNoteVersion | null>(null);
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);

  const requestRestoreVersion = (v: UserNoteVersion, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVersionToRestore(v);
  };

  const confirmRestoreVersion = async () => {
    if (!versionToRestore || !selectedNoteId) return;
    setIsRestoringVersion(true);

    try {
      const res = await api.restoreNoteVersion(selectedNoteId, versionToRestore.version_number);
      if (res && res.success && res.note) {
        loadNoteIntoEditor(res.note);
        setNotes(prev => prev.map(n => n.id === selectedNoteId ? res.note : n));
        saveLocalNotes(notes.map(n => n.id === selectedNoteId ? res.note : n));
        setVersionDrawerOpen(false);
        setVersionToRestore(null);
        showToast(`Restored to Version ${versionToRestore.version_number} (Now v${res.note.version})`, 'success');
      }
    } catch (err) {
      showToast("Failed to restore version", 'error');
    } finally {
      setIsRestoringVersion(false);
    }
  };

  // 9. Tag Management
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !editorTags.includes(trimmed)) {
      const updated = [...editorTags, trimmed];
      setEditorTags(updated);
      setTagInput('');
      triggerAutoSave({ tags: updated });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = editorTags.filter(t => t !== tagToRemove);
    setEditorTags(updated);
    triggerAutoSave({ tags: updated });
  };

  // 10. Filtered & Sorted Notes
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(n => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach(t => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Category filter
      if (selectedCategory !== 'all' && note.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Tag filter
      if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = note.content.toLowerCase().includes(q);
        const tagMatch = note.tags && note.tags.some(t => t.toLowerCase().includes(q));
        const badgeMatch = note.badge && note.badge.toLowerCase().includes(q);
        if (!titleMatch && !contentMatch && !tagMatch && !badgeMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      // Pinned notes always surface to the top
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      switch (sortBy) {
        case 'updated_desc':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'word_count':
          return (b.content.split(/\s+/).filter(Boolean).length) - (a.content.split(/\s+/).filter(Boolean).length);
        case 'versions_desc':
          return (b.version || 1) - (a.version || 1);
        default:
          return 0;
      }
    });
  }, [notes, selectedCategory, selectedTag, searchQuery, sortBy]);

  // Metrics calculation
  const wordCount = useMemo(() => {
    return editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;
  }, [editorContent]);

  const charCount = editorContent.length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Top Header & Action Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-teal-500 p-[1.5px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                <FileText className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-display font-extrabold text-white tracking-tight">Notes & Prompts Vault</h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/25">
                  Cloudflare D1 Synced
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">
                Save, organize, version, and 1-click copy your personal AI search prompts and deep research dossiers.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: New Note, New Prompt, View Mode Toggle */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {viewMode === 'split' && (
            <button
              onClick={handleCloseEditor}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-neutral-200 hover:text-white transition-all cursor-pointer mr-1 active:scale-95"
              title="Return to Card Grid view"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>Back to Cards</span>
            </button>
          )}

          {/* New Prompt Button */}
          <button
            onClick={() => handleCreateNew('prompts', 'Prompt')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white shadow-md shadow-sky-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>+ New AI Prompt</span>
          </button>

          {/* New General Note Button */}
          <button
            onClick={() => handleCreateNew('research', 'Research')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-neutral-200 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-300" />
            <span>+ New Note</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/[0.08] p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'split' ? 'bg-white/[0.1] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Split Master-Detail Editor View"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-white/[0.06]">
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id;
          const count = cat.id === 'all' 
            ? notes.length 
            : notes.filter(n => n.category.toLowerCase() === cat.id.toLowerCase()).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-sky-500/15 border border-sky-500/30 text-sky-300 shadow-sm'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 hover:text-neutral-200 border border-white/[0.06]'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-sky-500/30 text-sky-200' : 'bg-white/[0.06] text-neutral-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search, Tag Filters & Sort Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, prompts, tags, or badges..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0d1118] border border-white/[0.1] text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side: Tag Filter & Sort Dropdown */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Tag Filter Pills */}
          {allUniqueTags.length > 0 && (
            <div className="flex items-center space-x-1 overflow-x-auto max-w-xs">
              <Tag className="w-3 h-3 text-neutral-400 shrink-0 mr-0.5" />
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="px-2 py-0.5 rounded-md bg-white/[0.06] text-sky-300 hover:text-white text-[11px] font-mono cursor-pointer"
                >
                  Clear #{selectedTag}
                </button>
              )}
              {allUniqueTags.slice(0, 4).map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                    selectedTag === t
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/[0.03] text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200 border border-white/[0.06]'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[#0d1118] border border-white/[0.1] rounded-xl px-3 py-1.5 shadow-sm">
            <ArrowUpDown className="w-3 h-3 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-neutral-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="updated_desc" className="bg-[#0d1118]">Recently Updated</option>
              <option value="created_desc" className="bg-[#0d1118]">Newest First</option>
              <option value="created_asc" className="bg-[#0d1118]">Oldest First</option>
              <option value="title_asc" className="bg-[#0d1118]">Title A-Z</option>
              <option value="word_count" className="bg-[#0d1118]">Word Count (Longest)</option>
              <option value="versions_desc" className="bg-[#0d1118]">Most Revisions</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Main Body: Grid View OR Split View */}
      {loading ? (
        <div className="py-24 text-center text-neutral-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400" />
          <p className="text-xs font-mono uppercase tracking-wider font-semibold">Syncing personal vault with Cloudflare D1...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl p-8 border border-white/[0.08] space-y-4 max-w-lg mx-auto shadow-tactile">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-neutral-300">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white">No Notes Found</h3>
            <p className="text-xs text-neutral-400 mt-1">
              {searchQuery || selectedCategory !== 'all' || selectedTag
                ? "No notes match your active filters or search query."
                : "Your personal prompt and notes vault is empty."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center space-x-2">
            {(searchQuery || selectedCategory !== 'all' || selectedTag) ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTag(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-neutral-200 border border-white/[0.08] transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCreateNew('prompts', 'Prompt')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-xs font-bold text-white shadow-md shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-300 fill-amber-300" />
                  Create AI Prompt
                </button>
                <button
                  onClick={() => handleCreateNew('research', 'Research')}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-semibold text-neutral-200 hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1 text-neutral-300" />
                  Create Note
                </button>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* ================= CARD GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => {
            const isSelected = selectedNoteId === note.id;
            const badgeStyle = BADGE_COLORS[note.badge] || BADGE_COLORS.Draft;
            const noteWordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
            const isCopied = copiedNoteId === note.id;

            return (
              <div
                key={note.id}
                onClick={() => {
                  loadNoteIntoEditor(note);
                  setViewMode('split');
                }}
                className={`glass-panel rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between group cursor-pointer relative shadow-tactile ${
                  isSelected 
                    ? 'border-sky-500/50 bg-[#0d1118]/90 shadow-glow-sky ring-1 ring-sky-500/30' 
                    : note.is_pinned
                      ? 'border-amber-500/30 bg-[#0d1118]/80 hover:border-amber-500/50'
                      : 'border-white/[0.08] bg-[#0d1118]/70 hover:border-white/[0.14] hover:bg-[#111722]/80'
                }`}
              >
                {/* Card Top: Badges & Pin */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      {/* Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border uppercase tracking-wider ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                        {note.badge || 'Note'}
                      </span>

                      {/* Version Pill */}
                      <span 
                        onClick={(e) => {
                          loadNoteIntoEditor(note);
                          handleOpenVersions(note.id, e);
                        }}
                        className="px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white font-mono text-[10px] font-bold border border-white/[0.08] transition-colors"
                        title="Click to view full revision history"
                      >
                        v{note.version || 1}
                      </span>

                      {/* Pinned Indicator */}
                      {note.is_pinned && (
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono">
                          <Pin className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>

                    {/* Pin Toggle Button */}
                    <button
                      onClick={(e) => handleTogglePin(note, e)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        note.is_pinned 
                          ? 'text-amber-400 hover:text-amber-300' 
                          : 'text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100'
                      }`}
                      title={note.is_pinned ? "Unpin note" : "Pin note to top"}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-display font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug tracking-tight">
                    {note.title || "Untitled Note"}
                  </h3>

                  {/* Clean readable preview snippet */}
                  <div className="mt-2 min-h-[3.75rem]">
                    {getContentPreview(note.content) ? (
                      <p className="text-xs text-neutral-300 line-clamp-4 leading-relaxed font-normal break-words whitespace-pre-line">
                        {getContentPreview(note.content)}
                      </p>
                    ) : (
                      <p className="text-xs italic text-neutral-500">Empty note... Click Edit to write or paste content.</p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Tags, Metrics & Actions */}
                <div className="mt-4 pt-3.5 border-t border-white/[0.08] space-y-2.5">
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono text-neutral-300 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.06]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <div className="flex items-center space-x-2">
                      <span>{noteWordCount} words</span>
                      <span>•</span>
                      <span>{new Date(note.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>

                    {/* Toolbar on Card */}
                    <div className="flex items-center space-x-1.5">
                      {/* Explicit Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadNoteIntoEditor(note);
                          setViewMode('split');
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                        title="Edit note in editor"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={(e) => handleCopyNote(note.content, note.id, e)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          isCopied 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' 
                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-neutral-300 hover:text-white'
                        }`}
                        title="Copy note content to clipboard"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* Versions Button */}
                      <button
                        onClick={(e) => {
                          loadNoteIntoEditor(note);
                          handleOpenVersions(note.id, e);
                        }}
                        className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white transition-all cursor-pointer"
                        title="View revision versions"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => requestDeleteNote(note, e)}
                        className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 border border-white/[0.08] text-neutral-400 hover:text-rose-300 transition-all cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* ================= SPLIT MASTER-DETAIL VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[600px]">
          
          {/* Left Side: Notes List (4 columns) */}
          <div className="lg:col-span-4 space-y-2.5 max-h-[800px] overflow-y-auto pr-1">
            {filteredNotes.map(note => {
              const isSelected = selectedNoteId === note.id;
              const badgeStyle = BADGE_COLORS[note.badge] || BADGE_COLORS.Draft;
              const isCopied = copiedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  onClick={() => loadNoteIntoEditor(note)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative shadow-tactile ${
                    isSelected
                      ? 'border-sky-500/50 bg-[#0d1118] shadow-glow-sky ring-1 ring-sky-500/30'
                      : 'border-white/[0.08] bg-[#0d1118]/60 hover:bg-[#111722]/80 hover:border-white/[0.14]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider ${badgeStyle.bg} ${badgeStyle.text}`}>
                        {note.badge}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">v{note.version}</span>
                      {isSelected && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {note.is_pinned && <Pin className="w-3 h-3 fill-amber-400 text-amber-400" />}
                      <button
                        onClick={(e) => handleCopyNote(note.content, note.id, e)}
                        className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy note"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-display font-bold text-white truncate">{note.title || "Untitled Note"}</h4>
                  <p className="text-[11px] text-neutral-300 line-clamp-2 mt-1 leading-snug break-words">
                    {getContentPreview(note.content) || <span className="italic text-neutral-500">Empty note content...</span>}
                  </p>
                  
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-2.5 pt-2 border-t border-white/[0.06]">
                    <span>{note.content.split(/\s+/).filter(Boolean).length} words</span>
                    <span>{new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side: Full Multi-Paragraph Editor (8 columns) */}
          <div className={`lg:col-span-8 flex flex-col glass-panel rounded-3xl border border-white/[0.1] p-6 shadow-tactile ${
            isEditorFullscreen ? 'fixed inset-4 z-50 bg-[#07090e]/95 backdrop-blur-2xl border-white/[0.15] shadow-2xl overflow-y-auto' : ''
          }`}>
            
            {selectedNoteId ? (
              <div className="flex-1 flex flex-col space-y-4">
                
                {/* Editor Header: Controls & Sync Status */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] gap-2 flex-wrap">
                  {/* Left: Back button, Badge & Category Selector */}
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <button
                      onClick={handleCloseEditor}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
                      title="Back to Card Grid view"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                      <span>Back</span>
                    </button>

                    {/* Badge Picker */}
                    <select
                      value={editorBadge}
                      onChange={(e) => {
                        const newBadge = e.target.value as NoteBadge;
                        setEditorBadge(newBadge);
                        triggerAutoSave({ badge: newBadge });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0d1118] border border-white/[0.1] text-xs font-mono font-bold text-sky-300 focus:outline-none cursor-pointer"
                    >
                      <option value="Prompt">Badge: Prompt</option>
                      <option value="Research">Badge: Research</option>
                      <option value="Script">Badge: Script</option>
                      <option value="Hook">Badge: Hook</option>
                      <option value="Template">Badge: Template</option>
                      <option value="Draft">Badge: Draft</option>
                      <option value="Idea">Badge: Idea</option>
                    </select>

                    {/* Category Picker */}
                    <select
                      value={editorCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setEditorCategory(newCat);
                        triggerAutoSave({ category: newCat });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0d1118] border border-white/[0.1] text-xs text-neutral-200 focus:outline-none cursor-pointer"
                    >
                      <option value="prompts">Category: Prompts</option>
                      <option value="research">Category: Research</option>
                      <option value="scripts">Category: Script Hooks</option>
                      <option value="templates">Category: Templates</option>
                      <option value="general">Category: General</option>
                    </select>

                    {/* Pin Toggle */}
                    <button
                      onClick={() => {
                        const newPin = !editorIsPinned;
                        setEditorIsPinned(newPin);
                        triggerAutoSave({ is_pinned: newPin });
                      }}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                        editorIsPinned
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-[#0d1118] border-white/[0.1] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Pin className={`w-3 h-3 ${editorIsPinned ? 'fill-amber-400' : ''}`} />
                      <span>{editorIsPinned ? 'Pinned' : 'Pin'}</span>
                    </button>
                  </div>

                  {/* Right: Sync Status, Save & Close, Save, Versions & Fullscreen */}
                  <div className="flex items-center space-x-2 font-mono text-xs flex-wrap gap-y-1">
                    {/* Auto-save Status Indicator */}
                    <div className="flex items-center space-x-1.5 text-neutral-400 pr-1">
                      {syncStatus === 'saving' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span className="text-[11px] text-amber-300">Saving...</span>
                        </>
                      ) : syncStatus === 'synced' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] text-emerald-400">Synced {lastSavedAt ? `(${lastSavedAt})` : ''}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="text-[11px] text-neutral-400">Draft</span>
                        </>
                      )}
                    </div>

                    {/* Prominent Save & Close Button */}
                    <button
                      onClick={handleSaveAndClose}
                      disabled={isManualSaving}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                      title="Save note to D1 and close editor"
                    >
                      {isManualSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Save & Close</span>
                    </button>

                    {/* Quick Save Note Button (Keep open) */}
                    <button
                      onClick={handleManualSave}
                      disabled={isManualSaving}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                        justSaved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-emerald-300 hover:text-white'
                      }`}
                      title="Save note & prompt to Cloudflare D1 immediately"
                    >
                      {isManualSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : justSaved ? (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{isManualSaving ? 'Saving...' : justSaved ? 'Saved!' : 'Save'}</span>
                    </button>

                    {/* Version History Button */}
                    <button
                      onClick={() => selectedNoteId && handleOpenVersions(selectedNoteId)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.1] text-sky-300 text-xs transition-colors cursor-pointer"
                      title="View all past versions"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>v{editorVersion}</span>
                    </button>

                    {/* 1-Click Copy Full Editor Content */}
                    <button
                      onClick={() => handleCopyNote(editorContent, selectedNoteId)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-neutral-200 hover:text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                      title="Copy complete prompt / note to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>

                    {/* Close button */}
                    <button
                      onClick={handleCloseEditor}
                      className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Close editor and back to cards"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                      onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
                      className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title={isEditorFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen"}
                    >
                      {isEditorFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Note Title Input */}
                <div>
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => {
                      setEditorTitle(e.target.value);
                      triggerAutoSave({ title: e.target.value });
                    }}
                    placeholder="Note or Prompt Title..."
                    className="w-full text-xl font-display font-bold text-white bg-transparent border-b border-white/[0.08] pb-2.5 focus:outline-none focus:border-sky-500 placeholder-neutral-600 transition-colors tracking-tight"
                  />
                </div>

                {/* Tags Management Row */}
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <div className="flex items-center space-x-1 text-neutral-400 text-xs">
                    <Tag className="w-3 h-3" />
                    <span>Tags:</span>
                  </div>
                  {editorTags.map(tag => (
                    <span key={tag} className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-300">
                      <span>#{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-neutral-500 hover:text-rose-400 ml-1"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  
                  {/* Tag Input */}
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="+ tag (Enter)"
                      className="px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-sky-500 w-24"
                    />
                  </div>
                </div>

                {/* Editor Mode Bar: Markdown Preview Toggle & Metrics */}
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <div className="flex items-center space-x-2 font-mono text-[11px]">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} chars</span>
                    <span>•</span>
                    <span>~{readingTime} min read</span>
                  </div>

                  <button
                    onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      showMarkdownPreview
                        ? 'bg-sky-500/20 border-sky-500/30 text-sky-300'
                        : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showMarkdownPreview ? 'Edit Source' : 'Markdown Preview'}</span>
                  </button>
                </div>

                {/* Multi-Paragraph Textarea OR Markdown Preview */}
                <div className="flex-1 min-h-[360px] flex flex-col">
                  {showMarkdownPreview ? (
                    <div className="p-4.5 rounded-2xl bg-[#07090e]/90 border border-white/[0.08] text-neutral-100 text-xs leading-relaxed whitespace-pre-line overflow-y-auto flex-1 font-sans">
                      {editorContent || <span className="italic text-neutral-600">Nothing to preview...</span>}
                    </div>
                  ) : (
                    <textarea
                      value={editorContent}
                      onChange={(e) => {
                        setEditorContent(e.target.value);
                        triggerAutoSave({ content: e.target.value });
                      }}
                      placeholder="Write your long research prompt, investigative notes, video hooks, or source citations here..."
                      className="w-full flex-1 min-h-[380px] p-4.5 rounded-2xl bg-[#07090e]/80 border border-white/[0.08] text-neutral-100 text-xs leading-relaxed focus:outline-none focus:border-sky-500/70 focus:ring-1 focus:ring-sky-500/30 placeholder-neutral-500 font-mono resize-y"
                    />
                  )}
                </div>

                {/* Editor Bottom Footer: Manual Save Note & Milestone & Delete */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      const current = notes.find(n => n.id === selectedNoteId);
                      if (current) requestDeleteNote(current, e);
                    }}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Note</span>
                  </button>

                  <div className="flex items-center space-x-2 flex-wrap gap-1.5">
                    <button
                      onClick={handleCloseEditor}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
                    >
                      Cancel / Close
                    </button>

                    <button
                      onClick={async () => {
                        await executeSave({}, `Manual milestone v${editorVersion + 1}`);
                        showToast(`Saved version milestone v${editorVersion + 1}!`, 'success');
                      }}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
                      title="Create an immutable named revision snapshot"
                    >
                      <History className="w-3.5 h-3.5 text-sky-400" />
                      <span>Save Milestone</span>
                    </button>

                    <button
                      onClick={handleManualSave}
                      disabled={isManualSaving}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-bold text-emerald-300 hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>

                    <button
                      onClick={handleSaveAndClose}
                      disabled={isManualSaving}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                      title="Save note and return to card grid"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Close</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-24 text-center text-neutral-500 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-neutral-600" />
                <p>Select a note from the left to view or edit.</p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ================= 5. VERSION HISTORY DRAWER / MODAL ================= */}
      {versionDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-3xl rounded-2xl p-6 border border-neutral-800 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Revision & Version History</h3>
                  <p className="text-xs text-neutral-400">Inspect past snapshots, compare changes, and 1-click restore.</p>
                </div>
              </div>

              <button
                onClick={() => setVersionDrawerOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {loadingVersions ? (
                <div className="py-12 text-center text-neutral-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-400" />
                  <p className="text-xs">Loading revision snapshots from Cloudflare D1...</p>
                </div>
              ) : versionHistory.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-12">No previous versions found for this note.</p>
              ) : previewVersion ? (
                /* Version Preview View */
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-sky-400">Previewing Version {previewVersion.version_number}</span>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        Saved: {new Date(previewVersion.created_at).toLocaleString()} • {previewVersion.change_summary || 'Revision'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyNote(previewVersion.content)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium flex items-center space-x-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>

                      <button
                        onClick={() => requestRestoreVersion(previewVersion)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore This Version</span>
                      </button>

                      <button
                        onClick={() => setPreviewVersion(null)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 whitespace-pre-line max-h-96 overflow-y-auto">
                    {previewVersion.content}
                  </div>
                </div>
              ) : (
                /* Version List */
                <div className="space-y-2">
                  {versionHistory.map((ver, idx) => {
                    const isLatest = idx === 0;
                    const words = ver.content ? ver.content.split(/\s+/).filter(Boolean).length : 0;

                    return (
                      <div
                        key={ver.version_id}
                        className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            isLatest ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            v{ver.version_number}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-bold text-white truncate">{ver.title || "Untitled"}</h4>
                              {isLatest && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center space-x-2">
                              <span>{new Date(ver.created_at).toLocaleString()}</span>
                              <span>•</span>
                              <span>{words} words</span>
                              {ver.change_summary && (
                                <>
                                  <span>•</span>
                                  <span className="italic text-neutral-500 truncate">{ver.change_summary}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Actions on this version */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            onClick={() => setPreviewVersion(ver)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium cursor-pointer"
                          >
                            Preview
                          </button>

                          <button
                            onClick={() => handleCopyNote(ver.content)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs cursor-pointer"
                            title="Copy this version"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {!isLatest && (
                            <button
                              onClick={() => requestRestoreVersion(ver)}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600 border border-sky-500/30 hover:border-sky-500 text-sky-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                              title="Restore note to this version"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setVersionDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 6. IN-APP 2-STEP DELETE CONFIRMATION MODAL ================= */}
      {noteToDelete && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => !isDeletingNote && setNoteToDelete(null)}
        >
          <div 
            className="glass-panel w-full max-w-md rounded-3xl p-6 border border-rose-500/30 bg-[#0d1118]/95 shadow-tactile relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-display font-bold text-white tracking-tight">Delete Note & Revisions?</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Confirm permanent removal within KnowSights Vault
                </p>
              </div>
              <button
                onClick={() => !isDeletingNote && setNoteToDelete(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note Details Box */}
            <div className="p-3.5 rounded-2xl bg-[#07090e]/90 border border-white/[0.08] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-white/[0.05] text-neutral-300 border border-white/[0.08]">
                  {noteToDelete.badge || 'Note'}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">v{noteToDelete.version || 1} Revisions</span>
              </div>
              
              <h4 className="font-display font-bold text-white text-sm line-clamp-2 leading-snug">
                {noteToDelete.title || 'Untitled Note'}
              </h4>

              <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed font-normal break-words">
                {getContentPreview(noteToDelete.content) || <span className="italic text-neutral-500">Empty content draft...</span>}
              </p>
            </div>

            {/* Warning Text */}
            <div className="flex items-center space-x-2 text-[11px] text-rose-400/90 font-medium px-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>This will permanently delete this note and its version milestones from Cloudflare D1.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => setNoteToDelete(null)}
                disabled={isDeletingNote}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteNote}
                disabled={isDeletingNote}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isDeletingNote ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm & Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. IN-APP VERSION RESTORE CONFIRMATION MODAL ================= */}
      {versionToRestore && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => !isRestoringVersion && setVersionToRestore(null)}
        >
          <div 
            className="glass-panel w-full max-w-md rounded-3xl p-6 border border-sky-500/30 bg-[#0d1118]/95 shadow-tactile relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-display font-bold text-white tracking-tight">Restore to Version {versionToRestore.version_number}?</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Load this historical snapshot and create a new restored revision.
                </p>
              </div>
              <button
                onClick={() => !isRestoringVersion && setVersionToRestore(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#07090e]/90 border border-white/[0.08] space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-400 text-[11px] font-mono">
                <span>Created:</span>
                <span className="text-white">{new Date(versionToRestore.created_at).toLocaleString()}</span>
              </div>
              {versionToRestore.change_summary && (
                <div className="flex justify-between text-neutral-400 text-[11px] font-mono">
                  <span>Milestone:</span>
                  <span className="text-sky-300">{versionToRestore.change_summary}</span>
                </div>
              )}
              <p className="text-xs text-neutral-300 line-clamp-3 pt-1 border-t border-white/[0.06] font-mono">
                {getContentPreview(versionToRestore.content) || <span className="italic text-neutral-500">Empty snapshot...</span>}
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => setVersionToRestore(null)}
                disabled={isRestoringVersion}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestoreVersion}
                disabled={isRestoringVersion}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isRestoringVersion ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm & Restore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
