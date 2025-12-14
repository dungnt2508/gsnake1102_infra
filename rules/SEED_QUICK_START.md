# 🌱 QUICK START - Seed Script Usage

## 📋 TL;DR

```bash
# 1. Make sure database is running
docker-compose up postgres redis

# 2. Seed 30 products
cd backend
npm run seed:products

# 3. Start services
npm run dev  # terminal 1
cd frontend && npm run dev  # terminal 2

# 4. Open browser
# http://localhost:3000
```

---

## 📊 What You'll Get

### 30 Realistic Products

```
📈 Ratings:        4.3 - 4.9 ⭐
📥 Downloads:      450 - 3.2K
💰 Price Mix:      14 free, 16 paid
🏷️  Categories:     8 different
📅 Created:        Spread over 90 days
⚡ Execution:      ~5 seconds
```

### Product Distribution

```
Marketing (4)         Integrations (3)       Operations (6)
├─ Email auto         ├─ Slack notify        ├─ Newsletter mgmt
├─ Instagram sched    ├─ Webhook→Airtable    ├─ E-commerce order
├─ LinkedIn share     └─ Zapier→n8n          ├─ Invoice gen
└─ FB/Insta ads                              ├─ Job screening
                      Security (3)           ├─ Onboarding
Sales/CRM (3)         ├─ Monitor             └─ Expenses
├─ CRM→Notion         ├─ SSL cert
├─ Lead scoring       └─ API limits          Infrastructure (3)
└─ SF→Sheets                                 ├─ Backup
                      AI/Automation (3)      ├─ Logs
Data/Analytics (2)    ├─ Content gen         └─ Calendar
├─ Analytics→Slack    ├─ Support bot
└─ ETL pipeline       └─ Sentiment
```

---

## 🔄 Full Process

### Step 1️⃣ - Database Ready

```bash
# Terminal 1
docker-compose up postgres redis

# Wait for:
# postgres_1         | "database system is ready to accept connections"
# redis_1            | "Ready to accept connections"
```

### Step 2️⃣ - Seed Products

```bash
# Terminal 2
cd backend
npm run seed:products
```

**Output**:
```
🌱 Starting product seeding...
📊 Inserting 30 products

✅ [1/30] Email Marketing Automation Pro
✅ [2/30] Instagram Post Scheduler & Auto-Poster
✅ [3/30] LinkedIn Content Distribution
...
✅ [30/30] Knowledge Base Auto-Generator

✅ Seeding complete!
📊 30 products inserted successfully

📝 Notes:
   - Status: All set to "published"
   - Seller: All owned by default seller
   - Rating: Realistic ratings between 4.3-4.9
   - Downloads: Realistic download counts
   - Created dates: Spread across last 90 days
```

### Step 3️⃣ - Start Backend

```bash
# Same terminal
npm run dev

# Should show:
# 🚀 Server running on http://localhost:3000
# 📊 Health check: http://localhost:3000/health
```

### Step 4️⃣ - Start Frontend

```bash
# Terminal 3
cd frontend
npm run dev

# Should show:
# ▲ Local:        http://localhost:3000
```

### Step 5️⃣ - Open Browser

Visit: `http://localhost:3000`

**You'll see**:
- ✅ Category cards with product counts
- ✅ Trending section with top products
- ✅ Featured products grid
- ✅ Value proposition section
- ✅ Testimonials section
- ✅ Chatbot button (bottom-right)

---

## 🧪 Testing After Seeding

### 1. Check Homepage
```
Homepage shows:
✅ CategoryShowcase - 6 categories
✅ TrendingSection - 6 products ranked
✅ FeaturedProducts - 6 top products
✅ ValueProposition - 3 value cards
✅ TestimonialsSection - 4 testimonials
❌ TopSellersSection - Hidden (as intended)
```

### 2. Test Search
Click search bar and try:
- Search "email" → Shows email products
- Search "CRM" → Shows CRM products
- Search "free" → Shows free products

### 3. Test Filtering
Try filters:
- Type: workflow, tool, integration
- Tags: Marketing, AI, Security, etc.
- Sort by: Rating, Downloads, Newest

### 4. Test Chatbot
Click 💬 button:
```
You: "I need email automation"
Bot: "I recommend..."
✓ Shows 3 products
✓ Shows match percentage
✓ Shows clickable cards
```

### 5. Test Product Detail
Click any product:
```
✅ Title & description load
✅ Price shows (free or €price)
✅ Rating displays
✅ Features list
✅ Requirements list
```

---

## 📱 Before vs After

### Before Seeding
```
Homepage:
- Empty sections
- "No featured products"
- Chatbot can't recommend
- No search results
```

### After Seeding
```
Homepage:
- 30 products across sections
- Trending products ranked
- Featured products shown
- Chatbot recommends
- Search returns results
- Categories display counts
```

---

## 🆘 Troubleshooting

### ❌ "Cannot find module 'tsx'"
```bash
npm install -g tsx
npm run seed:products
```

### ❌ "Connection refused (database)"
```bash
# Check database is running
docker-compose ps

# Or restart
docker-compose down
docker-compose up postgres redis
```

### ❌ "Port 3000 already in use"
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### ❌ "Products not showing on homepage"
1. Hard refresh browser: `Ctrl+Shift+R`
2. Check API: `curl http://localhost:3000/api/products`
3. Check browser console for errors (F12)
4. Verify database: `SELECT COUNT(*) FROM products;`

---

## 🔍 Verify Data

### Count products
```sql
psql -h localhost -p 5433 -U gsnake1102_user -d gsnake1102
SELECT COUNT(*) FROM products;
# Should return: 30
```

### List top products
```sql
SELECT title, rating, downloads FROM products 
ORDER BY rating DESC LIMIT 5;
```

### Check distribution
```sql
SELECT type, COUNT(*) FROM products GROUP BY type;
-- workflow: X
-- tool: Y
-- integration: Z
```

---

## ⚙️ How Seeding Works

1. **Read products**: Script defines 30 products
2. **Generate UUIDs**: Each gets unique ID
3. **Set seller**: All owned by one default seller
4. **Random creation dates**: Spread over last 90 days
5. **Insert safely**: Uses parameterized queries
6. **No duplicates**: `ON CONFLICT` prevents re-runs
7. **Publish immediately**: Status = 'published'

---

## 🎯 What to Test

After seeding:

- [ ] Homepage loads without errors
- [ ] Products appear in all sections
- [ ] Search works ("email", "CRM", etc.)
- [ ] Filters work (by type, tags, price)
- [ ] Sorting works (rating, downloads)
- [ ] Product detail page loads
- [ ] Chatbot recommends products
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Pagination works if > 50 products

---

## 📦 What's Included

### Per Product
- ✅ Title & description
- ✅ Long description
- ✅ Type (workflow/tool/integration)
- ✅ Tags for filtering
- ✅ Price (free or €)
- ✅ Features list
- ✅ Requirements list
- ✅ Star rating (4.3-4.9)
- ✅ Review count
- ✅ Download count
- ✅ Created date (realistic)

### All With
- ✅ Status: "published"
- ✅ Same seller
- ✅ Realistic metrics
- ✅ Professional descriptions

---

## 🚀 Next Steps

### After Seeding Works:

1. **Add more sellers** - Unhide TopSellersSection when ready
2. **Create more products** - Add to seed array
3. **Test payment flow** - If implementing payments
4. **Performance testing** - With more data
5. **Production data** - Replace seed with real data

---

## 📝 Notes

- Script is **idempotent** - Safe to run multiple times
- Can modify seller ID - Edit `DEFAULT_SELLER_ID`
- Can add/remove products - Edit array in script
- Ratings are **realistic** - Not all 5 stars
- Downloads are **realistic** - Realistic ranges
- Mix is **realistic** - Free and paid together

---

## ✅ Success Criteria

```
✓ `npm run seed:products` completes in < 5 seconds
✓ 30 products inserted
✓ Homepage shows all 6 sections with products
✓ Search returns results
✓ Filtering works
✓ Chatbot recommends products
✓ No console errors
✓ Responsive on mobile
✓ Ready for testing!
```

---

**Ready?** Run `npm run seed:products` now! 🚀

