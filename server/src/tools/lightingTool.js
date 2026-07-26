import Room from "../models/Room.js";

export async function enableEcoMode(roomName) {
  const room = await Room.findOne({ name: roomName });

  if (!room) {
    return {
      success: false,
      message: `${roomName} not found`
    };
  }

  room.lightsOn = false;

  await room.save();

  return {
    success: true,
    tool: "Lighting",
    action: "Lights turned OFF (Eco Mode)",
    room: room.name
  };
}