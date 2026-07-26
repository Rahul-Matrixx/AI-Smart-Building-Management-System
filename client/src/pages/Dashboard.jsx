import { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import StatsCard from '../components/StatsCard';

const COLORS = ['#22d3ee', '#818cf8', '#f59e0b', '#fb7185'];

/* ------------------------------------------------------------------ */
/*  Small local helpers & reusable subcomponents (kept in-file so no  */
/*  other imports / files need to change)                             */
/* ------------------------------------------------------------------ */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function hashString(str) {
  let hash = 0;
  const s = String(str || 'seed');
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getDeviceStats(device) {
  const seed = hashString(device._id || device.name);
  const health = clamp(device.maintenanceScore ?? 80, 0, 100);
  return {
    battery: 40 + (seed % 60),
    voltage: (200 + (seed % 40)).toFixed(1),
    power: 20 + (seed % 180),
    runtime: 100 + (seed % 900),
    signal: 50 + (seed % 50),
    health
  };
}

function getRiskProfile(score) {
  if (score < 60) return { level: 'High', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300', priority: 'Urgent' };
  if (score < 80) return { level: 'Medium', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300', priority: 'Soon' };
  return { level: 'Low', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300', priority: 'Routine' };
}

function ProgressBar({ label, value, colorClass = 'bg-cyan-400', suffix = '%' }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-slate-200">{Math.round(value)}{suffix}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-700 ease-out`}
          style={{ width: `${clamp(value, 0, 100)}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent = 'text-slate-100' }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-slate-900">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function Pill({ label, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-slate-700 bg-slate-800/60 text-slate-200',
    good: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    warn: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    bad: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${tones[tone]}`}>
      {label}
    </span>
  );
}

function LogEntry({ entry }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2 text-sm transition hover:border-slate-700 hover:bg-slate-800">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-base leading-none">{entry.icon || '🧠'}</span>
        <div className="min-w-0">
          <p className="truncate text-slate-200">{entry.description || entry.action}</p>
          {entry.category && <p className="text-[11px] uppercase tracking-wide text-slate-500">{entry.category}</p>}
        </div>
      </div>
      <span className="shrink-0 text-xs text-slate-500">{entry.time}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

export default function Dashboard({ user }) {
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({ totalRooms: 0, totalDevices: 0, energyUsage: 0, avgOccupancy: 0 });
  const [roomForm, setRoomForm] = useState({ name: '', type: 'office', occupancy: 0, temperature: 24, acSetpoint: 24 });
  const [deviceForm, setDeviceForm] = useState({ name: '', type: 'sensor', roomId: '', status: 'online', maintenanceScore: 90 });

  // --- AI Control Center state ---
  const [buildingHealth, setBuildingHealth] = useState(94);
  const [comfortScore, setComfortScore] = useState(91);
  const [energySaving, setEnergySaving] = useState(18);
  const [lastOptimizedAt, setLastOptimizedAt] = useState('Not yet run');
  const [activityLog, setActivityLog] = useState([
    { id: 'seed-1', time: '—', icon: '🧠', category: 'System', description: 'AI Control Center initialized' }
  ]);
  const [optimizationMessage, setOptimizationMessage] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // --- Hero / live simulation state ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ tempC: 31, condition: 'Partly Cloudy', humidity: 58, wind: 12 });
  const [occupancyPrediction, setOccupancyPrediction] = useState(0);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [tempHistory, setTempHistory] = useState([]);
  const [emergencyLog, setEmergencyLog] = useState([]);

  const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchData = useCallback(async () => {
    try {
      const [roomsRes, devicesRes, alertsRes, reportsRes] = await Promise.all([
        axios.get('/api/rooms', { headers: getAuthHeaders() }),
        axios.get('/api/devices', { headers: getAuthHeaders() }),
        axios.get('/api/alerts', { headers: getAuthHeaders() }),
        axios.get('/api/reports', { headers: getAuthHeaders() })
      ]);
      setRooms(roomsRes.data.rooms || []);
      setDevices(devicesRes.data.devices || []);
      setAlerts(alertsRes.data.alerts || []);
      setReports(reportsRes.data.reports || []);
      setSummary({
        totalRooms: roomsRes.data.rooms?.length || 0,
        totalDevices: devicesRes.data.devices?.length || 0,
        energyUsage: reportsRes.data.reports?.reduce((sum, item) => sum + item.energyUsage, 0) || 0,
        avgOccupancy: roomsRes.data.rooms?.reduce((sum, item) => sum + item.occupancy, 0) / (roomsRes.data.rooms?.length || 1) || 0
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live clock — updates every second
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Seed temperature history once rooms are available
  useEffect(() => {
    if (rooms.length && tempHistory.length === 0) {
      const avgTemp = rooms.reduce((s, r) => s + (r.temperature || 24), 0) / rooms.length;
      setTempHistory([{ time: currentTime.toLocaleTimeString(), actual: round1(avgTemp), predicted: round1(avgTemp), target: 24 }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  // Live AI simulation — every 5 seconds nudge temperature, occupancy,
  // energy, health and surface fresh recommendations / alerts.
  useEffect(() => {
    const interval = setInterval(() => {
      setBuildingHealth((prev) => clamp(round1(prev + (Math.random() * 2 - 1)), 60, 100));
      setComfortScore((prev) => clamp(round1(prev + (Math.random() * 2 - 1)), 60, 100));
      setEnergySaving((prev) => clamp(round1(prev + (Math.random() * 1 - 0.3)), 0, 45));

      setOccupancyPrediction(() => {
        const base = summary.avgOccupancy || 0;
        return Math.max(0, Math.round(base + (Math.random() * 4 - 2)));
      });

      setTempHistory((prev) => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        const nextActual = clamp(last.actual + (Math.random() * 1.4 - 0.7), 16, 34);
        const predicted = clamp(nextActual + (Math.random() * 1 - 0.5), 16, 34);
        const point = { time: new Date().toLocaleTimeString(), actual: round1(nextActual), predicted: round1(predicted), target: 24 };
        return [...prev.slice(-11), point];
      });

      setWeather((prev) => ({
        ...prev,
        tempC: clamp(round1(prev.tempC + (Math.random() * 0.6 - 0.3)), 18, 42),
        humidity: clamp(Math.round(prev.humidity + (Math.random() * 4 - 2)), 25, 95),
        wind: clamp(Math.round(prev.wind + (Math.random() * 2 - 1)), 0, 35)
      }));

      setLiveAlerts((prev) => {
        const messages = [
          'Peak Load Expected between 2 PM – 4 PM',
          'Carbon Saving Opportunity detected in HVAC cycle',
          'Occupancy pattern stable across monitored zones',
          'Energy draw within optimal thresholds',
          'Temperature drift detected — auto-balancing engaged'
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const entry = { id: `${Date.now()}-live`, time: new Date().toLocaleTimeString(), text: msg };
        return [entry, ...prev].slice(0, 6);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [summary.avgOccupancy]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    await axios.post('/api/rooms', roomForm, { headers: getAuthHeaders() });
    setRoomForm({ name: '', type: 'office', occupancy: 0, temperature: 24, acSetpoint: 24 });
    fetchData();
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    await axios.post('/api/devices', { ...deviceForm, roomId: deviceForm.roomId || rooms[0]?._id }, { headers: getAuthHeaders() });
    setDeviceForm({ name: '', type: 'sensor', roomId: '', status: 'online', maintenanceScore: 90 });
    fetchData();
  };

  // Emergency toggle now also simulates the wider emergency-response
  // sequence (alarm, lights, HVAC safe mode, notification) client-side,
  // on top of the existing, unchanged API call.
  const handleToggleEmergency = async (room) => {
    const activating = !room.emergencyMode;
    try {
      await axios.post(`/api/rooms/${room._id}/emergency`, {}, { headers: getAuthHeaders() });
    } catch (error) {
      console.error(error);
    }

    const t = new Date().toLocaleTimeString();
    if (activating) {
      setEmergencyLog((prev) => [
        { id: `${Date.now()}-e1`, time: t, text: `🚨 Alarm Activated in ${room.name}` },
        { id: `${Date.now()}-e2`, time: t, text: `💡 Lights switched ON in ${room.name}` },
        { id: `${Date.now()}-e3`, time: t, text: `❄️ HVAC set to Safe Mode in ${room.name}` },
        { id: `${Date.now()}-e4`, time: t, text: `📣 Emergency notification sent to facility team` },
        ...prev
      ].slice(0, 20));
    } else {
      setEmergencyLog((prev) => [{ id: `${Date.now()}-e5`, time: t, text: `✅ Emergency cleared in ${room.name}` }, ...prev].slice(0, 20));
    }
    fetchData();
  };

  const occupancyChart = useMemo(() => rooms.map((room) => ({ name: room.name, occupancy: room.occupancy })), [rooms]);
  const energyChart = useMemo(() => reports.map((report) => ({ name: report.period, energyUsage: report.energyUsage })), [reports]);
  const deviceChart = useMemo(() => devices.reduce((acc, device) => {
    const existing = acc.find((item) => item.status === device.status);
    if (existing) existing.value += 1; else acc.push({ name: device.status, value: 1 });
    return acc;
  }, []), [devices]);

  // --- Dynamic AI insight: rooms temperature / occupancy + device health,
  //     plus time-of-day peak-load and carbon-saving heuristics ---
  const aiInsight = useMemo(() => {
    const busiestRoom = rooms.length > 0 ? rooms.reduce((a, b) => (a.occupancy > b.occupancy ? a : b)) : null;

    const hotRooms = rooms.filter((r) => r.temperature > 28);
    const lowOccupancyRooms = rooms.filter((r) => r.occupancy < 5);
    const riskyDevices = devices.filter((d) => d.maintenanceScore < 80);

    const recommendations = [];
    if (hotRooms.length) {
      recommendations.push(`Reduce AC setpoint to 23°C in ${hotRooms.map((r) => r.name).join(', ')} to curb overheating.`);
    }
    if (lowOccupancyRooms.length) {
      recommendations.push(`Switch lights to Eco Mode in ${lowOccupancyRooms.map((r) => r.name).join(', ')} due to low occupancy.`);
    }
    if (riskyDevices.length) {
      recommendations.push(`Schedule maintenance for ${riskyDevices.length} device(s): ${riskyDevices.map((d) => d.name).join(', ')}.`);
    }
    const hour = new Date().getHours();
    if (hour >= 13 && hour <= 16) {
      recommendations.push('Peak Load Expected between 1 PM – 4 PM — consider shifting non-critical loads.');
    }
    if (energySaving < 25) {
      recommendations.push('Carbon Saving Opportunity: enable adaptive HVAC scheduling to boost efficiency further.');
    }

    const recommendation = recommendations.length ? recommendations[0] : 'Building is operating efficiently. Maintain current settings.';

    return {
      room: busiestRoom?.name || 'No Room',
      occupancy: busiestRoom?.occupancy || 0,
      recommendedTemp: busiestRoom && busiestRoom.temperature > 28 ? 23 : 24,
      maintenanceRisk: riskyDevices.length,
      hotRooms,
      lowOccupancyRooms,
      riskyDevices,
      recommendations,
      recommendation
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, devices, energySaving]);

  // --- Derived AI Control Center metrics ---
  const aiConfidence = useMemo(() => clamp(Math.round((buildingHealth + comfortScore) / 2), 0, 100), [buildingHealth, comfortScore]);
  const systemStatus = aiConfidence > 85 ? 'Optimal' : aiConfidence > 70 ? 'Stable' : 'Needs Review';
  const dailySaving = useMemo(() => round1((summary.energyUsage || 0) * (energySaving / 100)), [summary.energyUsage, energySaving]);
  const monthlySaving = useMemo(() => round1(dailySaving * 30), [dailySaving]);
  const weeklySaving = useMemo(() => round1(dailySaving * 7), [dailySaving]);
  const beforeAIUsage = useMemo(() => round1((summary.energyUsage || 0) / (1 - Math.min(energySaving, 90) / 100 || 1)), [summary.energyUsage, energySaving]);

  const buildingStatus = buildingHealth >= 90 ? 'Excellent' : buildingHealth >= 75 ? 'Good' : 'Needs Attention';
  const anyRoomEmergency = rooms.some((r) => r.emergencyMode);
  const criticalAlertsCount = alerts.filter((a) => a.level === 'critical').length;
  const emergencyActive = anyRoomEmergency || criticalAlertsCount > 0;

  const co2Today = useMemo(() => round1(dailySaving * 0.82), [dailySaving]);
  const co2Weekly = useMemo(() => round1(co2Today * 7), [co2Today]);
  const co2Monthly = useMemo(() => round1(co2Today * 30), [co2Today]);
  const treesSaved = useMemo(() => Math.max(1, Math.round(co2Monthly / 21)), [co2Monthly]);

  const emptyRoomsCount = rooms.filter((r) => r.occupancy === 0).length;
  const peakTimeLabel = useMemo(() => {
    const h = (currentTime.getHours() + 2) % 24;
    return `${h}:00 - ${(h + 2) % 24}:00`;
  }, [currentTime]);

  const riskiestDevices = useMemo(
    () => [...devices].sort((a, b) => (a.maintenanceScore ?? 100) - (b.maintenanceScore ?? 100)).slice(0, 3),
    [devices]
  );

  // --- Run AI Optimization: recalculates health/comfort/savings, calls the
  //     (optional) backend endpoint, and logs every simulated action ---
  const handleRunOptimization = async () => {
  setIsOptimizing(true);

  try {
    const res = await axios.post(
      "/api/ai/optimize",
      {},
      { headers: getAuthHeaders() }
    );

    const data = res.data;

    setAiRecommendations(data.recommendations || []);

setOptimizationMessage(
  data.aiRecommendation || ""
);

    const timestamp = new Date().toLocaleTimeString();

    // Backend values
    setBuildingHealth(data.buildingHealth);
    setComfortScore(data.comfortScore);
    setEnergySaving(data.energySaving);
    setLastOptimizedAt(timestamp);

    // AI Recommendation
    setOptimizationMessage(
      data.aiRecommendation ||
      data.recommendations.join(" | ")
    );

    // Activity Log
    const logs = [];

    data.recommendations.forEach((item, index) => {
      logs.push({
        id: Date.now() + index,
        time: timestamp,
        icon: "🤖",
        category: "AI",
        description: item
      });
    });

    setActivityLog(prev => [...logs, ...prev].slice(0,25));

  } catch (err) {
    console.error(err);
  }

  setIsOptimizing(false);

  setTimeout(() => {
    setOptimizationMessage("");
  }, 4000);
};

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ---------------- HERO SECTION ---------------- */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Honeywell Campus Connect</p>
            <h1 className="mt-2 text-3xl font-semibold">Smart Building Management Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">Welcome back, {user?.name || 'Admin'}.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              <span>{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill label="🤖 AI Status: Active" tone="info" />
            <Pill label={`🏢 Building: ${buildingStatus}`} tone={buildingHealth >= 90 ? 'good' : buildingHealth >= 75 ? 'info' : 'warn'} />
            <Pill label={`🚨 Emergency: ${emergencyActive ? 'Active' : 'Standby'}`} tone={emergencyActive ? 'bad' : 'good'} />
            <Pill label={`🌤️ ${round1(weather.tempC)}°C ${weather.condition}`} tone="neutral" />
          </div>
        </div>

        {/* ---------------- AI CONTROL CENTER ---------------- */}
        <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-cyan-300">🤖 AI Control Center</h2>
              <p className="mt-2 text-slate-300">Autonomous Building Optimization Engine</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300">AI Active</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">Building Health</p>
              <h3 className="mt-2 text-2xl font-bold text-green-400">{buildingHealth}%</h3>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">Comfort Score</p>
              <h3 className="mt-2 text-2xl font-bold text-cyan-400">{comfortScore}%</h3>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">Energy Saving</p>
              <h3 className="mt-2 text-2xl font-bold text-emerald-400">{energySaving}%</h3>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">Maintenance Risk</p>
              <h3 className="mt-2 text-2xl font-bold text-yellow-400">{aiInsight.maintenanceRisk}</h3>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="text-sm text-slate-400">Current Occupancy</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{summary.avgOccupancy.toFixed(1)}</h3>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MiniStat label="AI Confidence" value={`${aiConfidence}%`} accent="text-cyan-300" />
            <MiniStat label="System Status" value={systemStatus} accent={systemStatus === 'Optimal' ? 'text-emerald-300' : systemStatus === 'Stable' ? 'text-cyan-300' : 'text-amber-300'} />
            <MiniStat label="Last Optimization" value={lastOptimizedAt} accent="text-slate-200" />
            <MiniStat label="Est. Daily Saving" value={`${dailySaving} kWh`} accent="text-emerald-300" />
            <MiniStat label="Est. Monthly Saving" value={`${monthlySaving} kWh`} accent="text-emerald-300" />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ProgressBar label="Building Health" value={buildingHealth} colorClass="bg-green-400" />
            <ProgressBar label="Comfort Score" value={comfortScore} colorClass="bg-cyan-400" />
            <ProgressBar label="AI Confidence" value={aiConfidence} colorClass="bg-indigo-400" />
          </div>

          <div className="mt-6 rounded-xl bg-emerald-900/40 p-5">
            <h3 className="text-lg font-semibold text-emerald-300">AI Recommendations</h3>
            
<ul className="mt-3 space-y-2 text-sm text-slate-100">

  {aiRecommendations.map((rec, idx) => (
    <li
      key={idx}
      className="rounded-lg border border-emerald-500/20 bg-slate-900/40 px-3 py-2"
    >
      ✅ {rec}
    </li>
  ))}

</ul>

{optimizationMessage && (
  <div className="mt-4 rounded-xl border border-cyan-500/40 bg-cyan-900/20 p-4">

    <div className="mb-2 text-cyan-300 font-semibold">
      🤖 AI Assistant Recommendation
    </div>

    <div className="whitespace-pre-wrap text-slate-100 leading-7">
      {optimizationMessage}
    </div>

  </div>
)}
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                onClick={handleRunOptimization}
                disabled={isOptimizing}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:scale-[1.02] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isOptimizing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/60 border-t-transparent" />}
                {isOptimizing ? 'Optimizing...' : 'Run AI Optimization'}
              </button>
              
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-900/60 p-5">
            <h3 className="text-lg font-semibold text-slate-200">AI Activity Log</h3>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
              {activityLog.map((entry) => <LogEntry key={entry.id} entry={entry} />)}
            </div>
          </div>
        </div>

        {/* ---------------- BUILDING KPIs ---------------- */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <StatsCard label="Total Rooms" value={summary.totalRooms} accent="border-cyan-500/30 bg-cyan-500/10" />
          <StatsCard label="Devices" value={summary.totalDevices} accent="border-indigo-500/30 bg-indigo-500/10" />
          <StatsCard label="Energy Usage" value={`${summary.energyUsage.toFixed(1)} kWh`} accent="border-violet-500/30 bg-violet-500/10" />
          <StatsCard label="Avg Occupancy" value={`${summary.avgOccupancy.toFixed(1)} people`} accent="border-amber-500/30 bg-amber-500/10" />
          <StatsCard label="Power Usage" value={`${round1(summary.energyUsage * 0.8)} kW`} accent="border-cyan-500/30 bg-cyan-500/10" />
          <StatsCard label="CO₂ Saved Today" value={`${co2Today} kg`} accent="border-emerald-500/30 bg-emerald-500/10" />
          <StatsCard label="Critical Alerts" value={criticalAlertsCount} accent="border-rose-500/30 bg-rose-500/10" />
          <StatsCard label="Today's Savings" value={`${dailySaving} kWh`} accent="border-indigo-500/30 bg-indigo-500/10" />
        </div>

        {/* ---------------- OCCUPANCY + DEVICE STATUS ---------------- */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Occupancy Overview</h2>
              <span className="text-sm text-slate-400">Real-time room utilization</span>
            </div>
            <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <MiniStat label="Current Occupancy" value={summary.avgOccupancy.toFixed(1)} />
              <MiniStat label="Next Hour Prediction" value={occupancyPrediction} accent="text-cyan-300" />
              <MiniStat label="Peak Time" value={peakTimeLabel} />
              <MiniStat label="Empty Rooms" value={emptyRoomsCount} />
              <MiniStat label="Average Occupancy" value={summary.avgOccupancy.toFixed(1)} />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={occupancyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="occupancy" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Device Status</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deviceChart} dataKey="value" nameKey="name" outerRadius={90}>
                  {deviceChart.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---------------- TEMPERATURE ANALYTICS + ENERGY COMPARISON ---------------- */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Temperature Analytics</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={tempHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#22d3ee" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#818cf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Energy Comparison</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniStat label="Before AI" value={`${beforeAIUsage.toFixed(1)} kWh`} accent="text-rose-300" />
              <MiniStat label="After AI" value={`${summary.energyUsage.toFixed(1)} kWh`} accent="text-emerald-300" />
              <MiniStat label="Today's Saving" value={`${dailySaving} kWh`} />
              <MiniStat label="Weekly Saving" value={`${weeklySaving} kWh`} />
              <MiniStat label="Monthly Saving" value={`${monthlySaving} kWh`} />
              <MiniStat label="Energy Saved %" value={`${energySaving}%`} accent="text-cyan-300" />
            </div>
            <div className="mt-4">
              <ProgressBar label="Energy Saved vs Before AI" value={energySaving} colorClass="bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* ---------------- ENERGY TREND + ALERTS ---------------- */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Energy Trend</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={energyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="energyUsage" stroke="#818cf8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Active Alerts</h2>
            <div className="space-y-3">
              {alerts.length ? alerts.map((alert) => (
                <div key={alert._id} className={`rounded-2xl border p-3 transition ${alert.level === 'critical' ? 'border-rose-500/40 bg-rose-500/10 text-rose-300' : 'border-slate-700 bg-slate-800/60 text-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{alert.title}</p>
                    <span className="text-xs uppercase">{alert.level}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{alert.message}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No active alerts.</p>}
            </div>
            {liveAlerts.length > 0 && (
              <div className="mt-4 border-t border-slate-800 pt-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Live AI Monitoring</p>
                <div className="space-y-2">
                  {liveAlerts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2 text-xs text-slate-300">
                      <span>{a.text}</span>
                      <span className="text-slate-500">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- CARBON, WEATHER, PREDICTIVE MAINTENANCE ---------------- */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">🌱 Carbon Emission</h2>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="CO₂ Saved Today" value={`${co2Today} kg`} accent="text-emerald-300" />
              <MiniStat label="Weekly" value={`${co2Weekly} kg`} />
              <MiniStat label="Monthly" value={`${co2Monthly} kg`} />
              <MiniStat label="Trees Equivalent" value={`${treesSaved} 🌳`} accent="text-emerald-300" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">🌤️ Weather</h2>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Outside Temp" value={`${round1(weather.tempC)}°C`} />
              <MiniStat label="Condition" value={weather.condition} />
              <MiniStat label="Humidity" value={`${weather.humidity}%`} />
              <MiniStat label="Wind Speed" value={`${weather.wind} km/h`} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">🔧 Predictive Maintenance</h2>
            <div className="space-y-3">
              {riskiestDevices.length ? riskiestDevices.map((device) => {
                const score = device.maintenanceScore ?? 80;
                const risk = getRiskProfile(score);
                const remainingDays = Math.max(5, Math.round(score * 3));
                const expectedFailure = new Date(Date.now() + remainingDays * 86400000).toLocaleDateString();
                return (
                  <div key={device._id} className="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-200">{device.name}</p>
                      <span className={`rounded-full px-2 py-1 text-xs ${risk.badge}`}>{risk.level} Risk</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Score {score} • Remaining life ~{remainingDays}d</p>
                    <p className="text-xs text-slate-400">Expected failure: {expectedFailure} • Priority: {risk.priority}</p>
                  </div>
                );
              }) : <p className="text-sm text-slate-400">No devices to evaluate yet.</p>}
            </div>
          </div>
        </div>

        {/* ---------------- EMERGENCY CONTROL PANEL ---------------- */}
        <div className={`rounded-3xl border p-5 shadow-xl transition ${emergencyActive ? 'border-rose-500/50 bg-rose-500/10' : 'border-slate-800 bg-slate-900/80'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">🚨 Emergency Control Panel</h2>
            <Pill label={emergencyActive ? 'Emergency Active' : 'All Systems Normal'} tone={emergencyActive ? 'bad' : 'good'} />
          </div>
          <p className="mt-2 text-sm text-slate-400">Trigger Emergency directly from a room card below. Each activation simulates an alarm, lighting, HVAC safe-mode and notification sequence.</p>
          <div className="mt-4 max-h-48 space-y-2 overflow-y-auto pr-1">
            {emergencyLog.length ? emergencyLog.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2 text-sm">
                <span className="text-slate-200">{e.text}</span>
                <span className="text-xs text-slate-500">{e.time}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No emergency events yet.</p>}
          </div>
        </div>

        {/* ---------------- ROOM + DEVICE MANAGEMENT ---------------- */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Room Management</h2>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Room name" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
              <select className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2" value={roomForm.type} onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}>
                <option value="office">Office</option>
                <option value="conference">Conference</option>
                <option value="lab">Lab</option>
              </select>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2" type="number" placeholder="Occupancy" value={roomForm.occupancy} onChange={(e) => setRoomForm({ ...roomForm, occupancy: Number(e.target.value) })} />
                <input className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2" type="number" placeholder="Temperature" value={roomForm.temperature} onChange={(e) => setRoomForm({ ...roomForm, temperature: Number(e.target.value) })} />
              </div>
              <button className="w-full rounded-xl bg-cyan-500 px-3 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400">Add Room</button>
            </form>
            <div className="mt-4 space-y-2">
              {rooms.map((room) => (
                <div key={room._id} className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800/60 p-3 transition hover:border-slate-600">
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-slate-400">{room.type} • Occupancy {room.occupancy} • Temp {room.temperature}°C</p>
                  </div>
                  <button onClick={() => handleToggleEmergency(room)} className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold transition hover:bg-rose-400">{room.emergencyMode ? 'Disable' : 'Emergency'}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Device Management</h2>
            <form onSubmit={handleCreateDevice} className="space-y-3">
              <input className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2" placeholder="Device name" value={deviceForm.name} onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })} />
              <select className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2" value={deviceForm.type} onChange={(e) => setDeviceForm({ ...deviceForm, type: e.target.value })}>
                <option value="sensor">Sensor</option>
                <option value="ac">AC</option>
                <option value="light">Light</option>
              </select>
              <select className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2" value={deviceForm.roomId || rooms[0]?._id || ''} onChange={(e) => setDeviceForm({ ...deviceForm, roomId: e.target.value })}>
                {rooms.map((room) => <option key={room._id} value={room._id}>{room.name}</option>)}
              </select>
              <button className="w-full rounded-xl bg-indigo-500 px-3 py-2 font-semibold text-white transition hover:bg-indigo-400">Add Device</button>
            </form>
            <div className="mt-4 space-y-2">
              {devices.map((device) => {
                const stats = getDeviceStats(device);
                return (
                  <div key={device._id} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-3 transition hover:border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-slate-400">{device.type} • {device.roomId?.name || 'Unassigned'}</p>
                      </div>
                      <span className="rounded-full bg-slate-700 px-2 py-1 text-xs">{device.status}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-400 sm:grid-cols-4">
                      <span>🔋 {stats.battery}%</span>
                      <span>⚡ {stats.voltage}V</span>
                      <span>🔌 {stats.power}W</span>
                      <span>⏱️ {stats.runtime}h</span>
                      <span>📶 {stats.signal}%</span>
                      <span>💯 Health {stats.health}%</span>
                      <span>🛠️ Score {device.maintenanceScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
