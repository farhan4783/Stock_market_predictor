import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, TrendingUp, Award, Flame, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const LearnerDashboard = () => {
    const [progress, setProgress] = useState({
        level: 1,
        xp: 0,
        xpToNextLevel: 500,
        streak: 0,
        completedLessons: 0,
        totalLessons: 25,
        badges: []
    });

    const modules = [
        {
            id: 1,
            title: 'Stock Market Basics',
            description: 'Learn the fundamentals of stocks and trading',
            lessons: 5,
            completed: 0,
            icon: BookOpen,
            color: 'from-green-500 to-emerald-600',
            unlocked: true
        },
        {
            id: 2,
            title: 'Technical Analysis',
            description: 'Master charts, indicators, and patterns',
            lessons: 5,
            completed: 0,
            icon: TrendingUp,
            color: 'from-blue-500 to-cyan-600',
            unlocked: false
        },
        {
            id: 3,
            title: 'Fundamental Analysis',
            description: 'Understand company valuation and financials',
            lessons: 5,
            completed: 0,
            icon: Award,
            color: 'from-purple-500 to-pink-600',
            unlocked: false
        }
    ];

    const recentBadges = [
        { id: 1, name: 'First Steps', icon: '🎓', earned: true },
        { id: 2, name: 'Chart Master', icon: '📊', earned: false },
        { id: 3, name: 'Quiz Champion', icon: '🏆', earned: false }
    ];

    const progressPercentage = (progress.completedLessons / progress.totalLessons) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-dark-secondary py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green mb-4">
                        📚 Stock Market Learner
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Master the markets through interactive lessons and gamified learning
                    </p>
                </motion.div>

                {/* User Stats */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Welcome back, Learner!</h2>
                            <p className="text-gray-400">Level {progress.level} - Beginner Trader</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="flex items-center gap-2 text-neon-blue">
                                    <Flame className="w-6 h-6" />
                                    <span className="text-2xl font-bold">{progress.streak}</span>
                                </div>
                                <p className="text-xs text-gray-500">Day Streak</p>
                            </div>
                            <div className="text-center">
                                <div className="text-neon-purple text-2xl font-bold">{progress.xp} XP</div>
                                <p className="text-xs text-gray-500">Total Experience</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Overall Progress</span>
                            <span>{progress.completedLessons}/{progress.totalLessons} lessons</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">{progressPercentage.toFixed(0)}% Complete</p>
                </motion.div>

                {/* Learning Modules */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-neon-blue" />
                        Learning Modules
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {modules.map((module, index) => (
                            <motion.div
                                key={module.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <Link
                                    to={module.unlocked ? `/learner/module/${module.id}` : '#'}
                                    className={`block ${!module.unlocked && 'pointer-events-none'}`}
                                >
                                    <div className={`relative bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 group ${!module.unlocked && 'opacity-50'}`}>
                                        {!module.unlocked && (
                                            <div className="absolute top-4 right-4">
                                                <Lock className="w-6 h-6 text-gray-500" />
                                            </div>
                                        )}

                                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <module.icon className="w-8 h-8 text-white" />
                                        </div>

                                        <h4 className="text-xl font-bold text-white mb-2">{module.title}</h4>
                                        <p className="text-gray-400 text-sm mb-4">{module.description}</p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">{module.lessons} lessons</span>
                                            <span className="text-xs text-neon-blue font-bold">
                                                {module.completed}/{module.lessons} completed
                                            </span>
                                        </div>

                                        {module.unlocked && (
                                            <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${module.color}`}
                                                    style={{ width: `${(module.completed / module.lessons) * 100}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Badges Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Recent Badges
                    </h3>
                    <div className="flex gap-4">
                        {recentBadges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`flex flex-col items-center p-4 rounded-xl border ${badge.earned
                                        ? 'bg-yellow-500/10 border-yellow-500/30'
                                        : 'bg-white/5 border-white/10 opacity-50'
                                    }`}
                            >
                                <div className="text-4xl mb-2">{badge.icon}</div>
                                <p className="text-sm text-white font-medium">{badge.name}</p>
                                {!badge.earned && <p className="text-xs text-gray-500 mt-1">Locked</p>}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex gap-4 justify-center"
                >
                    <Link to="/learner/module/1">
                        <button className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-bold hover:scale-105 transition-transform">
                            Start Learning
                        </button>
                    </Link>
                    <Link to="/learner/simulator">
                        <button className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-bold hover:bg-white/20 transition-colors">
                            Virtual Trading
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default LearnerDashboard;
