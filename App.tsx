import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { PRESET_BACKGROUNDS } from './constants';
import { Sidebar, PageHeader, Panel } from './components/Shared';
import { HomePanel } from './components/HomePanel';
import { ToolsPanel, PersonalPanel, DesignPanel, MapPanel, NewsPanel, MusicPanel, HistoryPanel } from './components/OtherPanels';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
    const [background, setBackground] = useLocalStorage<string>('dashboard_bg_v3', PRESET_BACKGROUNDS[0]);
    const [font, setFont] = useState("'Assistant', Arial, sans-serif");

    useEffect(() => {
        document.body.style.fontFamily = font;
    }, [font]);
    
    useEffect(() => {
        document.body.classList.remove('animated-bg');
        if (!background) {
            document.body.classList.add('animated-bg');
            return;
        }
        if (background.startsWith('linear')) {
            document.body.style.background = background;
            document.body.style.backgroundSize = '240% 240%';
            document.body.style.animation = 'gradient-animation 18s ease infinite';
        } else {
            document.body.style.background = `url(${background})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.animation = 'none';
        }
    }, [background]);

    return (
        <div className="flex h-screen w-screen bg-transparent">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 flex flex-col p-4 overflow-y-auto h-full">
                <PageHeader />
                <main className="flex-1">
                    <Panel id={Tab.Home} activeTab={activeTab}><HomePanel /></Panel>
                    <Panel id={Tab.Tools} activeTab={activeTab}><ToolsPanel /></Panel>
                    <Panel id={Tab.Personal} activeTab={activeTab}><PersonalPanel /></Panel>
                    <Panel id={Tab.History} activeTab={activeTab}><HistoryPanel /></Panel>
                    <Panel id={Tab.Design} activeTab={activeTab}><DesignPanel setFont={setFont} setBackground={setBackground} /></Panel>
                    <Panel id={Tab.Map} activeTab={activeTab}><MapPanel /></Panel>
                    <Panel id={Tab.News} activeTab={activeTab}><NewsPanel /></Panel>
                    <Panel id={Tab.Music} activeTab={activeTab}><MusicPanel /></Panel>
                </main>
                <footer className="text-center mt-3 text-gray-600/80 font-semibold">
                    דשבורד מקומי — כל הנתונים נשמרים בדפדפן שלך
                </footer>
            </div>
        </div>
    );
};

export default App;