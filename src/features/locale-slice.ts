import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "app/store";
import strings from "localization/strings";

/**
 * Interface describing locale state in Redux
 */
export interface LocaleState {
  language: string;
}

/**
 * Initial locale state
 */
const initialState: LocaleState = {
  language: "fi"
};

/**
 * Locale slice of Redux store
 */
export const localeSlice = createSlice({
  name: "locale",
  // eslint-disable-next-line object-shorthand
  initialState,
  reducers: {
    setLanguage: (state, { payload }: PayloadAction<string>) => {
      strings.setLanguage(payload);
      state.language = payload;
    }
  }
});

/**
 * Locale actions from created locale slice
 */
export const { setLanguage } = localeSlice.actions;

/**
 * Select locale state selector
 *
 * @param state Redux store root state
 * @returns locale state from Redux store
 */
export const selectLocaleState = (state: RootState) => state.locale;

/**
 * Select language selector
 *
 * @param state Redux store root state
 * @returns site language from Redux store
 */
export const selectLanguage = (state: RootState) => state.locale.language;

/**
 * Reducer for locale slice
 */
export default localeSlice.reducer;