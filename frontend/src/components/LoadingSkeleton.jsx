import { motion } from 'framer-motion';

const LoadingSkeleton = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    >
                        <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-white/20 rounded w-3/4"></div>
                    </motion.div>
                ))}
            </div>

            {/* Chart Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className="h-6 bg-white/10 rounded w-1/4 mb-6"></div>
                    <div className="h-64 bg-white/10 rounded"></div>
                </motion.div>

                {/* Sentiment Gauge Skeleton */}
                <motion.div
                    className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                >
                    <div className="h-6 bg-white/10 rounded w-1/2 mb-6"></div>
                    <div className="h-48 bg-white/10 rounded-full mx-auto w-48"></div>
                </motion.div>
            </div>

            {/* Details Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    >
                        <div className="h-5 bg-white/10 rounded w-1/3 mb-4"></div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="h-4 bg-white/10 rounded"></div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default LoadingSkeleton;
