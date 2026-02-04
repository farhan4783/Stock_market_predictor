import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react';
import quizzesData from '../../data/quizzes.json';

const QuizPage = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [quizComplete, setQuizComplete] = useState(false);

    useEffect(() => {
        const foundQuiz = quizzesData.find(q => q.module === parseInt(moduleId));
        setQuiz(foundQuiz);
    }, [moduleId]);

    const handleAnswerSelect = (answerIndex) => {
        if (showExplanation) return; // Prevent changing answer after submission
        setSelectedAnswer(answerIndex);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        const isCorrect = selectedAnswer === quiz.questions[currentQuestion].correct_answer;
        setShowExplanation(true);

        const newAnswers = [...answers, { questionId: currentQuestion, correct: isCorrect }];
        setAnswers(newAnswers);

        if (isCorrect) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setQuizComplete(true);
        }
    };

    const handleRetakeQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(0);
        setAnswers([]);
        setQuizComplete(false);
    };

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading quiz...</div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];
    const scorePercentage = (score / quiz.total_questions) * 100;
    const passed = scorePercentage >= quiz.passing_score;

    if (quizComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-dark-secondary py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${passed ? 'bg-green-500/20' : 'bg-red-500/20'
                                }`}
                        >
                            {passed ? (
                                <Trophy className="w-12 h-12 text-green-400" />
                            ) : (
                                <XCircle className="w-12 h-12 text-red-400" />
                            )}
                        </motion.div>

                        <h2 className="text-3xl font-bold text-white mb-4">
                            {passed ? 'Congratulations! 🎉' : 'Keep Learning! 📚'}
                        </h2>

                        <div className="mb-6">
                            <div className="text-6xl font-bold text-neon-blue mb-2">
                                {score}/{quiz.total_questions}
                            </div>
                            <p className="text-gray-400">
                                {scorePercentage.toFixed(0)}% Score
                            </p>
                        </div>

                        {passed ? (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                                <p className="text-green-400 font-medium">
                                    ✅ You passed! You've earned +{quiz.xp_reward} XP
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Passing score: {quiz.passing_score}%
                                </p>
                            </div>
                        ) : (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                                <p className="text-red-400 font-medium">
                                    You need {quiz.passing_score}% to pass
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Review the lessons and try again!
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleRetakeQuiz}
                                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                            >
                                Retake Quiz
                            </button>
                            <Link to="/learner">
                                <button className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-bold hover:scale-105 transition-transform">
                                    Back to Dashboard
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-dark-secondary py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/learner"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-blue transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <h1 className="text-3xl font-bold text-white mb-4">{quiz.title}</h1>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestion + 1) / quiz.total_questions) * 100}%` }}
                                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                            />
                        </div>
                        <span className="text-gray-400 text-sm font-medium">
                            {currentQuestion + 1}/{quiz.total_questions}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Score: {score}/{currentQuestion + (showExplanation ? 1 : 0)}</span>
                        <span className="text-neon-purple">+{quiz.xp_reward} XP on completion</span>
                    </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-6"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {question.question}
                        </h2>

                        <div className="space-y-3 mb-6">
                            {question.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrect = index === question.correct_answer;
                                const showResult = showExplanation;

                                return (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleAnswerSelect(index)}
                                        disabled={showExplanation}
                                        whileHover={!showExplanation ? { scale: 1.02 } : {}}
                                        whileTap={!showExplanation ? { scale: 0.98 } : {}}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${showResult
                                                ? isCorrect
                                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                                    : isSelected
                                                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                        : 'bg-white/5 border-white/10 text-gray-400'
                                                : isSelected
                                                    ? 'bg-neon-blue/20 border-neon-blue/50 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${showResult && isCorrect
                                                    ? 'border-green-500 bg-green-500'
                                                    : showResult && isSelected && !isCorrect
                                                        ? 'border-red-500 bg-red-500'
                                                        : isSelected
                                                            ? 'border-neon-blue bg-neon-blue'
                                                            : 'border-gray-500'
                                                }`}>
                                                {showResult && isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                                                {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className="font-medium">{option}</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        <AnimatePresence>
                            {showExplanation && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`rounded-xl p-4 border ${selectedAnswer === question.correct_answer
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-blue-500/10 border-blue-500/30'
                                        }`}
                                >
                                    <p className="text-sm font-bold text-white mb-2">
                                        {selectedAnswer === question.correct_answer ? '✅ Correct!' : '💡 Explanation:'}
                                    </p>
                                    <p className="text-gray-300 text-sm">{question.explanation}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    {!showExplanation ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedAnswer === null}
                            className={`px-6 py-3 rounded-lg font-bold transition-all ${selectedAnswer === null
                                    ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:scale-105'
                                }`}
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-bold hover:scale-105 transition-transform"
                        >
                            {currentQuestion < quiz.total_questions - 1 ? 'Next Question' : 'Finish Quiz'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizPage;
