function getTagsFromText(text){
    
     var extraction_result = keywordExtractor(text)
    console.log(extraction_result)
    
    var tags = extraction_result.map(i => {
        var arr = []
        var _lookupTag = lookupTag(i, text)
        arr.push(_lookupTag)
        var _lookupParents = lookupParents(i, text)        
        if(_lookupParents.length > 1)  arr = [...arr,..._lookupParents]
        else arr.push(_lookupParents)
        
        //console.log(arr)
        return arr
    })
    console.log(tags)
    tags = Array.from(new Set([].concat(...tags).filter(i => i)))
   
    return `${tags.length > 0 ? tags.join(', ') : ''}`
}

function keywordExtractor(text){
	text = text
        .replace("-"," ")
        .trim()
        .replace("  "," ")

    var extraction = 
    	Array.from(new Set(
    		text
    			.replace(/[^A-Z0-9]+/ig, " ")
    			.split(" ")
    			.map(i => i.trim())
    	))

    return extraction.filter(i => !stopwords.includes(i))
}

function lookupTag(tag, text){
    for(var i = 0; i < _tags.length; i++){
        if(
            Math.abs(_tags[i].length - tag.length) < 2 
            &&
            (
                (_tags[i].toLowerCase().indexOf(tag.toLowerCase()) > -1)
                ||
                // Padding with space to avoid false positives as ART in smART
                (text.toLowerCase().includes(" " + _tags[i].toLowerCase() + " "))
        )){
            return _tags[i]
        }
    }
    return false
}

function lookupParents(tag, text){
    for(var i = 0; i < _parentingTags.length; i++){
        try{
            var tags = [..._parentingTags[i].child, _parentingTags[i].parent]

             for(var ii = 0; ii < tags.length; ii++){
                if(
                    Math.abs(tags[ii].length - tag.length) < 2
                    &&
                    (
                        tags[ii].toLowerCase().indexOf(tag.toLowerCase()) > -1
                        ||
                        // Padding with space to avoid false positives as ART in smART
                        (text.toLowerCase().includes(" " + tags[ii].toLowerCase() + " "))
                )){
                    console.log(tags)
                    return [tags[ii], _parentingTags[i].parent]
                }
            }
        }
        catch(e) {
            console.error(e)
            return false
        }
    }
    return false
}

function lookupSynonym(tag){
}

var _tags = [
	"Information Technology", "Internet", "Consumer Internet", "E-Commerce", "Mobile Commerce", "Social Commerce", "Group Buying", "E-Commerce Platforms", "Deals", "Loyalty Programs", "Coupons", "Mobile Coupons", "Local Coupons", "Bridging Online and Offline", "Ticketing", "Comparison Shopping", "Product Search", "Social Media", "Social Media Marketing", "Communities", "Crowdsourcing", "Online Dating", "Social Media Platforms", "Social Games", "Fantasy Sports", "Social Fundraising", "Crowdfunding", "Private Social Networking", "Professional Networking", "Photo Sharing", "Chat", "Video Chat", "Social News", "Social Television", "Q&A", "Social Media Monitoring", "Forums", "Social Bookmarking", "Advertising", "Mobile Advertising", "Advertising Platforms", "Lead Generation", "Online Video Advertising", "Local Advertising", "Digital Signage", "Advertising Networks", "Digital Media", "Blogging Platforms", "E-Books", "Writers", "Email Newsletters", "Games", "Mobile Games", "Video Games", "Gamification", "Casual Games", "Virtual Worlds", "Video", "Video Streaming", "Video Editing", "Video Conferencing", "Web Design", "Music", "Hip Hop", "Musical Instruments", "Online Travel", "Social Travel", "Search", "Search Marketing", "SEO", "Semantic Search", "Payments", "Mobile Payments", "Point of Sale", "Photography", "Photo Editing", "Local", "Local Services", "Email", "Email Marketing", "Reviews and Recommendations", "Rental Housing", "Privacy", "Identity Management", "Personal Data", "Facebook Applications", "Twitter Applications", "Web Browsers", "Recipes", "SaaS", "Sales Automation", "Security", "Cyber Security", "Enterprise Security", "Data Security", "Mobile Security", "Fraud Detection", "Cloud Computing", "Cloud Management", "Productivity Software", "Collaboration", "Peer-to-Peer", "Internet Infrastructure", "Databases", "Domains", "Meeting Software", "App Stores", "Freemium", "Software", "Enterprise Software", "Sales and Marketing", "Brand Marketing", "Direct Marketing", "Performance Marketing", "Small and Medium Businesses", "Recruiting", "Social Recruiting", "College Recruiting", "Temporary Staffing", "Big Data", "B2B", "Big Data Analytics", "Business Services", "Retail Technology", "CRM", "Customer Support Tools", "Social CRM", "Commercial Real Estate", "Application Platforms", "Customer Service", "Development Platforms", "Developer APIs", "Real Estate Investors", "Developer Tools", "Predictive Analytics", "Market Research", "Cloud Infrastructure", "Property Management", "Local Businesses", "Business Productivity", "Task Management", "Data Mining", "Outsourcing", "Marketing Automation", "Defense", "Law Enforcement", "Internet Service Providers", "Data Centers", "Enterprise Resource Planning", "Data Integration", "Business Information Systems", "Optimization", "CAD", "Independent Pharmacies", "Vending and Concessions", "Open Source", "Software Compliance", "Mobile", "Mobile Enterprise", "iOS", "iPhone", "iPad", "Location Based Services", "Android", "Mobile Devices", "Tablets", "SMS", "Marketplaces", "Financial Exchanges", "Deep Information Technology", "Artificial Intelligence", "Machine Learning", "Semantic Web", "Natural Language Processing", "Computer Vision", "Image Recognition", "Algorithms", "Speech Recognition", "Hardware", "Consumer Electronics", "Printing", "3D Printing", "Embedded Hardware and Software", "Sensors", "Electronics", "Semiconductors", "Displays", "3D", "Communications Hardware", "Analytics", "Business Intelligence", "Telecommunications", "Infrastructure", "Wireless", "Service Providers", "Smart Grid", "Telephony", "Augmented Reality", "Messaging", "Robotics", "Storage", "Self Storage", "Maps", "Real Time", "Human Computer Interaction", "Bioinformatics", "User Testing", "Consumers", "Consumer Goods", "Food and Beverages", "Specialty Foods", "Organic Food", "Wine And Spirits", "Groceries", "Food Processing", "Tea", "New Product Development", "Sporting Goods", "Bicycles", "Green Consumer Goods", "Flowers", "Eyewear", "Personal Health", "Fitness", "Enterprises", "Finance", "Financial Services", "Banking", "Credit", "Finance Technology", "Venture Capital", "Angels", "Insurance", "Virtual Currency", "Bitcoin", "Personal Finance", "Insurtech", "Healthcare", "Health Care Information Technology", "Telemedicine", "Electronic Health Records", "Medical", "Dental", "Diabetes", "Hospitals", "Corporate Wellness", "Elder Care", "Alternative Medicine", "Clinical Trials", "Cosmetic Surgery", "Media", "News", "Journalism", "Publishing", "Film", "Television", "Internet TV", "Content", "Comics", "Education", "All Students", "University Students", "High School Students", "K-12 Education", "Training", "Language Learning", "Edutainment", "Health and Wellness", "Spas", "Platforms", "Web Development", "Retail", "Specialty Retail", "Custom Retail", "Technology", "Life Sciences", "Biotechnology", "Genomics", "Pharmaceuticals", "Marijuana", "Neuroscience", "Therapeutics", "Synthetic Biology", "Design", "Product Design", "Usability", "Real Estate", "Fashion", "Jewelry", "Streetwear", "Automotive", "Transportation", "Electric Vehicles", "Travel", "Adventure Travel", "Vacation Rentals", "Mobile Application", "Startups", "Sports", "Golf Equipment", "Sports Equipment", "Clean Technology", "Clean Energy", "Solar", "Residential Solar", "Commercial Solar", "Energy Efficiency", "Wind", "Clean Technology IT", "Vice", "Gambling", "Ecommerce", "Internet of Things", "Digital Marketing", "Demographies", "Age Groups", "Parenting", "Kids", "Teenagers", "Babies", "Baby Accessories", "Young Adults", "Senior Citizens", "Baby Boomers", "Women-Focused", "Families", "Travel & Tourism", "Entertainment Industry", "Energy", "Energy Management", "Energy Storage", "Batteries", "Fin Tech", "Entertainment", "Events", "Restaurants", "Consulting", "Cryptocurrency", "Blockchains", "Human Resources", "Manufacturing", "Hospitality", "Education Technology", "Agriculture", "Construction", "Art", "Performing Arts", "Organized Crime", "Beauty", "Logistics", "Website", "Usa", "Social Network", "Medical Devices", "Mobile Health", "User Experience Design", "Nonprofits", "Europe", "Legal", "Virtual Reality", "Blockchain / Cryptocurrency", "Apps", "Marketing", "Global", "Aerospace", "Drones", "Ventures for Good", "Impact Investing", "Online Shopping", "Investment Management", "Services", "Product Development Services", "Film Production", "IT Management", "Hotels", "Music Services", "Sharing Economy", "Hardware + Software", "Curated Web", "Project Management", "Consumer", "Business Development", "Digital Entertainment", "Fashion Tech", "Food Tech", "Event Management", "Cloud Data Services", "Subscription Businesses", "Lifestyle", "Graphic Design", "Sustainability", "Online Marketplaces", "Entrepreneur", "Digital Health", "South East Asia", "Freelancers", "Edtech", "Healthcare Services", "Web Hosting", "Home Decor", "Accounting", "Software Engineering", "Governments", "Pets", "Wearables", "Educational Games", "Social", "Oil and Gas", "Content Discovery", "Hr Tech", "Independent Music", "Legal Tech", "Financial Technology", "Corporate Training", "Internet Marketing", "Content Marketing", "Consulting Services", "Women's Apparel And Accessories", "Residential Real Estate", "Weddings", "Trading", "Information Services", "Real Estate Technology", "Home & Garden", "Green", "Supply Chain Management", "Higher Education", "Public Relations", "Furniture", "Networking", "Incubators", "Canada", "Environmental Innovation", "Luxury", "Creative Industries", "Architecture", "Online Gaming", "Smart Home", "Renewable Energies", "Cosmetics", "Same Day Delivery", "Staffing Firms", "Events Services", "Brand Development", "Nutrition", "Interior Design", "Outdoors", "Employment", "Musicians", "Communications Software", "Innovation Engineering", "Computers", "E Learn", "Corporate IT", "Politics", "Professional Services", "Industrial Automation", "Australian Market", "Home Renovation", "Digital Publishing", "Social Network Media", "User Interface Design", "Sales", "Wholesale", "Coworking", "Tourism", "Natural Resources", "Water", "Management Consulting", "Online Rental", "Shopping", "China", "Audio", "Mental Health", "Universities", "Nightlife", "Mass Customization", "Charity", "Home Automation", "Customer Experience", "Influencer Marketing", "New York", "Live Entertainment", "Industrial", "Classifieds", "Government Innovation", "Online Education", "Venue And Events", "Latin America", "Collaborative Consumption", "Cars", "Deep Learning", "Shipping", "Data", "Cleaning", "Health and Insurance", "Content Delivery", "Content Creators", "Social Entrepreneurship", "eSports", "Smart City", "Advertising & Creative Agencies", "Medical Technologies", "Public Transportation", "Broadcasting", "Business Analytics", "Artificial Intelligence / Machine Learning", "Personalization", "Data Visualization", "Tutoring", "Interior Design & Construction", "Film Distribution", "Coffee", "Singapore", "PC Gaming", "College Campuses", "Bars", "Loans", "Tours & Activities", "Distribution", "Toys", "Public Safety", "Online Reservations", "Wearable Technologies", "3D Technology", "Men's Apparel and Accessories", "Fast-Moving Consumer Goods", "Private Equity", "PaaS", "Middle East", "Logistics Software", "Community Development", "Animation", "Colleges", "Artists Globally", "Investors", "Emerging Markets", "Career Management", "Recycling", "Parking", "Engineering Firms", "Personal Branding", "Consumer Lending", "Mobility", "Programming", "Entrepreneurs", "Knowledge Management", "Craft Beer", "Medical Marijuana Dispensaries", "Invest Online", "Payment Systems", "Creative Strategy", "Waste Management", "North America English For Now", "Baby And Kids", "Dietary Supplements", "Diagnostics", "Taxis", "Social Innovation", "Utilities", "Researchers", "Farming", "Office Space", "Non Profit", "Lifestyle Products", "Identity", "Reputation", "Social Enterprise", "Leisure", "Pet Care", "Teachers", "Food Trucks", "Restaurants", "High Tech", "Web CMS", "Gifts", "Writing", "Smart Building", "Direct Sales", "Wholesale Distribution", "Event Planners", "Property", "East Africa", "Risk Management", "TV Production", "Translation", "General Aviation", "Germany", "Science", "Information Security", "Natural Skin Care", "Dating", "Home Improvement", "Ride Sharing", "Hyperlocal", "Creative", "Child Care", "Innovation Management", "Mortgage", "Adtech", "Doctors", "Promotional", "Active Lifestyle", "Magazine", "Part Time Jobs", "B2 B Market â€“ Smeâ€™S Specifically", "Price Comparison", "High Schools", "Recreation", "Franchises", "Medical Professionals", "Cloud-Based Music", "Cooking", "Lighting", "Psychology", "Hedge Funds", "Wealth Management", "Green Building", "Home Owners", "Stock Exchanges", "Soccer", "Career Planning", "University And Educational Institutions", "HR / Recruiting", "Discounts", "International Development", "Internet Radio", "Ethical Fashion", "Connected Devices", "Self Development", "Quantified Self", "DOD/Military", "VoIP", "China Internet", "Employer Benefits Programs", "File Sharing", "Bitcoin Exchange", "Advising And Career Services", "Growth Hacker", "Concerts", "Indian Diaspora", "Urban Mobility", "Insurance Companies", "Household Services", "Document Management", "Vr", "Web Tools", "Retail Grocery Chains", "Trucking", "Online Scheduling", "Action Sports", "Smart Cities", "Catering", "Instant Booking", "Nanotechnology", "Shoes", "DIY", "Technical Continuing Education", "Moving", "Graphics", "Testing", "Console Gaming", "Spain", "Mentorship", "Hong Kong", "Match-Making", "Indonesia", "Human Resource Automation", "Fashion Communities", "Material Science", "Advanced Materials", "Textiles", "P2P Money Transfer", "Gym", "Amazon", "Music Streaming", "Investment Banking", "Employee Management", "Mining Technologies", "Administrative", "Postal and Courier Services", "B2B Express Delivery", "Handmade", "Veterinary", "Gift Card", "Mexico", "Talent Analytics", "Intellectual Property", "Yoga", "Platform For Influencers", "Athletes", "Geospatial", "Men", "Fitness Gamification", "United Arab Emirates", "mHealth", "Building Products", "Operations", "Consumer Packaged Goods", "Consumer Engagement", "Nightclubs", "Online Auctions", "Credit Cards", "Communications Infrastructure", "Professionnal Training,Schools", "Internet Technology", "Organic", "Collaboration Software", "Trade Platform", "Procurement", "Digital Storytelling", "Delhi", "Young Entrepreneurs", "Religion", "Blog", "Digital Media Marketing", "Water Purification", "South Africa", "BPO Services", "Virtual Workforces", "ICT", "Maintenance", "Tracking", "Mobile Video", "Behavioral Therapy, Aba Therapy, Autism, Psychology", "Russian", "Boating Industry", "France", "Small Companies", "Working Professionals", "Logistics / Transportation / Shipping", "Navigation", "Mumbai", "Hairsalon", "Sports Stadiums", "Car Rental P2 P", "Virtualization", "Licensing", "Cafes", "Corporate Social Responsibility Management", "Health And Safety", "Share Economy", "Surveys", "Rehabilitation", "Visualization", "Shared Services", "Bloggers", "Chemicals", "Entertainment And Luxury Travel", "Brazil", "Wedding Planners", "Exercise", "Brokers", "Landscaping", "South America", "Space Travel", "Teaching STEM Concepts", "Marijuana Edibles", "Connected Cars", "Theatre", "Festivals", "Artist Management", "Rapid Prototyping", "Contact Management", "Independent Music Labels", "Celebrity", "Senior Health", "Commercial Building", "Bio-Pharm", "Skill Assessment", "Concierge", "Social Search", "Conversion Optimization", "Military Veterans", "Tech Field Support", "Logistics Company", "Stocks", "Car", "Business Travelers", "Gps", "Portals", "Product Management", "Bangalore", "Mobile Social", "Billing", "Foodtech", "Property And Casualty Insurance Companies", "Personal Trainers", "Network Security", "Medium To Large Enterprises With Large Numbers Of Skilled Workers", "Dubai", "England", "Unmanned Air Systems", "Computer Science", "Google Apps", "Gadget", "Sponsorship", "People", "Presentations", "User Experience Research", "Farmers Market", "Mobile Analytics", "E Health", "Fleet Management", "Local Discovery", "Electrical Distribution", "Call Center Automation", "Party Planners", "Malaysia", "Packaging Supplies", "Monetization", "EBooks", "Disruptive Models", "Humanitarian", "Dental Professionals", "Business Process Management", "Bots", "Heathcare", "Civil Engineers", "Gay & Lesbian Market", "Commodities", "Physicians", "Nigeria", "Academic", "Outdoor Advertising", "Intelligent Assistants", "Mobile Shopping", "English Speaking World", "Subscription", "Warehouse And Chain Management", "Residential", "IaaS", "Private School", "Boston", "Biometrics", "Washington, Dc", "Full Stack Startup", "Reading Apps", "Mobile Technology", "Advice", "Home Care", "Virtual Reality / Augmented Reality", "Laundry", "Merchandising", "Fine Jewelry", "Resorts", "Ngo's", "Marketplace", "Social + Mobile + Local", "Vietnam", "Foreign Investments", "Remittance", "Modeling", "Promotions", "Vintage Clothing", "Designers", "Sex Industry", "Industrial Design", "Movie Theatres", "Digital Currency", "Unifed Communications", "Collectibles", "Immigration", "Affordable Housing", "Modular, Furniture Manufacturers, E Commerce, 3 D Representation", "UK Golf Market (United Kingdom)", "Nutraceutical", "R&D", "Gifting", "Gold", "Healthy Eating", "Polling", "Surfing Community", "Local Search", "Natural Food Grocers", "Donations", "Media Streaming", "International Operating Companies", "Genetic Testing", "Bitcoin Mining", "Content Management", "Federal Government", "Auto", "Crowd Funding", "Austin", "Workforce Management", "Content Curation", "Renewable Tech", "Cloud Security", "Importer", "Public Sector", "Dental Practices", "Inbound Marketing", "Multimedia", "Data Privacy", "Patient Management", "Fishing", "Online Friendship", "Dallas", "Auctions", "M2M", "MMO Games", "Brewing", "Hair Extensions", "Early-Stage Technology", "Application Performance Monitoring", "Homeland Security", "Mechanical Solutions", "Mobile Emergency&Health", "Urban Development", "Accomodation", "Hosting", "Marketplace Lender", "Mobile Entertainment", "Motorsport", "Animal Feed", "US Hispanic Market", "Camping", "Health Care Services", "Artificial Neural Networks", "College Admissions", "Hvac", "Retirement", "Cell Phones", "Online Video", "Atlanta", "E Banking", "Vehicle Drivers", "Environmental Science", "Indian Real Estate", "Startup Histrionics", "World Domination", "Consumer Electronic Accessories", "3D Scanning", "Inventory Management Systems", "Indoor Positioning", "Mobile Accessories", "Cause Marketing", "Oil & Gas", "Early Stage IT", "Social Casino Games", "Denver Colorado", "Plumbers", "Programmatic Buying", "Philadelphia, Camden, Washington Dc, Baltimore", "Aerial Robotics", "Ground Transportation", "Textbooks", "Lead Management", "Thailand", "Digital Cinema", "Southeast Asia", "Self Help", "Open Government", "Fuels", "African-American", "Gift Registries", "Pet Sitting", "Test and Measurement", "Pre Seed", "Mothers", "Conference Makers", "Real Time Gps Fleet Monitoring Services", "Designer Footwear", "Civic Tech", "Skill Gaming", "Social Media Advertising", "Video on Demand", "Hunting Industry", "Economics", "Everyone With A Smartphone", "Colombia", "Native Advertising", "Dry Cleaning", "Childcare", "Bay Area, Ca", "Mobile Software Tools", "Advocacy", "Future Of Work", "Print On Demand", "Funeral Industry", "Contact Centers", "Music Education", "Wireless Sensor Networks", "Restaurant", "Brain Health", "Architects", "Drug Development", "Aquaculture", "Bakeries", "Wedding", "Google Play", "Dance Instruction", "Workflow", "Standard Chartered Bank", "Internet First", "Digital Lending", "User-Optimized", "Digital Claims Flow", "Property and Causality", "Life and Health", "Commercial", "On-Demand", "Data Provider", "Back-End Solution", "Claims Management", "Personalized", "Usage-Based Insurance", "Under-Insured", "Iot", "Individualized", "Lending", "Credit Provision", "Fraud", "Irregularities", "Misconducts", "Categorisation", "Crating", "Creditworthiness", "Credit Risk", "Alternative Credit Scoring", "Compliance", "Regtech", "Identification", "Trust", "Verification", "Authentication", "Payment", "Responsibility", "Rating", "Distribution Platform", "p2p", "Recording Financial Agreements", "Monitoring", "Investment Impact", "Accountability", "Referral System", "Personal Loan", "Sme Credit", "Altfi", "Alternative Financing", "Underwriting", "Risk Assessment", "Risk Scoring", "Mobile Data and Psychometrics", "Loan Management Automation", "Loan Service", "Consumer Loan", "Cash Flow", "Predictive Modelling", "Zopa", "My c4", "Banking Infrastructure", "Consumer Banking", "Digital Identity", "Credit Scoring", "Consent", "Identity Verification", "Encryption", "Digital Identifiers", "Digital Object Architecture", "Handle System", "Networked Identity", "Identity Assurance", "Identity Driven Networking", "Information Privacy", "Oauth", "Openid", "User as Owner", "Cyber Identity", "Iam", "Identity & Access Management", "Fraud ", "Aml ", "Kyc ", "Identity ", "Other", "Access Control", "Digital Identity Management", "Password Manager", "Workflow Automation", "Provisioning", "Single Sign-On", "Security Token Service", "Role Based Access Control", "Credential Management", "Federated Identity Management", "Idaas", "Id Management", "Identity Provider", "Identity-Based Security", "Access Management", "Claims-Based Identity", "Priviledged Access Management", "Blockverify", "Identifi", "Chainalysis", "Cryptocorp", "bitproof.io", "Ascribe", "Autherization", "Physical Authentication", "Reliance Authentication", "Online Authentication", "User Provisioning", "Geolocation", "Social Verification", "Social Login", "Security Token", "Two-Factor Authentication", "Dongle", "Validation", "Digital Card", "Mobile ", "Device Authentication", "Multi-Factor Authentication", "Mutual Authentication", "Mobile Signature", "Biometric Passport", "Voice Recognition", "Iris Scanning", "Handprinting Recognition", "Fingerprint Recognition", "Handwritten Recognition", "Signature Recognition", "Vein Matching", "Fraud Prevention", "Anti Fraud Solutions", "Aml", "Kyc", "Identity Proofing", "Identity Theft", "Fintech Compliance", "Data Compliance", "Gdpr Compliance", "Due Diligence", "Bank Grade Id Verification", "Cft", "Ctf", "Cross Border Payment", "Transaction Management", "Foreign Exchange ", "Management", "Micropayments", "Tokenization", "Cash Pooling", "Multi-Currency Wallet", "Wallet", "Stellar", "Ripple", "Unwire", "Cardlab", "Bigefinancials", "Cac Card Academy", "Inpay", "Altapay", "Qbuy Aps", "Ai", "Ml", "Credit Scoring as a Service", "Virtual Assistants & Chatbots", "Process Automation", "Capital Markets", "Data Analysis", "Algorithmic Trading", "Robo Advisory", "Context Aware Marketing", "Consumer Behaviour Analytics", "Preventive Insurance", "Credit Decisioning", "Loyalty and Reward", "Document Digitisation", "Maritime", "Digital Freight Forwarder", "Online Freight Forwarder", "Tracking Solution", "Cargo Condition", "Supply Chain Transparency", "Big Data Maritime", "Logistics Tech", "Marketplace Maritime", "Data Refinery", "Satellite Imagery", "Geo Data", "Performance Management", "Supply Chain Visibility", "Route Optimization", "Performance Optimization", "Bunker", "Bunker Savings", "Fuel Savings", "Arctic", "General Teleme", "Telehealth", "Wearable", "Care", "Diabetes Scope", "Blood", "Glucose", "Heart Scope", "Hyper-Tension", "Cardiac", "Cardiovascular", "Heart Disease", "Registration", "Patient", "Emr", "Ehr", "Hospital", "Booking", "Appoitment", "Check-In", "Information System", "Impact", "Cleantech", "Environmental", "Cheap", "3d Printing", "Aerospace & Defense", "Airlines", "Apparel & Footwear", "Arts", "Arts & Crafts", "Asset Management", "Automation", "Banking & Mortgages", "Beverages", "Building Materials", "Business Supplies", "Civil Engineering", "Cloud Services", "Communications", "Computer Hardware", "Construction Contractors & Services", "Consulting & Professional Services", "Consumer Discretionary", "Consumer Staples", "Corporate & Business", "E-Commerce & Marketplaces", "E-Learning", "Electrical", "Energy & Utilities", "Entertainment & Recreation", "Facilities", "Family Services", "Fine Art", "Firearms", "Fishery", "Food", "Food Production", "Fundraising", "Gambling & Casinos", "Government", "Health & Wellness", "Health Care", "Home & Furniture", "Import & Export", "Industrials & Manufacturing", "Information Technology & Services", "International Relations", "International Trade", "Investment", "Watches & Luxury Goods", "Judiciary", "Legal Services", "Libraries", "Machinery", "Marketing & Advertising", "Mechanical Engineering", "Medicine", "Military", "Mining & Metals", "Movies & Tv", "Museums", "Non-Profit & Philanthropy", "Packaging & Containers", "Paper Goods", "Pharmacy", "Plastics", "Plumbing", "Political Organization", "Pornography", "Primary & Secondary Education", "Ranching", "Renewables & Environment", "Sanitization Services", "Scientific & Academic Research", "Shipbuilding", "Shipping & Logistics", "Society", "Sports & Fitness", "Stores", "Talent Agencies", "Tobacco", "Tools", "Travel & Leisure", "Warehousing", "Web Services & Apps",
]

var _parentingTags = [
{
	parent: 'AR/VR',
	child: [
		'Augmented reality', 'Virtual Reality', 'Hardware', 'Display technology', 'Content Creation', 'AR/VR applications'
	],
},
{
	parent: 'Artificial Intelligence',
	child: [
		'AI applications', 'Business Intelligence / Analytics', 'Chatbots', 'Image/video recognition', 'Machine learning / Deep learning', 'Natural Language Processing','Robotics',
	],
},
{
	parent: 'FinTech',
	child: [
		'Payments','Crowdfunding','Remittance','Bitcoin','Personal Finance','Lending','Investment','Banking','Blockchain','Accounting','Robo Advisors','Trading','Alternative Finance','Asset Management','Brokerage','Investment Banking','Securities & Commodities Exchange','VC & PE','RegTech', 'Risk Management', 'Capital Funding / Loans', 'finance', 'financial', 'payments', 'mobile payments', 'credit', 'bitcoin', 'banking', 'wealth management',
	],
},
{
	parent: 'InsurTech',
	child: [
		'Online Insurance','Health Insurance','Auto Insurance','P2P Insurance','D2C (Direct to Consumer)','Comparison Platforms','Affiliate Integration','Enabling Services/Technologies','Home insurance','Travel insurance','Corporate insurance', 'risk management', 'insurance',
	],
},
{
	parent: 'HealthTech',
	child: [
		'Consumer HealthTech','Telemedicine','Fitness & Wellness','Healthcare','Pharma','Diagnostics','Medical Devices','Big Data & Analytics','Behavioral Change','Disease Progression','Remote Monitoring','Personalised Medicine','Welfare','hospital', 'medical', 'medical device', 'medicine', 'health care', 'healthcare', 'health', 'dental', 'clinical trials', 'clinical', 'pharmaceutical',
	],
},
{
	parent: 'BioTech',
	child: [
		'Biofuels','Medical BioTech','Agricultural BioTech','Industrial BioTech','Green materials','Chemical', 'biology', 'biotechnology', 'life science',
	],
},
{
	parent: 'EdTech',
	child: [
		'Self Learning','Tutoring','Edutainment','Language Learning','Training & Coaching','University Students','Devices','Institution Back Office','Teaching Material','education',
	],
},
{
	parent: 'AdTech + Marketing',
	child: [
		'AdTech','Online Marketing Tech','Mobile Advertising','PR Tech','Market Research','Social Media','Marketing Intelligence','Traditional Advertising', 'advertisement', 'advertising', 'advertising platforms', 'marketing', 'loyalty programs', 'public relations', 'coupons',
	],
},
{
	parent: 'Energy',
	child: [
		'Solar Energy','Wind Energy','Bioenergy','Oil & Gas','Energy Storage','Energy Generation','Energy Efficiency','Waste Management','Water Management','Smart Grid','biofuel', 'fuel', 'solar',
	],
},
{
	parent: 'Transportation',
	child: [
		'Vehicles','Electric Vehicles','Logistics','Autonomous Vehicles','Car Sharing','Telematics','Fleet Management','Delivery','Shipping','Taxi & Limousine','Navigation','Parking','Auto Services', '(Used) Car Marketplace','logistics',
	],
},
{
	parent: 'FoodTech',
	child: [
		'Food','Beverages','Online Grocery','Restaurants','Cooking','Substitutes','Tobacco','Hospitality','nutrition', 'grocery',
	],
},
{
	parent: 'AgriTech',
	child: [
		'BioTech','Enterprise Management Solutions','Agribusiness','Infrastructure','Indoor Agriculture','agriculture',
	],
},
{
	parent: 'Retail',
	child: [
		'Wholesale','Department Stores','POS','Second Hand','Local Shopping','Shipping','Loyalty Programs','Coupons & Deals','Inventory Management','E-commerce','Subscription Commerce','Product Discovery','consumer goods', 'e-commerce', 'shopping', 'consumer electronics', 'wholesale',
	],
},
{
	parent: 'Gaming',
	child: [
		'VR Gaming','Mobile Gaming','MMORPG','Gaming Enablers','Gambling'
	],
},
{
	parent: 'Entertainment + Leisure',
	child: [
		'Dating','Local Activities','Local Events','Ticketing','Art','event management', 'music', 'amusement park and arcade', 'video games',
	],
},
{
	parent: 'Travel + Tourism',
	child: [
		'Online Travel Agent','Travel Planning','Online Rental','Hotels & Accomodation','Flights','Bus & other Transportation','Tours & Activities','hospitality', 'hotel',
	],
},
{
	parent: 'Media + Social Media',
	child: [
		'Film & Movies','Music','Publishing, News, Magazines','Social Networks','Social Media','Broadcasting & TV','Content Marketing','publishing',
	],
},
{
	parent: 'Fashion & Beauty',
	child: [
		'Fashion Tech','Sustainable Fashion','Cosmetics',
	],
},
{
	parent: 'Design',
	child: [
		'Product Design','Interior Design','Digital Design','Architecture',
	],
},
{
	parent: 'Manufacturing',
	child: [
		'Machinery','Machine to Machine','Big Data','Industrial Robotics','Industry 4.0','industrial engineering',
	],
},
{
	parent: 'Real Estate',
	child: [
		'Home Services','Property Management','Real Estate Marketplace','Real Estate Financing','Interior Design / Visualisation',
	],
},
{
	parent: 'BuildTech',
	child: [
		'Construction','Urban Planning','Architecture','Smart City','Design Tools','Project Management','construction', 'geospatial',
	],
},
{
	parent: 'Sports + Fitness',
	child: [
		'Online Sports (eSports)','Sports Management','Sporting Goods','Fitness Sensors/Tracker','Outdoor','Fitness Platforms','wellness', 'american football',
	],
},
{
	parent: 'Telecommunication',
	child: [
		'Messaging','Conferencing','Telephony','Communication Hardware','Infrastructure','Service Provider','Wireless','news', 'telecommunications',
	],
},
{
	parent: 'AeroTech',
	child: [
		'Space Travel','Aircraft','Airline','aerospace',
	],
},
{
	parent: 'Enterprise Software',
	child: [
		'Market Research','CRM','Software Development','Customer/Technical Support','Email','Storage','Productivity','IT Operations','Cloud Infrastructure','Coding/DevTools','Open Source','PaaS','Computer Security','Enterprise Security', 'cyber security', 'information technology', 'web development', 'cloud computing', 'cyber security', 'network security', 'email',
	],
},
{
	parent: 'HR',
	child: [
		'Job Search','Executive Search','HR Management Software','Corporate Training Management','Interview Process Solutions','human resources', 'recruiting', 'staffing agency',
	],
},
{
	parent: 'Services',
	child: [
		'Local Services','Home Services','Personal Services','Caregivers','Storage','Legal Services','training', 'service industry', 'legal',
	],
},
{
	parent: 'IoT/Smart City',
	child: [
		'Connected Car', 'Connected Industry', 'Smart Agriculture', 'Smart City', 'Smart Grid/Energy', 'Smart Health', 'Smart Home', 'Smart Production', 'Smart Retail',
	],
},
]

var stopwords = [
	"a", "a's", "able", "about", "above", "according", "accordingly", "across", "actually", "after", "afterwards", "again", "against", "ain't", "all", "allow", "allows", "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "another", "any", "anybody", "anyhow", "anyone", "anything", "anyway", "anyways", "anywhere", "apart", "appear", "appreciate", "appropriate", "are", "aren't", "around", "as", "aside", "ask", "asking", "associated", "at", "available", "away", "awfully", "b", "be", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "believe", "below", "beside", "besides", "best", "better", "between", "beyond", "both", "brief", "but", "by", "c", "c'mon", "c's", "came", "can", "can't", "cannot", "cant", "cause", "causes", "certain", "certainly", "changes", "clearly", "co", "com", "come", "comes", "concerning", "consequently", "consider", "considering", "contain", "containing", "contains", "corresponding", "could", "couldn't", "course", "currently", "d", "definitely", "described", "despite", "did", "didn't", "different", "do", "does", "doesn't", "doing", "don't", "done", "down", "downwards", "during", "e", "each", "edu", "eg", "eight", "either", "else", "elsewhere", "enough", "entirely", "especially", "et", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "exactly", "example", "except", "f", "far", "few", "fifth", "first", "five", "followed", "following", "follows", "for", "former", "formerly", "forth", "four", "from", "further", "furthermore", "g", "get", "gets", "getting", "given", "gives", "go", "goes", "going", "gone", "got", "gotten", "greetings", "h", "had", "hadn't", "happens", "hardly", "has", "hasn't", "have", "haven't", "having", "he", "he's", "hello", "help", "hence", "her", "here", "here's", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "hi", "him", "himself", "his", "hither", "hopefully", "how", "howbeit", "however", "i", "i'd", "i'll", "i'm", "i've", "ie", "if", "ignored", "immediate", "in", "inasmuch", "inc", "indeed", "indicate", "indicated", "indicates", "inner", "insofar", "instead", "into", "inward", "is", "isn't", "it", "it'd", "it'll", "it's", "its", "itself", "j", "just", "k", "keep", "keeps", "kept", "know", "knows", "known", "l", "last", "lately", "later", "latter", "latterly", "least", "less", "lest", "let", "let's", "like", "liked", "likely", "little", "look", "looking", "looks", "ltd", "m", "mainly", "many", "may", "maybe", "me", "mean", "meanwhile", "merely", "might", "more", "moreover", "most", "mostly", "much", "must", "my", "myself", "n", "name", "namely", "nd", "near", "nearly", "necessary", "need", "needs", "neither", "never", "nevertheless", "new", "next", "nine", "no", "nobody", "non", "none", "noone", "nor", "normally", "not", "nothing", "novel", "now", "nowhere", "o", "obviously", "of", "off", "often", "oh", "ok", "okay", "old", "on", "once", "one", "ones", "only", "onto", "or", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "own", "p", "particular", "particularly", "per", "perhaps", "placed", "please", "plus", "possible", "presumably", "probably", "provides", "q", "que", "quite", "qv", "r", "rather", "rd", "re", "really", "reasonably", "regarding", "regardless", "regards", "relatively", "respectively", "right", "s", "said", "same", "saw", "say", "saying", "says", "second", "secondly", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self", "selves", "sensible", "sent", "serious", "seriously", "seven", "several", "shall", "she", "should", "shouldn't", "since", "six", "so", "some", "somebody", "somehow", "someone", "something", "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "specified", "specify", "specifying", "still", "sub", "such", "sup", "sure", "t", "t's", "take", "taken", "tell", "tends", "th", "than", "thank", "thanks", "thanx", "that", "that's", "thats", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "there's", "thereafter", "thereby", "therefore", "therein", "theres", "thereupon", "these", "they", "they'd", "they'll", "they're", "they've", "think", "third", "this", "thorough", "thoroughly", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "took", "toward", "towards", "tried", "tries", "truly", "try", "trying", "twice", "two", "u", "un", "under", "unfortunately", "unless", "unlikely", "until", "unto", "up", "upon", "us", "use", "used", "useful", "uses", "using", "usually", "uucp", "v", "value", "various", "very", "via", "viz", "vs", "w", "want", "wants", "was", "wasn't", "way", "we", "we'd", "we'll", "we're", "we've", "welcome", "well", "went", "were", "weren't", "what", "what's", "whatever", "when", "whence", "whenever", "where", "where's", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "who's", "whoever", "whole", "whom", "whose", "why", "will", "willing", "wish", "with", "within", "without", "won't", "wonder", "would", "would", "wouldn't", "x", "y", "yes", "yet", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "z", "zero"
]



