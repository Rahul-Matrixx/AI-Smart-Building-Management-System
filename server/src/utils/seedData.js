    import bcrypt from 'bcryptjs';
    import User from '../models/User.js';
    import Room from '../models/Room.js';
    import Device from '../models/Device.js';
    import SensorLog from '../models/SensorLog.js';
    import EnergyLog from '../models/EnergyLog.js';
    import Alert from '../models/Alert.js';
    import HistoricalUsage from '../models/HistoricalUsage.js';
    import MaintenanceLog from '../models/MaintenanceLog.js';

    export const seedInitialData = async () => {
    const existingAdmin = await User.findOne({ email: 'admin@honeywell.com' });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({ name: 'Admin', email: 'admin@honeywell.com', password: hashedPassword, role: 'admin' });
    }

    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
        const rooms = await Room.insertMany([
        { name: 'Conference Room A', type: 'conference', occupancy: 8, temperature: 30, acSetpoint: 24, lightsOn: true, emergencyMode: false, preCooling: false, status: 'active' },
        { name: 'Open Office', type: 'office', occupancy: 12, temperature: 27, acSetpoint: 24, lightsOn: true, emergencyMode: false, preCooling: false, status: 'active' }
        ]);

        const devices = await Device.insertMany([
        { name: 'AC-01', type: 'ac', roomId: rooms[0]._id, status: 'online', powerDraw: 2.1, maintenanceScore: 88, lastMaintenance: new Date() },
        { name: 'Light-01', type: 'light', roomId: rooms[1]._id, status: 'online', powerDraw: 1.2, maintenanceScore: 74, lastMaintenance: new Date() }
        ]);

        await SensorLog.insertMany([
        { roomId: rooms[0]._id, occupancy: 8, temperature: 30, acSetpoint: 24, lightsOn: true, energyUsage: 42.5 },
        { roomId: rooms[1]._id, occupancy: 12, temperature: 27, acSetpoint: 24, lightsOn: true, energyUsage: 31.2 }
        ]);

        await EnergyLog.insertMany([
        { roomId: rooms[0]._id, energyUsage: 42.5 },
        { roomId: rooms[1]._id, energyUsage: 31.2 }
        ]);

        await Alert.create({ title: 'Energy optimization', message: 'Conference room pre-cooling scheduled', level: 'info', acknowledged: false });
        await HistoricalUsage.insertMany([
        { roomId: rooms[0]._id, occupancy: 8, temperature: 30, acSetpoint: 24, lightsOn: true, energyUsage: 42.5 },
        { roomId: rooms[1]._id, occupancy: 12, temperature: 27, acSetpoint: 24, lightsOn: true, energyUsage: 31.2 }
        ]);

        await MaintenanceLog.insertMany([
        { deviceId: devices[0]._id, roomId: rooms[0]._id, description: 'Routine inspection', status: 'online', maintenanceScore: 88 },
        { deviceId: devices[1]._id, roomId: rooms[1]._id, description: 'Check scheduling', status: 'online', maintenanceScore: 74 }
        ]);
    }
    };
