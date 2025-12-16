import { useState, useEffect } from 'react';
import IconSidebar from './components/sidebar/IconSidebar';
import ProjectSidebar from './components/sidebar/ProjectSidebar';
import Header from './components/header/Header';
import ProjectHeader from './components/header/ProjectHeader';
import KanbanBoard from './components/kanban/KanbanBoard';
import CustomerList from './components/customer/CustomerList';
import Dashboard from './components/analytics/Dashboard';
import { useOrderStore } from './stores/orderStore';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectSidebarCollapsed, setProjectSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { activeView, openCustomerDrawer } = useOrderStore();

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      // Auto-collapse sidebars on smaller screens
      if (width < 1024) {
        setProjectSidebarCollapsed(true);
      } else {
        setProjectSidebarCollapsed(false);
      }

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
      default:
        return 'Etsy CRM';
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'pipeline':
        return (
          <>
            <ProjectHeader />
            <KanbanBoard />
          </>
        );
      case 'customers':
        return (
          <div className="flex-1 p-4 md:p-6 overflow-hidden">
            <CustomerList onSelectCustomer={(id) => openCustomerDrawer(id)} />
          </div>
        );
      case 'analytics':
        return <Dashboard />;
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f7f7]">
      {/* Left Icon Sidebar */}
      <IconSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
      />

      {/* Left Project Sidebar - only show for pipeline and analytics views */}
      {(activeView === 'pipeline' || activeView === 'analytics') && (
        <ProjectSidebar
          collapsed={projectSidebarCollapsed}
          onToggle={() => setProjectSidebarCollapsed(!projectSidebarCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onMenuClick={() => {
            if (isMobile) {
              setSidebarCollapsed(!sidebarCollapsed);
            } else {
              setProjectSidebarCollapsed(!projectSidebarCollapsed);
            }
          }}
          title={getViewTitle()}
        />

        {/* Main Content */}
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
