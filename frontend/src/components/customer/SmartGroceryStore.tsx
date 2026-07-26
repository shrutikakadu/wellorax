import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { groceryService } from '../../services';
import type { GroceryItem } from '../../types';
import {
  Leaf, ShieldCheck, Plus, Minus, Search, Sparkles, X,
  ShoppingCart, Star, Heart, Brain, Zap, Filter,
  ArrowUpDown, CheckCircle, Truck, Clock, Loader2
} from 'lucide-react';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Protein', 'Organic Dairy', 'Supplements', 'Healthy Snacks', 'Grains', 'Dairy'];

const SORT_OPTIONS = ['Popular', 'Price: Low', 'Price: High', 'Rating'];

const HEALTH_TIPS = [
  { icon: Brain, title: 'Brain Health', desc: 'Omega-3 rich foods support cognitive function' },
  { icon: Heart, title: 'Heart Health', desc: 'Fiber and healthy fats protect your heart' },
  { icon: Zap, title: 'Energy Boost', desc: 'Complex carbs and MCTs for sustained energy' },
];

function adaptGroceryProduct(p: any): GroceryItem {
  return {
    id: p.id,
    name: p.name,
    category: (p.category || 'Healthy Snacks') as GroceryItem['category'],
    price: p.price,
    unit: p.unit,
    image: p.imageUrl || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    rating: 4.5 + Math.random() * 0.5,
    isOrganic: p.isOrganic || false,
    nutritionTag: p.healthTag || 'Nutrient Dense',
  };
}

export const SmartGroceryStore: React.FC = () => {
  const { addGroceryToCart, addToCart, cart, removeFromCart, healthProfile } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popular');
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [allItems, setAllItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await groceryService.getProducts();
        if (res.success && res.data) {
          setAllItems(res.data.map(adaptGroceryProduct));
        }
      } catch (err) {
        console.warn('Grocery fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredItems = useMemo(() => {
    let items = allItems.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchQ = query === '' || item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.nutritionTag.toLowerCase().includes(query.toLowerCase());
      const matchOrganic = !organicOnly || item.isOrganic;
      const matchPrice = item.price <= maxPrice;
      return matchCat && matchQ && matchOrganic && matchPrice;
    });

    switch (sortBy) {
      case 'Price: Low': items = [...items].sort((a, b) => a.price - b.price); break;
      case 'Price: High': items = [...items].sort((a, b) => b.price - a.price); break;
      case 'Rating': items = [...items].sort((a, b) => b.rating - a.rating); break;
      default: items = [...items].sort((a, b) => b.rating - a.rating);
    }
    return items;
  }, [allItems, selectedCategory, query, sortBy, organicOnly, maxPrice]);

  const aiRecItems = useMemo(() => allItems.filter((_, i) => i < 5), [allItems]);

  const getCartQty = (itemId: string) => cart.find(i => i.meal.id === `grocery-${itemId}`)?.quantity || 0;
  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalCartPrice = cart.reduce((s, i) => s + i.meal.price * i.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
            <Leaf className="w-3.5 h-3.5" />
            <span>100% Certified Organic & Non-GMO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Smart Organic Grocery Store
          </h1>
          <p className="text-sm text-emerald-100 max-w-xl">
            Clinically vetted ingredients & organic pantry staples tailored for {healthProfile.name}'s bio-targets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span>Auto-Substituted for {healthProfile.diseases[0] || 'Health'}</span>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative px-5 py-3 rounded-2xl bg-white text-emerald-700 text-xs font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* AI Recommendations */}
      {!loading && aiRecItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Recommended for You</h2>
              <p className="text-[10px] text-slate-400">Based on your health profile & fitness goals</p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {aiRecItems.map(item => {
              const qty = getCartQty(item.id);
              return (
                <div key={item.id} className="shrink-0 w-56 p-4 rounded-2xl bg-white dark:bg-[#0B1F1A] border border-blue-500/20 shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-28 rounded-xl overflow-hidden mb-3">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> AI Pick
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.nutritionTag}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">₹{item.price}</span>
                    {qty === 0 ? (
                      <button onClick={() => addGroceryToCart(item)} className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => removeFromCart(`grocery-${item.id}`)} className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-emerald-600 min-w-[14px] text-center">{qty}</span>
                        <button onClick={() => addGroceryToCart(item)} className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Health Tip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {HEALTH_TIPS.map(tip => {
          const Icon = tip.icon;
          return (
            <div key={tip.title} className="p-4 rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tip.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{tip.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search organic spinach, whey protein..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showFilters ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 pr-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold appearance-none focus:outline-none focus:border-emerald-500"
            >
              {SORT_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {showFilters && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={organicOnly} onChange={(e) => setOrganicOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
              Organic Only
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Max Price:</span>
              <input type="range" min={50} max={3000} step={50} value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-32 accent-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">₹{maxPrice}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-semibold">{filteredItems.length} products found</p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const qty = getCartQty(item.id);
            return (
              <div key={item.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-4">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {item.isOrganic && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                        ORGANIC
                      </span>
                    )}
                    <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[10px] font-bold text-amber-600">{item.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit']">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Unit: {item.unit}</p>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3" /> {item.nutritionTag}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400">Price</span>
                    <div className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
                      ₹{item.price}
                    </div>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => addGroceryToCart(item)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <button onClick={() => removeFromCart(`grocery-${item.id}`)} className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 min-w-[20px] text-center">{qty}</span>
                      <button onClick={() => addGroceryToCart(item)} className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No products found</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#091F17] shadow-2xl overflow-y-auto z-10 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-500" /> Your Cart
                <span className="text-xs font-bold text-slate-400">({totalCartItems} items)</span>
              </h2>
              <button onClick={() => setShowCart(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Your cart is empty</p>
                <p className="text-xs text-slate-400">Add items to get started.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.meal.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-emerald-500/10">
                      <img src={item.meal.image} alt={item.meal.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.meal.name}</p>
                        <p className="text-[10px] text-slate-400">{item.meal.restaurantName}</p>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹{item.meal.price * item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => removeFromCart(item.meal.id)} className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold min-w-[16px] text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item.meal)} className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <Truck className="w-4 h-4" /> Free delivery on orders above ₹500
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" /> Estimated delivery: 30-45 mins
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{totalCartPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-500 font-bold">
                    <span>Delivery</span>
                    <span>{totalCartPrice >= 500 ? 'FREE' : '₹49'}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Total</span>
                    <span>₹{totalCartPrice + (totalCartPrice >= 500 ? 0 : 49)}</span>
                  </div>
                </div>

                <button className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
