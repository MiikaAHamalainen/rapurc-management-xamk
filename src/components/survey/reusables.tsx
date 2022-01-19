import { Add, Delete } from "@mui/icons-material";
import { Box, Button, CircularProgress, Fab, Grid, Hidden, List, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId } from "@mui/x-data-grid";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import GenericDialog from "components/generic/generic-dialog";
import WithDataGridDebounceFactory from "components/generic/with-data-grid-debounce";
import WithDebounce from "components/generic/with-debounce";
import SurveyItem from "components/layout-components/survey-item";
import { selectKeycloak } from "features/auth-slice";
import { Reusable, ReusableMaterial, Unit, Usability } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import { DropZoneContainer, SurveyButton, ThumbnailButton, DeleteButton } from "styled/screens/surveys-screen";
import theme from "theme";
import LocalizationUtils from "utils/localization-utils";
import { useDropzone } from "react-dropzone";
import FileUploadUtils from "utils/file-upload";
import { UploadFile } from "types";
import produce from "immer";

const WithReusableDataGridDebounce = WithDataGridDebounceFactory<Reusable>();

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
  const [ addingSurveyReusable, setAddingSurveyReusable ] = React.useState<boolean>(false);
  const [ loading, setLoading ] = React.useState(false);
  const [ uploadedFiles, setUploadedFiles ] = React.useState<UploadFile[]>([]);
  const [ newReusableFiles, setNewReusableFiles ] = React.useState<File[]>([]);
  const [ imageDialogOpen, setImageDialogOpen ] = React.useState(false);
  const [ deletingMaterial, setDeletingMaterial ] = React.useState(false);
  const [ reusableDescriptionDialogOpen, setReusableDescriptionDialogOpen ] = React.useState(true);
  const [ reusableUploadingImage, setReusableUploadingImage ] = React.useState<Reusable>();
  const [ displayedImageIndex, setDisplayedImageIndex ] = React.useState(0);
  const [ surveyReusables, setSurveyReusables ] = React.useState<Reusable[]>([]);
  const [ reusableMaterials, setReusableMaterials ] = React.useState<ReusableMaterial[]>([]);
  const [ selectedReusableIds, setSelectedReusableIds ] = React.useState<GridRowId[]>([]);
  const [ newMaterial, setNewMaterial ] = React.useState<Reusable>({
    componentName: "",
    usability: Usability.NotValidated,
    reusableMaterialId: "",
    metadata: {}
  });

  /**
   * Fetch owner information array
   */
  const fetchSurveyReusables = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    setLoading(true);

    try {
      const fetchedReusables = await Api.getSurveyReusablesApi(keycloak.token).listSurveyReusables({ surveyId: surveyId });
      setSurveyReusables(fetchedReusables);
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.list, error);
    }

    setLoading(false);
  };

  /**
   * Fetches list of reusable materials and building parts
   */
  const fetchReusableMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setReusableMaterials(await Api.getReusableMaterialApi(keycloak.token).listReusableMaterials());
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.list, error);
    }
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchSurveyReusables();
    fetchReusableMaterials();
    setSelectedReusableIds([]);
  }, []);

  /**
   * On new reusable file delete
   *
   * @param index index
   */
  const onNewReusableFileDelete = (index: number) => {
    const updatedNewReusableFiles = [ ...newReusableFiles ];
    updatedNewReusableFiles.splice(index, 1);
    setNewReusableFiles(updatedNewReusableFiles);
  };

  /**
   * Event handler for add reusable confirm
   */
  const onAddReusableConfirm = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const imageUrlPromises = newReusableFiles.map(async newReusableFile => {
        const uploadData = await FileUploadUtils.upload(keycloak.token!!, newReusableFile);
        const { xhrRequest, uploadUrl, formData, key } = uploadData;

        xhrRequest.open("POST", uploadUrl, true);
        xhrRequest.send(formData);
        return `${uploadUrl}/${key}`;
      });

      const imageUrls = await Promise.all(imageUrlPromises);

      const createdReusable = await Api.getSurveyReusablesApi(keycloak.token).createSurveyReusable({
        surveyId: surveyId,
        reusable: { ...newMaterial, images: imageUrls }
      });

      setSurveyReusables([ ...surveyReusables, createdReusable ]);
      setNewMaterial({
        componentName: "",
        usability: Usability.NotValidated,
        reusableMaterialId: "",
        metadata: {}
      });
      setNewReusableFiles([]);
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.create, error);
    }

    setAddingSurveyReusable(false);
  };

  /**
   * Reusable change handler
   * 
   * @param updatedReusable updated reusable
   */
  const onMaterialRowChange = async (updatedReusable: Reusable) => {
    if (!keycloak?.token || !updatedReusable.id || !surveyId || !updatedReusable.componentName) {
      return;
    }

    setSurveyReusables(surveyReusables.map(reusable => (reusable.id === updatedReusable.id ? updatedReusable : reusable)));
    try {
      await Api.getSurveyReusablesApi(keycloak.token).updateSurveyReusable({
        surveyId: surveyId,
        reusableId: updatedReusable.id,
        reusable: updatedReusable
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.update, error);
    }
    
    setReusableDescriptionDialogOpen(true); // TODO: Find another way to set description dialog open
  };

  /**
   * New reusable files upload
   * 
   * @param acceptedFiles accepted files
   */
  const newReusableFilesUpload = (acceptedFiles: File[]) => {
    const updatedNewReusableFiles = FileUploadUtils.normalizeFileNames([ ...newReusableFiles, ...acceptedFiles ].splice(0, 4));
    setNewReusableFiles(updatedNewReusableFiles);
  };

  /**
   * Reusable file upload progress
   * 
   * @param updatedUploadedFile updated uploaded file
   * @param file file
   */
  const onFileUploadProgress = (updatedUploadedFile: UploadFile[], file: File) => (progress: number) => {
    setUploadedFiles(updatedUploadedFile.map(uploadedFile => (uploadedFile.file?.name === file.name ? { ...uploadedFile, progress: progress } : uploadedFile)));
  };

  /**
   * files upload handler
   * 
   * @param acceptedFiles accepted files
   */
  const filesUpload = async (acceptedFiles: File[]) => {
    if (!keycloak || !reusableUploadingImage || (reusableUploadingImage.images?.length || 0) >= 4) {
      return;
    }

    const addedFile = FileUploadUtils.normalizeFileNames(acceptedFiles)[0];
    const updatedUploadedFile = [ ...uploadedFiles, ({ file: addedFile, progress: 0 }) ];
    setUploadedFiles(updatedUploadedFile);
    const updatedReusable = { ...reusableUploadingImage };

    try {
      const uploadData = await FileUploadUtils.upload(keycloak.token!!, addedFile, onFileUploadProgress(updatedUploadedFile, addedFile));
      const { xhrRequest, uploadUrl, formData, key } = uploadData;
      
      xhrRequest.open("POST", uploadUrl, true);
      xhrRequest.send(formData);
      const imageUrl = `${uploadUrl}/${key}`;
      updatedReusable.images = updatedReusable.images ? [ ...updatedReusable.images, imageUrl ] : [ imageUrl ];
    } catch (error) {
      errorContext.setError(strings.errorHandling.failToUpload, error);
    }

    await onMaterialRowChange(updatedReusable);
    setReusableUploadingImage(updatedReusable);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    accept: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    maxFiles: 1,
    onDrop: reusableUploadingImage?.id ? filesUpload : newReusableFilesUpload
  });

  /**
   * Validates number input event
   * 
   * @param onChange event handler callback
   */
  const numberValidator = (
    onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  ) => (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { value } = event.target;

    if (!value) {
      onChange({
        ...event,
        target: {
          ...event.target,
          value: "0"
        }
      });
      return;
    }

    if (Number.isNaN(parseFloat(value))) {
      return;
    }

    onChange(event);
  };

  /**
   * Event Handler set material prop
   * 
   * @param reusable reusable
   */
  const onMaterialPropChange: (reusable: Reusable) =>
  React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (reusable: Reusable) =>
    ({ target }) => {
      const { value, name } = target;

      const updatedReusable: Reusable = { ...reusable, [name]: value };
      onMaterialRowChange(updatedReusable);
    };

  /**
    * Event handler for mobile view delete survey click
    *
    * @param surveyId survey id
    */
  const deleteMaterialButtonClick = (surveyorId?: string) => {
    if (!surveyorId) {
      return;
    }

    setDeletingMaterial(true);
    setSelectedReusableIds([ surveyorId ]);
  };

  /**
   * Event handler for add reusable confirm
   *
   * @param reusable reusable
   */
  const onImageDialogOpen = (reusable: Reusable) => {
    setImageDialogOpen(true);
    setReusableUploadingImage(reusable);
    setUploadedFiles(reusable.images?.map(image => ({ imageUrl: image, progress: 100 })) || []);
  };

  /**
   * Event handler for add reusable confirm
   */
  const onImageDialogClose = () => {
    setImageDialogOpen(false);
    setReusableUploadingImage(undefined);
    setUploadedFiles([]);
  };

  /**
   * Event handler for delete survey reusable confirm
   */
  const onDeleteSurveyReusableConfirm = async () => {
    if (!keycloak?.token || !selectedReusableIds || !surveyId) {
      return;
    }

    const reusablesApi = Api.getSurveyReusablesApi(keycloak.token);

    try {
      await Promise.all(
        selectedReusableIds.map(async materialId => {
          await reusablesApi.deleteSurveyReusable({
            surveyId: surveyId,
            reusableId: materialId.toString()
          });
        })
      );
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.delete, error);
    }

    fetchSurveyReusables();
    setSelectedReusableIds([]);
    setDeletingMaterial(false);
  };

  /**
   * Event handler for new material string change
   *
   * @param event React change event
   */
  const onNewMaterialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setNewMaterial({ ...newMaterial, [name]: value });
  };

  /**
   * Event handler for new material number change
   *
   * @param index number
   */
  const onReusableImageDelete = (index: number) => () => {
    if (!reusableUploadingImage?.images) {
      return;
    }

    const updatedReusableUploadingImage = produce(reusableUploadingImage, draft => {
      draft.images && draft.images.splice(index, 1);
    });

    setUploadedFiles(updatedReusableUploadingImage.images?.map(image => ({ imageUrl: image, progress: 100 })) || []);
    setReusableUploadingImage(updatedReusableUploadingImage);
    onMaterialRowChange(updatedReusableUploadingImage);
  };

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  /**
   * Renders textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param value value
   * @param onChange onChange
   */
  const renderWithDebounceTextField = (
    name: string,
    label: string,
    value: string,
    onChange: React.ChangeEventHandler<HTMLInputElement>
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField sx={{ mb: 1 }} { ...props }/>
      }
    />
  );

  /**
   * Renders multiline textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param value value
   * @param onChange onChange
   */
  const renderWithDebounceMultilineTextField = (
    name: string,
    label: string,
    value: string,
    onChange: React.ChangeEventHandler<HTMLInputElement>
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField
          multiline
          rows={ 4 }
          sx={{ mb: 1 }}
          { ...props }
        />
      }
    />
  );

  /**
   * Renders number textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param onChange onChange
   * @param value value
   */
  const renderWithDebounceNumberTextField = (
    name: string,
    label: string,
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    value?: number
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ numberValidator(onChange) }
      component={ props =>
        <TextField
          type="number"
          sx={{ mb: 1 }}
          { ...props }
        />
      }
    />
  );

  /**
   * Renders select textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param options options
   * @param onChange onChange
   * @param value value
   */
  const renderWithDebounceSelectTextField = (
    name: string,
    label: string,
    options: React.ReactNode[],
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    value?: string,
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField
          select
          sx={{ mb: 1 }}
          { ...props }
        >
          { options }
        </TextField>
      }
    />
  );

  /**
   * Renders delete material dialog
   */
  const renderDeleteSurveyMaterialDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingMaterial }
      onClose={ () => setDeletingMaterial(false) }
      onCancel={ () => setDeletingMaterial(false) }
      onConfirm={ onDeleteSurveyReusableConfirm }
      title={ strings.survey.reusables.deleteReusableDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.survey.reusables.deleteReusableDialog.text }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders new reusable image upload 
   */
  const renderNewReusableImageUpload = () => (
    <Stack mt={ 2 } spacing={ 2 }>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={{ xs: 2, sm: 4 }}
      >
        <Typography sx={{ whiteSpace: "pre-wrap" }}>
          { strings.survey.reusables.addNewBuildingPartsDialog.imageDescription }
        </Typography>
        <Box { ...getRootProps({ className: "dropzone" }) }>
          <input { ...getInputProps() }/>
          <Button
            startIcon={ <Add/> }
            variant="contained"
            color="primary"
            onClick={ open }
          >
            { strings.survey.reusables.moreImage }
          </Button>
        </Box>
      </Stack>
      {
        newReusableFiles.map((uploadedFile, index) => (
          <Stack
            direction="row"
            alignItems="center"
          >
            <img
              width={ 50 }
              height={ 50 }
              alt={ uploadedFile.name }
              src={ URL.createObjectURL(uploadedFile) }
            />
            <Typography ml={ 2 }>
              { uploadedFile.name }
            </Typography>
            <Button
              sx={{ ml: "auto" }}
              color="error"
              onClick={ () => onNewReusableFileDelete(index) }
            >
              { strings.generic.delete }
            </Button>
          </Stack>
        ))
      }
    </Stack>
  );

  /**
   * Renders add survey reusable dialog
   */
  const renderAddSurveyReusableDialog = () => {
    const reusableOptions = Object.values(reusableMaterials)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(material =>
        <MenuItem key={ material.id } value={ material.id }>
          { material.name }
        </MenuItem>
      );

    const usabilityOptions = Object.values(Usability)
      .sort((a, b) => LocalizationUtils.getLocalizedUsability(a).localeCompare(LocalizationUtils.getLocalizedUsability(b)))
      .map(usability =>
        <MenuItem key={ usability } value={ usability }>
          { LocalizationUtils.getLocalizedUsability(usability) }
        </MenuItem>
      );

    const unitOptions = Object.values(Unit)
      .sort((a, b) => LocalizationUtils.getLocalizedUnits(a).localeCompare(LocalizationUtils.getLocalizedUnits(b)))
      .map(unit =>
        <MenuItem key={ unit } value={ unit }>
          { LocalizationUtils.getLocalizedUnits(unit) }
        </MenuItem>
      );

    return (
      <GenericDialog
        fullScreen={ useMediaQuery(theme.breakpoints.down("sm")) }
        error={ false }
        disabled={ !newMaterial.componentName || !newMaterial.reusableMaterialId }
        open={ addingSurveyReusable }
        onClose={ () => setAddingSurveyReusable(false) }
        onCancel={ () => setAddingSurveyReusable(false) }
        onConfirm={ onAddReusableConfirm }
        title={ strings.survey.reusables.addNewBuildingPartsDialog.title }
        positiveButtonText={ strings.generic.confirm }
        cancelButtonText={ strings.generic.cancel }
      >
        <TextField
          fullWidth
          color="primary"
          name="componentName"
          label={ strings.survey.reusables.dataGridColumns.buildingPart }
          onChange={ onNewMaterialChange }
          value={ newMaterial.componentName }
          helperText={ strings.survey.reusables.addNewBuildingPartsDialog.buildingPartHelperText }
        />
        <Stack
          direction={ isMobile ? "column" : "row" }
          spacing={ 2 }
          marginTop={ 2 }
        >
          <TextField
            fullWidth
            select
            color="primary"
            name="reusableMaterialId"
            value={ newMaterial.reusableMaterialId }
            label={ strings.survey.reusables.addNewBuildingPartsDialog.buildingPartOrMaterial }
            helperText={ strings.survey.reusables.addNewBuildingPartsDialog.buildingPartOrMaterialHelperText }
            onChange={ onNewMaterialChange }
          >
            { reusableOptions }
          </TextField>
          <TextField
            fullWidth
            select
            color="primary"
            name="usability"
            value={ newMaterial.usability }
            label={ strings.survey.reusables.dataGridColumns.usability }
            helperText={ strings.survey.reusables.addNewBuildingPartsDialog.usabilityHelperText }
            onChange={ onNewMaterialChange }
          >
            { usabilityOptions }
          </TextField>
        </Stack>
        <Stack
          direction={ isMobile ? "column" : "row" }
          spacing={ 2 }
          marginTop={ 2 }
        >
          <TextField
            fullWidth
            color="primary"
            name="amount"
            value={ newMaterial.amount }
            label={ strings.survey.reusables.dataGridColumns.amount }
            type="number"
            onChange={ onNewMaterialChange }
          />
          <TextField
            fullWidth
            select
            name="unit"
            color="primary"
            value={ newMaterial.unit }
            label={ strings.survey.reusables.dataGridColumns.unit }
            onChange={ onNewMaterialChange }
          >
            { unitOptions }
          </TextField>
        </Stack>
        <Stack spacing={ 2 } marginTop={ 2 }>
          <TextField
            multiline
            rows={ 6 }
            name="description"
            label={ strings.survey.reusables.dataGridColumns.description }
            value={ newMaterial.description }
            onChange={ onNewMaterialChange }
            helperText={ strings.survey.reusables.addNewBuildingPartsDialog.descriptionHelperText }
          />
          <TextField
            type="number"
            name="amountAsWaste"
            label={ strings.survey.reusables.dataGridColumns.wasteAmountInTons }
            value={ newMaterial.amountAsWaste }
            onChange={ onNewMaterialChange }
            helperText={ strings.survey.reusables.addNewBuildingPartsDialog.wasteAmountHelperText }
          />
        </Stack>
        <Stack mt={ 2 }>
          <Typography variant="h3">
            { strings.survey.reusables.dataGridColumns.images }
          </Typography>
          { renderNewReusableImageUpload() }
        </Stack>
      </GenericDialog>
    );
  };

  /**
   * Renders delete image preview button
   * 
   * @param index index
   */
  const renderDeletePreviewButton = (index: number) => (
    <DeleteButton title={ strings.survey.reusables.deleteImage } onClick={ onReusableImageDelete(index) }>
      <Delete/>
    </DeleteButton>
  );

  /**
   * Renders image dialog preview
   * 
   * @param uploadedFile uploaded file
   * @param index index
   */
  const renderImagePreview = (uploadedFile: UploadFile, index: number) => {
    if (uploadedFile.imageUrl) {
      return (
        <Box
          sx={{
            position: "relative",
            justifyContent: "center",
            display: "flex"
          }}
        >
          { renderDeletePreviewButton(index) }
          <img
            style={{ maxWidth: "100%", maxHeight: "50vh" }}
            alt={ uploadedFile.imageUrl }
            src={ uploadedFile.imageUrl }
          />
        </Box>
      );
    }

    if (uploadedFile.file) {
      return (
        <Box
          sx={{
            position: "relative",
            justifyContent: "center",
            display: "flex"
          }}
        >
          { renderDeletePreviewButton(index) }
          <img
            style={{ maxWidth: "100%", maxHeight: "50vh" }}
            alt={ uploadedFile.file.name }
            src={ URL.createObjectURL(uploadedFile.file) }
          />
        </Box>
      );
    }

    return null;
  };

  /**
   * Renders image thumbnail
   * 
   * @param uploadedFile uploaded file
   * @param index index
   */
  const renderImageThumbnail = (uploadedFile: UploadFile, index: number) => {
    if (uploadedFile.imageUrl) {
      return (
        <Grid item md={ 3 } >
          <ThumbnailButton onClick={ () => setDisplayedImageIndex(index) }>
            <img
              alt={ uploadedFile.imageUrl }
              src={ uploadedFile.imageUrl }
            />
          </ThumbnailButton>
        </Grid>
      );
    }

    if (uploadedFile.file) {
      return (
        <Grid item md={ 3 }>
          <ThumbnailButton onClick={ () => setDisplayedImageIndex(index) }>
            { uploadedFile.progress < 100 &&
              <Box
                sx={{
                  position: "absolute",
                  transform: "translate3d(-50%, -50%, 0)",
                  top: "50%",
                  left: "50%"
                }}
              >
                <CircularProgress color="inherit"/>
              </Box>
            }
            <img
              alt={ uploadedFile.file.name }
              src={ URL.createObjectURL(uploadedFile.file) }
            />
          </ThumbnailButton>
        </Grid>
      );
    }

    return null;
  };

  /**
   * Renders delete image dialog
   */
  const imageDialogContent = () => {
    if (!reusableUploadingImage) {
      return null;
    }

    if (uploadedFiles.length === 0) {
      return (
        <DropZoneContainer { ...getRootProps({ className: "dropzone" }) }>
          <input { ...getInputProps() }/>
          <Stack spacing={ 2 }>
            <Typography>
              { strings.survey.reusables.dropFile }
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={ open }
            >
              { strings.survey.reusables.moreImage }
            </Button>
          </Stack>
        </DropZoneContainer>
      );
    }

    const selectedImageIndex = Math.min(displayedImageIndex, uploadedFiles.length - 1);
    const selectedImageFile = uploadedFiles[selectedImageIndex];

    return (
      <Stack spacing={ 2 } direction="column">
        <Typography>{ strings.survey.reusables.preview }</Typography>
        { renderImagePreview(selectedImageFile, selectedImageIndex) }
        <Typography>{ strings.survey.reusables.previewInfo }</Typography>
        <Grid container spacing={ 1 }>
          { uploadedFiles.map(renderImageThumbnail) }
          {
            uploadedFiles.length < 4 &&
            <Grid item md={ 3 }>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%"
                }}
                { ...getRootProps({ className: "dropzone" }) }
              >
                <input { ...getInputProps() }/>
                <Fab
                  title={ strings.survey.reusables.addImage }
                  color="primary"
                  onClick={ open }
                >
                  <Add/>
                </Fab>
              </Box>
            </Grid>
          }
        </Grid>
      </Stack>
    );
  };

  /**
   * Renders reusable image dialog
   */
  const renderReusableImageDialog = () => (
    <GenericDialog
      fullScreen={ useMediaQuery(theme.breakpoints.down("sm")) }
      error={ false }
      open={ imageDialogOpen }
      onClose={ onImageDialogClose }
      onCancel={ onImageDialogClose }
      onConfirm={ onImageDialogClose }
      title={ strings.survey.reusables.dataGridColumns.images }
      positiveButtonText={ strings.generic.close }
    >
      { imageDialogContent() }
    </GenericDialog>
  );

  /**
   * Render material list item
   */
  const renderMaterialListItems = () => {
    const materialOptions = reusableMaterials
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(material => (
        <MenuItem key={ material.id } value={ material.id }>
          { material.name }
        </MenuItem>
      ));
    const usabilityOptions = Object.values(Usability)
      .sort((a, b) => LocalizationUtils.getLocalizedUsability(a).localeCompare(LocalizationUtils.getLocalizedUsability(b)))
      .map(usability => (
        <MenuItem value={ usability }>
          { LocalizationUtils.getLocalizedUsability(usability) }
        </MenuItem>
      ));
    const UnitOptions = Object.values(Unit)
      .sort((a, b) => LocalizationUtils.getLocalizedUnits(a).localeCompare(LocalizationUtils.getLocalizedUnits(b)))
      .map(unit => (
        <MenuItem value={ unit }>
          { LocalizationUtils.getLocalizedUnits(unit) }
        </MenuItem>
      ));

    return (
      surveyReusables.map(reusable =>
        <SurveyItem
          key={ reusable.id }
          title={ reusable.componentName }
          subtitle={ `${reusable.amount} ${reusable.unit ? LocalizationUtils.getLocalizedUnits(reusable.unit) : ""}` }
        >
          { renderWithDebounceSelectTextField(
            "reusableMaterialId",
            strings.survey.reusables.dataGridColumns.material,
            materialOptions,
            onMaterialPropChange(reusable),
            reusable.reusableMaterialId
          )
          }
          { renderWithDebounceTextField(
            "componentName",
            strings.survey.reusables.dataGridColumns.buildingPart,
            reusable.componentName,
            onMaterialPropChange(reusable)
          )
          }
          { renderWithDebounceSelectTextField(
            "usability",
            strings.survey.reusables.dataGridColumns.usability,
            usabilityOptions,
            onMaterialPropChange(reusable),
            reusable.usability,
          )
          }
          { renderWithDebounceNumberTextField(
            "amount",
            strings.survey.reusables.dataGridColumns.amount,
            onMaterialPropChange(reusable),
            reusable.amount,
          )
          }
          { renderWithDebounceSelectTextField(
            "unit",
            strings.survey.reusables.dataGridColumns.unit,
            UnitOptions,
            onMaterialPropChange(reusable),
            reusable.unit,
          )
          }
          { renderWithDebounceMultilineTextField(
            "description",
            strings.survey.reusables.dataGridColumns.description,
            reusable.description || "",
            onMaterialPropChange(reusable),
          )
          }
          { renderWithDebounceNumberTextField(
            "amountAsWaste",
            strings.survey.reusables.dataGridColumns.wasteAmountInTons,
            onMaterialPropChange(reusable),
            reusable.amountAsWaste
          )
          }
          <Stack spacing={ 2 }>
            <SurveyButton
              fullWidth
              variant="contained"
              color="primary"
              onClick={ () => onImageDialogOpen(reusable) }
            >
              { reusable.images?.length ? strings.survey.reusables.viewImage : strings.survey.reusables.moreImage }
            </SurveyButton>
            <SurveyButton
              variant="outlined"
              color="primary"
              onClick={ () => deleteMaterialButtonClick(reusable.id) }
            >
              <Typography color={ theme.palette.primary.main }>
                { strings.generic.delete }
              </Typography>
            </SurveyButton>
          </Stack>
        </SurveyItem>
      )
    );
  };

  /**
   * Render surveyor list
   */
  const renderMaterialList = () => (
    <List>
      { renderMaterialListItems() }
    </List>
  );

  /**
   * Render survey reusables table for desktop
   */
  const renderSurveyDataTable = () => {
    const localizedUsability = Object.values(Usability)
      .sort((a, b) => LocalizationUtils.getLocalizedUsability(a).localeCompare(LocalizationUtils.getLocalizedUsability(b)))
      .map(usability => ({
        label: LocalizationUtils.getLocalizedUsability(usability),
        value: usability
      }));

    const localizedUnits = Object.values(Unit)
      .sort((a, b) => LocalizationUtils.getLocalizedUnits(a).localeCompare(LocalizationUtils.getLocalizedUnits(b)))
      .map(unit => ({
        label: LocalizationUtils.getLocalizedUnits(unit),
        value: unit
      }));

    const reusableMaterialsArray = reusableMaterials
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(material => ({ value: material.id, label: material.name }));

    const columns: GridColDef[] = [
      {
        field: "reusableMaterialId",
        headerName: strings.survey.reusables.dataGridColumns.material,
        width: 200,
        editable: true,
        type: "singleSelect",
        valueOptions: reusableMaterialsArray,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography variant="body2">
              { reusableMaterials.find(material => (material.id === formattedValue))?.name }
            </Typography>
          );
        }
      },
      {
        field: "componentName",
        headerName: strings.survey.reusables.dataGridColumns.buildingPart,
        width: 220,
        editable: true
      },
      {
        field: "usability",
        headerName: strings.survey.reusables.dataGridColumns.usability,
        width: 180,
        type: "singleSelect",
        valueOptions: localizedUsability,
        editable: true,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography variant="body2">
              { LocalizationUtils.getLocalizedUsability(formattedValue) }
            </Typography>
          );
        }
      },
      {
        field: "amount",
        headerName: strings.survey.reusables.dataGridColumns.amount,
        width: 100,
        type: "number",
        editable: true
      },
      {
        field: "unit",
        headerName: strings.survey.reusables.dataGridColumns.unit,
        width: 200,
        type: "singleSelect",
        valueOptions: localizedUnits,
        editable: true,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography variant="body2">
              { LocalizationUtils.getLocalizedUnits(formattedValue) }
            </Typography>
          );
        }
      },
      {
        field: "description",
        headerName: strings.survey.reusables.dataGridColumns.description,
        width: 450,
        editable: true,
        renderEditCell: (params: GridRenderEditCellParams) => {
          const { value, api, id, field } = params;
          return (
            <GenericDialog
              error={ false }
              title={ strings.survey.reusables.dataGridColumns.editDescription }
              open={ reusableDescriptionDialogOpen }
              onClose={ () => setReusableDescriptionDialogOpen(false) }
              onCancel={ () => setReusableDescriptionDialogOpen(false) }
              onConfirm={ () => setReusableDescriptionDialogOpen(false) }
              positiveButtonText={ strings.generic.confirm }
              cancelButtonText={ strings.generic.cancel }
            >
              <TextField
                label={ strings.survey.reusables.dataGridColumns.description }
                multiline
                rows={ 4 }
                value={ value }
                onChange={ e => api.setEditCellValue({
                  id: id,
                  field: field,
                  value: e.target.value
                }, e) }
              />
            </GenericDialog>
          );
        }
      },
      {
        field: "amountAsWaste",
        headerName: strings.survey.reusables.dataGridColumns.wasteAmount,
        width: 160,
        type: "number",
        editable: true,
        renderCell: (params: GridRenderCellParams) => {
          const { value } = params;
          return (
            <Typography variant="body2">
              { value ? `${value} tn` : "-" }
            </Typography>
          );
        }
      },
      {
        field: "images",
        headerName: strings.survey.reusables.dataGridColumns.images,
        width: 180,
        renderCell: (params: GridRenderCellParams) => {
          const { row } = params;
          return (
            <SurveyButton
              fullWidth
              variant="contained"
              color="primary"
              onClick={ () => onImageDialogOpen(row) }
            >
              { row.images?.length ? strings.survey.reusables.viewImage : strings.survey.reusables.moreImage }
            </SurveyButton>
          );
        }
      }
    ];

    return (
      <Paper>
        <WithReusableDataGridDebounce
          rows={ surveyReusables }
          columns={ columns }
          onRowChange={ onMaterialRowChange }
          component={ params =>
            <DataGrid
              onSelectionModelChange={ selectedIds => setSelectedReusableIds(selectedIds) }
              checkboxSelection
              autoHeight
              loading={ loading }
              pageSize={ 10 }
              disableSelectionOnClick
              { ...params }
            />
          }
        />
      </Paper>
    );
  };

  return (
    <>
      <Stack
        spacing={ 2 }
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        marginBottom={ 2 }
      >
        <Typography variant="h2">
          { strings.survey.reusables.title }
        </Typography>
        <Box
          display="flex"
          alignItems="stretch"
        >
          <Hidden lgDown>
            <SurveyButton
              disabled={ selectedReusableIds && !selectedReusableIds.length }
              variant="contained"
              color="error"
              startIcon={ <Delete/> }
              onClick={ () => setDeletingMaterial(true) }
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
      <Hidden lgUp>
        { renderMaterialList() }
      </Hidden>
      <Hidden lgDown>
        { renderSurveyDataTable() }
      </Hidden>
      { renderAddSurveyReusableDialog() }
      { renderDeleteSurveyMaterialDialog() }
      { renderReusableImageDialog() }
    </>
  );
};

export default Reusables;