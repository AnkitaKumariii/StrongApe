import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/button"
import { UserCard } from "@/components/domain/UserCard"
import { Map, List, SlidersHorizontal, MapPin } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { Link } from "react-router-dom"

interface NearbyUser {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  current_streak: number;
  gym_name: string | null;
  distance_km: number;
}

export function Nearby() {
  const { user } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxDistance, setMaxDistance] = useState(50);
  const [showFilters, setShowFilters] = useState(false);

  const fetchNearby = async () => {
    try {
      setLoading(true);
      const data = await api.get<NearbyUser[]>(`/api/users/nearby?max_distance_km=${maxDistance}`);
      setNearbyUsers(data);
    } catch (err) {
      console.error("Failed to fetch nearby users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [maxDistance]);

  const hasLocation = user?.location_lat !== null && user?.location_lon !== null;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nearby Apes</h1>
          <p className="text-slate-500 font-medium">Find gym partners in your area.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full">
          <Button variant="ghost" className="rounded-full bg-white shadow-sm h-8 px-4 text-xs">
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button variant="ghost" className="rounded-full h-8 px-4 text-xs text-slate-500 hover:text-slate-900 cursor-not-allowed" disabled>
            <Map className="w-4 h-4 mr-2" />
            Map (Beta)
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">
            {loading ? "Searching..." : `${nearbyUsers.length} active partners near you`}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-full gap-2 border-slate-200 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Range: {maxDistance} km
          </Button>
        </div>

        {showFilters && (
          <Card className="border-slate-200 p-4 bg-white rounded-2xl">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Search Radius (km)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={maxDistance} 
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm font-black text-slate-900 w-12 text-right">{maxDistance} km</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium">Searching for nearby apes...</div>
      ) : !hasLocation ? (
        <Card className="border-slate-200 text-center py-12 bg-slate-50/50 max-w-xl mx-auto p-6 rounded-3xl">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">Location Not Set</h3>
          <p className="text-slate-500 font-medium mb-6">
            Please set your gym location and coordinates in your profile to find and match with other gym partners nearby!
          </p>
          <Button asChild className="rounded-full font-bold px-8 shadow-lg shadow-primary/20">
            <Link to="/profile">Update Profile Location</Link>
          </Button>
        </Card>
      ) : nearbyUsers.length === 0 ? (
        <Card className="border-slate-200 text-center py-12 bg-slate-50/50 max-w-xl mx-auto p-6 rounded-3xl">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">No partners found</h3>
          <p className="text-slate-500 font-medium mb-6">
            There are no other active apes within {maxDistance} km of your location. Try increasing the search range.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyUsers.map((u) => (
            <UserCard 
              key={u.id}
              name={u.full_name || u.username} 
              initials={u.full_name ? u.full_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()} 
              level={u.level} 
              distance={`${u.distance_km} km`} 
              tags={[u.gym_name || "Gym Athlete"]} 
              active={u.current_streak > 0} 
            />
          ))}
        </div>
      )}
    </Layout>
  )
}

// Inline card container to prevent import failures
function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white border rounded-xl shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}
