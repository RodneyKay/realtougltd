import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Eye, Heart, Building2, Lock, Pencil, ImageOff } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import {
  fetchAgencyListingsFull,
  createListing,
  updateListing,
  updateListingStatus,
  deleteListing,
  PortalListing,
} from '../lib/portalApi';
import { PortalModal, portalInputClass, portalLabelClass } from '../components/PortalModal';
import { PhotoUploader } from '../components/PhotoUploader';
import { useAgencyPlan } from '../hooks/useAgencyPlan';
import { UsageChip, FormError } from '../components/PlanUsage';
import type { ListingStatus, PropertyCategory } from '../../lib/database.types';

const categories: PropertyCategory[] = ['For Sale', 'For Rent', 'Commercial', 'Short-Stay'];
const statuses: ListingStatus[] = ['draft', 'pending', 'active', 'sold', 'rented', 'archived'];

const statusPill: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  draft: 'bg-gray-100 text-gray-600',
  sold: 'bg-gray-900 text-white',
  rented: 'bg-gray-900 text-white',
  archived: 'bg-gray-100 text-gray-400',
};

interface ListingFormState {
  title: string;
  description: string;
  price: string;
  currency: 'UGX' | 'USD';
  location: string;
  category: PropertyCategory;
  type: string;
  bedrooms: string;
  bathrooms: string;
  areaSqft: string;
  images: string[];
}

const emptyForm: ListingFormState = {
  title: '',
  description: '',
  price: '',
  currency: 'UGX',
  location: '',
  category: 'For Sale',
  type: 'Apartment',
  bedrooms: '',
  bathrooms: '',
  areaSqft: '',
  images: [],
};

const toForm = (l: PortalListing): ListingFormState => ({
  title: l.title,
  description: l.description ?? '',
  price: String(l.price),
  currency: l.currency === 'USD' ? 'USD' : 'UGX',
  location: l.location,
  category: l.category,
  type: l.type,
  bedrooms: l.bedrooms != null ? String(l.bedrooms) : '',
  bathrooms: l.bathrooms != null ? String(l.bathrooms) : '',
  areaSqft: l.area_sqft != null ? String(l.area_sqft) : '',
  images: l.images ?? [],
});

const money = (l: Pick<PortalListing, 'price' | 'currency'>) =>
  `${l.currency === 'USD' ? '$' : 'UGX '}${l.price.toLocaleString('en-US')}`;

export const PortalListings: React.FC = () => {
  const { agency, profile } = usePortalAuth();
  const [listings, setListings] = useState<PortalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortalListing | null>(null);
  const [form, setForm] = useState<ListingFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const { overview, refresh: refreshPlan } = useAgencyPlan(agency?.id);

  const canPublish = agency?.kyc_status === 'approved';
  const [searchParams, setSearchParams] = useSearchParams();
  const photoEnt = overview?.entitlements?.max_photos_per_listing;
  const photoMax = photoEnt && !photoEnt.unlimited ? photoEnt.max ?? 0 : null;

  const load = () => {
    if (!agency) return;
    setLoading(true);
    fetchAgencyListingsFull(agency.id)
      .then(setListings)
      .finally(() => setLoading(false));
  };

  useEffect(load, [agency]);

  // Sidebar "Add property" link: /portal/listings?new=1
  useEffect(() => {
    if (searchParams.get('new') !== '1' || !agency) return;
    setSearchParams({}, { replace: true });
    if (canPublish) {
      setEditing(null);
      setForm(emptyForm);
      setFormError(null);
      setShowForm(true);
    } else {
      setPageError('Your verification must be approved before you can add listings.');
    }
  }, [searchParams, canPublish, agency]);

  const set = <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (l: PortalListing) => {
    setEditing(l);
    setForm(toForm(l));
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !profile) return;
    if (!form.title || !form.price || !form.location) {
      setFormError('Title, price, and location are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const shared = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        currency: form.currency,
        location: form.location,
        category: form.category,
        type: form.type,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
        images: form.images,
      };
      if (editing) {
        await updateListing(editing.id, shared);
      } else {
        await createListing({ ...shared, agencyId: agency.id, agentId: profile.id });
      }
      closeForm();
      load();
      refreshPlan();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save listing.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (l: PortalListing, status: ListingStatus) => {
    setPageError(null);
    if (status === 'active' && (l.images?.length ?? 0) === 0) {
      setPageError('Add at least one photo before publishing this listing. Use the pencil icon to edit it.');
      load();
      return;
    }
    try {
      await updateListingStatus(l.id, status);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Could not update this listing.');
    }
    load();
    refreshPlan();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setPageError(null);
    try {
      await deleteListing(id);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Could not delete this listing.');
    }
    load();
    refreshPlan();
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Listings</h1>
          <p className="text-xs text-gray-500 mt-1">Create and manage {agency?.name}'s property listings.</p>
          <div className="mt-2">
            <UsageChip overview={overview} limit="max_properties" noun="active listings" />
          </div>
        </div>
        <button
          onClick={() => (canPublish ? openCreate() : null)}
          disabled={!canPublish}
          title={canPublish ? undefined : 'Verification must be approved before you can publish listings'}
          className="flex items-center gap-1.5 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-md transition-colors cursor-pointer"
        >
          {canPublish ? <Plus className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          Add Listing
        </button>
      </div>

      <FormError message={pageError} />

      {!canPublish && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-800">
            You need an approved verification before publishing listings tied to your agency. Head to the
            Verification tab to submit your documents.
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="px-5 py-10 text-center text-xs text-gray-400 animate-pulse">Loading listings…</div>
        ) : listings.length === 0 ? (
          <div className="px-5 py-14 text-center space-y-2">
            <Building2 className="w-6 h-6 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-400">No listings yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3">Listing</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Performance</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map((l) => {
                  const cover = l.images?.[0];
                  return (
                    <tr key={l.id} className="text-xs">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 max-w-[280px]">
                          {cover ? (
                            <img
                              src={cover}
                              alt=""
                              className="w-11 h-11 rounded-md object-cover bg-gray-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-md bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center shrink-0">
                              <ImageOff className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate">{l.title}</p>
                            <p className="text-[11px] text-gray-400 truncate">
                              {(l.images?.length ?? 0) === 0 ? (
                                <span className="text-amber-600 font-medium">No photos yet</span>
                              ) : (
                                `${l.images!.length} photo${l.images!.length === 1 ? '' : 's'}`
                              )}
                              {' · '}
                              {l.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{l.category}</td>
                      <td className="px-5 py-3 text-gray-500 tabular-nums whitespace-nowrap">{money(l)}</td>
                      <td className="px-5 py-3 text-gray-400">
                        <span className="inline-flex items-center gap-1 mr-3">
                          <Eye className="w-3 h-3" /> {l.view_count ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {l.save_count ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={l.status ?? 'draft'}
                          onChange={(e) => handleStatusChange(l, e.target.value as ListingStatus)}
                          className={`text-[10px] font-bold capitalize rounded-full px-2 py-1 border-0 cursor-pointer ${statusPill[l.status ?? 'draft']}`}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(l)}
                          title="Edit listing"
                          className="text-gray-300 hover:text-gray-800 transition-colors cursor-pointer mr-3"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id)}
                          title="Delete listing"
                          className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && profile && (
        <PortalModal title={editing ? 'Edit Listing' : 'Add Listing'} onClose={closeForm} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <PhotoUploader userId={profile.id} images={form.images} onChange={(images) => set('images', images)} max={photoMax} />

            <div className="space-y-1">
              <label className={portalLabelClass}>Title</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} className={portalInputClass} required />
            </div>
            <div className="space-y-1">
              <label className={portalLabelClass}>Description</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={portalInputClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr_1fr] gap-3">
              <div className="space-y-1">
                <label className={portalLabelClass}>Currency</label>
                <select value={form.currency} onChange={(e) => set('currency', e.target.value as 'UGX' | 'USD')} className={portalInputClass}>
                  <option value="UGX">UGX</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={portalLabelClass}>Price</label>
                <input type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} className={portalInputClass} required />
              </div>
              <div className="space-y-1">
                <label className={portalLabelClass}>Location</label>
                <input value={form.location} onChange={(e) => set('location', e.target.value)} className={portalInputClass} placeholder="Kololo, Kampala" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={portalLabelClass}>Category</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value as PropertyCategory)} className={portalInputClass}>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={portalLabelClass}>Type</label>
                <input value={form.type} onChange={(e) => set('type', e.target.value)} className={portalInputClass} placeholder="Apartment, House…" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className={portalLabelClass}>Bedrooms</label>
                <input type="number" min="0" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} className={portalInputClass} />
              </div>
              <div className="space-y-1">
                <label className={portalLabelClass}>Bathrooms</label>
                <input type="number" min="0" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} className={portalInputClass} />
              </div>
              <div className="space-y-1">
                <label className={portalLabelClass}>Area (sqm)</label>
                <input type="number" min="0" value={form.areaSqft} onChange={(e) => set('areaSqft', e.target.value)} className={portalInputClass} />
              </div>
            </div>

            <FormError message={formError} />

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create Listing (as Draft)'}
            </button>
            {!editing && (
              <p className="text-[11px] text-gray-400 text-center">
                New listings start as drafts. Add at least one photo, then publish from the status menu.
              </p>
            )}
          </form>
        </PortalModal>
      )}
    </div>
  );
};
