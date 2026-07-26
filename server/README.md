# 🏢 EcoLoop Building Agents: AI-Powered Closed-Loop Smart Building Management System

> An AI-powered Smart Building Management System that analyzes building conditions, generates intelligent optimization recommendations using Llama 3.1 (Groq), and executes automated building control actions through a closed-loop workflow.

---

# 📌 Overview

EcoLoop Building Agents is an AI-driven Building Management System (BMS) developed to optimize energy consumption, improve occupant comfort, and automate smart building operations.

The system continuously analyzes room temperature, occupancy, and device health to generate AI recommendations and automatically execute optimization actions such as HVAC adjustment, Eco Mode activation, and maintenance scheduling.

---

# 🚀 Features

- 🤖 AI-powered building optimization using Llama 3.1 (Groq)
- 🏢 Smart room monitoring
- 🌡 HVAC optimization
- 💡 Lighting Eco Mode automation
- 🛠 Automatic maintenance scheduling
- 📊 Building Health dashboard
- ⚡ Energy Saving analytics
- 😊 Comfort Score monitoring
- 📝 AI Recommendation Engine
- 🔄 Closed-Loop Tool Execution
- 📜 AI Activity Log
- 🔐 JWT Authentication

---

# 🧠 AI Workflow

Sensor Data
↓

Room & Device Analysis
↓

AI Recommendation (Groq Llama 3.1)
↓

Tool Execution

- HVAC Tool
- Lighting Tool
- Maintenance Tool

↓

Dashboard Update

---

# ⚙ Tech Stack

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

## AI

- Groq API
- Llama 3.1 8B Instant

## Authentication

- JWT

---

# 🏗 Architecture

Frontend (React Dashboard)

↓

REST API (Express)

↓

AI Controller

↓

Groq LLM

↓

Automation Tools

- HVAC Tool
- Lighting Tool
- Maintenance Tool

↓

MongoDB

---

# 📂 Project Structure

```
client/
    src/
    components/
    pages/

server/
    src/
        controllers/
        models/
        routes/
        tools/
        utils/
        middleware/
```

---

# 🔄 Closed-Loop Execution

The optimization process follows a complete feedback loop:

1. Read room data
2. Analyze occupancy
3. Analyze temperature
4. Analyze maintenance status
5. Generate AI recommendations
6. Execute HVAC Tool
7. Execute Lighting Tool
8. Execute Maintenance Tool
9. Update dashboard metrics
10. Display optimization results

---

# 🔧 Automation Tools

### HVAC Tool

- Adjust AC temperature
- Optimize room comfort

### Lighting Tool

- Enable Eco Mode
- Reduce unnecessary energy usage

### Maintenance Tool

- Schedule preventive maintenance
- Improve device reliability

---

# 📊 Dashboard Metrics

The dashboard displays:

- Building Health
- Comfort Score
- AI Confidence
- Energy Saving
- Daily Saving
- Monthly Saving
- AI Recommendations
- AI Activity Log

---

# 🔐 Authentication

- JWT Login
- Protected APIs
- Authorization Middleware

---

# ⚡ API Endpoints

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

# 📸 Screenshots

Add screenshots here:

- Dashboard
- AI Recommendation
- Activity Log
- Login Page
- Analytics

---

# 🚀 Installation

## Clone Repository

```bash
git clone <repository-url>
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

Backend `.env`

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

GROQ_API_KEY=YOUR_GROQ_API_KEY
```

---

# 📈 Current Capabilities

✅ AI Recommendation Engine

✅ Building Health Analysis

✅ Energy Optimization

✅ Comfort Analysis

✅ Closed-Loop Tool Execution

✅ Smart Dashboard

✅ Groq LLM Integration

---

# 🔮 Future Enhancements

- EnergyPlus Integration
- MCP Server Integration
- Live IoT Sensor Streaming
- Predictive Energy Forecasting
- Multi-Building Support
- Carbon Footprint Analytics

---

# 👨‍💻 Author

**Rahul Kumar**

VIT Vellore

---

# 📄 License

This project was developed as part of the **Honeywell EcoLoop Building Agents Hackathon** for educational and demonstration purposes.