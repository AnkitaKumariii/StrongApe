import { useNavigate } from "react-router-dom"
import { FlipGallery } from "./FlipGallery"

const items = [
  {
    title: "Chicken Curry",
    secondary: "Cal: 380 | Pro: 32g | Carbs: 18g | Fat: 20g",
    text: "A protein-rich dish with aromatic spices and tender chicken in a flavorful sauce. Supports muscle recovery while delivering sustained energy from balanced macros.",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Grilled Chicken Salad",
    secondary: "Cal: 420 | Pro: 38g | Carbs: 12g | Fat: 24g",
    text: "High-protein, low-glycemic meal designed for muscle recovery and tissue building. Loaded with dietary fiber and fresh vitamins from assorted leafy greens.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Berry Protein Smoothie",
    secondary: "Cal: 280 | Pro: 25g | Carbs: 30g | Fat: 3g",
    text: "A fast-absorbing post-workout option featuring premium whey protein and antioxidant-rich berries. Speeds up protein synthesis and replenishes depleted glycogen stores.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Banana",
    secondary: "Cal: 105 | Pro: 1g | Carbs: 27g | Fat: 0g",
    text: "A naturally sweet, portable snack rich in potassium, vitamin B6, and quick-digesting carbs. Great for pre- or post-workout energy and muscle cramp prevention.",
    image: "https://images.unsplash.com/photo-1550258214-5299e1289dfd?w=500&auto=format&fit=crop&q=80",
  },
]

export function ApeGallery() {
  const navigate = useNavigate()

  return (
    <FlipGallery
      items={items}
      heading={
        <>
          Meet the <span className="text-primary">Food Scanner</span>
        </>
      }
      subtitle="Hover over any food to view its nutritional info."
      chosenImageAlt="Selected food item"
      onTryOut={() => navigate("/food-scanner")}
    />
  )
}
