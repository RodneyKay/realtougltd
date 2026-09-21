import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldQuestion, FileCheck } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import { fetchLatestKycSubmission, submitKyc, PortalKyc } from '../lib/portalApi';
import { portalInputClass, portalLabelClass } from '../components/PortalModal';

const kycDisplay: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  not_submitted: { label: 'Not submitted', icon: ShieldQuestion, className: 'bg-gray-100 text-gray-600' },
  pending: { label: 'Pending review', icon: ShieldAlert, className: 'bg-amber-100 text-amber-700' },
  under_review: { label: 'Under review', icon: ShieldAlert, className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Verified', icon: ShieldCheck, className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', icon: ShieldAlert, className: 'bg-red-100 text-red-700' },
};

export const PortalVerification: React.FC = () => {
  const { agency, profile, role } = usePortalAuth();
  const [submission, setSubmission] = useState<PortalKyc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [regNumber, setRegNumber] = useState('');
  const [tin, setTin] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [idUrl, setIdUrl] = useState('');
  const [addressUrl, setAddressUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!agency) return;
    fetchLatestKycSubmission(agency.id)
      .then(setSubmission)
      .finally(() => setLoading(false));
  }, [agency]);

  if (!agency) return null;
  const kyc = kycDisplay[agency.kyc_status] ?? kycDisplay.not_submitted;
  const KycIcon = kyc.icon;
  const isOwner = role === 'owner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!regNumber || !certUrl || !idUrl) {
      setError('Business registration number, registration certificate, and owner ID document are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await submitKyc({
        agencyId: agency.id,
        submittedBy: profile.id,
        businessRegistrationNumber: regNumber,
        tinNumber: tin,
        registrationCertificateUrl: certUrl,
        ownerIdDocumentUrl: idUrl,
        proofOfAddressUrl: addressUrl,
        additionalNotes: notes,
      });
      setSubmission(result);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit verification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Verification</h1>
        <p className="text-xs text-gray-500 mt-1">
          Submit your business registration and title-deed documentation to unlock the verified badge.
        </p>
      </div>

      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${kyc.className}`}>
        <KycIcon className="w-4 h-4" />
        <span className="text-xs font-bold">Current status: {kyc.label}</span>
      </div>

      {loading ? (
        <div className="text-xs text-gray-400 animate-pulse">Loading…</div>
      ) : submission ? (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-black text-gray-900">Latest Submission</h2>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-gray-400">Registration No.</dt>
              <dd className="font-bold text-gray-800">{submission.business_registration_number}</dd>
            </div>
            <div>
              <dt className="text-gray-400">TIN</dt>
              <dd className="font-bold text-gray-800">{submission.tin_number || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Submitted</dt>
              <dd className="font-bold text-gray-800">{new Date(submission.created_at).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Status</dt>
              <dd className="font-bold text-gray-800 capitalize">{submission.status.replace('_', ' ')}</dd>
            </div>
          </dl>
          {submission.rejection_reason && (
            <p className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">{submission.rejection_reason}</p>
          )}
        </div>
      ) : !isOwner ? (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs text-xs text-gray-500">
          Only the agency owner can submit verification documents. Ask them to complete this step.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs space-y-3">
          <div className="space-y-1">
            <label className={portalLabelClass}>Business Registration Number</label>
            <input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className={portalInputClass} required />
          </div>
          <div className="space-y-1">
            <label className={portalLabelClass}>TIN Number (optional)</label>
            <input value={tin} onChange={(e) => setTin(e.target.value)} className={portalInputClass} />
          </div>
          <div className="space-y-1">
            <label className={portalLabelClass}>Registration Certificate URL</label>
            <input value={certUrl} onChange={(e) => setCertUrl(e.target.value)} className={portalInputClass} placeholder="https://…" required />
          </div>
          <div className="space-y-1">
            <label className={portalLabelClass}>Owner ID Document URL</label>
            <input value={idUrl} onChange={(e) => setIdUrl(e.target.value)} className={portalInputClass} placeholder="https://…" required />
          </div>
          <div className="space-y-1">
            <label className={portalLabelClass}>Proof of Address URL (optional)</label>
            <input value={addressUrl} onChange={(e) => setAddressUrl(e.target.value)} className={portalInputClass} placeholder="https://…" />
          </div>
          <div className="space-y-1">
            <label className={portalLabelClass}>Notes for our review team (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={portalInputClass} />
          </div>

          <p className="text-[11px] text-gray-400">
            Document upload isn't wired up yet — paste a link to each document for now (e.g. a shared Drive link).
          </p>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          {success && <p className="text-xs text-emerald-600 font-medium">Submitted — our team will review within 2 business days.</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
          >
            {saving ? 'Submitting…' : 'Submit for Review'}
          </button>
        </form>
      )}
    </div>
  );
};
