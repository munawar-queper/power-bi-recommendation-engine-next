"use client";

import { FormEvent, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SmtpSettings, SmtpSettingsResponse } from "@/types";

const initialSettings: SmtpSettings = {
  host: "",
  port: 587,
  username: "",
  password: "",
  secure: false,
  fromEmail: "",
  notifyToEmail: "",
  notificationsEnabled: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SmtpSettings>(initialSettings);
  const [hasSavedPassword, setHasSavedPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/settings", {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load settings");
        }

        const settingsResponse: SmtpSettingsResponse = data.settings || {
          ...initialSettings,
          hasPassword: false,
        };

        setSettings({
          host: settingsResponse.host,
          port: settingsResponse.port,
          username: settingsResponse.username,
          password: "",
          secure: settingsResponse.secure,
          fromEmail: settingsResponse.fromEmail,
          notifyToEmail: settingsResponse.notifyToEmail,
          notificationsEnabled: settingsResponse.notificationsEnabled,
        });
        setHasSavedPassword(Boolean(settingsResponse.hasPassword));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setMessage("SMTP settings saved successfully.");
      setHasSavedPassword(true);
      setSettings((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const onTestEmail = async () => {
    setTesting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toEmail: settings.notifyToEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send test email");
      }

      setMessage("Test email sent successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>
            Configure SMTP to receive an email whenever a new questionnaire submission is recorded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading settings...</p> : null}

          {!loading ? (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSave}>
              <Input
                placeholder="SMTP Host"
                value={settings.host}
                onChange={(e) => setSettings((prev) => ({ ...prev, host: e.target.value }))}
                required
              />
              <Input
                type="number"
                placeholder="Port"
                value={settings.port}
                onChange={(e) => setSettings((prev) => ({ ...prev, port: Number(e.target.value) }))}
                required
              />
              <Input
                placeholder="SMTP Username"
                value={settings.username}
                onChange={(e) => setSettings((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
              <Input
                type="password"
                placeholder={hasSavedPassword ? "Leave blank to keep current password" : "SMTP Password"}
                value={settings.password}
                onChange={(e) => setSettings((prev) => ({ ...prev, password: e.target.value }))}
              />
              <Input
                type="email"
                placeholder="From Email"
                value={settings.fromEmail}
                onChange={(e) => setSettings((prev) => ({ ...prev, fromEmail: e.target.value }))}
                required
              />
              <Input
                type="email"
                placeholder="Notify Admin Email"
                value={settings.notifyToEmail}
                onChange={(e) => setSettings((prev) => ({ ...prev, notifyToEmail: e.target.value }))}
                required
              />

              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.secure}
                  onChange={(e) => setSettings((prev) => ({ ...prev, secure: e.target.checked }))}
                />
                Use secure SMTP (SSL/TLS)
              </label>

              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notificationsEnabled: e.target.checked,
                    }))
                  }
                />
                Enable new submission notifications
              </label>

              {error ? (
                <p className="md:col-span-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {error}
                </p>
              ) : null}

              {message ? (
                <p className="md:col-span-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  {message}
                </p>
              ) : null}

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
                <Button type="button" variant="outline" onClick={onTestEmail} disabled={testing}>
                  {testing ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
