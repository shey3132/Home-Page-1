import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { type Shortcut, type TodoItem, type Holiday } from '../types';
import { Card, MainButton, Input } from './Shared';
import { PRESET_BACKGROUNDS } from '../constants';

// Tools Panel Components
const Calculator = () => {
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState('');
    const [history, setHistory] = useLocalStorage<string[]>('dashboard_calc_history_v1', []);
    
    const calculate = () => {
        if (!expression) { setResult(''); return; }
        if (!/^[0-9+\-*/().%\s]+$/.test(expression)) { setResult('ביטוי לא חוקי'); return; }
        try {
            const sanitized = expression.replace(/%/g, '/100');
            const val = Function('"use strict"; return (' + sanitized + ')')();
            setResult('תוצאה: ' + val);
            const newEntry = `${expression} = ${val}`;
            setHistory(prev => [newEntry, ...prev].slice(0, 50));
        } catch (e) {
            setResult('שגיאה בחישוב');
        }
    };

    return (
        <>
            <h3 className="text-xl font-bold mb-2 text-right">מחשבון מהיר</h3>
            <Card>
                <Input value={expression} onChange={e => setExpression(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && calculate()} placeholder="הקלד ביטוי (למשל 12+5*3)" />
                <div className="flex gap-2 mt-2">
                    <MainButton onClick={calculate}>חשב</MainButton>
                    <MainButton onClick={() => { setExpression(''); setResult(''); }} className="bg-gray-600 hover:bg-gray-700">נקה</MainButton>
                </div>
                <div className="text-gray-600 mt-2 text-right min-h-[1.5rem]">{result}</div>
                {history.length > 0 && (
                    <div className="mt-4 text-right">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-bold text-gray-700">היסטוריה</h4>
                            <button
                                onClick={() => {
                                    if (window.confirm('האם לנקות את היסטוריית החישובים?')) {
                                        setHistory([]);
                                    }
                                }}
                                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-1 rounded"
                            >
                                נקה היסטוריה
                            </button>
                        </div>
                        <ul className="max-h-32 overflow-y-auto border border-black/10 rounded-lg p-2 bg-gray-50/50 space-y-1 text-sm text-gray-700">
                            {history.map((item, index) => (
                                <li
                                    key={index}
                                    onClick={() => setExpression(item.split(' = ')[0])}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpression(item.split(' = ')[0])}}
                                    className="cursor-pointer hover:bg-gray-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    title="לחץ כדי להשתמש שוב בביטוי זה"
                                    role="button"
                                    tabIndex={0}
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Card>
        </>
    );
};

const Timer = () => {
    const [elapsed, setElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
    const [minutes, setMinutes] = useState('');
    const intervalRef = React.useRef<number | null>(null);

    const formatHMS = (s: number) => {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':');
    };

    useEffect(() => {
        if (isRunning) {
            const startTime = Date.now() - (timerMode === 'stopwatch' ? elapsed * 1000 : 0);
            const targetTime = Date.now() + elapsed * 1000;
            
            intervalRef.current = window.setInterval(() => {
                if (timerMode === 'stopwatch') {
                    setElapsed(Math.floor((Date.now() - startTime) / 1000));
                } else {
                    const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
                    setElapsed(remaining);
                    if (remaining <= 0) {
                        setIsRunning(false);
                        alert('הטיימר הושלם!');
                        setElapsed(0);
                    }
                }
            }, 250);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timerMode, elapsed]);

    const handleStart = () => { setTimerMode('stopwatch'); setIsRunning(true); };
    const handlePause = () => setIsRunning(false);
    const handleReset = () => { setIsRunning(false); setElapsed(0); };
    const handleStartCountdown = () => {
        const mins = parseInt(minutes, 10);
        if (isNaN(mins) || mins <= 0) { alert('הזן דקות לטיימר'); return; }
        setTimerMode('countdown');
        setElapsed(mins * 60);
        setIsRunning(true);
    };

    return (
        <>
            <h3 className="text-xl font-bold mt-3 mb-2 text-right">סטופר / טיימר</h3>
            <Card>
                <div className="font-bold text-3xl text-center font-mono tracking-wider">{formatHMS(elapsed)}</div>
                <div className="flex gap-2 flex-wrap mt-2 justify-center">
                    <MainButton onClick={handleStart}>התחל</MainButton>
                    <MainButton onClick={handlePause} className="bg-yellow-500 hover:bg-yellow-600">השהה</MainButton>
                    <MainButton onClick={handleReset} className="bg-red-600 hover:bg-red-700">אפס</MainButton>
                    <Input type="number" min="0" value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="דקות (טיימר)" className="w-32"/>
                    <MainButton onClick={handleStartCountdown} className="bg-teal-600 hover:bg-teal-700">התחל טיימר</MainButton>
                </div>
            </Card>
        </>
    );
};

export const ToolsPanel: React.FC = () => {
    const [textToTranslate, setTextToTranslate] = useState('');
    const [lang, setLang] = useState('he');

    const handleTranslate = () => {
        if(!textToTranslate.trim()) return alert('הכנס טקסט');
        const url = `https://translate.google.com/?sl=auto&tl=${encodeURIComponent(lang)}&text=${encodeURIComponent(textToTranslate)}&op=translate`;
        window.open(url, '_blank');
    };
    
    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-[260px]">
                <Calculator />
                <Timer />
            </div>
            <div className="flex-1 min-w-[260px]">
                <h3 className="text-xl font-bold mb-2 text-right">תרגום מהיר</h3>
                <Card>
                    <textarea value={textToTranslate} onChange={e => setTextToTranslate(e.target.value)} rows={4} placeholder="הכנס טקסט לתרגום..." className="w-full p-2.5 rounded-xl border border-black/10 bg-white/70 text-base placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm focus:shadow-md"></textarea>
                    <div className="flex gap-2 mt-2">
                        <select value={lang} onChange={e => setLang(e.target.value)} className="p-2.5 rounded-xl border border-black/10 bg-white/70 text-base">
                            <option value="he">עברית</option>
                            <option value="en">אנגלית</option>
                            <option value="es">ספרדית</option>
                            <option value="fr">צרפתית</option>
                        </select>
                        <MainButton onClick={handleTranslate}>תרגם (Google)</MainButton>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// Personal Panel Components
const Notes = () => {
    const [notes, setNotes] = useLocalStorage('dashboard_notes_v3', '');
    const [tempNotes, setTempNotes] = useState(notes);
    useEffect(() => setTempNotes(notes), [notes]);
    
    return (
        <>
            <h3 className="text-xl font-bold mb-2 text-right">פתקים אישיים</h3>
            <Card className="text-right">
                <textarea value={tempNotes} onChange={e => setTempNotes(e.target.value)} rows={8} placeholder="הערות — נשמרות בדפדפן" className="w-full p-2.5 rounded-xl border border-black/10 bg-white/70 text-base placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm focus:shadow-md"></textarea>
                <div className="flex gap-2 mt-2">
                    <MainButton onClick={() => { setNotes(tempNotes); alert('פתק נשמר'); }}>שמור</MainButton>
                    <MainButton onClick={() => { if(window.confirm('למחוק?')) setTempNotes(''); }} className="bg-gray-500 hover:bg-gray-600">נקה</MainButton>
                </div>
            </Card>
        </>
    );
};

const TodoList = () => {
    const [todos, setTodos] = useLocalStorage<TodoItem[]>('dashboard_todo_v3', []);
    const [newTodo, setNewTodo] = useState('');
    
    const addTodo = () => {
        if(!newTodo.trim()) return;
        setTodos(prev => [...prev, {txt: newTodo.trim(), done: false}]);
        setNewTodo('');
    };

    const toggleTodo = (index: number) => {
        setTodos(prev => prev.map((todo, i) => i === index ? { ...todo, done: !todo.done } : todo));
    };

    const deleteTodo = (index: number) => {
        setTodos(prev => prev.filter((_, i) => i !== index));
    };
    
    return (
        <>
            <h3 className="text-xl font-bold mt-3 mb-2 text-right">רשימת משימות</h3>
            <Card className="text-right">
                <div className="flex gap-2 mb-3">
                    <Input value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="הוסף משימה..." />
                    <MainButton onClick={addTodo}>הוסף</MainButton>
                </div>
                <ul className="list-none p-0 m-0 max-h-60 overflow-y-auto">
                    {todos.map((todo, i) => (
                        <li key={i} className="flex gap-3 items-center p-2.5 border-b border-dashed border-black/10">
                            <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(i)} className="w-5 h-5 accent-blue-600 cursor-pointer" />
                            <span className={`flex-grow ${todo.done ? 'line-through text-gray-400' : ''}`}>{todo.txt}</span>
                            <button onClick={() => deleteTodo(i)} className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors">✖</button>
                        </li>
                    ))}
                </ul>
                {todos.length > 0 && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-black/10">
                        <MainButton onClick={() => setTodos(p => p.filter(t => !t.done))} className="bg-gray-600 hover:bg-gray-700 text-sm">נקה מסומנות</MainButton>
                        <MainButton onClick={() => { if(window.confirm('למחוק הכל?')) setTodos([]); }} className="bg-red-600 hover:bg-red-700 text-sm">נקה הכל</MainButton>
                    </div>
                )}
            </Card>
        </>
    );
};

const AdvancedShortcuts = () => {
    const [shortcuts, setShortcuts] = useLocalStorage<Shortcut[]>('dashboard_shortcuts_v3', []);
    
    const deleteShortcut = (index: number) => {
        setShortcuts(prev => prev.filter((_, i) => i !== index));
    };
    
    return (
        <>
            <h3 className="text-xl font-bold mb-2 text-right">ניהול קישורים</h3>
            <Card className="text-right">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {shortcuts.map((s, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{s.title}</a>
                            <button onClick={() => deleteShortcut(i)} className="bg-red-500 text-white rounded px-2 py-1 text-sm hover:bg-red-600 transition-colors">מחק</button>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
};

export const PersonalPanel: React.FC = () => (
    <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-[260px]">
            <Notes />
            <TodoList />
        </div>
        <div className="flex-1 min-w-[260px]">
            <AdvancedShortcuts />
        </div>
    </div>
);

// Design Panel Components
export const DesignPanel: React.FC<{ setFont: (font: string) => void; setBackground: (bg: string) => void; }> = ({ setFont, setBackground }) => {
    const [holidays, setHolidays] = useLocalStorage<Holiday[]>('dashboard_holidays_v1', []);
    const [newHolidayDate, setNewHolidayDate] = useState('');
    const [newHolidayTitle, setNewHolidayTitle] = useState('');

    const addHoliday = () => {
        if (!newHolidayDate || !newHolidayTitle.trim()) return alert('בחר תאריך ושם');
        setHolidays(prev => [...prev, { date: newHolidayDate, title: newHolidayTitle.trim() }]);
        setNewHolidayDate('');
        setNewHolidayTitle('');
    };

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result as string;
            setBackground(data);
            alert('רקע הוחלף');
        };
        reader.readAsDataURL(file);
    };

    const handleRandomBg = () => {
        const randomBg = PRESET_BACKGROUNDS[Math.floor(Math.random() * PRESET_BACKGROUNDS.length)];
        setBackground(randomBg);
    };
    
    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-[260px]">
                <h3 className="text-xl font-bold mb-2 text-right">שינוי פונט</h3>
                <Card>
                    <select onChange={e => setFont(e.target.value)} className="w-full p-2.5 rounded-xl border border-black/10 bg-white/70 text-base">
                        <option value="'Assistant', Arial, sans-serif">Assistant (ברירת מחדל)</option>
                        <option value="'Varela Round', Arial, sans-serif">Varela Round</option>
                        <option value="'Rubik', sans-serif">Rubik</option>
                        <option value="'Heebo', sans-serif">Heebo</option>
                        <option value="'Frank Ruhl Libre', serif">Frank Ruhl Libre</option>
                        <option value="'Courier New', monospace">Monospace</option>
                    </select>
                </Card>
                <h3 className="text-xl font-bold mt-3 mb-2 text-right">תאריכים חשובים</h3>
                <Card className="text-right">
                    <div className="flex gap-2">
                        <Input type="date" value={newHolidayDate} onChange={e => setNewHolidayDate(e.target.value)} />
                        <Input placeholder="שם האירוע" value={newHolidayTitle} onChange={e => setNewHolidayTitle(e.target.value)} />
                    </div>
                    <MainButton onClick={addHoliday} className="mt-2">הוסף</MainButton>
                    <ul className="mt-2 text-right space-y-1">
                        {holidays.map((h, i) => <li key={i}>{`${h.date} — ${h.title}`}</li>)}
                    </ul>
                </Card>
            </div>
            <div className="flex-1 min-w-[260px]">
                <h3 className="text-xl font-bold mb-2 text-right">ניהול רקע</h3>
                <Card>
                    <div className="flex gap-2 flex-wrap">
                        <label className="bg-white/80 p-2.5 rounded-xl cursor-pointer border border-black/10 hover:bg-white transition-colors font-semibold">העלה רקע<input type="file" accept="image/*" className="hidden" onChange={handleBgUpload}/></label>
                        <MainButton onClick={() => setBackground(PRESET_BACKGROUNDS[0])} className="bg-yellow-500 hover:bg-yellow-600">אפס רקע</MainButton>
                        <MainButton onClick={handleRandomBg} className="bg-green-600 hover:bg-green-700">רקע אקראי</MainButton>
                    </div>
                    <hr className="my-3" />
                    <div className="flex gap-2 flex-wrap">
                        {PRESET_BACKGROUNDS.slice(1).map((bg, i) => (
                           <div key={i} onClick={() => setBackground(bg)} className="w-20 h-14 rounded-lg cursor-pointer border-2 border-white/50 bg-cover bg-center shadow-md transition-transform hover:scale-105" style={{backgroundImage: bg.startsWith('linear') ? bg : `url(${bg})` }}></div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};


// Map Panel
export const MapPanel: React.FC = () => {
    const [mapQuery, setMapQuery] = useState('Tel Aviv, Israel');
    const [iframeSrc, setIframeSrc] = useState('https://www.google.com/maps?q=Tel+Aviv,Israel&output=embed');

    const handleMapSearch = () => {
        setIframeSrc(`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`);
    };

    return (
        <Card>
            <div className="flex justify-center gap-2 mb-2.5">
                <Input value={mapQuery} onChange={e => setMapQuery(e.target.value)} placeholder="חפש מיקום במפה..." className="max-w-xl"/>
                <MainButton onClick={handleMapSearch}>חפש במפה</MainButton>
            </div>
            <div className="w-full h-[520px] rounded-lg overflow-hidden border border-black/10 shadow-inner">
                <iframe src={iframeSrc} className="w-full h-full border-0" allowFullScreen loading="lazy"></iframe>
            </div>
        </Card>
    );
};

// IFrame Panel Base Component
const IFrameCard: React.FC<{title: string, siteUrl: string, iframeId: string}> = ({title, siteUrl, iframeId}) => {
    const refreshIframe = () => {
        const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
        if (iframe) iframe.src = iframe.src;
    };
    return (
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white/70 backdrop-blur-xl border border-white/20">
            <header className="flex justify-between items-center bg-blue-600 text-white p-2.5 px-3.5">
                <h3 className="m-0 text-lg">{title}</h3>
                <div className="flex gap-1.5">
                    <button onClick={refreshIframe} className="bg-white text-blue-600 border-none px-2.5 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-gray-200">רענן</button>
                    <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 border-none px-2.5 py-1.5 rounded-lg font-bold no-underline">פתח</a>
                </div>
            </header>
            <iframe id={iframeId} src={siteUrl} className="w-full h-[720px] border-0" loading="lazy" referrerPolicy="no-referrer"></iframe>
        </div>
    );
}

// News and Music Panels
export const NewsPanel: React.FC = () => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-4">
        <IFrameCard title="הגיזרה" siteUrl="https://hagizra.news/" iframeId="news-hagizra" />
        <IFrameCard title="אמ'ס אונליין" siteUrl="https://www.emess.co.il/online?native" iframeId="news-emess" />
        <IFrameCard title="Kore M+" siteUrl="https://www.kore.co.il/mplus" iframeId="news-kore" />
    </div>
);

export const MusicPanel: React.FC = () => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-4">
        <IFrameCard title="KCM.fm" siteUrl="https://kcm.fm/" iframeId="music-kcm" />
        <IFrameCard title="KCM.fm Live" siteUrl="https://kcm.fm/Live/" iframeId="music-kcm-live" />
        <IFrameCard title="Kol-Play" siteUrl="https://kol-play.co.il/" iframeId="music-kolplay" />
        <IFrameCard title="HNGN" siteUrl="https://www.hngn.co.il/" iframeId="music-hngn" />
        <IFrameCard title="Toker.fm" siteUrl="https://www.toker.fm/" iframeId="music-toker" />
    </div>
);

// History Panel
export const HistoryPanel: React.FC = () => {
    const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('dashboard_search_history_v1', []);

    const handleSearch = (query: string) => {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    };

    const deleteHistoryItem = (itemToDelete: string) => {
        setSearchHistory(prev => prev.filter(item => item !== itemToDelete));
    };

    const clearAllHistory = () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את כל היסטוריית החיפושים?')) {
            setSearchHistory([]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-3 text-center">היסטוריית חיפושים</h3>
            <Card className="text-right p-6">
                {searchHistory.length > 0 ? (
                    <>
                        <div className="flex justify-end mb-4">
                            <MainButton onClick={clearAllHistory} className="bg-red-600 hover:bg-red-700">
                                נקה את כל ההיסטוריה
                            </MainButton>
                        </div>
                        <ul className="space-y-2 list-none p-0 m-0">
                            {searchHistory.map((item, index) => (
                                <li 
                                    key={index}
                                    className="flex justify-between items-center p-3 bg-white/60 rounded-lg shadow-sm flex-wrap gap-2"
                                >
                                    <span className="font-semibold text-gray-800 flex-grow break-all">{item}</span>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button 
                                            onClick={() => handleSearch(item)}
                                            className="py-1 px-3 rounded-md border-none bg-blue-500 text-white font-bold text-sm cursor-pointer hover:bg-blue-600 transition-colors"
                                            title={`חפש שוב: "${item}"`}
                                        >
                                            חפש שוב
                                        </button>
                                        <button
                                            onClick={() => deleteHistoryItem(item)}
                                            className="py-1 px-3 rounded-md border-none bg-red-500 text-white font-bold text-sm cursor-pointer hover:bg-red-600 transition-colors"
                                            title={`מחק מההיסטוריה: "${item}"`}
                                        >
                                            מחק
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="text-center text-gray-500 py-8">היסטוריית החיפושים שלך ריקה.</p>
                )}
            </Card>
        </div>
    );
};