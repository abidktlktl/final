import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Calendar, 
  Check, 
  X, 
  Star, 
  Crown, 
  Zap,
  Download,
  AlertCircle,
  ArrowRight,
  Plus,
  Minus,
  DollarSign
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    automations: number;
    accounts: number;
    templates: number;
    apiCalls: number;
  };
  popular?: boolean;
  icon: React.ReactNode;
}

interface BillingInfo {
  currentPlan: string;
  nextBilling: string;
  amount: number;
  status: 'active' | 'cancelled' | 'past_due';
  paymentMethod: {
    type: 'card' | 'paypal' | 'bank';
    last4: string;
    brand?: string;
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    downloadUrl: string;
  }>;
}

interface BillingPricingProps {
  onClose: () => void;
}

export const BillingPricing = ({ onClose }: BillingPricingProps) => {
  const [activeTab, setActiveTab] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    currentPlan: 'pro',
    nextBilling: '2024-02-15',
    amount: 29.99,
    status: 'active',
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa'
    },
    invoices: [
      {
        id: 'INV-001',
        date: '2024-01-15',
        amount: 29.99,
        status: 'paid',
        downloadUrl: '#'
      },
      {
        id: 'INV-002',
        date: '2023-12-15',
        amount: 29.99,
        status: 'paid',
        downloadUrl: '#'
      }
    ]
  });

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started with basic automation',
      price: 0,
      interval: 'month',
      features: [
        'Up to 5 automations',
        '1 Instagram account',
        'Basic templates',
        'Community support',
        'Mobile app access'
      ],
      limits: {
        automations: 5,
        accounts: 1,
        templates: 10,
        apiCalls: 1000
      },
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Most popular for content creators and small businesses',
      price: 29.99,
      interval: 'month',
      features: [
        'Unlimited automations',
        'Up to 3 Instagram accounts',
        'Advanced templates & replies',
        'Priority support',
        'Analytics dashboard',
        'Custom triggers',
        'Export/Import data'
      ],
      limits: {
        automations: -1, // unlimited
        accounts: 3,
        templates: -1,
        apiCalls: 10000
      },
      popular: true,
      icon: <Star className="w-6 h-6" />
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For agencies and growing businesses',
      price: 99.99,
      interval: 'month',
      features: [
        'Everything in Pro',
        'Up to 10 Instagram accounts',
        'Team collaboration',
        'White-label options',
        'Advanced analytics',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ],
      limits: {
        automations: -1,
        accounts: 10,
        templates: -1,
        apiCalls: 50000
      },
      icon: <Crown className="w-6 h-6" />
    }
  ];

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    toast({
      title: "Plan Selected",
      description: `You've selected the ${plans.find(p => p.id === planId)?.name} plan`,
    });
  };

  const handlePayment = () => {
    toast({
      title: "Payment Processing",
      description: "Redirecting to secure payment gateway...",
    });
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated",
      });
      setBillingInfo(prev => ({
        ...prev,
        currentPlan: selectedPlan,
        amount: plans.find(p => p.id === selectedPlan)?.price || 0
      }));
    }, 2000);
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription will remain active until the next billing date",
    });
    setBillingInfo(prev => ({
      ...prev,
      status: 'cancelled'
    }));
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Billing & Pricing</h2>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'plans' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('plans')}
          className="flex-1"
        >
          <Star className="w-4 h-4 mr-2" />
          Plans
        </Button>
        <Button
          variant={activeTab === 'billing' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('billing')}
          className="flex-1"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Billing
        </Button>
        <Button
          variant={activeTab === 'invoices' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('invoices')}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Invoices
        </Button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Current Plan Status */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-900">Current Plan</h3>
                  <p className="text-green-700">
                    {plans.find(p => p.id === billingInfo.currentPlan)?.name} - 
                    {formatPrice(billingInfo.amount)}/month
                  </p>
                  <p className="text-sm text-green-600">
                    Next billing: {new Date(billingInfo.nextBilling).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(billingInfo.status)}>
                  {billingInfo.status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''
                } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleUpgrade(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 rounded-full bg-gradient-instagram text-white">
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/{plan.interval}</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.id === billingInfo.currentPlan 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gradient-instagram'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plan.id === billingInfo.currentPlan) {
                        toast({
                          title: "Current Plan",
                          description: "This is your current subscription plan",
                        });
                      } else {
                        handleUpgrade(plan.id);
                      }
                    }}
                  >
                    {plan.id === billingInfo.currentPlan ? 'Current Plan' : 'Choose Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Plan Actions */}
          {selectedPlan !== billingInfo.currentPlan && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">Ready to Upgrade?</h3>
                    <p className="text-blue-700">
                      You've selected the {plans.find(p => p.id === selectedPlan)?.name} plan
                    </p>
                  </div>
                  <Button onClick={handlePayment} className="bg-blue-600 hover:bg-blue-700">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continue to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {billingInfo.paymentMethod.brand?.toUpperCase()} •••• {billingInfo.paymentMethod.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/25
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
              
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="font-medium">
                    {plans.find(p => p.id === billingInfo.currentPlan)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing Date</p>
                  <p className="font-medium">
                    {new Date(billingInfo.nextBilling).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatPrice(billingInfo.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(billingInfo.status)}>
                    {billingInfo.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Update Billing Info
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={handleCancelSubscription}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Download your invoices and view payment history
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingInfo.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">Invoice {invoice.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(invoice.amount)}</p>
                        <Badge 
                          variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQ Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-blue-900">Can I change my plan anytime?</h4>
              <p className="text-sm text-blue-700">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">What happens if I cancel?</h4>
              <p className="text-sm text-blue-700">
                Your subscription remains active until the end of your current billing period.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Is there a free trial?</h4>
              <p className="text-sm text-blue-700">
                Yes, all paid plans come with a 14-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
