
export type MarketingIssue =
  "NumReviews"
  | "MonthlyReviewFreq"
  | "YearlyReviewFreq"
  | "NumPhotos"
  | "CompletionPerc"
  | "FacebookSite"
  | "NoSSLRedirect"
  | "NoSSL"
  | "SlowOrNotLoadingWebsite"
  | "NoGoogleAnalytics";

export type Confidence =
  "None"
  | "Maybe"
  | "Probably"
  | "Definitely";

export interface MarketingNeed {
  reason: MarketingIssue,
  confidence: Confidence
}

export interface ScrapeSiteJobEnqueue {
  requestId: string,
  sessionId: string,
  id: string,
  placeId: string,
  website: string,
  isWordpress: boolean | null
}

export interface ScrapeSiteResult {
  sessionId: string,
  id: string,
  website: string,
  isWordpress: boolean | null,
  needs: MarketingNeed[]
}

export interface ConnectionEvent {
  type: "connection"
  sessionId: string
}

export type WsEvents = ConnectionEvent;
