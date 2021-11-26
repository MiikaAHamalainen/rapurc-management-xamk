import { Add, Delete } from "@mui/icons-material";
import { Box, Hidden, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import GenericDialog from "components/generic/generic-dialog";
import { selectKeycloak } from "features/auth-slice";
import { Reusable, Usability } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import WhiteOutlinedInput from "styled/generic/inputs";
import { SurveyButton } from "styled/screens/surveys-screen";
import theme from "theme";

/**
 * Component properties
 */
interface Props {
  surveyId: string;
}

/**
 * Component for reusable materials and building parts
 */
const Reusables: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ surveyReusables, setSurveyReusables ] = React.useState<Reusable[]>([]);
  const [ addingSurveyReusable, setAddingSurveyReusable ] = React.useState<boolean>(false);

  /**
   * Fetch owner information array
   */
  const fetchSurveyReusables = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const fetchedSurveyReusables = await Api.getSurveyReusablesApi(keycloak.token).listSurveyReusables({
        surveyId: surveyId
      });
      setSurveyReusables(fetchedSurveyReusables);
      console.log(surveyReusables);
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.list, error);
    }
  };

  React.useEffect(() => {
    fetchSurveyReusables();
  }, []);

  /**
   * Event handler for add reusable confirm
   */
  const onAddReusableConfirm = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const createdReusable = await Api.getSurveyReusablesApi(keycloak.token).createSurveyReusable({
        surveyId: surveyId,
        reusable: {
          componentName: "Testikomponentti",
          reusableMaterialId: "Tähän id",
          usability: Usability.Good,
          metadata: {}
        }
      });
      setSurveyReusables([ ...surveyReusables, createdReusable ]);
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.create, error);
    }

    setAddingSurveyReusable(false);
  };

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  /**
   * Renders add survey reusable dialog
   */
  const renderAddSurveyReusableDialog = () => (
    <GenericDialog
      error={ false }
      open={ addingSurveyReusable }
      onClose={ () => setAddingSurveyReusable(false) }
      onCancel={ () => setAddingSurveyReusable(false) }
      onConfirm={ onAddReusableConfirm }
      title={ strings.survey.reusables.addNewBuildinPartsDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography variant="subtitle1">
        { strings.survey.reusables.addNewBuildinPartsDialog.title }
      </Typography>
      <TextField
        fullWidth
        color="secondary"
        variant="filled"
        placeholder="Rakennusosan nimi"
        onChange={ event => console.log(event.target.value) }
        helperText="Anna rakennusosaa kuvaava nimi"
      />
      <Stack>
        <WhiteOutlinedInput
          fullWidth={ isMobile }
          color="secondary"
          select
          variant="outlined"
          id="filter"
          label={ strings.surveysScreen.filter }
        />
        <Stack direction="row">
          <TextField
            color="secondary"
            variant="filled"
            placeholder="Rakennusosan nimi"
            onChange={ event => console.log(event.target.value) }
            helperText="Anna rakennusosaa kuvaava nimi"
          />
        </Stack>
        <Stack>
          <TextField
            color="secondary"
            variant="filled"
            placeholder="Rakennusosan nimi"
            onChange={ event => console.log(event.target.value) }
            helperText="Anna rakennusosaa kuvaava nimi"
          />
        </Stack>
      </Stack>
    </GenericDialog>
  );

  return (
    <>
      <Stack direction={ isMobile ? "column" : "row" } justifyContent="space-between">
        <Typography variant="h2">
          { strings.survey.reusables.title }
        </Typography>
        <Box
          display="flex"
          alignItems="stretch"
        >
          <Hidden lgDown>
            <SurveyButton
              disabled={ false }
              variant="contained"
              color="error"
              startIcon={ <Delete/> }
              onClick={ () => console.log("Poista") }
              sx={{ mr: 2 }}
            >
              { strings.survey.reusables.deleteBuildingParts }
            </SurveyButton>
          </Hidden>
          <SurveyButton
            variant="contained"
            color="secondary"
            startIcon={ <Add/> }
            onClick={ () => setAddingSurveyReusable(true) }
          >
            { strings.survey.reusables.addNewBuildingPart }
          </SurveyButton>
        </Box>
      </Stack>
      { renderAddSurveyReusableDialog() }
    </>
  );
};

export default Reusables;