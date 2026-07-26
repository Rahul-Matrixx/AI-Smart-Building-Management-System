# 🏢 EcoLoop Building Agents
## AI-Powered Closed-Loop Smart Building Management System

> 🚀 Developed for the **Honeywell EcoLoop Building Agents Hackathon** to demonstrate AI-driven optimization for commercial smart buildings using **React, Node.js, MongoDB, and Groq Llama 3.1**.

---

# 📖 Overview

EcoLoop Building Agents is an AI-powered Smart Building Management System (BMS) designed to improve building efficiency through intelligent monitoring, analytics, and automation.

The platform continuously analyzes room temperature, occupancy, and device health, generates AI-powered optimization recommendations using **Groq Llama 3.1**, and performs automated optimization actions through a closed-loop execution workflow.

---

# 🎯 Problem Statement

Commercial buildings consume a significant amount of electricity due to inefficient HVAC operation, unnecessary lighting usage, and delayed maintenance decisions.

Traditional Building Management Systems rely heavily on manual monitoring, making it difficult to optimize energy consumption while maintaining occupant comfort.

This project aims to solve these challenges by building an AI-powered system capable of:

- Monitoring building conditions
- Optimizing HVAC systems
- Reducing energy consumption
- Improving occupant comfort
- Scheduling maintenance
- Executing intelligent optimization workflows

---

# 💡 Our Solution

EcoLoop Building Agents combines Artificial Intelligence, Building Analytics, and Automation into a unified platform.

The system:

- Collects building information
- Analyzes room conditions
- Uses Groq Llama 3.1 for intelligent recommendations
- Executes optimization tools
- Updates dashboard metrics
- Helps reduce operational costs

---

# ✨ Features

## AI Features

- 🤖 AI Recommendation Engine
- 🧠 Groq Llama 3.1 Integration
- ⚡ Intelligent Energy Optimization
- 😊 Comfort Score Analysis
- 🏢 Building Health Analysis

---

## Smart Building Features

- 🌡 HVAC Optimization
- 💡 Smart Lighting Eco Mode
- 🛠 Maintenance Scheduling
- 📊 Building Analytics Dashboard
- 📜 Activity Logs

---

## System Features

- 🔐 JWT Authentication
- ☁ MongoDB Database
- ⚡ REST APIs
- 📈 Real-time Dashboard
- 📱 Responsive UI

---

# 🧠 AI Workflow

```
Sensors & Building Data
          │
          ▼
 Room & Device Analysis
          │
          ▼
 Groq Llama 3.1
          │
          ▼
 AI Recommendations
          │
          ▼
 Closed-Loop Tool Execution
          │
 ┌────────┼────────┐
 │        │        │
 ▼        ▼        ▼
HVAC   Lighting  Maintenance
 Tool     Tool       Tool
          │
          ▼
 Dashboard Update
```

---

# 🔄 Closed-Loop Optimization

The optimization process follows a complete AI workflow:

1. Read room data
2. Read device status
3. Analyze occupancy
4. Analyze temperature
5. Analyze maintenance condition
6. Generate AI recommendations
7. Execute HVAC optimization
8. Execute Lighting optimization
9. Schedule maintenance
10. Update dashboard metrics

---

# 🏗️ System Architecture

```
                React Frontend
                       │
                       ▼
             Express REST API
                       │
                       ▼
              AI Controller
                       │
      ┌────────────────┼────────────────┐
      │                │                │
      ▼                ▼                ▼
 MongoDB          Groq LLM        Tool Execution
                                      │
                           ┌──────────┼──────────┐
                           ▼          ▼          ▼
                        HVAC Tool  Lighting  Maintenance
                                      Tool      Tool
```

---

# ⚙️ Technology Stack

## Frontend

- React.js
- Axios
- Tailwind CSS

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Artificial Intelligence

- Groq API
- Llama 3.1 8B Instant

## Authentication

- JWT

---

# 📂 Project Structure

```
AI-Smart-Building-Management-System/

│── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── assets/

│── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── tools/
│   ├── utils/
│   └── config/

│── README.md
```

---

# 📊 Dashboard Metrics

The dashboard provides:

- Building Health
- Comfort Score
- Energy Saving
- Daily Saving
- Monthly Saving
- AI Recommendations
- Activity Logs

---

# 🔧 Automation Tools

### HVAC Tool

- Optimizes room temperature
- Improves occupant comfort

### Lighting Tool

- Enables Eco Mode
- Reduces unnecessary lighting usage

### Maintenance Tool

- Schedules preventive maintenance
- Improves equipment reliability

---

# 🔐 Authentication

- User Login
- JWT Authentication
- Protected REST APIs

---

# 🌱 Sustainability Impact

The proposed solution contributes toward sustainable commercial buildings by:

- Reducing unnecessary energy consumption
- Optimizing HVAC operation
- Improving equipment lifetime
- Increasing occupant comfort
- Supporting greener smart building infrastructure

---

# 📡 API Endpoints

```
POST /api/auth/login
POST /api/auth/register

GET /api/rooms
POST /api/rooms

GET /api/devices
POST /api/devices

POST /api/ai/optimize

GET /api/reports
GET /api/analytics
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Rahul-Matrixx/AI-Smart-Building-Management-System.git
```

## Backend

```bash
cd server
npm install
npm run dev
```

## Frontend

```bash
cd client
npm install
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the server folder.

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

GROQ_API_KEY=YOUR_GROQ_API_KEY
```

---

# 📸 Screenshots

Add the following screenshots:

- Login Page
- Dashboard
- AI Recommendation
- Building Analytics
- Activity Log

---

# 🎯 Hackathon Requirement Mapping

| Requirement | Status |
|-------------|--------|
| AI-powered Building Optimization | ✅ |
| Smart Dashboard | ✅ |
| Building Analytics | ✅ |
| Groq LLM Integration | ✅ |
| Closed-Loop Optimization | ✅ |
| HVAC Optimization | ✅ |
| Lighting Automation | ✅ |
| Predictive Maintenance | ✅ |
| JWT Authentication | ✅ |
| MongoDB Integration | ✅ |
| REST API Backend | ✅ |
| EnergyPlus Integration | 🚧 Future Work |
| MCP Server | 🚧 Future Work |

---

# 🔮 Future Enhancements

- EnergyPlus Integration
- MCP Tool Calling
- Live IoT Sensor Integration
- Predictive Energy Forecasting
- Multi-building Support
- Carbon Footprint Analytics

---

# 👨‍💻 Author

**Rahul Kumar**

B.Tech Computer Science & Engineering

VIT Vellore

GitHub: https://github.com/Rahul-Matrixx

---

# 📄 License

This project was developed as part of the **Honeywell EcoLoop Building Agents Hackathon** for educational and demonstration purposes.