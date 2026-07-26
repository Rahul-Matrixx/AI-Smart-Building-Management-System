import Room from "../models/Room.js";

export async function adjustHVAC(roomName, temperature) {
  const room = await Room.findOne({ name: roomName });

  if (!room) {
    return {
      success: false,
      message: `${roomName} not found`
    };
  }

  room.temperature = temperature;
  await room.save();

  return {
    success: true,
    tool: "HVAC",
    action: `Temperature changed to ${temperature}°C`,
    room: room.name
  };
}