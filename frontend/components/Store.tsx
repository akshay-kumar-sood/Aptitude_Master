import React, { useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { storeItems } from '../data/storeItems';
import { Coins, Check, Lock, ShoppingBag } from 'lucide-react';

const Store: React.FC = () => {
  const { progress, buyItem } = useProgress();
  const [filter, setFilter] = useState<'all' | 'badge' | 'other'>('all');

  const filteredItems = useMemo(() => {
    return storeItems.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'badge') return item.type === 'badge';
        return item.type !== 'badge';
    });
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
                <h1 className="text-4xl font-extrabold flex items-center justify-center md:justify-start gap-3 mb-2">
                    <ShoppingBag className="h-10 w-10" /> The Marketplace
                </h1>
                <p className="text-yellow-100 text-lg">Exchange your Paisa for legendary badges and goodies.</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/30 flex items-center shadow-lg transform transition-transform hover:scale-105">
                <div className="mr-4 bg-yellow-400 rounded-full p-2">
                    <Coins className="h-6 w-6 text-yellow-900" />
                </div>
                <div>
                    <div className="text-xs text-yellow-100 uppercase font-bold tracking-wider">Your Balance</div>
                    <span className="text-3xl font-bold">{progress.points.toLocaleString()}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                  All Items
              </button>
              <button 
                onClick={() => setFilter('badge')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'badge' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                  Badges
              </button>
              <button 
                onClick={() => setFilter('other')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'other' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                  Goodies & Themes
              </button>
          </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
            const isOwned = progress.inventory.includes(item.id);
            const canAfford = progress.points >= item.price;
            const isConsumable = item.type === 'consumable';

            return (
                <div key={item.id} className={`
                    bg-white rounded-2xl border transition-all duration-300 flex flex-col
                    ${isOwned && !isConsumable ? 'border-green-200 shadow-green-50' : 'border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1'}
                `}>
                    <div className="p-6 flex-1 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner">
                            {item.icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${item.type === 'badge' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {item.type}
                        </span>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    </div>
                    
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                        {isOwned && !isConsumable ? (
                            <button disabled className="w-full py-2.5 flex items-center justify-center gap-2 bg-green-100 text-green-700 rounded-xl font-bold cursor-default shadow-sm border border-green-200">
                                <Check className="h-4 w-4" /> Owned
                            </button>
                        ) : (
                            <button 
                                onClick={() => buyItem(item.id, item.price)}
                                disabled={!canAfford}
                                className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-sm
                                    ${canAfford 
                                        ? 'bg-gray-900 text-white hover:bg-black hover:shadow-md active:scale-95' 
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }
                                `}
                            >
                                {canAfford ? (
                                    <>Buy <Coins className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {item.price}</>
                                ) : (
                                    <><Lock className="h-3 w-3" /> {item.price}</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default Store;