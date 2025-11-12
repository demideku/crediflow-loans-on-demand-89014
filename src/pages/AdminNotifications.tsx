import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, ArrowLeft, Bell, Send, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    recipient: "all",
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchUsers();
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('loan_applications')
      .select('user_id, full_name, email')
      .order('created_at', { ascending: false });

    if (data) {
      // Remove duplicates by user_id
      const uniqueUsers = Array.from(
        new Map(data.map(item => [item.user_id, item])).values()
      );
      setUsers(uniqueUsers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      if (!formData.title.trim() || !formData.message.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Determine recipient user IDs
      let userIds: string[] = [];
      if (formData.recipient === "all") {
        userIds = users.map(u => u.user_id);
      } else {
        userIds = [formData.recipient];
      }

      // Insert notifications for each user
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title: formData.title,
        message: formData.message,
        type: formData.type,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast({
        title: "Notifications Sent! 🎉",
        description: `Successfully sent to ${userIds.length} user(s)`,
      });

      // Reset form
      setFormData({
        recipient: "all",
        title: "",
        message: "",
        type: "info",
      });
    } catch (error: any) {
      console.error('Error sending notifications:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notifications",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CrediFlow Admin
              </span>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Send Notifications</h1>
          </div>
          <p className="text-muted-foreground">Send in-app notifications to users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Notification Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Create Notification</CardTitle>
              <CardDescription>
                Send a notification to all users or a specific user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select
                    value={formData.recipient}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, recipient: value }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          All Users ({users.length})
                        </div>
                      </SelectItem>
                      <Separator className="my-2" />
                      {users.map(user => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Notification title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Your notification message..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base"
                  disabled={isSending}
                >
                  {isSending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How the notification will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border-l-4 ${
                formData.type === 'info' ? 'bg-blue-50 border-blue-500' :
                formData.type === 'success' ? 'bg-green-50 border-green-500' :
                formData.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-red-50 border-red-500'
              }`}>
                <h3 className="font-semibold text-lg mb-2">
                  {formData.title || "Notification Title"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formData.message || "Your notification message will appear here..."}
                </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipients:</span>
                  <span className="font-medium">
                    {formData.recipient === "all" ? `${users.length} users` : "1 user"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{formData.type}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
