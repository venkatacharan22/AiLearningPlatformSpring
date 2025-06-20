import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Alert, Badge, DifficultyBadge, LoadingSpinner, Input } from '../components/ui';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import CourseCard from '../components/CourseCard';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setError('');
            const response = await fetch('http://localhost:8081/api/courses/public');
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            } else {
                setError('Failed to load courses. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Unable to connect to the server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Programming': return '💻';
            case 'Web Development': return '🌐';
            case 'Data Science': return '📊';
            case 'Artificial Intelligence': return '🤖';
            case 'Backend Development': return '⚙️';
            case 'DevOps': return '🔧';
            default: return '📚';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'BEGINNER': return 'bg-green-100 text-green-800';
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
            case 'ADVANCED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || course.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === '' || course.difficulty === selectedDifficulty;
        
        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    const categories = [...new Set(courses.map(course => course.category))];
    const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
                <Card background="transparent" className="text-center">
                    <LoadingSpinner size="xl" color="white" text="Loading courses..." />
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">Course Catalog</h1>
                    <p className="text-blue-200 text-xl">Discover your next learning adventure</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-8">
                        <Alert
                            type="error"
                            title="Error Loading Courses"
                            message={error}
                            dismissible
                            onDismiss={() => setError('')}
                        />
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Search</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search courses..."
                                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category} className="bg-gray-800">
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Difficulty</label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Levels</option>
                                {difficulties.map(difficulty => (
                                    <option key={difficulty} value={difficulty} className="bg-gray-800">
                                        {difficulty}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            variant="enhanced"
                            showEnrollButton={true}
                        />
                    ))}
                </div>

                {filteredCourses.length === 0 && !loading && (
                    <Card background="transparent" className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No courses found</h3>
                        <p className="text-blue-200 mb-6">Try adjusting your search criteria or check back later for new courses.</p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('');
                                setSelectedDifficulty('');
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CourseList;
