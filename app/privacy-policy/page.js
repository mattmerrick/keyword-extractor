'use client';
import Link from "next/link";
import { useState, useEffect } from "react";

const PrivacyPolicy = () => {
  const [appName, setAppName] = useState("Keyword Finder");

  useEffect(() => {
    // You can replace this with the actual way you fetch config values
    // For example, you might fetch from an API or use context
    const fetchConfig = async () => {
      // Mock fetch function
      const config = await Promise.resolve({ appName: "Keyword Finder" });
      setAppName(config.appName);
    };

    fetchConfig();
  }, []);

  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
       
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: 2024-4-2

Privacy Policy for ${appName}

Thank you for using ${appName}! This Privacy Policy outlines how we collect, use, and protect your information when you visit our website.

Information We Collect: We collect the following types of data:

Personal Information: Name, email, and payment information for order processing.
Non-Personal Information: Web cookies for website functionality and analytics.
Purpose of Data Collection: We collect your information solely for order processing purposes.

Data Sharing: We do not share your data with any third parties.

Children's Privacy: We do not knowingly collect any data from individuals under the age of 18.

Updates to the Privacy Policy: Users will be notified of any updates to this Privacy Policy via email.

Contact Information: If you have any questions or concerns regarding our Privacy Policy, please contact us at hey@mattmerrick.co.

By using our website, you agree to the terms outlined in this Privacy Policy. Please review this policy periodically for any updates or changes.

Thank you for trusting ${appName} with your information.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
