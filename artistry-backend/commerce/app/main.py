from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer
import numpy as np

app = FastAPI(title="Commerce & Product Matching Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load semantic search model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ============================================
# PRODUCT CATALOG (Static for now)
# ============================================

# Sample product catalog - in production, this would be a database
PRODUCT_CATALOG = [
    {
        "id": "bed_001",
        "name": "Modern Upholstered Platform Bed",
        "category": "bed",
        "style": "modern minimalist",
        "material": "engineered wood with fabric upholstery",
        "color": "beige",
        "price": "$399",
        "budget_tier": "medium",
        "vendor": "Amazon",
        "url": "https://amazon.com/product/bed_001",
        "image_url": "https://placehold.co/300x300/beige/white?text=Modern+Bed",
        "affiliate": True,
        "description": "Engineered wood frame with quality upholstered headboard in beige fabric"
    },
    {
        "id": "bed_002",
        "name": "Budget-Friendly Platform Bed",
        "category": "bed",
        "style": "minimalist",
        "material": "engineered wood with basic fabric",
        "color": "grey",
        "price": "$199",
        "budget_tier": "low",
        "vendor": "IKEA",
        "url": "https://ikea.com/product/bed_002",
        "image_url": "https://placehold.co/300x300/grey/white?text=Budget+Bed",
        "affiliate": True,
        "description": "Simple engineered wood frame with basic fabric upholstery"
    },
    {
        "id": "bed_003",
        "name": "Premium Tufted Velvet Bed",
        "category": "bed",
        "style": "luxury modern",
        "material": "solid wood with velvet upholstery",
        "color": "navy blue",
        "price": "$1,299",
        "budget_tier": "high",
        "vendor": "West Elm",
        "url": "https://westelm.com/product/bed_003",
        "image_url": "https://placehold.co/300x300/navy/white?text=Luxury+Bed",
        "affiliate": True,
        "description": "Solid wood frame with tufted velvet headboard, premium finish"
    },
    {
        "id": "curtains_001",
        "name": "Sheer Linen Curtains",
        "category": "curtains",
        "style": "modern minimalist",
        "material": "poly-linen blend",
        "color": "off-white",
        "price": "$89",
        "budget_tier": "medium",
        "vendor": "Target",
        "url": "https://target.com/product/curtains_001",
        "image_url": "https://placehold.co/300x300/white/grey?text=Linen+Curtains",
        "affiliate": True,
        "description": "Poly-linen blend curtains with grommet top, light filtering"
    },
    {
        "id": "curtains_002",
        "name": "Budget Polyester Curtains",
        "category": "curtains",
        "style": "basic",
        "material": "polyester",
        "color": "white",
        "price": "$29",
        "budget_tier": "low",
        "vendor": "Amazon Basics",
        "url": "https://amazon.com/product/curtains_002",
        "image_url": "https://placehold.co/300x300/white/grey?text=Basic+Curtains",
        "affiliate": True,
        "description": "Simple polyester curtains, rod pocket design"
    },
    {
        "id": "curtains_003",
        "name": "Premium Silk Blend Drapes",
        "category": "curtains",
        "style": "luxury",
        "material": "silk blend with custom hardware",
        "color": "ivory",
        "price": "$349",
        "budget_tier": "high",
        "vendor": "Pottery Barn",
        "url": "https://potterybarn.com/product/curtains_003",
        "image_url": "https://placehold.co/300x300/ivory/grey?text=Silk+Drapes",
        "affiliate": True,
        "description": "Silk blend drapes with custom brass hardware, layered design"
    },
    {
        "id": "chair_001",
        "name": "Mid-Range Upholstered Chair",
        "category": "chair",
        "style": "modern",
        "material": "engineered wood with fabric",
        "color": "grey",
        "price": "$179",
        "budget_tier": "medium",
        "vendor": "Wayfair",
        "url": "https://wayfair.com/product/chair_001",
        "image_url": "https://placehold.co/300x300/grey/white?text=Modern+Chair",
        "affiliate": True,
        "description": "Engineered wood frame with quality fabric upholstery"
    },
    {
        "id": "wardrobe_001",
        "name": "Quality Laminate Wardrobe",
        "category": "wardrobe",
        "style": "minimalist",
        "material": "engineered wood with quality laminate",
        "color": "white",
        "price": "$599",
        "budget_tier": "medium",
        "vendor": "IKEA",
        "url": "https://ikea.com/product/wardrobe_001",
        "image_url": "https://placehold.co/300x300/white/grey?text=Wardrobe",
        "affiliate": True,
        "description": "Engineered wood with quality laminate finish, sliding doors"
    }
]

# Pre-compute embeddings for product catalog
print("Computing product embeddings...")
product_embeddings = {}
for product in PRODUCT_CATALOG:
    # Create searchable text representation
    search_text = f"{product['category']} {product['style']} {product['material']} {product['color']}"
    product_embeddings[product['id']] = embedder.encode(search_text)
print(f"✓ Embeddings computed for {len(PRODUCT_CATALOG)} products")

@app.get("/")
def root():
    """Root endpoint"""
    return {"status": "ok", "service": "Commerce", "products": len(PRODUCT_CATALOG)}

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "Commerce", "products": len(PRODUCT_CATALOG)}

# ============================================
# PRODUCT MATCHING (Phase 3)
# ============================================

class ProductMatchRequest(BaseModel):
    item_type: str  # "bed", "curtains", "chair"
    style: str  # "modern", "minimalist", "traditional"
    material: str  # "wood", "fabric", "linen"
    color: str  # "beige", "white", "grey"
    budget: str  # "low" | "medium" | "high"

class ProductMatch(BaseModel):
    product_id: str
    name: str
    vendor: str
    price: str
    url: str
    image_url: str
    match_score: float
    affiliate: bool
    description: str

@app.post("/commerce/match-products")
def match_products(req: ProductMatchRequest) -> Dict:
    """
    Product Matching using semantic search
    Finds products that match the item metadata from generated design
    """
    # Build query text
    query_text = f"{req.item_type} {req.style} {req.material} {req.color}"
    query_embedding = embedder.encode(query_text)
    
    # Filter products by category and budget
    filtered_products = [
        p for p in PRODUCT_CATALOG
        if p['category'] == req.item_type.lower() and p['budget_tier'] == req.budget.lower()
    ]
    
    # If no exact budget match, expand search
    if not filtered_products:
        filtered_products = [
            p for p in PRODUCT_CATALOG
            if p['category'] == req.item_type.lower()
        ]
    
    # Calculate similarity scores
    matches = []
    for product in filtered_products:
        product_emb = product_embeddings[product['id']]
        
        # Cosine similarity
        similarity = np.dot(query_embedding, product_emb) / (
            np.linalg.norm(query_embedding) * np.linalg.norm(product_emb)
        )
        
        matches.append({
            "product": product,
            "score": float(similarity)
        })
    
    # Sort by similarity score
    matches.sort(key=lambda x: x['score'], reverse=True)
    
    # Return top 3 matches
    top_matches = matches[:3]
    
    results = []
    for match in top_matches:
        product = match['product']
        results.append(ProductMatch(
            product_id=product['id'],
            name=product['name'],
            vendor=product['vendor'],
            price=product['price'],
            url=product['url'],
            image_url=product['image_url'],
            match_score=match['score'],
            affiliate=product['affiliate'],
            description=product['description']
        ))
    
    return {
        "matches": [r.dict() for r in results],
        "query": {
            "item_type": req.item_type,
            "style": req.style,
            "material": req.material,
            "color": req.color,
            "budget": req.budget
        },
        "total_matches": len(results)
    }

@app.post("/commerce/batch-match")
def batch_match_products(items: List[ProductMatchRequest]) -> Dict:
    """
    Batch product matching for multiple items
    Used when shopping for complete room design
    """
    all_matches = {}
    
    for item in items:
        match_result = match_products(item)
        all_matches[item.item_type] = match_result['matches']
    
    return {
        "items": all_matches,
        "total_items": len(items)
    }

# ============================================
# SHOPPING CART & AFFILIATE TRACKING
# ============================================

class ShoppingCartItem(BaseModel):
    product_id: str
    quantity: int = 1

class ShoppingCart(BaseModel):
    items: List[ShoppingCartItem]
    session_id: str

@app.post("/commerce/generate-affiliate-links")
def generate_affiliate_links(cart: ShoppingCart) -> Dict:
    """
    Generate affiliate tracking links for shopping cart
    In production, this would integrate with actual affiliate networks
    """
    affiliate_links = []
    total_estimate = 0
    
    for cart_item in cart.items:
        # Find product
        product = next((p for p in PRODUCT_CATALOG if p['id'] == cart_item.product_id), None)
        
        if product:
            # Generate affiliate link (mock implementation)
            affiliate_url = f"{product['url']}?ref=artistry&session={cart.session_id}"
            
            # Parse price (remove $ and commas)
            try:
                price_str = product['price'].replace('$', '').replace(',', '')
                price = float(price_str)
                total_estimate += price * cart_item.quantity
            except:
                price = 0
            
            affiliate_links.append({
                "product_id": product['id'],
                "product_name": product['name'],
                "vendor": product['vendor'],
                "original_url": product['url'],
                "affiliate_url": affiliate_url,
                "price": product['price'],
                "quantity": cart_item.quantity,
                "image_url": product['image_url']
            })
    
    return {
        "affiliate_links": affiliate_links,
        "total_items": len(affiliate_links),
        "estimated_total": f"${total_estimate:.2f}",
        "session_id": cart.session_id
    }

@app.get("/commerce/products/{category}")
def get_products_by_category(category: str, budget: Optional[str] = None) -> Dict:
    """
    Browse products by category and budget
    """
    filtered = [p for p in PRODUCT_CATALOG if p['category'] == category.lower()]
    
    if budget:
        filtered = [p for p in filtered if p['budget_tier'] == budget.lower()]
    
    return {
        "category": category,
        "budget": budget,
        "products": filtered,
        "count": len(filtered)
    }
