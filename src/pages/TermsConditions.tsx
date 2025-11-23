import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, AlertCircle, Shield, Ban, DollarSign, Calendar, Mail, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsConditions = () => {
  const navigate = useNavigate();
  const lastUpdated = "October 24, 2024";
  const effectiveDate = "October 24, 2024";
  const companyName = "InstaAuto";
  const appName = "Instagram Automation System";
  const contactEmail = "legal@instaauto.com";
  const websiteUrl = "https://reelcommnet.netlify.app";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">Terms & Conditions</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Last Updated */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {lastUpdated}</span>
              <span className="mx-2">•</span>
              <span>Effective Date: {effectiveDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Agreement */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground mb-4">
              These Terms and Conditions ("Terms", "Terms and Conditions") govern your relationship with {appName} (the "Service") operated by {companyName} ("us", "we", or "our").
            </p>
            <p className="text-muted-foreground mb-4">
              Please read these Terms and Conditions carefully before using our Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
            </p>
            <p className="text-muted-foreground">
              By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of these terms then you may not access the Service.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Service Description</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              {appName} is an Instagram automation platform that provides tools and services to help users manage their Instagram accounts more efficiently. Our services include:
            </p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Automated comment responses on Instagram posts and reels</li>
              <li>Automated direct message responses for stories</li>
              <li>Workflow automation for Instagram engagement</li>
              <li>Analytics and performance tracking</li>
              <li>Content management tools</li>
              <li>Bulk automation features</li>
            </ul>
          </CardContent>
        </Card>

        {/* Account Terms */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Account Terms</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">1. Account Creation</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You must be at least 13 years old to use this Service</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must notify us immediately of any unauthorized use</li>
                  <li>One person or legal entity may not maintain more than one account</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">2. Account Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You are responsible for all activities under your account</li>
                  <li>You must comply with Instagram's Terms of Service and Community Guidelines</li>
                  <li>You must not use the Service for any illegal or unauthorized purpose</li>
                  <li>You must not violate any laws in your jurisdiction</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Acceptable Use Policy</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">You agree not to use the Service to:</p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Violate Instagram's Terms of Service or API Usage Guidelines</li>
              <li>Send spam, phishing messages, or engage in harassment</li>
              <li>Distribute malware, viruses, or harmful code</li>
              <li>Infringe on intellectual property rights</li>
              <li>Collect or harvest user data without consent</li>
              <li>Engage in any activity that disrupts or harms the Service</li>
              <li>Use the Service for any illegal activities</li>
              <li>Impersonate another person or entity</li>
              <li>Sell or transfer your account to another party</li>
              <li>Use automated bots or scripts outside of our provided features</li>
            </ul>
          </CardContent>
        </Card>

        {/* Instagram Compliance */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Instagram Platform Compliance</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              By using our Service, you acknowledge and agree that:
            </p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>You will comply with Instagram's Terms of Use and Platform Policy</li>
              <li>You understand that Instagram may change their policies at any time</li>
              <li>You are responsible for ensuring your use complies with Instagram's guidelines</li>
              <li>We are not affiliated with, endorsed by, or sponsored by Instagram or Meta</li>
              <li>Instagram may restrict or terminate your account for policy violations</li>
              <li>We are not responsible for any actions taken by Instagram against your account</li>
            </ul>
            
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Excessive automation or violation of Instagram's policies may result in your Instagram account being restricted or banned. Use automation features responsibly and within Instagram's guidelines.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription and Billing */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Subscription and Billing</h2>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">1. Subscription Terms</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Subscriptions are billed on a recurring basis (monthly or annually)</li>
                  <li>You authorize us to charge your payment method on a recurring basis</li>
                  <li>Subscription fees are non-refundable except as required by law</li>
                  <li>We reserve the right to change pricing with 30 days notice</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">2. Free Trial</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Free trial periods are offered at our discretion</li>
                  <li>You may be required to enter payment information to start a free trial</li>
                  <li>You will be charged when the free trial period ends unless you cancel</li>
                  <li>Free trials are limited to one per user/account</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">3. Cancellation</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>You will retain access to paid features until the end of the billing period</li>
                  <li>No partial refunds for unused time in the billing period</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Intellectual Property Rights</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">1. Our Intellectual Property</h3>
                <p>
                  The Service and its original content, features, and functionality are and will remain the exclusive property of {companyName} and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used without our prior written consent.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">2. Your Content</h3>
                <p className="mb-2">
                  You retain ownership of content you create using our Service. By using the Service, you grant us a license to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Store and process your content to provide the Service</li>
                  <li>Display your content within the Service interface</li>
                  <li>Create backups of your content for service continuity</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-foreground">3. Feedback</h3>
                <p>
                  Any feedback, suggestions, or ideas you provide about the Service may be used by us without any obligation to compensate you.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Disclaimers</h2>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT OR COURSE OF PERFORMANCE.
              </p>
              
              <p>
                {companyName} does not warrant that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The Service will function uninterrupted, secure or available at any time</li>
                <li>The results obtained from the Service will be accurate or reliable</li>
                <li>The quality of the Service will meet your expectations</li>
                <li>Any errors in the Service will be corrected</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Limitation of Liability</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              IN NO EVENT SHALL {companyName.toUpperCase()}, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
              <li>Any interruption or cessation of transmission to or from the Service</li>
              <li>Any bugs, viruses, trojan horses, or the like that may be transmitted through the Service</li>
              <li>Any errors or omissions in any content or for any loss or damage incurred as a result of your use of any content</li>
              <li>Instagram account restrictions or bans resulting from use of our Service</li>
            </ul>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to defend, indemnify, and hold harmless {companyName} and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Your use and access of the Service</li>
              <li>Your violation of any term of these Terms</li>
              <li>Your violation of any third party right, including Instagram's terms</li>
              <li>Any content you post or share through the Service</li>
            </ul>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Ban className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Termination</h2>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to:
              </p>
              
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Breach of these Terms and Conditions</li>
                <li>Violation of Instagram's Terms of Service</li>
                <li>Engaging in fraudulent or illegal activities</li>
                <li>Creating risk or legal exposure for us</li>
                <li>Non-payment of fees</li>
                <li>Extended period of inactivity</li>
              </ul>
              
              <p className="mt-4">
                Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may do so through the account settings or by contacting us.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="text-muted-foreground mt-4">
              By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Contact Us</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> {contactEmail}</p>
              <p><strong>Website:</strong> {websiteUrl}</p>
              <p><strong>Company:</strong> {companyName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => navigate("/privacy")}>
            <Shield className="w-4 h-4 mr-2" />
            View Privacy Policy
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TermsConditions;
