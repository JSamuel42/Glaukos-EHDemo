import TopBar from './TopBar';
import Sidebar from './Sidebar';
import MainArea from './MainArea';
import { SidebarProvider } from './SidebarContext';
import { ChatPanelProvider } from '@/components/chat/ChatPanelContext';
import ChatPanelHost from '@/components/chat/ChatPanelHost';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ChatPanelProvider initialOpen={false}>
        <div className="min-h-screen bg-serif-background">
          <TopBar />
          <Sidebar />
          <MainArea>{children}</MainArea>
          <ChatPanelHost />
        </div>
      </ChatPanelProvider>
    </SidebarProvider>
  );
}
