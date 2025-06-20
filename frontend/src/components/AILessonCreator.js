import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, LoadingSpinner } from './ui';
import RichTextEditor from './RichTextEditor';
import { lessonAPI } from '../services/api';

const AILessonCreator = ({ 
  courseId, 
  courseTitle, 
  courseDifficulty, 
  onLessonCreated, 
  onCancel,
  initialLesson = null 
}) => {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: AI Generation, 3: Edit & Finalize
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [lessonData, setLessonData] = useState({
    title: initialLesson?.title || '',
    topic: initialLesson?.topic || '',
    learningObjectives: initialLesson?.learningObjectives || '',
    durationMinutes: initialLesson?.durationMinutes || 45,
    videoUrl: initialLesson?.videoUrl || '',
    difficulty: initialLesson?.difficulty || courseDifficulty || 'BEGINNER'
  });

  const [generatedContent, setGeneratedContent] = useState({
    content: initialLesson?.content || '',
    notes: initialLesson?.notes || '',
    examples: '',
    exercises: '',
    summary: ''
  });

  const [contentSections, setContentSections] = useState({
    introduction: '',
    mainContent: '',
    examples: '',
    practiceExercises: '',
    keyTakeaways: '',
    additionalResources: ''
  });

  // Step 1: Basic Lesson Information
  const renderBasicInfo = () => (
    <Card background="transparent" className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">🎓 Create AI-Powered Lesson</h2>
        <p className="text-blue-200">Let AI help you create comprehensive lesson content</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Lesson Title *
            </label>
            <input
              type="text"
              value={lessonData.title}
              onChange={(e) => setLessonData({...lessonData, title: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Introduction to React Hooks"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={lessonData.durationMinutes}
              onChange={(e) => setLessonData({...lessonData, durationMinutes: parseInt(e.target.value)})}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="15"
              max="180"
            />
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Topic Description *
          </label>
          <textarea
            value={lessonData.topic}
            onChange={(e) => setLessonData({...lessonData, topic: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Describe what this lesson should cover. Be specific about concepts, skills, and outcomes."
            required
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Learning Objectives (Optional)
          </label>
          <textarea
            value={lessonData.learningObjectives}
            onChange={(e) => setLessonData({...lessonData, learningObjectives: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="What should students be able to do after this lesson? (AI will generate if left empty)"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            YouTube Video URL (Optional)
          </label>
          <input
            type="url"
            value={lessonData.videoUrl}
            onChange={(e) => setLessonData({...lessonData, videoUrl: e.target.value})}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setStep(2)}
            disabled={!lessonData.title || !lessonData.topic}
          >
            Generate AI Content →
          </Button>
        </div>
      </div>
    </Card>
  );

  // Step 2: AI Content Generation
  const generateAIContent = async () => {
    setLoading(true);
    setError('');

    try {
      // Generate comprehensive AI content using the new endpoint
      const aiResponse = await lessonAPI.generateLessonContent({
        courseId: courseId,
        title: lessonData.title,
        topic: lessonData.topic,
        difficulty: lessonData.difficulty
      });

      // Parse the AI response into structured sections
      const aiContent = aiResponse.content || '';
      const structuredSections = aiResponse.structured || {};

      // Structure the content into editable sections
      setContentSections({
        introduction: structuredSections.introduction || extractSection(aiContent, 'introduction'),
        mainContent: structuredSections.mainContent || extractSection(aiContent, 'main content'),
        examples: structuredSections.examples || extractSection(aiContent, 'examples'),
        practiceExercises: structuredSections.exercises || extractSection(aiContent, 'exercises'),
        keyTakeaways: structuredSections.takeaways || extractSection(aiContent, 'takeaways'),
        additionalResources: structuredSections.resources || extractSection(aiContent, 'resources')
      });

      setGeneratedContent({
        content: lessonData.topic,
        notes: aiContent,
        examples: structuredSections.examples || '',
        exercises: structuredSections.exercises || '',
        summary: structuredSections.takeaways || ''
      });

      setSuccess('🎉 AI content generated successfully! Review and edit below.');
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate AI content');
    } finally {
      setLoading(false);
    }
  };

  const parseAIContentIntoSections = (content) => {
    // Parse HTML content into structured sections
    const sections = {
      introduction: extractSection(content, 'introduction|overview|learning objectives'),
      mainContent: extractSection(content, 'key concepts|main content|concepts'),
      examples: extractSection(content, 'examples|code snippets|demonstrations'),
      practiceExercises: extractSection(content, 'practice|exercises|activities'),
      keyTakeaways: extractSection(content, 'summary|takeaways|conclusion'),
      additionalResources: extractSection(content, 'resources|further reading|links')
    };

    // If sections are empty, distribute content evenly
    if (!sections.introduction && !sections.mainContent) {
      const contentParts = content.split(/(?=<h[1-6])/);
      sections.introduction = contentParts[0] || '';
      sections.mainContent = contentParts.slice(1, -2).join('') || content;
      sections.keyTakeaways = contentParts[contentParts.length - 1] || '';
    }

    return sections;
  };

  const extractSection = (content, keywords) => {
    const regex = new RegExp(`<h[1-6][^>]*>.*?(${keywords}).*?</h[1-6]>(.*?)(?=<h[1-6]|$)`, 'is');
    const match = content.match(regex);
    return match ? match[2].trim() : '';
  };

  const renderAIGeneration = () => (
    <Card background="transparent" className="max-w-4xl mx-auto text-center">
      <div className="py-12">
        <div className="text-6xl mb-6">🤖</div>
        <h2 className="text-3xl font-bold text-white mb-4">Generating Your Lesson Content</h2>
        <p className="text-blue-200 mb-8">
          Our AI is creating comprehensive, educational content for "{lessonData.title}"
        </p>
        
        <LoadingSpinner size="xl" color="white" />
        
        <div className="mt-8 space-y-2 text-blue-300">
          <p>✨ Analyzing your topic and objectives...</p>
          <p>📚 Creating structured lesson content...</p>
          <p>💡 Generating examples and exercises...</p>
          <p>🎯 Crafting learning outcomes...</p>
        </div>

        <Button 
          variant="primary" 
          onClick={generateAIContent}
          loading={loading}
          className="mt-8"
        >
          Generate Content
        </Button>
      </div>
    </Card>
  );

  // Step 3: Edit and Finalize
  const renderEditContent = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card background="transparent">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">✏️ Edit Your Lesson Content</h2>
          <p className="text-blue-200">Review and customize the AI-generated content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Introduction Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">📖 Introduction & Objectives</h3>
            <RichTextEditor
              value={contentSections.introduction}
              onChange={(content) => setContentSections({...contentSections, introduction: content})}
              placeholder="Lesson introduction and learning objectives..."
              className="mb-4"
            />
          </div>

          {/* Main Content Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">🎯 Main Content</h3>
            <RichTextEditor
              value={contentSections.mainContent}
              onChange={(content) => setContentSections({...contentSections, mainContent: content})}
              placeholder="Core lesson content and concepts..."
              className="mb-4"
            />
          </div>

          {/* Examples Section */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">💡 Examples & Demonstrations</h3>
            <RichTextEditor
              value={contentSections.examples}
              onChange={(content) => setContentSections({...contentSections, examples: content})}
              placeholder="Code examples, demonstrations, and illustrations..."
              className="mb-4"
            />
          </div>

          {/* Practice Exercises */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">🏋️ Practice Exercises</h3>
            <RichTextEditor
              value={contentSections.practiceExercises}
              onChange={(content) => setContentSections({...contentSections, practiceExercises: content})}
              placeholder="Hands-on exercises and activities..."
              className="mb-4"
            />
          </div>

          {/* Key Takeaways */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">🎓 Key Takeaways</h3>
            <RichTextEditor
              value={contentSections.keyTakeaways}
              onChange={(content) => setContentSections({...contentSections, keyTakeaways: content})}
              placeholder="Summary and key points to remember..."
              className="mb-4"
            />
          </div>

          {/* Additional Resources */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">📚 Additional Resources</h3>
            <RichTextEditor
              value={contentSections.additionalResources}
              onChange={(content) => setContentSections({...contentSections, additionalResources: content})}
              placeholder="Links, references, and further reading..."
              className="mb-4"
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="secondary" onClick={() => setStep(2)}>
            ← Regenerate Content
          </Button>
          <div className="space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSaveLesson} loading={loading}>
              💾 Save Lesson
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const handleSaveLesson = async () => {
    setLoading(true);
    setError('');

    try {
      // Combine all sections into comprehensive lesson content
      const combinedNotes = `
        <div class="lesson-content">
          <section class="introduction">
            <h2>📖 Introduction & Learning Objectives</h2>
            ${contentSections.introduction}
          </section>
          
          <section class="main-content">
            <h2>🎯 Main Content</h2>
            ${contentSections.mainContent}
          </section>
          
          <section class="examples">
            <h2>💡 Examples & Demonstrations</h2>
            ${contentSections.examples}
          </section>
          
          <section class="exercises">
            <h2>🏋️ Practice Exercises</h2>
            ${contentSections.practiceExercises}
          </section>
          
          <section class="takeaways">
            <h2>🎓 Key Takeaways</h2>
            ${contentSections.keyTakeaways}
          </section>
          
          <section class="resources">
            <h2>📚 Additional Resources</h2>
            ${contentSections.additionalResources}
          </section>
        </div>
      `;

      const finalLesson = {
        title: lessonData.title,
        content: lessonData.topic,
        notes: combinedNotes,
        durationMinutes: lessonData.durationMinutes,
        videoUrl: lessonData.videoUrl,
        type: 'LESSON'
      };

      const savedLesson = await lessonAPI.addLesson(courseId, finalLesson);
      setSuccess('🎉 Lesson created successfully!');
      
      if (onLessonCreated) {
        onLessonCreated(savedLesson);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= stepNum ? 'bg-blue-600 text-white' : 'bg-white/20 text-blue-300'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNum ? 'bg-blue-600' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2 space-x-8 text-sm text-blue-200">
          <span>Basic Info</span>
          <span>AI Generation</span>
          <span>Edit & Finalize</span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <Alert type="error" title="Error" message={error} dismissible onDismiss={() => setError('')} />
        </div>
      )}
      
      {success && (
        <div className="max-w-4xl mx-auto mb-6">
          <Alert type="success" title="Success" message={success} dismissible onDismiss={() => setSuccess('')} />
        </div>
      )}

      {/* Step Content */}
      {step === 1 && renderBasicInfo()}
      {step === 2 && renderAIGeneration()}
      {step === 3 && renderEditContent()}
    </div>
  );
};

export default AILessonCreator;
