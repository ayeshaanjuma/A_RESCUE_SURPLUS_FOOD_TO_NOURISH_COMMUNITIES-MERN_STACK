import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import {
    Loader2, PlusCircle, Package, MapPin, Clock, Camera,
    ChevronRight, Phone, Mail, Users, Heart, CheckCircle2,
    ArrowUpRight, Building2, Activity, PieChart as PieIcon, BarChart3, MessageCircle, Utensils
} from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import ImageUpload from '../components/ImageUpload';
import LocationPicker from '../components/LocationPicker';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [donations, setDonations] = useState([]);
    const [globalStats, setGlobalStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to get initial location
    const getInitialLocation = () => {
        const saved = localStorage.getItem('savedDonationLocation');
        if (saved) {
            try {
                const { coords, address } = JSON.parse(saved);
                return { latitude: coords[0], longitude: coords[1], address: address || '' };
            } catch (e) {
                console.error('Error parsing saved location', e);
            }
        }
        return {
            latitude: user?.location?.coordinates[1] || 40.7128,
            longitude: user?.location?.coordinates[0] || -74.0060,
            address: ''
        };
    };

    const initialLoc = getInitialLocation();

    // Donor specific form state
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        foodType: 'Prepared',
        quantity: '',
        expiryTime: '',
        images: [],
        preparationTime: '',
        ...initialLoc
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [donationsRes, statsRes] = await Promise.all([
                api.get('/donations/all'),
                api.get('/donations/dashboard-stats')
            ]);
            setDonations(donationsRes.data);
            setGlobalStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDonations = async () => {
        try {
            const { data } = await api.get('/donations/all');
            setDonations(data);
        } catch (error) {
            console.error('Error fetching donations:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/donations/dashboard-stats');
            setGlobalStats(data);
        } catch (error) {
            console.error('Error fetching global stats:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Assuming donor's location is attached to their profile/user object,
            // we'll send it here to match the createDonation schema in backend
            // (For a real system, we might ask them if it's a different location)
            const submitData = {
                ...formData,
                longitude: formData.longitude.toString(),
                latitude: formData.latitude.toString(),
                address: formData.address,
            };
            await api.post('/donations/create', submitData);
            setIsAdding(false);
            fetchDonations();
            // Reset form but keep the persistent location
            const resetLoc = getInitialLocation();
            setFormData({
                title: '',
                description: '',
                foodType: 'Prepared',
                quantity: '',
                expiryTime: '',
                images: [],
                preparationTime: '',
                ...resetLoc
            });
        } catch (error) {
            console.error('Failed to post donation', error);
            alert('Failed to post donation: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/donations/status/${id}`, { status });
            fetchDonations();
            fetchStats();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleClaim = async (id) => {
        try {
            await api.put(`/donations/claim/${id}`);
            fetchDonations();
            fetchStats();
            alert('Donation claimed successfully!');
        } catch (error) {
            console.error('Failed to claim donation', error);
            alert('Failed to claim: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-40">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 selection:bg-emerald-100">
            {/* Header Section */}
            <div className="mb-12 relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-40 -z-10" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {user?.role === 'donor' ? 'Donor' : 'NGO'}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-gray-300" />
                            <span className="text-xs font-bold text-gray-400">COMMAND CENTER</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black leading-tight text-gray-900 tracking-tight">
                            Dashboard
                        </h2>
                        <p className="mt-2 text-lg text-gray-500 font-medium">
                            Welcome back, <span className="text-emerald-600 font-bold">{user?.name}</span>.
                            {user?.role === 'donor'
                                ? " Your contributions are fueling the rescue network."
                                : " Your mission continues. Find surplus food near you."}
                        </p>
                    </div>
                    {user?.role === 'donor' && (
                        <div className="flex md:mt-0">
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className={`inline-flex items-center justify-center px-6 py-4 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-lg ${isAdding
                                    ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    : 'text-white btn-gradient shadow-emerald-100 ring-4 ring-emerald-50'
                                    }`}
                            >
                                {isAdding ? <Clock className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                {isAdding ? 'View History' : 'New Donation Post'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Platform Statistics */}
            {!isAdding && globalStats && (
                <div className="mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Quick Stats Cards */}
                        <div className="premium-card p-6 bg-emerald-900 text-white border-none shadow-emerald-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-white/10 rounded-xl"><Package size={20} className="text-emerald-300" /></div>
                                <span className="text-[10px] font-black text-emerald-300/80 uppercase tracking-widest">Network Surplus</span>
                            </div>
                            <div className="text-4xl font-black mb-1">{globalStats.donors.available}</div>
                            <p className="text-xs text-emerald-100 font-medium opacity-60">Items ready for rescue</p>
                        </div>

                        <div className="premium-card p-6 border-amber-100 bg-white shadow-amber-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-amber-50 rounded-xl"><Activity size={20} className="text-amber-600" /></div>
                                <span className="text-[10px] font-black text-amber-600/80 uppercase tracking-widest">Active Claims</span>
                            </div>
                            <div className="text-4xl font-black text-gray-900 mb-1">{globalStats.donors.claimed}</div>
                            <p className="text-xs text-gray-400 font-medium">Being processed now</p>
                        </div>

                        <div className="premium-card p-6 border-blue-100 bg-white shadow-blue-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-50 rounded-xl"><CheckCircle2 size={20} className="text-blue-600" /></div>
                                <span className="text-[10px] font-black text-blue-600/80 uppercase tracking-widest">Rescued Meals</span>
                            </div>
                            <div className="text-4xl font-black text-gray-900 mb-1">{globalStats.donors.completed}</div>
                            <p className="text-xs text-gray-400 font-medium">Successfully delivered</p>
                        </div>

                        <div className="premium-card p-6 border-purple-100 bg-white shadow-purple-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-50 rounded-xl"><Building2 size={20} className="text-purple-600" /></div>
                                <span className="text-[10px] font-black text-purple-600/80 uppercase tracking-widest">NGO Partners</span>
                            </div>
                            <div className="text-4xl font-black text-gray-900 mb-1">{globalStats.ngos.total}</div>
                            <p className="text-xs text-gray-400 font-medium">Verified local organizations</p>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="premium-card p-8 bg-white h-96">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">Status Distribution</h4>
                                    <p className="text-xs text-gray-400 font-medium">Current network utilization</p>
                                </div>
                                <div className="p-2 bg-emerald-50 rounded-lg"><PieIcon size={16} className="text-emerald-600" /></div>
                            </div>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Available', value: globalStats.donors.available },
                                                { name: 'Claimed', value: globalStats.donors.claimed },
                                                { name: 'Completed', value: globalStats.donors.completed }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            <Cell fill="#10b981" />
                                            <Cell fill="#f59e0b" />
                                            <Cell fill="#3b82f6" />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Surplus</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Claimed</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Done</span></div>
                            </div>
                        </div>

                        <div className="premium-card p-8 bg-white h-96">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">Rescue Activity</h4>
                                    <p className="text-xs text-gray-400 font-medium">Engagement across the platform</p>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg"><BarChart3 size={16} className="text-purple-600" /></div>
                            </div>
                            <div className="h-[230px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'NGOs', active: globalStats.ngos.active },
                                        { name: 'Claims', count: globalStats.ngos.claimed },
                                        { name: 'Rescues', count: globalStats.ngos.completed }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} tick={{ fontWeight: 700, fill: '#64748b' }} />
                                        <YAxis fontSize={11} axisLine={false} tickLine={false} tick={{ fontWeight: 700, fill: '#94a3b8' }} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="active" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAdding && user?.role === 'donor' && (
                <div className="premium-card bg-white p-8 lg:p-12 mb-16 border-emerald-100/50 shadow-emerald-50">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <PlusCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">Post New Donation</h3>
                            <p className="text-sm text-gray-500 font-medium">Connect your surplus food with those who need it.</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title / Food Item</label>
                                    <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 50 Fresh Lunch Packs" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 rounded-2xl px-5 py-4 text-sm font-bold transition-all outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Food Type</label>
                                    <select name="foodType" value={formData.foodType} onChange={handleChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold transition-all outline-none appearance-none">
                                        <option value="Prepared">Prepared Food</option>
                                        <option value="Produce">Fresh Produce</option>
                                        <option value="Packaged">Packaged Goods</option>
                                        <option value="Bakery">Bakery / Bread</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
                                        <input required name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g. 20 kg" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Prepared At</label>
                                        <input name="preparationTime" value={formData.preparationTime} onChange={handleChange} placeholder="e.g. 2:00 PM" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold transition-all outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Rescue Deadline (Expiry)</label>
                                    <input required type="datetime-local" name="expiryTime" value={formData.expiryTime} onChange={handleChange} className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold transition-all outline-none" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Verification Photos</label>
                                    <div className="bg-gray-50 rounded-3xl p-4 border-2 border-dashed border-gray-200">
                                        <ImageUpload
                                            images={formData.images}
                                            onUploadComplete={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pickup Location</label>
                                    <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                                        <LocationPicker
                                            initialPosition={[formData.latitude, formData.longitude]}
                                            initialAddress={formData.address}
                                            onPositionChange={(pos, addr) => setFormData(prev => ({ ...prev, latitude: pos[0], longitude: pos[1], address: addr }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Special Instructions</label>
                            <textarea required rows="4" name="description" value={formData.description} onChange={handleChange} placeholder="Tell the rescue team anything they need to know (handling, entry codes, etc.)" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-3xl px-6 py-4 text-sm font-bold transition-all outline-none md:resize-none"></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="w-full md:w-auto inline-flex justify-center items-center px-10 py-5 border border-transparent rounded-2xl text-base font-black text-white btn-gradient shadow-xl hover:shadow-emerald-200 transition-all active:scale-95 leading-none">
                                <Package className="mr-2 h-5 w-5" /> Post for Rescue
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                        {user?.role === 'donor' ? 'My Contributions' : 'Rescue Pipeline'}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium">{donations.length} active updates in this area.</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-xl cursor-not-allowed opacity-50"><BarChart3 size={16} className="text-gray-400" /></div>
            </div>

            {donations.length === 0 ? (
                <div className="premium-card p-20 text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No activity recorded</h3>
                    <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                        {user?.role === 'donor' ? "You haven't posted any donations yet. Click 'New Donation' to begin." : "There are no available rescue missions currently."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {donations.map((donation) => (
                        <div key={donation._id} className="premium-card h-full flex flex-col group">
                            {/* Image Header */}
                            <div className="relative h-56 bg-gray-100 overflow-hidden rounded-t-[1.15rem]">
                                {donation.images && donation.images.length > 0 ? (
                                    <img src={donation.images[0]} alt={donation.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                        <Camera size={48} strokeWidth={1} />
                                        <span className="text-[10px] font-black uppercase tracking-widest mt-3">Visual Verification Needed</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className={`px-3 py-1.5 text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest flex items-center gap-1.5
                                        ${donation.status === 'Available' ? 'bg-emerald-600 text-white shadow-emerald-200' : ''}
                                        ${donation.status === 'Claimed' ? 'bg-amber-500 text-white shadow-amber-200' : ''}
                                        ${donation.status === 'Completed' || donation.status === 'Picked Up' ? 'bg-white text-gray-500 border border-gray-100' : ''}
                                    `}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${donation.status === 'Available' ? 'bg-emerald-300 animate-pulse' : 'bg-white/50'}`} />
                                        {donation.status}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                                    <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-wider mb-2 inline-block leading-none border border-white/10">
                                        {donation.foodType}
                                    </span>
                                    <h4 className="text-xl font-black text-white tracking-tight leading-tight">{donation.title}</h4>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-grow flex flex-col">
                                <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6 h-10 leading-relaxed italic">
                                    "{donation.description}"
                                </p>

                                <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">Quantity</span>
                                        <div className="flex items-center gap-1.5">
                                            <Utensils size={12} className="text-emerald-600" />
                                            <span className="text-sm font-black text-gray-800">{donation.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase text-gray-400 font-black tracking-widest mb-1">Expires</span>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-amber-600" />
                                            <span className="text-sm font-black text-emerald-700">
                                                {new Date(donation.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-xs font-bold text-gray-500">
                                        <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center mr-3"><MapPin size={12} className="text-gray-400" /></div>
                                        <span className="truncate">{donation.donorId?.organizationName || 'Verified Donor'}</span>
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-gray-500">
                                        <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center mr-3"><Clock size={12} className="text-gray-400" /></div>
                                        <span>Prep: {donation.preparationTime || 'ASAP'}</span>
                                    </div>
                                </div>

                                {/* Shared Contact Section */}
                                {((user?.role === 'ngo') || (donation.status === 'Claimed' && donation.donorId?.email)) && (
                                    <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connect to Rescue</span>
                                            <div className="flex -space-x-2">
                                                <div className="h-6 w-6 rounded-full border-2 border-white bg-emerald-100" />
                                                <div className="h-6 w-6 rounded-full border-2 border-white bg-emerald-200" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <a
                                                href={`mailto:${donation.donorId?.email}`}
                                                className="flex items-center justify-between px-4 py-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 group/link transition-all hover:bg-emerald-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Mail size={14} className="text-emerald-600" />
                                                    <span className="text-xs font-bold text-emerald-900 truncate max-w-[120px]">{donation.donorId?.email}</span>
                                                </div>
                                                <ArrowUpRight size={12} className="text-emerald-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                            </a>
                                            {donation.donorId?.phone && (
                                                <a
                                                    href={`https://wa.me/${donation.donorId.phone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-3 px-4 py-3 bg-[#25D366] text-white rounded-xl shadow-lg shadow-green-100 active:scale-95 transition-all text-xs font-black"
                                                >
                                                    <MessageCircle size={14} /> WhatsApp Support
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between rounded-b-[1.25rem]">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {donation._id.slice(-6)}</div>

                                {((user?.role === 'donor' && donation.status === 'Claimed') ||
                                    (user?.role === 'ngo' && donation.status === 'Claimed' && (donation.claimedBy === user?._id || donation.claimedBy === user?.id))) && (
                                        <button
                                            onClick={() => handleStatusUpdate(donation._id, 'Completed')}
                                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                                        >
                                            Confirm Rescue Done
                                        </button>
                                    )}

                                {user?.role === 'ngo' && donation.status === 'Available' && (
                                    <div className="flex gap-2">
                                        <Link to={`/map?id=${donation._id}`} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-black hover:bg-gray-50 transition-all">
                                            Map View
                                        </Link>
                                        <button
                                            onClick={() => handleClaim(donation._id)}
                                            className="px-6 py-2.5 text-white btn-gradient rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all"
                                        >
                                            Claim Mission
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
