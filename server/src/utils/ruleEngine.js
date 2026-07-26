import Room from '../models/Room.js';
import Device from '../models/Device.js';
import SensorLog from '../models/SensorLog.js';
import EnergyLog from '../models/EnergyLog.js';
import HistoricalUsage from '../models/HistoricalUsage.js';
import Alert from '../models/Alert.js';

class RuleEngine {
  async simulateAndApplyRules() {
    const rooms = await Room.find();
    for (const room of rooms) {
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = now.getHours();
      const minute = now.getMinutes();

      let acSetpoint = 24;
      let lightsOn = true;

      if (room.emergencyMode) {
        acSetpoint = 20;
        lightsOn = false;
        await Alert.create({ title: 'Emergency mode', message: `Emergency mode activated for ${room.name}`, level: 'critical' });
      } else {
        if (room.occupancy === 0) {
          acSetpoint = 24;
          lightsOn = false;
        } else if (room.temperature > 29) {
          acSetpoint = 22;
        } else if (room.occupancy > 10) {
          acSetpoint = 22;
        } else if (room.occupancy >= 5 && room.occupancy <= 10) {
          acSetpoint = 24;
        } else if (room.occupancy <= 3) {
          acSetpoint = 26;
        }

        if (day === 'Monday' && room.type === 'conference' && hour === 9 && minute >= 45 && minute <= 59) {
          room.preCooling = true;
        } else if (room.preCooling && hour === 10 && minute === 0) {
          room.preCooling = false;
        }

        if (room.preCooling) {
          acSetpoint = 20;
        }
      }

      room.acSetpoint = acSetpoint;
      room.lightsOn = lightsOn;
      await room.save();

      const energyUsage = lightsOn ? 2.5 : 1.1;
      await SensorLog.create({
        roomId: room._id,
        occupancy: room.occupancy,
        temperature: room.temperature,
        acSetpoint: room.acSetpoint,
        lightsOn: room.lightsOn,
        energyUsage
      });

      await EnergyLog.create({ roomId: room._id, energyUsage });
      await HistoricalUsage.create({
        roomId: room._id,
        occupancy: room.occupancy,
        temperature: room.temperature,
        acSetpoint: room.acSetpoint,
        lightsOn: room.lightsOn,
        energyUsage
      });

      const devices = await Device.find({ roomId: room._id });
      for (const device of devices) {
        if (device.maintenanceScore < 70) {
          await Alert.create({ title: 'Maintenance prediction', message: `${device.name} may need service soon`, level: 'warning' });
        }
      }
    }
  }
}

const ruleEngine = new RuleEngine();
export default ruleEngine;