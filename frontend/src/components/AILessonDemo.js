import React, { useState } from 'react';
import { Card, Button, Alert, Badge } from './ui';

const AILessonDemo = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "🎯 Smart Topic Analysis",
      description: "AI analyzes your lesson topic and creates comprehensive learning objectives",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-900/30 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Input:</h4>
            <p className="text-blue-200">"Introduction to React Hooks"</p>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">AI Generated Objectives:</h4>
            <ul className="text-green-200 space-y-1">
              <li>• Understand the purpose and benefits of React Hooks</li>
              <li>• Learn to implement useState and useEffect hooks</li>
              <li>• Practice converting class components to functional components</li>
              <li>• Master hook rules and best practices</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "📚 Comprehensive Content Creation",
      description: "AI generates structured, educational content with examples and explanations",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card background="gradient" padding="sm">
              <h4 className="text-white font-semibold mb-2">📖 Introduction</h4>
              <p className="text-blue-200 text-sm">Engaging lesson opener with context and motivation</p>
            </Card>
            <Card background="gradient" padding="sm">
              <h4 className="text-white font-semibold mb-2">🎯 Core Concepts</h4>
              <p className="text-blue-200 text-sm">Detailed explanations with step-by-step breakdowns</p>
            </Card>
            <Card background="gradient" padding="sm">
              <h4 className="text-white font-semibold mb-2">💡 Examples</h4>
              <p className="text-blue-200 text-sm">Practical code examples with detailed comments</p>
            </Card>
            <Card background="gradient" padding="sm">
              <h4 className="text-white font-semibold mb-2">🏋️ Exercises</h4>
              <p className="text-blue-200 text-sm">Hands-on practice activities and challenges</p>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "✏️ Instructor Customization",
      description: "Full editing control with rich text editor and section-by-section customization",
      content: (
        <div className="space-y-4">
          <Alert type="info" title="Complete Editorial Control" message="Every AI-generated section is fully editable with our rich text editor" />
          <div className="bg-purple-900/30 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">🛠️ Editing Features:</h4>
            <div className="grid grid-cols-2 gap-2 text-purple-200 text-sm">
              <div>• Rich text formatting</div>
              <div>• Code syntax highlighting</div>
              <div>• Image and media insertion</div>
              <div>• Interactive elements</div>
              <div>• Custom styling options</div>
              <div>• Section reorganization</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🔄 AI Regeneration",
      description: "Don't like the content? Regenerate with different approaches and styles",
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-900/30 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">🤖 Smart Regeneration:</h4>
            <ul className="text-indigo-200 space-y-2">
              <li>• Alternative explanations and approaches</li>
              <li>• Different examples and use cases</li>
              <li>• Varied difficulty levels</li>
              <li>• Fresh perspective on the same topic</li>
            </ul>
          </div>
          <Badge variant="gradient-blue" size="lg" className="w-full justify-center">
            🎯 Perfect content every time with AI assistance
          </Badge>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card background="transparent" className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            🤖 AI-Powered Lesson Creation
          </h2>
          <p className="text-blue-200">
            See how AI transforms your ideas into comprehensive educational content
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {demoSteps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                index <= currentStep ? 'bg-blue-600 text-white' : 'bg-white/20 text-blue-300'
              }`}>
                {index + 1}
              </div>
              {index < demoSteps.length - 1 && (
                <div className={`w-16 h-1 mx-2 transition-colors ${
                  index < currentStep ? 'bg-blue-600' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {demoSteps[currentStep].title}
            </h3>
            <p className="text-blue-200">
              {demoSteps[currentStep].description}
            </p>
          </div>
          
          {demoSteps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="secondary" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            ← Previous
          </Button>

          <div className="text-blue-200 text-sm">
            Step {currentStep + 1} of {demoSteps.length}
          </div>

          {currentStep < demoSteps.length - 1 ? (
            <Button variant="primary" onClick={nextStep}>
              Next →
            </Button>
          ) : (
            <Button variant="success" onClick={onClose}>
              🚀 Start Creating!
            </Button>
          )}
        </div>

        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <h4 className="text-white font-semibold mb-4 text-center">✨ Key Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-white font-medium">Lightning Fast</div>
              <div className="text-blue-200 text-sm">Generate lessons in seconds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-white font-medium">Highly Accurate</div>
              <div className="text-blue-200 text-sm">Educational best practices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔧</div>
              <div className="text-white font-medium">Fully Customizable</div>
              <div className="text-blue-200 text-sm">Edit everything to your needs</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AILessonDemo;
