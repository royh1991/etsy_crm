import { useState } from 'react';

// Icons
const ShopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M2.5 6.25L4.375 2.5H15.625L17.5 6.25M2.5 6.25V16.25C2.5 16.9404 3.05964 17.5 3.75 17.5H16.25C16.9404 17.5 17.5 16.9404 17.5 16.25V6.25M2.5 6.25H17.5M7.5 10H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SyncIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M14.1667 5.83333L16.6667 3.33333L14.1667 0.833336" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.33334 10C3.33334 6.31811 6.31811 3.33334 10 3.33334H16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.83334 14.1667L3.33334 16.6667L5.83334 19.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.6667 10C16.6667 13.6819 13.6819 16.6667 10 16.6667H3.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TemplateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M6.66666 5H13.3333M6.66666 8.33334H13.3333M6.66666 11.6667H10M3.33334 2.5H16.6667C17.3571 2.5 17.9167 3.05965 17.9167 3.75V16.25C17.9167 16.9404 17.3571 17.5 16.6667 17.5H3.33334C2.64299 17.5 2.08334 16.9404 2.08334 16.25V3.75C2.08334 3.05965 2.64299 2.5 3.33334 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TeamIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M14.1667 17.5V15.8333C14.1667 13.9924 12.6743 12.5 10.8333 12.5H4.16666C2.32572 12.5 0.833328 13.9924 0.833328 15.8333V17.5M19.1667 17.5V15.8333C19.1667 14.2692 18.1136 12.9408 16.6667 12.5774M13.3333 2.57739C14.7802 2.94083 15.8333 4.26917 15.8333 5.83333C15.8333 7.3975 14.7802 8.72583 13.3333 9.08928M10.8333 5.83334C10.8333 7.67428 9.34094 9.16667 7.5 9.16667C5.65905 9.16667 4.16666 7.67428 4.16666 5.83334C4.16666 3.99239 5.65905 2.5 7.5 2.5C9.34094 2.5 10.8333 3.99239 10.8333 5.83334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShippingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M13.3333 3.33334H15.5556C16.0344 3.33334 16.4682 3.60773 16.6667 4.02778L18.3333 7.50001M13.3333 3.33334V12.5M13.3333 3.33334H1.66666V13.3333C1.66666 14.0237 2.22631 14.5833 2.91666 14.5833H4.16666M13.3333 12.5H18.3333V9.16667M13.3333 12.5V14.5833M18.3333 9.16667H16.6667M18.3333 9.16667V7.50001M16.6667 7.50001H13.3333V3.33334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6.66666" cy="15.8333" r="1.66667" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="15.8333" cy="15.8333" r="1.66667" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const KeyboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="1.66666" y="4.16667" width="16.6667" height="11.6667" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 8.33334H5.00833M10 8.33334H10.0083M15 8.33334H15.0083M5 11.6667H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'shop' | 'sync' | 'templates' | 'shipping' | 'team' | 'shortcuts'>('shop');

  // Mock settings state
  const [shopSettings, setShopSettings] = useState({
    shopName: 'My Etsy Shop',
    autoSync: true,
    syncInterval: 15
  });

  const [fromAddress, setFromAddress] = useState({
    name: 'Your Shop Name',
    addressLine1: '456 Seller Avenue',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90001',
    country: 'US'
  });

  const tabs = [
    { id: 'shop' as const, label: 'Shop', icon: <ShopIcon /> },
    { id: 'sync' as const, label: 'Sync', icon: <SyncIcon /> },
    { id: 'templates' as const, label: 'Templates', icon: <TemplateIcon /> },
    { id: 'shipping' as const, label: 'Shipping', icon: <ShippingIcon /> },
    { id: 'team' as const, label: 'Team', icon: <TeamIcon /> },
    { id: 'shortcuts' as const, label: 'Shortcuts', icon: <KeyboardIcon /> }
  ];

  return (
    <div className="flex-1 bg-[#f7f7f7] overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your shop configuration and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#6e6af0] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'shop' && (
            <>
              <SettingsSection
                title="Shop Information"
                description="Basic information about your Etsy shop"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                    <input
                      type="text"
                      value={shopSettings.shopName}
                      onChange={e => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-green-800">Connected to Etsy</p>
                      <p className="text-sm text-green-600">Your shop is syncing orders automatically</p>
                    </div>
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckIcon />
                      Connected
                    </span>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection
                title="Default From Address"
                description="Used when creating shipping labels"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={fromAddress.name}
                      onChange={e => setFromAddress({ ...fromAddress, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={fromAddress.addressLine1}
                      onChange={e => setFromAddress({ ...fromAddress, addressLine1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={fromAddress.city}
                      onChange={e => setFromAddress({ ...fromAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={fromAddress.state}
                        onChange={e => setFromAddress({ ...fromAddress, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                      <input
                        type="text"
                        value={fromAddress.postalCode}
                        onChange={e => setFromAddress({ ...fromAddress, postalCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0]"
                      />
                    </div>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-[#6e6af0] text-white rounded-lg hover:bg-[#5b57d1] transition-colors">
                  Save Address
                </button>
              </SettingsSection>
            </>
          )}

          {activeTab === 'sync' && (
            <SettingsSection
              title="Sync Settings"
              description="Configure how orders are synced from Etsy"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Auto-sync orders</p>
                    <p className="text-sm text-gray-500">Automatically import new orders from Etsy</p>
                  </div>
                  <button
                    onClick={() => setShopSettings({ ...shopSettings, autoSync: !shopSettings.autoSync })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      shopSettings.autoSync ? 'bg-[#6e6af0]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      shopSettings.autoSync ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sync interval (minutes)</label>
                  <select
                    value={shopSettings.syncInterval}
                    onChange={e => setShopSettings({ ...shopSettings, syncInterval: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0]"
                  >
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every hour</option>
                  </select>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Last sync: <span className="font-medium">2 minutes ago</span></p>
                  <p className="text-sm text-gray-600">Orders synced: <span className="font-medium">12 orders</span></p>
                </div>

                <button className="px-4 py-2 bg-[#6e6af0] text-white rounded-lg hover:bg-[#5b57d1] transition-colors">
                  Sync Now
                </button>
              </div>
            </SettingsSection>
          )}

          {activeTab === 'templates' && (
            <SettingsSection
              title="Message Templates"
              description="Create reusable templates for customer communication"
            >
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Shipping Confirmation</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Used 24 times</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    Hi {'{{customer_name}}'}, Your order #{'{{order_number}}'} has shipped! Track it here: {'{{tracking_url}}'}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Thank You Message</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Used 18 times</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    Thank you for your order, {'{{customer_name}}'}! We appreciate your business.
                  </p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-lg">+</span>
                  Add Template
                </button>
              </div>
            </SettingsSection>
          )}

          {activeTab === 'shipping' && (
            <SettingsSection
              title="Shipping Preferences"
              description="Configure default shipping options"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Carrier</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0]">
                    <option>USPS</option>
                    <option>UPS</option>
                    <option>FedEx</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Service</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6e6af0]">
                    <option>First Class Mail</option>
                    <option>Priority Mail</option>
                    <option>Priority Mail Express</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Always require signature</p>
                    <p className="text-sm text-gray-500">Add signature confirmation to all labels</p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-gray-300 transition-colors">
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Include insurance</p>
                    <p className="text-sm text-gray-500">Add insurance for orders over $50</p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-[#6e6af0] transition-colors">
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow translate-x-6" />
                  </button>
                </div>
              </div>
            </SettingsSection>
          )}

          {activeTab === 'team' && (
            <SettingsSection
              title="Team Members"
              description="Manage who has access to your CRM"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6e6af0] flex items-center justify-center text-white font-medium">
                      JD
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">John Doe</p>
                      <p className="text-sm text-gray-500">john@example.com</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">Owner</span>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-lg">+</span>
                  Invite Team Member
                </button>
              </div>
            </SettingsSection>
          )}

          {activeTab === 'shortcuts' && (
            <SettingsSection
              title="Keyboard Shortcuts"
              description="Navigate faster with keyboard shortcuts"
            >
              <div className="space-y-3">
                {[
                  { keys: ['⌘', 'K'], description: 'Open command palette' },
                  { keys: ['/'], description: 'Focus search' },
                  { keys: ['?'], description: 'Show keyboard shortcuts' },
                  { keys: ['P'], description: 'Go to Pipeline view' },
                  { keys: ['C'], description: 'Go to Customers view' },
                  { keys: ['D'], description: 'Go to Dashboard' },
                  { keys: ['S'], description: 'Sync orders from Etsy' },
                  { keys: ['Esc'], description: 'Close drawer/modal' },
                  { keys: ['J', '↓'], description: 'Next order' },
                  { keys: ['K', '↑'], description: 'Previous order' },
                  { keys: ['L'], description: 'Create shipping label' },
                  { keys: ['1-6'], description: 'Move order to stage 1-6' }
                ].map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, j) => (
                        <kbd key={j} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded border border-gray-200">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}
