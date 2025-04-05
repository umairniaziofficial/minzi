import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../lib/db.js";
import Link from "../models/link.js";
import Analytics from "../models/analytics.js";
import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import URLParse from 'url-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

connectDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function parseUtmParams(url) {
  const parsed = URLParse(url, true);
  return {
    utmSource: parsed.query.utm_source,
    utmMedium: parsed.query.utm_medium,
    utmCampaign: parsed.query.utm_campaign,
    utmTerm: parsed.query.utm_term,
    utmContent: parsed.query.utm_content
  };
}

app.get(["/", "/dashboard"], (req, res) => {
  const view = req.path === "/" ? "index.html" : "dashboard.html";
  res.sendFile(path.join(__dirname, "..", "views", view));
});

app.get(["/dashboard", "/dashboard/"], (req, res) => {
  if (req.query.slug) {
    res.sendFile(path.join(__dirname, "..", "views", "dashboard.html"));
  } else {
    res.redirect('/');
  }
});

app.post("/api/links", async (req, res) => {
  try {
    const { url, customSlug } = req.body;

    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: "Invalid URL provided" });
    }

    const slug = customSlug || nanoid(6);

    if (customSlug) {
      const existingLink = await Link.findOne({ slug: customSlug });
      if (existingLink) {
        return res.status(409).json({ error: "Custom slug is already taken" });
      }
    }

    const link = new Link({
      url,
      slug,
      description: `Shortened link for: ${url}`
    });
    
    await link.save();

    const analytics = new Analytics({
      linkId: link._id,
      totalClicks: 0,
      uniqueVisitors: 0
    });
    
    await analytics.save();

    link.analytics = analytics._id;
    await link.save();

    const shortenedUrl = `${req.protocol}://${req.get('host')}/${slug}`;

    res.status(201).json({
      success: true,
      data: {
        originalUrl: url,
        shortUrl: shortenedUrl,
        slug,
        createdAt: link.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating shortened link:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug }).populate('analytics');

    if (!link) {
      return res.status(404).sendFile(path.join(__dirname, "..", "views", "404.html"));
    }

    const ua = new UAParser(req.headers['user-agent']);
    const uaResult = ua.getResult();

    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let locationData = { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
    
    try {
      if (ip.substr(0, 7) === '::ffff:') {
        ip = ip.substr(7);
      }
      
      if (ip === '::1' || ip === '127.0.0.1') {
        locationData = {
          country: 'Development',
          city: 'Local',
          region: 'Development'
        };
      } else {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        const data = await response.json();
        
        if (data.status === 'success') {
          locationData = {
            country: data.country || 'Unknown',
            city: data.city || 'Unknown',
            region: data.regionName || 'Unknown'
          };
        }
      }
    } catch (error) {
      console.error('Error getting location data:', error);
    }

    const utmParams = parseUtmParams(req.url);

    const clickData = {
      timestamp: new Date(),
      ip: ip,
      country: locationData.country,
      city: locationData.city,
      region: locationData.region,
      device: {
        type: uaResult.device.type || 'desktop',
        browser: uaResult.browser.name || 'Unknown',
        browserVersion: uaResult.browser.version || 'Unknown',
        os: uaResult.os.name || 'Unknown',
        osVersion: uaResult.os.version || 'Unknown'
      },
      referrer: req.headers.referer || 'Direct',
      ...utmParams
    };

    const analytics = await Analytics.findById(link.analytics);
    if (!analytics) {
      console.error('Analytics not found for link:', link);
      return res.redirect(link.url);
    }

    analytics.addClick(clickData);
    await analytics.save();

    res.redirect(link.url);
  } catch (error) {
    console.error("Error redirecting:", error);
    if (req.params.slug) {
      const link = await Link.findOne({ slug: req.params.slug });
      if (link) return res.redirect(link.url);
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/links/:slug/analytics", async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Fetching analytics for slug:', slug);
    
    const link = await Link.findOne({ slug }).populate('analytics');
    console.log('Found link:', link);

    if (!link) {
      console.log('Link not found for slug:', slug);
      return res.status(404).json({ error: "Link not found" });
    }

    if (!link.analytics) {
      console.log('No analytics found for link:', link);
      return res.status(404).json({ error: "Analytics not found for this link" });
    }

    const analyticsData = {
      success: true,
      data: {
        url: link.url,
        slug: link.slug,
        analytics: {
          totalClicks: link.analytics.totalClicks,
          uniqueVisitors: link.analytics.uniqueVisitors,
          devices: link.analytics.devices || { desktop: 0, mobile: 0, tablet: 0 },
          browsers: Object.fromEntries(link.analytics.browsers || new Map()),
          operatingSystems: Object.fromEntries(link.analytics.operatingSystems || new Map()),
          countries: Object.fromEntries(link.analytics.countries || new Map()),
          referrers: Object.fromEntries(link.analytics.referrers || new Map()),
          clicksByHour: link.analytics.clicksByHour || Array(24).fill(0),
          clicksByDay: link.analytics.clicksByDay || Array(7).fill(0),
          firstClick: link.analytics.firstClick,
          lastClick: link.analytics.lastClick,
          recentClicks: (link.analytics.clicks || []).slice(-10)
        }
      }
    };
    
    console.log('Sending analytics data:', analyticsData);
    res.json(analyticsData);
  } catch (error) {
    console.error("Error getting analytics:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default app;