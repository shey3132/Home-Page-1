
export interface Shortcut {
  title: string;
  url: string;
}

export interface TodoItem {
  txt: string;
  done: boolean;
}

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
}

export interface Holiday {
    date: string;
    title: string;
}

export enum Tab {
  Home = 'home',
  Tools = 'tools',
  Personal = 'personal',
  History = 'history',
  Design = 'design',
  Map = 'map',
  News = 'news',
  Music = 'music',
}