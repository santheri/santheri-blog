import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  createPost, 
  updatePost, 
  deletePost, 
  fetchPosts, 
  uploadPicture, 
  getImageUrl,
  fetchSystemStatus,
  fetchSubscribers,
  deleteSubscriber,
  notifySubscribersManual,
  sendTestEmail,
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  verifyAdminPassword,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  fetchAboutProfile,
  updateAboutProfile
} from '../api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { 
  PlusCircle, 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Layers, 
  Database, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Eye, 
  Code, 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  Sparkles,
  Users,
  Mail,
  Send,
  ArrowLeft,
  Home,
  Lock,
  Unlock,
  LogOut,
  BookOpen,
  Briefcase,
  User,
  GitFork
} from 'lucide-react';

const CATEGORIES = ['Travel', 'Technology', 'Life'];

const FONT_STYLES = [
  {
    id: 'serif',
    name: 'Literary Serif',
    preview: 'The quiet beauty of the backwaters.',
    sub: 'Newsreader / Georgia · Warm & Editorial',
    cssClass: 'font-serif'
  },
  {
    id: 'sans',
    name: 'Modern Sans',
    preview: 'Understanding language model tokens.',
    sub: 'Inter · Clean, crisp & contemporary',
    cssClass: 'font-sans'
  },
  {
    id: 'editorial',
    name: 'Editorial Display',
    preview: 'The Art of Slowing Down.',
    sub: 'Playfair Display · Refined, high contrast',
    cssClass: 'font-editorial'
  },
  {
    id: 'mono',
    name: 'Tech Mono',
    preview: 'def analyze_tokens(prompt):',
    sub: 'JetBrains Mono · Technical & developer',
    cssClass: 'font-mono'
  },
  {
    id: 'minimal',
    name: 'Poetic Minimal',
    preview: 'Solitude and the creative spark.',
    sub: 'Cormorant Garamond · Timeless literature',
    cssClass: 'font-minimal'
  }
];

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const isAuth = localStorage.getItem('santheri_admin_auth') === 'true';
    const hasToken = !!(localStorage.getItem('santheri_admin_token') || localStorage.getItem('santheri_admin_passcode'));
    return isAuth && hasToken;
  });
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'manage' | 'notes' | 'subscribers' | 'db'
  const [dbStatus, setDbStatus] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [subscribersData, setSubscribersData] = useState({ total_active: 0, smtp_configured: false, subscribers: [] });
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [notifyingPostId, setNotifyingPostId] = useState(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Field Notes State
  const [notesList, setNotesList] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteThought, setNoteThought] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Form State
  const [editingPostId, setEditingPostId] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Technology');
  const [fontStyle, setFontStyle] = useState('serif');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Projects State
  const [projectsList, setProjectsList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projNumber, setProjNumber] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projTitle, setProjTitle] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projTags, setProjTags] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projLive, setProjLive] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);

  // About Me State
  const [aboutHeadline, setAboutHeadline] = useState('');
  const [aboutBio, setAboutBio] = useState('');
  const [aboutAvatar, setAboutAvatar] = useState('');
  const [loadingAbout, setLoadingAbout] = useState(false);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [isUploadingAboutAvatar, setIsUploadingAboutAvatar] = useState(false);
  const aboutAvatarInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadStatus();
      loadAllPosts();
      loadSubscribers();
      loadNotes();
      loadProjects();
      loadAbout();
    }
  }, [isAuthenticated]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setIsVerifying(true);
    setAuthError('');
    try {
      const res = await verifyAdminPassword(passcode.trim());
      if (res && (res.success || res.valid)) {
        localStorage.setItem('santheri_admin_auth', 'true');
        if (res.token) {
          localStorage.setItem('santheri_admin_token', res.token);
        }
        localStorage.setItem('santheri_admin_passcode', passcode.trim());
        setIsAuthenticated(true);
        window.dispatchEvent(new Event('santheri-admin-auth-changed'));
        showToast('Admin dashboard unlocked!');
      } else {
        setAuthError('Incorrect passcode. Please try again.');
      }
    } catch (err) {
      setAuthError(err.message || 'Incorrect passcode. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('santheri_admin_auth');
    localStorage.removeItem('santheri_admin_token');
    localStorage.removeItem('santheri_admin_passcode');
    setIsAuthenticated(false);
    setPasscode('');
    window.dispatchEvent(new Event('santheri-admin-auth-changed'));
    showToast('Logged out of Admin.');
  };

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const data = await fetchNotes();
      setNotesList(data);
    } catch (e) {
      console.error('Failed to load notes', e);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteThought.trim()) {
      showToast('Please enter both note title and thought', 'error');
      return;
    }
    setIsSavingNote(true);
    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, {
          title: noteTitle.trim(),
          thought: noteThought.trim()
        });
        showToast('Field note updated successfully!');
      } else {
        await createNote({
          title: noteTitle.trim(),
          thought: noteThought.trim()
        });
        showToast('Field note added successfully!');
      }
      setEditingNoteId(null);
      setNoteTitle('');
      setNoteThought('');
      loadNotes();
    } catch (err) {
      showToast(err.message || 'Failed to save note', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteThought(note.thought);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteNote = async (noteId, title) => {
    if (!window.confirm(`Are you sure you want to delete note "${title}"?`)) return;
    try {
      await deleteNote(noteId);
      showToast('Field note deleted.');
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setNoteTitle('');
        setNoteThought('');
      }
      loadNotes();
    } catch (err) {
      showToast(err.message || 'Failed to delete note', 'error');
    }
  };

  const handleCancelNoteEdit = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteThought('');
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await fetchProjects();
      setProjectsList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load projects', e);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projTitle.trim()) {
      showToast('Project title is required', 'error');
      return;
    }
    setIsSavingProject(true);
    try {
      const payload = {
        number: projNumber.trim() || undefined,
        category: projCategory.trim() || 'PROJECT',
        title: projTitle.trim(),
        description: projDescription.trim(),
        tags: projTags.trim(),
        github_url: projGithub.trim() || null,
        live_url: projLive.trim() || null
      };
      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
        showToast('Project updated successfully!');
      } else {
        await createProject(payload);
        showToast('New project created successfully!');
      }
      resetProjectForm();
      loadProjects();
    } catch (err) {
      showToast(err.message || 'Failed to save project', 'error');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleEditProject = (proj) => {
    setEditingProjectId(proj.id);
    setProjNumber(proj.number || '');
    setProjCategory(proj.category || '');
    setProjTitle(proj.title || '');
    setProjDescription(proj.description || '');
    setProjTags(proj.tags || '');
    setProjGithub(proj.github_url || '');
    setProjLive(proj.live_url || '');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteProject = async (projId, title) => {
    if (!window.confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      await deleteProject(projId);
      showToast('Project deleted.');
      if (editingProjectId === projId) {
        resetProjectForm();
      }
      loadProjects();
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjNumber('');
    setProjCategory('');
    setProjTitle('');
    setProjDescription('');
    setProjTags('');
    setProjGithub('');
    setProjLive('');
  };

  const loadAbout = async () => {
    setLoadingAbout(true);
    try {
      const data = await fetchAboutProfile();
      if (data) {
        setAboutHeadline(data.headline || '');
        setAboutBio(data.bio || '');
        setAboutAvatar(data.avatar_image || '');
      }
    } catch (e) {
      console.error('Failed to load about profile', e);
    } finally {
      setLoadingAbout(false);
    }
  };

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    setIsSavingAbout(true);
    try {
      await updateAboutProfile({
        headline: aboutHeadline.trim(),
        bio: aboutBio.trim(),
        avatar_image: aboutAvatar.trim() || null
      });
      showToast('About Me profile updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to save About Me profile', 'error');
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleAboutAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAboutAvatar(true);
    try {
      const compressed = await compressImageIfNeeded(file);
      const res = await uploadPicture(compressed);
      setAboutAvatar(res.url);
      showToast('Profile picture uploaded successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to upload profile picture', 'error');
    } finally {
      setIsUploadingAboutAvatar(false);
      if (aboutAvatarInputRef.current) aboutAvatarInputRef.current.value = '';
    }
  };

  const handleDeleteSubscriber = async (subscriberId, email) => {
    if (!window.confirm(`Are you sure you want to delete subscriber ${email}?`)) return;
    try {
      await deleteSubscriber(subscriberId);
      showToast(`Subscriber ${email} deleted.`);
      loadSubscribers();
    } catch (err) {
      showToast(err.message || 'Failed to delete subscriber', 'error');
    }
  };

  const handleToolbarInsertImage = () => {
    const url = window.prompt("Enter image URL or path (e.g. https://... or uploaded image URL):");
    if (!url) return;
    const caption = window.prompt("Image caption / description (optional):", "Illustration") || "";
    const snippet = `\n\n![${caption}](${url})\n\n`;
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || content.length;
      const end = textareaRef.current.selectionEnd || content.length;
      const newContent = content.slice(0, start) + snippet + content.slice(end);
      setContent(newContent);
    } else {
      setContent(prev => prev + snippet);
    }
    showToast('Image inserted into story markdown!');
  };

  const loadSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const data = await fetchSubscribers();
      setSubscribersData(data);
    } catch (e) {
      console.error('Failed to load subscribers', e);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleBroadcastNotification = async (post) => {
    if (post.is_draft) {
      showToast('Cannot broadcast draft stories. Publish the story first.', 'error');
      return;
    }
    if (subscribersData.total_active === 0) {
      showToast('No active subscribers to notify yet.', 'error');
      return;
    }
    if (!window.confirm(`Broadcast email notification for "${post.title}" to ${subscribersData.total_active} active subscriber(s)?`)) {
      return;
    }
    setNotifyingPostId(post.id);
    try {
      const res = await notifySubscribersManual(post.id);
      showToast(res.message || 'Notification broadcast started!');
    } catch (err) {
      showToast(err.message || 'Failed to notify subscribers', 'error');
    } finally {
      setNotifyingPostId(null);
    }
  };

  const handleSendTest = async (targetEmail) => {
    const emailToSend = (targetEmail || testEmailAddress || '').trim();
    if (!emailToSend || !emailToSend.includes('@')) {
      showToast('Please enter a valid email address to test', 'error');
      return;
    }
    setIsSendingTest(true);
    try {
      const res = await sendTestEmail(emailToSend);
      showToast(res.message || `Test email sent to ${emailToSend}!`);
    } catch (err) {
      showToast(err.message || 'Failed to send test email', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  const loadStatus = async () => {
    try {
      const status = await fetchSystemStatus();
      setDbStatus(status);
    } catch (e) {
      console.error('Failed to load DB status', e);
    }
  };

  const loadAllPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await fetchPosts('', '', true);
      setPosts(data);
    } catch (e) {
      console.error('Failed to load posts', e);
    } finally {
      setLoadingPosts(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingPostId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Helper: Client-side image optimization (resizes to max 1600px, 85% JPEG) to keep upload fast and DB storage lean
  const compressImageIfNeeded = async (file, maxDimension = 1600, quality = 0.85) => {
    if (!file.type.startsWith('image/') || file.type.includes('svg') || file.size < 250 * 1024) {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Picture Upload handler
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        const file = await compressImageIfNeeded(rawFile);
        const res = await uploadPicture(file);
        setUploadedImages(prev => [res, ...prev]);

        // If cover image is not yet set, make the first uploaded image the cover
        if (!coverImage) {
          setCoverImage(res.url);
        }
      }
      showToast(`Uploaded ${files.length} picture(s) successfully!`);
    } catch (err) {
      showToast(err.message || 'Failed to upload picture', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const insertImageIntoContent = (imageUrl, filename) => {
    const snippet = `\n\n![${filename || 'Uploaded picture'}](${imageUrl})\n\n`;
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || content.length;
      const end = textareaRef.current.selectionEnd || content.length;
      const newContent = content.slice(0, start) + snippet + content.slice(end);
      setContent(newContent);
    } else {
      setContent(prev => prev + snippet);
    }
    showToast('Picture inserted into markdown content!');
  };

  const insertMermaidDiagram = () => {
    const snippet = `\n\n\`\`\`mermaid\ngraph TD\n  A[Start Concept] --> B{Key Decision?}\n  B -- Yes --> C[Implementation Step]\n  B -- No --> D[Refine & Re-evaluate]\n  C --> E[Final Result]\n\`\`\`\n\n`;
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || content.length;
      const end = textareaRef.current.selectionEnd || content.length;
      const newContent = content.slice(0, start) + snippet + content.slice(end);
      setContent(newContent);
    } else {
      setContent(prev => prev + snippet);
    }
    showToast('Mermaid flowchart template inserted!');
  };

  const insertFormat = (before, after = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = content.slice(start, end) || 'text';
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newContent);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please provide both Title and Content for the article', 'error');
      return;
    }

    setIsSaving(true);
    const postPayload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category,
      font_style: fontStyle,
      description: description.trim() || undefined,
      content,
      cover_image: coverImage || undefined,
      is_draft: isDraft
    };

    try {
      if (editingPostId) {
        await updatePost(editingPostId, postPayload);
        showToast('Story updated successfully!');
      } else {
        await createPost(postPayload);
        showToast('New story published successfully!');
      }
      resetForm();
      loadAllPosts();
      loadStatus();
      setActiveTab('manage');
    } catch (err) {
      showToast(err.message || 'Failed to save story', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setFontStyle(post.font_style || 'serif');
    setDescription(post.description || '');
    setContent(post.content);
    setCoverImage(post.cover_image || '');
    setIsDraft(post.is_draft);
    setActiveTab('write');
    setPreviewMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (postId, postTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"?`)) return;

    try {
      await deletePost(postId);
      showToast('Story deleted.');
      loadAllPosts();
      loadStatus();
    } catch (err) {
      showToast(err.message || 'Failed to delete story', 'error');
    }
  };

  const resetForm = () => {
    setEditingPostId(null);
    setTitle('');
    setSlug('');
    setCategory('Technology');
    setFontStyle('serif');
    setDescription('');
    setContent('');
    setCoverImage('');
    setIsDraft(false);
    setPreviewMode(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="content-wrap" style={{ paddingTop: '60px', paddingBottom: '120px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <Link to="/" className="back-link" id="link-admin-back-home">
            <ArrowLeft size={16} /> Back home
          </Link>
        </div>

        {notification && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            background: notification.type === 'error' ? '#ef4444' : '#171717',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '6px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px'
          }}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        <div style={{
          background: 'var(--bg-surface)',
          padding: '44px 36px',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--bg-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: '#171717'
          }}>
            <Lock size={24} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '400', marginBottom: '8px' }}>
            Admin Access
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
            This console is reserved for the site author. Enter your passcode to unlock editorial and publishing tools.
          </p>

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="form-input"
                style={{
                  fontSize: '15px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  letterSpacing: '0.15em'
                }}
                id="input-admin-passcode"
              />
            </div>

            {authError && (
              <div style={{
                color: '#ef4444',
                fontSize: '13px',
                background: '#fef2f2',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #fee2e2'
              }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              id="btn-admin-unlock"
            >
              <Unlock size={16} />
              <span>{isVerifying ? 'Verifying...' : 'Unlock Dashboard'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrap" id="admin-container" style={{ paddingBottom: '120px' }}>
      {/* Back to Home Navigation */}
      <div style={{ paddingTop: '35px' }}>
        <Link to="/" className="back-link" id="link-admin-back-home">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: notification.type === 'error' ? '#ef4444' : '#171717',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '6px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin Top Bar */}
      <div className="admin-header-bar" id="admin-top-bar">
        <div>
          <p className="eyebrow" style={{ marginBottom: '6px' }}>EDITORIAL DASHBOARD</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: '400' }}>
            {editingPostId ? 'Edit Story' : 'Story Management & Publishing'}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link 
            to="/" 
            className="btn-secondary"
            style={{ 
              padding: '6px 14px', 
              border: '1px solid var(--border-medium)', 
              borderRadius: '20px', 
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-main)'
            }}
            id="btn-admin-header-home"
            title="Go to Home Page"
          >
            <Home size={14} />
            <span>Home Page</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary"
            style={{ 
              padding: '6px 14px', 
              border: '1px solid #fecaca', 
              borderRadius: '20px', 
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#dc2626',
              background: '#fff'
            }}
            id="btn-admin-logout"
            title="Log out and lock dashboard"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>

          {/* Database Status Badge */}
          {dbStatus && (
            <div 
              className={`neon-status-badge ${dbStatus.is_neon ? '' : 'fallback'}`}
              id="neon-status-indicator"
              title={dbStatus.is_neon ? 'Connected to Neon.tech PostgreSQL Serverless' : 'Running on local database. Set DATABASE_URL to connect to Neon.tech.'}
            >
              <Database size={15} />
              <span>
                {dbStatus.is_neon ? 'Neon PostgreSQL: Connected' : `${dbStatus.database_type}`}
              </span>
              <span style={{ opacity: 0.7 }}>· {dbStatus.total_posts} posts</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-tabs" id="admin-nav-tabs">
        <button
          onClick={() => { setActiveTab('write'); }}
          className={`admin-tab-btn ${activeTab === 'write' ? 'active' : ''}`}
          id="tab-write-story"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={16} />
            {editingPostId ? 'Edit Story' : 'Write New Story'}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('manage'); }}
          className={`admin-tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          id="tab-manage-stories"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} />
            Manage Stories ({posts.length})
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('projects'); loadProjects(); }}
          className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          id="tab-projects"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={16} />
            Projects ({projectsList.length})
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('about'); loadAbout(); }}
          className={`admin-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          id="tab-about"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} />
            About Me
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('notes'); loadNotes(); }}
          className={`admin-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          id="tab-notes"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} />
            Field Notes ({notesList.length})
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('subscribers'); loadSubscribers(); }}
          className={`admin-tab-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
          id="tab-subscribers"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} />
            Subscribers ({subscribersData.total_active})
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('db'); }}
          className={`admin-tab-btn ${activeTab === 'db' ? 'active' : ''}`}
          id="tab-db-neon"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} />
            Neon.tech DB Connection
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WRITE / EDIT STORY */}
      {/* ========================================================================= */}
      {activeTab === 'write' && (
        <form onSubmit={handleSavePost} id="blog-editor-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className={`btn-secondary ${!previewMode ? 'active' : ''}`}
                style={{ fontWeight: !previewMode ? '700' : '400', borderBottom: !previewMode ? '2px solid #171717' : 'none' }}
              >
                <Edit3 size={15} style={{ marginRight: '6px' }} /> Editor
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className={`btn-secondary ${previewMode ? 'active' : ''}`}
                style={{ fontWeight: previewMode ? '700' : '400', borderBottom: previewMode ? '2px solid #171717' : 'none' }}
              >
                <Eye size={15} style={{ marginRight: '6px' }} /> Live Preview
              </button>
            </div>

            {editingPostId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
                style={{ fontSize: '13px', color: '#ef4444' }}
              >
                Cancel Editing
              </button>
            )}
          </div>

          {!previewMode ? (
            <div>
              {/* Row 1: Title & Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="input-post-title">Story Title *</label>
                  <input
                    id="input-post-title"
                    type="text"
                    required
                    placeholder="e.g. A Weekend in Vizag Backwaters"
                    value={title}
                    onChange={handleTitleChange}
                    className="form-input"
                    style={{ fontSize: '18px', fontWeight: '500' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="input-post-slug">URL Slug</label>
                  <input
                    id="input-post-slug"
                    type="text"
                    placeholder="a-weekend-in-vizag"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Row 2: Category Selector (3 Categories: Travel, Technology, Life) */}
              <div className="form-group">
                <label className="form-label">Category * (Writing Header Sections)</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`category-tab ${category === cat ? 'active' : ''}`}
                      id={`select-category-${cat.toLowerCase()}`}
                      style={{ padding: '10px 24px', fontSize: '14px' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <small style={{ color: '#77736b', marginTop: '6px', display: 'block' }}>
                  Categorized under <strong>{category}</strong> for writing navigation and headers.
                </small>
              </div>

              {/* Row 3: Font Style Selector (Choose font through UI) */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Type size={14} /> Select Typography & Font Style through UI *
                </label>
                <div className="font-selector-grid" id="font-styles-grid">
                  {FONT_STYLES.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setFontStyle(f.id)}
                      className={`font-option-card ${fontStyle === f.id ? 'selected' : ''}`}
                      id={`font-choice-${f.id}`}
                    >
                      <div className="font-option-name">{f.name}</div>
                      <div className={`font-option-sample ${f.cssClass}`}>
                        {f.preview}
                      </div>
                      <div className="font-option-desc">{f.sub}</div>
                    </div>
                  ))}
                </div>
                <small style={{ color: '#77736b', marginTop: '6px', display: 'block' }}>
                  This typography style will be saved to Neon DB and applied to this story when readers view it.
                </small>
              </div>

              {/* Row 4: Picture Upload Section */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={14} /> Upload Pictures for Blog Content
                </label>

                {/* Dropzone */}
                <div 
                  className="picture-dropzone" 
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  id="picture-upload-dropzone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="picture-file-input"
                  />
                  <Upload size={32} style={{ color: '#77736b', marginBottom: '8px' }} />
                  <p style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {isUploading ? 'Optimizing & uploading picture to database...' : 'Click to upload pictures from your device'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#77736b' }}>
                    Supports PNG, JPG, JPEG, WEBP, GIF, SVG. Uploaded files are automatically optimized and permanently stored in Neon DB.
                  </p>
                </div>

                {/* Cover Image URL input */}
                <div style={{ marginTop: '12px' }}>
                  <input
                    type="text"
                    placeholder="Or paste an image URL directly for Cover Photo (e.g. https://images.unsplash.com/...)"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="form-input"
                    id="input-cover-image-url"
                  />
                </div>

                {/* Uploaded Gallery Previews with action buttons */}
                {uploadedImages.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#55534e', marginBottom: '8px' }}>
                      UPLOADED PICTURES:
                    </p>
                    <div className="picture-preview-gallery">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="picture-preview-thumb">
                          <img 
                            src={getImageUrl(img.url)} 
                            alt="Uploaded" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="thumb-actions">
                            <button
                              type="button"
                              onClick={() => setCoverImage(img.url)}
                              className="thumb-action-btn"
                              title="Set as featured cover"
                            >
                              Cover
                            </button>
                            <button
                              type="button"
                              onClick={() => insertImageIntoContent(img.url, img.filename)}
                              className="thumb-action-btn"
                              title="Insert into text"
                            >
                              Insert
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {coverImage && (
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={getImageUrl(coverImage)}
                      alt="Cover Preview"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #dedcd6' }}
                    />
                    <div style={{ fontSize: '13px' }}>
                      <span style={{ fontWeight: '600' }}>Active Cover Picture: </span>
                      <span style={{ color: '#77736b', wordBreak: 'break-all' }}>{coverImage}</span>
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        style={{ marginLeft: '10px', color: '#ef4444', textDecoration: 'underline' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 5: Description / Excerpt */}
              <div className="form-group">
                <label className="form-label" htmlFor="input-post-desc">Short Description / Subtitle</label>
                <input
                  id="input-post-desc"
                  type="text"
                  placeholder="A one-sentence summary for the post list and preview"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Row 6: Markdown Editor with Helper Buttons */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }} htmlFor="textarea-content">
                    Story Content (Markdown Supported) *
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => insertFormat('## ')} className="btn-secondary" style={{ padding: '2px 8px' }} title="Heading 2">
                      <Heading2 size={16} />
                    </button>
                    <button type="button" onClick={() => insertFormat('### ')} className="btn-secondary" style={{ padding: '2px 8px' }} title="Heading 3">
                      <Heading3 size={16} />
                    </button>
                    <button type="button" onClick={() => insertFormat('**', '**')} className="btn-secondary" style={{ padding: '2px 8px' }} title="Bold">
                      <Bold size={16} />
                    </button>
                    <button type="button" onClick={() => insertFormat('*', '*')} className="btn-secondary" style={{ padding: '2px 8px' }} title="Italic">
                      <Italic size={16} />
                    </button>
                    <button type="button" onClick={handleToolbarInsertImage} className="btn-secondary" style={{ padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Insert Image between content">
                      <ImageIcon size={16} />
                      <span style={{ fontSize: '11px', fontWeight: '600' }}>Image</span>
                    </button>
                    <button type="button" onClick={() => insertFormat('> ')} className="btn-secondary" style={{ padding: '2px 8px' }} title="Quote">
                      <Quote size={16} />
                    </button>
                    <button type="button" onClick={() => insertFormat('```\n', '\n```')} className="btn-secondary" style={{ padding: '2px 8px' }} title="Code Block">
                      <Code size={16} />
                    </button>
                    <button type="button" onClick={() => insertFormat('- ')} className="btn-secondary" style={{ padding: '2px 8px' }} title="List">
                      <List size={16} />
                    </button>
                    <button type="button" onClick={insertMermaidDiagram} className="btn-secondary" style={{ padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Insert Mermaid Flowchart / Diagram">
                      <GitFork size={16} />
                      <span style={{ fontSize: '11px', fontWeight: '600' }}>Diagram</span>
                    </button>
                  </div>
                </div>

                <textarea
                  id="textarea-content"
                  ref={textareaRef}
                  required
                  placeholder="Write your story here... You can use headings (## ), bullet points (- ), blockquotes (> ), code blocks, or embedded pictures."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`form-textarea font-${fontStyle}`}
                  style={{ minHeight: '380px' }}
                />

                {/* Quick Insert for uploaded images & custom placement guidance */}
                {uploadedImages.length > 0 && (
                  <div style={{ marginTop: '10px', padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Insert uploaded image at cursor:
                    </span>
                    {uploadedImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => insertImageIntoContent(img.url, img.filename)}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title={`Insert ${img.filename} at current cursor location`}
                      >
                        <ImageIcon size={12} />
                        <span>{img.filename.length > 18 ? img.filename.slice(0, 18) + '…' : img.filename}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: '12px', color: '#77736b', marginTop: '6px' }}>
                  Tip: You can add multiple images anywhere in the story (after a few paragraphs, between thoughts, or after code blocks). Upload above, then click <strong>Insert</strong> or use the <strong>Image</strong> button.
                </p>
              </div>

              {/* Draft Status & Publish */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isDraft}
                    onChange={(e) => setIsDraft(e.target.checked)}
                    id="checkbox-draft"
                  />
                  <span style={{ fontSize: '14px', color: '#55534e' }}>Save as Draft (Private)</span>
                </label>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
                  id="btn-publish-story"
                  style={{ padding: '14px 32px' }}
                >
                  <Sparkles size={16} />
                  {isSaving ? 'Saving to Database...' : editingPostId ? 'Update Story' : 'Publish Story to Blog'}
                </button>
              </div>
            </div>
          ) : (
            /* Live Preview */
            <div style={{ background: 'var(--bg-surface)', padding: '50px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div className={`article-page font-${fontStyle}`}>
                <p className="eyebrow" style={{ color: '#2563eb' }}>{category.toUpperCase()}</p>
                <h1 className="article-title">{title || 'Untitled Story'}</h1>
                {description && <p className="article-desc">{description}</p>}
                {coverImage && (
                  <img 
                    src={getImageUrl(coverImage)} 
                    alt="Cover Preview" 
                    className="article-cover-img" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <MarkdownRenderer content={content || '*No content written yet.*'} />
              </div>
            </div>
          )}
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANAGE STORIES */}
      {/* ========================================================================= */}
      {activeTab === 'manage' && (
        <div id="manage-stories-view">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '400' }}>
              Published & Draft Stories ({posts.length})
            </h2>
            <button
              onClick={() => { resetForm(); setActiveTab('write'); }}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              + New Story
            </button>
          </div>

          {loadingPosts ? (
            <p style={{ color: '#77736b', padding: '40px 0' }}>Loading stories...</p>
          ) : posts.length === 0 ? (
            <p style={{ color: '#77736b', padding: '40px 0' }}>No stories created yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px'
                  }}
                  id={`manage-row-${post.id}`}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className="post-category-tag" style={{ color: '#2563eb' }}>
                        {post.category}
                      </span>
                      <span className="post-font-badge">
                        Font: {post.font_style || 'serif'}
                      </span>
                      {post.is_draft && (
                        <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: '500', marginBottom: '4px' }}>
                      {post.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#77736b', maxWidth: '600px' }}>
                      {post.description || post.slug}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <a
                      href={`/writing/${post.slug || post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="View live page"
                    >
                      <ExternalLink size={14} /> View
                    </a>
                    <button
                      onClick={() => handleEditClick(post)}
                      className="btn-secondary"
                      style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Edit this post"
                      id={`btn-edit-post-${post.id}`}
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    {!post.is_draft && (
                      <button
                        onClick={() => handleBroadcastNotification(post)}
                        disabled={notifyingPostId === post.id}
                        className="btn-secondary"
                        style={{ fontSize: '13px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Broadcast email notification to subscribers"
                        id={`btn-notify-post-${post.id}`}
                      >
                        <Send size={13} /> {notifyingPostId === post.id ? 'Sending...' : 'Notify'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(post.id, post.title)}
                      className="btn-secondary"
                      style={{ fontSize: '13px', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Delete post"
                      id={`btn-delete-post-${post.id}`}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EMAIL SUBSCRIBERS */}
      {/* ========================================================================= */}
      {activeTab === 'subscribers' && (
        <div id="subscribers-admin-view">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '400', marginBottom: '6px' }}>
                Email Subscribers ({subscribersData.total_active})
              </h2>
              <p style={{ color: '#77736b', fontSize: '15px' }}>
                Subscribers automatically receive an email whenever a new story is published.
              </p>
            </div>
            <button
              onClick={loadSubscribers}
              disabled={loadingSubscribers}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 14px', border: '1px solid var(--border-medium)', borderRadius: '4px' }}
            >
              {loadingSubscribers ? 'Refreshing...' : '↻ Refresh List'}
            </button>
          </div>

          {/* Delivery & Stats Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#77736b', marginBottom: '12px' }}>
                <Users size={18} />
                <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Active Readers
                </span>
              </div>
              <div style={{ fontSize: '38px', fontWeight: '700', fontFamily: 'var(--font-serif)', color: '#171717' }}>
                {subscribersData.total_active}
              </div>
              <p style={{ fontSize: '13px', color: '#77736b', marginTop: '6px' }}>
                Readers who will be notified upon new story publication.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#77736b', marginBottom: '12px' }}>
                <Mail size={18} />
                <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Email Delivery Service
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: subscribersData.smtp_configured ? '#10b981' : '#f59e0b'
                }}></span>
                <strong style={{ fontSize: '16px', color: '#171717' }}>
                  {subscribersData.smtp_configured ? 'Live SMTP Delivery Active' : 'Dev / Simulation Mode'}
                </strong>
              </div>
              <p style={{ fontSize: '13px', color: '#77736b', lineHeight: '1.5' }}>
                {subscribersData.smtp_configured
                  ? 'Real emails are sent via configured SMTP server on post publish.'
                  : 'Emails are logged safely to the terminal without failing. To enable live sending, configure SMTP in backend/.env.'}
              </p>
            </div>
          </div>

          {/* Direct SMTP Test Box */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '6px', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#171717', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={15} /> Send Test Email
            </h3>
            <p style={{ fontSize: '13px', color: '#77736b', marginBottom: '16px', lineHeight: '1.5' }}>
              Verify SMTP deliverability right now by sending a verification message to any inbox.
            </p>
            <div style={{ display: 'flex', gap: '10px', maxWidth: '560px' }}>
              <input
                type="email"
                placeholder="Enter email to test (e.g. your subscriber email)"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => handleSendTest()}
                disabled={isSendingTest}
                className="btn-primary"
                style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
              >
                {isSendingTest ? 'Sending...' : 'Send Test'}
              </button>
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#78716c', background: '#fafaf9', padding: '10px 14px', borderRadius: '4px', border: '1px solid #e7e5e4' }}>
              💡 <strong>Gmail Note:</strong> When sending from your own email to that same email address, Gmail stores it in <em>Sent</em> and may not show a new notification in your <em>Inbox</em>. If checking a separate subscriber inbox, make sure to check both <strong>Inbox</strong>, <strong>Promotions</strong>, and <strong>Spam</strong> folders.
            </div>
          </div>

          {/* Subscribers Table */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-primary)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#55534e' }}>
                Subscriber Directory
              </h3>
            </div>

            {loadingSubscribers ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#77736b' }}>
                Loading subscribers...
              </div>
            ) : subscribersData.subscribers.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: '#77736b' }}>
                <Mail size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>No subscribers yet</p>
                <p style={{ fontSize: '14px' }}>Readers can subscribe using the newsletter box on the homepage or article pages.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: '#77736b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '12px 24px' }}>#</th>
                      <th style={{ padding: '12px 24px' }}>Email Address</th>
                      <th style={{ padding: '12px 24px' }}>Status</th>
                      <th style={{ padding: '12px 24px' }}>Subscribed On</th>
                      <th style={{ padding: '12px 24px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribersData.subscribers.map((sub, index) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '16px 24px', color: '#949088' }}>{index + 1}</td>
                        <td style={{ padding: '16px 24px', fontWeight: '500', color: '#171717' }}>
                          {sub.email}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: sub.is_active ? '#ecfdf5' : '#f3f4f6',
                            color: sub.is_active ? '#065f46' : '#6b7280'
                          }}>
                            {sub.is_active ? 'Active' : 'Unsubscribed'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#77736b' }}>
                          {new Date(sub.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleSendTest(sub.email)}
                              disabled={isSendingTest}
                              className="btn-secondary"
                              style={{ fontSize: '12px', padding: '4px 10px' }}
                              title={`Send test email to ${sub.email}`}
                            >
                              Send Test
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                              className="btn-secondary"
                              style={{ fontSize: '12px', padding: '4px 10px', color: '#ef4444', borderColor: '#fecaca', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title={`Delete subscriber ${sub.email}`}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: PROJECTS PORTFOLIO MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'projects' && (
        <div id="admin-projects-section">
          {/* Project Editor Form */}
          <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '400', marginBottom: '4px' }}>
                  {editingProjectId ? 'Edit Project' : 'Add New Portfolio Project'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Projects appear publicly on the <Link to="/projects" target="_blank" style={{ color: '#2563eb', textDecoration: 'underline' }}>/projects</Link> page.
                </p>
              </div>

              {editingProjectId && (
                <button
                  type="button"
                  onClick={resetProjectForm}
                  className="btn-secondary"
                  style={{ fontSize: '13px', color: '#ef4444' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProject} id="form-project-editor">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="input-proj-number">Number / Index</label>
                  <input
                    id="input-proj-number"
                    type="text"
                    placeholder="e.g. 01, 02"
                    value={projNumber}
                    onChange={(e) => setProjNumber(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="input-proj-title">Project Title *</label>
                  <input
                    id="input-proj-title"
                    type="text"
                    required
                    placeholder="e.g. AI Agent Platform"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="form-input"
                    style={{ fontWeight: '500' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="input-proj-category">Category Eyebrow</label>
                  <input
                    id="input-proj-category"
                    type="text"
                    placeholder="e.g. AI · AGENT PLATFORM"
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="input-proj-tags">Tech Stack Tags (Comma separated)</label>
                  <input
                    id="input-proj-tags"
                    type="text"
                    placeholder="e.g. Python, FastAPI, React, LangChain"
                    value={projTags}
                    onChange={(e) => setProjTags(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="input-proj-github">GitHub Repository URL</label>
                  <input
                    id="input-proj-github"
                    type="url"
                    placeholder="https://github.com/santheri/..."
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="input-proj-live">Live Demo / Site URL (Optional)</label>
                  <input
                    id="input-proj-live"
                    type="url"
                    placeholder="https://..."
                    value={projLive}
                    onChange={(e) => setProjLive(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }} htmlFor="input-proj-desc">
                    Project Brief & Technical Overview (Markdown Supported) *
                  </label>
                  <span style={{ fontSize: '12px', color: '#77736b' }}>
                    Rendered in the public project modal pop-up window
                  </span>
                </div>
                <textarea
                  id="input-proj-desc"
                  required
                  rows={8}
                  placeholder="Write a comprehensive brief about this project... Outline architecture highlights, key features, challenges solved, tech stack decisions, or links. Markdown is fully supported."
                  value={projDescription}
                  onChange={(e) => setProjDescription(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', lineHeight: '1.7' }}
                />
                {projDescription && (
                  <div style={{ marginTop: '12px', padding: '18px 22px', background: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '8px' }}>
                      Live Preview of Project Brief in Pop-up Modal
                    </span>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                      <MarkdownRenderer content={projDescription} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontSize: '14px' }}
                  id="btn-save-project"
                >
                  {isSavingProject ? 'Saving...' : editingProjectId ? 'Update Project' : 'Publish Project'}
                </button>

                {editingProjectId && (
                  <button
                    type="button"
                    onClick={resetProjectForm}
                    className="btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Projects Directory Table */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#55534e' }}>
                Existing Projects ({projectsList.length})
              </h3>
              <Link to="/projects" target="_blank" style={{ fontSize: '13px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View Public Page</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            {loadingProjects ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#77736b' }}>
                Loading projects...
              </div>
            ) : projectsList.length === 0 ? (
              <div style={{ padding: '50px 24px', textAlign: 'center', color: '#77736b' }}>
                <Briefcase size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>No projects yet</p>
                <p style={{ fontSize: '14px' }}>Add your first project above to showcase your work.</p>
              </div>
            ) : (
              <div>
                {projectsList.map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      padding: '20px 24px',
                      borderBottom: '1px solid var(--border-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '20px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        {proj.number && (
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
                            {proj.number}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', fontWeight: '600' }}>
                          {proj.category}
                        </span>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                          {proj.title}
                        </h4>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '10px' }}>
                        {proj.description}
                      </p>
                      {proj.tags && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          {(typeof proj.tags === 'string' ? proj.tags.split(',') : proj.tags).map((t, idx) => (
                            <span key={idx} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--bg-subtle)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                              {typeof t === 'string' ? t.trim() : t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                        {proj.github_url && (
                          <a href={proj.github_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>GitHub</span> <ExternalLink size={12} />
                          </a>
                        )}
                        {proj.live_url && (
                          <a href={proj.live_url} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>Live Demo</span> <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleEditProject(proj)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Edit project"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id, proj.title)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '13px', color: '#ef4444' }}
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: ABOUT ME PROFILE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'about' && (
        <div id="admin-about-section">
          <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: '400', marginBottom: '4px' }}>
                  Edit About Me Page
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Customise your public bio, headline, and profile portrait displayed on the <Link to="/about" target="_blank" style={{ color: '#2563eb', textDecoration: 'underline' }}>/about</Link> page.
                </p>
              </div>

              <Link
                to="/about"
                target="_blank"
                className="btn-secondary"
                style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>View Public About Page</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            <form onSubmit={handleSaveAbout} id="form-about-editor">
              {/* Profile Picture Upload & Preview */}
              <div style={{ marginBottom: '28px', padding: '20px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <label className="form-label" style={{ marginBottom: '10px' }}>Profile Picture / Portrait</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  {aboutAvatar ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={getImageUrl(aboutAvatar)}
                        alt="Profile avatar"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        style={{ width: '110px', height: '110px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--border-medium)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setAboutAvatar('')}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Remove picture"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: '110px', height: '110px', borderRadius: '8px', border: '2px dashed var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', flexDirection: 'column', gap: '4px' }}>
                      <User size={28} />
                      <span style={{ fontSize: '11px' }}>No photo</span>
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      <input
                        type="file"
                        ref={aboutAvatarInputRef}
                        accept="image/*"
                        onChange={handleAboutAvatarUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => aboutAvatarInputRef.current && aboutAvatarInputRef.current.click()}
                        disabled={isUploadingAboutAvatar}
                        className="btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Upload size={14} />
                        <span>{isUploadingAboutAvatar ? 'Uploading...' : 'Upload Profile Picture'}</span>
                      </button>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Or enter direct image URL:
                      </label>
                      <input
                        type="text"
                        placeholder="https://... (or uploaded image URL)"
                        value={aboutAvatar}
                        onChange={(e) => setAboutAvatar(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '13px', padding: '8px 12px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Headline */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="input-about-headline">Hero Headline *</label>
                <input
                  id="input-about-headline"
                  type="text"
                  required
                  placeholder="e.g. A little bit about me."
                  value={aboutHeadline}
                  onChange={(e) => setAboutHeadline(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '16px', fontWeight: '500' }}
                />
              </div>

              {/* Bio (Markdown) */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="textarea-about-bio">
                  Biography & Background (Markdown Supported) *
                </label>
                <textarea
                  id="textarea-about-bio"
                  required
                  rows={10}
                  placeholder="Write your biography. Multiple paragraphs, bold text, links, and lists are fully supported..."
                  value={aboutBio}
                  onChange={(e) => setAboutBio(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', lineHeight: '1.75' }}
                />
              </div>

              {/* Live Preview */}
              {aboutBio && (
                <div style={{ marginBottom: '28px', padding: '24px', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '12px' }}>
                    Preview of About Page Content
                  </span>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                    <MarkdownRenderer content={aboutBio} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingAbout}
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '600' }}
                id="btn-save-about-profile"
              >
                {isSavingAbout ? 'Saving Profile...' : 'Save About Me Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: FIELD NOTES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'notes' && (
        <div id="admin-notes-section">
          {/* Note Editor Form */}
          <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '400', marginBottom: '4px' }}>
                  {editingNoteId ? 'Edit Field Note' : 'Add New Field Note'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Field notes appear publicly on the <Link to="/notes" target="_blank" style={{ color: '#2563eb', textDecoration: 'underline' }}>/notes</Link> page as concise engineering observations and thoughts.
                </p>
              </div>

              {editingNoteId && (
                <button
                  type="button"
                  onClick={handleCancelNoteEdit}
                  className="btn-secondary"
                  style={{ fontSize: '13px', color: '#ef4444' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveNote} id="form-field-note">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="input-note-title">Note Title *</label>
                <input
                  id="input-note-title"
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus or On Attention Mechanisms"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '16px', fontWeight: '500' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="input-note-thought">Thought / Markdown Reflection *</label>
                <textarea
                  id="input-note-thought"
                  required
                  rows={6}
                  placeholder="Write your thought or reflection here. Markdown is fully supported..."
                  value={noteThought}
                  onChange={(e) => setNoteThought(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={isSavingNote}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontSize: '14px' }}
                  id="btn-save-note"
                >
                  {isSavingNote ? 'Saving...' : editingNoteId ? 'Update Field Note' : 'Publish Field Note'}
                </button>

                {editingNoteId && (
                  <button
                    type="button"
                    onClick={handleCancelNoteEdit}
                    className="btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Notes Directory Table */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#55534e' }}>
                Published Notes ({notesList.length})
              </h3>
              <Link to="/notes" target="_blank" style={{ fontSize: '13px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>View Public Page</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            {loadingNotes ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#77736b' }}>
                Loading notes...
              </div>
            ) : notesList.length === 0 ? (
              <div style={{ padding: '50px 24px', textAlign: 'center', color: '#77736b' }}>
                <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>No field notes yet</p>
                <p style={{ fontSize: '14px' }}>Add your first observation above to have it appear on the Notes page.</p>
              </div>
            ) : (
              <div>
                {notesList.map((note) => (
                  <div 
                    key={note.id} 
                    style={{ 
                      padding: '20px 24px', 
                      borderBottom: '1px solid var(--border-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '20px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                          {note.title}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {note.created_at ? new Date(note.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '14px', 
                        color: 'var(--text-secondary)', 
                        lineHeight: '1.6', 
                        whiteSpace: 'pre-wrap',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {note.thought}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleEditNote(note)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Edit note"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '13px', color: '#ef4444' }}
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: NEON DB CONNECTION */}
      {/* ========================================================================= */}
      {activeTab === 'db' && (
        <div style={{ background: 'var(--bg-surface)', padding: '40px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '30px', fontWeight: '400', marginBottom: '14px' }}>
            Neon.tech PostgreSQL Integration
          </h2>
          <p style={{ color: '#55534e', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
            This application is architected to connect directly to <strong>Neon.tech</strong> serverless PostgreSQL.
          </p>

          <div style={{ background: 'var(--bg-subtle)', padding: '24px', borderRadius: '6px', marginBottom: '30px' }}>
            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Current Connection Status:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '15px' }}>
              <div>
                <strong>Database Engine: </strong>
                <span>{dbStatus?.database_type || 'Checking...'}</span>
              </div>
              <div>
                <strong>Neon Serverless Detected: </strong>
                <span style={{ color: dbStatus?.is_neon ? '#059669' : '#d97706', fontWeight: '600' }}>
                  {dbStatus?.is_neon ? 'Yes (Connected to Neon.tech Cloud)' : 'Using Local SQLite fallback (Ready to plug Neon string)'}
                </span>
              </div>
              <div>
                <strong>Total Articles in Database: </strong>
                <span>{dbStatus?.total_posts || 0}</span>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
            How to connect your Neon.tech database:
          </h3>
          <ol style={{ paddingLeft: '20px', color: '#55534e', lineHeight: '1.8', fontSize: '15px' }}>
            <li>Go to <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>console.neon.tech</a> and create or select your project.</li>
            <li>Copy your connection string (format: <code>postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require</code>).</li>
            <li>Open the file <code>backend/.env</code> in your project.</li>
            <li>Set <code>DATABASE_URL=postgresql://...</code> and restart the backend server.</li>
            <li>The system will automatically create tables and sync your blog posts to Neon cloud!</li>
          </ol>
        </div>
      )}
    </div>
  );
}
