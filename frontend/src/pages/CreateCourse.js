import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiAPI, courseAPI, assignmentAPI } from '../services/api';

const CreateCourse = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [step, setStep] = useState(1); // 1: Topic Input, 2: AI Generation, 3: Review & Edit, 4: Assignment Creation, 5: Final Creation

  // AI-powered course creation
  const [courseTopicInput, setCourseTopicInput] = useState('');
  const [aiGeneratedContent, setAiGeneratedContent] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'BEGINNER',
    estimatedHours: '',
    outline: '',
    summary: ''
  });
  const [lessons, setLessons] = useState([
    { title: '', content: '', durationMinutes: '', videoUrl: '' }
  ]);
  const [expandedLessons, setExpandedLessons] = useState({}); // Track which lesson explanations are expanded
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Assignment creation state
  const [createAssignments, setCreateAssignments] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState('ai'); // 'ai', 'codeforces', 'skip'
  const [assignmentSettings, setAssignmentSettings] = useState({
    difficulty: 'MEDIUM',
    programmingLanguage: 'java',
    problemCount: 3
  });
  const [assignmentPreference, setAssignmentPreference] = useState('ai'); // User's preference for assignment type
  const [createdCourseId, setCreatedCourseId] = useState(null);

  // Redirect if not an instructor
  if (!user || user.role !== 'INSTRUCTOR') {
    return <Navigate to="/login" replace />;
  }

  const categories = [
    'Programming',
    'Web Development',
    'Data Science',
    'Artificial Intelligence',
    'Backend Development',
    'DevOps',
    'Mobile Development',
    'Database',
    'Cybersecurity',
    'Cloud Computing'
  ];

  // AI Course Generation Functions
  const generateCourseWithAI = async () => {
    if (!courseTopicInput.trim()) {
      setError('Please enter a course topic');
      return;
    }

    setAiGenerating(true);
    setError('');

    try {
      console.log('🤖 Generating course content for:', courseTopicInput);

      // Step 1: Generate course content using AI
      const courseData = await aiAPI.generateCourse({
        topic: courseTopicInput,
        difficulty: 'INTERMEDIATE' // Default, can be changed later
      });
      console.log('📚 Generated course data:', courseData);

      // Step 2: Search for YouTube videos
      console.log('🎥 Searching for YouTube videos...');
      try {
        const videoSearchData = {
          courseTitle: courseData.title,
          topics: courseData.lessons.map(lesson => lesson.title)
        };

        const videos = await aiAPI.findYouTubeVideos(videoSearchData);
        setYoutubeVideos(videos);
        console.log('✅ Found', videos.length, 'YouTube videos');
      } catch (videoError) {
        console.warn('⚠️ Video search failed:', videoError);
        setYoutubeVideos([]); // Continue without videos
      }

      // Set the generated content
      setAiGeneratedContent(courseData);
      setFormData({
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        difficulty: courseData.difficulty,
        estimatedHours: courseData.estimatedHours,
        outline: courseData.outline,
        summary: courseData.summary
      });

      setLessons(courseData.lessons.map((lesson, index) => ({
        title: lesson.title,
        content: lesson.content,
        explanation: lesson.explanation || lesson.notes || '',
        durationMinutes: lesson.durationMinutes,
        videoUrl: '',
        order: index + 1
      })));

      setStep(2); // Move to review step

    } catch (error) {
      console.error('❌ Error generating course:', error);
      setError('Failed to generate course content. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Video Selection Functions
  const selectVideoForLesson = (lessonIndex, video) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].videoUrl = video.url;
    setLessons(updatedLessons);

    // Add to selected videos if not already selected
    if (!selectedVideos.find(v => v.url === video.url)) {
      setSelectedVideos([...selectedVideos, { ...video, lessonIndex }]);
    }
  };

  const removeVideoFromLesson = (lessonIndex) => {
    const updatedLessons = [...lessons];
    const videoUrl = updatedLessons[lessonIndex].videoUrl;
    updatedLessons[lessonIndex].videoUrl = '';
    setLessons(updatedLessons);

    // Remove from selected videos
    setSelectedVideos(selectedVideos.filter(v => v.url !== videoUrl));
  };

  const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Automatic assignment creation based on course content
  const createAutomaticAssignments = async (courseId) => {
    try {
      const assignmentData = {
        courseId: courseId,
        topic: formData.title,
        difficulty: assignmentSettings.difficulty,
        programmingLanguage: assignmentSettings.programmingLanguage
      };

      if (assignmentPreference === 'ai') {
        // Create 3-5 AI-generated assignments
        for (let i = 1; i <= 3; i++) {
          await assignmentAPI.generateAssignment({
            ...assignmentData,
            title: `${formData.title} - Assignment ${i}`,
            description: `Practice assignment ${i} for ${formData.title}`
          });
        }
        setSuccess('🎉 Course and AI assignments created successfully!');
      } else if (assignmentPreference === 'codeforces') {
        // Create Codeforces-based assignments
        await assignmentAPI.generateWithCodeforces({
          ...assignmentData,
          problemCount: assignmentSettings.problemCount
        });
        setSuccess('🎉 Course and Codeforces assignments created successfully!');
      }
    } catch (error) {
      console.warn('⚠️ Assignment creation failed:', error);
      setSuccess('🎉 Course created successfully! (Assignment creation failed, but you can add them manually later)');
    }
  };

  const createSkippedAssignments = async (courseId) => {
    try {
      // Create placeholder assignments to show that assignments were skipped
      const placeholderAssignments = [
        {
          title: `${formData.title} - Assignment 1 (Skipped)`,
          description: 'This assignment was skipped during course creation. You can add assignments later.',
          type: 'CODING',
          difficulty: 'EASY',
          source: 'SKIPPED'
        },
        {
          title: `${formData.title} - Assignment 2 (Skipped)`,
          description: 'This assignment was skipped during course creation. You can add assignments later.',
          type: 'CODING',
          difficulty: 'MEDIUM',
          source: 'SKIPPED'
        },
        {
          title: `${formData.title} - Assignment 3 (Skipped)`,
          description: 'This assignment was skipped during course creation. You can add assignments later.',
          type: 'CODING',
          difficulty: 'HARD',
          source: 'SKIPPED'
        }
      ];

      for (const assignment of placeholderAssignments) {
        await assignmentAPI.createSkippedAssignment({
          courseId: courseId,
          ...assignment
        });
      }

      setSuccess('🎉 Course created with placeholder assignments!');
    } catch (error) {
      console.error('Placeholder assignment creation failed:', error);
      setSuccess('🎉 Course created successfully!');
    }
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[index][field] = value;
    setLessons(updatedLessons);
  };

  const addLesson = () => {
    setLessons([...lessons, { title: '', content: '', explanation: '', durationMinutes: '', videoUrl: '' }]);
  };

  const removeLesson = (index) => {
    if (lessons.length > 1) {
      const updatedLessons = lessons.filter((_, i) => i !== index);
      setLessons(updatedLessons);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare course data with video URLs and lesson explanations
      const courseData = {
        ...formData,
        estimatedHours: parseInt(formData.estimatedHours) || 1,
        lessons: lessons.filter(lesson => lesson.title && lesson.content).map((lesson, index) => ({
          ...lesson,
          durationMinutes: parseInt(lesson.durationMinutes) || 30,
          order: index + 1,
          videoUrl: lesson.videoUrl || null,
          notes: lesson.explanation || '' // Include AI-generated explanation as lesson notes
        }))
      };

      console.log('📤 Creating course with data:', courseData);

      const createdCourse = await courseAPI.createCourse(courseData);
      setCreatedCourseId(createdCourse.id);
      setSuccess('🎉 Course created successfully! Publishing course...');

      // Automatically publish the course so it appears in the catalog
      try {
        await courseAPI.publishCourse(createdCourse.id);
        console.log('✅ Course published successfully');
        setSuccess('🎉 Course created and published successfully! Generating quiz...');
      } catch (publishError) {
        console.warn('⚠️ Course publishing failed:', publishError);
        setSuccess('🎉 Course created successfully! (Publishing failed, but you can publish it manually later)');
      }

      // Generate AI quiz for the course automatically
      try {
        await courseAPI.generateQuiz(createdCourse.id, { numberOfQuestions: 5 });
        console.log('✅ Quiz generated successfully for course');
      } catch (quizError) {
        console.warn('⚠️ Quiz generation failed:', quizError);
      }

      // Automatically create assignments based on user preference
      if (assignmentPreference !== 'skip') {
        setSuccess('🎉 Course created successfully! Creating assignments...');
        await createAutomaticAssignments(createdCourse.id);
      } else {
        setSuccess('🎉 Course created successfully! Creating placeholder assignments...');
        await createSkippedAssignments(createdCourse.id);
      }

      // Navigate to course detail page
      setTimeout(() => {
        navigate(`/courses/${createdCourse.id}`);
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const proceedToReview = () => {
    setStep(3);
  };

  const backToGeneration = () => {
    setStep(2);
  };

  const proceedToAssignments = () => {
    setStep(4);
  };

  const backToReview = () => {
    setStep(3);
  };

  const handleAssignmentCreation = async () => {
    if (assignmentMode === 'skip') {
      // Skip assignment creation and go to instructor dashboard
      navigate('/instructor');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const assignmentData = {
        courseId: createdCourseId,
        topic: formData.title,
        difficulty: assignmentSettings.difficulty,
        programmingLanguage: assignmentSettings.programmingLanguage
      };

      if (assignmentMode === 'ai') {
        await assignmentAPI.generateAssignment(assignmentData);
        setSuccess('🎉 AI assignment generated successfully!');
      } else if (assignmentMode === 'codeforces') {
        await assignmentAPI.generateWithCodeforces({
          ...assignmentData,
          problemCount: assignmentSettings.problemCount
        });
        setSuccess('🎉 Codeforces assignment generated successfully!');
      }

      setTimeout(() => {
        navigate(`/courses/${createdCourseId}/assignments`);
      }, 2000);
    } catch (error) {
      setError('Failed to create assignment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setStep(1);
    setCourseTopicInput('');
    setAiGeneratedContent(null);
    setYoutubeVideos([]);
    setSelectedVideos([]);
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'BEGINNER',
      estimatedHours: '',
      outline: '',
      summary: ''
    });
    setLessons([{ title: '', content: '', explanation: '', durationMinutes: '', videoUrl: '' }]);
    setError('');
    setSuccess('');
    setCreateAssignments(false);
    setCreatedCourseId(null);
  };

  // Step 1: Topic Input UI
  const renderTopicInput = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-2">🤖 AI-Powered Course Creator</h1>
        <p className="text-blue-200 text-lg">Simply tell us what you want to teach, and our AI will create a complete course with YouTube videos!</p>
      </div>

      {/* Topic Input */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-4">What do you want to teach?</h2>
          <p className="text-blue-200 text-lg mb-8">
            Enter any topic and our AI will generate a complete course structure with lessons, content, and relevant YouTube videos
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <label className="block text-white text-lg font-medium mb-4 text-center">
              Course Topic
            </label>
            <input
              type="text"
              value={courseTopicInput}
              onChange={(e) => setCourseTopicInput(e.target.value)}
              className="w-full px-6 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-center"
              placeholder="e.g., React.js for Beginners, Python Data Science, Machine Learning Basics..."
              onKeyPress={(e) => e.key === 'Enter' && generateCourseWithAI()}
            />
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={generateCourseWithAI}
              disabled={aiGenerating || !courseTopicInput.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Generating Course with AI...
                </div>
              ) : (
                '🚀 Generate Course with AI'
              )}
            </button>

            <p className="text-blue-200 text-sm">
              ✨ AI will create course structure, lessons with detailed explanations, and find relevant YouTube videos
            </p>
          </div>
        </div>

        {/* Example Topics */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white mb-6 text-center">💡 Example Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'JavaScript Fundamentals',
              'Python for Data Science',
              'React.js Complete Guide',
              'Machine Learning Basics',
              'Node.js Backend Development',
              'CSS Grid and Flexbox'
            ].map((topic, index) => (
              <button
                key={index}
                onClick={() => setCourseTopicInput(topic)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-white transition-all duration-200"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: AI Generation Results & Video Selection UI
  const renderVideoSelection = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🎥 Select YouTube Videos</h1>
            <p className="text-blue-200">Choose the best videos for each lesson</p>
          </div>
          <button
            onClick={proceedToReview}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
          >
            Continue to Review →
          </button>
        </div>
      </div>

      {/* Course Overview */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">📚 Generated Course: {aiGeneratedContent?.title}</h2>
        <p className="text-blue-200 mb-4">{aiGeneratedContent?.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="text-blue-200 text-sm">Category</div>
            <div className="text-white font-semibold">{aiGeneratedContent?.category}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="text-blue-200 text-sm">Difficulty</div>
            <div className="text-white font-semibold">{aiGeneratedContent?.difficulty}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="text-blue-200 text-sm">Duration</div>
            <div className="text-white font-semibold">{aiGeneratedContent?.estimatedHours} hours</div>
          </div>
        </div>
      </div>

      {/* Lessons with Video Selection */}
      <div className="space-y-6">
        {lessons.map((lesson, lessonIndex) => (
          <div key={lessonIndex} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                📖 Lesson {lessonIndex + 1}: {lesson.title}
              </h3>
              <span className="text-blue-200 text-sm">{lesson.durationMinutes} minutes</span>
            </div>

            <p className="text-blue-200 mb-4">{lesson.content}</p>

            {/* AI-Generated Lesson Explanation Preview */}
            {lesson.explanation && (
              <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center mb-3">
                  <span className="text-green-400 text-sm font-semibold">🤖 AI-Generated Lesson Explanation</span>
                </div>
                <div
                  className="text-blue-100 text-sm prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: lesson.explanation.length > 300
                      ? lesson.explanation.substring(0, 300) + '...'
                      : lesson.explanation
                  }}
                />
                {lesson.explanation.length > 300 && (
                  <p className="text-blue-300 text-xs mt-2 italic">
                    Full explanation available in review step
                  </p>
                )}
              </div>
            )}

            {/* Selected Video */}
            {lesson.videoUrl && (
              <div className="mb-6 bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">✅ Selected Video</h4>
                  <button
                    onClick={() => removeVideoFromLesson(lessonIndex)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(lesson.videoUrl)}`}
                    title={`Video for ${lesson.title}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Available Videos */}
            {!lesson.videoUrl && youtubeVideos.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-4">🎥 Recommended Videos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {youtubeVideos
                    .filter(video =>
                      video.title.toLowerCase().includes(lesson.title.toLowerCase().split(' ')[0]) ||
                      lesson.title.toLowerCase().includes(video.title.toLowerCase().split(' ')[0])
                    )
                    .slice(0, 6)
                    .map((video, videoIndex) => (
                      <div key={videoIndex} className="bg-white/10 rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-200">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.url)}`}
                            title={video.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                          ></iframe>
                        </div>
                        <h5 className="text-white text-sm font-medium mb-2 line-clamp-2">{video.title}</h5>
                        <p className="text-blue-200 text-xs mb-3 line-clamp-2">{video.description}</p>
                        <button
                          onClick={() => selectVideoForLesson(lessonIndex, video)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                        >
                          Select This Video
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {youtubeVideos.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-blue-200">No videos found for this lesson. You can add videos manually later.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={startOver}
          className="bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200"
        >
          ← Start Over
        </button>
        <button
          onClick={proceedToReview}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
        >
          Continue to Review →
        </button>
      </div>
    </div>
  );

  // Step 3: Review & Edit UI
  const renderReviewAndEdit = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2">📝 Review & Finalize Course</h1>
        <p className="text-blue-200">Review the generated content and make any final adjustments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">📚 Course Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" className="bg-gray-800">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-800">{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BEGINNER" className="bg-gray-800">BEGINNER</option>
                <option value="INTERMEDIATE" className="bg-gray-800">INTERMEDIATE</option>
                <option value="ADVANCED" className="bg-gray-800">ADVANCED</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Estimated Hours</label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-white text-sm font-medium mb-2">Course Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Lessons Summary with AI Explanations */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">📖 Course Lessons with AI Explanations ({lessons.length})</h2>
          <div className="space-y-6">
            {lessons.map((lesson, index) => (
              <div key={index} className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-lg">Lesson {index + 1}: {lesson.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-200 text-sm">{lesson.durationMinutes} min</span>
                    {lesson.videoUrl && <span className="text-green-400 text-sm">🎥 Video</span>}
                  </div>
                </div>

                <p className="text-blue-200 text-sm mb-4">{lesson.content}</p>

                {/* AI-Generated Explanation Section */}
                {lesson.explanation && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-green-400 text-sm font-semibold flex items-center">
                        🤖 AI-Generated Lesson Explanation
                      </span>
                      <button
                        onClick={() => setExpandedLessons(prev => ({
                          ...prev,
                          [index]: !prev[index]
                        }))}
                        className="text-blue-300 hover:text-blue-200 text-sm"
                      >
                        {expandedLessons[index] ? 'Collapse' : 'Expand & Edit'}
                      </button>
                    </div>

                    {expandedLessons[index] ? (
                      <div className="space-y-4">
                        <textarea
                          value={lesson.explanation}
                          onChange={(e) => handleLessonChange(index, 'explanation', e.target.value)}
                          className="w-full h-64 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Edit the AI-generated lesson explanation..."
                        />
                        <p className="text-blue-300 text-xs">
                          💡 You can edit this AI-generated explanation to match your teaching style
                        </p>
                      </div>
                    ) : (
                      <div
                        className="text-blue-100 text-sm prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: lesson.explanation.length > 200
                            ? lesson.explanation.substring(0, 200) + '...'
                            : lesson.explanation
                        }}
                      />
                    )}
                  </div>
                )}

                {!lesson.explanation && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ No AI explanation generated for this lesson. You can add one manually later.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Preferences */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">🎯 Assignment Creation</h2>
          <p className="text-blue-200 mb-4">Choose how you want assignments to be created for your course:</p>

          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                assignmentPreference === 'ai'
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-white/20 bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => setAssignmentPreference('ai')}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="assignmentType"
                  value="ai"
                  checked={assignmentPreference === 'ai'}
                  onChange={() => setAssignmentPreference('ai')}
                  className="mr-3"
                />
                <div>
                  <h3 className="text-white font-semibold">🤖 AI-Generated Assignments</h3>
                  <p className="text-blue-200 text-sm">Create custom programming assignments using AI based on your course content</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                assignmentPreference === 'codeforces'
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-white/20 bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => setAssignmentPreference('codeforces')}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="assignmentType"
                  value="codeforces"
                  checked={assignmentPreference === 'codeforces'}
                  onChange={() => setAssignmentPreference('codeforces')}
                  className="mr-3"
                />
                <div>
                  <h3 className="text-white font-semibold">🏆 Codeforces Problems</h3>
                  <p className="text-blue-200 text-sm">Use curated problems from Codeforces competitive programming platform</p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                assignmentPreference === 'skip'
                  ? 'border-gray-500 bg-gray-500/20'
                  : 'border-white/20 bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => setAssignmentPreference('skip')}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="assignmentType"
                  value="skip"
                  checked={assignmentPreference === 'skip'}
                  onChange={() => setAssignmentPreference('skip')}
                  className="mr-3"
                />
                <div>
                  <h3 className="text-white font-semibold">⏭️ Skip for Now</h3>
                  <p className="text-blue-200 text-sm">Create the course without assignments (you can add them later)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={backToGeneration}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            ← Back to Videos
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Course...
              </div>
            ) : (
              '🚀 Create Course & Generate Quiz'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Step 4: Assignment Creation UI
  const renderAssignmentCreation = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-2">🎯 Create Assignments</h1>
        <p className="text-blue-200">Add programming assignments to your course (optional)</p>
      </div>

      {/* Assignment Options */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Choose Assignment Type</h2>

        <div className="space-y-4 mb-8">
          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              assignmentMode === 'ai'
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-white/20 bg-white/10 hover:bg-white/20'
            }`}
            onClick={() => setAssignmentMode('ai')}
          >
            <div className="flex items-center mb-2">
              <div className="text-2xl mr-3">🤖</div>
              <h3 className="text-white font-semibold text-lg">AI-Generated Assignment</h3>
            </div>
            <p className="text-blue-200 text-sm ml-11">
              Let AI create custom programming problems based on your course content
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              assignmentMode === 'codeforces'
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-white/20 bg-white/10 hover:bg-white/20'
            }`}
            onClick={() => setAssignmentMode('codeforces')}
          >
            <div className="flex items-center mb-2">
              <div className="text-2xl mr-3">🏆</div>
              <h3 className="text-white font-semibold text-lg">Codeforces Problems</h3>
            </div>
            <p className="text-blue-200 text-sm ml-11">
              Use curated problems from Codeforces competitive programming platform
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              assignmentMode === 'skip'
                ? 'border-gray-500 bg-gray-500/20'
                : 'border-white/20 bg-white/10 hover:bg-white/20'
            }`}
            onClick={() => setAssignmentMode('skip')}
          >
            <div className="flex items-center mb-2">
              <div className="text-2xl mr-3">⏭️</div>
              <h3 className="text-white font-semibold text-lg">Skip for Now</h3>
            </div>
            <p className="text-blue-200 text-sm ml-11">
              Create the course without assignments (you can add them later)
            </p>
          </div>
        </div>

        {/* Assignment Settings */}
        {(assignmentMode === 'ai' || assignmentMode === 'codeforces') && (
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 mb-8">
            <h3 className="text-white font-semibold text-lg mb-4">Assignment Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Difficulty Level</label>
                <select
                  value={assignmentSettings.difficulty}
                  onChange={(e) => setAssignmentSettings({...assignmentSettings, difficulty: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EASY" className="bg-gray-800">EASY</option>
                  <option value="MEDIUM" className="bg-gray-800">MEDIUM</option>
                  <option value="HARD" className="bg-gray-800">HARD</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Programming Language</label>
                <select
                  value={assignmentSettings.programmingLanguage}
                  onChange={(e) => setAssignmentSettings({...assignmentSettings, programmingLanguage: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="java" className="bg-gray-800">Java</option>
                  <option value="python" className="bg-gray-800">Python</option>
                  <option value="cpp" className="bg-gray-800">C++</option>
                  <option value="javascript" className="bg-gray-800">JavaScript</option>
                </select>
              </div>

              {assignmentMode === 'codeforces' && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Number of Problems</label>
                  <select
                    value={assignmentSettings.problemCount}
                    onChange={(e) => setAssignmentSettings({...assignmentSettings, problemCount: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1} className="bg-gray-800">1 Problem</option>
                    <option value={3} className="bg-gray-800">3 Problems</option>
                    <option value={5} className="bg-gray-800">5 Problems</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={backToReview}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            ← Back to Review
          </button>
          <button
            onClick={handleAssignmentCreation}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {assignmentMode === 'skip' ? 'Finishing...' : 'Creating Assignment...'}
              </div>
            ) : (
              assignmentMode === 'skip' ? '✅ Finish Course Creation' : '🎯 Create Assignment'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
      {step === 1 && renderTopicInput()}
      {step === 2 && renderVideoSelection()}
      {step === 3 && renderReviewAndEdit()}
      {step === 4 && renderAssignmentCreation()}

      {/* Error Display */}
      {error && step === 1 && (
        <div className="fixed bottom-4 right-4 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default CreateCourse;
