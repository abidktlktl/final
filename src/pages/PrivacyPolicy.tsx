import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Mail, Globe, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = "October 24, 2024";
  const effectiveDate = "October 24, 2024";
  const companyName = "InstaAuto";
  const appName = "Instagram Automation System";
  const contactEmail = "privacy@instaauto.com";
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
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">Privacy Policy</h1>
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

        {/* Introduction */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to {appName} ("{companyName}", "we", "us", or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Instagram automation service.
            </p>
            <p className="text-muted-foreground">
              By using our service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with the terms of this policy, please do not access or use our service.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Information We Collect</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Instagram Account Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Instagram username and profile information</li>
                  <li>Instagram user ID and access tokens</li>
                  <li>Content from your Instagram account (posts, stories, reels)</li>
                  <li>Engagement metrics (likes, comments, followers)</li>
                  <li>Instagram Business Account ID (if applicable)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Personal Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Name and email address</li>
                  <li>Contact preferences</li>
                  <li>Billing information (processed securely through payment providers)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Usage Data</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Log data (IP address, browser type, operating system)</li>
                  <li>Device information</li>
                  <li>Usage patterns and preferences</li>
                  <li>Automation settings and configurations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">How We Use Your Information</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">We use the collected information for the following purposes:</p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>To provide and maintain our Instagram automation service</li>
              <li>To authenticate your Instagram account and manage access</li>
              <li>To execute automated actions on your behalf (comments, messages, etc.)</li>
              <li>To analyze and improve our service performance</li>
              <li>To communicate with you about service updates and changes</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To comply with legal obligations and enforce our terms</li>
              <li>To process payments and manage subscriptions</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sharing and Disclosure */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Data Sharing and Disclosure</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">We do not sell, trade, or rent your personal information. We may share your information in the following situations:</p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>With Instagram/Meta:</strong> To authenticate and perform actions on your behalf</li>
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our platform (hosting, analytics, payment processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Data Security</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information:
            </p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure access tokens and authentication mechanisms</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal information on a need-to-know basis</li>
              <li>Secure data storage with reputable cloud providers</li>
            </ul>
            
            <p className="text-muted-foreground mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Account information: Retained while your account is active</li>
              <li>Instagram content: Cached temporarily for performance (24-48 hours)</li>
              <li>Usage logs: Retained for 90 days</li>
              <li>Billing records: Retained as required by tax and accounting laws</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Your Rights and Choices</h2>
            <p className="text-muted-foreground mb-4">You have the following rights regarding your personal information:</p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
              <li><strong>Opt-out:</strong> Opt-out of marketing communications</li>
            </ul>
            
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at {contactEmail}.
            </p>
          </CardContent>
        </Card>

        {/* GDPR Compliance */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">GDPR Compliance (For EU Users)</h2>
            <p className="text-muted-foreground mb-4">
              If you are a resident of the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
            </p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Legal basis for processing your personal data</li>
              <li>Right to lodge a complaint with supervisory authorities</li>
              <li>Right to object to processing</li>
              <li>Right to restriction of processing</li>
              <li>Automated decision-making and profiling rights</li>
            </ul>
          </CardContent>
        </Card>

        {/* CCPA Compliance */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">CCPA Compliance (For California Residents)</h2>
            <p className="text-muted-foreground mb-4">
              California residents have specific rights under the California Consumer Privacy Act (CCPA):
            </p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
            
            <p className="text-muted-foreground mt-4">
              We do not sell personal information to third parties.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">Our service integrates with the following third-party services:</p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Instagram/Meta:</strong> For account authentication and API access</li>
              <li><strong>Payment Processors:</strong> For secure payment processing</li>
              <li><strong>Analytics Services:</strong> For service improvement</li>
              <li><strong>Cloud Hosting:</strong> For data storage and service delivery</li>
            </ul>
            
            <p className="text-muted-foreground mt-4">
              These services have their own privacy policies, and we encourage you to review them.
            </p>
          </CardContent>
        </Card>

        {/* Updates to Privacy Policy */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Updates to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically for any changes.
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
              If you have any questions about this Privacy Policy or our data practices, please contact us:
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
          <Button variant="outline" onClick={() => navigate("/terms")}>
            <FileText className="w-4 h-4 mr-2" />
            View Terms & Conditions
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
