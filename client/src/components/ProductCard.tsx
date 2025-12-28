import * as React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X } from "lucide-react"

interface ProductCardProps {
    product: {
        title: string;
        description: string;
        price: number;
        category: string;
        score?: number;
        attributes?: Record<string, any>;
    };
    searchQuery?: string;
    onClick?: () => void;
}

export function ProductCard({ product, searchQuery, onClick }: ProductCardProps) {
    const [explanation, setExplanation] = React.useState<string | null>(null);
    const [explaining, setExplaining] = React.useState(false);

    const handleExplain = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (explanation) {
            setExplanation(null); // Toggle off
            return;
        }

        setExplaining(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/explain?query=${encodeURIComponent(searchQuery || '')}&productTitle=${encodeURIComponent(product.title)}`);
            const data = await res.json();
            setExplanation(data.explanation);
        } catch (err) {
            setExplanation("Matched based on semantic similarity.");
        } finally {
            setExplaining(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="aspect-video w-full bg-slate-800/50 relative overflow-hidden group-hover:bg-slate-800 transition-colors flex items-center justify-center">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-700 to-slate-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-500 select-none">
                    {product.category === 'Sunglasses' ? '🕶️' : product.category.includes('Contact') ? '👁️' : '👓'}
                </div>
                {product.score && (
                    <div className="absolute top-3 right-3 bg-slate-900/90 text-cyan-400 text-xs font-bold px-2 py-1 rounded-full border border-cyan-500/20 backdrop-blur-md">
                        {(product.score * 100).toFixed(0)}% Match
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col relative">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 group-hover:text-cyan-300 transition-colors">
                        {product.category}
                    </span>
                    <span className="text-lg font-bold text-white tracking-tight">
                        ₹{product.price.toLocaleString('en-IN')}
                    </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {product.title}
                </h3>

                <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {product.description}
                </p>

                {/* AI Explain Button */}
                <button
                    onClick={handleExplain}
                    className="mt-auto flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors self-start"
                >
                    <Sparkles className="w-3 h-3" />
                    {explaining ? 'Analyzing...' : 'Why this result?'}
                </button>

                {/* AI Explanation Popover */}
                <AnimatePresence>
                    {explanation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute inset-x-4 bottom-16 p-3 rounded-lg bg-indigo-950/90 border border-indigo-500/30 backdrop-blur-xl shadow-xl z-10"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <p className="text-xs text-indigo-200 leading-relaxed">
                                    <span className="font-bold text-indigo-400">AI:</span> {explanation}
                                </p>
                                <button onClick={(e) => { e.stopPropagation(); setExplanation(null); }} className="text-indigo-400 hover:text-white">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
