import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
import { useAppSelector } from "app/hooks";
import GenericDialog from "components/generic/generic-dialog";
import strings from "localization/strings";
import * as React from "react";
import Api from "api";
import { selectKeycloak } from "features/auth-slice";
import { ErrorContext } from "components/error-handler/error-handler";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { LocalizedValue, Usage } from "generated/client";
import LocalizationUtils from "utils/localization-utils";
import { selectLanguage } from "features/locale-slice";

/**
 * Component for post processing dropdown menu editor
 */
const PostProcessing: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  const selectedLanguage = useAppSelector(selectLanguage);
  const availableLanguages = strings.getAvailableLanguages();

  const [ addingPostProcessing, setAddingPostProcessing ] = React.useState(false);
  const [ deletingPostProcess, setDeletingPostProcess ] = React.useState(false);
  const [ editingPostProcess, setEditingPostProcess ] = React.useState(false);
  const [ newPostProcessName, setNewPostProcessName ] = React.useState<LocalizedValue[]>([]);
  const [ deletablePostProcess, setDeletablePostProcess ] = React.useState<Usage>();
  const [ postProcesses, setPostProcesses ] = React.useState<Usage[]>([]);
  const [ editablePostProcess, setEditablePostProcess ] = React.useState<Usage>();
  const [ loading, setLoading ] = React.useState(false);

  /**
   * Fetches list of post processes
   */
  const fetchPostProcesses = async () => {
    if (!keycloak?.token) {
      return;
    }

    setLoading(true);

    try {
      setPostProcesses(await Api.getUsagesApi(keycloak.token).listUsages());
    } catch (error) {
      errorContext.setError(strings.errorHandling.postProcess.list, error);
    }

    setLoading(false);
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchPostProcesses();
  }, []);

  /**
   * Event handler for adding post process confirm
   */
  const onAddPostProcessingConfirm = async () => {
    if (!keycloak?.token || !newPostProcessName) {
      return;
    }
    
    try {
      const createdPostProcess = await Api.getUsagesApi(keycloak.token).createUsage({
        usage: {
          localizedNames: newPostProcessName,
          metadata: {}
        }
      });
      setPostProcesses([ ...postProcesses, createdPostProcess ]);
      setNewPostProcessName([]);
    } catch (error) {
      errorContext.setError(strings.errorHandling.postProcess.create, error);
    }

    setAddingPostProcessing(false);
  };

  /**
   * Event handler for deleting post process confirm
   */
  const onDeletePostProcessConfirm = async () => {
    if (!keycloak?.token || !deletablePostProcess?.id) {
      return;
    }

    try {
      await Api.getUsagesApi(keycloak.token).deleteUsage({ usageId: deletablePostProcess?.id });
      setPostProcesses(postProcesses.filter(postProcess => postProcess.id !== deletablePostProcess.id));
      setDeletablePostProcess(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.postProcess.delete, error);
    }

    setDeletingPostProcess(false);
  };

  /**
   * Even handler for new post processing localized name change
   *
   * @param event event
   */
  const handleNewLocalizedNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    const { name, value } = target;
    const newLocalizedNames = postProcesses ? [ ...newPostProcessName ] : [];
    const localizedValueIndex = newLocalizedNames.findIndex(localizedValue => localizedValue.language === name);
  
    if (localizedValueIndex > -1) {
      newLocalizedNames[localizedValueIndex].value = value;
      newLocalizedNames[localizedValueIndex].language = name;
    } else {
      newLocalizedNames.push({ language: name, value: value });
    }
  
    setNewPostProcessName(newLocalizedNames);
  };

  /**
   * Event handler for editing post process confirm
   */
  const onEditPostProcessConfirm = async () => {
    if (!keycloak?.token || !editablePostProcess?.id) {
      return;
    }

    try {
      const updatedPostProcess = await Api.getUsagesApi(keycloak.token).updateUsage({
        usageId: editablePostProcess.id,
        usage: editablePostProcess
      });

      setPostProcesses(postProcesses.map(postProcess => (postProcess.id === updatedPostProcess.id ? updatedPostProcess : postProcess)));
      setEditablePostProcess(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.update, error);
    }

    setEditingPostProcess(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param postProcess post process
   */
  const deleteIconClick = (postProcess: Usage) => {
    setDeletablePostProcess(postProcess);
    setDeletingPostProcess(true);
  };

  /**
   * Event handler edit icon click
   *
   * @param postProcess post process
   */
  const editIconClick = (postProcess: Usage) => () => {
    setEditablePostProcess(postProcess);
    setEditingPostProcess(true);
  };

  /**
   * Event handler for editable post process localized name change
   *
   * @param event event
   */
  const handleEditableNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    if (!editablePostProcess) {
      return;
    }

    const { name, value } = target;
    const newLocalizedNames = [ ...editablePostProcess.localizedNames ] || [];
    const localizedValueIndex = newLocalizedNames.findIndex(localizedValue => localizedValue.language === name);

    if (localizedValueIndex > -1) {
      newLocalizedNames[localizedValueIndex].value = value;
    } else {
      newLocalizedNames.push({ language: name, value: value });
    }

    setEditablePostProcess({ ...editablePostProcess, localizedNames: newLocalizedNames });
  };

  /**
   * Items for post processing option
   * 
   * @returns post processing item
   */
  const postProcessingItems = () => (
    postProcesses.map(postProcess =>
      <MaterialItem key={ postProcess.id }>
        <MaterialText primary={ LocalizationUtils.getLocalizedName(postProcess.localizedNames, selectedLanguage) }/>
        <ListItemSecondaryAction>
          <IconButton onClick={ () => deleteIconClick(postProcess) }>
            <Delete/>
          </IconButton>
          <IconButton onClick={ editIconClick(postProcess) }>
            <Edit/>
          </IconButton>
        </ListItemSecondaryAction>
      </MaterialItem>
    )
  );

  /**
   * Renders add post processing dialog
   */
  const renderAddPostProcessingDialog = () => (
    <GenericDialog
      open={ addingPostProcessing }
      onClose={ () => setAddingPostProcessing(false) }
      onCancel={ () => setAddingPostProcessing(false) }
      onConfirm={ onAddPostProcessingConfirm }
      title={ strings.adminScreen.addNewPostProcessDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      { availableLanguages.map(language => (
        <TextField
          key={ language }
          name={ language }
          label={ language === "fi" ?
            strings.formatString(strings.adminScreen.dialogText.fi) :
            strings.formatString(strings.adminScreen.dialogText.en)
          }
          onChange={ handleNewLocalizedNameChange }
        />
      ))}
      
    </GenericDialog>
  );

  /**
   * Renders delete post process dialog
   */
  const renderDeletePostProcessingDialog = () => (
    <GenericDialog
      open={ deletingPostProcess }
      onClose={ () => setDeletingPostProcess(false) }
      onCancel={ () => setDeletingPostProcess(false) }
      onConfirm={ onDeletePostProcessConfirm }
      title={ strings.adminScreen.deletePostProcessDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.formatString(strings.adminScreen.deletePostProcessDialog.text,
          deletablePostProcess ? LocalizationUtils.getLocalizedName(deletablePostProcess.localizedNames, selectedLanguage)
            : ""
        )}
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders edit reusable dialog
   */
  const renderEditPostProcessDialog = () => (
    <GenericDialog
      open={ editingPostProcess }
      onClose={ () => setEditingPostProcess(false) }
      onCancel={ () => setEditingPostProcess(false) }
      onConfirm={ onEditPostProcessConfirm }
      title={ strings.adminScreen.updatePostProcessDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      { availableLanguages.map(language => (
        <TextField
          key={ language }
          name={ language }
          label={ language === "fi" ?
            strings.formatString(strings.adminScreen.dialogText.fi) :
            strings.formatString(strings.adminScreen.dialogText.en)
          }
          value={ editablePostProcess && LocalizationUtils.getLocalizedName(editablePostProcess.localizedNames, language) }
          onChange={ handleEditableNameChange }
        />
      ))}
      
    </GenericDialog>
  );

  /**
   * Renders list of post processing options
   */
  const renderList = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          flex={ 1 }
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress color="primary" size={ 60 }/>
        </Box>
      );
    }

    return (
      <List sx={{ pt: 4 }}>
        { postProcessingItems() }
      </List>
    );
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">
          { strings.adminScreen.navigation.dropdownSettings.postProcessing }
        </Typography>
        <Button
          color="secondary"
          onClick={ () => setAddingPostProcessing(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddPostProcessingDialog() }
      { renderDeletePostProcessingDialog() }
      { renderEditPostProcessDialog() }
    </>
  );
};

export default PostProcessing;