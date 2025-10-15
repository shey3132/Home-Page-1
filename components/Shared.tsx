import React, { useState, useEffect } from 'react';
import { Tab } from '../types';

// prettier-ignore
const HEBREW_QUOTES = [
    { quote: "אם אין אני לי, מי לי? וכשאני לעצמי, מה אני? ואם לא עכשיו, אימתי?", author: "הלל הזקן" },
    { quote: "כל אדם צריך שיהיה לו משהו, בשביל שיוכל לתת.", author: "רבי נחמן מברסלב" },
    { quote: "הצלחה היא היכולת לעבור מכישלון לכישלון מבלי לאבד את ההתלהבות.", author: "וינסטון צ'רצ'יל" },
    { quote: "הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו.", author: "פיטר דרוקר" },
    { quote: "דע מאין באת, ולאן אתה הולך, ולפני מי אתה עתיד ליתן דין וחשבון.", author: "פרקי אבות" },
    { quote: "היום הוא היום הראשון של שארית חייך.", author: "פתגם עממי" },
    { quote: "המעז מנצח.", author: "פתגם" },
    { quote: "האושר אינו יעד, אלא דרך חיים.", author: "פתגם" },
    { quote: "החיים הם מה שקורה לך בזמן שאתה עסוק בלתכנן תוכניות אחרות.", author: "ג'ון לנון" },
    { quote: "אל תבכה כי זה נגמר, תחייך כי זה קרה.", author: "ד\"ר סוס" },
];

const QuoteOfTheDay: React.FC = () => {
    const [dailyQuote, setDailyQuote] = useState<{ quote: string; author: string } | null>(null);

    useEffect(() => {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const dayOfYear = Math.floor((Date.now() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        const quoteIndex = dayOfYear % HEBREW_QUOTES.length;
        setDailyQuote(HEBREW_QUOTES[quoteIndex]);
    }, []);

    if (!dailyQuote) return null;

    return (
        <div className="hidden lg:block max-w-sm pl-4">
            <blockquote className="text-gray-700 italic text-right">
                <p>"{dailyQuote.quote}"</p>
            </blockquote>
            <cite className="block text-gray-500 text-sm mt-1 text-right">— {dailyQuote.author}</cite>
        </div>
    );
};


// SVG Icons for the Sidebar
const icons: Record<Tab, React.FC<{ className?: string }>> = {
  home: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  tools: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>,
  personal: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  history: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
  design: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-2 16.08c0-1.45.69-2.73 1.76-3.54.31-.24.5-.6.5-1.01V11c0-.45-.19-.84-.5-1.1C10.69 9.17 10 7.9 10 6.45c0-1.18.31-2.26.84-3.21-.62-.22-1.28-.34-2-.34-5.52 0-10 4.48-10 10 0 5.16 3.92 9.42 8.94 9.95.02.01.04.01.06.01V20c0-.55.45-1 1-1h1.08c.05 0 .1.01.14.02l.06.01c.21.03.42.05.63.05 1.08 0 2.06-.35 2.87-.95C14.16 19.34 13.21 21 12 21c-1.89 0-3.6-.9-4.69-2.33-.29.13-.56.28-.81.45zM20.71 10.5l-2.2-2.2c-.39-.39-1.02-.39-1.41 0L15 10.41l3.59 3.59L20.71 12c.39-.39.39-1.02 0-1.41zM13 12.01L15.99 15l-4.2 4.2c-.39.39-1.02.39-1.41 0s-.39-1.02 0-1.41L13 15.18V12.01z"/></svg>,
  map: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-6.5 18-3.5-7-7-3.5L20.5 3z"/></svg>,
  news: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>,
  music: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>,
}

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const tabs: { id: Tab, label: string }[] = [
        { id: Tab.Home, label: 'דף הבית' },
        { id: Tab.Tools, label: 'כלים' },
        { id: Tab.Personal, label: 'אישי' },
        { id: Tab.History, label: 'היסטוריה' },
        { id: Tab.Design, label: 'עיצוב' },
        { id: Tab.Map, label: 'מפה' },
        { id: Tab.News, label: 'חדשות' },
        { id: Tab.Music, label: 'מוזיקה' },
    ];

    return (
        <aside className="w-64 bg-black/10 backdrop-blur-lg p-4 flex flex-col gap-2 shrink-0 h-full">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4 font-[Varela Round]">הדשבורד שלי</h1>
            <nav className="flex flex-col gap-2">
                {tabs.map(tab => {
                    const Icon = icons[tab.id];
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-4 py-3 px-4 rounded-xl text-right font-bold transition-all duration-200 ease-in-out transform hover:scale-105 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700 hover:bg-white/50'}`}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                        >
                            <Icon className="w-6 h-6" />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </nav>
        </aside>
    );
};

export const PageHeader: React.FC = () => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const h = dateTime.getHours();
        if (h >= 5 && h < 12) return 'בוקר טוב ☀️';
        if (h >= 12 && h < 17) return 'צהריים טובים 🌤️';
        if (h >= 17 && h < 21) return 'ערב טוב 🌆';
        return 'לילה טוב 🌙';
    };

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    return (
        <header className="mb-4" role="banner">
            <div className="bg-white/60 backdrop-blur-md p-4 px-6 rounded-2xl shadow-lg border border-white/30 flex justify-between items-center">
                 <div className="text-right">
                    <h2 className="font-bold text-2xl mb-1.5">{getGreeting()}</h2>
                    <p className="text-md text-gray-600">
                        {`📅 ${dateTime.toLocaleDateString('he-IL', dateOptions)} | ⏰ ${dateTime.toLocaleTimeString('he-IL')}`}
                    </p>
                </div>
                <QuoteOfTheDay />
            </div>
        </header>
    );
};


interface PanelProps {
  id: Tab;
  activeTab: Tab;
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ id, activeTab, children }) => {
    return (
        <section
            role="tabpanel"
            className={`${activeTab === id ? 'block' : 'hidden'}`}
        >
            {children}
        </section>
    );
};

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    const baseClasses = "bg-white/50 backdrop-blur-xl rounded-2xl p-4 text-center shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1";
    const clickableClasses = onClick ? "cursor-pointer" : "";
    return (
        <div className={`${baseClasses} ${clickableClasses} ${className}`} onClick={onClick}>
            {children}
        </div>
    );
};

export const MainButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button
        className={`py-2.5 px-5 rounded-xl border-none bg-blue-600 text-white font-bold cursor-pointer hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:shadow-none flex items-center justify-center gap-2 ${className}`}
        {...props}
    >
        {children}
    </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input
        className={`w-full p-2.5 rounded-xl border border-black/10 bg-white/70 text-base placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm focus:shadow-md ${className}`}
        {...props}
    />
);