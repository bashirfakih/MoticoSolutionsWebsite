'use client';

/**
 * Admin Content Management Page
 *
 * Manage homepage content: hero slides, testimonials, partner logos
 */

import { useState, useEffect } from 'react';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Star,
  Building2,
  MessageSquare,
  GripVertical,
  AlertCircle,
  Upload,
} from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  accentColor: string;
  sortOrder: number;
  isActive: boolean;
}

interface Testimonial {
  id: string;
  customerName: string;
  role: string;
  company: string;
  quote: string;
  image?: string;
  rating: number;
  sortOrder: number;
  isActive: boolean;
}

interface PartnerLogo {
  id: string;
  name: string;
  logo: string;
  website?: string;
  sortOrder: number;
  isActive: boolean;
}

type TabType = 'slides' | 'testimonials' | 'logos';

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('slides');
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [logos, setLogos] = useState<PartnerLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingLogo, setEditingLogo] = useState<PartnerLogo | null>(null);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [slidesRes, testimonialsRes, logosRes] = await Promise.all([
        fetch('/api/cms/hero-slides'),
        fetch('/api/cms/testimonials'),
        fetch('/api/cms/partner-logos'),
      ]);

      if (slidesRes.ok) setSlides(await slidesRes.json());
      if (testimonialsRes.ok) setTestimonials(await testimonialsRes.json());
      if (logosRes.ok) setLogos(await logosRes.json());
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    try {
      const res = await fetch(`/api/cms/hero-slides/${id}`, { method: 'DELETE' });
      if (res.ok) loadContent();
    } catch (error) {
      alert('Failed to delete slide');
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/cms/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) loadContent();
    } catch (error) {
      alert('Failed to delete testimonial');
    }
  };

  const deleteLogo = async (id: string) => {
    if (!confirm('Delete this logo?')) return;
    try {
      const res = await fetch(`/api/cms/partner-logos/${id}`, { method: 'DELETE' });
      if (res.ok) loadContent();
    } catch (error) {
      alert('Failed to delete logo');
    }
  };

  const saveSlide = async (slide: Partial<HeroSlide>) => {
    try {
      const url = slide.id ? `/api/cms/hero-slides/${slide.id}` : '/api/cms/hero-slides';
      const method = slide.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slide),
      });

      if (res.ok) {
        loadContent();
        setShowSlideModal(false);
        setEditingSlide(null);
      } else {
        alert('Failed to save slide');
      }
    } catch (error) {
      alert('Failed to save slide');
    }
  };

  const saveTestimonial = async (testimonial: Partial<Testimonial>) => {
    try {
      const url = testimonial.id ? `/api/cms/testimonials/${testimonial.id}` : '/api/cms/testimonials';
      const method = testimonial.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonial),
      });

      if (res.ok) {
        loadContent();
        setShowTestimonialModal(false);
        setEditingTestimonial(null);
      } else {
        alert('Failed to save testimonial');
      }
    } catch (error) {
      alert('Failed to save testimonial');
    }
  };

  const saveLogo = async (logo: Partial<PartnerLogo>) => {
    try {
      const url = logo.id ? `/api/cms/partner-logos/${logo.id}` : '/api/cms/partner-logos';
      const method = logo.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logo),
      });

      if (res.ok) {
        loadContent();
        setShowLogoModal(false);
        setEditingLogo(null);
      } else {
        alert('Failed to save logo');
      }
    } catch (error) {
      alert('Failed to save logo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Content</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('slides')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'slides'
                ? 'border-b-2 border-[#004D8B] text-[#004D8B]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Hero Slides ({slides.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'testimonials'
                ? 'border-b-2 border-[#004D8B] text-[#004D8B]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Testimonials ({testimonials.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('logos')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'logos'
                ? 'border-b-2 border-[#004D8B] text-[#004D8B]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Partner Logos ({logos.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Hero Slides Tab */}
      {activeTab === 'slides' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Manage hero carousel slides on the homepage
            </p>
            <button
              onClick={() => {
                setEditingSlide({
                  id: '',
                  title: '',
                  subtitle: '',
                  tag: '',
                  image: '',
                  ctaText: 'Learn More',
                  ctaLink: '#',
                  accentColor: '#bb0c15',
                  sortOrder: slides.length,
                  isActive: true,
                });
                setShowSlideModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Slide
            </button>
          </div>

          {slides.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">No Hero Slides</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add your first hero slide to display on the homepage carousel
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {slides.map((slide) => (
                <div key={slide.id} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-32 h-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {slide.tag && (
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {slide.tag}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 truncate">{slide.title}</h3>
                    {slide.subtitle && (
                      <p className="text-sm text-gray-600 truncate">{slide.subtitle}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: slide.accentColor }}
                        title={slide.accentColor}
                      />
                      <span className="text-xs text-gray-500">Order: {slide.sortOrder}</span>
                      <span className={`text-xs px-2 py-1 rounded ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {slide.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => {
                        setEditingSlide(slide);
                        setShowSlideModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-[#004D8B] hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSlide(slide.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Manage customer testimonials displayed on the homepage
            </p>
            <button
              onClick={() => {
                setEditingTestimonial({
                  id: '',
                  customerName: '',
                  role: '',
                  company: '',
                  quote: '',
                  image: '',
                  rating: 5,
                  sortOrder: testimonials.length,
                  isActive: true,
                });
                setShowTestimonialModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Testimonial
            </button>
          </div>

          {testimonials.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">No Testimonials</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add customer testimonials to build trust and showcase success stories
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  {testimonial.image && (
                    <img
                      src={testimonial.image}
                      alt={testimonial.customerName}
                      className="w-16 h-16 object-cover rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{testimonial.customerName}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Order: {testimonial.sortOrder}</span>
                      <span className={`text-xs px-2 py-1 rounded ${testimonial.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {testimonial.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => {
                        setEditingTestimonial(testimonial);
                        setShowTestimonialModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-[#004D8B] hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTestimonial(testimonial.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Partner Logos Tab */}
      {activeTab === 'logos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Manage partner and brand logos displayed on the homepage
            </p>
            <button
              onClick={() => {
                setEditingLogo({
                  id: '',
                  name: '',
                  logo: '',
                  website: '',
                  sortOrder: logos.length,
                  isActive: true,
                });
                setShowLogoModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Logo
            </button>
          </div>

          {logos.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">No Partner Logos</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add partner or brand logos to showcase trusted partnerships
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {logos.map((logo) => (
                <div key={logo.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-end gap-2 mb-2">
                    <button
                      onClick={() => {
                        setEditingLogo(logo);
                        setShowLogoModal(true);
                      }}
                      className="p-1.5 text-gray-600 hover:text-[#004D8B] hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteLogo(logo.id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="h-20 flex items-center justify-center mb-3 bg-gray-50 rounded">
                    <img
                      src={logo.logo}
                      alt={logo.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-center truncate">{logo.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Order: {logo.sortOrder}</span>
                    <span className={`text-xs px-2 py-1 rounded ${logo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {logo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slide Modal */}
      {showSlideModal && editingSlide && (
        <SlideModal
          slide={editingSlide}
          onSave={saveSlide}
          onClose={() => {
            setShowSlideModal(false);
            setEditingSlide(null);
          }}
        />
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && editingTestimonial && (
        <TestimonialModal
          testimonial={editingTestimonial}
          onSave={saveTestimonial}
          onClose={() => {
            setShowTestimonialModal(false);
            setEditingTestimonial(null);
          }}
        />
      )}

      {/* Logo Modal */}
      {showLogoModal && editingLogo && (
        <LogoModal
          logo={editingLogo}
          onSave={saveLogo}
          onClose={() => {
            setShowLogoModal(false);
            setEditingLogo(null);
          }}
        />
      )}
    </div>
  );
}

// Slide Modal Component
function SlideModal({
  slide,
  onSave,
  onClose,
}: {
  slide: Partial<HeroSlide>;
  onSave: (slide: Partial<HeroSlide>) => void;
  onClose: () => void;
}) {
  useEscapeKey(onClose, true);
  const [formData, setFormData] = useState(slide);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {slide.id ? 'Edit Hero Slide' : 'Add Hero Slide'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="Close slide form">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag (Optional)</label>
            <input
              type="text"
              value={formData.tag || ''}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              placeholder="e.g., GRINDING SOLUTIONS"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., The first hand-held linear grinder"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle/Tagline (Optional)</label>
            <textarea
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g., The All-in-One Solution for Flat Surface Finishing"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
            <input
              type="text"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="/images/slides/slide-1.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              required
            />
            {formData.image && (
              <img src={formData.image} alt="Preview" className="mt-2 h-32 object-cover rounded" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text (Optional)</label>
              <input
                type="text"
                value={formData.ctaText || ''}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="Learn More"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link (Optional)</label>
              <input
                type="text"
                value={formData.ctaLink || ''}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                placeholder="/products"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.accentColor || '#bb0c15'}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor || '#bb0c15'}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder || 0}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active</label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                />
                <span className="text-sm text-gray-700">Show on homepage</span>
              </label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Slide
          </button>
        </div>
      </div>
    </div>
  );
}

// Testimonial Modal Component
function TestimonialModal({
  testimonial,
  onSave,
  onClose,
}: {
  testimonial: Partial<Testimonial>;
  onSave: (testimonial: Partial<Testimonial>) => void;
  onClose: () => void;
}) {
  useEscapeKey(onClose, true);
  const [formData, setFormData] = useState(testimonial);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {testimonial.id ? 'Edit Testimonial' : 'Add Testimonial'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="Close testimonial form">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
              <input
                type="text"
                value={formData.customerName || ''}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Ahmad Khalil"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Production Manager"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
            <input
              type="text"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Beirut Steel Works"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial *</label>
            <textarea
              value={formData.quote || ''}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder="Share the customer's feedback..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
            <input
              type="text"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="/customer-avatar.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={formData.rating || 5}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder || 0}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active</label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                />
                <span className="text-sm text-gray-700">Show</span>
              </label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Testimonial
          </button>
        </div>
      </div>
    </div>
  );
}

// Logo Modal Component
function LogoModal({
  logo,
  onSave,
  onClose,
}: {
  logo: Partial<PartnerLogo>;
  onSave: (logo: Partial<PartnerLogo>) => void;
  onClose: () => void;
}) {
  useEscapeKey(onClose, true);
  const [formData, setFormData] = useState(logo);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {logo.id ? 'Edit Partner Logo' : 'Add Partner Logo'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="Close logo form">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Partner Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Hermes"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL *</label>
            <input
              type="text"
              value={formData.logo || ''}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="/images/logos/brands/logo-hermes.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              required
            />
            {formData.logo && (
              <div className="mt-2 h-24 bg-gray-50 rounded flex items-center justify-center">
                <img src={formData.logo} alt="Preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder || 0}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D8B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active</label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-[#004D8B] border-gray-300 rounded focus:ring-[#004D8B]"
                />
                <span className="text-sm text-gray-700">Show on homepage</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#004D8B] text-white rounded-lg hover:bg-[#003a6a] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Logo
          </button>
        </div>
      </div>
    </div>
  );
}
