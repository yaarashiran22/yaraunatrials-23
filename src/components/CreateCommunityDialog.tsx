import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunities } from "@/hooks/useCommunities";
import { useToast } from "@/hooks/use-toast";

const CreateCommunityDialog = () => {
  const { user } = useAuth();
  const { createCommunity } = useCommunities();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'interests' as 'interests' | 'causes' | 'identity',
    subcategory: '',
    access_type: 'closed' as 'open' | 'closed' | 'invite_only'
  });

  const categories = {
    interests: ['Skating', 'Salsa', 'Yoga', 'Foodies', 'Techies', 'Expats', 'Photography', 'Music', 'Sports'],
    causes: ['Volunteering', 'Sustainability', 'Arts', 'Education', 'Animals', 'Environment', 'Health'],
    identity: ['Young Expats', 'Digital Nomads', 'Queer Community', 'Parents', 'Students', 'Professionals']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to create a community",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a community name",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      await createCommunity({
        ...formData,
        creator_id: user.id,
        name: formData.name.trim(),
        tagline: formData.tagline.trim() || null,
        description: formData.description.trim() || null,
        subcategory: formData.subcategory || null
      });

      toast({
        title: "Community Created!",
        description: `${formData.name} has been created successfully`,
      });

      setFormData({
        name: '',
        tagline: '',
        description: '',
        category: 'interests',
        subcategory: '',
        access_type: 'closed'
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Palermo Salsa Dancers"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="Brief description in one line"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value, subcategory: '' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interests">Interests</SelectItem>
                  <SelectItem value="causes">Causes</SelectItem>
                  <SelectItem value="identity">Identity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select 
                value={formData.subcategory} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {categories[formData.category].map((sub) => (
                    <SelectItem key={sub} value={sub.toLowerCase()}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Access Type</Label>
            <Select 
              value={formData.access_type} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, access_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open - Anyone can join</SelectItem>
                <SelectItem value="closed">Closed - Approval required</SelectItem>
                <SelectItem value="invite_only">Invite Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your community, its purpose, and what members can expect..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={creating} className="flex-1">
              {creating ? "Creating..." : "Create Community"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityDialog;