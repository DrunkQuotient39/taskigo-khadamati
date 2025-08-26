import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Clock,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/common/ScrollReveal';

interface ProviderSignUpProps {
  messages: any;
}

export default function ProviderSignUp({ messages }: ProviderSignUpProps) {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    // Only check auth after Firebase has finished loading
    if (!authLoading && user === null) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to continue with provider registration',
        variant: 'destructive'
      });
      setLocation('/login?redirect=/provider-signup');
    }
  }, [user, authLoading, setLocation, toast]);
  
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessAddress: '',
    serviceCategory: '',
    experience: '',
    description: '',
    hasLicense: false,
    hasInsurance: false,
    agreedToTerms: false
  });

  const [idCardPreviews, setIdCardPreviews] = useState<string[]>([]);
  const [certPreview, setCertPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceCategories = [
    { id: 'cleaning', name: 'Cleaning Services', icon: '🧹' },
    { id: 'plumbing', name: 'Plumbing & Repairs', icon: '🔧' },
    { id: 'electrical', name: 'Electrical Services', icon: '⚡' },
    { id: 'delivery', name: 'Delivery & Logistics', icon: '🚚' },
    { id: 'maintenance', name: 'Home Maintenance', icon: '🏠' },
    { id: 'gardening', name: 'Gardening & Landscaping', icon: '🌱' },
    { id: 'beauty', name: 'Beauty & Wellness', icon: '💄' },
    { id: 'tutoring', name: 'Education & Tutoring', icon: '📚' },
    { id: 'tech', name: 'Tech Support', icon: '💻' },
    { id: 'other', name: 'Other Services', icon: '⚙️' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    // Validate terms agreement
    if (!formData.agreedToTerms) {
      toast({ 
        title: 'Terms Required', 
        description: 'Please agree to the terms and conditions to proceed',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = [
      { key: 'businessName', name: 'Business Name' },
      { key: 'ownerName', name: 'Owner Name' },
      { key: 'email', name: 'Email Address' },
      { key: 'phone', name: 'Phone Number' },
      { key: 'businessAddress', name: 'Business Address' },
      { key: 'serviceCategory', name: 'Service Category' },
      { key: 'description', name: 'Business Description' }
    ];
    
    // Log validation info
    console.log('Validating form fields');
    console.log('Form data keys:', Object.keys(formData));
    console.log('Form data values:', Object.values(formData));
    
    const missingFields = requiredFields.filter(field => {
      const value = formData[field.key as keyof typeof formData];
      const isEmpty = value === undefined || value === null || value === '';
      if (isEmpty) {
        console.log(`Missing field: ${field.key}`);
      }
      return isEmpty;
    });
    
    if (missingFields.length > 0) {
      console.log('Validation failed - missing fields:', missingFields);
      toast({ 
        title: 'Missing Required Fields', 
        description: `Please complete the following: ${missingFields.map(f => f.name).join(', ')}`,
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }
    
    console.log('Form validation passed');
    
    // Validate ID card and certification uploads
    console.log('Checking file uploads');
    console.log('ID card previews count:', idCardPreviews.length);
    console.log('Certification preview available:', !!certPreview);
    
    if (idCardPreviews.length === 0) {
      console.log('ID card validation failed');
      toast({ 
        title: 'ID Card Required', 
        description: 'Please upload a copy of your government ID card',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }
    
    if (!certPreview) {
      console.log('Certification validation failed');
      toast({ 
        title: 'Certification Required', 
        description: 'Please upload your business certification (Tarkhis)',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }
    
    console.log('File upload validation passed');

    if (!user) {
      toast({ title: 'Login required', description: 'Please log in before submitting your application.' });
      setLocation('/login');
      return;
    }

    try {
      // Debug logging
      console.log('Starting provider application submission');
      console.log('Form data:', { ...formData, idCardPreviewsCount: idCardPreviews.length, certPreview: !!certPreview });
      
      if (!user) {
        throw new Error('You must be logged in to submit a provider application');
      }
      
      const fbUser = auth.currentUser;
      if (!fbUser) {
        throw new Error('Firebase user not found');
      }
      
      console.log('Getting Firebase ID token');
      const idToken = await fbUser.getIdToken(true);
      console.log('ID token obtained');
      
      // Create a simplified payload for logging (without large image data)
      const logPayload = {
        businessName: formData.businessName,
        city: formData.businessAddress,
        businessType: formData.serviceCategory,
        idCardCount: idCardPreviews.length,
        hasCert: !!certPreview,
        hasDescription: !!formData.description
      };
      console.log('Payload prepared:', logPayload);
      
      // Create the actual payload
      // Create document array with ID card images
      const businessDocs = [];
      
      // Add ID card images
      idCardPreviews.forEach((preview, index) => {
        // Check file size
        const sizeKB = Math.round(preview.length / 1024);
        console.log(`ID card ${index + 1} size: ${sizeKB}KB`);
        
        if (sizeKB > 1000) {
          throw new Error(`ID card image ${index + 1} is too large (${sizeKB}KB). Please use a smaller image.`);
        }
        
        businessDocs.push({
          type: 'id_card',
          dataUrl: preview,
          side: index === 0 ? 'front' : 'back'
        });
      });
      
      // Add certification
      if (certPreview) {
        // Check file size
        const sizeKB = Math.round(certPreview.length / 1024);
        console.log(`Certification size: ${sizeKB}KB`);
        
        if (sizeKB > 1000) {
          throw new Error(`Certification image is too large (${sizeKB}KB). Please use a smaller image.`);
        }
        
        businessDocs.push({
          type: 'certification',
          dataUrl: certPreview
        });
      }
      
      // Add description
      if (formData.description) {
        businessDocs.push({
          type: 'description',
          text: formData.description
        });
      }
      
      const payload = {
        businessName: formData.businessName,
        city: formData.businessAddress,
        businessType: formData.serviceCategory,
        licenseNumber: formData.hasLicense ? 'DECLARED' : null,
        insuranceInfo: formData.hasInsurance ? { declared: true } : {},
        businessDocs,
      } as any;
      
      // Calculate total payload size
      const payloadSize = JSON.stringify(payload).length / 1024 / 1024;
      console.log(`Total payload size: ${payloadSize.toFixed(2)}MB`);
      
      if (payloadSize > 10) {
        throw new Error(`Payload is too large (${payloadSize.toFixed(2)}MB). Please use smaller images.`);
      }

      console.log('Sending API request');
      
      // Try to use a mock response for testing if in development mode
      let res;
      if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
        try {
          // First try the real API with force=true to override existing provider profile
          res = await fetch('/api/providers/apply?force=true', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
          });
          
          // If the API fails, use a mock response for testing
          if (!res.ok && res.status >= 500) {
            console.log('API error, using mock response for testing');
            // Create a mock successful response
            res = new Response(JSON.stringify({
              message: 'Provider application submitted successfully (MOCK)',
              provider: {
                id: 999,
                businessName: formData.businessName,
                approvalStatus: 'pending',
                city: formData.businessAddress
              }
            }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } catch (fetchError) {
          console.error('Fetch error, using mock response:', fetchError);
          // Create a mock successful response
          res = new Response(JSON.stringify({
            message: 'Provider application submitted successfully (MOCK)',
            provider: {
              id: 999,
              businessName: formData.businessName,
              approvalStatus: 'pending',
              city: formData.businessAddress
            }
          }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else {
        // Normal API call for production with explicit force=true parameter
        res = await fetch('/api/providers/apply?force=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
        });
      }
      
      console.log('API response received', { status: res.status, ok: res.ok });

      if (!res.ok) {
        let errorMsg = 'Failed to submit application';
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
          console.error('API error response:', errorData);
          
          // Special handling for specific error cases
          if (errorMsg === 'You already have a pending application. Please wait for admin review.') {
            // Redirect to pending approval page for existing applications
            toast({ 
              title: 'Application Already Submitted', 
              description: 'You already have a pending application under review.' 
            });
            
            setTimeout(() => {
              window.location.href = '/pending-approval';
            }, 1500);
            return; // Exit early
          }
          
          if (errorMsg === 'You are already an approved provider') {
            // Redirect to provider dashboard for approved providers
            toast({ 
              title: 'Already Approved', 
              description: 'You are already an approved provider.' 
            });
            
            setTimeout(() => {
              window.location.href = '/provider-dashboard';
            }, 1500);
            return; // Exit early
          }
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
        }
        throw new Error(errorMsg);
      }

      // Success handling
      console.log('Application submitted successfully');
      toast({ 
        title: 'Application submitted', 
        description: 'Your provider application has been sent for review.' 
      });
      
      // Use a timeout to ensure the toast is shown before redirecting
      // Also force reset the submission state to fix any stuck loading state
      setIsSubmitting(false);
      setTimeout(() => {
        window.location.href = '/pending-approval';
      }, 1500);
    } catch (error: any) {
      console.error('Provider registration error:', error);
      toast({ 
        title: 'Submission failed', 
        description: error.message || 'Please try again later.', 
        variant: 'destructive' 
      });
    } finally {
      // Reset submission state after a small delay to ensure UI updates properly
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-yellow-600 rounded-full mb-6"
            >
              <Building2 className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join as a Service Provider
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Register your business on Taskego and start connecting with customers today
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Business Information</CardTitle>
                  <CardDescription>
                    Tell us about your business to get started
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Business Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          placeholder="Your business name"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          required
                          data-testid="input-business-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerName">Owner Name *</Label>
                        <Input
                          id="ownerName"
                          placeholder="Your full name"
                          value={formData.ownerName}
                          onChange={(e) => handleInputChange('ownerName', e.target.value)}
                          required
                          data-testid="input-owner-name"
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          data-testid="input-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                          data-testid="input-phone"
                        />
                      </div>
                    </div>

                    {/* Business Address */}
                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">Business Address *</Label>
                      <Input
                        id="businessAddress"
                        placeholder="Your business address"
                        value={formData.businessAddress}
                        onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                        required
                        data-testid="input-address"
                      />
                    </div>

                    {/* Service Category */}
                    <div className="space-y-2">
                      <Label htmlFor="serviceCategory">Primary Service Category *</Label>
                      <Select 
                        value={formData.serviceCategory} 
                        onValueChange={(value) => handleInputChange('serviceCategory', value)}
                      >
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select your main service category" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center space-x-2">
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Select 
                        value={formData.experience} 
                        onValueChange={(value) => handleInputChange('experience', value)}
                      >
                        <SelectTrigger data-testid="select-experience">
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="6-10">6-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Business Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Business Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell us about your business, services offered, and what makes you unique..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        data-testid="textarea-description"
                      />
                    </div>

                    {/* Certifications */}
                    <div className="space-y-4">
                      <Label>Identity & Certifications</Label>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="idCard">Government ID Card (front & back sides)</Label>
                          <div className="text-sm text-gray-500 mb-2">Upload both sides of your ID card (up to 2 images)</div>
                          <Input 
                            id="idCard" 
                            type="file" 
                            accept="image/*,.pdf" 
                            multiple 
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length === 0) { 
                                setIdCardPreviews([]); 
                                return; 
                              }
                              
                              // Limit to 2 files
                              const filesToProcess = files.slice(0, 2);
                              
                              // Compress images before uploading
                              Promise.all(
                                filesToProcess.map(file => {
                                  return new Promise<string>((resolve) => {
                                    // Compress the image
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const img = new Image();
                                      img.onload = () => {
                                        // Create canvas for compression
                                        const canvas = document.createElement('canvas');
                                        // Set max dimensions (400px width or height)
                                        const MAX_SIZE = 400;
                                        let width = img.width;
                                        let height = img.height;
                                        
                                        // Calculate new dimensions while maintaining aspect ratio
                                        if (width > height) {
                                          if (width > MAX_SIZE) {
                                            height = Math.round(height * MAX_SIZE / width);
                                            width = MAX_SIZE;
                                          }
                                        } else {
                                          if (height > MAX_SIZE) {
                                            width = Math.round(width * MAX_SIZE / height);
                                            height = MAX_SIZE;
                                          }
                                        }
                                        
                                        // Resize the canvas
                                        canvas.width = width;
                                        canvas.height = height;
                                        
                                        // Draw and compress
                                        const ctx = canvas.getContext('2d');
                                        if (ctx) {
                                          ctx.drawImage(img, 0, 0, width, height);
                                          // Get compressed image as data URL (JPEG at 30% quality)
                                          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.3);
                                          resolve(compressedDataUrl);
                                        } else {
                                          // Fallback if canvas context fails
                                          resolve(event.target?.result as string);
                                        }
                                      };
                                      img.src = event.target?.result as string;
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                })
                              ).then(previews => {
                                console.log('Compressed image sizes:', previews.map(p => Math.round(p.length / 1024) + 'KB'));
                                setIdCardPreviews(previews);
                              });
                            }} 
                          />
                          {idCardPreviews.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {idCardPreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                  {preview.startsWith('data:image') ? (
                                    <img src={preview} alt={`ID preview ${index + 1}`} className="max-h-40 rounded border" />
                                  ) : (
                                    <Badge variant="secondary">File {index + 1} attached</Badge>
                                  )}
                                  <Badge className="absolute top-1 left-1 bg-blue-500">Side {index + 1}</Badge>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const newPreviews = [...idCardPreviews];
                                      newPreviews.splice(index, 1);
                                      setIdCardPreviews(newPreviews);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                    aria-label="Remove image"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cert">Certification (Tarkhis)</Label>
                          <Input id="cert" type="file" accept="image/*,.pdf" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) { setCertPreview(''); return; }
                            
                            // Compress the image
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              // Check if it's an image file
                              if (file.type.startsWith('image/')) {
                                const img = new Image();
                                img.onload = () => {
                                  // Create canvas for compression
                                  const canvas = document.createElement('canvas');
                                  // Set max dimensions (400px width or height)
                                  const MAX_SIZE = 400;
                                  let width = img.width;
                                  let height = img.height;
                                  
                                  // Calculate new dimensions while maintaining aspect ratio
                                  if (width > height) {
                                    if (width > MAX_SIZE) {
                                      height = Math.round(height * MAX_SIZE / width);
                                      width = MAX_SIZE;
                                    }
                                  } else {
                                    if (height > MAX_SIZE) {
                                      width = Math.round(width * MAX_SIZE / height);
                                      height = MAX_SIZE;
                                    }
                                  }
                                  
                                  // Resize the canvas
                                  canvas.width = width;
                                  canvas.height = height;
                                  
                                  // Draw and compress
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    ctx.drawImage(img, 0, 0, width, height);
                                    // Get compressed image as data URL (JPEG at 30% quality)
                                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.3);
                                    console.log('Compressed cert size:', Math.round(compressedDataUrl.length / 1024) + 'KB');
                                    setCertPreview(compressedDataUrl);
                                  } else {
                                    // Fallback if canvas context fails
                                    setCertPreview(event.target?.result as string);
                                  }
                                };
                                img.src = event.target?.result as string;
                              } else {
                                // Not an image, just use as is
                                setCertPreview(event.target?.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }} />
                          {certPreview && (
                            <div className="mt-2 relative">
                              {certPreview.startsWith('data:image') ? (
                                <img src={certPreview} alt="Certification preview" className="max-h-40 rounded border" />
                              ) : (
                                <Badge variant="secondary">File attached</Badge>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCertPreview('');
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                aria-label="Remove certification image"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasLicense"
                            checked={formData.hasLicense}
                            onCheckedChange={(checked) => handleInputChange('hasLicense', !!checked)}
                            data-testid="checkbox-license"
                          />
                          <Label htmlFor="hasLicense" className="text-sm">
                            I have relevant business licenses
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasInsurance"
                            checked={formData.hasInsurance}
                            onCheckedChange={(checked) => handleInputChange('hasInsurance', !!checked)}
                            data-testid="checkbox-insurance"
                          />
                          <Label htmlFor="hasInsurance" className="text-sm">
                            I have business insurance
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreedToTerms"
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreedToTerms', !!checked)}
                        required
                        data-testid="checkbox-terms"
                      />
                      <Label htmlFor="agreedToTerms" className="text-sm">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setLocation('/terms')}
                          className="text-blue-600 hover:underline"
                        >
                          Terms of Service
                        </button>
                        {' '}and Privacy Policy
                      </Label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                      disabled={!formData.agreedToTerms || isSubmitting}
                      data-testid="button-submit"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Register as Provider
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          {/* Benefits Sidebar */}
          <div className="space-y-6">
            <ScrollReveal delay={0.2}>
              <Card className="bg-gradient-to-br from-blue-600 to-yellow-600 text-white border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Why Join Taskigo?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5" />
                      <span className="text-sm">Access to 50,000+ potential customers</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5" />
                      <span className="text-sm">Secure payment processing</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">Flexible scheduling tools</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5" />
                      <span className="text-sm">Build your online reputation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Next Steps
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                      <span>Complete registration form</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded-full" />
                      <span>Admin review (24-48 hours)</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded-full" />
                      <span>Start adding your services</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded-full" />
                      <span>Begin accepting bookings</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}