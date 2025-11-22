# Google Analytics 4 Setup Guide - Biblioteca da AIDS
## Publication Analytics Dashboard Configuration

**Measurement ID:** `G-8LF7TTE76Z`
**Created:** 2025-11-22

---

## Quick Start: View Publication Data Right Now

### 1. Real-Time Publication Views (Available Immediately)

**Steps:**
1. Go to https://analytics.google.com
2. Select your property (G-8LF7TTE76Z)
3. Click **Reports** → **Realtime** (left sidebar)
4. Scroll to **Event count by Event name**
5. Click on `view_publication`
6. See which publications are being viewed right now!

**What You'll See:**
- Live counter of publication views
- Which specific publications users are accessing
- Real-time activity on your site

---

## Essential Custom Reports

### Report 1: Top Publications Dashboard

**Purpose:** See which publications are most popular

**Setup Steps:**
1. Go to **Explore** (left sidebar)
2. Click **Blank** template
3. Name it: `📊 Top Publications`

**Configuration:**

**Dimensions** (click + to add):
- `Event name`
- `publication_title` (custom parameter - type manually if needed)
- `publication_id` (custom parameter)

**Metrics** (click + to add):
- `Event count`
- `Total users`
- `Active users`

**Visualization:** Table

**Settings:**
- **Rows:** `publication_title`
- **Values:** `Event count`
- **Filters:**
  - Dimension: `Event name`
  - Match type: `exactly matches`
  - Value: `view_publication`
- **Sort:** `Event count` descending
- **Row limit:** 20 (to see all publications)

**Result:** A ranked list showing:
```
Publication Title                           | Views
-------------------------------------------|-------
PCDT para manejo da infecção pelo HIV...  | 245
Histórias da Aids - Volumes I e II         | 189
Guia de PrEP e PEP                         | 156
...
```

---

### Report 2: Publication Engagement Dashboard

**Purpose:** See all interactions per publication (views, PDFs, audio)

**Setup Steps:**
1. **Explore** → **Blank**
2. Name it: `📈 Publication Engagement`

**Configuration:**

**Dimensions:**
- `publication_title`
- `Event name`

**Metrics:**
- `Event count`

**Visualization:** Table (with pivot)

**Settings:**
- **Rows:** `publication_title`
- **Columns:** `Event name`
- **Values:** `Event count`
- **Filters:**
  - Dimension: `Event name`
  - Match type: `is in list`
  - Values: `view_publication`, `open_pdf`, `play_audio`

**Result:** A matrix showing:
```
Publication Title          | Views | PDF Opens | Audio Plays
--------------------------|-------|-----------|-------------
PCDT HIV Módulo I         | 245   | 89        | 45
Histórias da Aids         | 189   | 67        | 123
Guia de PrEP e PEP        | 156   | 102       | 34
```

---

### Report 3: Publication Conversion Funnel

**Purpose:** See how many people go from viewing → PDF → Audio

**Setup Steps:**
1. **Explore** → **Funnel exploration**
2. Name it: `🎯 Publication Engagement Funnel`

**Configuration:**

**Steps:**
1. **Step 1:** "View Publication"
   - Event: `view_publication`

2. **Step 2:** "Open PDF"
   - Event: `open_pdf`
   - Make it "Indirectly follows" step 1

3. **Step 3:** "Play Audio"
   - Event: `play_audio`
   - Make it "Indirectly follows" step 1

**Breakdown dimension:** `publication_title`

**Result:** See conversion rates:
```
1000 users viewed publications
  ├─ 450 (45%) opened PDFs
  └─ 320 (32%) played audio
```

---

### Report 4: Search & Discovery Analysis

**Purpose:** Understand what users search for and which publications they find

**Setup Steps:**
1. **Explore** → **Blank**
2. Name it: `🔍 Search & Discovery`

**Configuration:**

**Dimensions:**
- `search_term` (custom parameter)
- `publication_title`

**Metrics:**
- `Event count`
- `result_count` (custom metric)

**Settings:**
- **Rows:** `search_term`
- **Values:** `Event count`, `result_count` (average)
- **Filters:**
  - Event name: `search`
- **Sort:** `Event count` descending

**Second Tab in Same Report:**
- **Rows:** `filter_tag` (custom parameter)
- **Values:** `Event count`
- **Filter:** Event name = `use_filter`

**Result:** See:
```
Search Term    | Searches | Avg Results
--------------|----------|-------------
HIV           | 234      | 12
PrEP          | 156      | 8
Tratamento    | 98       | 15
```

---

### Report 5: User Journey Map

**Purpose:** See the path users take through publications

**Setup Steps:**
1. **Explore** → **Path exploration**
2. Name it: `🗺️ User Journey`

**Configuration:**

**Starting point:** Event name = `view_publication`

**Node type:** Event name

**Breakdown:** `publication_title`

**Result:** Visual flow diagram showing:
```
Home Page
  ├─ Apresentação (45%)
  │   └─ Histórias da Aids (30%)
  └─ Publicações (55%)
      ├─ PCDT HIV (40%)
      └─ Guia PrEP (35%)
```

---

### Report 6: Weekly Publication Performance

**Purpose:** Track trends over time for top publications

**Setup Steps:**
1. **Explore** → **Blank**
2. Name it: `📅 Weekly Trends`

**Configuration:**

**Dimensions:**
- `Week` (date dimension)
- `publication_title`

**Metrics:**
- `Event count`

**Visualization:** Line chart

**Settings:**
- **Breakdown dimension:** `publication_title`
- **X-axis:** `Week`
- **Y-axis:** `Event count`
- **Filters:**
  - Event name: `view_publication`
  - publication_title: (select top 5 publications)
- **Date range:** Last 3 months

**Result:** Line graph showing trends for each publication over time

---

## Custom Dashboard Layout

Create a master dashboard with multiple visualizations:

### Dashboard: "Biblioteca Performance Overview"

**Layout (6 panels):**

**Panel 1: Scorecard - Total Views Today**
- Metric: `Event count` for `view_publication`
- Time period: Today
- Comparison: Yesterday

**Panel 2: Scorecard - Total PDF Opens Today**
- Metric: `Event count` for `open_pdf`
- Time period: Today
- Comparison: Yesterday

**Panel 3: Table - Top 10 Publications (7 days)**
- As configured in Report 1
- Date range: Last 7 days

**Panel 4: Bar Chart - Publications by Category**
- Dimension: `filter_tag`
- Metric: `Event count` for publications with that tag
- Horizontal bars

**Panel 5: Pie Chart - Interaction Types**
- Dimension: `Event name` (view_publication, open_pdf, play_audio)
- Metric: `Event count`
- Show percentages

**Panel 6: Timeline - Daily Activity**
- Dimension: `Date`
- Metric: `Event count` for all publication events
- Date range: Last 30 days
- Line chart

---

## Setting Up Custom Dimensions (If Needed)

If custom parameters don't appear automatically:

1. Go to **Admin** (bottom left)
2. Under **Property** column, click **Custom definitions**
3. Click **Create custom dimension**

**Create these custom dimensions:**

| Display Name      | Event Parameter    | Scope |
|------------------|-------------------|-------|
| Publication Title | publication_title | Event |
| Publication ID    | publication_id    | Event |
| PDF URL          | pdf_url           | Event |
| Search Term      | search_term       | Event |
| Filter Tag       | filter_tag        | Event |
| Audio Type       | audio_type        | Event |
| Content Title    | content_title     | Event |

**Then wait 24 hours for data to populate.**

---

## Quick Insights You Can Get

### Most Popular Publications
```
Reports → Explore → Create report with publication_title
Filter: Event name = view_publication
Sort by: Event count DESC
```

### PDF Download Rate
```
(PDF Opens / Publication Views) * 100
Create calculated metric in Explore
```

### Audio Engagement Rate
```
(Audio Plays / Publication Views) * 100
Create calculated metric in Explore
```

### Search Success Rate
```
Searches with result_count > 0 / Total searches
Filter: search event with result_count >= 1
```

### Publication Completion Score
```
Views + (PDF Opens * 2) + (Audio Plays * 3)
Higher score = better engagement
Create as calculated metric
```

---

## Automated Reports

### Set Up Weekly Email Reports

1. **Library** → **Explore** → Open your dashboard
2. Click **Share** (top right)
3. Click **Schedule email**
4. Configure:
   - **Frequency:** Weekly (Monday mornings)
   - **Recipients:** Add your email
   - **Format:** PDF
   - **Date range:** Last 7 days

5. Click **Schedule**

**Recommended Reports to Email:**
- Top Publications Dashboard (weekly)
- Publication Engagement Dashboard (weekly)
- Search & Discovery (monthly)

---

## Alerts & Monitoring

### Set Up Custom Alerts

1. **Admin** → **Custom alerts** (under Property)
2. Click **Create alert**

**Alert 1: High Publication Traffic**
- Name: "Publication Spike Alert"
- Condition: Event count > 1000 for view_publication
- Period: Day
- Notification: Email

**Alert 2: Low Engagement Day**
- Name: "Low Engagement Alert"
- Condition: Event count < 10 for view_publication
- Period: Day
- Notification: Email

**Alert 3: Popular New Publication**
- Name: "Trending Publication"
- Condition: Event count increase > 200% for specific publication_title
- Period: Week
- Notification: Email

---

## Data Analysis Tips

### Finding Your Most Valuable Publications

**High Impact Publications:**
```
Views > 100 AND (PDF Opens > 30 OR Audio Plays > 20)
```

**Underperforming Publications:**
```
Views > 50 AND PDF Opens < 5 AND Audio Plays < 2
(High interest but low engagement - may need better audio/PDF)
```

**Discovery Problems:**
```
Search with result_count = 0
(Users can't find what they're looking for)
```

### Segmentation Ideas

Create user segments in **Explore**:

1. **PDF Downloaders**
   - Users who triggered `open_pdf` at least once

2. **Audio Listeners**
   - Users who triggered `play_audio` at least once

3. **Active Researchers**
   - Users who used `search` 3+ times

4. **Publication Explorers**
   - Users who viewed 5+ different publications

Then compare behavior between segments!

---

## Troubleshooting

### "I don't see my custom parameters"

**Solution:**
- Custom parameters can take 24-48 hours to appear
- Make sure you've had some events fire first
- Check **Realtime** report to confirm events are being sent
- Manually create custom dimensions (see above)

### "Event count is 0"

**Solution:**
- Check that your site is live and being accessed
- Open browser console (F12) on your site
- Look for "📊 Analytics:" messages
- Verify gtag is loading: `typeof gtag` should return "function"

### "Can't find publication_title dimension"

**Solution:**
- Go to **Admin** → **Custom definitions**
- Create custom dimension as described above
- Wait 24 hours for data
- Or use "Event parameter" in Explore (type: `publication_title`)

---

## Best Practices

### Regular Review Schedule

**Daily:** Check Realtime report for current activity

**Weekly:** Review:
- Top Publications report
- Publication Engagement dashboard
- Search & Discovery report

**Monthly:** Review:
- User Journey Map
- Weekly Trends
- Create summary report for stakeholders

### Data-Driven Decisions

**Use analytics to:**
- Identify which publications need better promotion
- See which audio descriptions are most used (improve others)
- Find gaps in your search functionality
- Optimize content based on user preferences
- Plan new content based on popular topics

---

## Export Options

### Export Data for Further Analysis

**From any Explore report:**
1. Click **Share** (top right)
2. Select **Download file**
3. Choose format:
   - **PDF** - For presentations
   - **CSV** - For Excel/Google Sheets analysis
   - **Google Sheets** - Direct integration

**For API access:**
- Use GA4 Data API
- See: https://developers.google.com/analytics/devguides/reporting/data/v1

---

## Advanced: BigQuery Integration

For massive datasets and SQL queries:

1. **Admin** → **BigQuery Linking**
2. Link your GA4 property
3. Query publication data:

```sql
SELECT
  event_params.value.string_value AS publication_title,
  COUNT(*) AS views
FROM `your-project.analytics_123456789.events_*`
WHERE event_name = 'view_publication'
  AND _TABLE_SUFFIX BETWEEN '20250101' AND '20251231'
GROUP BY publication_title
ORDER BY views DESC
```

---

## Support Resources

- **GA4 Documentation:** https://support.google.com/analytics/answer/9304153
- **GA4 Explore Reports:** https://support.google.com/analytics/answer/9327972
- **Custom Dimensions:** https://support.google.com/analytics/answer/10075209
- **This Project:** See biblioteca/README.md for event details

---

## Measurement Plan Reference

| Event | When Fired | Parameters |
|-------|-----------|------------|
| `page_view` | Route changes | page_title, page_path |
| `view_publication` | User clicks publication | publication_id, publication_title |
| `play_audio` | User plays audio | audio_type, content_title |
| `open_pdf` | User clicks PDF link | pdf_url, publication_title |
| `search` | User searches (1s debounce) | search_term, result_count |
| `use_filter` | User selects filter tag | filter_tag |
| `toggle_theme` | User changes theme | theme |

---

**Last Updated:** 2025-11-22
**Version:** 1.0
**Maintained by:** Biblioteca da AIDS Project Team
