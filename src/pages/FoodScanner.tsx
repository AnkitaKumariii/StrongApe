import { useRef, useState, useCallback } from "react"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Camera, Upload, Loader2, Flame, Beef, Wheat, Droplets, AlertCircle } from "lucide-react"
import TextType from "@/components/ui/TextType"
import { CanvasText } from "@/components/ui/canvas-text"
import { FileUpload } from "@/components/ui/file-upload"

interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface FoodAnalysis {
  food_items: string[]
  nutrition: NutritionInfo
  health_benefits: string[]
  concerns: string[]
}

interface FoodScanResponse {
  success: boolean
  analysis?: FoodAnalysis
  error?: string
}

const VALID_TYPES = ["image/jpeg", "image/png", "image/gif"]
const MAX_SIZE = 10 * 1024 * 1024

export function FoodScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null)

  const analyzeFile = useCallback(async (file: File) => {
    if (!VALID_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and GIF images are supported.")
      return
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be 10MB or smaller.")
      return
    }

    setError(null)
    setAnalysis(null)
    setPreviewUrl(URL.createObjectURL(file))
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const result = await api.post<FoodScanResponse>("/api/food-scanner", formData)

      if (!result.success || !result.analysis) {
        setError(result.error || "Failed to analyze food image.")
        return
      }

      setAnalysis(result.analysis)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze food image."
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) analyzeFile(file)
    },
    [analyzeFile]
  )

  const reset = () => {
    setPreviewUrl(null)
    setAnalysis(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-4 py-8">
        <div className="w-full text-center mb-10">
          <h1 className="group relative text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
            AI{" "}
            <CanvasText
              text="Food Scanner"
              backgroundClassName="bg-slate-900"
              colors={[
                "rgba(0, 104, 249, 1)",
                "rgba(0, 104, 249, 0.9)",
                "rgba(0, 104, 249, 0.8)",
                "rgba(0, 104, 249, 0.7)",
                "rgba(0, 104, 249, 0.6)",
                "rgba(0, 104, 249, 0.5)",
                "rgba(0, 104, 249, 0.4)",
                "rgba(0, 104, 249, 0.3)",
                "rgba(0, 104, 249, 0.2)",
                "rgba(0, 104, 249, 0.1)",
              ]}
              lineGap={4}
              animationDuration={20}
            />
          </h1>
          <TextType
            as="p"
            className="text-slate-500 text-base md:text-lg font-medium leading-relaxed justify-center"
            text="Upload or take a photo of your food to get instant nutritional analysis and health insights."
            typingSpeed={30}
            loop={false}
            showCursor={false}
          />
        </div>

        <Card className="w-full border-slate-200 shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Scan Your Food</h2>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-6">
              Drag and drop an image or click to upload. Our AI will analyze the nutritional content instantly.
            </p>

            {previewUrl && (
              <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-6 max-h-64">
                <img src={previewUrl} alt="Food preview" className="w-full h-full object-cover max-h-64" />
                {!loading && (
                  <button
                    type="button"
                    onClick={reset}
                    className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full p-1.5 cursor-pointer transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {!previewUrl && (
              <div className="w-full mx-auto min-h-96 border-2 border-dashed bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors rounded-xl overflow-hidden relative">
                <FileUpload onChange={(files) => {
                  if (files && files.length > 0) {
                    analyzeFile(files[0])
                  }
                }} />
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-slate-500 font-medium text-sm">Analyzing your food with Gemini AI...</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) analyzeFile(file)
              }}
            />
          </CardContent>
        </Card>

        {analysis && (
          <div className="w-full mt-8 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Calories", value: `${Math.round(analysis.nutrition.calories)}`, unit: "kcal", icon: Flame, color: "text-orange-500" },
                { label: "Protein", value: `${Math.round(analysis.nutrition.protein)}`, unit: "g", icon: Beef, color: "text-red-500" },
                { label: "Carbs", value: `${Math.round(analysis.nutrition.carbs)}`, unit: "g", icon: Wheat, color: "text-amber-500" },
                { label: "Fat", value: `${Math.round(analysis.nutrition.fat)}`, unit: "g", icon: Droplets, color: "text-blue-500" },
              ].map((item) => (
                <Card key={item.label} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <item.icon className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
                    <p className="text-2xl font-black text-slate-900">{item.value}</p>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{item.label} ({item.unit})</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {analysis.food_items.length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Identified Items</h3>
                  <ul className="space-y-2">
                    {analysis.food_items.map((item) => (
                      <li key={item} className="text-slate-700 font-medium text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.health_benefits.length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-green-600 mb-3">Health Benefits</h3>
                  <ul className="space-y-2">
                    {analysis.health_benefits.map((benefit) => (
                      <li key={benefit} className="text-slate-700 font-medium text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.concerns.length > 0 && (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-3">Dietary Concerns</h3>
                  <ul className="space-y-2">
                    {analysis.concerns.map((concern) => (
                      <li key={concern} className="text-slate-700 font-medium text-sm flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={reset} className="rounded-full font-bold">
                Scan Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
