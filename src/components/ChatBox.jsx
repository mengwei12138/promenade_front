import React, { useState, useEffect, useRef } from 'react';
import '../style.css';

const ChatBox = ({ history, onSend, presetQuestions = [], onClearHistory }) => {
    const [input, setInput] = useState('');
    const chatHistoryRef = useRef(null);

    const handleSend = () => {
        if (input.trim()) {
            onSend(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    // 自动滚动到底部
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [history]);

    return (
        <div className="footer-chatbox">
            {presetQuestions.length > 0 && (
                <div className="preset-questions">
                    {presetQuestions.map(q => (
                        <button key={q} className="btn btn-secondary" style={{ marginRight: 8, marginBottom: 8 }} onClick={() => setInput(q)}>{q}</button>
                    ))}
                    {onClearHistory && (
                        <button className="btn btn-danger" style={{ marginLeft: 16 }} onClick={onClearHistory}>清空聊天记录</button>
                    )}
                </div>
            )}
            <div id="chat-history" ref={chatHistoryRef}>
                {history.map((msg, idx) => (
                    <div
                        key={idx}
                        className={msg.sender === 'user' ? 'user-msg' : 'assistant-msg'}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="footer-input-row">
                <input
                    type="text"
                    id="chat-input"
                    placeholder="请输入指令..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button id="send-button" className="btn btn-primary" onClick={handleSend}>发送</button>
            </div>
        </div>
    );
};

export default ChatBox; 