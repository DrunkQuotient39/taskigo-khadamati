import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
    
    if (!formData.agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    try {
      // Redirect to Replit Auth with provider role
      const authUrl = `/api/login?role=provider&redirect=/provider-dashboard`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Provider registration error:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
                      <Label>Professional Credentials (Optional)</Label>
                      <div className="space-y-3">
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
                      disabled={!formData.agreedToTerms}
                      data-testid="button-submit"
                    >
                      Register as Provider
                      <ArrowRight className="ml-2 w-5 h-5" />
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
                  <h3 className="text-xl font-bold mb-4">Why Join Taskego?</h3>
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