import Room from "../models/Room.js";
import Device from "../models/Device.js";
import groq from "../utils/groqClient.js";

import { adjustHVAC } from "../tools/hvacTool.js";
import { enableEcoMode } from "../tools/lightingTool.js";
import { scheduleMaintenance } from "../tools/maintenanceTool.js";

export const optimizeBuilding = async (req, res) => {
  console.log("✅ optimizeBuilding called");

  try {
    const rooms = await Room.find();
    const devices = await Device.find();

    let recommendations = [];
    let energySaving = 0;
    let comfortScore = 100;
    let buildingHealth = 100;
    let maintenanceRisk = 0;

    // -------- Room Analysis --------
    rooms.forEach((room) => {
      if (room.temperature > 28) {
        recommendations.push(
          `Reduce AC temperature to 23°C in ${room.name}.`
        );
        energySaving += 5;
        comfortScore += 2;
      }

      if (room.occupancy <= 2) {
        recommendations.push(
          `Enable Eco Mode in ${room.name}.`
        );
        energySaving += 3;
      }
    });

    // -------- Device Analysis --------
    devices.forEach((device) => {
      if (device.maintenanceScore < 80) {
        maintenanceRisk++;
        buildingHealth -= 5;

        recommendations.push(
          `Schedule maintenance for ${device.name}.`
        );
      }
    });

    comfortScore = Math.min(100, comfortScore);
    buildingHealth = Math.max(60, buildingHealth);

    let aiRecommendation = recommendations.join("\n");
    const toolExecutionLog = [];

    // -------- LLM --------
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are an AI Building Management Assistant.

Rules:
- Return ONLY 4 bullet points.
- Each bullet under 20 words.
- Mention estimated energy saving.
- No introduction.
- No conclusion.
- No markdown headings.
`
          },
          {
            role: "user",
            content: `
Building Health: ${buildingHealth}
Comfort Score: ${comfortScore}
Energy Saving: ${energySaving}

Recommendations:
${recommendations.join("\n")}
`
          }
        ],
        temperature: 0.3,
        max_tokens: 80
      });

      aiRecommendation =
        completion.choices[0].message.content || aiRecommendation;

    } catch (err) {
      console.log("Groq Error:", err.message);
    }

    // -------- Closed Loop Execution --------

    for (const room of rooms) {

      if (room.temperature > 28) {
        const result = await adjustHVAC(room.name, 23);
        toolExecutionLog.push(result);
      }

      if (room.occupancy <= 2) {
        const result = await enableEcoMode(room.name);
        toolExecutionLog.push(result);
      }

    }

    for (const device of devices) {

      if (device.maintenanceScore < 80) {
        const result = await scheduleMaintenance(device.name);
        toolExecutionLog.push(result);
      }

    }

    console.log("AI Recommendation:", aiRecommendation);
    console.log("Tool Execution:", toolExecutionLog);

    res.json({
      success: true,
      buildingHealth,
      comfortScore,
      energySaving,
      maintenanceRisk,
      recommendations,
      aiRecommendation,
      toolExecutionLog,
      optimizedAt: new Date()
    });

  } catch (err) {

    console.error("❌ AI Controller Error");
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};