# MotoFit 2 - 3D Vehicle Model Specification

## Vehicle Categories

| Category | Archetype | Polygon Budget |
|----------|-----------|----------------|
| Scooter | Urban Commuter (Activa) | 3,000-4,000 |
| Commuter 100-135cc | Economy Bike (Splendor) | 4,000-5,000 |
| Sport Commuter 150-180cc | Sporty Street (Pulsar 150) | 4,000-5,000 |
| Naked 200-250cc | Streetfighter (NS200) | 4,000-5,000 |
| Classic 300-650cc | Retro Roadster (RE Classic) | 4,000-5,000 |
| Sport 500-650cc | Full Fairing (Ninja 650) | 4,000-5,000 |
| Cruiser 700-900cc | Modern Cruiser (Iron 883) | 4,000-5,000 |

## File Format Requirements
- **Primary**: GLB (GLTF Binary) for web
- **Textures**: 1024×1024 Albedo, Normal, Roughness/Metal, Emission, AO
- **Scale**: Real-world (1 unit = 1 meter)
- **LOD Levels**: High (100%), Medium (50%), Low (25%)

## Model Hierarchy
```
Vehicle_Root
├── Chassis
├── Engine_Assembly (Block, Head, Exhaust)
├── Drivetrain (Wheels, Chain)
├── Suspension (Forks, Shocks)
├── Braking_System (Calipers, Rotors)
├── Electrical_System (Battery, Lights)
├── Fuel_System (Tank, Cap)
└── Controls (Handlebars, Throttle)
```

## Naming Convention
```
vehicle_scooter_urban_commuter.glb
vehicle_bike_commuter_100cc.glb
vehicle_bike_sport_150cc.glb
vehicle_bike_naked_250cc.glb
vehicle_bike_classic_500cc.glb
vehicle_bike_sport_650cc.glb
vehicle_bike_cruiser_900cc.glb
```
