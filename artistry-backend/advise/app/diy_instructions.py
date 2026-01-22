"""
DIY Instruction Templates
Step-by-step guides for common interior design tasks
India-specific with local tool/material availability
"""

DIY_INSTRUCTIONS = {
    "curtains": {
        "difficulty": "beginner",
        "estimated_time_hours": 2,
        "skill_level": "Easy - Perfect for first-timers",
        "tools_needed": [
            {"name": "Measuring Tape", "cost_inr": 150, "where": "Amazon/Local Hardware"},
            {"name": "Pencil", "cost_inr": 10, "where": "Stationery Shop"},
            {"name": "Drill Machine", "cost_inr": 1500, "optional": True, "where": "Amazon/Bosch Store"},
            {"name": "Screwdriver", "cost_inr": 100, "where": "Local Hardware"},
            {"name": "Ladder/Stool", "cost_inr": 800, "where": "Local Hardware"},
            {"name": "Level Tool", "cost_inr": 200, "where": "Amazon/Hardware"}
        ],
        "steps": [
            {
                "step": 1,
                "title": "Measure Window Width & Height",
                "description": "Use measuring tape to measure window width. Add 15-20cm on each side for proper coverage. Measure height from rod position to desired curtain length (usually floor level minus 2-3cm).",
                "duration_minutes": 10,
                "tips": ["Measure multiple points as walls may not be perfectly straight", "Write down measurements immediately"],
                "video_url": "https://www.youtube.com/results?search_query=how+to+measure+curtains+india"
            },
            {
                "step": 2,
                "title": "Mark Rod Bracket Positions",
                "description": "Mark positions 10-15cm above window frame. Use level tool to ensure marks are straight. Space brackets evenly (max 1.5m apart for heavy curtains).",
                "duration_minutes": 15,
                "tips": ["Use level tool to avoid crooked curtains", "Check for electrical wiring before drilling"],
                "video_url": "https://www.youtube.com/results?search_query=curtain+rod+installation"
            },
            {
                "step": 3,
                "title": "Drill Holes (if needed)",
                "description": "For concrete walls: Use 8mm masonry drill bit. For plaster walls: Use 6mm drill bit. Drill holes at marked positions to depth of 4-5cm.",
                "duration_minutes": 20,
                "tips": ["Wear safety goggles", "Keep drill straight while drilling", "For rental homes, consider damage-free hooks"],
                "video_url": "https://www.youtube.com/results?search_query=drilling+concrete+walls+india",
                "safety_warning": "Check for hidden electrical wires using stud finder"
            },
            {
                "step": 4,
                "title": "Install Wall Anchors & Brackets",
                "description": "Insert plastic wall anchors (rawl plugs) into drilled holes. Screw in brackets securely. Test strength by pulling gently.",
                "duration_minutes": 15,
                "tips": ["Tap anchors gently with hammer if tight", "Ensure brackets are level before final tightening"],
                "video_url": "https://www.youtube.com/results?search_query=install+curtain+brackets"
            },
            {
                "step": 5,
                "title": "Attach Curtain Rod",
                "description": "Place rod on brackets. Secure with provided clips or screws. Test by moving rod left-right.",
                "duration_minutes": 10,
                "tips": ["Rod should slide smoothly in brackets", "Don't overtighten screws"],
                "video_url": None
            },
            {
                "step": 6,
                "title": "Hang Curtains",
                "description": "Thread curtain rings onto rod (if using ring-style). Hang curtains evenly. Adjust pleats and folds for neat appearance.",
                "duration_minutes": 20,
                "tips": ["Iron curtains before hanging for professional look", "Distribute pleats evenly"],
                "video_url": "https://www.youtube.com/results?search_query=how+to+hang+curtains+perfectly"
            }
        ],
        "materials_checklist": [
            {"item": "Curtain Fabric/Ready-made Curtains", "budget_range": "₹600-₹6000", "where": "D-Mart/Amazon/FabIndia"},
            {"item": "Curtain Rod (based on window width)", "budget_range": "₹300-₹2000", "where": "Amazon/Local Hardware"},
            {"item": "Brackets (2-3 pieces)", "budget_range": "₹100-₹500", "where": "Included with rod or separate"},
            {"item": "Wall Anchors/Rawl Plugs (6-8mm)", "budget_range": "₹20-₹50", "where": "Local Hardware"},
            {"item": "Screws (provided with brackets)", "budget_range": "₹0-₹30", "where": "Included or hardware store"}
        ],
        "safety_tips": [
            "Always use sturdy ladder, don't stand on chairs",
            "Check for electrical wiring before drilling walls",
            "Wear safety goggles when drilling",
            "Get help for heavy curtains or high windows",
            "Turn off power if drilling near switches"
        ],
        "common_mistakes": [
            "Not measuring multiple times - leading to wrong size curtains",
            "Drilling without checking for wires - dangerous!",
            "Rod too close to window - curtains touch glass",
            "Uneven bracket placement - crooked curtains",
            "Weak wall anchors - rod falls down"
        ],
        "pro_tips": [
            "For rental homes: Use 3M Command hooks (damage-free)",
            "Dark curtains: Use blackout lining for better sleep",
            "Save money: Buy fabric and get it stitched locally (₹50-100/meter stitching)",
            "Monsoon tip: Choose washable, quick-dry fabrics"
        ]
    },
    
    "walls": {
        "difficulty": "intermediate",
        "estimated_time_hours": 8,
        "skill_level": "Moderate - Requires patience and some experience",
        "tools_needed": [
            {"name": "Paint Roller & Tray", "cost_inr": 300, "where": "Asian Paints Store"},
            {"name": "Paint Brushes (2-3 sizes)", "cost_inr": 200, "where": "Asian Paints Store"},
            {"name": "Masking Tape", "cost_inr": 150, "where": "Stationery/Hardware"},
            {"name": "Sandpaper (Medium & Fine)", "cost_inr": 100, "where": "Hardware Store"},
            {"name": "Putty Knife", "cost_inr": 80, "where": "Hardware Store"},
            {"name": "Drop Cloth/Old Newspapers", "cost_inr": 100, "where": "Reuse old sheets"},
            {"name": "Ladder", "cost_inr": 1500, "where": "Rent or buy from hardware"},
            {"name": "Mixing Stick", "cost_inr": 0, "where": "Free with paint purchase"}
        ],
        "steps": [
            {
                "step": 1,
                "title": "Room Preparation",
                "description": "Remove all furniture or move to center and cover with plastic sheets. Cover floor with newspapers/drop cloth. Remove wall decorations, switch plates, and outlet covers.",
                "duration_minutes": 60,
                "tips": ["Take photos of switch plates for easy reinstallation", "Label screws in small bags"],
                "video_url": "https://www.youtube.com/results?search_query=room+preparation+for+painting"
            },
            {
                "step": 2,
                "title": "Clean & Repair Walls",
                "description": "Wipe walls with damp cloth to remove dust. Fill cracks and holes with wall putty (Birla White or Asian Paints SmartCare). Let putty dry for 6-8 hours.",
                "duration_minutes": 120,
                "tips": ["Use fine sandpaper to smooth dried putty", "Clean ceiling cobwebs with broom"],
                "video_url": "https://www.youtube.com/results?search_query=wall+putty+application+india"
            },
            {
                "step": 3,
                "title": "Apply Primer",
                "description": "Stir primer thoroughly. Apply one coat of primer using roller for large areas and brush for corners/edges. Let dry for 4-6 hours.",
                "duration_minutes": 90,
                "tips": ["Primer helps paint stick better and last longer", "One primer coat is sufficient for previously painted walls"],
                "video_url": "https://www.youtube.com/results?search_query=how+to+apply+primer+on+walls",
                "note": "For new walls, use 2 coats of primer"
            },
            {
                "step": 4,
                "title": "Tape Edges & Corners",
                "description": "Apply masking tape on ceiling edges, door frames, and window frames. Press tape firmly to prevent paint bleeding.",
                "duration_minutes": 30,
                "tips": ["Use painter's tape (better than regular tape)", "Remove tape while paint is still slightly wet for clean edges"],
                "video_url": "https://www.youtube.com/results?search_query=masking+tape+painting+technique"
            },
            {
                "step": 5,
                "title": "First Paint Coat",
                "description": "Stir paint well. Use brush for edges/corners (\"cutting in\"). Use roller for large wall areas in W or M pattern for even coverage. Let dry for 4-6 hours.",
                "duration_minutes": 120,
                "tips": ["Don't overload roller with paint", "Work in 3x3 ft sections", "Maintain wet edge to avoid lap marks"],
                "video_url": "https://www.youtube.com/results?search_query=how+to+paint+walls+with+roller+india"
            },
            {
                "step": 6,
                "title": "Second Paint Coat",
                "description": "Lightly sand any rough spots. Apply second coat in same manner as first coat. Remove masking tape while paint is still tacky.",
                "duration_minutes": 120,
                "tips": ["Second coat gives rich color and better coverage", "Remove tape at 45-degree angle slowly"],
                "video_url": "https://www.youtube.com/results?search_query=applying+second+coat+of+paint"
            },
            {
                "step": 7,
                "title": "Cleanup & Reinstallation",
                "description": "Let paint dry for 24 hours before moving furniture back. Clean brushes and rollers with water (for water-based paints). Reinstall switch plates and decorations.",
                "duration_minutes": 60,
                "tips": ["Open windows for ventilation", "Wash tools immediately after use", "Store leftover paint for touch-ups"],
                "video_url": None
            }
        ],
        "materials_checklist": [
            {"item": "Emulsion Paint (1L covers ~120 sqft)", "budget_range": "₹400-₹1200/L", "where": "Asian Paints/Berger Store"},
            {"item": "Primer (1L covers ~140 sqft)", "budget_range": "₹200-₹500/L", "where": "Paint Store"},
            {"item": "Wall Putty (if needed)", "budget_range": "₹300-₹600/5kg", "where": "Hardware Store"},
            {"item": "Masking Tape", "budget_range": "₹150/roll", "where": "Stationery Store"},
            {"item": "Sandpaper Pack", "budget_range": "₹100", "where": "Hardware Store"}
        ],
        "safety_tips": [
            "Ensure good ventilation - open windows and doors",
            "Wear old clothes and covered shoes",
            "Use ladder safely - never overreach",
            "Take breaks every hour to avoid fatigue",
            "Keep paint away from children and pets",
            "Avoid painting in rainy/humid weather (paint won't dry properly)"
        ],
        "common_mistakes": [
            "Skipping primer - leads to uneven color",
            "Applying thick coat - causes dripping and uneven finish",
            "Not taping edges - results in messy corners",
            "Painting in humid weather - paint doesn't dry",
            "Using cheap brushes - leaves bristle marks"
        ],
        "pro_tips": [
            "Best time to paint: October-March (dry season in India)",
            "Calculate paint needed: Room sqft ÷ 120 = Liters needed (add 10% extra)",
            "Save money: Buy paint during Diwali/festive sales (20-30% off)",
            "Accent wall: Paint one wall in darker shade to save money",
            "Local painters: ₹10-15/sqft labor cost (negotiate before starting)"
        ]
    },
    
    "bed": {
        "difficulty": "intermediate",
        "estimated_time_hours": 4,
        "skill_level": "Moderate - Assembly skills required",
        "tools_needed": [
            {"name": "Allen Key Set", "cost_inr": 200, "where": "Usually included with bed"},
            {"name": "Screwdriver Set", "cost_inr": 300, "where": "Amazon/Local Hardware"},
            {"name": "Hammer", "cost_inr": 150, "where": "Hardware Store"},
            {"name": "Measuring Tape", "cost_inr": 150, "where": "Hardware Store"}
        ],
        "steps": [
            {
                "step": 1,
                "title": "Unpack & Organize Parts",
                "description": "Open box carefully. Lay out all parts, screws, and tools. Check against instruction manual to ensure nothing is missing. Group similar parts together.",
                "duration_minutes": 20,
                "tips": ["Take inventory before starting", "Keep small screws in container to avoid losing them", "Clear enough floor space (at least 7x7 ft)"],
                "video_url": "https://www.youtube.com/results?search_query=bed+assembly+tips"
            },
            {
                "step": 2,
                "title": "Assemble Headboard & Footboard",
                "description": "Follow instruction manual. Connect side panels to headboard using provided screws and allen key. Repeat for footboard. Hand-tighten screws first, then fully tighten.",
                "duration_minutes": 45,
                "tips": ["Get a helper for holding panels", "Don't fully tighten until all parts are assembled", "Check alignment before final tightening"],
                "video_url": "https://www.youtube.com/results?search_query=bed+frame+assembly"
            },
            {
                "step": 3,
                "title": "Attach Side Rails",
                "description": "Connect left and right side rails to headboard and footboard. Ensure brackets click into place securely. Some beds use hook-and-pin system.",
                "duration_minutes": 30,
                "tips": ["Lift bed slightly when connecting rails", "Listen for 'click' sound on bracket beds", "Test stability by shaking gently"],
                "video_url": None
            },
            {
                "step": 4,
                "title": "Install Support Slats/Center Beam",
                "description": "Place center support beam (if included). Lay wooden slats across side rails evenly spaced. Some beds have pre-assembled slat base - just drop it in.",
                "duration_minutes": 30,
                "tips": ["Slats should be evenly spaced (max 7-8cm gap)", "Center beam prevents sagging for larger beds", "Curved slats go with curve facing up"],
                "video_url": "https://www.youtube.com/results?search_query=bed+slat+installation"
            },
            {
                "step": 5,
                "title": "Final Tightening & Level Check",
                "description": "Go through all screws and tighten fully. Use spirit level to check if bed is level. Adjust leg height if needed (some beds have adjustable feet).",
                "duration_minutes": 20,
                "tips": ["Tighten screws in star pattern for even pressure", "Check for wobbling by pushing bed gently", "Place bed away from wall initially for easy access"],
                "video_url": None
            },
            {
                "step": 6,
                "title": "Place Mattress & Test",
                "description": "Position mattress on slats. Test bed by sitting on edges and center. Check for any creaking or movement. Re-tighten if needed.",
                "duration_minutes": 15,
                "tips": ["Let mattress expand (if foam) for 24 hours", "Use mattress protector to keep warranty valid", "Bed screws may need re-tightening after 2-3 months of use"],
                "video_url": None
            }
        ],
        "materials_checklist": [
            {"item": "Bed Frame (King/Queen size)", "budget_range": "₹8,000-₹60,000", "where": "Urban Ladder/Amazon/IKEA"},
            {"item": "Mattress (if not included)", "budget_range": "₹8,000-₹40,000", "where": "Wakefit/SleepyCat/Local Stores"},
            {"item": "Allen Keys & Screws", "budget_range": "₹0 (included)", "where": "Included in box"},
            {"item": "Mattress Protector (optional)", "budget_range": "₹500-₹2000", "where": "Amazon/Flipkart"}
        ],
        "safety_tips": [
            "Get help - beds are heavy and awkward to handle alone",
            "Clear assembly area of children and pets",
            "Lift with legs, not back - avoid injury",
            "Don't stand on bed until fully assembled",
            "Check weight capacity of bed before use"
        ],
        "common_mistakes": [
            "Losing small parts - keep them organized",
            "Over-tightening screws - can crack wood",
            "Assembling backwards - headboard and footboard confused",
            "Skipping instruction manual - leads to errors",
            "Not checking level - bed wobbles"
        ],
        "pro_tips": [
            "IKEA beds: Download assembly app (IKEA Assembly) for AR guidance",
            "Apply wood glue on joints for extra strength (advanced)",
            "Use furniture pads under legs to protect floor",
            "Save instruction manual for future moves",
            "Professional assembly: ₹500-₹1500 (Urban Ladder/Pepperfry offer free assembly)"
        ]
    },
    
    "lighting": {
        "difficulty": "intermediate",
        "estimated_time_hours": 2,
        "skill_level": "Moderate - Basic electrical knowledge required",
        "tools_needed": [
            {"name": "Screwdriver Set", "cost_inr": 300, "where": "Hardware Store"},
            {"name": "Wire Stripper", "cost_inr": 150, "where": "Electrical Store"},
            {"name": "Voltage Tester", "cost_inr": 200, "where": "Electrical Store"},
            {"name": "Ladder", "cost_inr": 1500, "where": "Hardware Store"},
            {"name": "Pliers", "cost_inr": 150, "where": "Hardware Store"}
        ],
        "steps": [
            {
                "step": 1,
                "title": "Turn Off Power (IMPORTANT!)",
                "description": "Switch off circuit breaker for the room. Use voltage tester to confirm power is off. Place a sign on breaker box so no one turns it on.",
                "duration_minutes": 5,
                "tips": ["NEVER skip this step", "Test voltage tester on working outlet first to ensure it works", "If unsure, hire electrician"],
                "video_url": "https://www.youtube.com/results?search_query=how+to+turn+off+circuit+breaker",
                "safety_warning": "DANGER: Electrical work can be fatal if done incorrectly. Call electrician if uncertain."
            },
            {
                "step": 2,
                "title": "Remove Old Fixture",
                "description": "Unscrew old light fixture carefully. Disconnect wires by unscrewing wire nuts. Lower fixture slowly (it may be heavy).",
                "duration_minutes": 15,
                "tips": ["Support fixture while disconnecting", "Take photo of wire connections before disconnecting", "Note wire colors (Red/Brown=Live, Blue=Neutral, Green/Yellow=Earth)"],
                "video_url": "https://www.youtube.com/results?search_query=remove+old+ceiling+light+fixture"
            },
            {
                "step": 3,
                "title": "Prepare Ceiling Junction Box",
                "description": "Check junction box for damage. Clean area. Identify wires: Live (red/brown), Neutral (blue/black), Earth (green/yellow).",
                "duration_minutes": 10,
                "tips": ["Junction box should be securely mounted", "If wires are damaged, call electrician", "Use wire stripper to expose 1cm of wire if needed"],
                "video_url": None
            },
            {
                "step": 4,
                "title": "Connect New Fixture",
                "description": "Match fixture wires to ceiling wires by color. Connect Live to Live, Neutral to Neutral, Earth to Earth. Twist wires together clockwise and secure with wire nuts (or insulation tape).",
                "duration_minutes": 20,
                "tips": ["Ensure no bare wire is exposed", "Tug wires gently to check connection strength", "Fold wires neatly into junction box"],
                "video_url": "https://www.youtube.com/results?search_query=connecting+light+fixture+wires+india",
                "safety_warning": "Wrong wire connection can cause short circuit or fire"
            },
            {
                "step": 5,
                "title": "Mount Fixture to Ceiling",
                "description": "Align fixture with junction box. Screw fixture to ceiling using provided screws. Ensure tight fit against ceiling.",
                "duration_minutes": 15,
                "tips": ["Get helper to hold heavy fixtures", "Don't pinch wires while mounting", "Use spring-loaded mount for heavy chandeliers"],
                "video_url": None
            },
            {
                "step": 6,
                "title": "Install Bulbs & Test",
                "description": "Install LED bulbs (check wattage rating). Turn on circuit breaker. Test light switch. Check for flickering or buzzing sounds.",
                "duration_minutes": 10,
                "tips": ["Use LED bulbs to save electricity (80% savings vs incandescent)", "If light doesn't work, turn off power and recheck connections", "Dimmer switch needs dimmable bulbs"],
                "video_url": None
            }
        ],
        "materials_checklist": [
            {"item": "LED Light Fixture", "budget_range": "₹500-₹12,000", "where": "Amazon/Philips Store/Havells"},
            {"item": "LED Bulbs (based on sockets)", "budget_range": "₹100-₹400 each", "where": "Amazon/Local Electrical"},
            {"item": "Wire Nuts/Insulation Tape", "budget_range": "₹50-₹100", "where": "Electrical Store"},
            {"item": "Mounting Screws", "budget_range": "₹0 (usually included)", "where": "Included with fixture"}
        ],
        "safety_tips": [
            "ALWAYS turn off power at circuit breaker - not just the switch",
            "Use voltage tester to confirm power is off",
            "Wear rubber-soled shoes",
            "Don't touch wires with wet hands",
            "If unsure, hire licensed electrician (₹300-₹500 for fixture installation)",
            "Never exceed wattage rating of fixture"
        ],
        "common_mistakes": [
            "Not turning off power - EXTREMELY DANGEROUS",
            "Mixing up wire connections - causes short circuit",
            "Over-tightening screws - cracks fixture housing",
            "Using wrong bulb type - reduces fixture life",
            "Not securing wire nuts - loose connections cause fires"
        ],
        "pro_tips": [
            "Smart bulbs: Easier than smart switches (no wiring needed) - Philips Hue, Syska Smart",
            "Diwali/festive sales: 30-40% off on branded lights",
            "Color temperature: 3000K warm white for bedroom, 4000K cool white for study",
            "Energy savings: 9W LED = 60W incandescent (saves ₹500/year per bulb)",
            "Professional electrician: ₹300-₹800 per fixture installation"
        ]
    }
}

# Additional quick guides for items with simpler DIY
QUICK_DIY_GUIDES = {
    "rug": {
        "difficulty": "beginner",
        "time_hours": 0.5,
        "instructions": [
            "Choose rug size: Coffee table (5x7 ft), Bedroom (6x9 ft)",
            "Measure room and furniture placement",
            "Order rug online (Amazon/FabIndia) or buy from local shop",
            "Unroll rug and let it flatten for 24 hours",
            "Place under furniture legs for stability",
            "Use anti-slip rug pad underneath to prevent sliding (₹200-500)"
        ],
        "tips": ["Vacuum weekly", "Professional cleaning once a year", "Rotate rug every 6 months for even wear"]
    },
    
    "chair": {
        "difficulty": "beginner",
        "time_hours": 1,
        "instructions": [
            "Follow similar steps as bed assembly",
            "Usually simpler: just attach legs to seat",
            "Some chairs come pre-assembled",
            "Check weight capacity before use"
        ]
    }
}

def get_diy_instructions(item_name: str) -> dict:
    """Get DIY instructions for an item"""
    item_lower = item_name.lower()
    
    # Map variations
    item_mapping = {
        "light": "lighting",
        "lamp": "lighting",
        "paint": "walls",
        "wall paint": "walls",
        "curtain": "curtains"
    }
    
    item_lower = item_mapping.get(item_lower, item_lower)
    
    if item_lower in DIY_INSTRUCTIONS:
        return DIY_INSTRUCTIONS[item_lower]
    elif item_lower in QUICK_DIY_GUIDES:
        return QUICK_DIY_GUIDES[item_lower]
    else:
        # Return generic template
        return {
            "difficulty": "intermediate",
            "estimated_time_hours": 2,
            "note": f"Detailed instructions for {item_name} not available. Consult product manual or hire professional.",
            "recommendation": "Professional installation recommended"
        }

