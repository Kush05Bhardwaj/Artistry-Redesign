"""
India-Specific Pricing Database
All prices in INR (Indian Rupees)
Updated: January 2026
"""

# Price ranges based on market research from Amazon India, Flipkart, Urban Ladder, Pepperfry
INDIA_PRICING = {
    "bed": {
        "low": {
            "material_cost": 8000,
            "labor_cost": 1500,
            "total": 9500,
            "description": "Basic engineered wood bed with laminate finish",
            "brands": ["@Home", "Hometown", "Nilkamal"],
            "where_to_buy": ["Amazon", "Flipkart", "Local Furniture Markets"]
        },
        "medium": {
            "material_cost": 18000,
            "labor_cost": 2500,
            "total": 20500,
            "description": "Quality engineered wood with upholstered headboard",
            "brands": ["Urban Ladder", "Pepperfry", "IKEA"],
            "where_to_buy": ["Urban Ladder", "Pepperfry", "IKEA India"]
        },
        "high": {
            "material_cost": 55000,
            "labor_cost": 5000,
            "total": 60000,
            "description": "Premium solid wood or designer upholstered bed",
            "brands": ["Godrej Interio", "Durian", "West Elm"],
            "where_to_buy": ["FabIndia", "West Elm", "Premium Furniture Stores"]
        }
    },
    
    "curtains": {
        "low": {
            "material_cost": 600,
            "labor_cost": 200,
            "total": 800,
            "description": "Basic polyester curtains with simple rod",
            "brands": ["Cortina", "Home Sizzler", "Amazon Basics"],
            "where_to_buy": ["Amazon", "Flipkart", "D-Mart"]
        },
        "medium": {
            "material_cost": 2000,
            "labor_cost": 500,
            "total": 2500,
            "description": "Poly-linen blend with quality hardware",
            "brands": ["SWAYAM", "Story@Home", "Solimo"],
            "where_to_buy": ["Amazon", "Flipkart", "Urban Ladder"]
        },
        "high": {
            "material_cost": 6000,
            "labor_cost": 1500,
            "total": 7500,
            "description": "Designer linen/silk blend with custom hardware",
            "brands": ["FabIndia", "Good Earth", "Pottery Barn"],
            "where_to_buy": ["FabIndia", "Good Earth", "Premium Stores"]
        }
    },
    
    "chair": {
        "low": {
            "material_cost": 2500,
            "labor_cost": 300,
            "total": 2800,
            "description": "Basic plastic or simple wood chair",
            "brands": ["Supreme", "Nilkamal", "Cello"],
            "where_to_buy": ["Amazon", "Flipkart", "Local Stores"]
        },
        "medium": {
            "material_cost": 6000,
            "labor_cost": 800,
            "total": 6800,
            "description": "Solid wood or quality upholstered chair",
            "brands": ["Urban Ladder", "Pepperfry", "Wakefit"],
            "where_to_buy": ["Urban Ladder", "Pepperfry", "IKEA"]
        },
        "high": {
            "material_cost": 18000,
            "labor_cost": 2000,
            "total": 20000,
            "description": "Premium hardwood or designer chair",
            "brands": ["Godrej Interio", "Herman Miller", "Durian"],
            "where_to_buy": ["FabIndia", "Premium Furniture Stores"]
        }
    },
    
    "wardrobe": {
        "low": {
            "material_cost": 12000,
            "labor_cost": 3000,
            "total": 15000,
            "description": "Particle board with laminate finish",
            "brands": ["Spacewood", "@Home", "Nilkamal"],
            "where_to_buy": ["Amazon", "Flipkart", "Local Carpenters"]
        },
        "medium": {
            "material_cost": 28000,
            "labor_cost": 5000,
            "total": 33000,
            "description": "Engineered wood with quality laminate/veneer",
            "brands": ["Godrej Interio", "Urban Ladder", "IKEA"],
            "where_to_buy": ["Urban Ladder", "IKEA", "Godrej Stores"]
        },
        "high": {
            "material_cost": 80000,
            "labor_cost": 10000,
            "total": 90000,
            "description": "Solid wood with premium finish or modular system",
            "brands": ["Hettich", "Hafele", "Sleek Kitchens"],
            "where_to_buy": ["Modular Kitchen Showrooms", "Premium Stores"]
        }
    },
    
    "walls": {
        "low": {
            "material_cost": 3000,
            "labor_cost": 2000,
            "total": 5000,
            "description": "Basic emulsion paint (150 sqft room)",
            "brands": ["Asian Paints", "Berger", "Nerolac"],
            "where_to_buy": ["Asian Paints Store", "Local Paint Shops"]
        },
        "medium": {
            "material_cost": 6000,
            "labor_cost": 3500,
            "total": 9500,
            "description": "Premium washable paint or accent wall",
            "brands": ["Asian Paints Royale", "Berger Luxol", "Dulux"],
            "where_to_buy": ["Asian Paints Showroom", "Berger Showroom"]
        },
        "high": {
            "material_cost": 18000,
            "labor_cost": 7000,
            "total": 25000,
            "description": "Designer paint with texture or wallpaper",
            "brands": ["Asian Paints Royale Play", "Nilaya Wallpapers"],
            "where_to_buy": ["Asian Paints Showroom", "Specialty Stores"]
        }
    },
    
    "sofa": {
        "low": {
            "material_cost": 15000,
            "labor_cost": 2000,
            "total": 17000,
            "description": "Basic 3-seater sofa with fabric upholstery",
            "brands": ["Hometown", "@Home", "Nilkamal"],
            "where_to_buy": ["Amazon", "Flipkart", "Local Stores"]
        },
        "medium": {
            "material_cost": 35000,
            "labor_cost": 3500,
            "total": 38500,
            "description": "Quality 3-seater with good upholstery",
            "brands": ["Urban Ladder", "Pepperfry", "Wakefit"],
            "where_to_buy": ["Urban Ladder", "Pepperfry", "IKEA"]
        },
        "high": {
            "material_cost": 95000,
            "labor_cost": 8000,
            "total": 103000,
            "description": "Premium leather or designer fabric sofa",
            "brands": ["Godrej Interio", "Durian", "West Elm"],
            "where_to_buy": ["FabIndia", "Premium Furniture Stores"]
        }
    },
    
    "table": {
        "low": {
            "material_cost": 3500,
            "labor_cost": 500,
            "total": 4000,
            "description": "Basic engineered wood table",
            "brands": ["Nilkamal", "Supreme", "@Home"],
            "where_to_buy": ["Amazon", "Flipkart", "D-Mart"]
        },
        "medium": {
            "material_cost": 9000,
            "labor_cost": 1200,
            "total": 10200,
            "description": "Quality wood or glass top table",
            "brands": ["Urban Ladder", "Pepperfry", "Woodsworth"],
            "where_to_buy": ["Urban Ladder", "Pepperfry", "IKEA"]
        },
        "high": {
            "material_cost": 28000,
            "labor_cost": 3000,
            "total": 31000,
            "description": "Premium solid wood or designer table",
            "brands": ["Godrej Interio", "FabIndia", "Durian"],
            "where_to_buy": ["FabIndia", "Premium Stores"]
        }
    },
    
    "lighting": {
        "low": {
            "material_cost": 1500,
            "labor_cost": 500,
            "total": 2000,
            "description": "Basic LED fixtures (3-4 lights)",
            "brands": ["Philips", "Syska", "Wipro"],
            "where_to_buy": ["Amazon", "Flipkart", "Local Electrical Stores"]
        },
        "medium": {
            "material_cost": 4500,
            "labor_cost": 1000,
            "total": 5500,
            "description": "Designer LED with dimming (4-5 lights)",
            "brands": ["Philips Hue", "Syska Smart", "Havells"],
            "where_to_buy": ["Amazon", "Havells Showroom"]
        },
        "high": {
            "material_cost": 12000,
            "labor_cost": 2500,
            "total": 14500,
            "description": "Premium smart lighting system",
            "brands": ["Philips Hue Premium", "LIFX", "Nanoleaf"],
            "where_to_buy": ["Premium Electronics Stores", "Amazon"]
        }
    },
    
    "flooring": {
        "low": {
            "material_cost": 8000,
            "labor_cost": 4000,
            "total": 12000,
            "description": "Basic vinyl or laminate (150 sqft)",
            "brands": ["Greenlam", "Action Tesa", "Supreme"],
            "where_to_buy": ["Local Flooring Stores", "Amazon"]
        },
        "medium": {
            "material_cost": 18000,
            "labor_cost": 7000,
            "total": 25000,
            "description": "Quality wooden laminate or tiles",
            "brands": ["Pergo", "Quick-Step", "Kajaria"],
            "where_to_buy": ["Kajaria Showroom", "Flooring Specialists"]
        },
        "high": {
            "material_cost": 45000,
            "labor_cost": 15000,
            "total": 60000,
            "description": "Premium hardwood or Italian marble",
            "brands": ["Johnson Endura", "Somany", "Italian Marble"],
            "where_to_buy": ["Premium Tile Showrooms", "Marble Dealers"]
        }
    },
    
    "rug": {
        "low": {
            "material_cost": 1200,
            "labor_cost": 0,
            "total": 1200,
            "description": "Basic synthetic rug (5x7 ft)",
            "brands": ["Saral Home", "Home Shop", "Amazon Basics"],
            "where_to_buy": ["Amazon", "Flipkart", "D-Mart"]
        },
        "medium": {
            "material_cost": 4500,
            "labor_cost": 0,
            "total": 4500,
            "description": "Quality cotton or wool blend rug",
            "brands": ["Obsession", "Saral Home Premium", "Urban Ladder"],
            "where_to_buy": ["Amazon", "Urban Ladder", "FabIndia"]
        },
        "high": {
            "material_cost": 15000,
            "labor_cost": 0,
            "total": 15000,
            "description": "Handwoven or designer rug",
            "brands": ["Jaipur Rugs", "The Rug Republic", "FabIndia"],
            "where_to_buy": ["FabIndia", "Jaipur Rugs Showroom"]
        }
    }
}

# Labor cost percentages for DIY savings calculation
LABOR_PERCENTAGE = {
    "bed": 0.15,        # 15% labor cost
    "curtains": 0.25,   # 25% labor (installation)
    "chair": 0.12,      # 12% labor
    "wardrobe": 0.25,   # 25% labor (assembly/installation)
    "walls": 0.40,      # 40% labor (painting is labor-intensive)
    "sofa": 0.10,       # 10% labor
    "table": 0.12,      # 12% labor
    "lighting": 0.33,   # 33% labor (electrical work)
    "flooring": 0.33,   # 33% labor (installation)
    "rug": 0.0          # 0% labor (no installation needed)
}

# Timeline estimates in days
TIMELINE_ESTIMATES = {
    "bed": {"diy": 1, "professional": 1},
    "curtains": {"diy": 0.5, "professional": 0.5},
    "chair": {"diy": 0.5, "professional": 0.5},
    "wardrobe": {"diy": 3, "professional": 2},
    "walls": {"diy": 2, "professional": 1},
    "sofa": {"diy": 0, "professional": 1},  # DIY not recommended
    "table": {"diy": 0.5, "professional": 0.5},
    "lighting": {"diy": 1, "professional": 0.5},
    "flooring": {"diy": 3, "professional": 2},
    "rug": {"diy": 0.1, "professional": 0.1}
}

def get_item_price(item_name: str, budget_tier: str) -> dict:
    """
    Get pricing information for a specific item and budget tier
    
    Args:
        item_name: Name of the item (bed, curtains, etc.)
        budget_tier: Budget level (low, medium, high)
    
    Returns:
        Dictionary with pricing details or None if not found
    """
    item_lower = item_name.lower()
    budget_lower = budget_tier.lower()
    
    # Map common variations
    item_mapping = {
        "couch": "sofa",
        "dining table": "table",
        "light": "lighting",
        "lamp": "lighting",
        "carpet": "rug"
    }
    
    item_lower = item_mapping.get(item_lower, item_lower)
    
    if item_lower in INDIA_PRICING and budget_lower in INDIA_PRICING[item_lower]:
        return INDIA_PRICING[item_lower][budget_lower]
    
    # Return default if not found
    return {
        "material_cost": 5000,
        "labor_cost": 1000,
        "total": 6000,
        "description": f"Standard {item_name}",
        "brands": ["Various"],
        "where_to_buy": ["Amazon", "Flipkart"]
    }

def calculate_diy_savings(item_name: str, budget_tier: str) -> dict:
    """Calculate savings if user does DIY vs hiring professional"""
    pricing = get_item_price(item_name, budget_tier)
    
    return {
        "professional_cost": pricing["total"],
        "diy_cost": pricing["material_cost"],
        "savings": pricing["labor_cost"],
        "savings_percentage": round((pricing["labor_cost"] / pricing["total"]) * 100, 1)
    }
