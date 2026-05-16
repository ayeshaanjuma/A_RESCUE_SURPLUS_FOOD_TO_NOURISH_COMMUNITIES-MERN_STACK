import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import {
    Loader2, Navigation, PackageCheck, Phone, Mail, Clock,
    Filter, RefreshCcw, Search, MessageCircle, Compass, Target,
    Layers, Map as MapIcon, Globe, ArrowUpRight, Utensils
} from 'lucide-react';
import L from 'leaflet';

// Premium Custom Map Pins
const userIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
        <div class="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg shadow-blue-200 z-10"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10]
});

const donorIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div class="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-md shadow-emerald-200"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -8]
});

const ngoIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div class="w-4 h-4 bg-purple-600 rounded-full border-2 border-white shadow-md shadow-purple-200"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -8]
});

const foodIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div class="relative group">
        <div class="absolute -inset-2 bg-emerald-500/30 rounded-full blur-md group-hover:bg-emerald-500/50 transition-all duration-300"></div>
        <div class="relative w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-xl shadow-emerald-100 rotate-45 transform group-hover:scale-110 transition-transform duration-300">
            <div class="-rotate-45 text-2xl">🍲</div>
        </div>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// Component to handle map panning
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13);
        }
    }, [center, map]);
    return null;
};

// Component to handle map movement/zoom events
const MoveHandler = ({ onMove }) => {
    const map = useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            onMove(center.lat, center.lng);
        },
        zoomend: () => {
            const center = map.getCenter();
            onMove(center.lat, center.lng);
        }
    });
    return null;
};

const MapDirectory = () => {
    const { user } = useContext(AuthContext);
    const [donations, setDonations] = useState([]);
    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState([40.7128, -74.0060]); // Default to NY
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
    const [distance, setDistance] = useState(15000); // 15km
    const [statusFilter, setStatusFilter] = useState('Available');
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [platformStats, setPlatformStats] = useState({ Available: 0, Claimed: 0, Completed: 0 });

    useEffect(() => {
        const loadInitial = async () => {
            let currentLoc = userLocation;

            // 1. Check for persistent manual selection first (highest priority)
            const saved = localStorage.getItem('savedDonationLocation');
            if (saved) {
                try {
                    const { coords } = JSON.parse(saved);
                    currentLoc = coords;
                    setUserLocation(currentLoc);
                    setMapCenter(currentLoc);
                    fetchAll(currentLoc[0], currentLoc[1], distance, statusFilter);
                    return; // Skip profile/auto-detection
                } catch (e) {
                    console.error('Error parsing saved location', e);
                }
            }

            // 2. Fallback to Profile Location
            if (user && user.location && user.location.coordinates[0] !== 0) {
                currentLoc = [user.location.coordinates[1], user.location.coordinates[0]];
                setUserLocation(currentLoc);
                setMapCenter(currentLoc);
            }
            // 3. Fallback to Geo-detection (suggested starting point)
            else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        currentLoc = [position.coords.latitude, position.coords.longitude];
                        setUserLocation(currentLoc);
                        setMapCenter(currentLoc);
                        fetchAll(currentLoc[0], currentLoc[1], distance, statusFilter);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        fetchAll(currentLoc[0], currentLoc[1], distance, statusFilter);
                    }
                );
                return;
            }

            fetchAll(currentLoc[0], currentLoc[1], distance, statusFilter);
        };

        loadInitial();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchAll(userLocation[0], userLocation[1], distance, statusFilter);
        }, 30000);

        return () => clearInterval(interval);
    }, [distance, statusFilter, userLocation[0], userLocation[1]]);

    const fetchAll = async (lat, lng, dist, status) => {
        try {
            const promises = [
                api.get(`/donations/nearby?longitude=${lng}&latitude=${lat}&maxDistance=${dist}&status=${status}`),
                api.get('/donations/stats')
            ];

            if (user) {
                promises.push(api.get(`/users/nearby?longitude=${lng}&latitude=${lat}&maxDistance=${dist}`));
            }

            const results = await Promise.all(promises);
            const donationsRes = results[0];
            const statsRes = results[1];
            const usersRes = user ? results[2] : { data: [] };

            setDonations(donationsRes.data.donations || []);
            setNearbyUsers(usersRes.data || []);
            setPlatformStats(donationsRes.data.stats || statsRes.data || { Available: 0, Claimed: 0, Completed: 0 });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching map data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const { data } = await api.get(`/geocoding/forward?query=${encodeURIComponent(searchQuery)}`);
            const newPos = [data.latitude, data.longitude];
            setMapCenter(newPos);
            setUserLocation(newPos); // Update marker to search result

            // Persist search result as manual override
            localStorage.setItem('savedDonationLocation', JSON.stringify({
                coords: newPos,
                timestamp: Date.now()
            }));

            fetchAll(newPos[0], newPos[1], distance, statusFilter);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClaim = async (id) => {
        try {
            await api.put(`/donations/claim/${id}`);
            alert('Donation claimed successfully!');
            setDonations(donations.filter(d => d._id !== id));
        } catch (error) {
            alert('Failed to claim: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    if (loading && donations.length === 0) {
        return (
            <div className="flex justify-center items-center py-40 bg-gray-50 h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Initializing Rescue Grid</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col relative w-full overflow-hidden bg-gray-100">
            {/* Floating Top Bar (Search) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-4">
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-all duration-500"></div>
                    <div className="relative glass-panel rounded-3xl p-1.5 flex items-center shadow-2xl border-white/50 ring-1 ring-emerald-100/20">
                        <div className="pl-4 text-emerald-600"><Search size={18} strokeWidth={3} /></div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find a location to rescue..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-800 placeholder:text-gray-400 px-4 h-11"
                        />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-6 py-2.5 text-xs font-black shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                            {isSearching ? 'SEEKING...' : 'DISCOVER'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Left Floating Panel (Filters & Stats) */}
            <div className="absolute top-24 left-6 z-[1000] hidden lg:flex flex-col gap-4 w-72">
                <div className="glass-panel p-6 rounded-3xl shadow-2xl border-white/40 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Rescue Center</h3>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/40 rounded-2xl border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700"><Target size={14} /></div>
                                    <span className="text-xs font-bold text-gray-600">Surplus Found</span>
                                </div>
                                <span className="text-lg font-black text-emerald-700">{donations.length}</span>
                            </div>
                            {donations.length === 0 && (
                                <p className="text-[9px] text-amber-600 font-black uppercase tracking-tighter mt-1 px-2 text-center animate-pulse">
                                    Zero Results • Try Expanding Mission Radius
                                </p>
                            )}
                            <div className="flex items-center justify-between p-3 bg-white/40 rounded-2xl border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-xl text-blue-700"><Compass size={14} /></div>
                                    <span className="text-xs font-bold text-gray-600">Rescue Radius</span>
                                </div>
                                <span className="text-xs font-black text-blue-700">{distance / 1000}km</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-800/60">Range Adjustment</label>
                        <input
                            type="range"
                            min="1000"
                            max="50000"
                            step="1000"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                            className="w-full accent-emerald-600 h-1.5 bg-emerald-100 rounded-full appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] font-black text-gray-400 tracking-tighter uppercase px-1">
                            <span>1km</span>
                            <span>50km</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-800/60 text-center mb-4">Availability Stream</label>
                        <div className="grid grid-cols-1 gap-2 p-1 bg-gray-100/50 rounded-2xl border border-gray-200/20">
                            <button
                                onClick={() => setStatusFilter('Available')}
                                className={`py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${statusFilter === 'Available' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 border-none' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
                            >
                                <Utensils size={14} /> Available Donations
                            </button>
                            <button
                                onClick={() => setStatusFilter('Claimed')}
                                className={`py-4 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${statusFilter === 'Claimed' ? 'bg-amber-500 text-white shadow-xl shadow-amber-100 border-none' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
                            >
                                <PackageCheck size={14} /> Already Claimed
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-300">
                        <span className="flex items-center gap-1.5"><RefreshCcw size={12} className="text-gray-200" /> LIVE SYNC</span>
                        <span>{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Sheet (Minimal) */}
            <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-3rem)] glass-panel p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4 border-white/50">
                <button onClick={() => setStatusFilter('Available')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest ${statusFilter === 'Available' ? 'bg-emerald-600 text-white' : 'bg-gray-50'}`}>Available</button>
                <div className="flex-1 text-center">
                    <span className="block text-[10px] font-black text-gray-900">{donations.length}</span>
                    <span className="block text-[8px] font-bold text-gray-400 uppercase">HITS</span>
                </div>
                <button onClick={() => setStatusFilter('Claimed')} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest ${statusFilter === 'Claimed' ? 'bg-amber-500 text-white' : 'bg-gray-50'}`}>Claimed</button>
            </div>

            <MapContainer
                center={userLocation}
                zoom={13}
                className="w-full h-full z-0"
                zoomControl={false}
            >
                <MapController center={mapCenter} />
                <MoveHandler onMove={(lat, lng) => fetchAll(lat, lng, distance, statusFilter)} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={userLocation} icon={userIcon}>
                    <Popup className="premium-popup">
                        <div className="font-black text-gray-900 text-xs px-2 py-1 uppercase tracking-widest">Base Camp (You)</div>
                    </Popup>
                </Marker>

                {nearbyUsers.map((u) => (
                    <Marker
                        key={u._id}
                        position={[u.location.coordinates[1], u.location.coordinates[0]]}
                        icon={u.role === 'ngo' ? ngoIcon : donorIcon}
                    >
                        <Popup className="premium-popup">
                            <div className="text-center p-3 min-w-[180px]">
                                <div className={`text-[8px] uppercase font-black tracking-widest mb-2 px-2 py-0.5 rounded-full inline-block ${u.role === 'ngo' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {u.role === 'ngo' ? 'NGO' : 'DONOR'}
                                </div>
                                <div className="font-black text-gray-900 leading-tight text-sm mb-2">{u.organizationName || u.name}</div>
                                <div className="flex items-center justify-center text-[10px] font-bold text-gray-400">
                                    <Mail size={10} className="mr-1.5" /> {u.email}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {donations.map((item) => (
                    <Marker
                        key={item._id}
                        position={[item.location.coordinates[1], item.location.coordinates[0]]}
                        icon={foodIcon}
                    >
                        <Popup className="premium-popup !p-0 overflow-hidden rounded-3xl" maxWidth={320}>
                            <div className="p-0 overflow-hidden flex flex-col bg-white">
                                {item.images && item.images.length > 0 ? (
                                    <div className="h-40 w-full overflow-hidden relative">
                                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-md text-white text-[9px] px-3 py-1.5 rounded-xl font-black shadow-lg uppercase tracking-widest">
                                            {item.foodType}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-20 w-full bg-emerald-900 flex items-center justify-center text-emerald-200">
                                        <PackageCheck size={32} strokeWidth={1.5} />
                                    </div>
                                )}

                                <div className="p-6">
                                    <h3 className="font-black text-xl mb-1 text-gray-900 tracking-tight leading-tight">{item.title}</h3>
                                    <div className="flex items-center text-[10px] font-bold text-emerald-600 mb-6 uppercase tracking-wider">
                                        <Target size={12} className="mr-1.5" /> {item.donorId?.organizationName || 'verified donor'}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50 p-3 rounded-2xl">
                                            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume</span>
                                            <span className="block text-xs font-black text-gray-800">{item.quantity}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-2xl">
                                            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Deadline</span>
                                            <span className="block text-xs font-black text-amber-600">{new Date(item.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <p className="text-[10px] uppercase text-gray-400 font-black tracking-[0.2em] mb-3 opacity-60 text-center">Point Of Contact</p>
                                        <div className="space-y-2">
                                            <a
                                                href={`mailto:${item.donorId?.email}`}
                                                className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-xl transition-all hover:bg-emerald-100 group/link"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Mail size={14} className="text-emerald-600" />
                                                    <span className="text-[11px] font-bold text-emerald-900 truncate max-w-[140px]">{item.donorId?.email}</span>
                                                </div>
                                                <ArrowUpRight size={12} className="text-emerald-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                            </a>
                                            {item.donorId?.phone && (
                                                <a
                                                    href={`https://wa.me/${item.donorId.phone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-3 px-4 py-3 bg-[#25D366] text-white rounded-xl shadow-lg shadow-green-100 active:scale-95 transition-all text-[11px] font-black uppercase tracking-widest"
                                                >
                                                    <MessageCircle size={14} /> WhatsApp Secure
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {user?.role === 'ngo' && item.status === 'Available' ? (
                                        <button
                                            onClick={() => handleClaim(item._id)}
                                            className="w-full h-14 bg-emerald-600 flex items-center justify-center text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
                                        >
                                            <PackageCheck className="w-5 h-5 mr-3" /> Execute Claim
                                        </button>
                                    ) : (
                                        <div className="text-center text-[10px] font-black text-gray-400 py-3 border-2 border-dashed border-gray-100 rounded-2xl uppercase tracking-[0.1em]">
                                            {item.status === 'Claimed' ? 'MISSION CLAIMED' : 'NGO CREDENTIALS NEEDED'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};


export default MapDirectory;
