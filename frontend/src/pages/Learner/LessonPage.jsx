import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, BookOpen, Trophy } from 'lucide-react';
import lessonsData from '../../data/lessons.json';

const LessonPage = () => {
    const { moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        // Find the lesson from JSON data
        const foundLesson = lessonsData.find(
            l => l.module === parseInt(moduleId) && l.lesson === parseInt(lessonId)
        );
        setLesson(foundLesson);
    }, [moduleId, lessonId]);

    const handleComplete = () => {
        setCompleted(true);
        // TODO: Save progress to backend
        setTimeout(() => {
            // Navigate to next lesson or quiz
            const nextLessonId = parseInt(lessonId) + 1;
            if (nextLessonId <= 5) {
                navigate(`/learner/module/${moduleId}/lesson/${nextLessonId}`);
            } else {
                navigate(`/learner/module/${moduleId}/quiz`);
            }
        }, 1500);
    };

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading lesson...</div>
            </div>
        );
    }

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

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-neon-blue text-sm font-medium mb-2">
                                Module {lesson.module} • Lesson {lesson.lesson}
                            </p>
                            <h1 className="text-4xl font-bold text-white mb-2">{lesson.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {lesson.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    +{lesson.xp_reward} XP
                                </span>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                                    {lesson.difficulty}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lesson Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-8"
                >
                    {/* Introduction */}
                    <div className="mb-8">
                        <p className="text-lg text-gray-300 leading-relaxed">
                            {lesson.content.introduction}
                        </p>
                    </div>

                    {/* Sections */}
                    {lesson.content.sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="mb-8"
                        >
                            <h2 className="text-2xl font-bold text-neon-blue mb-4">{section.heading}</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">{section.text}</p>

                            {section.bullets && (
                                <ul className="space-y-2 mb-4">
                                    {section.bullets.map((bullet, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-300">
                                            <CheckCircle className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" />
                                            <span dangerouslySetInnerHTML={{ __html: bullet }} />
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {section.example && (
                                <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-bold text-neon-blue mb-2">💡 Example:</p>
                                    <p className="text-gray-300 text-sm">{section.example}</p>
                                </div>
                            )}

                            {section.note && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-bold text-yellow-500 mb-2">📝 Note:</p>
                                    <p className="text-gray-300 text-sm">{section.note}</p>
                                </div>
                            )}

                            {section.tip && (
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-bold text-purple-400 mb-2">💎 Pro Tip:</p>
                                    <p className="text-gray-300 text-sm">{section.tip}</p>
                                </div>
                            )}

                            {section.pros && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                        <p className="text-sm font-bold text-green-400 mb-2">✅ Pros:</p>
                                        <ul className="space-y-1">
                                            {section.pros.map((pro, i) => (
                                                <li key={i} className="text-gray-300 text-sm">• {pro}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    {section.cons && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                            <p className="text-sm font-bold text-red-400 mb-2">❌ Cons:</p>
                                            <ul className="space-y-1">
                                                {section.cons.map((con, i) => (
                                                    <li key={i} className="text-gray-300 text-sm">• {con}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {section.characteristics && (
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {section.characteristics.map((char, i) => (
                                        <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <p className="text-gray-300 text-sm">✓ {char}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.definition && (
                                <div className="bg-white/5 border-l-4 border-neon-purple p-4 mb-4">
                                    <p className="text-sm font-bold text-neon-purple mb-1">Definition:</p>
                                    <p className="text-gray-300 text-sm">{section.definition}</p>
                                </div>
                            )}

                            {section.analogy && (
                                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-bold text-purple-400 mb-2">🎯 Think of it this way:</p>
                                    <p className="text-gray-300 text-sm italic">{section.analogy}</p>
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Key Takeaways */}
                    <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/30 rounded-xl p-6 mt-8">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            Key Takeaways
                        </h3>
                        <ul className="space-y-3">
                            {lesson.content.key_takeaways.map((takeaway, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-200 font-medium">{takeaway}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    {parseInt(lessonId) > 1 ? (
                        <Link to={`/learner/module/${moduleId}/lesson/${parseInt(lessonId) - 1}`}>
                            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Previous Lesson
                            </button>
                        </Link>
                    ) : (
                        <div></div>
                    )}

                    {!completed ? (
                        <button
                            onClick={handleComplete}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-bold hover:scale-105 transition-transform"
                        >
                            Complete Lesson
                            <CheckCircle className="w-5 h-5" />
                        </button>
                    ) : (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-bold"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Completed! +{lesson.xp_reward} XP
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonPage;
