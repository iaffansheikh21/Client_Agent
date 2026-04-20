'use client';
import { useEffect, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/analytics/`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', color: 'var(--text2)' }}>Loading analytics...</div>;
  if (!data) return <div style={{ padding: '40px', color: 'var(--red)' }}>Failed to load</div>;

  const maxMsg = Math.max(...data.messages_per_day.map((d: any) => d.count), 1);
  const maxTask = Math.max(...data.tasks_per_day.map((d: any) => d.count), 1);
  const maxConv = Math.max(...data.conversations_per_day.map((d: any) => d.count), 1);
  const totalChannel = data.channel_breakdown.reduce((s: number, c: any) => s + c.count, 0);

  const channelColor: Record<string, string> = {
    whatsapp: '#25D366',
    slack: '#7c6fff',
    api: '#888',
    email: '#FFA500',
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const Card = ({ label, value, color, sub }: any) => (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '20px',
    }}>
      <div style={{ fontSize: '28px', fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color, marginTop: '4px' }}>{sub}</div>}
    </div>
  );

  const BarChart = ({ data: chartData, max, color, label }: any) => (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
      <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '20px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px' }}>
        {chartData.map((d: any, i: number) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '9px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
              {d.count > 0 ? d.count : ''}
            </div>
            <div style={{
              width: '100%',
              height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%`,
              background: d.count > 0 ? color : 'var(--border)',
              borderRadius: '3px 3px 0 0',
              transition: 'height 0.3s ease',
              minHeight: '2px',
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
          {formatDate(chartData[0]?.date)}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
          {formatDate(chartData[chartData.length - 1]?.date)}
        </span>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>ANALYTICS</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Insights</h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <Card label="Total conversations" value={data.totals.conversations} color="var(--accent)" />
        <Card label="Total clients" value={data.totals.clients} color="var(--blue)" />
        <Card label="Total messages" value={data.totals.messages} color="var(--green)" />
        <Card label="Escalations" value={data.totals.escalated} color="var(--red)" />
        <Card label="Escalation rate" value={`${data.totals.escalation_rate}%`} color="var(--amber)"
          sub={data.totals.escalation_rate > 20 ? '⚠️ High' : '✓ Normal'} />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <BarChart data={data.messages_per_day} max={maxMsg} color="#7c6fff" label="MESSAGES PER DAY (14 DAYS)" />
        <BarChart data={data.tasks_per_day} max={maxTask} color="#ffb84f" label="TASKS CREATED PER DAY" />
        <BarChart data={data.conversations_per_day} max={maxConv} color="#4fffb0" label="NEW CONVERSATIONS PER DAY" />
      </div>

      {/* Channel breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Pie-style breakdown */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '20px' }}>CHANNEL BREAKDOWN</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.channel_breakdown.map((ch: any) => {
              const pct = totalChannel ? Math.round((ch.count / totalChannel) * 100) : 0;
              const color = channelColor[ch.channel] || 'var(--text2)';
              return (
                <div key={ch.channel}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: '13px', color: 'var(--text)', textTransform: 'capitalize' }}>{ch.channel}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>{ch.count}</span>
                      <span style={{ fontSize: '12px', color, fontFamily: 'JetBrains Mono, monospace', minWidth: '36px', textAlign: 'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '3px' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: color, borderRadius: '3px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Escalation summary */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '20px' }}>ESCALATION SUMMARY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Total conversations', value: data.totals.conversations, color: 'var(--accent)' },
              { label: 'Auto-resolved', value: data.totals.conversations - data.totals.escalated, color: 'var(--green)' },
              { label: 'Escalated to human', value: data.totals.escalated, color: 'var(--red)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '3px', height: '20px', borderRadius: '2px', background: color }} />
                  <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{label}</span>
                </div>
                <span style={{ fontSize: '20px', fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
              </div>
            ))}
            <div style={{
              marginTop: '8px', padding: '12px', borderRadius: '8px',
              background: data.totals.escalation_rate > 20 ? 'rgba(255,79,111,0.1)' : 'rgba(79,255,176,0.1)',
              border: `1px solid ${data.totals.escalation_rate > 20 ? 'rgba(255,79,111,0.3)' : 'rgba(79,255,176,0.3)'}`,
            }}>
              <div style={{ fontSize: '13px', color: data.totals.escalation_rate > 20 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                {data.totals.escalation_rate > 20 ? '⚠️ High escalation rate — review agent prompts' : '✓ Agent is handling most queries automatically'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}