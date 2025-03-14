import { useState, useEffect } from 'react';
import { Cigarette, TrendingDown, Award, Calendar, BarChart2, Home } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { cloudStorage } from "@telegram-apps/sdk-react";
import { format, subDays, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SmokingData {
  date: string;
  count: number;
}


// Helper functions for data storage
const saveToStorage = async (data: SmokingData[]) => {


  try {
    await WebApp.CloudStorage.setItem("smokingData", JSON.stringify(data));
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

const loadFromStorage = async () => {
  try {
      const data = await WebApp.CloudStorage.getItem('smokingData')
      // return data ? JSON.parse(data) : [];
      console.log(data);
      return data;
  } catch (error) {
    console.error('Error loading data:', error);
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

  // useEffect(() => {
  //   // Save data whenever it changes
  //   if (smokingData.length > 0) {
  //     saveToStorage(smokingData);
  //   }
  // }, [smokingData]);

  // const today = new Date().toISOString().split('T')[0];
  // const todayData = smokingData.find(d => d.date === today) || { date: today, count: 0 };
  
  // const previousDay = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  // const previousData = smokingData.find(d => d.date === previousDay) || { date: previousDay, count: 0 };

  // const progress = previousData.count > 0 
  //   ? Math.round(((previousData.count - todayData.count) / previousData.count) * 100)
  //   : 0;

  // const handleSmoke = () => {
  //   const updatedData = [...smokingData];
  //   const todayIndex = updatedData.findIndex(d => d.date === today);
    
  //   if (todayIndex >= 0) {
  //     updatedData[todayIndex] = { ...updatedData[todayIndex], count: updatedData[todayIndex].count + 1 };
  //   } else {
  //     updatedData.push({ date: today, count: 1 });
  //   }
    
  //   setSmokingData(updatedData);
  // };

  // const getLastSevenDaysData = () => {
  //   const data = [];
  //   for (let i = 6; i >= 0; i--) {
  //     const date = subDays(new Date(), i).toISOString().split('T')[0];
  //     const dayData = smokingData.find(d => d.date === date) || { date, count: 0 };
  //     data.push({
  //       name: format(parseISO(date), 'EEE'),
  //       count: dayData.count
  //     });
  //   }
  //   return data;
  // };

  const HomePage = () => (
    <div className="space-y-8">
      {/* Header */}

    </div>
  );

  const StatsPage = () => (
    <div>sdsd</div>
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