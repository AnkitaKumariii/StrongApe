import { useState } from "react"
import { Check, User, Target, Scale, Ruler, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function FitnessProfileSetup() {
  const [formData, setFormData] = useState({
    primaryGoal: "",
    weight: "",
    height: "",
    dietMeat: true,
    dietLactose: false,
    allergyInput: "",
    allergies: [] as string[],
    eatingStyle: "",
    caffeine: "",
    sugar: ""
  })

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

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Get Started with Your <span className="text-primary">Personal Profile</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
          Tell us about your fitness goals and preferences so we can create the perfect
          workout and nutrition plan just for you.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
        {/* Decorative background matching app theme */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="text-center mb-10 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Your Fitness Profile</h2>
          </div>
          <p className="text-slate-500 font-medium">Tell us about yourself to get personalized workout and meal plans</p>
        </div>

        <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
          
          {/* Primary Goal */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
              <Target className="w-4 h-4 text-primary" />
              Primary Goal *
            </label>
            <div className="relative">
              <select 
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={formData.primaryGoal}
                onChange={(e) => handleInputChange("primaryGoal", e.target.value)}
              >
                <option value="" disabled>Select your primary goal</option>
                <option value="muscle">Build Muscle</option>
                <option value="weight">Lose Weight</option>
                <option value="endurance">Improve Endurance</option>
                <option value="health">General Health</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Scale className="w-4 h-4 text-primary" />
                Weight (kg) *
              </label>
              <input 
                type="number"
                placeholder="e.g. 70"
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <Ruler className="w-4 h-4 text-primary" />
                Height (cm) *
              </label>
              <input 
                type="number"
                placeholder="e.g. 175"
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
              />
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Dietary Preferences</h3>
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center border transition-all duration-200 shadow-sm", 
                  formData.dietMeat ? "bg-primary border-primary" : "bg-white border-slate-300 group-hover:border-primary/50"
                )}>
                  {formData.dietMeat && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-slate-700 font-bold">I eat meat</span>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.dietMeat}
                  onChange={(e) => handleInputChange("dietMeat", e.target.checked)}
                />
              </label>
              
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center border transition-all duration-200 shadow-sm", 
                  formData.dietLactose ? "bg-primary border-primary" : "bg-white border-slate-300 group-hover:border-primary/50"
                )}>
                  {formData.dietLactose && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-slate-700 font-bold">I am lactose intolerant</span>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.dietLactose}
                  onChange={(e) => handleInputChange("dietLactose", e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Allergies</label>
            <div className="flex gap-4">
              <input 
                type="text"
                placeholder="Enter an allergy"
                className="flex-1 h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.allergyInput}
                onChange={(e) => handleInputChange("allergyInput", e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
              />
              <button 
                type="button"
                className="h-14 px-8 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
                onClick={handleAddAllergy}
              >
                Add
              </button>
            </div>
            {formData.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.allergies.map(allergy => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={allergy} 
                    className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-lg text-sm font-bold text-red-600 shadow-sm"
                  >
                    {allergy}
                    <button onClick={() => handleRemoveAllergy(allergy)} className="text-red-400 hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Eating Style */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Eating Style *
            </label>
            <div className="relative">
              <select 
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={formData.eatingStyle}
                onChange={(e) => handleInputChange("eatingStyle", e.target.value)}
              >
                <option value="" disabled>Select your eating style</option>
                <option value="3meals">3 Meals/Day</option>
                <option value="fasting">Intermittent Fasting</option>
                <option value="snacking">Frequent Snacking</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Caffeine Consumption */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Caffeine Consumption *
            </label>
            <div className="relative">
              <select 
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={formData.caffeine}
                onChange={(e) => handleInputChange("caffeine", e.target.value)}
              >
                <option value="" disabled>Select caffeine level</option>
                <option value="none">None</option>
                <option value="low">Low (1 cup)</option>
                <option value="moderate">Moderate (2-3 cups)</option>
                <option value="high">High (4+ cups)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Sugar Consumption */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Sugar Consumption *
            </label>
            <div className="relative">
              <select 
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={formData.sugar}
                onChange={(e) => handleInputChange("sugar", e.target.value)}
              >
                <option value="" disabled>Select sugar consumption</option>
                <option value="low">Low (Mostly Natural)</option>
                <option value="moderate">Moderate (Occasional Treats)</option>
                <option value="high">High (Daily Sweets)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="pt-8">
            <button 
              type="button"
              className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-lg transition-colors shadow-lg shadow-primary/20"
            >
              Save Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
