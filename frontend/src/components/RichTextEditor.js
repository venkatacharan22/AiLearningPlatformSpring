import React, { useState, useRef, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Enter lesson notes...", className = "" }) => {
  const [content, setContent] = useState(value || '');
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    setContent(value || '');
  }, [value]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      if (onChange) {
        onChange(newContent);
      }
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleContentChange();
  };

  const handleKeyDown = (e) => {
    // Handle common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        default:
          break;
      }
    }
  };

  const formatButtons = [
    { command: 'bold', icon: '𝐁', title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: '𝐼', title: 'Italic (Ctrl+I)' },
    { command: 'underline', icon: '𝐔', title: 'Underline (Ctrl+U)' },
    { command: 'strikeThrough', icon: '𝐒', title: 'Strikethrough' },
  ];

  const listButtons = [
    { command: 'insertUnorderedList', icon: '•', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: '1.', title: 'Numbered List' },
  ];

  const alignButtons = [
    { command: 'justifyLeft', icon: '⬅', title: 'Align Left' },
    { command: 'justifyCenter', icon: '⬌', title: 'Align Center' },
    { command: 'justifyRight', icon: '➡', title: 'Align Right' },
  ];

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertHeading = (level) => {
    execCommand('formatBlock', `h${level}`);
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="toolbar bg-white/10 border border-white/20 rounded-t-lg p-2 flex flex-wrap gap-1">
        {/* Heading Buttons */}
        <div className="flex gap-1 mr-2">
          <button
            type="button"
            onClick={() => insertHeading(1)}
            className="toolbar-btn text-lg font-bold"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertHeading(2)}
            className="toolbar-btn text-base font-bold"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertHeading(3)}
            className="toolbar-btn text-sm font-bold"
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="border-l border-white/30 mx-2"></div>

        {/* Format Buttons */}
        <div className="flex gap-1 mr-2">
          {formatButtons.map((btn) => (
            <button
              key={btn.command}
              type="button"
              onClick={() => execCommand(btn.command)}
              className="toolbar-btn"
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        <div className="border-l border-white/30 mx-2"></div>

        {/* List Buttons */}
        <div className="flex gap-1 mr-2">
          {listButtons.map((btn) => (
            <button
              key={btn.command}
              type="button"
              onClick={() => execCommand(btn.command)}
              className="toolbar-btn"
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        <div className="border-l border-white/30 mx-2"></div>

        {/* Alignment Buttons */}
        <div className="flex gap-1 mr-2">
          {alignButtons.map((btn) => (
            <button
              key={btn.command}
              type="button"
              onClick={() => execCommand(btn.command)}
              className="toolbar-btn"
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        <div className="border-l border-white/30 mx-2"></div>

        {/* Link Button */}
        <button
          type="button"
          onClick={insertLink}
          className="toolbar-btn"
          title="Insert Link"
        >
          🔗
        </button>

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="toolbar-btn"
          title="Clear Formatting"
        >
          🧹
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="editor-content bg-white/5 border border-white/20 border-t-0 rounded-b-lg p-4 min-h-[200px] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        style={{
          lineHeight: '1.6',
          fontSize: '14px',
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        .toolbar-btn {
          @apply px-2 py-1 text-white bg-white/10 hover:bg-white/20 rounded border border-white/30 transition-colors duration-200 text-sm font-medium;
        }
        
        .toolbar-btn:hover {
          @apply bg-white/20;
        }
        
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }
        
        .editor-content h1 {
          @apply text-2xl font-bold mb-4 text-white;
        }
        
        .editor-content h2 {
          @apply text-xl font-bold mb-3 text-white;
        }
        
        .editor-content h3 {
          @apply text-lg font-bold mb-2 text-white;
        }
        
        .editor-content p {
          @apply mb-2 text-white;
        }
        
        .editor-content ul {
          @apply list-disc list-inside mb-2 text-white;
        }
        
        .editor-content ol {
          @apply list-decimal list-inside mb-2 text-white;
        }
        
        .editor-content li {
          @apply mb-1 text-white;
        }
        
        .editor-content a {
          @apply text-blue-300 underline hover:text-blue-200;
        }
        
        .editor-content strong {
          @apply font-bold text-white;
        }
        
        .editor-content em {
          @apply italic text-white;
        }
        
        .editor-content u {
          @apply underline text-white;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
