// 'use client';
// import { useEffect, useState } from 'react';
// import { api } from '@/lib/api';
// import { useRouter } from 'next/navigation';

// export default function ConversationDetailPage({ params }: { params: { id: string } }) {
//   const [conv, setConv] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     api.getConversation(params.id)
//       .then(setConv)
//       .finally(() => setLoading(false));
//   }, [params.id]);

//   const updateStatus = async (status: string) => {
//     await api.updateStatus(params.id, status);
//     setConv((prev: any) => ({ ...prev, status }));
//   };

//   if (loading) return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text2)' }}>
//       Loading...
//     </div>
//   );

//   if (!conv) return (
//     <div style={{ color: 'var(--red)', padding: '40px' }}>Conversation not found</div>
//   );

//   const statusColor: Record<string, string> = {
//     active: 'var(--green)', escalated: 'var(--red)', resolved: 'var(--blue)',
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div style={{ marginBottom: '32px' }}>
//         <button onClick={() => router.back()} style={{
//           background: 'none', border: 'none', color: 'var(--text2)',
//           cursor: 'pointer', fontSize: '13px', marginBottom: '16px',
//           fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
//         }}>
//           ← Back
//         </button>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div>
//             <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>
//               CONVERSATION
//             </div>
//             <h1 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.5px' }}>
//               {conv.id.slice(0, 20)}...
//             </h1>
//           </div>
//           <div style={{ display: 'flex', gap: '8px' }}>
//             {['active', 'resolved', 'escalated'].map((s) => (
//               <button key={s} onClick={() => updateStatus(s)} style={{
//                 padding: '8px 16px', borderRadius: '6px', border: '1px solid',
//                 borderColor: conv.status === s ? statusColor[s] : 'var(--border)',
//                 background: conv.status === s ? `${statusColor[s]}22` : 'transparent',
//                 color: conv.status === s ? statusColor[s] : 'var(--text2)',
//                 fontSize: '12px', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
//                 textTransform: 'capitalize',
//               }}>
//                 {s}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Meta info */}
//       <div style={{
//         display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px',
//       }}>
//         {[
//           { label: 'Channel', value: conv.channel },
//           { label: 'Status', value: conv.status },
//           { label: 'Messages', value: conv.messages?.length || 0 },
//         ].map(({ label, value }) => (
//           <div key={label} style={{
//             background: 'var(--bg2)', border: '1px solid var(--border)',
//             borderRadius: '8px', padding: '16px',
//           }}>
//             <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>{label.toUpperCase()}</div>
//             <div style={{ fontSize: '16px', fontWeight: 600, textTransform: 'capitalize' }}>{value}</div>
//           </div>
//         ))}
//       </div>

//       {/* Messages */}
//       <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
//         <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '24px' }}>
//           MESSAGES
//         </div>
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//           {conv.messages?.map((msg: any) => (
//             <div key={msg.id} style={{
//               display: 'flex',
//               justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
//             }}>
//               <div style={{
//                 maxWidth: '70%',
//                 padding: '12px 16px',
//                 borderRadius: msg.role === 'user' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
//                 background: msg.role === 'user' ? 'var(--bg3)' : 'rgba(124,111,255,0.15)',
//                 border: '1px solid',
//                 borderColor: msg.role === 'user' ? 'var(--border)' : 'rgba(124,111,255,0.3)',
//               }}>
//                 <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
//                   {msg.role === 'user' ? 'Client' : 'Agent'}
//                 </div>
//                 <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
//                   {msg.content}
//                 </div>
//                 <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
//                   {new Date(msg.created_at).toLocaleTimeString()}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
// 'use client';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';

// const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// export default function ConversationDetailPage({ params }: { params: { id: string } }) {
//   const [conv, setConv] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     fetch(`${BASE}/conversations/${params.id}`)
//       .then(r => r.json())
//       .then(setConv)
//       .finally(() => setLoading(false));
//   }, [params.id]);

//   const updateStatus = async (status: string) => {
//     await fetch(`${BASE}/conversations/${params.id}/status?status=${status}`, { method: 'PATCH' });
//     setConv((prev: any) => ({ ...prev, status }));
//   };

//   if (loading) return <div style={{ padding: '40px', color: 'var(--text2)' }}>Loading...</div>;
//   if (!conv) return <div style={{ padding: '40px', color: 'var(--red)' }}>Not found</div>;

//   const statusColor: Record<string, string> = {
//     active: 'var(--green)', escalated: 'var(--red)', resolved: 'var(--blue)',
//   };

//   return (
//     <div>
//       <button onClick={() => router.back()} style={{
//         background: 'none', border: 'none', color: 'var(--text2)',
//         cursor: 'pointer', fontSize: '13px', marginBottom: '24px',
//         fontFamily: 'Syne, sans-serif',
//       }}>← Back</button>

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
//         <div>
//           <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>CONVERSATION</div>
//           <h1 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{conv.id}</h1>
//         </div>
//         {/* Status buttons */}
//         <div style={{ display: 'flex', gap: '8px' }}>
//           {['active', 'resolved', 'escalated'].map((s) => (
//             <button key={s} onClick={() => updateStatus(s)} style={{
//               padding: '8px 16px', borderRadius: '6px', border: '1px solid',
//               borderColor: conv.status === s ? statusColor[s] : 'var(--border)',
//               background: conv.status === s ? `${statusColor[s]}22` : 'transparent',
//               color: conv.status === s ? statusColor[s] : 'var(--text2)',
//               fontSize: '12px', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
//               textTransform: 'capitalize',
//             }}>
//               {s}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Meta cards */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
//         {[
//           { label: 'Channel', value: conv.channel },
//           { label: 'Status', value: conv.status },
//           { label: 'Messages', value: conv.messages?.length || 0 },
//           { label: 'Created', value: new Date(conv.created_at).toLocaleDateString() },
//         ].map(({ label, value }) => (
//           <div key={label} style={{
//             background: 'var(--bg2)', border: '1px solid var(--border)',
//             borderRadius: '8px', padding: '16px',
//           }}>
//             <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>
//               {label.toUpperCase()}
//             </div>
//             <div style={{ fontSize: '15px', fontWeight: 600, textTransform: 'capitalize' }}>{value}</div>
//           </div>
//         ))}
//       </div>

//       {/* Chat messages */}
//       <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
//         <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '24px' }}>
//           MESSAGES ({conv.messages?.length || 0})
//         </div>
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto' }}>
//           {conv.messages?.length === 0 && (
//             <div style={{ color: 'var(--text2)', textAlign: 'center', padding: '40px' }}>No messages</div>
//           )}
//           {conv.messages?.map((msg: any) => (
//             <div key={msg.id} style={{
//               display: 'flex',
//               justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
//             }}>
//               <div style={{
//                 maxWidth: '70%', padding: '12px 16px',
//                 borderRadius: msg.role === 'user' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
//                 background: msg.role === 'user' ? 'var(--bg3)' : 'rgba(124,111,255,0.15)',
//                 border: '1px solid',
//                 borderColor: msg.role === 'user' ? 'var(--border)' : 'rgba(124,111,255,0.3)',
//               }}>
//                 <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>
//                   {msg.role === 'user' ? '👤 CLIENT' : '🤖 AGENT'}
//                 </div>
//                 <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
//                   {msg.content}
//                 </div>
//                 <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
//                   {new Date(msg.created_at).toLocaleTimeString()}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const statusColor: Record<string, string> = {
  active: 'var(--green)',
  escalated: 'var(--red)',
  resolved: 'var(--blue)',
};
const channelColor: Record<string, string> = {
  whatsapp: '#25D366',
  slack: 'var(--accent)',
  email: 'var(--amber)',
  api: 'var(--text2)',
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [clients, setClients] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [convs, clientList] = await Promise.all([
        api.getConversations({ status: statusFilter || undefined, channel: channelFilter || undefined }),
        api.getClients(),
      ]);
      setConversations(convs);
      const map: Record<string, any> = {};
      clientList.forEach((c: any) => { map[c.id] = c; });
      setClients(map);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, channelFilter]);

  useEffect(() => { load(); }, [load]);

  // Auto refresh every 30s
  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const filtered = conversations.filter(conv => {
    if (!search) return true;
    const client = clients[conv.client_id];
    const name = client?.name?.toLowerCase() || '';
    const phone = client?.phone?.toLowerCase() || '';
    return name.includes(search.toLowerCase()) || phone.includes(search.toLowerCase());
  });

  const getLastMessage = (conv: any) => {
    if (!conv.messages?.length) return 'No messages';
    const last = conv.messages[conv.messages.length - 1];
    return last.content.length > 60 ? last.content.slice(0, 60) + '...' : last.content;
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>CONVERSATIONS</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>All Conversations</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Auto-refresh 30s</span>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {/* Search */}
        <input
          placeholder="Search by client name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px',
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '10px 16px',
            color: 'var(--text)', fontSize: '13px',
            fontFamily: 'Syne, sans-serif', outline: 'none',
          }}
        />

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['', 'active', 'escalated', 'resolved'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '8px 14px', borderRadius: '6px', border: '1px solid',
              borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
              background: statusFilter === s ? 'rgba(124,111,255,0.15)' : 'transparent',
              color: statusFilter === s ? 'var(--accent)' : 'var(--text2)',
              fontSize: '12px', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
            }}>{s || 'All Status'}</button>
          ))}
        </div>

        {/* Channel filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['', 'whatsapp', 'slack'].map(c => (
            <button key={c} onClick={() => setChannelFilter(c)} style={{
              padding: '8px 14px', borderRadius: '6px', border: '1px solid',
              borderColor: channelFilter === c ? channelColor[c] || 'var(--accent)' : 'var(--border)',
              background: channelFilter === c ? `${channelColor[c] || 'var(--accent)'}22` : 'transparent',
              color: channelFilter === c ? channelColor[c] || 'var(--accent)' : 'var(--text2)',
              fontSize: '12px', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
            }}>{c || 'All Channels'}</button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '16px' }}>
        Showing {filtered.length} conversation{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '180px 1fr 110px 110px 140px 90px',
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)',
        }}>
          <span>CLIENT</span>
          <span>LAST MESSAGE</span>
          <span>CHANNEL</span>
          <span>STATUS</span>
          <span>DATE</span>
          <span>ACTION</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>No conversations found</div>
        ) : filtered.map((conv, i) => {
          const client = clients[conv.client_id];
          const clientName = client?.name && client.name !== 'Client' ? client.name : client?.phone || client?.slack_user_id || 'Unknown';
          return (
            <div key={conv.id} style={{
              display: 'grid', gridTemplateColumns: '180px 1fr 110px 110px 140px 90px',
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Client */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                  {clientName}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {conv.id.slice(0, 10)}...
                </div>
              </div>

              {/* Last message */}
              <div style={{ fontSize: '12px', color: 'var(--text2)', paddingRight: '16px' }}>
                {getLastMessage(conv)}
              </div>

              {/* Channel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: channelColor[conv.channel] || 'var(--text2)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text2)', textTransform: 'capitalize' }}>{conv.channel}</span>
              </div>

              {/* Status */}
              <span style={{
                fontSize: '11px', padding: '3px 10px', borderRadius: '4px', width: 'fit-content',
                background: `${statusColor[conv.status] || 'var(--text2)'}22`,
                color: statusColor[conv.status] || 'var(--text2)',
              }}>{conv.status}</span>

              {/* Date */}
              <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
                {new Date(conv.created_at).toLocaleDateString()} {new Date(conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {/* Action */}
              <Link href={`/conversations/${conv.id}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontSize: '12px', color: 'var(--accent)', cursor: 'pointer',
                  padding: '4px 12px', border: '1px solid var(--accent)',
                  borderRadius: '4px',
                }}>View →</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
