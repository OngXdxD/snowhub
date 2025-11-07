const samplePosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop',
    title: 'Epic Powder Day at Whistler! ❄️⛷️',
    author: 'SkiPro',
    avatar: 'https://i.pravatar.cc/150?img=1',
    likes: '3.2k',
    tag: 'Skiing',
    location: 'Whistler Blackcomb, BC',
    content: 'What an incredible day on the mountain! 30cm of fresh powder overnight made for some of the best skiing of the season. The conditions were absolutely perfect - light, fluffy snow and endless face shots. Started at Peak Chair and worked our way down through the trees. Harmony Bowl was pristine in the morning. Visibility was amazing and the snow just kept coming. If you\'re in the area, get up here ASAP! The forecast shows more snow for the next few days. Pro tip: Get there early to beat the crowds and hit the upper mountain first while it\'s still fresh. Best powder day this season by far! 🎿❄️'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=400&h=600&fit=crop',
    title: 'Beginner\'s Guide to Snowboarding 🏂',
    author: 'BoardMaster',
    avatar: 'https://i.pravatar.cc/150?img=2',
    likes: '5.8k',
    tag: 'Snowboarding',
    location: 'Breckenridge, Colorado',
    content: 'Just finished teaching my 100th beginner snowboarding lesson! Here are my top tips for anyone just starting out: 1) Don\'t lean back - this is the #1 mistake beginners make. Keep your weight centered over the board. 2) Start on your heel edge. It feels more natural and helps you build confidence. 3) Bend your knees! This gives you better balance and control. 4) Look where you want to go, not down at your board. Your body follows your eyes. 5) Don\'t be afraid to fall - it\'s part of learning! Wear padded shorts if you want extra protection. Most importantly, have fun and don\'t get discouraged. Everyone falls at first. By day 2-3, you\'ll be linking turns. Stick with it! 🏂'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=550&fit=crop',
    title: 'Best Ski Resorts in the Alps 🏔️',
    author: 'AlpineExplorer',
    avatar: 'https://i.pravatar.cc/150?img=3',
    likes: '9.1k',
    tag: 'Travel',
    location: 'European Alps',
    content: 'After skiing 15 different resorts across the Alps this season, here\'s my definitive ranking: 1) Chamonix, France - Incredible off-piste and views of Mont Blanc. Expert terrain. 2) Zermatt, Switzerland - Massive ski area, connects to Italy. Glacier skiing year-round. 3) St. Anton, Austria - Best après-ski culture and challenging terrain. 4) Verbier, Switzerland - Legendary freeride destination. Not for beginners! 5) Val d\'Isère, France - Great mix of terrain for all levels. Each resort has its own character. Chamonix is rugged and hardcore, while Zermatt is more polished. St. Anton has the best party scene. All are incredible in their own way. Save up and visit them all if you can! The Alps are truly special. 🏔️'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&h=450&fit=crop',
    title: 'Essential Winter Ski Gear Review 🎿',
    author: 'GearGuru',
    avatar: 'https://i.pravatar.cc/150?img=4',
    likes: '4.2k',
    tag: 'Gear',
    location: 'Gear Lab',
    content: 'Spent the season testing the latest ski gear. Here\'s what stood out: SKIS: Blizzard Rustler 10 - Playful all-mountain ski that handles everything. Perfect 10/10. BOOTS: Lange XT3 130 - Stiff, precise, great for advanced skiers. Takes some breaking in. GOGGLES: Smith I/O Mag XL - Best lens-changing system, huge field of view. Worth the price. JACKET: Arc\'teryx Sabre - Bombproof quality, perfect fit. Pricey but lifetime investment. GLOVES: Hestra Army Leather Heli - Industry standard for warmth and durability. Don\'t cheap out on gear that keeps you warm and safe. Quality equipment makes a huge difference in your experience on the mountain. Happy to answer questions about any specific gear!'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=500&fit=crop',
    title: 'Backcountry Skiing Adventure in Japan 🗾',
    author: 'MountainSeeker',
    avatar: 'https://i.pravatar.cc/150?img=5',
    likes: '6.5k',
    tag: 'Adventure',
    location: 'Hokkaido, Japan',
    content: 'Just completed an epic week of backcountry skiing in Hokkaido and WOW. The snow quality here is unlike anywhere else - so light and dry, it\'s like skiing through clouds. We stayed in a mountain hut and did daily tours around the volcanic peaks. The combination of ocean proximity and cold Siberian air creates this magical powder. Hired a local guide who knew all the secret stashes. Also experienced authentic Japanese culture - onsen (hot springs) every evening, incredible food, and the friendliest locals. Safety note: Always go with a guide in Japan. The terrain can be deceiving and avalanche risk is real. But with proper precautions, it\'s absolutely unforgettable. Already planning my return trip next season! 🗾⛷️'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop',
    title: 'How to Master Parallel Turns ⛷️',
    author: 'SkiInstructor',
    avatar: 'https://i.pravatar.cc/150?img=6',
    likes: '7.3k',
    tag: 'Tutorial',
    location: 'Vail, Colorado',
    content: 'The parallel turn is the foundation of advanced skiing. Here\'s how to nail it: Step 1: Start with a wide stance, weight evenly distributed. Step 2: Initiate the turn by rolling your knees and ankles toward the direction you want to go. Step 3: Keep your upper body facing downhill - don\'t twist! Step 4: Pressure the outside (downhill) ski as you carve. Step 5: Finish the turn by completing the arc and setting up for the next one. Common mistakes: Sitting back (stay forward!), stemming (keep skis parallel), rotating upper body (quiet hands). Practice on green runs first. Focus on making smooth, round turns. Speed comes later. Once you master this, you can tackle any terrain. Film yourself to see what needs work. Game changer! ⛷️'
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1498146831523-fbe41acdc5ad?w=400&h=450&fit=crop',
    title: 'Snowboard Park Tricks for Beginners 🛹',
    author: 'FreestyleKing',
    avatar: 'https://i.pravatar.cc/150?img=7',
    likes: '8.9k',
    tag: 'Freestyle',
    location: 'Mammoth Mountain, CA',
    content: 'Ready to hit the park? Start with these progression: 1) OLLIES - Pop off the tail, bring your nose up. Practice everywhere on the mountain. 2) 50-50 on boxes - Ride straight onto a flat box. Keep weight centered. 3) BOARDSLIDE - Approach at 45°, rotate 90° onto the box, slide sideways. 4) 180s - Start on flat ground, then small jumps. Spot your landing! 5) SMALL JUMPS - Focus on smooth takeoff and landing. Don\'t go bigger until you\'re comfortable. Safety tips: Wear a helmet always. Wrist guards save broken bones. Check your speed - going too slow is worse than too fast on jumps. Watch others and learn the flow. Don\'t snake! Park etiquette matters. Most importantly, progress at your own pace. Style over size! 🏂'
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400&h=550&fit=crop',
    title: 'Après-Ski Culture & Best Mountain Lodges 🏠',
    author: 'CozySkier',
    avatar: 'https://i.pravatar.cc/150?img=8',
    likes: '5.4k',
    tag: 'Lifestyle',
    location: 'Various Locations',
    content: 'Après-ski is half the experience! My favorite lodges: 1) Mooserwirt, St. Anton - Legendary party on the mountain. DJ, dancing on tables, pure chaos in the best way. 2) La Folie Douce, Val d\'Isère - French flair, amazing food, live music, champagne on the terrace. 3) Cloud Nine, Aspen - Champagne sabering at 3pm, caviar, upscale mountain dining. 4) Eagle\'s Eye, Kicking Horse - Highest restaurant in Canada, incredible views and food. 5) Ice Bar, Ischgl - Literally made of ice, unique experience. The European après scene is unmatched, but North America has some gems too. Don\'t skip this part of ski culture - the friendships made over drinks and stories are what you\'ll remember most! 🍺🏔️'
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=500&fit=crop',
    title: 'Ice Climbing Tips for Winter Warriors 🧗',
    author: 'IceClimber',
    avatar: 'https://i.pravatar.cc/150?img=9',
    likes: '4.1k',
    tag: 'Climbing',
    location: 'Ouray, Colorado',
    content: 'Ice climbing is incredibly rewarding but demands respect. Essential tips: TECHNIQUE - Use your feet! Kick firmly, trust your crampons. Arms should guide, not pull. SHORT SWINGS - Don\'t overhead swing. Compact movements save energy. GEAR - Dual-rated crampons, technical ice tools, and proper training are mandatory. SAFETY - Never climb alone. Check ice quality - clear blue is strongest, white is aerated and weaker. Always have redundant anchor points. PROGRESSION - Start in ice parks with top ropes. Ouray Ice Park is perfect for beginners. Take a guided course - this isn\'t a sport to self-teach. The mental aspect is huge. Trust your gear, stay calm, and remember: you can always come down. The views and sense of accomplishment are unreal! 🧗‍♂️❄️'
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=400&h=600&fit=crop',
    title: 'Cross-Country Skiing Through Nordic Forests 🎿',
    author: 'NordicPro',
    avatar: 'https://i.pravatar.cc/150?img=10',
    likes: '3.7k',
    tag: 'Cross-Country',
    location: 'Norway',
    content: 'Just completed a 3-day hut-to-hut traverse through Norwegian forests. Cross-country skiing offers something alpine can\'t - true wilderness immersion and incredible exercise. CLASSIC vs SKATE: Classic is like walking with glide, easier to learn. Skate skiing is faster, more athletic - like ice skating. Both are amazing workouts. GEAR: Don\'t use heavy telemark gear. Modern XC equipment is light and efficient. Proper boots and bindings matched to your skis. WAXING: Game changer for performance. Learn basic waxing or get waxless skis for convenience. WHY XC?: Better workout, access to remote areas, more affordable, sustainable. Less crowds, more nature. The silence of gliding through snow-covered forests is meditation. If you only know resort skiing, try XC. It\'s a whole different world! 🎿🌲'
  },
  {
    id: 11,
    image: 'https://images.unsplash.com/photo-1491904768633-2b7e3e7fede5?w=400&h=450&fit=crop',
    title: 'Winter Photography Tips in the Mountains 📸',
    author: 'SnowPhotog',
    avatar: 'https://i.pravatar.cc/150?img=11',
    likes: '6.8k',
    tag: 'Photography',
    location: 'Canadian Rockies',
    content: 'Winter mountain photography is magical but challenging. My essential tips: GOLDEN HOUR - Shoot during sunrise/sunset. The warm light on snow is incredible. Blue hour right after sunset is also stunning. EXPOSURE - Snow fools your meter. Overexpose by +1 to +1.5 stops or your snow will look gray. WHITE BALANCE - Set to cloudy or shade for warmer tones. Auto WB can make things too blue. GEAR CARE - Batteries drain fast in cold. Keep spares in inner pockets. Let gear acclimate slowly when going inside to prevent condensation. COMPOSITION - Use leading lines (ski tracks), include people for scale, shoot wide for landscapes and telephoto for compression. PROTECT YOUR GEAR - Use weather sealing or rain covers. Cold is actually less dangerous than condensation. Most importantly: Don\'t just snap and go. Take time to find unique perspectives. The best shots require patience! 📸❄️'
  },
  {
    id: 12,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop',
    title: 'Ski Racing: From Beginner to Competitor 🏁',
    author: 'RacerX',
    avatar: 'https://i.pravatar.cc/150?img=12',
    likes: '7.5k',
    tag: 'Racing',
    location: 'Various Race Courses',
    content: 'Got into ski racing at 30 - it\'s never too late! Here\'s how to start: JOIN A CLUB: Find a local NASTAR or Masters racing program. Most resorts have programs. Community is incredible. DISCIPLINES: Slalom (quick turns, technical), Giant Slalom (bigger turns, more speed), Super-G and Downhill (pure speed). Start with GS - most forgiving. TECHNIQUE FIRST: Racing exposes technique flaws quickly. Invest in coaching. Work on fundamentals before worrying about time. EQUIPMENT: Don\'t need race skis to start. Regular all-mountain skis work fine initially. As you progress, rent race gear. MINDSET: You\'re racing yourself, not others. Every run is data. Video analysis helps tremendously. It\'s addicting! The rush of a clean run through gates, constant improvement, and race day adrenaline. Plus you\'ll become a way better skier. Highly recommend! 🏁⛷️'
  },
  {
    id: 13,
    image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400&h=600&fit=crop',
    title: 'Avalanche Safety 101: Essential Knowledge ⚠️',
    author: 'SafetyFirst',
    avatar: 'https://i.pravatar.cc/150?img=13',
    likes: '9.8k',
    tag: 'Safety',
    location: 'Backcountry Everywhere',
    content: 'If you go into the backcountry, avalanche education is MANDATORY. This is life or death. TAKE A COURSE: AIARE Level 1 minimum. Book-learning isn\'t enough. You need field practice. THE GEAR: Beacon, probe, shovel - the "holy trinity". Also: avalanche airbag pack adds significant survival odds. CHECK CONDITIONS: avalanche.org daily. Understand danger ratings. High danger = stay home or stick to mellow terrain. KNOW THE TERRAIN: Avalanches happen on 30-45° slopes. Learn to identify terrain traps (gullies, trees). Ridgelines and low-angle areas are generally safer. HUMAN FACTORS: Most avalanche victims trigger the slide themselves. Group dynamics, ego, and "powder fever" kill people. Be willing to turn around. PRACTICE: Beacon drills regularly. Under stress, you need muscle memory. 15 minutes can mean life or death in a burial. The mountains will always be there. Make smart decisions. One pow day isn\'t worth dying for. ⚠️'
  },
  {
    id: 14,
    image: 'https://images.unsplash.com/photo-1486890598084-3673ba1808c1?w=400&h=450&fit=crop',
    title: 'My Setup: Pro Snowboard Gear Tour 🏂',
    author: 'GearHead',
    avatar: 'https://i.pravatar.cc/150?img=14',
    likes: '5.2k',
    tag: 'Gear',
    location: 'Gear Room',
    content: 'People always ask about my setup. Here\'s the full breakdown: BOARD: Jones Flagship 158W - All-mountain directional, handles everything from pow to park. Medium flex. BINDINGS: Burton Cartel - Responsive, comfortable, bombproof. Best all-around binding made. BOOTS: ThirtyTwo TM-2 - Heat moldable liners, great heel hold, broken in perfectly. OUTERWEAR: Volcom Gore-Tex jacket and bibs. Breathable, waterproof, stylish. Worth every penny. GOGGLES: Oakley Flight Deck XL with Prizm lens - Huge field of view, great low-light performance. PROTECTION: POC helmet, Dakine impact shorts, wrist guards for park days. EXTRAS: Demon snow leash, Dakine tool kit, OneBall wax kit, GoPro Hero 12. Total investment: ~$2500. But I ride 80+ days per season, so cost per day is low. Quality gear lasts years and makes every day better. Happy to answer specific questions! 🏂'
  }
];

export default samplePosts;


