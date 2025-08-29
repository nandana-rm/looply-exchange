import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ChatThread, Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Messages = () => {
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const { data: threads = [] } = useQuery({
    queryKey: ['chat-threads', user?.id],
    queryFn: () => user ? chatApi.getChatThreads(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedThread?.id],
    queryFn: () => selectedThread ? chatApi.getMessages(selectedThread.id) : Promise.resolve([]),
    enabled: !!selectedThread
  });

  const filteredThreads = threads.filter(thread =>
    thread.participants.some(p => 
      p.id !== user?.id && 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !user) return;

    try {
      await chatApi.sendMessage({
        threadId: selectedThread.id,
        senderId: user.id,
        content: newMessage.trim(),
        type: 'text',
        isRead: false
      });
      setNewMessage('');
      toast({
        title: 'Message sent!',
        description: 'Your message has been delivered.',
      });
    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Send className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login to View Messages
          </h2>
          <p className="text-muted-foreground mb-6">
            Connect with other members and start meaningful conversations.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/register">Sign Up</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-background">
      <div className="flex h-full">
        {/* Chat List Sidebar */}
        <div className="w-full md:w-80 bg-card border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No conversations yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start chatting by messaging someone about their item!
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredThreads.map((thread) => {
                  const otherParticipant = thread.participants.find(p => p.id !== user?.id);
                  const isSelected = selectedThread?.id === thread.id;
                  
                  return (
                    <motion.div
                      key={thread.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={cn(
                          "mb-2 cursor-pointer transition-colors hover:bg-muted/50",
                          isSelected && "bg-primary/10 border-primary"
                        )}
                        onClick={() => setSelectedThread(thread)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={otherParticipant?.avatar} />
                              <AvatarFallback>
                                {otherParticipant?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm text-foreground truncate">
                                  {otherParticipant?.name}
                                </h3>
                                {otherParticipant?.role === 'ngo' && (
                                  <Badge className="ml-2 text-xs bg-primary text-primary-foreground">
                                    NGO
                                  </Badge>
                                )}
                              </div>
                              
                              {thread.lastMessage && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {thread.lastMessage.content}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-1">
                                {thread.relatedItem && (
                                  <span className="text-xs text-primary truncate">
                                    Re: {thread.relatedItem.title}
                                  </span>
                                )}
                                {thread.lastMessage && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(thread.lastMessage.createdAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col bg-background",
          "md:block", // Always show on desktop
          selectedThread ? "block" : "hidden" // Show on mobile only when thread selected
        )}>
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-card border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSelectedThread(null)}
                  >
                    ←
                  </Button>
                  
                  {(() => {
                    const otherParticipant = selectedThread.participants.find(p => p.id !== user?.id);
                    return (
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherParticipant?.avatar} />
                          <AvatarFallback>
                            {otherParticipant?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-semibold text-foreground flex items-center space-x-2">
                            <span>{otherParticipant?.name}</span>
                            {otherParticipant?.role === 'ngo' && (
                              <Badge className="text-xs bg-primary text-primary-foreground">
                                NGO
                              </Badge>
                            )}
                          </h2>
                          {selectedThread.relatedItem && (
                            <p className="text-sm text-muted-foreground">
                              About: {selectedThread.relatedItem.title}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        message.senderId === user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                          message.senderId === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          message.senderId === user?.id
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground/70"
                        )}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 bg-card border-t border-border">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the left to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;