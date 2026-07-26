export default function StatsCard({ label, value, accent }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-lg ${accent}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
