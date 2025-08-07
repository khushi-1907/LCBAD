import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  MessageCircle, 
  Send, 
  X, 
  User, 
  Shield, 
  Eye, 
  EyeOff, 
  Clock, 
  Flame,
  Users,
  Search,
  Settings,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAnonymousChat, AnonymousUser, ChatMessage } from '@/hooks/useAnonymousChat';
import { useAuth } from '@/hooks/useAuth';

interface AnonymousChatProps {
  className?: string;
}

const AnonymousChat: React.FC<AnonymousChatProps> = ({ className }) => {
  const {
    isConnected,
    anonymousIdentity,
    messages,
    onlineUsers,
    isLoading,
    error,
    initializeAnonymousChat,
    sendMessage,
    burnMessage,
    updatePseudonym,
    discoverOnlineUsers,
    disconnect
  } = useAnonymousChat();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedUser, setSelectedUser] = useState<AnonymousUser | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messageOptions, setMessageOptions] = useState({
    ephemeral: false,
    burnAfterRead: false,
    expiresIn: 0 // 0 = no expiration
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [newPseudonym, setNewPseudonym] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter messages for current chat
  const currentChatMessages = messages.filter(msg => 
    selectedUser && (
      (msg.sender === anonymousIdentity?.address && msg.receiver === selectedUser.address) ||
      (msg.sender === selectedUser.address && msg.receiver === anonymousIdentity?.address)
    )
  );

  // Filter online users based on search
  const filteredUsers = onlineUsers.filter(user => 
    user.pseudonym.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedUser || !anonymousIdentity) return;

    try {
      await sendMessage(selectedUser.address, inputValue, messageOptions);
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserSelect = async (user: AnonymousUser) => {
    setSelectedUser(user);
  };

  const handleUpdatePseudonym = async () => {
    if (!newPseudonym.trim()) return;
    
    try {
      await updatePseudonym(newPseudonym);
      setNewPseudonym('');
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to update pseudonym:', error);
    }
  };

  const handleBurnMessage = (messageId: string) => {
    burnMessage(messageId);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 80) return 'text-green-500';
    if (reputation >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg"
        >
          <Shield className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-96 h-[600px] shadow-xl border-purple-500">
          <CardHeader className="bg-purple-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle className="text-lg">Anonymous Chat</CardTitle>
                {anonymousIdentity && (
                  <Badge variant="secondary" className="text-xs">
                    {anonymousIdentity.pseudonym}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-purple-700"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-purple-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-[520px]">
            {!isConnected ? (
              <div className="p-4">
                <div className="text-center space-y-4">
                  <Shield className="h-12 w-12 mx-auto text-purple-500" />
                  <h3 className="text-lg font-semibold">Anonymous Chat</h3>
                  <p className="text-sm text-gray-600">
                    Connect anonymously to start chatting
                  </p>
                  <Button
                    onClick={initializeAnonymousChat}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Anonymously'}
                  </Button>
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="h-[480px] flex flex-col">
                  {!selectedUser ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-2" />
                        <p>Select a user to start chatting</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Chat Header */}
                      <div className="p-3 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{selectedUser.pseudonym}</span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getReputationColor(selectedUser.reputation)}`}
                            >
                              {selectedUser.reputation}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {selectedUser.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <ScrollArea className="flex-1 p-3">
                        <div className="space-y-3">
                          {currentChatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === anonymousIdentity?.address ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg relative ${
                                  message.sender === anonymousIdentity?.address
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {message.isEphemeral && <Clock className="h-3 w-3" />}
                                  {message.isBurned && <Flame className="h-3 w-3" />}
                                  <span className="text-xs opacity-70">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                                <div className="whitespace-pre-wrap text-sm">
                                  {message.content}
                                </div>
                                {message.sender === anonymousIdentity?.address && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBurnMessage(message.id)}
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Message Options */}
                      <div className="p-3 border-t bg-gray-50">
                        <div className="flex items-center gap-4 mb-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="ephemeral"
                              checked={messageOptions.ephemeral}
                              onCheckedChange={(checked) => 
                                setMessageOptions(prev => ({ ...prev, ephemeral: checked }))
                              }
                            />
                            <Label htmlFor="ephemeral">Ephemeral</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="burn-after-read"
                              checked={messageOptions.burnAfterRead}
                              onCheckedChange={(checked) => 
                                setMessageOptions(prev => ({ ...prev, burnAfterRead: checked }))
                              }
                            />
                            <Label htmlFor="burn-after-read">Burn after read</Label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your anonymous message..."
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="users" className="h-[480px] flex flex-col">
                  <div className="p-3 border-b">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={discoverOnlineUsers}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.address}
                          className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                            selectedUser?.address === user.address ? 'bg-purple-50 border-purple-200' : ''
                          }`}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{user.pseudonym}</span>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getReputationColor(user.reputation)}`}
                              >
                                {user.reputation}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              {user.isOnline && (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <div className="absolute inset-0 bg-white z-10 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pseudonym">Update Pseudonym</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="pseudonym"
                        value={newPseudonym}
                        onChange={(e) => setNewPseudonym(e.target.value)}
                        placeholder="New pseudonym"
                      />
                      <Button onClick={handleUpdatePseudonym}>
                        Update
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Current Identity</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                      <div>Address: {anonymousIdentity?.address}</div>
                      <div>Pseudonym: {anonymousIdentity?.pseudonym}</div>
                      <div>Reputation: {anonymousIdentity?.reputation}</div>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={disconnect}
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnonymousChat; 