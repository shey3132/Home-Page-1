import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { type Shortcut, type CalendarEvent } from '../types';
import { DEFAULT_SHORTCUTS } from '../constants';
import { Card, MainButton, Input } from './Shared';

// Helper: Get domain from URL for favicon
const getDomainFromUrl = (url: string) => {
    try {
        return new URL(url).hostname;
    } catch (e) {
        return url;
    }
};

const ShortcutGrid: React.FC = () => {
    const [shortcuts] = useLocalStorage<Shortcut[]>('dashboard_shortcuts_v3', []);

    const allShortcuts = [...DEFAULT_SHORTCUTS, ...shortcuts];

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
            {allShortcuts.map((s, idx) => (
                <Card key={`${s.url}-${idx}`} className="user-shortcut" onClick={() => window.location.href = s.url}>
                    <img
                        className="w-14 h-14 object-contain mb-2 rounded-xl bg-white p-1.5 shadow-md mx-auto"
                        src={`https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(getDomainFromUrl(s.url))}`}
                        alt={s.title}
                        onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"></svg>'; }}
                    />
                    <a href={s.url} onClick={(e) => e.preventDefault()} className="block font-bold text-gray-800 no-underline cursor-pointer break-words">
                        {s.title}
                    </a>
                </Card>
            ))}
        </div>
    );
};

const HebrewCalendar: React.FC = () => {
    const [viewAnchor, setViewAnchor] = useState(new Date());
    const [events, setEvents] = useLocalStorage<CalendarEvent[]>('dashboard_events_v1', []);
    const [newEventDate, setNewEventDate] = useState(new Date().toISOString().slice(0, 10));
    const [newEventTime, setNewEventTime] = useState('');
    const [newEventTitle, setNewEventTitle] = useState('');

    const hebrewDateUtils = React.useMemo(() => {
        let fmtWeekdayHeb: Intl.DateTimeFormat, fmtPartsLatn: Intl.DateTimeFormat;
        try {
            fmtWeekdayHeb = new Intl.DateTimeFormat('he-u-ca-hebrew', { weekday: 'long' });
            fmtPartsLatn = new Intl.DateTimeFormat('he-u-ca-hebrew-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
        } catch (err) {
            console.error('Hebrew calendar Intl not supported:', err);
            return null;
        }

        const hebrewYearGematria = (n: number) => {
            const y = n % 1000;
            const hundreds = [[400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק']] as const;
            const tens = [[90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י']] as const;
            const ones = [[9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']] as const;
            let rest = y, out = '';
            for (const [v, c] of hundreds) { while (rest >= v) { out += c; rest -= v; } }
            for (const [v, c] of tens) { while (rest >= v) { out += c; rest -= v; } }
            for (const [v, c] of ones) { while (rest >= v) { out += c; rest -= v; } }
            out = out.replace(/יה$/, 'ט"ו').replace(/יו$/, 'ט"ז');
            if (out.length >= 2) out = out.slice(0, -1) + '"' + out.slice(-1);
            return 'ה\'' + out;
        };
        const hebrewDayGematria = (num: number) => {
            const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט']; const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
            if (num === 15) return 'ט"ו'; if (num === 16) return 'ט"ז';
            const t = Math.floor(num / 10), o = num % 10; let s = '';
            if (t > 0) s += tens[t]; if (o > 0) s += ones[o];
            if (s.length >= 2) s = s.slice(0, -1) + '"' + s.slice(-1);
            return s || 'א';
        };
        const getHebParts = (d: Date) => {
            const parts = Object.fromEntries(fmtPartsLatn.formatToParts(d).map(p => [p.type, p.value]));
            return { day: Number(parts.day), monthName: parts.month, year: Number(parts.year), weekday: parts.weekday };
        };
        const findHebMonthStart = (base: Date) => {
            let d = new Date(base.getFullYear(), base.getMonth(), base.getDate()); let guard = 0;
            while (guard++ < 40) { const p = getHebParts(d); if (p.day === 1) return d; d.setDate(d.getDate() - 1); }
            return new Date(base.getFullYear(), base.getMonth(), base.getDate());
        };
        const buildHebMonthDays = (start: Date) => {
            const arr = []; let d = new Date(start); const m = getHebParts(start).monthName; let guard = 0;
            while (guard++ < 40) { arr.push(new Date(d)); d.setDate(d.getDate() + 1); const p = getHebParts(d); if (p.day === 1 && p.monthName !== m) break; }
            return arr;
        };
        const formatFullHebrew = (d: Date) => {
            const p = getHebParts(d);
            return `${fmtWeekdayHeb.format(d)}, ${hebrewDayGematria(p.day)} ב${p.monthName}, ${hebrewYearGematria(p.year)}`;
        };
        const monthLength = (base: Date) => buildHebMonthDays(findHebMonthStart(base)).length;
        const shiftHebMonth = (base: Date, delta: number) => {
            let d = new Date(base);
            for (let i = 0; i < Math.abs(delta); i++) {
                if (delta > 0) { const start = findHebMonthStart(d); d = new Date(start); d.setDate(start.getDate() + monthLength(d)); } else {
                    const start = findHebMonthStart(d); const prev = new Date(start); prev.setDate(start.getDate() - 1); d = findHebMonthStart(prev);
                }
            }
            return d;
        };
        const toISO = (d: Date) => d.toISOString().slice(0, 10);
        return { hebrewYearGematria, hebrewDayGematria, getHebParts, findHebMonthStart, buildHebMonthDays, formatFullHebrew, shiftHebMonth, toISO };
    }, []);

    if (!hebrewDateUtils) return <div>הלוח העברי לא נתמך בדפדפן זה.</div>;
    const { hebrewYearGematria, hebrewDayGematria, getHebParts, findHebMonthStart, buildHebMonthDays, formatFullHebrew, shiftHebMonth, toISO } = hebrewDateUtils;

    const start = findHebMonthStart(viewAnchor);
    const days = buildHebMonthDays(start);
    const ps = getHebParts(start);
    const headers = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
    const firstWeekday = start.getDay();
    const now = new Date();

    const addEventHandler = () => {
        if (!newEventDate || !newEventTitle.trim()) { alert('נא למלא תאריך וכותרת'); return; }
        setEvents(prev => [...prev, { date: newEventDate, title: newEventTitle.trim(), time: newEventTime }]);
        setNewEventTitle('');
    };
    
    const deleteEventHandler = (date: string, title: string) => {
        setEvents(prev => prev.filter(e => !(e.date === date && e.title === title)));
    };

    const clearAllEvents = () => {
        if (window.confirm('האם למחוק את כל האירועים?')) {
            setEvents([]);
        }
    }

    const startOfMonth = findHebMonthStart(viewAnchor);
    const monthDays = buildHebMonthDays(startOfMonth);
    const monthISO = monthDays.map(d => toISO(d));
    const currentMonthEvents = events
      .filter(e => monthISO.includes(e.date))
      .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));

    return (
        <Card className="max-w-md mx-auto text-center">
            <div className="flex items-center justify-center gap-2">
                <button onClick={() => setViewAnchor(shiftHebMonth(viewAnchor, -1))} className="min-w-[36px] h-9 rounded-lg border border-black/10 bg-white/50 cursor-pointer text-xl hover:bg-white/80 transition">‹</button>
                <div className="font-bold text-lg">{`${ps.monthName} ${hebrewYearGematria(ps.year)}`}</div>
                <button onClick={() => setViewAnchor(shiftHebMonth(viewAnchor, 1))} className="min-w-[36px] h-9 rounded-lg border border-black/10 bg-white/50 cursor-pointer text-xl hover:bg-white/80 transition">›</button>
            </div>
            <div className="mt-2 font-bold" aria-live="polite">{`היום: ${formatFullHebrew(now)}`}</div>
            <table className="w-full border-collapse mt-2">
                <thead>
                    <tr>{headers.map(h => <th key={h} className="p-2 border border-black/10 bg-black/5 font-bold">{h}</th>)}</tr>
                </thead>
                <tbody>
                    {Array.from({ length: Math.ceil((days.length + firstWeekday) / 7) }).map((_, weekIndex) => (
                        <tr key={weekIndex}>
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dayOfMonthIndex = weekIndex * 7 + dayIndex - firstWeekday;
                                if (dayOfMonthIndex < 0 || dayOfMonthIndex >= days.length) {
                                    return <td key={dayIndex} className="p-2 border border-black/10"></td>;
                                }
                                const gd = days[dayOfMonthIndex];
                                const p = getHebParts(gd);
                                const isToday = toISO(gd) === toISO(now);
                                const iso = toISO(gd);
                                const dayEvents = events.filter(e => e.date === iso);
                                return (
                                    <td key={dayIndex} className="p-2 border border-black/10 cursor-pointer relative hover:bg-blue-100/50 transition" onClick={() => setNewEventDate(iso)}>
                                        <span className={isToday ? "inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white shadow-md" : ""}>
                                            {hebrewDayGematria(p.day)}
                                        </span>
                                        {dayEvents.length > 0 && <span className="absolute top-1 right-1 block w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" title={dayEvents.map(e => e.title).join(', ')}></span>}
                                        <small className="block text-xs text-gray-500 mt-1">{`${gd.getDate()}.${gd.getMonth() + 1}`}</small>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4 text-right">
                <div className="flex gap-2 flex-wrap items-center">
                    <Input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} aria-label="תאריך אירוע" />
                    <Input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} aria-label="שעת אירוע" />
                    <Input type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="כותרת אירוע" className="min-w-[220px] flex-grow" />
                    <MainButton onClick={addEventHandler}>הוסף</MainButton>
                    <MainButton onClick={clearAllEvents} className="bg-red-600 hover:bg-red-700">מחק הכל</MainButton>
                </div>
                <small className="text-gray-500">טיפ: לחץ על יום בלוח למילוי אוטומטי של התאריך.</small>
                <div className="mt-3">
                    <h4 className="font-bold mb-2">אירועים בחודש הנוכחי</h4>
                    <ul className="list-none p-0 m-0 grid gap-2">
                        {currentMonthEvents.map((e, i) => (
                           <li key={i} className="bg-black/5 border border-black/10 rounded-lg p-2.5 flex justify-between items-center text-sm">
                               <div>
                                  <span className="font-bold">{e.title}</span>
                                  <span className="text-gray-600 mr-2">{new Date(e.date+'T00:00:00').toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}{e.time && ` ${e.time}`}</span>
                               </div>
                               <button onClick={() => deleteEventHandler(e.date, e.title)} className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600">מחק</button>
                           </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Card>
    );
};

const Weather: React.FC = () => {
    const [weatherData, setWeatherData] = useLocalStorage<any>('dashboard_weather_data_v1', null);
    const [lastFetch, setLastFetch] = useLocalStorage<number>('dashboard_weather_fetch_v1', 0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getWeatherInfo = (code: number): { icon: string, description: string } => {
        if (code === 0) return { icon: '☀️', description: 'שמיים בהירים' };
        if (code >= 1 && code <= 3) return { icon: '🌤️', description: 'מעונן חלקית' };
        if (code === 45 || code === 48) return { icon: '🌫️', description: 'ערפל' };
        if (code >= 51 && code <= 57) return { icon: '🌧️', description: 'טפטוף' };
        if (code >= 61 && code <= 67) return { icon: '🌧️', description: 'גשם' };
        if (code >= 80 && code <= 82) return { icon: '🌦️', description: 'ממטרים' };
        if (code >= 95 && code <= 99) return { icon: '⛈️', description: 'סופת רעמים' };
        return { icon: '🌍', description: 'לא ידוע' };
    };

    const fetchWeather = useCallback(() => {
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const [geoRes, weatherRes] = await Promise.all([
                        fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`),
                        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`)
                    ]);

                    if (!geoRes.ok) throw new Error('לא ניתן היה לקבל את שם העיר.');
                    const geoData = await geoRes.json();
                    const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'מיקום נוכחי';

                    if (!weatherRes.ok) throw new Error('לא ניתן היה לקבל נתוני מזג אוויר.');
                    const weatherApiData = await weatherRes.json();

                    const formattedData = {
                        city,
                        current: {
                            temperature: Math.round(weatherApiData.current.temperature_2m),
                            ...getWeatherInfo(weatherApiData.current.weather_code)
                        },
                        forecast: weatherApiData.daily.time.slice(1).map((date: string, index: number) => ({
                            date: new Date(date).toLocaleDateString('he-IL', { weekday: 'short' }),
                            maxTemp: Math.round(weatherApiData.daily.temperature_2m_max[index + 1]),
                            minTemp: Math.round(weatherApiData.daily.temperature_2m_min[index + 1]),
                            ...getWeatherInfo(weatherApiData.daily.weather_code[index + 1])
                        }))
                    };

                    setWeatherData(formattedData);
                    setLastFetch(Date.now());
                } catch (e: any) {
                    setError(e.message || 'שגיאה בקבלת נתונים.');
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setError('נדחתה הרשאת מיקום. לא ניתן להציג מזג אוויר.');
                setLoading(false);
            }
        );
    }, [setWeatherData, setLastFetch]);

    useEffect(() => {
        const now = Date.now();
        if (!weatherData || (now - lastFetch > 30 * 60 * 1000)) {
            fetchWeather();
        } else {
            setLoading(false);
        }
    }, [fetchWeather, weatherData, lastFetch]);

    if (loading) {
        return <Card><div className="text-center p-4">טוען נתוני מזג אוויר...</div></Card>;
    }

    if (error && !weatherData) {
        return (
            <Card>
                <div className="text-center p-4 text-red-600">
                    <p>{error}</p>
                    <MainButton onClick={fetchWeather} className="mt-2">נסה שוב</MainButton>
                </div>
            </Card>
        );
    }
    
    if (!weatherData) return null;

    return (
        <Card className="text-right max-w-md mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold">{weatherData.city}</h3>
                    <p className="text-gray-600">{weatherData.current.description}</p>
                </div>
                <button onClick={fetchWeather} title="רענן" className="text-gray-400 hover:text-gray-700 transition p-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
                </button>
            </div>
            <div className="flex items-center justify-center my-4">
                <span className="text-7xl">{weatherData.current.icon}</span>
                <span className="text-6xl font-bold mr-4">{weatherData.current.temperature}°</span>
            </div>
            <div className="flex justify-around text-center mt-4">
                {weatherData.forecast.map((day: any, index: number) => (
                    <div key={index} className="flex-1">
                        <div className="font-bold">{day.date}</div>
                        <div className="text-3xl my-1">{day.icon}</div>
                        <div>
                            <span className="font-semibold">{day.maxTemp}°</span>
                            <span className="text-gray-500 ml-1">{day.minTemp}°</span>
                        </div>
                    </div>
                ))}
            </div>
             {error && <div className="text-center p-2 text-yellow-700 bg-yellow-100 rounded-lg mt-3 text-sm">{error}</div>}
        </Card>
    );
};

export const HomePanel: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('dashboard_search_history_v1', []);
    
    const [newShortcutTitle, setNewShortcutTitle] = useState('');
    const [newShortcutUrl, setNewShortcutUrl] = useState('');
    const [shortcuts, setShortcuts] = useLocalStorage<Shortcut[]>('dashboard_shortcuts_v3', []);

    const handleSearch = () => {
        const q = searchTerm.trim();
        if (!q) return;
        if (!searchHistory.includes(q)) {
            setSearchHistory(prev => [q, ...prev.slice(0, 49)]);
        }
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    };

    const handleAddShortcut = () => {
        const url = newShortcutUrl.trim();
        if (!url) { alert('הזן URL'); return; }
        const title = newShortcutTitle.trim() || url;
        setShortcuts(prev => [...prev, { title, url }]);
        setNewShortcutTitle('');
        setNewShortcutUrl('');
    };

    const handleExport = () => {
        if(shortcuts.length === 0) return alert('אין קיצורים לייצוא');
        const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(shortcuts));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "shortcuts.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    return (
        <>
            <div className="flex justify-center gap-2 mb-4">
                <div className="flex w-full max-w-3xl">
                    <Input
                        type="text"
                        placeholder="חפש בגוגל..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="rounded-l-xl rounded-r-none"
                        list="search-suggestions"
                    />
                    <datalist id="search-suggestions">
                        {searchHistory.map(item => <option key={item} value={item} />)}
                    </datalist>
                    <MainButton onClick={handleSearch} className="rounded-r-xl rounded-l-none">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        <span>חפש</span>
                    </MainButton>
                </div>
            </div>

            <Card className="mb-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Input value={newShortcutTitle} onChange={e => setNewShortcutTitle(e.target.value)} placeholder="שם הקיצור (אופציונלי)" className="w-48"/>
                    <Input value={newShortcutUrl} onChange={e => setNewShortcutUrl(e.target.value)} placeholder="כתובת אינטרנט (URL)" className="w-72"/>
                    <MainButton onClick={handleAddShortcut}>הוסף קישור</MainButton>
                    <MainButton onClick={handleExport} className="bg-teal-600 hover:bg-teal-700">ייצא JSON</MainButton>
                </div>
            </Card>

            <div className="flex flex-col lg:flex-row gap-4 items-start">
                <div className="flex-1 w-full lg:min-w-[260px]">
                    <ShortcutGrid />
                </div>
                <div className="flex-1 w-full lg:min-w-[260px] flex flex-col gap-4">
                    <Weather />
                    <HebrewCalendar />
                </div>
            </div>
        </>
    );
};