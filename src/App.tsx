import { useState, useEffect } from 'react';
import IconSidebar from './components/sidebar/IconSidebar';
import ProjectSidebar from './components/sidebar/ProjectSidebar';
import Header from './components/header/Header';
import ProjectHeader from './components/header/ProjectHeader';
import KanbanBoard from './components/kanban/KanbanBoard';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectSidebarCollapsed, setProjectSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f7f7f7]">
      {/* Left Icon Sidebar */}
      <IconSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
      />

      {/* Left Project Sidebar */}
      <ProjectSidebar
        collapsed={projectSidebarCollapsed}
        onToggle={() => setProjectSidebarCollapsed(!projectSidebarCollapsed)}
      />

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
        />

        {/* Project Header */}
        <ProjectHeader />

        {/* Kanban Board */}
        <KanbanBoard />
      </div>
    </div>
  );
}

export default App;
