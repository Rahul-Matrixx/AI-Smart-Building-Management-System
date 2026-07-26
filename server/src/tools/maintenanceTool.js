import Device from "../models/Device.js";

export async function scheduleMaintenance(deviceName) {
  const device = await Device.findOne({ name: deviceName });

  if (!device) {
    return {
      success: false,
      message: `${deviceName} not found`
    };
  }

  device.maintenanceScore = 100;
  await device.save();

  return {
    success: true,
    tool: "Maintenance",
    action: "Maintenance Scheduled",
    device: device.name
  };
}