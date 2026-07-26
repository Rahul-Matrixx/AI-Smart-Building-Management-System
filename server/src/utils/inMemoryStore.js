import bcrypt from 'bcryptjs';

const store = {
  users: [],
  rooms: [],
  devices: [],
  alerts: [],
  usageLogs: [],
  reports: []
};

export const isDatabaseReady = () => false;
export const getStore = () => store;

export const seedInitialData = async () => {
  if (store.users.length) return store;

  const hashed = await bcrypt.hash('password123', 10);
  store.users = [{ _id: 'admin-1', name: 'Admin', email: 'admin@honeywell.com', password: hashed, role: 'admin' }];

  store.rooms = [
    { _id: 'room-1', name: 'Conference Room A', type: 'conference', occupancy: 8, temperature: 30, acSetpoint: 24, lightsOn: true, emergencyMode: false, preCooling: false, status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { _id: 'room-2', name: 'Open Office', type: 'office', occupancy: 12, temperature: 27, acSetpoint: 24, lightsOn: true, emergencyMode: false, preCooling: false, status: 'active', createdAt: new Date(), updatedAt: new Date() }
  ];

  store.devices = [
    { _id: 'device-1', name: 'AC-01', type: 'ac', roomId: 'room-1', status: 'online', powerDraw: 2.1, maintenanceScore: 88, lastMaintenance: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { _id: 'device-2', name: 'Light-01', type: 'light', roomId: 'room-2', status: 'online', powerDraw: 1.2, maintenanceScore: 74, lastMaintenance: new Date(), createdAt: new Date(), updatedAt: new Date() }
  ];

  store.alerts = [{ _id: 'alert-1', title: 'Energy optimization', message: 'Conference room pre-cooling scheduled', level: 'info', acknowledged: false, createdAt: new Date() }];
  store.reports = [{ _id: 'report-1', period: 'Daily', energyUsage: 42.5, cost: 7.65, maintenanceRisk: 41, generatedAt: new Date() }];
  return store;
};

export const getMemoryUsers = async () => {
  await seedInitialData();
  return store.users;
};

export const getMemoryRooms = async () => {
  await seedInitialData();
  return store.rooms;
};

export const createMemoryRoom = async (payload) => {
  await seedInitialData();
  const room = { _id: `room-${Date.now()}`, ...payload, createdAt: new Date(), updatedAt: new Date() };
  store.rooms.push(room);
  return room;
};

export const updateMemoryRoom = async (id, payload) => {
  await seedInitialData();
  const index = store.rooms.findIndex((room) => room._id === id);
  if (index === -1) return null;
  store.rooms[index] = { ...store.rooms[index], ...payload, updatedAt: new Date() };
  return store.rooms[index];
};

export const toggleMemoryEmergency = async (id) => {
  await seedInitialData();
  const room = store.rooms.find((entry) => entry._id === id);
  if (!room) return null;
  room.emergencyMode = !room.emergencyMode;
  room.updatedAt = new Date();
  store.alerts.push({ _id: `alert-${Date.now()}`, title: 'Emergency mode updated', message: `Emergency mode ${room.emergencyMode ? 'enabled' : 'disabled'} for ${room.name}`, level: room.emergencyMode ? 'critical' : 'info', acknowledged: false, createdAt: new Date() });
  return room;
};

export const getMemoryDevices = async () => {
  await seedInitialData();
  return store.devices;
};

export const createMemoryDevice = async (payload) => {
  await seedInitialData();
  const device = { _id: `device-${Date.now()}`, ...payload, createdAt: new Date(), updatedAt: new Date() };
  store.devices.push(device);
  return device;
};

export const updateMemoryDevice = async (id, payload) => {
  await seedInitialData();
  const index = store.devices.findIndex((device) => device._id === id);
  if (index === -1) return null;
  store.devices[index] = { ...store.devices[index], ...payload, updatedAt: new Date() };
  return store.devices[index];
};

export const getMemoryAlerts = async () => {
  await seedInitialData();
  return store.alerts;
};

export const acknowledgeMemoryAlert = async (id) => {
  await seedInitialData();
  const alert = store.alerts.find((entry) => entry._id === id);
  if (!alert) return null;
  alert.acknowledged = true;
  return alert;
};

export const getMemoryReports = async () => {
  await seedInitialData();
  return store.reports;
};

export const generateMemoryReport = async () => {
  await seedInitialData();
  const totalEnergy = store.usageLogs.reduce((sum, log) => sum + log.energyUsage, 0) || 42.5;
  const report = { _id: `report-${Date.now()}`, period: 'Daily', energyUsage: Number(totalEnergy.toFixed(2)), cost: Number((totalEnergy * 0.18).toFixed(2)), maintenanceRisk: 42, generatedAt: new Date() };
  store.reports.unshift(report);
  return report;
};

export const logMemoryUsage = async (payload) => {
  await seedInitialData();
  store.usageLogs.push({ ...payload, timestamp: new Date() });
  return store.usageLogs[store.usageLogs.length - 1];
};
