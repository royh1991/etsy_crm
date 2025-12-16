import { useState, useEffect } from 'react';
import IconSidebar from './components/sidebar/IconSidebar';
import Header from './components/header/Header';
import KanbanBoard from './components/kanban/KanbanBoard';
import CustomerList from './components/customer/CustomerList';
import CustomerDetailDrawer from './components/customer/CustomerDetailDrawer';
import Dashboard from './components/analytics/Dashboard';
import Settings from './components/settings/Settings';
import CommandPalette from './components/common/CommandPalette';
import KeyboardShortcutsModal from './components/common/KeyboardShortcutsModal';
import { useOrderStore } from './stores/orderStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    activeView,
    openCustomerDrawer,
    closeCustomerDrawer,
    isCustomerDrawerOpen,
    selectedCustomerId,
    customers
  } = useOrderStore();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      if (width < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getViewTitle = () => {
    switch (activeView) {
      case 'pipeline':
        return 'Order Pipeline';
      case 'customers':
        return 'Customers';
      case 'analytics':
        return 'Dashboard';
      case 'settings':
        return 'Settings';
      default:
        return 'Etsy CRM';
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'pipeline':
        return <KanbanBoard />;
      case 'customers':
        return (
          <div className="flex-1 p-4 md:p-6 overflow-hidden">
            <CustomerList onSelectCustomer={(id) => openCustomerDrawer(id)} />
          </div>
        );
      case 'analytics':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <KanbanBoard />;
    }
  };

  // Get selected customer for drawer
  const selectedCustomer = selectedCustomerId
    ? customers.find(c => c.id === selectedCustomerId)
    : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f7f7]">
      {/* Left Icon Sidebar */}
      <IconSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={getViewTitle()}
        />

        {/* Main Content */}
        {renderMainContent()}
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <CustomerDetailDrawer
          customer={selectedCustomer}
          isOpen={isCustomerDrawerOpen}
          onClose={closeCustomerDrawer}
        />
      )}

      {/* Global Modals */}
      <CommandPalette />
      <KeyboardShortcutsModal />
    </div>
  );
}

export default App;
