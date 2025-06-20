import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await performLogin(formData.username, formData.password);
    };

    const performLogin = async (username, password) => {
        setLoading(true);
        setError('');

        try {
            const user = await login(username, password);
            // Redirect based on user role
            if (user.role === 'INSTRUCTOR') {
                navigate('/instructor');
            } else if (user.role === 'STUDENT') {
                navigate('/student');
            } else {
                navigate('/');
            }
        } catch (error) {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (username, password) => {
        setFormData({ username, password });
        await performLogin(username, password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-blue-200">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="border-t border-white/20 pt-6">
                    <div className="text-center text-white text-sm mb-4">
                        Try Demo Accounts:
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={() => handleDemoLogin('student', 'student123')}
                            disabled={loading}
                            className="w-full bg-blue-600/20 border border-blue-500/50 text-blue-200 py-3 px-4 rounded-lg font-semibold hover:bg-blue-600/30 transition-all duration-200 disabled:opacity-50"
                        >
                            🎓 Student Demo
                            <div className="text-xs text-blue-300 mt-1">Access courses, take IQ tests, track progress</div>
                        </button>
                        <button
                            onClick={() => handleDemoLogin('instructor', 'instructor123')}
                            disabled={loading}
                            className="w-full bg-green-600/20 border border-green-500/50 text-green-200 py-3 px-4 rounded-lg font-semibold hover:bg-green-600/30 transition-all duration-200 disabled:opacity-50"
                        >
                            👨‍🏫 Instructor Demo
                            <div className="text-xs text-green-300 mt-1">Manage courses, view student progress</div>
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-blue-200">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-white font-semibold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
