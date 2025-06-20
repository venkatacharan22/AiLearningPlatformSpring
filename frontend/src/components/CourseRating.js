import React, { useState } from 'react';
import { Card, Button, Alert } from './ui';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const CourseRating = ({ courseId, isEnrolled, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/courses/${courseId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim()
        })
      });

      if (response.ok) {
        setSubmitted(true);
        if (onRatingSubmitted) {
          onRatingSubmitted();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating || rating);
          return (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-colors duration-150"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              {isFilled ? (
                <StarIconSolid className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarIcon className="h-8 w-8 text-gray-400 hover:text-yellow-400" />
              )}
            </button>
          );
        })}
        <span className="ml-3 text-white font-medium">
          {hoverRating || rating ? `${hoverRating || rating} star${(hoverRating || rating) !== 1 ? 's' : ''}` : 'Select rating'}
        </span>
      </div>
    );
  };

  if (!isEnrolled) {
    return (
      <Card background="transparent" className="p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="text-xl font-bold text-white mb-2">Rate This Course</h3>
          <p className="text-blue-200 mb-4">
            Enroll in this course to leave a rating and help other students!
          </p>
          <div className="flex justify-center">
            {renderStars()}
          </div>
          <p className="text-blue-300 text-sm mt-4">
            💡 You need to be enrolled to rate this course
          </p>
        </div>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card background="transparent" className="p-6">
        <Alert 
          type="success" 
          title="Thank you for your feedback!" 
          message="Your rating has been submitted successfully."
        />
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIconSolid 
                key={star} 
                className={`h-6 w-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`} 
              />
            ))}
            <span className="ml-2 text-white font-medium">{rating} stars</span>
          </div>
          {comment && (
            <div className="bg-white/10 rounded-lg p-3 border border-white/20">
              <p className="text-blue-200 text-sm italic">"{comment}"</p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card background="transparent" className="p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">⭐</div>
        <h3 className="text-xl font-bold text-white mb-2">Rate This Course</h3>
        <p className="text-blue-200">
          Share your experience to help other students make informed decisions
        </p>
      </div>

      {error && (
        <Alert type="error" title="Error" message={error} className="mb-4" />
      )}

      <div className="space-y-6">
        {/* Star Rating */}
        <div className="text-center">
          <label className="block text-white font-medium mb-3">
            How would you rate this course?
          </label>
          {renderStars()}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-white font-medium mb-2">
            Share your thoughts (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like about this course? What could be improved?"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-blue-300 text-sm mt-1">
            {comment.length}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <Button
          variant="primary"
          onClick={handleSubmitRating}
          loading={submitting}
          disabled={rating === 0}
          className="w-full"
        >
          {submitting ? 'Submitting Rating...' : 'Submit Rating'}
        </Button>

        {/* Rating Guidelines */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-medium mb-2">Rating Guidelines</h4>
          <div className="space-y-1 text-blue-200 text-sm">
            <div>⭐ 1 star - Poor quality, major issues</div>
            <div>⭐⭐ 2 stars - Below average, some problems</div>
            <div>⭐⭐⭐ 3 stars - Average, meets basic expectations</div>
            <div>⭐⭐⭐⭐ 4 stars - Good quality, well structured</div>
            <div>⭐⭐⭐⭐⭐ 5 stars - Excellent, highly recommended</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseRating;
