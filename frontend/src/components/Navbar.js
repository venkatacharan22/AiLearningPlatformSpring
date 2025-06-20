import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            🎓 AI Learning Platform
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/courses" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                            Courses
                        </Link>

                        {user ? (
                            <>
                                {user.role === 'STUDENT' && (
                                    <>
                                        <Link to="/student" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                                            Dashboard
                                        </Link>
                                        <Link to="/iq-test" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                                            IQ Test
                                        </Link>
                                    </>
                                )}

                                {user.role === 'INSTRUCTOR' && (
                                    <Link to="/instructor" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                                        Dashboard
                                    </Link>
                                )}

                                <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                                    Profile
                                </Link>

                                <span className="text-gray-700">
                                    Hello, {user.firstName || user.username}!
                                </span>

                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
