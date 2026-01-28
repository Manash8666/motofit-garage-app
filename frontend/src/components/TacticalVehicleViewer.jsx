/**
 * MotoFit 2 - Tactical Vehicle Viewer Component
 * Interactive 3D vehicle display with repair mode and procedural generation
 */
import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    Environment,
    ContactShadows,
    Html,
    useProgress,
    Center,
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
    Wrench,
    RotateCcw,
    Maximize2,
    ChevronDown,
    AlertTriangle,
    Info,
} from 'lucide-react';
import VehicleModelManager, {
    VEHICLE_CATEGORIES,
    REPAIR_HOTSPOT_TYPES,
} from '../utils/VehicleModelManager';

// Loading indicator component
const Loader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
                <span className="text-sm text-orange-400 font-medium">{progress.toFixed(0)}%</span>
            </div>
        </Html>
    );
};

// Async Component to load and render the vehicle model
const VehicleRenderer = ({ category, repairMode, activeIssues = [], onPartClick }) => {
    const [model, setModel] = useState(null);
    const manager = useMemo(() => new VehicleModelManager(), []);
    const groupRef = useRef();

    useEffect(() => {
        let mounted = true;

        const loadModel = async () => {
            try {
                setModel(null);
                const loadedModel = await manager.loadVehicleCategory(category);
                if (mounted && loadedModel) {
                    setModel(loadedModel.clone());
                }
            } catch (err) {
                console.error("Failed to load vehicle model", err);
            }
        };

        loadModel();

        return () => {
            mounted = false;
        };
    }, [category, manager]);

    // Apply visual updates (Repair Mode & Active Issues)
    useEffect(() => {
        if (!model) return;

        model.traverse((child) => {
            if (child.isMesh) {
                // Initialize original state if not present
                if (!child.userData.originalEmissive) {
                    child.userData.originalEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0, 0, 0);
                    child.userData.originalEmissiveIntensity = child.material.emissiveIntensity || 0;
                }

                // Check active issues
                const partName = child.name?.toLowerCase() || '';
                const matchesIssue = activeIssues.some(issue =>
                    partName && (partName.includes(issue.toLowerCase()) || issue.toLowerCase().includes(partName))
                );

                if (matchesIssue) {
                    // ACTIVE ISSUE: Red Alert
                    child.material.emissive = new THREE.Color(0xff0000);
                    child.material.emissiveIntensity = 0.8;
                    child.userData.isIssue = true;
                } else if (repairMode && child.userData.clickable) {
                    // REPAIR MODE: Orange Highlight
                    child.material.emissive = new THREE.Color(0xffaa00);
                    child.material.emissiveIntensity = 0.3;
                } else {
                    // RESET
                    child.material.emissive.copy(child.userData.originalEmissive);
                    child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
                }
            }
        });
    }, [model, activeIssues, repairMode]);

    useFrame((state) => {
        if (groupRef.current && !repairMode && activeIssues.length === 0) {
            groupRef.current.rotation.y += 0.002;
        }
    });

    if (!model) return null;

    return (
        <group ref={groupRef}>
            <primitive
                object={model}
                onClick={(e) => {
                    e.stopPropagation();
                    let target = e.object;
                    while (target && !target.userData.category && target.parent !== model && target.parent !== null) {
                        target = target.parent;
                    }
                    if (onPartClick) onPartClick(target.name || 'Unknown Part', target.userData);
                }}
            />
        </group>
    );
};

// Repair Hotspot Markers
const RepairHotspots = ({ hotspots, onSelect, activeIssues = [] }) => {
    return (
        <>
            {hotspots.map((hotspot) => {
                const isActive = activeIssues.some(i => hotspot.id.includes(i) || i.includes(hotspot.id));

                return (
                    <mesh
                        key={hotspot.id}
                        position={hotspot.position}
                        onClick={() => onSelect(hotspot)}
                    >
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshBasicMaterial
                            color={isActive ? '#ff0000' : (REPAIR_HOTSPOT_TYPES[hotspot.type]?.color || '#ff6600')}
                            transparent
                            opacity={0.9}
                        />
                        <Html distanceFactor={3}>
                            <div className={`px-2 py-1 text-xs rounded whitespace-nowrap font-medium ${isActive ? 'bg-red-600 text-white animate-pulse' : 'bg-black/80 text-white'
                                }`}>
                                {hotspot.name}
                            </div>
                        </Html>
                    </mesh>
                );
            })}
        </>
    );
};

// Category Selector
const CategorySelector = ({ selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const categories = Object.values(VEHICLE_CATEGORIES);
    const selectedCategory = VEHICLE_CATEGORIES[selected];

    return (
        <div className="relative">
            <button
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedCategory?.color }}
                />
                <span className="text-sm font-medium">{selectedCategory?.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`w-full flex items-start gap-3 p-3 text-left hover:bg-white/10 transition-colors ${selected === cat.id ? 'bg-orange-500/20' : ''
                                    }`}
                                onClick={() => {
                                    onSelect(cat.id);
                                    setIsOpen(false);
                                }}
                            >
                                <div
                                    className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <div>
                                    <div className="text-sm font-medium text-white">{cat.name}</div>
                                    <div className="text-xs text-gray-400">{cat.description}</div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Main Tactical Vehicle Viewer Component
const TacticalVehicleViewer = ({
    initialCategory = 'commuter_100',
    repairMode = false,
    activeIssues = [],
    onPartSelect,
    showControls = true,
    className = '',
}) => {
    const [category, setCategory] = useState(initialCategory);
    const [isRepairMode, setIsRepairMode] = useState(repairMode);
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const modelManager = useRef(new VehicleModelManager());

    const hotspots = useMemo(
        () => modelManager.current.getRepairHotspots(category),
        [category]
    );

    const visibleHotspots = useMemo(() => {
        if (isRepairMode) return hotspots;
        return hotspots.filter(h =>
            activeIssues.some(issue => h.id.includes(issue) || h.type.includes(issue))
        );
    }, [hotspots, isRepairMode, activeIssues]);

    const handleHotspotSelect = (hotspot) => {
        setSelectedHotspot(hotspot);
        if (onPartSelect) onPartSelect(hotspot.id);
    };

    return (
        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a1628] to-[#050a15] ${className}`}>

            <Canvas
                shadows
                camera={{ position: [3, 2, 5], fov: 45 }}
                gl={{ preserveDrawingBuffer: true }}
            >
                <Suspense fallback={<Loader />}>
                    <ambientLight intensity={0.5} />
                    <spotLight
                        position={[10, 10, 10]}
                        angle={0.15}
                        penumbra={1}
                        intensity={1}
                        castShadow
                    />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />

                    <Environment preset="city" />

                    <Center>
                        <VehicleRenderer
                            category={category}
                            repairMode={isRepairMode || activeIssues.length > 0}
                            activeIssues={activeIssues}
                            onPartClick={(name) => console.log('Clicked:', name)}
                        />

                        <RepairHotspots
                            hotspots={visibleHotspots}
                            onSelect={handleHotspotSelect}
                            activeIssues={activeIssues}
                        />
                    </Center>

                    <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={10} blur={2.5} far={4} />
                    <gridHelper args={[10, 20, '#1a3a5a', '#0a1a2a']} position={[0, 0, 0]} />

                    <OrbitControls
                        enablePan={false}
                        minDistance={2.5}
                        maxDistance={8}
                        maxPolarAngle={Math.PI / 1.5}
                    />
                </Suspense>
            </Canvas>


            {/* UI Controls Overlay */}
            {showControls && (
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10 pointer-events-none">
                    <div className="pointer-events-auto">
                        <CategorySelector selected={category} onSelect={setCategory} />
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        {activeIssues.length > 0 && (
                            <div className="px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium flex items-center gap-2 animate-pulse">
                                <AlertTriangle className="w-4 h-4" />
                                {activeIssues.length} Active Issues
                            </div>
                        )}

                        <motion.button
                            className={`p-3 rounded-xl backdrop-blur-xl transition-colors ${isRepairMode
                                ? 'bg-orange-500/30 border border-orange-500/50 text-orange-400'
                                : 'bg-white/10 border border-white/20 text-white'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsRepairMode(!isRepairMode)}
                            title="Repair Mode"
                        >
                            <Wrench className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                            className="p-3 rounded-xl bg-white/10 border border-white/20 text-white backdrop-blur-xl"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Reset View"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Selected Hotspot Info */}
            <AnimatePresence>
                {selectedHotspot && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute top-4 right-4 w-72 p-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-20"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: REPAIR_HOTSPOT_TYPES[selectedHotspot.type]?.color }}
                                />
                                <h4 className="text-white font-bold">{selectedHotspot.name}</h4>
                            </div>
                            <button
                                className="text-gray-400 hover:text-white"
                                onClick={() => setSelectedHotspot(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-white/5 rounded-lg p-2 flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Estimated Time</span>
                                <span className="text-white font-mono text-sm">{selectedHotspot.estimated_time || 30} mins</span>
                            </div>

                            {activeIssues.some(i => selectedHotspot.id.includes(i)) ? (
                                <div className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium text-center cursor-pointer transition-colors">
                                    Mark Repair Complete
                                </div>
                            ) : (
                                <div className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium text-center cursor-pointer transition-colors">
                                    Add to Job Card
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-xl rounded-full z-10 pointer-events-none">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: VEHICLE_CATEGORIES[category]?.color }}
                />
                <span className="text-xs text-white font-medium">
                    {VEHICLE_CATEGORIES[category]?.name}
                </span>
            </div>
        </div>
    );
};

export default TacticalVehicleViewer;
