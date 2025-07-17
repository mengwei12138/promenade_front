import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const formatDate = (d) => {
    if (!d) return '';
    try {
        const date = typeof d === 'string' ? new Date(d) : d;
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

function groupTasksByDate(tasks) {
    const map = {};
    tasks.forEach(task => {
        const end = formatDate(task.end_time || task.endTime || task.end_date || task.endDate);
        if (end) {
            if (!map[end]) map[end] = [];
            map[end].push(task.name);
        }
    });
    return map;
}

const CalendarModal = ({ visible, onClose, tasks }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    if (!visible) return null;
    const tasksByDate = groupTasksByDate(tasks || []);
    const handleTileClick = (date) => {
        const key = formatDate(date);
        if (tasksByDate[key] && tasksByDate[key].length > 0) {
            setSelectedDate(key);
        }
    };
    return (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <div className="modal calendar-modal-responsive" style={{ minWidth: 900, minHeight: '90vh', position: 'relative', padding: 32, maxWidth: '98vw', maxHeight: '98vh', width: 900 }}>
                <h2 style={{ marginBottom: 16, textAlign: 'center' }}>任务完成日历</h2>
                <button className="btn calendar-close-btn" style={{ position: 'absolute', right: 32, top: 32, zIndex: 2, width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', fontSize: 28, color: '#666', cursor: 'pointer', transition: 'background 0.2s, color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }} onClick={onClose}>×</button>
                <div style={{ overflow: 'auto', maxHeight: '75vh' }}>
                    <Calendar
                        onClickDay={handleTileClick}
                        // calendarType="chinese" // 移除不支持的类型
                        tileContent={({ date, view }) => {
                            if (view !== 'month') return null;
                            const key = formatDate(date);
                            const taskNames = tasksByDate[key];
                            if (taskNames && taskNames.length > 0) {
                                return (
                                    <ul style={{
                                        listStyle: 'none',
                                        padding: 0,
                                        margin: 0,
                                        fontSize: 15,
                                        color: '#1976d2',
                                        fontWeight: 500,
                                        lineHeight: 1.4,
                                        maxHeight: 60,
                                        overflow: 'auto',
                                        wordBreak: 'break-all',
                                        textAlign: 'center', // 居中
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%'
                                    }}>
                                        {taskNames.map((name, idx) => (
                                            <li key={idx} style={{ whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</li>
                                        ))}
                                    </ul>
                                );
                            }
                            return null;
                        }}
                        tileClassName={({ date, view }) => {
                            // 美化格子高度
                            if (view === 'month') {
                                const day = date.getDay();
                                if (day === 0 || day === 6) return 'calendar-large-cell calendar-weekend';
                                return 'calendar-large-cell';
                            }
                            return '';
                        }}
                    />
                </div>
                {selectedDate && (
                    <div style={{
                        position: 'fixed',
                        left: 0, right: 0, top: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.18)',
                        zIndex: 2000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} onClick={() => setSelectedDate(null)}>
                        <div style={{ background: '#fff', borderRadius: 16, minWidth: 320, maxWidth: 480, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ textAlign: 'center', marginBottom: 16 }}>{selectedDate} 的任务</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 18, color: '#1976d2', fontWeight: 500, textAlign: 'center' }}>
                                {tasksByDate[selectedDate].map((name, idx) => (
                                    <li key={idx} style={{ marginBottom: 12, wordBreak: 'break-all' }}>{name}</li>
                                ))}
                            </ul>
                            <button className="calendar-detail-close-btn" style={{ position: 'absolute', right: 18, top: 18, width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: 'none', fontSize: 22, color: '#666', cursor: 'pointer', transition: 'background 0.2s, color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }} onClick={() => setSelectedDate(null)}>×</button>
                        </div>
                    </div>
                )}
                <style>{`
                    .calendar-modal-responsive {
                        min-width: 320px !important;
                        min-height: 320px !important;
                        max-width: 98vw !important;
                        max-height: 98vh !important;
                        width: 900px;
                        height: auto;
                        box-sizing: border-box;
                        overflow: auto;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-start;
                    }
                    @media (max-width: 1000px) {
                        .calendar-modal-responsive {
                            width: 99vw !important;
                            min-width: 0 !important;
                            padding: 4vw 1vw 2vw 1vw !important;
                        }
                        .react-calendar {
                            font-size: 15px !important;
                        }
                    }
                    .react-calendar {
                        width: 100% !important;
                        max-width: 100%;
                        font-size: 18px;
                        border-radius: 12px;
                        border: 1.5px solid #e0e0e0;
                        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                        padding: 16px 8px 24px 8px;
                    }
                    .react-calendar__navigation {
                        margin-bottom: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .react-calendar__navigation__label {
                        color: #222 !important;
                        font-size: 22px !important;
                        font-weight: bold !important;
                        background: none !important;
                        border: none !important;
                        padding: 4px 18px !important;
                        border-radius: 8px;
                    }
                    .react-calendar__navigation__arrow {
                        color: #1976d2 !important;
                        font-size: 22px !important;
                        font-weight: bold !important;
                        background: none !important;
                        border: none !important;
                        padding: 4px 12px !important;
                        border-radius: 8px;
                        transition: background 0.2s;
                    }
                    .react-calendar__navigation__arrow:hover, .react-calendar__navigation__label:hover {
                        background: #f5f5f5 !important;
                    }
                    .react-calendar__month-view__weekdays__weekday {
                        color: #222;
                        font-weight: bold;
                        font-size: 17px;
                        background: none;
                        border: none;
                    }
                    .react-calendar__tile {
                        min-height: 70px;
                        height: 70px;
                        vertical-align: top;
                        background: #fff;
                        color: #222;
                        font-size: 17px;
                        border-radius: 8px;
                        padding: 4px 2px 2px 6px;
                    }
                    .calendar-large-cell {
                        min-height: 70px !important;
                        height: 70px !important;
                    }
                    .calendar-weekend {
                        background: #fff5f5 !important;
                        color: #e53935 !important;
                    }
                    .calendar-weekend .react-calendar__tile {
                        color: #e53935 !important;
                    }
                    .react-calendar__tile--active {
                        background: #e3f2fd !important;
                        color: #1976d2 !important;
                    }
                    .react-calendar__tile--now {
                        background: #fffde7 !important;
                        color: #fbc02d !important;
                    }
                    .react-calendar__tile--hasActive {
                        background: #e3f2fd !important;
                    }
                    .calendar-close-btn {
                        font-size: 28px !important;
                        background: transparent !important;
                        color: #666 !important;
                        border-radius: 50% !important;
                        width: 40px; height: 40px;
                        border: none;
                        transition: background 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    }
                    .calendar-close-btn:hover, .calendar-detail-close-btn:hover {
                        background: #f0f0f0 !important;
                        color: #222 !important;
                    }
                    .calendar-detail-close-btn {
                        font-size: 26px !important;
                        background: transparent !important;
                        color: #666 !important;
                        border-radius: 50% !important;
                        width: 36px; height: 36px;
                        border: none;
                        transition: background 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default CalendarModal; 