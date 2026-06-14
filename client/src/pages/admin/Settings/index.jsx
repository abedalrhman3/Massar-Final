import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Settings.module.css";

const tabs = [
  "General",
  "Security",
  "Permissions",
  "System",
  "Notifications",
  "Subscription",
];

function Settings() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "General";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saved, setSaved] = useState(false);

  
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>
            Manage portal configuration, permissions, and system preferences.
          </p>
        </div>
        {saved && (
          <div className={styles.savedBanner}>
            <span className="material-symbols-outlined">check_circle</span>
            Changes saved successfully
          </div>
        )}
      </div>

      {}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {}
      <div className={styles.content}>
        {activeTab === "General" && <GeneralTab onSave={handleSave} />}
        {activeTab === "Security" && <SecurityTab onSave={handleSave} />}
        {activeTab === "Permissions" && <PermissionsTab onSave={handleSave} />}
        {activeTab === "System" && <SystemTab onSave={handleSave} />}
        {activeTab === "Notifications" && (
          <NotificationsTab onSave={handleSave} />
        )}
        {activeTab === "Subscription" && (
          <SubscriptionTab onSave={handleSave} />
        )}
      </div>
    </div>
  );
}


function GeneralTab({ onSave }) {
  return (
    <div className={styles.tabContent}>
      <Section title="Portal Identity">
        <Field label="Portal Name">
          <input className={styles.input} defaultValue="Editorial Archive" />
        </Field>
        <Field label="Tagline">
          <input className={styles.input} defaultValue="Admin Portal" />
        </Field>
        <Field label="Default Language">
          <select className={styles.select}>
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>French</option>
            <option>Arabic</option>
          </select>
        </Field>
      </Section>

      <Section title="Regional Settings">
        <Field label="Timezone">
          <select className={styles.select}>
            <option>UTC+0 — London</option>
            <option>UTC+3 — Amman</option>
            <option>UTC-5 — New York</option>
            <option>UTC+8 — Singapore</option>
          </select>
        </Field>
        <Field label="Date Format">
          <select className={styles.select}>
            <option>MMM DD, YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </Field>
        <Field label="Currency">
          <select className={styles.select}>
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
            <option>JOD (JD)</option>
          </select>
        </Field>
      </Section>

      <SaveRow onSave={onSave} />
    </div>
  );
}


function SecurityTab({ onSave }) {
  return (
    <div className={styles.tabContent}>
      <Section title="Authentication">
        <Toggle
          label="Two-Factor Authentication (2FA)"
          description="Require 2FA for all admin accounts"
          defaultChecked
        />
        <Toggle
          label="SSO Integration"
          description="Enable Single Sign-On via SAML 2.0"
        />
        <Field label="Session Timeout (minutes)">
          <input className={styles.input} type="number" defaultValue={60} />
        </Field>
        <Field label="Maximum Login Attempts">
          <input className={styles.input} type="number" defaultValue={5} />
        </Field>
      </Section>

      <Section title="Password Policy">
        <Toggle
          label="Enforce Strong Passwords"
          description="Minimum 12 characters with symbols"
          defaultChecked
        />
        <Field label="Password Expiry (days)">
          <input className={styles.input} type="number" defaultValue={90} />
        </Field>
      </Section>

      <Section title="IP Allowlist (Admin Only)">
        <p className={styles.adminNote}>
          <span className="material-symbols-outlined">
            admin_panel_settings
          </span>
          Only admins can configure IP allowlisting
        </p>
        <Field label="Allowed IPs (comma-separated)">
          <input
            className={styles.input}
            placeholder="e.g. 192.168.1.1, 10.0.0.0/24"
          />
        </Field>
        <Toggle
          label="Block All Unlisted IPs"
          description="Strict mode — only allowlisted IPs can access the portal"
        />
      </Section>

      <SaveRow onSave={onSave} />
    </div>
  );
}


function PermissionsTab({ onSave }) {
  const roles = [
    {
      role: "Super Admin",
      users: 2,
      canManageUsers: true,
      canPublish: true,
      canDelete: true,
      canViewLogs: true,
    },
    {
      role: "Senior Curator",
      users: 5,
      canManageUsers: true,
      canPublish: true,
      canDelete: false,
      canViewLogs: true,
    },
    {
      role: "Editor",
      users: 18,
      canManageUsers: false,
      canPublish: true,
      canDelete: false,
      canViewLogs: false,
    },
    {
      role: "Moderator",
      users: 12,
      canManageUsers: false,
      canPublish: false,
      canDelete: false,
      canViewLogs: true,
    },
    {
      role: "Viewer",
      users: 40,
      canManageUsers: false,
      canPublish: false,
      canDelete: false,
      canViewLogs: false,
    },
  ];

  return (
    <div className={styles.tabContent}>
      <Section title="Role Permissions Matrix">
        <p className={styles.adminNote}>
          <span className="material-symbols-outlined">
            admin_panel_settings
          </span>
          Only Super Admins can modify role permissions
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.permTable}>
            <thead>
              <tr>
                <th>Role</th>
                <th>Users</th>
                <th>Manage Users</th>
                <th>Publish Content</th>
                <th>Delete Content</th>
                <th>View Logs</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.role}>
                  <td>
                    <span className={styles.roleLabel}>{r.role}</span>
                  </td>
                  <td className={styles.muted}>{r.users}</td>
                  <td>
                    <Check v={r.canManageUsers} />
                  </td>
                  <td>
                    <Check v={r.canPublish} />
                  </td>
                  <td>
                    <Check v={r.canDelete} />
                  </td>
                  <td>
                    <Check v={r.canViewLogs} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Global Access Control">
        <Toggle
          label="Public Registration"
          description="Allow new users to self-register"
        />
        <Toggle
          label="Invite-Only Mode"
          description="Only invited users can create accounts"
          defaultChecked
        />
        <Toggle
          label="Guest Browsing"
          description="Non-authenticated users can view public destinations"
          defaultChecked
        />
      </Section>

      <SaveRow onSave={onSave} />
    </div>
  );
}


function SystemTab({ onSave }) {
  return (
    <div className={styles.tabContent}>
      <Section title="Content Management">
        <Toggle
          label="Auto-Moderation"
          description="AI-assisted flagging of inappropriate content"
          defaultChecked
        />
        <Toggle
          label="Global Sync"
          description="Sync tax rates and metadata across all destinations simultaneously"
          defaultChecked
        />
        <Field label="Max Image Upload Size (MB)">
          <input className={styles.input} type="number" defaultValue={25} />
        </Field>
        <Field label="CDN Region">
          <select className={styles.select}>
            <option>US East (N. Virginia)</option>
            <option>EU West (Ireland)</option>
            <option>APAC (Singapore)</option>
            <option>ME (Bahrain)</option>
          </select>
        </Field>
      </Section>

      <Section title="API & Integrations">
        <Toggle
          label="External API Access"
          description="Allow third-party integrations via REST API"
          defaultChecked
        />
        <Field label="API Rate Limit (req/min)">
          <input className={styles.input} type="number" defaultValue={120} />
        </Field>
        <Field label="Webhook URL">
          <input
            className={styles.input}
            placeholder="https://your-endpoint.com/webhook"
          />
        </Field>
      </Section>

      <SaveRow onSave={onSave} />
    </div>
  );
}


function NotificationsTab({ onSave }) {
  return (
    <div className={styles.tabContent}>
      <Section title="Email Notifications">
        <Toggle
          label="New User Registrations"
          description="Notify when a new account is created"
          defaultChecked
        />
        <Toggle
          label="Reported Content Alerts"
          description="Instant email on new moderation flags"
          defaultChecked
        />
        <Toggle
          label="Weekly Digest"
          description="Summary of platform activity every Monday"
          defaultChecked
        />
        <Toggle
          label="System Alerts"
          description="Critical server and performance warnings"
          defaultChecked
        />
      </Section>

      <Section title="In-App Notifications">
        <Toggle
          label="Live Activity Feed"
          description="Real-time updates in the dashboard sidebar"
          defaultChecked
        />
        <Toggle
          label="Booking Confirmations"
          description="Show popup when bookings are confirmed"
        />
        <Toggle
          label="Moderation Queue Alerts"
          description="Badge on Account Management when queue grows"
          defaultChecked
        />
      </Section>

      <Section title="Notification Recipients (Admin Only)">
        <p className={styles.adminNote}>
          <span className="material-symbols-outlined">
            admin_panel_settings
          </span>
          Only admins can add or remove notification recipients
        </p>
        <Field label="Critical Alert Recipients">
          <input
            className={styles.input}
            defaultValue="admin@editorialarchive.com, ops@editorialarchive.com"
          />
        </Field>
      </Section>

      <SaveRow onSave={onSave} />
    </div>
  );
}


function SubscriptionTab({ onSave }) {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["Up to 10 destinations", "Basic analytics", "Email support"],
      current: true,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      features: [
        "Unlimited destinations",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      current: false,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "API access",
        "Custom integrations",
        "SLA guarantee",
      ],
      current: false,
    },
  ];

  return (
    <div className={styles.tabContent}>
      <Section title="Current Plan">
        <div className={styles.currentPlanBadge}>
          <span className="material-symbols-outlined">verified</span>
          <span>Free Plan</span>
        </div>
        <p className={styles.planDesc}>
          You're currently on the free plan with basic features.
        </p>
      </Section>

      <Section title="Plan Comparison">
        <div className={styles.planGrid}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`${styles.planCard} ${plan.current ? styles.planCardCurrent : ""}`}
            >
              {plan.current && (
                <span className={styles.currentBadge}>Current</span>
              )}
              <h4 className={styles.planName}>{plan.name}</h4>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>{plan.price}</span>
                <span className={styles.pricePeriod}>/{plan.period}</span>
              </div>
              <button className={styles.planBtn} disabled={plan.current}>
                {plan.current ? "Current Plan" : "Upgrade"}
              </button>
              <ul className={styles.planFeatures}>
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1rem", color: "#16a34a" }}
                    >
                      check_circle
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Payment Details">
        <Field label="Cardholder Name">
          <input className={styles.input} placeholder="John Doe" />
        </Field>
        <Field label="Card Number">
          <input className={styles.input} placeholder="1234 5678 9012 3456" />
        </Field>
        <div className={styles.paymentRow}>
          <Field label="Expiry">
            <input className={styles.input} placeholder="MM/YY" />
          </Field>
          <Field label="CVV">
            <input className={styles.input} placeholder="123" />
          </Field>
        </div>
      </Section>

      <SaveRow onSave={onSave} />
    </div>
  );
}


function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, description, defaultChecked }) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div className={styles.toggleRow}>
      <div>
        <p className={styles.toggleLabel}>{label}</p>
        {description && <p className={styles.toggleDesc}>{description}</p>}
      </div>
      <button
        className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
        onClick={() => setChecked(!checked)}
        aria-pressed={checked}
        role="switch"
      >
        <span className={styles.toggleKnob}></span>
      </button>
    </div>
  );
}

function Check({ v }) {
  return v ? (
    <span
      className="material-symbols-outlined"
      style={{ color: "#16a34a", fontSize: "1.1rem" }}
    >
      check_circle
    </span>
  ) : (
    <span
      className="material-symbols-outlined"
      style={{ color: "#d1d5db", fontSize: "1.1rem" }}
    >
      cancel
    </span>
  );
}

function SaveRow({ onSave }) {
  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard all changes?")) {
      window.location.reload();
    }
  };

  return (
    <div className={styles.saveRow}>
      <button className={styles.cancelBtn} onClick={handleDiscard}>
        Discard Changes
      </button>
      <button className={styles.saveBtn} onClick={onSave}>
        Save Changes
      </button>
    </div>
  );
}

export default Settings;
