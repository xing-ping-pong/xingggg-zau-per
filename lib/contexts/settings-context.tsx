"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  currency: string;
  // taxRate removed
  shippingFee: string;
  freeShippingThreshold: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  newUserRegistration: boolean;
  guestCheckout: boolean;
  productReviews: boolean;
  blogComments: boolean;
  socialLogin: boolean;
  twoFactorAuth: boolean;
  apiKey?: string;
  webhookUrl?: string;
  backupFrequency: "daily" | "weekly" | "monthly";
  maxFileSize: string;
  allowedFileTypes: string;
  heroImageUrl?: string;
}

const defaultSettings: Settings = {
  siteName: "ZAU",
  siteDescription: "Luxury Perfume Collection",
  contactEmail: "contact@zauperfumes.com.pk",
  supportEmail: "support@zauperfumes.com.pk",
  currency: "PKR",
  // taxRate removed
  shippingFee: "500.00",
  freeShippingThreshold: "5000.00",
  maintenanceMode: false,
  emailNotifications: true,
  orderNotifications: true,
  lowStockAlerts: true,
  newUserRegistration: true,
  guestCheckout: true,
  productReviews: true,
  blogComments: false,
  socialLogin: true,
  twoFactorAuth: false,
  apiKey: "",
  webhookUrl: "",
  backupFrequency: "daily",
  maxFileSize: "10",
  allowedFileTypes: "jpg,png,webp,pdf",
  heroImageUrl: ""
};

const SettingsContext = createContext<Settings>(defaultSettings);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.data) {
          setSettings(data.data);
        }
      } catch {
        // fallback to default
      }
    }
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}
