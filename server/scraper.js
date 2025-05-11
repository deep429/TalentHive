// scraper.js
const mongoose = require('mongoose');

// Define Interview Resource Schema
const interviewResourceSchema = new mongoose.Schema({
  companyName: { type: String, required: true, index: true },
  jobTitle: { type: String, required: true, index: true },
  resources: { type: [String], required: true },
  lastUpdated: { type: Date, default: Date.now },
});

const InterviewResource = mongoose.model('InterviewResource', interviewResourceSchema);

class InterviewScraper {
  constructor() {
    this.cacheDuration = 7 * 24 * 60 * 60 * 1000; // 7 days cache
  }

  async getInterviewResources(jobTitle, companyName) {
    try {
      // Check cache first
      const cached = await this.getCachedResources(companyName, jobTitle);
      if (cached) return cached;

      // Generate resource URLs
      const resources = this.generateResourceUrls(companyName, jobTitle);

      // Cache the results
      await this.cacheResources(companyName, jobTitle, resources);

      return resources.length > 0 ? resources : this.getFallbackResources();
    } catch (error) {
      console.error('Error getting interview resources:', error);
      return this.getFallbackResources();
    }
  }

  generateResourceUrls(companyName, jobTitle) {
    const resources = [];
    
    // Generate URLs for all platforms
    const glassdoorUrl = this.generateGlassdoorUrl(companyName, jobTitle);
    const leetcodeUrl = this.generateLeetCodeUrl(jobTitle);
    const indeedUrl = this.generateIndeedUrl(companyName);
    const linkedinUrl = this.generateLinkedInUrl(companyName, jobTitle);

    // Add valid URLs to resources
    if (glassdoorUrl) resources.push(glassdoorUrl);
    if (leetcodeUrl) resources.push(leetcodeUrl);
    if (indeedUrl) resources.push(indeedUrl);
    if (linkedinUrl) resources.push(linkedinUrl);

    return resources;
  }

  generateGlassdoorUrl(companyName, jobTitle) {
    try {
      const formattedCompany = encodeURIComponent(companyName.replace(/\s+/g, '-'));
      const formattedJob = encodeURIComponent(jobTitle.replace(/\s+/g, '-'));
      return `Glassdoor Interview Questions: https://www.glassdoor.com/Interview/${formattedCompany}-${formattedJob}-interview-questions-SRCH_KE0,${companyName.length},${jobTitle.length}.htm`;
    } catch (error) {
      console.log('Glassdoor URL generation failed:', error.message);
      return null;
    }
  }

  generateLeetCodeUrl(jobTitle) {
    try {
      if (jobTitle.toLowerCase().includes('engineer') || jobTitle.toLowerCase().includes('developer')) {
        const searchTerm = encodeURIComponent(jobTitle.split(' ')[0]);
        return `LeetCode Problems: https://leetcode.com/problemset/all/?search=${searchTerm}`;
      }
      return null;
    } catch (error) {
      console.log('LeetCode URL generation failed:', error.message);
      return null;
    }
  }

  generateIndeedUrl(companyName) {
    try {
      return `Indeed Company Info: https://www.indeed.com/cmp/${encodeURIComponent(companyName.replace(/\s+/g, '-'))}/faq`;
    } catch (error) {
      console.log('Indeed URL generation failed:', error.message);
      return null;
    }
  }

  generateLinkedInUrl(companyName, jobTitle) {
    try {
      return `LinkedIn Search Results: https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(`${companyName} ${jobTitle} interview`)}`;
    } catch (error) {
      console.log('LinkedIn URL generation failed:', error.message);
      return null;
    }
  }

  async getCachedResources(companyName, jobTitle) {
    try {
      const cached = await InterviewResource.findOne({
        companyName: new RegExp(companyName, 'i'),
        jobTitle: new RegExp(jobTitle, 'i')
      }).sort({ lastUpdated: -1 });

      if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.cacheDuration) {
        return cached.resources;
      }
      return null;
    } catch (error) {
      console.error('Error fetching cached resources:', error);
      return null;
    }
  }

  async cacheResources(companyName, jobTitle, resources) {
    try {
      await InterviewResource.findOneAndUpdate(
        { companyName, jobTitle },
        {
          companyName,
          jobTitle,
          resources,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error caching resources:', error);
    }
  }

  getFallbackResources() {
    return [
      'General interview preparation: https://www.themuse.com/advice/interviewing',
      'Behavioral questions: https://www.indeed.com/career-advice/interviewing/common-interview-questions',
      'Technical interview guide: https://www.interviewbit.com/technical-interview-questions/'
    ];
  }
}

module.exports = new InterviewScraper();