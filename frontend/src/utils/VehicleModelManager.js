/**
 * MotoFit 2 - Vehicle Model Manager
 * Handles loading and managing 3D vehicle models for tactical visualization
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Vehicle category definitions
export const VEHICLE_CATEGORIES = {
    scooter: {
        id: 'scooter',
        name: 'Urban Scooter',
        description: 'Automatic transmission scooters (100-125cc)',
        examples: ['Honda Activa', 'TVS Jupiter', 'Suzuki Access'],
        modelPath: '/models/vehicles/vehicle_scooter_urban_commuter.glb',
        polygonBudget: 4000,
        color: '#3B82F6',
    },
    commuter_100: {
        id: 'commuter_100',
        name: 'Economy Commuter',
        description: 'Entry-level commuter bikes (100-135cc)',
        examples: ['Hero Splendor', 'Honda CB Shine', 'Bajaj Platina'],
        modelPath: '/models/vehicles/vehicle_bike_commuter_100cc.glb',
        polygonBudget: 5000,
        color: '#10B981',
    },
    sport_commuter_150: {
        id: 'sport_commuter_150',
        name: 'Sport Commuter',
        description: 'Performance-oriented commuters (150-180cc)',
        examples: ['Bajaj Pulsar 150', 'TVS Apache', 'Honda Unicorn'],
        modelPath: '/models/vehicles/vehicle_bike_sport_150cc.glb',
        polygonBudget: 5000,
        color: '#F59E0B',
    },
    naked_250: {
        id: 'naked_250',
        name: 'Naked Streetfighter',
        description: 'Performance naked bikes (200-250cc)',
        examples: ['Bajaj NS200', 'KTM Duke 200', 'Yamaha FZ25'],
        modelPath: '/models/vehicles/vehicle_bike_naked_250cc.glb',
        polygonBudget: 5000,
        color: '#EF4444',
    },
    classic_500: {
        id: 'classic_500',
        name: 'Retro Classic',
        description: 'Classic/retro motorcycles (300-650cc)',
        examples: ['Royal Enfield Classic', 'Jawa', 'Benelli Imperiale'],
        modelPath: '/models/vehicles/vehicle_bike_classic_500cc.glb',
        polygonBudget: 5000,
        color: '#8B5CF6',
    },
    sport_650: {
        id: 'sport_650',
        name: 'Full Fairing Sport',
        description: 'Sports motorcycles (500-650cc)',
        examples: ['Kawasaki Ninja 650', 'Yamaha R3', 'Honda CBR650R'],
        modelPath: '/models/vehicles/vehicle_bike_sport_650cc.glb',
        polygonBudget: 5000,
        color: '#06B6D4',
    },
    cruiser_900: {
        id: 'cruiser_900',
        name: 'Modern Cruiser',
        description: 'Cruiser motorcycles (700-900cc)',
        examples: ['Harley-Davidson Iron 883', 'Honda Rebel', 'Triumph Bonneville'],
        modelPath: '/models/vehicles/vehicle_bike_cruiser_900cc.glb',
        polygonBudget: 5000,
        color: '#EC4899',
    },
};

// Repair hotspot types
export const REPAIR_HOTSPOT_TYPES = {
    engine: { color: '#EF4444', label: 'Engine' },
    brakes: { color: '#F59E0B', label: 'Brakes' },
    suspension: { color: '#3B82F6', label: 'Suspension' },
    electrical: { color: '#8B5CF6', label: 'Electrical' },
    drivetrain: { color: '#10B981', label: 'Drivetrain' },
    body: { color: '#6B7280', label: 'Body' },
};

// Vehicle Model Manager class
export class VehicleModelManager {
    constructor() {
        console.log("MotoFit: VehicleModelManager Initialized");
        this.models = new Map();
        this.loader = new GLTFLoader();
        this.loadingProgress = new Map();

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        this.loader.setDRACOLoader(dracoLoader);
    }

    async loadVehicleCategory(categoryId, onProgress) {
        const category = VEHICLE_CATEGORIES[categoryId];
        if (!category) {
            console.error("MotoFit: Unknown category", categoryId);
            throw new Error(`Unknown vehicle category: ${categoryId}`);
        }

        // PROCEDURAL RESTORED: Create visual model
        console.log("MotoFit: Generating Procedural Model for", categoryId);

        try {
            const model = this.createPlaceholderModel(category);
            this.models.set(categoryId, model);

            if (onProgress) onProgress(100);
            return model;
        } catch (err) {
            console.error("Procedural generation crashed:", err);
            // Fallback to Box if procedural crashes logic-wise
            return this.createDebugBox(category);
        }
    }

    processModel(scene, category) {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material.envMapIntensity = 1.5;
                }
                child.userData.clickable = true;
                child.userData.category = category.id;
            }
        });
        return scene;
    }

    createDebugBox(category) {
        const group = new THREE.Group();
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x330000 })
        );
        box.position.y = 1;
        group.add(box);
        return group;
    }

    createPlaceholderModel(category) {
        const group = new THREE.Group();
        group.name = `procedural_${category.id}`;

        // HIGH VISIBILITY MATERIALS (Added Emissive to Ensure Visibility)
        const materials = {
            body: new THREE.MeshStandardMaterial({
                color: category.color,
                metalness: 0.6,
                roughness: 0.2,
                emissive: category.color,
                emissiveIntensity: 0.2 // Glows slightly to prevent appearing black
            }),
            frame: new THREE.MeshStandardMaterial({
                color: 0x222222,
                metalness: 0.5,
                roughness: 0.5
            }),
            chrome: new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.9,
                roughness: 0.1
            }),
            rubber: new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                metalness: 0.1,
                roughness: 0.9
            }),
            seat: new THREE.MeshStandardMaterial({
                color: 0x332211,
                metalness: 0.1,
                roughness: 0.8
            }),
            engine: new THREE.MeshStandardMaterial({
                color: 0x555555,
                metalness: 0.7,
                roughness: 0.3
            }),
            glass: new THREE.MeshStandardMaterial({
                color: 0x88ccff,
                transparent: true,
                opacity: 0.4,
                metalness: 0.9,
                roughness: 0.0
            }),
            light_front: new THREE.MeshStandardMaterial({
                color: 0xffffee,
                emissive: 0xffffee,
                emissiveIntensity: 2.0
            }),
            light_rear: new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 1.0
            })
        };

        console.log("MotoFit: Creating Parts...");

        // Helper: Create Wheel
        const createWheel = (pos, radius, width) => {
            const wheelGroup = new THREE.Group();
            wheelGroup.position.copy(pos);

            const tire = new THREE.Mesh(new THREE.TorusGeometry(radius, width, 16, 32), materials.rubber);
            tire.rotation.y = Math.PI / 2;
            wheelGroup.add(tire);

            const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.7, radius * 0.7, width * 0.5, 16), materials.frame);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);

            if (category.id.includes('classic') || category.id.includes('cruiser') || category.id === 'commuter_100') {
                const spokeGeo = new THREE.CylinderGeometry(0.005, 0.005, radius * 1.4, 8);
                for (let i = 0; i < 12; i++) {
                    const spoke = new THREE.Mesh(spokeGeo, materials.chrome);
                    spoke.rotation.z = i * (Math.PI / 6);
                    spoke.rotation.x = Math.PI / 2;
                    wheelGroup.add(spoke);
                }
            } else {
                const magGeo = new THREE.BoxGeometry(0.05, radius * 1.4, 0.02);
                for (let i = 0; i < 3; i++) {
                    const mag = new THREE.Mesh(magGeo, materials.frame);
                    mag.rotation.x = i * (Math.PI / 3);
                    mag.rotation.y = Math.PI / 2;
                    wheelGroup.add(mag);
                }
            }
            return wheelGroup;
        };

        // --- SCOOTER LOGIC ---
        if (category.id === 'scooter') {
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.4), materials.body);
            body.position.set(-0.2, 0.5, 0);
            body.name = "body_panel";
            group.add(body);

            const apron = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.4), materials.body);
            apron.position.set(0.6, 0.6, 0);
            apron.rotation.z = -0.2;
            apron.name = "front_apron";
            group.add(apron);

            const floor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.4), materials.frame);
            floor.position.set(0.2, 0.3, 0);
            group.add(floor);

            group.add(createWheel(new THREE.Vector3(0.6, 0.25, 0), 0.25, 0.1));
            group.add(createWheel(new THREE.Vector3(-0.6, 0.25, 0), 0.25, 0.1));

        } else if (category.id === 'cruiser_900') {
            // CRUISER
            const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), materials.frame);
            frame.rotation.z = Math.PI / 2;
            frame.position.set(0, 0.4, 0);
            group.add(frame);

            const tank = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), materials.body);
            tank.scale.set(1.5, 0.8, 0.8);
            tank.position.set(0.2, 0.75, 0);
            tank.name = "fuel_tank";
            group.add(tank);

            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.3), materials.seat);
            seat.position.set(-0.3, 0.55, 0);
            group.add(seat);

            const cylGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16);
            const cyl1 = new THREE.Mesh(cylGeo, materials.engine); cyl1.rotation.z = -0.4; cyl1.position.set(-0.05, 0.4, 0); cyl1.name = "engine_cyl_1"; group.add(cyl1);
            const cyl2 = new THREE.Mesh(cylGeo, materials.engine); cyl2.rotation.z = 0.4; cyl2.position.set(0.25, 0.4, 0); cyl2.name = "engine_cyl_2"; group.add(cyl2);

            group.add(createWheel(new THREE.Vector3(1.1, 0.35, 0), 0.35, 0.1));
            group.add(createWheel(new THREE.Vector3(-0.9, 0.35, 0), 0.35, 0.15));

        } else if (category.id === 'sport_650') {
            // SPORT
            const fairing = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.4), materials.body);
            fairing.position.set(0.3, 0.6, 0);
            fairing.name = "fairing";
            group.add(fairing);

            const wind = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), materials.glass);
            wind.position.set(0.75, 0.95, 0);
            wind.rotation.y = Math.PI / 2 + Math.PI; wind.rotation.z = -0.5;
            group.add(wind);

            const tank = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.4), materials.body);
            tank.position.set(0.1, 0.85, 0);
            tank.name = "fuel_tank";
            group.add(tank);

            const tail = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 4), materials.body);
            tail.rotation.z = -Math.PI / 2;
            tail.position.set(-0.6, 0.85, 0);
            group.add(tail);

            group.add(createWheel(new THREE.Vector3(0.9, 0.35, 0), 0.35, 0.12));
            group.add(createWheel(new THREE.Vector3(-0.8, 0.35, 0), 0.35, 0.14));

        } else {
            // STANDARD BIKE (COMMUTER)
            const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.3), materials.frame);
            frame.position.set(0, 0.5, 0); frame.rotation.z = 0.1;
            group.add(frame);

            const tank = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), materials.body);
            tank.position.set(0.3, 0.8, 0);
            tank.name = "fuel_tank";
            group.add(tank);

            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.35), materials.seat);
            seat.position.set(-0.3, 0.8, 0);
            if (category.id === 'sport_commuter_150' || category.id === 'naked_250') { seat.rotation.z = 0.1; seat.position.y += 0.05; }
            group.add(seat);

            const engine = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.35), materials.engine);
            engine.position.set(0.1, 0.4, 0);
            engine.name = "engine_block";
            group.add(engine);

            const light = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16), materials.chrome);
            light.rotation.z = Math.PI / 2; light.position.set(0.9, 0.8, 0);
            group.add(light);

            group.add(createWheel(new THREE.Vector3(0.95, 0.35, 0), 0.35, 0.1));
            group.add(createWheel(new THREE.Vector3(-0.85, 0.35, 0), 0.35, 0.1));
        }

        // Add user data and shadow props
        group.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true; child.receiveShadow = true;
                child.userData.clickable = true; child.userData.category = category.id;
            }
        });

        console.log("MotoFit: Model Created with", group.children.length, "parts");

        return group;
    }

    applyRepairOverlay(model, highlightedParts = []) {
        model.traverse((child) => {
            if (child.isMesh && child.userData.repairType) {
                const isHighlighted = highlightedParts.includes(child.name);
                if (isHighlighted) {
                    child.material = child.material.clone();
                    child.material.emissive = new THREE.Color(0xff6600);
                    child.material.emissiveIntensity = 0.5;
                }
            }
        });
    }

    getRepairHotspots(categoryId) {
        const commonHotspots = [
            { id: 'battery', name: 'Battery', position: [0, 0.5, 0.2], type: 'electrical', time: 15 },
            { id: 'spark_plug', name: 'Spark Plug', position: [0.1, 0.5, -0.1], type: 'engine', time: 10 },
        ];

        const hotspots = {
            scooter: [
                { id: 'cvt_belt', name: 'CVT Belt', position: [0.2, 0.3, -0.3], type: 'drivetrain', time: 45 },
                { id: 'front_brake', name: 'Front Brake', position: [0.8, 0.5, 0], type: 'brakes', time: 30 },
                ...commonHotspots
            ],
            commuter_100: [
                { id: 'chain_sprocket', name: 'Chain & Sprocket', position: [-0.6, 0.2, 0.2], type: 'drivetrain', time: 60 },
                { id: 'carburetor', name: 'Carburetor', position: [0, 0.5, 0.2], type: 'engine', time: 45 },
                { id: 'rear_brake', name: 'Rear Brake', position: [-0.8, 0.3, 0], type: 'brakes', time: 25 },
            ],
            sport_commuter_150: [
                { id: 'fuel_injection', name: 'Fuel Injection', position: [0.1, 0.6, 0.15], type: 'engine', time: 60 },
                { id: 'monoshock', name: 'Monoshock', position: [-0.4, 0.4, 0], type: 'suspension', time: 90 },
                { id: 'disc_brake', name: 'Disc Brake', position: [0.85, 0.35, 0], type: 'brakes', time: 40 },
            ],
            naked_250: [
                { id: 'radiator', name: 'Radiator', position: [0.4, 0.5, 0], type: 'engine', time: 45 },
                { id: 'abs_sensor', name: 'ABS Sensor', position: [0.95, 0.35, 0.1], type: 'electrical', time: 30 },
            ],
            classic_500: [
                { id: 'clutch_cable', name: 'Clutch Cable', position: [0.6, 0.7, -0.2], type: 'drivetrain', time: 20 },
                { id: 'exhaust', name: 'Exhaust Pipe', position: [-0.2, 0.3, 0.3], type: 'body', time: 30 },
            ],
            sport_650: [
                { id: 'fairing_damage', name: 'Fairing Crack', position: [0.5, 0.6, 0.2], type: 'body', time: 120 },
                { id: 'ecu_map', name: 'ECU Mapping', position: [-0.1, 0.5, 0], type: 'electrical', time: 60 },
            ],
            cruiser_900: [
                { id: 'belt_drive', name: 'Belt Drive', position: [-0.5, 0.3, 0.2], type: 'drivetrain', time: 60 },
                { id: 'handlebar', name: 'Handlebar Alignment', position: [0.3, 0.8, 0], type: 'body', time: 40 },
            ]
        };

        return hotspots[categoryId] || commonHotspots;
    }

    createExplosionAnimation(model, explosionLevel = 0) {
        const originalPositions = new Map();
        model.traverse((child) => {
            if (child.isMesh) {
                if (!originalPositions.has(child.uuid)) {
                    originalPositions.set(child.uuid, child.position.clone());
                }
                const original = originalPositions.get(child.uuid);
                const direction = child.position.clone().sub(new THREE.Vector3(0, 0.5, 0)).normalize();
                const offset = direction.multiplyScalar(explosionLevel * 0.5);
                child.position.copy(original).add(offset);
            }
        });
        return originalPositions;
    }

    getCategoryForBike(engineCC) {
        if (engineCC <= 125 && engineCC >= 100) return 'commuter_100';
        if (engineCC <= 180 && engineCC > 125) return 'sport_commuter_150';
        if (engineCC <= 250 && engineCC > 180) return 'naked_250';
        if (engineCC <= 650 && engineCC > 250) return 'classic_500';
        if (engineCC <= 700 && engineCC > 650) return 'sport_650';
        if (engineCC > 700) return 'cruiser_900';
        return 'scooter';
    }

    dispose() {
        this.models.forEach((model) => {
            model.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });
        this.models.clear();
    }
}

export default VehicleModelManager;
