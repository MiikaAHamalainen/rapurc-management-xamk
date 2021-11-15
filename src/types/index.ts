import { Survey, OwnerInformation, Building } from "generated/client";

/**
 * Application configuration
 */
export interface Configuration {
  auth: {
    url: string;
    realm: string;
    clientId: string;
  };
  api: {
    baseUrl: string;
  };
}

/**
 * Survey with info
 */
export interface SurveyWithInfo {
  id: string;
  ownerName?: string;
  buildingId?: string;
  classificationCode?: string;
  streetAddress?: string;
  city?: string;
}

/**
 * Error context type
 */
export type ErrorContextType = {
  error?: string;
  setError: (message: string, error?: any) => void;
};