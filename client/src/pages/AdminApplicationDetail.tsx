import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { auth } from '@/lib/firebase';

type AppData = {
  uid: string;
  companyName: string;
  city?: string;
  nationalId?: string;
  idCardImageUrl?: string;
  extraDocs?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: number;
  notes?: string;
};

export default function AdminApplicationDetail() {
  const params = useParams<{ uid: string }>();
  const uid = params?.uid;
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    async function load() {
      if (!uid) return;
      setLoading(true);
      setError(null);
      try {
        const fbUser = auth.currentUser;
        if (!fbUser) throw new Error('Not authenticated');
        const idToken = await fbUser.getIdToken(true);
        const res = await fetch(`/api/admin/applications/${uid}`, {
          headers: { Authorization: `Bearer ${idToken}` },
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid]);

  async function approve() {
    if (!uid) return;
    setSubmitting('approve');
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('Not authenticated');
      const idToken = await fbUser.getIdToken(true);
      const res = await fetch(`/api/admin/applications/${uid}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        credentials: 'include',
        body: JSON.stringify({ companyName: data?.companyName || '' })
      });
      if (!res.ok) throw new Error(`Approve failed: ${res.status}`);
      setData(d => d ? { ...d, status: 'approved' } : d);
      alert('Approved');
    } catch (e: any) {
      alert(e.message || 'Approval failed');
    } finally {
      setSubmitting(null);
    }
  }

  async function reject() {
    if (!uid || !reason.trim()) return;
    setSubmitting('reject');
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('Not authenticated');
      const idToken = await fbUser.getIdToken(true);
      const res = await fetch(`/api/admin/applications/${uid}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error(`Reject failed: ${res.status}`);
      setData(d => d ? { ...d, status: 'rejected', notes: reason } : d);
      alert('Rejected');
    } catch (e: any) {
      alert(e.message || 'Rejection failed');
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Application Detail</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><b>UID:</b> {data.uid}</div>
          <div><b>Company:</b> {data.companyName}</div>
          <div><b>City:</b> {data.city || '-'}</div>
          <div><b>Status:</b> <span className="uppercase">{data.status}</span></div>
          {data.createdAt && <div><b>Created:</b> {new Date(data.createdAt).toLocaleString()}</div>}
          {data.notes && <div><b>Notes:</b> {data.notes}</div>}
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">ID Card</div>
            {data.idCardImageUrl ? (
              <img src={data.idCardImageUrl} className="max-w-full rounded border" />
            ) : <i>No ID image</i>}
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Extra Docs</div>
            <div className="grid grid-cols-3 gap-2">
              {(data.extraDocs || []).map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} className="w-full h-24 object-cover rounded border" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data.status === 'pending' && (
        <div className="flex items-center gap-3 pt-4">
          <button disabled={submitting !== null} onClick={approve} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50">
            {submitting === 'approve' ? 'Approving…' : 'Approve'}
          </button>
          <input className="border rounded px-3 py-2 min-w-[240px]" placeholder="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button disabled={submitting !== null} onClick={reject} className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50">
            {submitting === 'reject' ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
}


