/**
 * analytics.js
 *
 * Fire-and-forget helpers for tracking analytics events.
 * All functions:
 *   - never throw / never block navigation
 *   - swallow errors silently
 *   - use the same apiClient as the rest of the app
 */
import apiClient from "./apiClient";

function track(method, url) {
  apiClient[method](url).catch(() => {/* silent */});
}

export const trackPortfolioView     = (slug)            => track("post", `/analytics/portfolio-view/${slug}`);
export const trackResumeDownload    = (slug)            => track("post", `/analytics/resume-download/${slug}`);
export const trackProjectClick      = (projectId)       => track("post", `/analytics/project-click/${projectId}`);
export const trackCertificateView   = (certificateId)   => track("post", `/analytics/certificate-view/${certificateId}`);
