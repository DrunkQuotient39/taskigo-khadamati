import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowLeft, Building2, MapPin, Phone, FileText, Image as ImageIcon } from 'lucide-react';

interface ApplicationData {
  uid: string;
  companyName: string;
  nationalId: string;
  idCardImageUrl: string;
  extraDocs: string[];
  city: string;
  businessType: string;
  phone?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number;
  reviewerUid?: string;
  reason?: string;
}

export default function AdminApplicationDetail() {
  const params = useParams<{ uid: string }>();
  const uid = params?.uid;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const role = user?.role;
  const { toast } = useToast();
  
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!uid) return;
    
    const fetchApplication = async () => {
      try {
        setLoading(true);
        // Wait for Firebase user to exist to avoid 401 during token churn
        let fbUser = auth.currentUser;
        const started = Date.now();
        while (!fbUser && Date.now() - started < 2500) {
          await new Promise(r => setTimeout(r, 100));
          fbUser = auth.currentUser;
        }
        const idToken = await fbUser?.getIdToken(true);
        const res = await fetch(`/api/admin/applications/${uid}`, {
          headers: {
            Authorization: idToken ? `Bearer ${idToken}` : ''
          },
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setApplication(data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load application',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [uid, toast]);

  const handleApprove = async () => {
    if (!uid) return;
    
    try {
      setSubmitting('approve');
      const idToken = await auth.currentUser?.getIdToken(true);
      const res = await fetch(`/api/admin/applications/${uid}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: idToken ? `Bearer ${idToken}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({ approved: true })
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      
      toast({
        title: 'Success',
        description: 'Provider application approved successfully'
      });
      
      // Refresh application data
      const refresh = await fetch(`/api/admin/applications/${uid}`, {
        headers: { Authorization: idToken ? `Bearer ${idToken}` : '' },
        credentials: 'include'
      });
      setApplication(await refresh.json());
      
      // Navigate back to pending approvals
      setLocation('/admin?tab=pending');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve application',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleReject = async () => {
    if (!uid) return;
    
    try {
      setSubmitting('reject');
      const idToken = await auth.currentUser?.getIdToken(true);
      const res = await fetch(`/api/admin/applications/${uid}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: idToken ? `Bearer ${idToken}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason })
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      
      toast({
        title: 'Success',
        description: 'Provider application rejected successfully'
      });
      
      // Refresh application data
      const refresh = await fetch(`/api/admin/applications/${uid}`, {
        headers: { Authorization: idToken ? `Bearer ${idToken}` : '' },
        credentials: 'include'
      });
      setApplication(await refresh.json());
      
      // Navigate back to pending approvals
      setLocation('/admin?tab=pending');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject application',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-khadamati-dark mx-auto"></div>
            <p className="mt-4 text-khadamati-gray">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-khadamati-gray">Application not found</p>
            <Button onClick={() => setLocation('/admin')} className="mt-4">
              Back to Admin Panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/admin?tab=pending')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pending Approvals
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-khadamati-dark">
                Provider Application
              </h1>
              <p className="text-khadamati-gray mt-2">
                Review application details and make a decision
              </p>
            </div>
            {getStatusBadge(application.status)}
          </div>
        </div>

        {/* Application Details */}
        <div className="grid gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Company Name</label>
                  <p className="text-lg font-semibold">{application.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Type</label>
                  <p className="text-lg">{application.businessType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">City</label>
                  <p className="text-lg">{application.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-lg">{application.phone || 'Not provided'}</p>
                </div>
              </div>
              
              {application.address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-lg">{application.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Identity Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600">National ID</label>
                <p className="text-lg font-mono bg-gray-100 p-2 rounded">{application.nationalId}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">ID Card Image</label>
                <div className="border rounded-lg overflow-hidden max-w-md">
                  <img
                    src={application.idCardImageUrl}
                    alt="ID Card"
                    className="w-full h-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Documents */}
          {application.extraDocs && application.extraDocs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Additional Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {application.extraDocs.map((docUrl, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img
                        src={docUrl}
                        alt={`Document ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-sm text-gray-600">
                      {new Date(application.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {application.reviewedAt && (
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      application.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">
                        Application {application.status === 'approved' ? 'Approved' : 'Rejected'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(application.reviewedAt).toLocaleString()}
                      </p>
                      {application.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          Reason: {application.reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {application.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Review Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={submitting === 'approve'}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {submitting === 'approve' ? 'Approving...' : 'Approve Application'}
                  </Button>
                  
                  <Button
                    onClick={handleReject}
                    disabled={submitting === 'reject'}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {submitting === 'reject' ? 'Rejecting...' : 'Reject Application'}
                  </Button>
                </div>
                
                {submitting === 'reject' && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">
                      Reason for Rejection (Optional)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Provide a reason for rejection..."
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


