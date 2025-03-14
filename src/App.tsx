import React, { useState, useEffect } from 'react';
import { Cigarette, TrendingDown, Award, Calendar, BarChart2, Home } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { CloudStorage } from "@telegram-apps/sdk";
import { format, subDays, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SmokingData {
  date: string;
  count: number;
}

// Helper functions for data storage
const saveToStorage = async (data: SmokingData[]) => {


  try {
    await CloudStorage.set("smokingData", JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data:", error);
  }

  // try {
  //   if (setCloudStorageItem.isAvailable()) {
  //     await setCloudStorageItem('smokingData', JSON.stringify(data));
  //   } else {
  //     // Fallback to localStorage if cloud storage is not available
  //     localStorage.setItem('smokingData', JSON.stringify(data));
  //   }
  // } catch (error) {
  //   console.error('Error saving data:', error);
  //   // Fallback to localStorage on error
  //   try {
  //     localStorage.setItem('smokingData', JSON.stringify(data));
  //   } catch (fallbackError) {
  //     console.error('Error saving to fallback storage:', fallbackError);
  //   }
  // }
};

const loadFromStorage = async (): Promise<SmokingData[]> => {
  try {
      const data = await CloudStorage.get('smokingData');
      return data ? JSON.parse(data) : [];
   
  } catch (error) {
    console.error('Error loading data:', error);
    // Fallback to localStorage on error
    try {
      const data = localStorage.getItem('smokingData');
      return data ? JSON.parse(data) : [];
    } catch (fallbackError) {
      console.error('Error loading from fallback storage:', fallbackError);
      return [];
    }
  }
};

function App() {
  const [page, setPage] = useState<'home' | 'stats'>('home');
  const [userName, setUserName] = useState<string>('');
  const [smokingData, setSmokingData] = useState<SmokingData[]>([]);

  useEffect(() => {
    // Initialize Telegram WebApp and load data
    WebApp.ready();
    setUserName(WebApp.initDataUnsafe.user?.first_name || 'User');

    const loadData = async () => {
      const data = await loadFromStorage();
      setSmokingData(data);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Save data whenever it changes
    if (smokingData.length > 0) {
      saveToStorage(smokingData);
    }
  }, [smokingData]);

  const today = new Date().toISOString().split('T')[0];
  const todayData = smokingData.find(d => d.date === today) || { date: today, count: 0 };
  
  const previousDay = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const previousData = smokingData.find(d => d.date === previousDay) || { date: previousDay, count: 0 };

  const progress = previousData.count > 0 
    ? Math.round(((previousData.count - todayData.count) / previousData.count) * 100)
    : 0;

  const handleSmoke = () => {
    const updatedData = [...smokingData];
    const todayIndex = updatedData.findIndex(d => d.date === today);
    
    if (todayIndex >= 0) {
      updatedData[todayIndex] = { ...updatedData[todayIndex], count: updatedData[todayIndex].count + 1 };
    } else {
      updatedData.push({ date: today, count: 1 });
    }
    
    setSmokingData(updatedData);
  };

  const getLastSevenDaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i).toISOString().split('T')[0];
      const dayData = smokingData.find(d => d.date === date) || { date, count: 0 };
      data.push({
        name: format(parseISO(date), 'EEE'),
        count: dayData.count
      });
    }
    return data;
  };

  const HomePage = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome, {userName}!</h1>
        <p className="text-blue-200">Track your progress, one day at a time</p>
      </div>

      {/* Main Stats */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-200">Today's count</p>
            <h2 className="text-4xl font-bold">{todayData.count}</h2>
          </div>
          <div>
            <p className="text-blue-200">Yesterday</p>
            <h2 className="text-4xl font-bold">{previousData.count}</h2>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}% better than yesterday</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, progress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-green-400" />
            <span>Trend</span>
          </div>
          <p className="text-2xl font-bold">
            {progress >= 0 ? 'Improving' : 'Need Focus'}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-blue-400" />
            <span>Streak</span>
          </div>
          <p className="text-2xl font-bold">
            {progress > 0 ? '1 Day' : 'Start Now'}
          </p>
        </div>
      </div>

      {/* Track Button */}
      <button
        onClick={handleSmoke}
        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-xl p-6 transition-all duration-300 flex items-center justify-center gap-3"
      >
        <Cigarette className="w-6 h-6" />
        <span className="text-xl font-semibold">Track Smoke</span>
      </button>

      {/* Motivation */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center gap-4">
        <Award className="text-yellow-400 w-8 h-8" />
        <p className="text-sm">
          Stay strong! Every cigarette you don't smoke is a victory for your health.
        </p>
      </div>
    </div>
  );

  const StatsPage = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Your Statistics</h1>
        <p className="text-blue-200">Weekly smoking pattern</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getLastSevenDaysData()}>
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
        <h2 className="text-xl font-bold mb-4">Weekly Summary</h2>
        <div className="space-y-2">
          <p>Total cigarettes: {getLastSevenDaysData().reduce((acc, day) => acc + day.count, 0)}</p>
          <p>Daily average: {(getLastSevenDaysData().reduce((acc, day) => acc + day.count, 0) / 7).toFixed(1)}</p>
          <p>Best day: {Math.min(...getLastSevenDaysData().map(day => day.count))} cigarettes</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white p-6">
      <div className="max-w-md mx-auto">
        {page === 'home' ? <HomePage /> : <StatsPage />}
        
        {/* Navigation */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-lg rounded-full p-2 flex gap-2">
          <button
            onClick={() => setPage('home')}
            className={`p-3 rounded-full transition-all ${page === 'home' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <Home className="w-6 h-6" />
          </button>
          <button
            onClick={() => setPage('stats')}
            className={`p-3 rounded-full transition-all ${page === 'stats' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <BarChart2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;