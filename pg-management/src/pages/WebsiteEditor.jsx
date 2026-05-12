import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Plus, Edit2, Trash2, X, Save, Star, MessageSquare, Layout
} from 'lucide-react';
import {
  getLandingServices, saveLandingServices,
  getLandingTestimonials, saveLandingTestimonials,
  getLandingHero, saveLandingHero, generateId
} from '../data/store';

export default function WebsiteEditor() {
  const [activeTab, setActiveTab] = useState('hero');
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [hero, setHero] = useState({ tagline: '', title: '', subtitle: '', description: '', heroImage: '' });
  const [editItem, setEditItem] = useState(null);
  const [editType, setEditType] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [s, t, h] = await Promise.all([
        getLandingServices(),
        getLandingTestimonials(),
        getLandingHero(),
      ]);
      setServices(s);
      setTestimonials(t);
      setHero(h);
      setLoading(false);
    };
    loadData();
  }, []);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Hero
  const saveHeroChanges = async () => {
    await saveLandingHero(hero);
    showSaved();
  };

  // Services
  const saveService = async (data) => {
    let updated;
    if (data.id) {
      updated = services.map(s => s.id === data.id ? data : s);
    } else {
      updated = [...services, { ...data, id: generateId() }];
    }
    setServices(updated);
    await saveLandingServices(updated);
    setEditItem(null);
    setEditType('');
    showSaved();
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    await saveLandingServices(updated);
    showSaved();
  };

  // Testimonials
  const saveTestimonial = async (data) => {
    let updated;
    if (data.id) {
      updated = testimonials.map(t => t.id === data.id ? data : t);
    } else {
      updated = [...testimonials, { ...data, id: generateId() }];
    }
    setTestimonials(updated);
    await saveLandingTestimonials(updated);
    setEditItem(null);
    setEditType('');
    showSaved();
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    await saveLandingTestimonials(updated);
    showSaved();
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: Layout },
    { id: 'services', label: 'Services', icon: Globe },
    { id: 'testimonials', label: 'Reviews', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Website Editor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Edit landing page content, images, and reviews</p>
        </div>
        {saved && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium"
          >
            ✓ Saved successfully
          </motion.span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-premium'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Editor */}
      {activeTab === 'hero' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-solid p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-purple-600" /> Edit Hero Section
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline</label>
              <input type="text" value={hero.tagline} onChange={e => setHero({...hero, tagline: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input type="text" value={hero.title} onChange={e => setHero({...hero, title: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
              <input type="text" value={hero.subtitle} onChange={e => setHero({...hero, subtitle: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hero Image URL</label>
              <input type="url" value={hero.heroImage} onChange={e => setHero({...hero, heroImage: e.target.value})} className="input-field" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea rows={3} value={hero.description} onChange={e => setHero({...hero, description: e.target.value})} className="input-field resize-none" />
          </div>
          {hero.heroImage && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img src={hero.heroImage} alt="Hero preview" className="w-full max-w-sm h-48 object-cover rounded-xl border" />
            </div>
          )}
          <button onClick={saveHeroChanges} className="btn-premium flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Hero
          </button>
        </motion.div>
      )}

      {/* Services Editor */}
      {activeTab === 'services' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditItem({ title: '', desc: '', img: '' }); setEditType('service'); }}
              className="btn-premium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div key={s.id} className="glass-card-solid overflow-hidden group">
                {s.img && (
                  <img src={s.img} alt={s.title} className="w-full h-36 object-cover" />
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{s.desc}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { setEditItem(s); setEditType('service'); }}
                      className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteService(s.id)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Testimonials Editor */}
      {activeTab === 'testimonials' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setEditItem({ name: '', room: '', text: '', rating: 5 }); setEditType('testimonial'); }}
              className="btn-premium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Review
            </button>
          </div>
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div key={t.id} className="glass-card-solid p-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</span>
                    <span className="text-xs text-gray-500">• {t.room}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-2">"{t.text}"</p>
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditItem(t); setEditType('testimonial'); }}
                    className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTestimonial(t.id)}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <EditModal
            type={editType}
            item={editItem}
            onSave={editType === 'service' ? saveService : saveTestimonial}
            onClose={() => { setEditItem(null); setEditType(''); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditModal({ type, item, onSave, onClose }) {
  const [form, setForm] = useState(item);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {item.id ? 'Edit' : 'Add'} {type === 'service' ? 'Service' : 'Review'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === 'service' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea rows={3} required value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL *</label>
                <input type="url" required value={form.img} onChange={e => setForm({...form, img: e.target.value})} className="input-field" placeholder="https://images.unsplash.com/..." />
                <p className="text-xs text-gray-400 mt-1">Use any image URL from Unsplash, Pexels, or your own hosted image</p>
              </div>
              {form.img && (
                <img src={form.img} alt="Preview" className="w-full h-32 object-cover rounded-xl border" />
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
                <input type="text" value={form.room} onChange={e => setForm({...form, room: e.target.value})} className="input-field" placeholder="e.g. Room 201" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Text *</label>
                <textarea rows={3} required value={form.text} onChange={e => setForm({...form, text: e.target.value})} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({...form, rating: r})}
                      className="p-1"
                    >
                      <Star className={`w-6 h-6 ${r <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <button type="submit" className="btn-premium w-full">
            {item.id ? 'Update' : 'Add'} {type === 'service' ? 'Service' : 'Review'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
