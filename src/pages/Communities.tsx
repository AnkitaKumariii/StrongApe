import { useState, useEffect, useRef } from "react"
import { Layout } from "@/components/layout/Layout"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Users, Search, Plus, ChevronRight, ChevronLeft, TrendingUp, Star, Flame, Dumbbell, Wind, Zap, Activity, Shield, Pencil, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

interface Community {
  id: number;
  name: string;
  description: string;
  cover_image_url: string | null;
  category: string;
  member_count: number;
  is_member: boolean;
  is_admin: boolean;
}

// All categories use the site's primary blue palette for brand consistency
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Powerlifting": <Dumbbell className="w-5 h-5" />,
  "Running": <Wind className="w-5 h-5" />,
  "CrossFit": <Zap className="w-5 h-5" />,
  "General Fitness": <Activity className="w-5 h-5" />,
  "Yoga & Mobility": <Shield className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Powerlifting": "from-primary to-blue-700",
  "Running": "from-blue-500 to-primary",
  "CrossFit": "from-blue-600 to-indigo-700",
  "General Fitness": "from-primary to-blue-500",
  "Yoga & Mobility": "from-blue-700 to-primary",
};

const CATEGORY_BG: Record<string, string> = {
  "Powerlifting": "bg-primary/10 text-primary",
  "Running": "bg-primary/10 text-primary",
  "CrossFit": "bg-primary/10 text-primary",
  "General Fitness": "bg-primary/10 text-primary",
  "Yoga & Mobility": "bg-primary/10 text-primary",
};

function formatMemberCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function CommunityCard({ community, onJoin, onEdit, onDelete }: {
  community: Community;
  onJoin: (id: number) => void;
  onEdit: (community: Community) => void;
  onDelete: (community: Community) => void;
}) {
  const gradient = CATEGORY_COLORS[community.category] || "from-primary to-blue-600";
  const badge = CATEGORY_BG[community.category] || "bg-primary/10 text-primary";
  const icon = CATEGORY_ICONS[community.category] || <Users className="w-5 h-5" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group flex flex-col h-full"
    >
      {/* Banner */}
      <div className={`h-16 bg-gradient-to-r ${gradient} relative overflow-hidden shrink-0`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/30" />
          <div className="absolute -left-2 -bottom-4 w-16 h-16 rounded-full bg-white/20" />
        </div>
        {/* Edit + Delete buttons — only shown for admins on hover */}
        {community.is_admin && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(community); }}
              className="w-7 h-7 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center text-white transition-all cursor-pointer"
              title="Edit community"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(community); }}
              className="w-7 h-7 bg-red-500/70 hover:bg-red-500 backdrop-blur-sm rounded-lg flex items-center justify-center text-white transition-all cursor-pointer"
              title="Delete community"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Community Icon - overlapping banner */}
      <div className="px-5 relative">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md -mt-7 border-4 border-white group-hover:scale-105 transition-transform duration-300`}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-3 pb-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
              sa/{community.name}
            </h3>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${badge}`}>
              {community.category}
            </span>
          </div>
          {community.is_member ? (
            <button
              className="shrink-0 px-4 py-1.5 text-xs font-bold rounded-full border-2 border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-colors cursor-default"
              disabled
            >
              Joined ✓
            </button>
          ) : (
            <button
              onClick={() => onJoin(community.id)}
              className="shrink-0 px-4 py-1.5 text-xs font-bold rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/30 cursor-pointer"
            >
              + Join
            </button>
          )}
        </div>

        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mt-2 flex-1">
          {community.description}
        </p>

        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-100">
          <div className="flex -space-x-1.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border-2 border-white bg-gradient-to-br ${gradient} opacity-${80 - i * 20}`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500 ml-1">
            {formatMemberCount(community.member_count)} {community.member_count === 1 ? "member" : "members"}
          </span>
          {community.member_count > 100 && (
            <span className="ml-auto flex items-center gap-0.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-2.5 h-2.5" /> Active
            </span>
          )}
          {/* Admin badge */}
          {community.is_admin && (
            <span className="ml-auto flex items-center gap-0.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Pencil className="w-2.5 h-2.5" /> Admin
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const FILTER_TABS = [
  { value: "all", label: "All Groups", icon: <Star className="w-3.5 h-3.5" /> },
  { value: "joined", label: "My Groups", icon: <Users className="w-3.5 h-3.5" /> },
  { value: "Powerlifting", label: "Powerlifting", icon: <Dumbbell className="w-3.5 h-3.5" /> },
  { value: "Running", label: "Running", icon: <Wind className="w-3.5 h-3.5" /> },
  { value: "CrossFit", label: "CrossFit", icon: <Zap className="w-3.5 h-3.5" /> },
  { value: "General Fitness", label: "General Fitness", icon: <Activity className="w-3.5 h-3.5" /> },
  { value: "Yoga & Mobility", label: "Yoga & Mobility", icon: <Shield className="w-3.5 h-3.5" /> },
] as const;

type TabValue = typeof FILTER_TABS[number]["value"];

export function Communities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchText, setSearchText] = useState("");

  // Create Community Dialog
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Powerlifting");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit Community Dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editCommunity, setEditCommunity] = useState<Community | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Powerlifting");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Community
  const [deleteTarget, setDeleteTarget] = useState<Community | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Tab scroll
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollState = () => {
    if (!tabsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    checkScrollState();
    const el = tabsRef.current;
    if (el) el.addEventListener("scroll", checkScrollState);
    window.addEventListener("resize", checkScrollState);
    return () => {
      if (el) el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, []);

  const scrollTabs = (dir: "left" | "right") => {
    if (!tabsRef.current) return;
    tabsRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const fetchCommunities = async (tab?: TabValue) => {
    const currentTab = tab ?? activeTab;
    try {
      setLoading(true);
      let data: Community[] = [];
      if (currentTab === "joined") {
        data = await api.get<Community[]>("/api/communities/joined");
      } else if (currentTab === "all") {
        data = await api.get<Community[]>("/api/communities");
      } else {
        data = await api.get<Community[]>(`/api/communities?category=${currentTab}`);
      }
      setCommunities(data);
    } catch (err) {
      console.error("Failed to fetch communities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities(activeTab);
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

  const handleOpenCreate = () => {
    setCreateError("");
    if (activeTab !== "all" && activeTab !== "joined") {
      setCategory(activeTab as string);
    } else {
      setCategory("Powerlifting");
    }
    setIsOpen(true);
  };

  const handleOpenEdit = (community: Community) => {
    setEditCommunity(community);
    setEditName(community.name);
    setEditDescription(community.description);
    setEditCategory(community.category);
    setEditError("");
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCommunity) return;
    setEditError("");
    setEditLoading(true);

    try {
      if (editName.length < 3) throw new Error("Community name must be at least 3 characters.");
      if (editDescription.length < 10) throw new Error("Description must be at least 10 characters.");

      const updated = await api.patch<Community>(`/api/communities/${editCommunity.id}`, {
        name: editName,
        description: editDescription,
        category: editCategory,
      });

      // Update in-place in the list
      setCommunities(communities.map((c) => c.id === editCommunity.id ? { ...c, ...updated } : c));
      setEditOpen(false);
      setEditCommunity(null);
    } catch (err: any) {
      setEditError(err.message || "Failed to update community.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/communities/${deleteTarget.id}`);
      setCommunities(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      console.error("Failed to delete community:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateLoading(true);

    try {
      if (name.length < 3) throw new Error("Community name must be at least 3 characters.");
      if (description.length < 10) throw new Error("Description must be at least 10 characters.");

      await api.post<Community>("/api/communities", { name, description, category });

      setName("");
      setDescription("");
      setCategory("Powerlifting");
      setIsOpen(false);
      setActiveTab("all"); // triggers useEffect → re-fetch
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

  const activeTabData = FILTER_TABS.find(t => t.value === activeTab);

  return (
    <Layout>
      {/* Page Header - Reddit-inspired */}
      <div className="mb-8">
        {/* Hero banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-indigo-700 p-8 mb-8 shadow-xl shadow-primary/20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10" />
            <div className="absolute -left-6 -bottom-12 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute right-1/3 top-0 w-px h-full bg-white/10" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">StrongApe Communities</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">Explore Communities</h1>
              <p className="text-blue-100 font-medium max-w-md">
                Find your tribe. Join groups that match your training style, goals, and ambitions.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200 cursor-pointer whitespace-nowrap self-start md:self-center"
            >
              <Plus className="w-4 h-4" />
              Create Community
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            placeholder="Search communities by name, category, or goal..."
            className="w-full pl-12 pr-4 h-12 rounded-full border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
          )}
          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  activeTab === tab.value
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          {canScrollRight && (
            <button
              onClick={() => scrollTabs("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Section heading */}
      {!searchText && activeTabData && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            {activeTabData.icon}
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">{activeTabData.label}</h2>
          {!loading && (
            <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {filteredCommunities.length}
            </span>
          )}
        </div>
      )}
      {searchText && (
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-black text-slate-900">
            Results for <span className="text-primary">"{searchText}"</span>
          </h2>
          <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {filteredCommunities.length}
          </span>
        </div>
      )}

      {/* Community Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-16 bg-slate-200" />
              <div className="px-5 pt-3 pb-5">
                <div className="flex gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 -mt-7" />
                  <div className="flex-1 mt-2 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                </div>
                <div className="h-px bg-slate-100 mt-4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCommunities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No communities found</h3>
          <p className="text-slate-500 font-medium max-w-sm mb-6">
            {searchText
              ? `No results for "${searchText}". Try a different search term.`
              : "No communities in this category yet. Be the first to create one!"}
          </p>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Community
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredCommunities.map((community, i) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="h-full"
              >
                <CommunityCard
                  community={community}
                  onJoin={handleJoin}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteTarget}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Edit Community Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 max-w-md p-0 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 pb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Pencil className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-xl font-black text-white tracking-tight">Edit Community</DialogTitle>
            </div>
            <DialogDescription className="text-blue-100 font-medium text-sm mt-1">
              Update the name, category, or description of your community.
            </DialogDescription>
          </div>

          <form onSubmit={handleEditSubmit} className="p-6 -mt-4 bg-white rounded-t-3xl space-y-4">
            {editError && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {editError}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Community Name</label>
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                required
              >
                <option value="Powerlifting">🏋️ Powerlifting</option>
                <option value="Running">🏃 Running</option>
                <option value="CrossFit">⚡ CrossFit</option>
                <option value="General Fitness">💪 General Fitness</option>
                <option value="Yoga & Mobility">🧘 Yoga &amp; Mobility</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none h-24"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="flex-1 h-11 rounded-full font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={editLoading}
              >
                {editLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : "Save Changes ✓"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Create Community Dialog ── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 max-w-md p-0 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-blue-600 p-6 pb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-xl font-black text-white tracking-tight">Create Community</DialogTitle>
            </div>
            <DialogDescription className="text-blue-100 font-medium text-sm mt-1">
              Start a new group and invite others to train with you.
            </DialogDescription>
          </div>

          <form onSubmit={handleCreateSubmit} className="p-6 -mt-4 bg-white rounded-t-3xl space-y-4">
            {createError && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {createError}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Community Name</label>
              <Input
                type="text"
                placeholder="Morning Lifters Delhi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                required
              >
                <option value="Powerlifting">🏋️ Powerlifting</option>
                <option value="Running">🏃 Running</option>
                <option value="CrossFit">⚡ CrossFit</option>
                <option value="General Fitness">💪 General Fitness</option>
                <option value="Yoga & Mobility">🧘 Yoga &amp; Mobility</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
              <textarea
                placeholder="A group for powerlifters training at 6 AM in Delhi. Let's push each other!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none h-24"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={createLoading}
            >
              {createLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : "Create Community 🚀"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Community Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:rounded-3xl border-slate-200 max-w-sm p-0 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 pb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-xl font-black text-white tracking-tight">Delete Community</DialogTitle>
            </div>
            <DialogDescription className="text-red-100 font-medium text-sm mt-1">
              This action is permanent and cannot be undone.
            </DialogDescription>
          </div>

          <div className="p-6 -mt-4 bg-white rounded-t-3xl space-y-4">
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-black text-slate-900">sa/{deleteTarget?.name}</span>?{" "}
              All members will be removed and the community will be gone forever.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 h-11 rounded-full font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCommunity}
                disabled={deleteLoading}
                className="flex-1 h-11 rounded-full font-bold bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : "Delete Forever 🗑️"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>

  )
}
