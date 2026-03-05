import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, TrendingUp, Award, Flame, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PROGRESS_KEY = 'neurostock-learner-progress';

const DEFAULT_PROGRESS = {
    level: 1,
    xp: 0,
    xpToNextLevel: 500,
    streak: 1,
    completedLessons: 0,
    totalLessons: 15,
    unlockedModules: [1],
    completedModules: [],
    lastVisit: new Date().toDateString(),
    badges: ['First Steps'],
};

const loadProgress = () => {
    try {
        const saved = localStorage.getItem(PROGRESS_KEY);
        if (saved) return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
    } catch { }
    return DEFAULT_PROGRESS;
};

const MODULES = [
    {
        id: 1,
        title: 'Stock Market Basics',
        description: 'Learn the fundamentals of stocks, markets, and order types',
        lessons: 5,
        icon: BookOpen,
        color: 'from-green-500 to-emerald-600',
    },
    {
        id: 2,
        title: 'Technical Analysis',
        description: 'Master moving averages, RSI, MACD, and chart patterns',
        lessons: 5,
        icon: TrendingUp,
        color: 'from-blue-500 to-cyan-600',
    },
    {
        id: 3,
        title: 'Fundamental Analysis',
        description: 'Understand company valuation, PE ratios, and financials',
        lessons: 5,
        icon: Award,
        color: 'from-purple-500 to-pink-600',
    },
];

const ALL_BADGES = [
    { id: 'First Steps', icon: '🎓', desc: 'Start your learning journey' },
    { id: 'Module 1 Complete', icon: '📘', desc: 'Complete Stock Basics' },
    { id: 'Chart Master', icon: '📊', desc: 'Complete Technical Analysis' },
    { id: 'Quiz Champion', icon: '🏆', desc: 'Pass all quizzes' },
    { id: 'Trader', icon: '💹', desc: 'Make a virtual trade' },
];

const LearnerDashboard = () => {
    const [progress, setProgress] = useState(loadProgress);

    // Save progress to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    }, [progress]);

    // Update streak on daily visit
    useEffect(() => {
        const today = new Date().toDateString();
        if (progress.lastVisit !== today) {
            setProgress(prev => ({
                ...prev,
                streak: prev.streak + 1,
                lastVisit: today,
            }));
        }
    }, []);

    const xpPercent = Math.min((progress.xp / progress.xpToNextLevel) * 100, 100);
    const progressPct = Math.round((progress.completedLessons / progress.totalLessons) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-dark-secondary py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green mb-3">
                        📚 Stock Market Learner
                    </h1>
                    <p className="text-gray-400">Master the markets through interactive lessons and gamified learning</p>
                </motion.div>

                {/* User Stats */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8"
                >
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Welcome back, Learner!</h2>
                            <p className="text-gray-400">Level {progress.level} — {progress.xp} / {progress.xpToNextLevel} XP</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="flex items-center gap-2 text-neon-blue">
                                    <Flame className="w-6 h-6" />
                                    <span className="text-2xl font-bold">{progress.streak}</span>
                                </div>
                                <p className="text-xs text-gray-500">Day Streak</p>
                            </div>
                            <div className="text-center">
                                <div className="text-neon-purple text-2xl font-bold">{progress.xp} XP</div>
                                <p className="text-xs text-gray-500">Total XP</p>
                            </div>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Level Progress</span>
                            <span>{progress.xp}/{progress.xpToNextLevel} XP</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpPercent}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                            />
                        </div>
                    </div>

                    {/* Overall progress */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Overall Progress</span>
                            <span>{progress.completedLessons}/{progress.totalLessons} lessons ({progressPct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Modules */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-neon-blue" />
                        Learning Modules
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {MODULES.map((module, index) => {
                            const unlocked = progress.unlockedModules.includes(module.id);
                            const completed = progress.completedModules.includes(module.id);
                            const completedLessonsInModule = Math.min(
                                Math.max(0, progress.completedLessons - (module.id - 1) * 5),
                                module.lessons
                            );

                            return (
                                <motion.div
                                    key={module.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                >
                                    <Link
                                        to={unlocked ? `/learner/module/${module.id}` : '#'}
                                        className={`block ${!unlocked && 'pointer-events-none'}`}
                                    >
                                        <div className={`relative bg-white/5 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 group ${unlocked
                                            ? 'border-white/10 hover:border-white/30 hover:bg-white/8 cursor-pointer'
                                            : 'border-white/5 opacity-50'
                                            }`}>
                                            {completed && (
                                                <div className="absolute top-4 right-4">
                                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                                </div>
                                            )}
                                            {!unlocked && (
                                                <div className="absolute top-4 right-4">
                                                    <Lock className="w-6 h-6 text-gray-500" />
                                                </div>
                                            )}

                                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                                <module.icon className="w-8 h-8 text-white" />
                                            </div>

                                            <h4 className="text-xl font-bold text-white mb-2">{module.title}</h4>
                                            <p className="text-gray-400 text-sm mb-4">{module.description}</p>

                                            <div className="flex items-center justify-between text-xs mb-2">
                                                <span className="text-gray-500">{module.lessons} lessons</span>
                                                <span className="text-neon-blue font-bold">
                                                    {completedLessonsInModule}/{module.lessons}
                                                </span>
                                            </div>

                                            {unlocked && (
                                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${module.color} rounded-full transition-all duration-500`}
                                                        style={{ width: `${(completedLessonsInModule / module.lessons) * 100}%` }}
                                                    />
                                                </div>
                                            )}
                                            {!unlocked && (
                                                <p className="text-gray-600 text-xs">Complete Module {module.id - 1} to unlock</p>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Badges */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8"
                >
                    <h3 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Badges
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {ALL_BADGES.map(badge => {
                            const earned = progress.badges.includes(badge.id);
                            return (
                                <div
                                    key={badge.id}
                                    title={badge.desc}
                                    className={`flex flex-col items-center p-4 rounded-xl border transition-all ${earned
                                        ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                                        : 'bg-white/5 border-white/10 opacity-40'
                                        }`}
                                >
                                    <div className="text-3xl mb-1.5">{badge.icon}</div>
                                    <p className="text-xs text-white font-medium text-center">{badge.id}</p>
                                    {!earned && <p className="text-[10px] text-gray-500 mt-0.5">Locked</p>}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap gap-4 justify-center"
                >
                    <Link to="/learner/module/1">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl text-white font-bold shadow-lg hover:shadow-cyan-500/30 transition-all"
                        >
                            Start Learning
                        </motion.button>
                    </Link>
                    <Link to="/learner/simulator">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white font-bold shadow-lg hover:shadow-emerald-500/30 transition-all"
                        >
                            📈 Virtual Trading
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default LearnerDashboard;
