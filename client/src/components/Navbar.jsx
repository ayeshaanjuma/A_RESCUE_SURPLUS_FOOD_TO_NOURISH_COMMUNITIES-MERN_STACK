import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-[100] px-4 py-4 pointer-events-none">
            <div className="max-w-7xl mx-auto pointer-events-auto">
                <div className="glass-panel shadow-lg rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between border border-white/40 ring-1 ring-black/[0.03]">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
                            <div className="p-1.5 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-lg shadow-emerald-200 shadow-lg">
                                <HeartHandshake className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent">FoodRescue</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link to="/" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 rounded-xl hover:bg-emerald-50/50 transition-all">Home</Link>
                        <Link to="/map" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 rounded-xl hover:bg-emerald-50/50 transition-all">Live Map</Link>

                        <div className="h-6 w-px bg-gray-200 mx-2" />

                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 rounded-xl hover:bg-emerald-50/50 transition-all">Dashboard</Link>
                                <div className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-emerald-50/80 rounded-full border border-emerald-100/50 shadow-inner group">
                                    <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black group-hover:scale-110 transition-transform">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-emerald-900 truncate max-w-[100px]">{user.name}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 text-sm font-bold text-white btn-gradient rounded-xl shadow-md active:scale-95 transition-all"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">Log in</Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 text-sm font-bold text-white btn-gradient rounded-xl shadow-md hover:shadow-emerald-200 shadow-emerald-200 transition-all active:scale-95"
                                >
                                    Join Network
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-600 hover:bg-emerald-50 rounded-xl transition-colors active:scale-90"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="md:hidden mt-3 pointer-events-auto"
                    >
                        <div className="glass-panel border border-white/40 shadow-2xl rounded-2xl overflow-hidden p-2">
                            <div className="space-y-1">
                                <Link onClick={() => setIsOpen(false)} to="/" className="flex items-center px-4 py-3 text-sm font-bold text-gray-700 hover:bg-emerald-50 rounded-xl transition-colors">Home</Link>
                                <Link onClick={() => setIsOpen(false)} to="/map" className="flex items-center px-4 py-3 text-sm font-bold text-gray-700 hover:bg-emerald-50 rounded-xl transition-colors">Live Map</Link>

                                <div className="h-px bg-gray-100 my-1 mx-2" />

                                {user ? (
                                    <>
                                        <Link onClick={() => setIsOpen(false)} to="/dashboard" className="flex items-center px-4 py-3 text-sm font-bold text-gray-700 hover:bg-emerald-50 rounded-xl transition-colors">Dashboard</Link>
                                        <button
                                            onClick={() => { setIsOpen(false); logout(); }}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2 p-2 mt-1">
                                        <Link onClick={() => setIsOpen(false)} to="/login" className="flex items-center justify-center py-3 text-sm font-bold text-gray-700 bg-gray-50 rounded-xl transition-colors">Log in</Link>
                                        <Link onClick={() => setIsOpen(false)} to="/register" className="flex items-center justify-center py-3 text-sm font-bold text-white btn-gradient rounded-xl shadow-sm">Join</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
