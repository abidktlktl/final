import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, Shield, Mail, AlertCircle, CheckCircle, Clock, Database, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DataDeletion = () => {
  const navigate = useNavigate();
  const companyName = "dm2comment";
  const appName = "dm2comment";
  const contactEmail = "enosktl@gmail.com";
  const deletionEmail = "enosktl@gmail.com";
  const websiteUrl = "https://dm2comment.netlify.app";

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
              <Trash2 className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">Data Deletion Instructions</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Your Data, Your Control</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              At {companyName}, we respect your privacy and provide you with complete control over your personal data. 
              You have the right to request deletion of your data at any time. This page explains how to delete your 
              data from our {appName}.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Important:</strong> Data deletion is permanent and cannot be undone. Please ensure you have 
                  backed up any important information before proceeding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Types of Data We Store */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Types of Data We Store</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              When you use our service, we may store the following types of data:
            </p>
            
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1">Account Information</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Instagram username and user ID</li>
                  <li>• Email address</li>
                  <li>• Profile settings and preferences</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1">Instagram Data</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Access tokens for Instagram API</li>
                  <li>• Cached media content (temporary)</li>
                  <li>• Automation settings and templates</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1">Usage Data</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Activity logs</li>
                  <li>• Analytics data</li>
                  <li>• Automation history</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Delete Your Data */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserX className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">How to Delete Your Data</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              You can request data deletion through any of the following methods:
            </p>

            {/* Method 1: In-App Deletion */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                In-App Account Deletion (Recommended)
              </h3>
              <div className="ml-8 space-y-2">
                <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                  <li>Log in to your {appName} account</li>
                  <li>Navigate to Settings → Account Settings</li>
                  <li>Click on "Delete Account"</li>
                  <li>Confirm your decision by entering your password</li>
                  <li>Click "Permanently Delete Account"</li>
                </ol>
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800 mt-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-900 dark:text-green-100">
                      This method immediately removes all your data from our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Method 2: Email Request */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                Email Request
              </h3>
              <div className="ml-8 space-y-2">
                <p className="text-muted-foreground">
                  Send an email to <a href={`mailto:${deletionEmail}`} className="text-primary hover:underline">{deletionEmail}</a> with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Subject: "Data Deletion Request"</li>
                  <li>Your registered email address</li>
                  <li>Your Instagram username</li>
                  <li>A clear statement requesting data deletion</li>
                </ul>
                <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm text-yellow-900 dark:text-yellow-100">
                      Email requests are processed within 30 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Method 3: Instagram Settings */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                Through Instagram Settings
              </h3>
              <div className="ml-8 space-y-2">
                <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                  <li>Go to your Instagram Settings</li>
                  <li>Navigate to "Apps and Websites"</li>
                  <li>Find "{appName}" in the active apps list</li>
                  <li>Click "Remove"</li>
                  <li>Select "Remove" again to confirm</li>
                </ol>
                <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800 mt-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <p className="text-sm text-orange-900 dark:text-orange-100">
                      This revokes our access to your Instagram data but doesn't delete data already stored. 
                      Follow up with Method 1 or 2 for complete deletion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Happens After Deletion */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">What Happens After You Request Deletion</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <span className="text-xs font-bold">24h</span>
                </div>
                <div>
                  <h3 className="font-semibold">Immediate Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Your account is deactivated, and all automated actions are stopped immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <span className="text-xs font-bold">7d</span>
                </div>
                <div>
                  <h3 className="font-semibold">Data Removal</h3>
                  <p className="text-sm text-muted-foreground">
                    All personal data, automation settings, and cached content are permanently deleted from our active servers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <span className="text-xs font-bold">30d</span>
                </div>
                <div>
                  <h3 className="font-semibold">Backup Deletion</h3>
                  <p className="text-sm text-muted-foreground">
                    Data is removed from all backup systems. Some anonymized analytics data may be retained for legal compliance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <span className="text-xs font-bold">90d</span>
                </div>
                <div>
                  <h3 className="font-semibold">Complete Removal</h3>
                  <p className="text-sm text-muted-foreground">
                    All traces of your data are completely removed from our systems, including logs and archives.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention Exceptions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Data Retention Exceptions</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              In certain circumstances, we may need to retain some information:
            </p>
            
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>
                <strong>Legal Obligations:</strong> We may retain data if required by law, regulation, or legal process
              </li>
              <li>
                <strong>Fraud Prevention:</strong> Information necessary to prevent fraud or abuse may be retained
              </li>
              <li>
                <strong>Financial Records:</strong> Transaction records may be retained for tax and accounting purposes
              </li>
              <li>
                <strong>Anonymized Data:</strong> Fully anonymized data that cannot identify you may be retained for analytics
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Your Data Rights</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Under data protection laws, you have the following rights:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold mb-1">Right to Access</h3>
                <p className="text-sm text-muted-foreground">
                  Request a copy of your personal data
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold mb-1">Right to Rectification</h3>
                <p className="text-sm text-muted-foreground">
                  Correct inaccurate personal data
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold mb-1">Right to Erasure</h3>
                <p className="text-sm text-muted-foreground">
                  Request deletion of your personal data
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold mb-1">Right to Portability</h3>
                <p className="text-sm text-muted-foreground">
                  Receive your data in a portable format
                </p>
              </div>
            </div>
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
              If you have any questions about data deletion or need assistance, please contact us:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">General Privacy Inquiries</p>
                  <a href={`mailto:${contactEmail}`} className="text-sm text-primary hover:underline">
                    {contactEmail}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">Data Deletion Requests</p>
                  <a href={`mailto:${deletionEmail}`} className="text-sm text-primary hover:underline">
                    {deletionEmail}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">Data Protection Officer</p>
                  <p className="text-sm text-muted-foreground">Available for GDPR-related inquiries</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">Website</p>
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {websiteUrl}
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Response Time:</strong> We aim to respond to all data deletion requests within 48 hours 
                and complete the deletion process within 30 days of verification.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => navigate("/privacy")}>
            Privacy Policy
          </Button>
          <Button variant="outline" onClick={() => navigate("/terms")}>
            Terms & Conditions
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DataDeletion;
