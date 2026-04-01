export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-100 shadow-sm
        ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, title, value, subtitle, color = 'primary', trend }) {
  const colors = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/30',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
    rose: 'from-rose-500 to-rose-600 shadow-rose-500/30',
    violet: 'from-violet-500 to-violet-600 shadow-violet-500/30',
    sky: 'from-sky-500 to-sky-600 shadow-sky-500/30',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fade-in hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 flex items-center gap-1">
              {trend && <span className={trend > 0 ? 'text-emerald-500' : 'text-red-500'}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
