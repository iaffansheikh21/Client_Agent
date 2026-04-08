'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const LISTS = ['ToDo', 'In Progress', 'In Review', 'Done'];

const listColor: Record<string, string> = {
  'ToDo': 'var(--text2)',
  'In Progress': 'var(--amber)',
  'In Review': 'var(--accent)',
  'Done': 'var(--green)',
};

const typeIcon: Record<string, string> = {
  'Bug': '🐛',
  'Feature': '✨',
  'Support': '🛠',
  'Question': '❓',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.getTasks().then(setTasks).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (cardId: string, listName: string) => {
    setUpdating(cardId);
    try {
      await api.updateTaskStatus(cardId, listName);
      setTasks(prev => prev.map(t => t.id === cardId ? { ...t, list_name: listName } : t));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter ? tasks.filter(t => t.list_name === filter) : tasks;

  const getTaskType = (name: string) => {
    if (name.includes('Bug')) return 'Bug';
    if (name.includes('Feature')) return 'Feature';
    if (name.includes('Support')) return 'Support';
    if (name.includes('Question')) return 'Question';
    return 'Task';
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>TASKS</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Trello Tasks</h1>
          <a href="https://trello.com" target="_blank" rel="noreferrer" style={{
            padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)',
            color: 'var(--text2)', fontSize: '12px', textDecoration: 'none',
          }}>Open Trello ↗</a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {LISTS.map(list => {
          const count = tasks.filter(t => t.list_name === list).length;
          return (
            <div key={list} onClick={() => setFilter(filter === list ? '' : list)} style={{
              background: 'var(--bg2)', border: '1px solid',
              borderColor: filter === list ? listColor[list] : 'var(--border)',
              borderRadius: '10px', padding: '16px', cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: listColor[list], fontFamily: 'JetBrains Mono, monospace', marginBottom: '6px' }}>
                {loading ? '—' : count}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{list}</div>
            </div>
          );
        })}
      </div>

      {/* Tasks list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)',
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            No tasks found
          </div>
        ) : filtered.map(task => {
          const taskType = getTaskType(task.name);
          return (
            <div key={task.id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
            }}>
              {/* Left: task info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px' }}>{typeIcon[taskType] || '📋'}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                    {task.name.replace(/^[🐛✨🛠❓]\s\|\s/, '')}
                  </span>
                </div>
                {task.desc && (
                  <div style={{ fontSize: '12px', color: 'var(--text2)', marginLeft: '26px', lineHeight: '1.5' }}>
                    {task.desc.split('\n')[0].replace('## Client Request', '').trim().slice(0, 100)}
                    {task.desc.length > 100 ? '...' : ''}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', marginLeft: '26px' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                    background: `${listColor[task.list_name]}22`,
                    color: listColor[task.list_name],
                  }}>{task.list_name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {new Date(task.dateLastActivity).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Right: status buttons */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {LISTS.map(list => (
                  <button key={list} onClick={() => updateStatus(task.id, list)}
                    disabled={task.list_name === list || updating === task.id}
                    style={{
                      padding: '6px 12px', borderRadius: '6px', border: '1px solid',
                      borderColor: task.list_name === list ? listColor[list] : 'var(--border)',
                      background: task.list_name === list ? `${listColor[list]}22` : 'transparent',
                      color: task.list_name === list ? listColor[list] : 'var(--text2)',
                      fontSize: '11px', cursor: task.list_name === list ? 'default' : 'pointer',
                      fontFamily: 'Syne, sans-serif', opacity: updating === task.id ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}>
                    {list === task.list_name && updating === task.id ? '...' : list}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
