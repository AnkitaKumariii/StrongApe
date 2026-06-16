import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Users, Search, Plus } from "lucide-react"
import { api } from "@/lib/api"

interface Community {
  id: number;
  name: string;
  description: string;
  cover_image_url: string | null;
  category: string;
  member_count: number;
  is_member: boolean;
}

export function Communities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "joined" | "Powerlifting" | "Running" | "CrossFit">("all");
  const [searchText, setSearchText] = useState("");

  // Create Community Dialog states
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Powerlifting");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      let data: Community[] = [];
      if (activeTab === "joined") {
        data = await api.get<Community[]>("/api/communities/joined");
      } else if (activeTab === "all") {
        data = await api.get<Community[]>("/api/communities");
      } else {
        data = await api.get<Community[]>(`/api/communities?category=${activeTab}`);
      }
      setCommunities(data);
    } catch (err) {
      console.error("Failed to fetch communities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [activeTab]);

  const handleJoin = async (id: number) => {
    try {
      await api.post(`/api/communities/${id}/join`);
      setCommunities(
        communities.map((c) =>
          c.id === id ? { ...c, is_member: true, member_count: c.member_count + 1 } : c
        )
      );
    } catch (err) {
      console.error("Failed to join community:", err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateLoading(true);

    try {
      if (name.length < 3) {
        throw new Error("Community name must be at least 3 characters.");
      }
      if (description.length < 10) {
        throw new Error("Description must be at least 10 characters.");
      }

      await api.post<Community>("/api/communities", {
        name,
        description,
        category
      });

      // Clear fields and close dialog
      setName("");
      setDescription("");
      setIsOpen(false);
      
      // Refresh communities list
      await fetchCommunities();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create community. Check if the name is already taken!");
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase()) ||
    c.description.toLowerCase().includes(searchText.toLowerCase()) ||
    c.category.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Communities</h1>
          <p className="text-slate-500 font-medium">Join groups that match your training style.</p>
        </div>
        <Button onClick={() => { setCreateError(""); setIsOpen(true); }} className="rounded-full font-bold shadow-lg shadow-primary/20 gap-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          Create Community
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search communities by name, sport, or goal..." 
            className="pl-9 h-12 rounded-xl border-slate-200 bg-white"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <Button 
            variant={activeTab === "all" ? "secondary" : "outline"} 
            onClick={() => setActiveTab("all")}
            className="rounded-full whitespace-nowrap cursor-pointer"
          >
            All Groups
          </Button>
          <Button 
            variant={activeTab === "joined" ? "secondary" : "outline"} 
            onClick={() => setActiveTab("joined")}
            className="rounded-full whitespace-nowrap cursor-pointer"
          >
            My Groups
          </Button>
          <Button 
            variant={activeTab === "Powerlifting" ? "secondary" : "outline"} 
            onClick={() => setActiveTab("Powerlifting")}
            className="rounded-full whitespace-nowrap cursor-pointer"
          >
            Powerlifting
          </Button>
          <Button 
            variant={activeTab === "Running" ? "secondary" : "outline"} 
            onClick={() => setActiveTab("Running")}
            className="rounded-full whitespace-nowrap cursor-pointer"
          >
            Running
          </Button>
          <Button 
            variant={activeTab === "CrossFit" ? "secondary" : "outline"} 
            onClick={() => setActiveTab("CrossFit")}
            className="rounded-full whitespace-nowrap cursor-pointer"
          >
            CrossFit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: "Morning Lifters", members: "1.2k", type: "General Fitness", active: true },
          { name: "Powerlifting India", members: "8.4k", type: "Strength", active: false },
          { name: "5K Every Day", members: "3.2k", type: "Cardio", active: true },
          { name: "Calisthenics Pros", members: "840", type: "Bodyweight", active: false },
          { name: "Yoga & Mobility", members: "4.5k", type: "Recovery", active: false },
          { name: "Hyrox Training", members: "1.1k", type: "Hybrid", active: true },
        ].map((community) => (
          <Card key={community.name} className="border-slate-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">{community.name}</h3>
              <p className="text-sm font-semibold text-slate-500 mb-4">{community.type}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-300"></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{community.members}</span>
                </div>
                {community.active ? (
                  <Button size="sm" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5">Joined</Button>
                ) : (
                  <Button size="sm" className="rounded-full">Join</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
