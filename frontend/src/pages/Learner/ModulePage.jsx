import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Trophy, Lock, CheckCircle } from 'lucide-react';
import lessonsData from '../../data/lessons.json';

const ModulePage = () => {
    const { moduleId } = useParams();

    const moduleLessons = lessonsData.filter(l => l.module === parseInt(moduleId));

    const moduleInfo = {
        1: {
            title: 'Stock Market Basics',
            description: 'Master the fundamentals of stocks, markets, and trading',
            color: 'from-green-500 to-emerald-600',
            icon: '📚'
        },
        2: {
            title: 'Technical Analysis',
            description: 'Learn to read charts, indicators, and patterns',
            color: 'from-blue-500 to-cyan-600',
            icon: '📊'
        }
    };

    const info = moduleInfo[moduleId] || moduleInfo[1];

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-dark-secondary py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/learner"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-blue transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <div className={`bg-gradient-to-r ${info.color} rounded-2xl p-8 mb-8`}>
                        <div className="text-6xl mb-4">{info.icon}</div>
                        <h1 className="text-4xl font-bold text-white mb-2">Module {moduleId}: {info.title}</h1>
                        <p className="text-white/80 text-lg">{info.description}</p>
                    </div>
                </div>

                {/* Lessons */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Lessons</h2>
                    {moduleLessons.map((lesson, index) => (
                        <motion.div
                            key={lesson.lesson}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/learner/module/${moduleId}/lesson/${lesson.lesson}`}>
                                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center text-white font-bold text-lg`}>
                                                {lesson.lesson}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-neon-blue transition-colors">
                                                    {lesson.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="w-4 h-4" />
                                                        {lesson.duration}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                                        +{lesson.xp_reward} XP
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                                        {lesson.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <CheckCircle className="w-6 h-6 text-gray-600" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quiz */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: moduleLessons.length * 0.1 }}
                >
                    <Link to={`/learner/module/${moduleId}/quiz`}>
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-xl p-6 hover:border-purple-500 transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                                            Module {moduleId} Quiz
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Test your knowledge • 10 questions • +200 XP
                                        </p>
                                    </div>
                                </div>
                                <div className="text-purple-400 font-bold">Start Quiz →</div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default ModulePage;
