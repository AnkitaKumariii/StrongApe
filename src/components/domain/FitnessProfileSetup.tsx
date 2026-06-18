import { useState, useEffect } from "react"
import { Check, User, Target, Scale, Ruler, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { BackgroundBeams } from "@/components/ui/background-beams"
import TrueFocus from "@/components/ui/TrueFocus"

export function FitnessProfileSetup() {
  const { user, updateProfile } = useAuth()
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(() => !!user?.settings?.fitness_profile)

  const [formData, setFormData] = useState({
    primaryGoal: "",
    weight: "",
    height: "",
    dietMeat: true,
    dietLactose: false,
    dietVegan: false,
    dietGlutenFree: false,
    dietNutFree: false,
    allergyInput: "",
    allergies: [] as string[],
    eatingStyle: "",
    caffeine: "",
    sugar: ""
  })

  // Pre-fill form from user settings if already populated
  useEffect(() => {
    if (user?.settings?.fitness_profile) {
      const fp = user.settings.fitness_profile
      setFormData({
        primaryGoal: fp.primaryGoal || "",
        weight: fp.weight || "",
        height: fp.height || "",
        dietMeat: fp.dietMeat !== undefined ? fp.dietMeat : true,
        dietLactose: fp.dietLactose !== undefined ? fp.dietLactose : false,
        dietVegan: fp.dietVegan !== undefined ? fp.dietVegan : false,
        dietGlutenFree: fp.dietGlutenFree !== undefined ? fp.dietGlutenFree : false,
        dietNutFree: fp.dietNutFree !== undefined ? fp.dietNutFree : false,
        allergyInput: "",
        allergies: fp.allergies || [],
        eatingStyle: fp.eatingStyle || "",
        caffeine: fp.caffeine || "",
        sugar: fp.sugar || ""
      })
    }
  }, [user])

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddAllergy = () => {
    if (formData.allergyInput.trim() && !formData.allergies.includes(formData.allergyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, prev.allergyInput.trim()],
        allergyInput: ""
      }))
    }
  }

  const handleRemoveAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError("")
    setSaveSuccess(false)

    // Validate inputs
    if (!formData.primaryGoal) {
      setSaveError("Please select a primary goal.")
      return
    }
    if (!formData.weight || isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) <= 0) {
      setSaveError("Please enter a valid weight in kg.")
      return
    }
    if (!formData.height || isNaN(parseFloat(formData.height)) || parseFloat(formData.height) <= 0) {
      setSaveError("Please enter a valid height in cm.")
      return
    }
    if (!formData.eatingStyle) {
      setSaveError("Please select an eating style.")
      return
    }
    if (!formData.caffeine) {
      setSaveError("Please select caffeine consumption.")
      return
    }
    if (!formData.sugar) {
      setSaveError("Please select sugar consumption.")
      return
    }

    setSaveLoading(true)
    try {
      const { allergyInput, ...profileDetails } = formData
      await updateProfile({
        settings: {
          fitness_profile: profileDetails
        }
      })
      setSaveSuccess(true)
    } catch (err: any) {
      setSaveError(err.message || "Failed to save fitness profile.")
    } finally {
      setSaveLoading(false)
    }
  }

  // ─── Label helpers ────────────────────────────────────────────────────────
  const goalLabel: Record<string, string> = {
    muscle: "Build Muscle",
    weight: "Lose Weight",
    endurance: "Improve Endurance",
    health: "General Health",
  }
  const eatingLabel: Record<string, string> = {
    "3meals": "3 Meals / Day",
    fasting: "Intermittent Fasting",
    snacking: "Frequent Snacking",
  }
  const caffeineLabel: Record<string, string> = {
    none: "None",
    low: "Low (1 cup)",
    moderate: "Moderate (2–3 cups)",
    high: "High (4+ cups)",
  }
  const sugarLabel: Record<string, string> = {
    low: "Low (Mostly Natural)",
    moderate: "Moderate (Occasional Treats)",
    high: "High (Daily Sweets)",
  }

  // ─── BMI helper ───────────────────────────────────────────────────────────
  const bmi =
    formData.weight && formData.height
      ? (parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)
      : null

  // ─── Completed card ───────────────────────────────────────────────────────
  if (saveSuccess) {
    const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
      <div className="group relative rounded-2xl border border-slate-200/50 p-[3px]">
        <GlowingEffect blur={0} borderWidth={2} spread={60} glow={true} disabled={false} proximity={80} inactiveZone={0.01} />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1rem-3px)] bg-white/70 backdrop-blur-sm p-4 gap-1 shadow-sm z-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
          <span className="text-lg font-black text-slate-900 leading-tight">{value}</span>
          {sub && <span className="text-xs text-slate-400 font-medium">{sub}</span>}
        </div>
      </div>
    )

    return (
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight flex items-center justify-center gap-2">
              Your <span className="text-primary"><TrueFocus sentence="Fitness Profile" manualMode={true} blurAmount={2} /></span>
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-lg font-medium">
              All set! Here's a summary of your personal fitness profile.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-primary/20 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
            <BackgroundBeams />
            
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

            {/* User name & goal */}
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">
                {user?.username ?? user?.email ?? "Athlete"}
              </h2>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary font-bold text-sm">
                <Target className="w-4 h-4" />
                {goalLabel[formData.primaryGoal] ?? formData.primaryGoal}
              </span>
            </div>

            {/* Stats grid */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 relative z-10"
            >
              {[
                { label: "Weight", value: `${formData.weight} kg`, sub: undefined },
                { label: "Height", value: `${formData.height} cm`, sub: undefined },
                { label: "BMI", value: bmi ?? "—", sub: bmi ? "Body Mass Index" : undefined },
                {
                  label: "Diet",
                  value: formData.dietVegan ? "Vegan" : formData.dietMeat ? "Omnivore" : "Vegetarian",
                  sub: [
                    formData.dietLactose && "Lactose-free",
                    formData.dietGlutenFree && "Gluten-free",
                    formData.dietNutFree && "Nut-free",
                  ].filter(Boolean).join(" · ") || undefined,
                },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                >
                  <StatCard label={s.label} value={s.value} sub={s.sub} />
                </motion.div>
              ))}
            </motion.div>

            {/* Secondary info row */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 relative z-10"
            >
              {[
                { label: "Eating Style", value: eatingLabel[formData.eatingStyle] ?? formData.eatingStyle },
                { label: "Caffeine", value: caffeineLabel[formData.caffeine] ?? formData.caffeine },
                { label: "Sugar", value: sugarLabel[formData.sugar] ?? formData.sugar },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                >
                  <StatCard label={s.label} value={s.value} />
                </motion.div>
              ))}
            </motion.div>

            {/* Allergies */}
            {formData.allergies.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="relative z-10 mb-6"
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map(a => (
                    <span key={a} className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-lg">
                      {a}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Edit button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="relative z-10 mt-6"
            >
              <button
                onClick={() => setSaveSuccess(false)}
                className="w-full py-3.5 bg-white border-2 border-primary/30 hover:border-primary text-primary font-bold rounded-xl transition-all hover:bg-slate-50 text-sm tracking-wide shadow-sm"
              >
                Edit Profile
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Setup form ───────────────────────────────────────────────────────────
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Let's Create Your <span className="text-primary">Personal Profile</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
          Provide your fitness goals, body details, and dietary preferences
          to get a customized workout and nutrition strategy crafted just for you.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-xl relative overflow-hidden">
        {/* Decorative background matching app theme */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="text-center mb-6 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">Your <span className="text-primary"><TrueFocus sentence="Fitness Profile" manualMode={true} blurAmount={2} /></span></h2>
          </div>
        </div>

        <form className="space-y-5 relative z-10" onSubmit={handleSaveProfile}>

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Target className="w-4 h-4 text-primary" />
                Primary Goal *
              </label>
              <div className="relative">
                <select
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer text-sm"
                  value={formData.primaryGoal}
                  onChange={(e) => handleInputChange("primaryGoal", e.target.value)}
                >
                  <option value="" disabled>Select your goal</option>
                  <option value="muscle">Build Muscle</option>
                  <option value="weight">Lose Weight</option>
                  <option value="endurance">Improve Endurance</option>
                  <option value="health">General Health</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Scale className="w-4 h-4 text-primary" />
                Weight (kg) *
              </label>
              <input
                type="number"
                placeholder="e.g. 70"
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Ruler className="w-4 h-4 text-primary" />
                Height (cm) *
              </label>
              <input
                type="number"
                placeholder="e.g. 175"
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
              />
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dietary Preferences</h3>
            <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {([
                { field: "dietMeat", label: "I eat meat", emoji: "🥩" },
                { field: "dietVegan", label: "Vegan / Plant-based", emoji: "🌱" },
                { field: "dietLactose", label: "Lactose intolerant", emoji: "🥛" },
                { field: "dietGlutenFree", label: "Gluten-Free", emoji: "🌾" },
                { field: "dietNutFree", label: "Nut-Free", emoji: "🥜" },
              ] as { field: keyof typeof formData; label: string; emoji: string }[]).map(({ field, label, emoji }) => (
                <label key={field} className={cn(
                  "flex items-center gap-2 cursor-pointer group px-4 py-2 rounded-full transition-all border text-sm font-bold shadow-sm select-none",
                  formData[field] 
                    ? "bg-primary border-primary text-white" 
                    : "bg-white border-slate-200 text-slate-600 hover:border-primary/40 hover:bg-slate-50"
                )}>
                  <span>{emoji}</span>
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={!!formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.checked)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Allergies</label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter an allergy"
                className="flex-1 h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                value={formData.allergyInput}
                onChange={(e) => handleInputChange("allergyInput", e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
              />
              <button
                type="button"
                className="h-11 px-5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors text-sm"
                onClick={handleAddAllergy}
              >
                Add
              </button>
            </div>
            {formData.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.allergies.map(allergy => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={allergy}
                    className="flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 shadow-sm"
                  >
                    {allergy}
                    <button onClick={() => handleRemoveAllergy(allergy)} className="text-red-400 hover:text-red-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Lifestyle Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Eating Style *
              </label>
              <div className="relative">
                <select
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer text-sm"
                  value={formData.eatingStyle}
                  onChange={(e) => handleInputChange("eatingStyle", e.target.value)}
                >
                  <option value="" disabled>Select style</option>
                  <option value="3meals">3 Meals/Day</option>
                  <option value="fasting">Intermittent Fasting</option>
                  <option value="snacking">Frequent Snacking</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Caffeine *
              </label>
              <div className="relative">
                <select
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer text-sm"
                  value={formData.caffeine}
                  onChange={(e) => handleInputChange("caffeine", e.target.value)}
                >
                  <option value="" disabled>Select level</option>
                  <option value="none">None</option>
                  <option value="low">Low (1 cup)</option>
                  <option value="moderate">Moderate (2-3)</option>
                  <option value="high">High (4+)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sugar *
              </label>
              <div className="relative">
                <select
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer text-sm"
                  value={formData.sugar}
                  onChange={(e) => handleInputChange("sugar", e.target.value)}
                >
                  <option value="" disabled>Select level</option>
                  <option value="low">Low (Natural)</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High (Daily)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {saveError && (
            <div className="p-4 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
              {saveError}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={saveLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-lg transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saveLoading ? "Saving..." : "Save Profile"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
