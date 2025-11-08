import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeDashboard } from './HomeDashboard';
import { AiChat } from './AiChat';
import { Glossary } from './Glossary';
import { Profile } from './Profile';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import '../styles/tabs.css';

export function Home() {
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');

  useEffect(() => {
    const handler = () => setActiveTab('ai');
    window.addEventListener('ai-navigate', handler as EventListener);
    return () => window.removeEventListener('ai-navigate', handler as EventListener);
  }, []);
  return (
    <div className="container mx-auto py-6">
  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full">
        <div className="relative mb-8 mt-5">
          <h1 className="absolute left-0 top-1/2 transform -translate-y-1/2 text-2xl font-bold tracking-tight">
            Medphonics
          </h1>

          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <TabsList className="grid w-[420px] grid-cols-3">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="ai">AI Assistant</TabsTrigger>
              <TabsTrigger value="glossary">Glossary</TabsTrigger>
            </TabsList>
          </div>

          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="ml-4"
                    onClick={() => setShowProfile(true)}
                    aria-label="Open profile"
                  >
                    <Avatar className="h-10 w-10 cursor-pointer border">
                      <AvatarImage src="/avatars/placeholder.png" alt="Profile" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className="space-y-2">
                  <div className="cursor-pointer text-sm text-muted-foreground">Settings</div>
                  <div className="cursor-pointer text-sm text-muted-foreground">Logout</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <TabsContent value="home">
          <HomeDashboard />
        </TabsContent>

        <TabsContent value="ai">
          <AiChat />
        </TabsContent>

        <TabsContent value="glossary">
          <Glossary />
        </TabsContent>
      </Tabs>
      {showProfile && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowProfile(false)}>
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <Profile />
          </div>
        </div>
      )}
    </div>
  );
}