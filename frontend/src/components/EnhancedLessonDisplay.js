import React, { useState } from 'react';
import { Card, Button, Badge } from './ui';

const EnhancedLessonDisplay = ({ lesson, isInstructor = false, onEdit, onDelete, onGenerateAI }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showFullContent, setShowFullContent] = useState(false);

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const renderVideoPlayer = (videoUrl) => {
    if (!videoUrl) return null;
    
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) return null;

    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title="Lesson Video"
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  };

  const parseLessonContent = (notes) => {
    if (!notes) return {};

    const sections = {};
    
    // Try to extract structured sections
    const sectionRegex = /<section class="([^"]+)"[^>]*>(.*?)<\/section>/gs;
    let match;
    
    while ((match = sectionRegex.exec(notes)) !== null) {
      const sectionName = match[1];
      const sectionContent = match[2];
      sections[sectionName] = sectionContent;
    }

    // If no structured sections found, try to parse by headings
    if (Object.keys(sections).length === 0) {
      const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>(.*?)(?=<h[1-6]|$)/gs;
      let headingMatch;
      
      while ((headingMatch = headingRegex.exec(notes)) !== null) {
        const heading = headingMatch[1].toLowerCase();
        const content = headingMatch[2];
        
        if (heading.includes('introduction') || heading.includes('objective')) {
          sections.introduction = content;
        } else if (heading.includes('example') || heading.includes('demonstration')) {
          sections.examples = content;
        } else if (heading.includes('exercise') || heading.includes('practice')) {
          sections.exercises = content;
        } else if (heading.includes('takeaway') || heading.includes('summary')) {
          sections.takeaways = content;
        } else if (heading.includes('resource') || heading.includes('reading')) {
          sections.resources = content;
        } else {
          sections['main-content'] = (sections['main-content'] || '') + content;
        }
      }
    }

    // If still no sections, put everything in main content
    if (Object.keys(sections).length === 0) {
      sections['main-content'] = notes;
    }

    return sections;
  };

  const sections = parseLessonContent(lesson.notes);
  const sectionTabs = [
    { id: 'overview', label: '📖 Overview', icon: '📖' },
    { id: 'introduction', label: '🎯 Introduction', icon: '🎯' },
    { id: 'main-content', label: '📚 Main Content', icon: '📚' },
    { id: 'examples', label: '💡 Examples', icon: '💡' },
    { id: 'exercises', label: '🏋️ Exercises', icon: '🏋️' },
    { id: 'takeaways', label: '🎓 Key Points', icon: '🎓' },
    { id: 'resources', label: '📎 Resources', icon: '📎' }
  ].filter(tab => tab.id === 'overview' || sections[tab.id]);

  const renderSection = (sectionId) => {
    if (sectionId === 'overview') {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">📋 Lesson Overview</h3>
            <p className="text-blue-200 text-lg leading-relaxed">{lesson.content}</p>
          </div>
          
          {lesson.videoUrl && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">🎥 Video Content</h3>
              {renderVideoPlayer(lesson.videoUrl)}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card background="gradient" padding="sm">
              <div className="text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="text-white font-semibold">{lesson.durationMinutes} min</div>
                <div className="text-blue-200 text-sm">Duration</div>
              </div>
            </Card>
            
            <Card background="gradient" padding="sm">
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="text-white font-semibold">{sections ? Object.keys(sections).length : 0}</div>
                <div className="text-blue-200 text-sm">Sections</div>
              </div>
            </Card>
            
            <Card background="gradient" padding="sm">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-white font-semibold">Interactive</div>
                <div className="text-blue-200 text-sm">Content</div>
              </div>
            </Card>
          </div>

          {isInstructor && (
            <Card background="gradient" padding="sm">
              <h4 className="text-white font-semibold mb-3">🛠️ Instructor Actions</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={() => onEdit(lesson)}>
                  ✏️ Edit Lesson
                </Button>
                <Button variant="success" size="sm" onClick={() => onGenerateAI(lesson.id)}>
                  🤖 Regenerate AI Content
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(lesson.id)}>
                  🗑️ Delete Lesson
                </Button>
              </div>
            </Card>
          )}
        </div>
      );
    }

    const content = sections[sectionId];
    if (!content) return <div className="text-blue-200">No content available for this section.</div>;

    return (
      <div 
        className="prose prose-invert max-w-none text-blue-100 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  return (
    <Card background="transparent" className="mb-6">
      {/* Lesson Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">{lesson.title}</h2>
          <div className="flex items-center space-x-4 text-blue-200 text-sm">
            <Badge variant="primary" size="sm">
              ⏱️ {lesson.durationMinutes} min
            </Badge>
            {lesson.videoUrl && (
              <Badge variant="success" size="sm">
                🎥 Video included
              </Badge>
            )}
            {lesson.notes && (
              <Badge variant="info" size="sm">
                📝 Rich content
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="border-b border-white/20 mb-6">
        <nav className="flex space-x-1 overflow-x-auto">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeSection === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <div className="min-h-[300px]">
        {renderSection(activeSection)}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? '📄 Structured View' : '📜 Full Content'}
            </Button>
          </div>
          
          <div className="text-blue-300 text-sm">
            Last updated: {lesson.updatedAt ? new Date(lesson.updatedAt).toLocaleDateString() : 'Recently'}
          </div>
        </div>
      </div>

      {/* Full Content View */}
      {showFullContent && lesson.notes && (
        <Card background="gradient" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">📜 Complete Lesson Content</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullContent(false)}
              className="text-white border-white/30 hover:bg-white/10"
            >
              ✕ Close
            </Button>
          </div>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div
              className="prose prose-invert prose-lg max-w-none text-blue-100 leading-relaxed"
              style={{
                '--tw-prose-body': 'rgb(191 219 254)',
                '--tw-prose-headings': 'rgb(255 255 255)',
                '--tw-prose-lead': 'rgb(191 219 254)',
                '--tw-prose-links': 'rgb(96 165 250)',
                '--tw-prose-bold': 'rgb(255 255 255)',
                '--tw-prose-counters': 'rgb(191 219 254)',
                '--tw-prose-bullets': 'rgb(191 219 254)',
                '--tw-prose-hr': 'rgb(255 255 255 / 0.2)',
                '--tw-prose-quotes': 'rgb(191 219 254)',
                '--tw-prose-quote-borders': 'rgb(96 165 250)',
                '--tw-prose-captions': 'rgb(191 219 254)',
                '--tw-prose-code': 'rgb(255 255 255)',
                '--tw-prose-pre-code': 'rgb(191 219 254)',
                '--tw-prose-pre-bg': 'rgb(0 0 0 / 0.3)',
                '--tw-prose-th-borders': 'rgb(255 255 255 / 0.2)',
                '--tw-prose-td-borders': 'rgb(255 255 255 / 0.1)'
              }}
              dangerouslySetInnerHTML={{ __html: lesson.notes }}
            />
          </div>
        </Card>
      )}
    </Card>
  );
};

export default EnhancedLessonDisplay;
