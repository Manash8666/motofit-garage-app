/**
 * PhotoGallery - Before/After Photo Documentation
 */
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, Trash2, Edit3, X, Check, Image, Plus, ArrowLeftRight
} from 'lucide-react';
import { usePhotos, useCommandCenterStore } from '../stores/commandCenterStore';

const PhotoGallery = ({ missionId, vehicleId }) => {
    const allPhotos = usePhotos();
    const photos = useMemo(() =>
        missionId ? allPhotos.filter(p => p.missionId === missionId) : allPhotos,
        [allPhotos, missionId]
    );
    const store = useCommandCenterStore();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadType, setUploadType] = useState('before');
    const [editingId, setEditingId] = useState(null);
    const [caption, setCaption] = useState('');
    const [showComparison, setShowComparison] = useState(false);
    const fileInputRef = useRef(null);

    const beforePhotos = photos.filter(p => p.type === 'before');
    const afterPhotos = photos.filter(p => p.type === 'after');

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            store.addPhoto({
                missionId,
                vehicleId,
                type: uploadType,
                url: reader.result,
                caption: ''
            });
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveCaption = (id) => {
        store.updatePhoto(id, { caption });
        setEditingId(null);
        setCaption('');
    };

    const PhotoCard = ({ photo }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group rounded-xl overflow-hidden bg-slate-800 border border-white/10"
        >
            <img
                src={photo.url}
                alt={photo.caption || 'Photo'}
                className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    {editingId === photo.id ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Add caption..."
                                className="flex-1 bg-slate-700 rounded px-2 py-1 text-sm text-white"
                                autoFocus
                            />
                            <button onClick={() => handleSaveCaption(photo.id)} className="p-1 bg-green-500 rounded">
                                <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-slate-600 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-end">
                            <p className="text-sm text-white/80">{photo.caption || 'No caption'}</p>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => { setEditingId(photo.id); setCaption(photo.caption || ''); }}
                                    className="p-1.5 bg-white/10 rounded hover:bg-white/20"
                                >
                                    <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => store.deletePhoto(photo.id)}
                                    className="p-1.5 bg-red-500/20 rounded hover:bg-red-500/40"
                                >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold uppercase ${photo.type === 'before' ? 'bg-orange-500' : 'bg-green-500'
                }`}>
                {photo.type}
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    Photo Documentation
                </h3>
                <div className="flex gap-2">
                    {beforePhotos.length > 0 && afterPhotos.length > 0 && (
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showComparison ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                            Compare
                        </button>
                    )}
                    <button
                        onClick={() => setIsUploading(true)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-cyan-600 rounded-lg text-white font-medium hover:bg-cyan-500 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Photo
                    </button>
                </div>
            </div>

            {/* Comparison View */}
            {showComparison && beforePhotos.length > 0 && afterPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-xl border border-white/10">
                    <div>
                        <h4 className="text-center text-orange-400 font-bold mb-2">BEFORE</h4>
                        <img src={beforePhotos[0].url} alt="Before" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                    <div>
                        <h4 className="text-center text-green-400 font-bold mb-2">AFTER</h4>
                        <img src={afterPhotos[0].url} alt="After" className="w-full h-64 object-cover rounded-lg" />
                    </div>
                </div>
            )}

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                    {photos.map(photo => (
                        <PhotoCard key={photo.id} photo={photo} />
                    ))}
                </AnimatePresence>
                {photos.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
                        <Image className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                        <p className="text-slate-500">No photos yet. Add before & after photos.</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Upload Photo</h3>
                                <button onClick={() => setIsUploading(false)}>
                                    <X className="w-6 h-6 text-slate-400 hover:text-white" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Photo Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setUploadType('before')}
                                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${uploadType === 'before' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'
                                                }`}
                                        >
                                            Before
                                        </button>
                                        <button
                                            onClick={() => setUploadType('after')}
                                            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${uploadType === 'after' ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'
                                                }`}
                                        >
                                            After
                                        </button>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-8 border-2 border-dashed border-slate-600 rounded-xl hover:border-cyan-500 transition-colors flex flex-col items-center gap-2"
                                >
                                    <Upload className="w-8 h-8 text-slate-400" />
                                    <span className="text-slate-400">Click to select image</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PhotoGallery;
