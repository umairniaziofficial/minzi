import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  clicks: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    country: String,
    city: String,
    region: String,
    device: {
      type: { type: String }, 
      browser: String,
      browserVersion: String,
      os: String,
      osVersion: String
    },
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String
  }],
  totalClicks: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  devices: {
    mobile: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },
  browsers: {
    type: Map,
    of: Number,
    default: {}
  },
  operatingSystems: {
    type: Map,
    of: Number,
    default: {}
  },
  countries: {
    type: Map,
    of: Number,
    default: {}
  },
  referrers: {
    type: Map,
    of: Number,
    default: {}
  },
  clicksByHour: {
    type: [Number],
    default: Array(24).fill(0)
  },
  clicksByDay: {
    type: [Number],
    default: Array(7).fill(0)
  },
  firstClick: Date,
  lastClick: Date,
  uniqueIPs: [String]
}, {
  timestamps: true
});

function sanitizeVersion(name, version) {
  if (!version) return name;
  const sanitizedVersion = version.replace(/\./g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${name} v${sanitizedVersion}`;
}

AnalyticsSchema.methods.addClick = function(clickData) {
  this.totalClicks++;
  
  if (!this.uniqueIPs.includes(clickData.ip)) {
    this.uniqueIPs.push(clickData.ip);
    this.uniqueVisitors = this.uniqueIPs.length;
  }

  if (clickData.device.type) {
    this.devices[clickData.device.type]++;
  }

  const browserKey = sanitizeVersion(clickData.device.browser, clickData.device.browserVersion);
  this.browsers.set(browserKey, (this.browsers.get(browserKey) || 0) + 1);

  const osKey = sanitizeVersion(clickData.device.os, clickData.device.osVersion);
  this.operatingSystems.set(osKey, (this.operatingSystems.get(osKey) || 0) + 1);

  if (clickData.country) {
    this.countries.set(clickData.country, (this.countries.get(clickData.country) || 0) + 1);
  }

  if (clickData.referrer) {
    this.referrers.set(clickData.referrer, (this.referrers.get(clickData.referrer) || 0) + 1);
  }

  const clickDate = new Date(clickData.timestamp);
  this.clicksByHour[clickDate.getHours()]++;
  this.clicksByDay[clickDate.getDay()]++;

  if (!this.firstClick) this.firstClick = clickDate;
  this.lastClick = clickDate;

  this.clicks.push(clickData);
};

const Analytics = mongoose.model('Analytics', AnalyticsSchema);

export default Analytics;