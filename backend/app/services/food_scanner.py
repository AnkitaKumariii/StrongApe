import asyncio
import logging
import re

from fastapi import HTTPException, UploadFile

from app.schemas.food_scanner import FoodAnalysis, NutritionInfo
from app.services.gemini_client import generate_with_parts

logger = logging.getLogger(__name__)

ANALYSIS_PROMPT = """You are a professional nutritionist and food analyst specializing in visual food analysis. For ANY food image (simple or complex):

1. First, identify ALL ingredients and components
2. Then, considering the COMPLETE dish, provide TOTAL nutritional values
3. Follow this EXACT format:

FOOD ITEMS AND INGREDIENTS:
- [Dish name]
- [List all visible ingredients]
- [List garnishes/sides if any]

TOTAL NUTRITIONAL VALUES:
Calories: [X] kcal
Protein: [X] g
Carbohydrates: [X] g
Fat: [X] g

HEALTH BENEFITS:
- [List key benefits]

DIETARY CONCERNS:
- [List allergens or concerns]

IMPORTANT RULES:
- ALWAYS analyze the COMPLETE dish
- ALWAYS provide numerical values
- If exact values unknown, provide educated estimates
- Keep responses focused and concise
- For complex dishes, provide ONE total nutritional value

Analyze this food image and provide total nutritional values. If exact values are unknown, provide your best estimates based on visual analysis."""


class FoodScannerService:
    def _generate_analysis(self, content_type: str, image_content: bytes) -> str:
        return generate_with_parts(
            [
                ANALYSIS_PROMPT,
                {"mime_type": content_type, "data": image_content},
            ]
        )

    async def analyze_food_image(self, image: UploadFile) -> FoodAnalysis:
        image_content = await image.read()

        content_type = image.content_type or "image/jpeg"
        if "/" not in content_type:
            content_type = f"image/{content_type}"
        if content_type == "image/jpg":
            content_type = "image/jpeg"

        logger.info("Processing image with content type: %s", content_type)
        logger.info("Image size: %s bytes", len(image_content))

        analysis_text = await asyncio.to_thread(
            self._generate_analysis,
            content_type,
            image_content,
        )

        logger.info("Raw analysis text (first 200 chars): %s...", analysis_text[:200])

        try:
            parsed_info = self._parse_analysis(analysis_text)
        except ValueError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

        if parsed_info["calories"] == 0 or parsed_info["protein"] == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to extract nutritional values from analysis",
            )

        return FoodAnalysis(
            food_items=parsed_info["food_items"],
            nutrition=NutritionInfo(
                calories=parsed_info["calories"],
                protein=parsed_info["protein"],
                carbs=parsed_info["carbs"],
                fat=parsed_info["fat"],
            ),
            health_benefits=parsed_info["health_benefits"],
            concerns=parsed_info["concerns"],
        )

    def _parse_analysis(self, text: str) -> dict:
        result = {
            "food_items": [],
            "calories": 0.0,
            "protein": 0.0,
            "carbs": 0.0,
            "fat": 0.0,
            "health_benefits": [],
            "concerns": [],
        }

        sections: dict[str, list[str]] = {}
        current_section = None

        for line in text.split("\n"):
            line = line.strip()
            if not line:
                continue

            lower_line = line.lower()
            if "food items and ingredients:" in lower_line:
                current_section = "items"
            elif "total nutritional values" in lower_line:
                current_section = "nutrition"
            elif "health benefits:" in lower_line:
                current_section = "benefits"
            elif "dietary concerns:" in lower_line:
                current_section = "concerns"

            if current_section:
                sections.setdefault(current_section, []).append(line)

        if "items" in sections:
            for line in sections["items"]:
                if line.strip().startswith(("-", "•", "*", "○")):
                    item = line.lstrip("- •*○").strip()
                    if item and not any(
                        x.lower() in item.lower() for x in ["food items", "ingredients"]
                    ):
                        result["food_items"].append(item)

        if "nutrition" in sections:
            for line in sections["nutrition"]:
                if ":" in line:
                    key, value = [x.strip() for x in line.split(":", 1)]
                    key = key.lower()
                    if "calories" in key:
                        result["calories"] = self._extract_number(value)
                    elif "protein" in key:
                        result["protein"] = self._extract_number(value)
                    elif "carbs" in key or "carbohydrates" in key:
                        result["carbs"] = self._extract_number(value)
                    elif "fat" in key:
                        result["fat"] = self._extract_number(value)

        if "benefits" in sections:
            for line in sections["benefits"]:
                if line.strip().startswith(("-", "•", "*", "○")):
                    benefit = line.lstrip("- •*○").strip()
                    if benefit:
                        result["health_benefits"].append(benefit)

        if "concerns" in sections:
            for line in sections["concerns"]:
                if line.strip().startswith(("-", "•", "*", "○")):
                    concern = line.lstrip("- •*○").strip()
                    if concern:
                        result["concerns"].append(concern)

        if (
            result["calories"] == 0
            or result["protein"] == 0
            or result["carbs"] == 0
            or result["fat"] == 0
        ):
            raise ValueError("Failed to extract complete nutritional information from the analysis")

        return result

    @staticmethod
    def _extract_number(text: str) -> float:
        matches = re.findall(r"(\d+(?:\.\d+)?)", text)
        return float(matches[0]) if matches else 0.0
