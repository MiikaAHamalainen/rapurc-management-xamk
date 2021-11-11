import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Api from "api";
import type { RootState } from "app/store";
import { Survey, SurveyStatus, SurveyType } from "generated/client";
import strings from "localization/strings";

/**
 * Surveys state in Redux
 */
export interface SurveysState {
  surveys: Survey[];
  selectedSurvey?: Survey;
}

/**
 * Initial surveys state
 */
const initialState: SurveysState = {
  surveys: [],
  selectedSurvey: undefined
};

/**
 * Async thunk that fetches surveys from the API
 */
export const fetchSurveys = createAsyncThunk<Survey[], void, { state: RootState; }>(
  "surveys/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { keycloak } = getState().auth;

      if (!keycloak?.token) {
        throw new Error(strings.errorHandling.missingAccessToken);
      }

      return await Api.getSurveysApi(keycloak.token).listSurveys({});
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Create survey async reducer
 */
export const createSurvey = createAsyncThunk<Survey, void, { state: RootState; }>(
  "surveys/createSurvey",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { keycloak } = getState().auth;

      if (!keycloak?.token) {
        throw new Error(strings.errorHandling.missingAccessToken);
      }

      const survey: Survey = {
        status: SurveyStatus.Draft,
        metadata: {},
        type: SurveyType.Demolition
      };

      return await Api.getSurveysApi(keycloak.token).createSurvey({ survey: survey });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Fetch survey async reducer
 */
export const fetchSelectedSurvey = createAsyncThunk<Survey, string, { state: RootState; }>(
  "surveys/findSurvey",
  async (surveyId, { getState, rejectWithValue }) => {
    try {
      const { keycloak } = getState().auth;
      const { surveys } = getState().surveys;

      const existingSurvey = surveys.find(survey => survey.id === surveyId);
      if (existingSurvey) {
        return existingSurvey;
      }

      if (!keycloak?.token) {
        throw new Error(strings.errorHandling.missingAccessToken);
      }

      return await Api.getSurveysApi(keycloak.token).findSurvey({ surveyId: surveyId });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Update survey async reducer
 */
export const updateSurvey = createAsyncThunk<Survey, Survey, { state: RootState; }>(
  "surveys/updateSurvey",
  async (survey, { getState, rejectWithValue }) => {
    try {
      const { keycloak } = getState().auth;

      if (!keycloak?.token || !survey.id) {
        throw new Error("No access token or missing survey ID");
      }

      return await Api.getSurveysApi(keycloak.token).updateSurvey({ surveyId: survey.id, survey: survey });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Delete survey async reducer
 */
export const deleteSurvey = createAsyncThunk<Survey, Survey, { state: RootState; }>(
  "surveys/deleteSurvey",
  async (survey, { getState, rejectWithValue }) => {
    try {
      const { keycloak } = getState().auth;

      if (!keycloak?.token || !survey.id) {
        throw new Error("No access token or missing survey ID");
      }

      await Api.getSurveysApi(keycloak.token).deleteSurvey({ surveyId: survey.id });

      return survey;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Surveys slice of Redux store
 */
export const surveysSlice = createSlice({
  name: "surveys",
  initialState: initialState,
  reducers: {
    setSurveys: (state, { payload }: PayloadAction<Survey[]>) => {
      state.surveys = payload;
    },
    setSelectedSurvey: (state, { payload }: PayloadAction<Survey | undefined>): void => {
      state.selectedSurvey = payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchSurveys.fulfilled, (state, { payload }) => {
      state.surveys = payload;
    });
    builder.addCase(createSurvey.fulfilled, (state, { payload }) => {
      state.surveys.push(payload);
    });
    builder.addCase(fetchSelectedSurvey.fulfilled, (state, { payload }) => {
      state.selectedSurvey = payload;
    });
    builder.addCase(updateSurvey.fulfilled, (state, { payload }) => {
      state.surveys = state.surveys.map(survey => (survey.id === payload.id ? payload : survey));

      if (state.selectedSurvey?.id === payload.id) {
        state.selectedSurvey = payload;
      }
    });
    builder.addCase(deleteSurvey.fulfilled, (state, { payload }) => {
      state.surveys = state.surveys.filter(surveys => surveys.id !== payload.id);
    });
  }
});

/**
 * Select surveys selector
 *
 * @param state Redux store root state
 * @returns list of surveys from Redux store
 */
export const selectSurveys = (state: RootState) => state.surveys.surveys;

/**
 * Select selected survey selector
 *
 * @param state Redux store root state
 * @returns selected survey from Redux store
 */
export const selectSelectedSurvey = (state: RootState) => state.surveys.selectedSurvey;

/**
 * Reducer for surveys slice
 */
export default surveysSlice.reducer;