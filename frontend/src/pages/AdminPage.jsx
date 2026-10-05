import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  createPost, 
  updatePost, 
  deletePost, 
  fetchPosts, 
  uploadPicture, 
  fetchSystemStatus,
  fetchSubscribers,
  notifySubscribersManual,
  sendTestEmail
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
  Home
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
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'manage' | 'subscribers' | 'db'
  const [dbStatus, setDbStatus] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [subscribersData, setSubscribersData] = useState({ total_active: 0, smtp_configured: false, subscribers: [] });
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [notifyingPostId, setNotifyingPostId] = useState(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

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

  useEffect(() => {
    loadStatus();
    loadAllPosts();
    loadSubscribers();
  }, []);

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

  // Picture Upload handler
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
                    {isUploading ? 'Uploading picture to server...' : 'Click to upload pictures from your device'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#77736b' }}>
                    Supports PNG, JPG, JPEG, WEBP, GIF, SVG. Uploaded files are served directly.
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
                          <img src={img.url} alt="Uploaded" />
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
                      src={coverImage}
                      alt="Cover Preview"
                      style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #dedcd6' }}
                    />
                    <div style={{ fontSize: '13px' }}>
                      <span style={{ fontWeight: '600' }}>Active Cover Picture: </span>
                      <span style={{ color: '#77736b' }}>{coverImage}</span>
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
                    <button type="button" onClick={() => insertFormat('> ')} className="btn-secondary" style={{ padding: '2px 8px' }} title="Quote">
                      <Quote size={16} />
                    </button>
                    <button type="button" onClick={() => insertFormat('```\n', '\n```')} className="btn-secondary" style={{ padding: '2px 8px' }} title="Code Block">
                      <Code size={16} />
                    </button>
                    <button type="button" onClick={() => insertFormat('- ')} className="btn-secondary" style={{ padding: '2px 8px' }} title="List">
                      <List size={16} />
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
                  <img src={coverImage} alt="Cover Preview" className="article-cover-img" />
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
