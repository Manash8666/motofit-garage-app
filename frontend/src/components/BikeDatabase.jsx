import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ChevronDown,
    Bike,
    Zap,
    Gauge,
    DollarSign,
    Fuel,
    X,
    Grid,
    List,
    Eye,
    Star,
    Tag,
} from 'lucide-react';
import { bikesDatabase, getCategories, getMakes } from '../data/bikesDatabase';

// Extended bike data with more specs - 80 bikes from CSV
const extendedBikesDatabase = bikesDatabase.map((bike, index) => ({
    id: bike.id,
    make: bike.make,
    model: `${bike.company} ${bike.model}`,
    category: bike.category,
    engine: `${bike.engine_cc}cc`,
    price: `₹${bike.price_inr.toLocaleString('en-IN')}`,
    mileage: `${bike.mileage_kmpl} km/l`,
    year: bike.year,
    bs_standard: bike.bs_standard,
    power: `${Math.round(bike.engine_cc * 0.08)} bhp`,
    topSpeed: `${Math.round(bike.engine_cc * 0.4 + 60)} km/h`,
    weight: `${bike.weight_kg} kg`,
    fuelCapacity: `${Math.round(bike.weight_kg * 0.1)}L`,
    transmission: bike.category?.includes('Scooter') ? 'CVT' : '5-Speed',
    starter: 'Electric/Kick',
    brakes: bike.engine_cc > 200 ? 'Disc/Disc' : 'Disc/Drum',
    rating: (4 + Math.random()).toFixed(1),
    reviews: Math.floor(Math.random() * 500) + 50,
    image: `https://placehold.co/400x300/1a2b4a/ff6b35?text=${encodeURIComponent(bike.make)}`,
    colors: ['Black', 'White', 'Red', 'Blue'].slice(0, Math.floor(Math.random() * 3) + 2),
    popular: index < 10,
}));

const categories = getCategories();
const makes = getMakes();
const priceRanges = [
    { label: 'All', min: 0, max: Infinity },
    { label: 'Under ₹75K', min: 0, max: 75000 },
    { label: '₹75K - ₹1.5L', min: 75000, max: 150000 },
    { label: '₹1.5L - ₹2.5L', min: 150000, max: 250000 },
    { label: 'Above ₹2.5L', min: 250000, max: Infinity },
];

const BikeCard = ({ bike, onViewDetails, viewMode }) => {
    const parsePrice = (price) => {
        return parseInt(price.replace(/[₹,]/g, ''));
    };

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
                   border border-white/[0.08] rounded-xl p-4 hover:border-orange-500/30 
                   transition-all duration-300 cursor-pointer"
                onClick={() => onViewDetails(bike)}
                whileHover={{ scale: 1.01 }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-800/50">
                        <img src={bike.image} alt={`${bike.make} ${bike.model}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white truncate">{bike.make} {bike.model}</h3>
                            {bike.popular && (
                                <span className="px-2 py-0.5 text-[10px] bg-orange-500/20 text-orange-400 rounded-full">Popular</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">{bike.category} • {bike.engine}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-orange-400">{bike.price}</div>
                        <div className="text-xs text-gray-500">{bike.mileage}</div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">{bike.rating}</span>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="group bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
                 border border-white/[0.08] rounded-2xl overflow-hidden hover:border-orange-500/30 
                 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                <img
                    src={bike.image}
                    alt={`${bike.make} ${bike.model}`}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                {bike.popular && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg shadow-orange-500/25">
                        🔥 Popular
                    </span>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-white font-medium">{bike.rating}</span>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a3a] via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="mb-3">
                    <span className="text-xs text-orange-400 font-medium">{bike.category}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                        {bike.make} {bike.model}
                    </h3>
                </div>

                {/* Quick Specs */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span>{bike.engine}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Fuel className="w-4 h-4 text-emerald-400" />
                        <span>{bike.mileage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Gauge className="w-4 h-4 text-blue-400" />
                        <span>{bike.topSpeed}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Tag className="w-4 h-4 text-purple-400" />
                        <span>{bike.power}</span>
                    </div>
                </div>

                {/* Colors */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">Colors:</span>
                    <div className="flex gap-1">
                        {bike.colors.map((color, i) => (
                            <div
                                key={i}
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: color.toLowerCase() }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <div>
                        <span className="text-xs text-gray-500">Ex-showroom</span>
                        <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                            {bike.price}
                        </div>
                    </div>
                    <motion.button
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 
                     text-white text-sm font-medium rounded-xl shadow-lg shadow-orange-500/25
                     hover:shadow-orange-500/40 transition-shadow"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onViewDetails(bike)}
                    >
                        <Eye className="w-4 h-4" />
                        Details
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

const BikeDetailsModal = ({ bike, onClose }) => {
    if (!bike) return null;

    const specs = [
        { label: 'Engine', value: bike.engine, icon: Zap },
        { label: 'Power', value: bike.power, icon: Gauge },
        { label: 'Top Speed', value: bike.topSpeed, icon: Gauge },
        { label: 'Mileage', value: bike.mileage, icon: Fuel },
        { label: 'Weight', value: bike.weight, icon: Bike },
        { label: 'Fuel Capacity', value: bike.fuelCapacity, icon: Fuel },
        { label: 'Transmission', value: bike.transmission, icon: Zap },
        { label: 'Brakes', value: bike.brakes, icon: Bike },
        { label: 'Starter', value: bike.starter, icon: Zap },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-gradient-to-br from-slate-900 to-[#0a1a3a] 
                   border border-white/10 rounded-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    onClick={onClose}
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                <div className="grid md:grid-cols-2">
                    {/* Image Side */}
                    <div className="relative h-64 md:h-auto overflow-hidden">
                        <img
                            src={bike.image}
                            alt={`${bike.make} ${bike.model}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a1a3a]/90 md:block hidden" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a3a] to-transparent md:hidden" />

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="px-3 py-1.5 text-xs font-semibold bg-orange-500/90 text-white rounded-full">
                                {bike.category}
                            </span>
                            {bike.popular && (
                                <span className="px-3 py-1.5 text-xs font-semibold bg-red-500/90 text-white rounded-full">
                                    🔥 Popular
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Details Side */}
                    <div className="p-8">
                        <div className="mb-6">
                            <span className="text-orange-400 text-sm font-medium">{bike.make}</span>
                            <h2 className="text-3xl font-bold text-white mb-2">{bike.model}</h2>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="text-white font-medium">{bike.rating}</span>
                                </div>
                                <span className="text-gray-400 text-sm">({bike.reviews} reviews)</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                            <span className="text-xs text-gray-400">Ex-showroom Price</span>
                            <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                                {bike.price}
                            </div>
                        </div>

                        {/* Specifications Grid */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {specs.map((spec, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                                    >
                                        <spec.icon className="w-4 h-4 text-orange-400" />
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase">{spec.label}</div>
                                            <div className="text-sm text-white font-medium">{spec.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="mb-6">
                            <h3 className="text-sm text-gray-400 mb-2">Available Colors</h3>
                            <div className="flex gap-2">
                                {bike.colors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-orange-400 cursor-pointer transition-colors"
                                        style={{ backgroundColor: color.toLowerCase() }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <motion.button
                                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold 
                         rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Add to Job
                            </motion.button>
                            <motion.button
                                className="px-6 py-3 bg-white/5 border border-white/10 text-white font-medium 
                         rounded-xl hover:bg-white/10 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Compare
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const BikeDatabase = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedMake, setSelectedMake] = useState('All');
    const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedBike, setSelectedBike] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const parsePrice = (price) => {
        return parseInt(price.replace(/[₹,]/g, ''));
    };

    const filteredBikes = useMemo(() => {
        return extendedBikesDatabase.filter(bike => {
            const matchesSearch =
                bike.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bike.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bike.category.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'All' || bike.category === selectedCategory;
            const matchesMake = selectedMake === 'All' || bike.make === selectedMake;

            const bikePrice = parsePrice(bike.price);
            const matchesPrice = bikePrice >= selectedPriceRange.min && bikePrice <= selectedPriceRange.max;

            return matchesSearch && matchesCategory && matchesMake && matchesPrice;
        });
    }, [searchQuery, selectedCategory, selectedMake, selectedPriceRange]);

    return (
        <div className="p-6">
            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20">
                        <Bike className="w-6 h-6 text-orange-400" />
                    </div>
                    Bikes Database
                </h1>
                <p className="text-gray-400">Complete specifications for {extendedBikesDatabase.length} motorcycles and scooters</p>
            </motion.div>

            {/* Search and Filters Bar */}
            <motion.div
                className="mb-6 p-4 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm 
                   border border-white/[0.08] rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bikes by make, model, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                       placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${showFilters
                                ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                }`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>

                        <div className="flex rounded-xl border border-white/10 overflow-hidden">
                            <button
                                className={`px-3 py-3 transition-colors ${viewMode === 'grid' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'
                                    }`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                className={`px-3 py-3 transition-colors ${viewMode === 'list' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'
                                    }`}
                                onClick={() => setViewMode('list')}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expanded Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-white/[0.06]">
                                {/* Category Filter */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Category</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white 
                               appearance-none cursor-pointer focus:outline-none focus:border-orange-500/50"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Make Filter */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Brand</label>
                                    <div className="relative">
                                        <select
                                            value={selectedMake}
                                            onChange={(e) => setSelectedMake(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white 
                               appearance-none cursor-pointer focus:outline-none focus:border-orange-500/50"
                                        >
                                            {makes.map(make => (
                                                <option key={make} value={make} className="bg-slate-800">{make}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <label className="text-xs text-gray-500 mb-2 block">Price Range</label>
                                    <div className="relative">
                                        <select
                                            value={selectedPriceRange.label}
                                            onChange={(e) => setSelectedPriceRange(priceRanges.find(p => p.label === e.target.value))}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white 
                               appearance-none cursor-pointer focus:outline-none focus:border-orange-500/50"
                                        >
                                            {priceRanges.map(range => (
                                                <option key={range.label} value={range.label} className="bg-slate-800">{range.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-gray-400">
                    Showing <span className="text-white font-medium">{filteredBikes.length}</span> bikes
                </span>
                {(selectedCategory !== 'All' || selectedMake !== 'All' || selectedPriceRange.label !== 'All') && (
                    <button
                        className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                        onClick={() => {
                            setSelectedCategory('All');
                            setSelectedMake('All');
                            setSelectedPriceRange(priceRanges[0]);
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Bikes Grid/List */}
            <motion.div
                className={viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'flex flex-col gap-3'
                }
                layout
            >
                <AnimatePresence mode="popLayout">
                    {filteredBikes.map(bike => (
                        <BikeCard
                            key={bike.id}
                            bike={bike}
                            viewMode={viewMode}
                            onViewDetails={setSelectedBike}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredBikes.length === 0 && (
                <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Bike className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium text-gray-400 mb-2">No bikes found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search query</p>
                </motion.div>
            )}

            {/* Details Modal */}
            <AnimatePresence>
                {selectedBike && (
                    <BikeDetailsModal bike={selectedBike} onClose={() => setSelectedBike(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BikeDatabase;
