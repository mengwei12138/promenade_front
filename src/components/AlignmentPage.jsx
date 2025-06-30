import React, { useEffect, useState } from 'react';

const DEFAULT_LINK = 'https://alidocs.dingtalk.com/i/nodes/nYMoO1rWxaKRYr4MSKq0Oje6V47Z3je9?utm_scene=person_space';
const API_BASE = '/api';

export default function AlignmentPage({ isManager, requireManager }) {
    const [link, setLink] = useState(() => localStorage.getItem('alignment_link') || DEFAULT_LINK);
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState(link);
    const [error, setError] = useState('');

    useEffect(() => {
        setInput(link);
    }, [link]);

    const handleEdit = () => {
        requireManager(() => setEditing(true));
    };

    const handleSave = async () => {
        if (!input.startsWith('http')) {
            setError('请输入有效的链接');
            return;
        }
        setLink(input);
        localStorage.setItem('alignment_link', input);
        setEditing(false);
        setError('');
    };

    const handleVisitorClick = () => {
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    return (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
            <h2>任务对齐</h2>
            {isManager ? (
                <>
                    <div style={{ margin: '24px 0' }}>
                        <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 18, color: '#1677ff', wordBreak: 'break-all' }}>{link}</a>
                    </div>
                    {editing ? (
                        <div>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                style={{ width: '80%', padding: 8, fontSize: 16 }}
                            />
                            <button className="btn btn-green" style={{ marginLeft: 12 }} onClick={handleSave}>保存</button>
                            <button className="btn" style={{ marginLeft: 8 }} onClick={() => setEditing(false)}>取消</button>
                            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
                        </div>
                    ) : (
                        <button className="btn btn-primary" onClick={handleEdit}>修改链接</button>
                    )}
                </>
            ) : (
                <button className="btn btn-primary" style={{ marginTop: 32, fontSize: 18 }} onClick={handleVisitorClick}>前往任务对齐</button>
            )}
        </div>
    );
} 