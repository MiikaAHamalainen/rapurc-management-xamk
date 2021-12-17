import { Add, Delete, Download } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import AttachmentCard from "components/generic/acttachment-card";
import GenericDialog from "components/generic/generic-dialog";
import { selectKeycloak } from "features/auth-slice";
import { Attachment } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { SurveyButton } from "styled/screens/surveys-screen";
import theme from "theme";
import FileUploadUtils from "utils/file-upload";

/**
 * Component properties
 */
interface Props {
  surveyId: string;
}

/**
 * Component for attachment
 */
const AttachmentView: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);

  const [ surveyAttachments, setSurveyAttachments ] = React.useState<Attachment[]>([]);
  const [ loadingAttachments, setLoadingAttachments ] = React.useState<Attachment[]>([]);
  const [ loading, setLoading ] = React.useState(false);
  const [ deletingAttachment, setDeletingAttachment ] = React.useState(false);
  const [ attachmentToBeDeleted, setAttachmentToBeDeleted ] = React.useState<Attachment>();

  React.useEffect(() => {
    const lastUploadedAttachment = surveyAttachments[surveyAttachments.length - 1];

    const index = loadingAttachments.findIndex(attachment => attachment.url === lastUploadedAttachment.url);
    const updatedLoadingAttachments = [ ...loadingAttachments ];
    updatedLoadingAttachments.splice(index, 1);
    setLoadingAttachments(updatedLoadingAttachments);
  }, [surveyAttachments]);

  /**
   * Fetches survey attachments
   */
  const fetchAttachment = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      setSurveyAttachments(await Api.getAttachmentsApi(keycloak.token).listSurveyAttachments({ surveyId: surveyId }));
    } catch (error) {
      errorContext.setError(strings.errorHandling.attachments.list, error);
    }
  };

  /**
   * Loads data
   */
  const loadData = async () => {
    setLoading(true);
    await fetchAttachment();
    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  /**
   * Create attachment
   * 
   * @param newAttachment new attachment
   */
  const createAttachment = async (newAttachment: Attachment) => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      await Api.getAttachmentsApi(keycloak.token).createSurveyAttachment({ surveyId: surveyId, attachment: newAttachment });
    } catch (error) {
      errorContext.setError(strings.errorHandling.attachments.create, error);
    }

    await fetchAttachment();
  };

  /**
   * Delete attachment
   * 
   * @param attachment attachment
   */
  const deleteAttachment = async (attachment: Attachment) => {
    if (!keycloak?.token || !surveyId || !attachment.id) {
      return;
    }

    try {
      await Api.getAttachmentsApi(keycloak.token).deleteSurveyAttachment({ surveyId: surveyId, attachmentId: attachment.id });
    } catch (error) {
      errorContext.setError(strings.errorHandling.attachments.delete, error);
    }

    await fetchAttachment();
  };

  /**
   * Handler for delete attachment click
   * 
   * @param attachment attachment
   */
  const onDeleteAttachmentClick = (attachment: Attachment) => {
    setAttachmentToBeDeleted(attachment);
    setDeletingAttachment(true);
  };

  /**
   * Handler for delete attachment close
   */
  const onDeleteAttachmentClose = () => {
    setAttachmentToBeDeleted(undefined);
    setDeletingAttachment(false);
  };

  /**
   * Handler for delete attachment confirm
   */
  const onDeleteAttachmentConfirm = async () => {
    attachmentToBeDeleted && await deleteAttachment(attachmentToBeDeleted);
    setAttachmentToBeDeleted(undefined);
    setDeletingAttachment(false);
  };

  /**
   * Handler for attachment drop
   * 
   * @param addedFiles added files
   */
  const onAttachmentDrop = async (addedFiles: File[]) => {
    if (addedFiles.length !== 1 || !keycloak?.token) {
      return;
    }

    const [ addedFile ] = FileUploadUtils.normalizeFileNames([ addedFiles[0] ]);
    const uploadData = await FileUploadUtils.upload(keycloak.token, addedFile);
    const { xhrRequest, uploadUrl, formData, key } = uploadData;

    const fileUrl = `${uploadUrl}/${key}`;

    const loadingAttachment: Attachment = {
      url: fileUrl,
      name: addedFile.name
    };

    setLoadingAttachments([ ...loadingAttachments, loadingAttachment ]);
    xhrRequest.open("POST", uploadUrl, true);
    xhrRequest.send(formData);

    const newAttachment: Attachment = {
      url: fileUrl,
      name: addedFile.name
    };

    await createAttachment(newAttachment);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    maxSize: 5242880,
    onDrop: onAttachmentDrop
  });

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  /**
   * Renders attachment download button
   * 
   * @param attachment attachment
   */
  const renderAttachmentDownload = (attachment: Attachment) => (
    <IconButton
      sx={{ mr: 2 }}
      onClick={ () => window.open(attachment.url) }
    >
      <Download/>
    </IconButton>
  );

  /**
   * Renders mobile attachment control
   * 
   * @param attachment attachment
   */
  const renderMobileAttachmentControl = (attachment: Attachment) => (
    <>
      { renderAttachmentDownload(attachment) }
      <IconButton onClick={ () => onDeleteAttachmentClick(attachment) }>
        <Delete/>
      </IconButton>
    </>
  );

  /**
   * Renders attachment control
   * 
   * @param attachment attachment
   */
  const renderAttachmentControl = (attachment: Attachment) => (
    <>
      { renderAttachmentDownload(attachment) }
      <Button
        variant="text"
        color="primary"
        startIcon={ <Delete/> }
        onClick={ () => onDeleteAttachmentClick(attachment) }
      >
        { strings.generic.delete }
      </Button>
    </>
  );

  /**
   * Renders attachment list
   */
  const renderAttachmentList = () => (
    <Stack
      spacing={ 3 }
    >
      {
        surveyAttachments.map(attachment => (
          <AttachmentCard
            attachment={ attachment }
            rightControl={ isMobile
              ?
              renderMobileAttachmentControl(attachment)
              :
              renderAttachmentControl(attachment) }
          />
        ))
      }
    </Stack>
  );

  /**
   * Renders loading attachment list
   */
  const renderLoadingAttachmentList = () => (
    <Stack mt={ 3 } spacing={ 3 }>
      {
        loadingAttachments.map(attachment => (
          <AttachmentCard
            loading
            attachment={ attachment }
          />
        ))
      }
    </Stack>
  );

  /**
   * Renders delete attachment dialog
   */
  const renderDeleteAttachmentDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingAttachment }
      onClose={ onDeleteAttachmentClose }
      onCancel={ onDeleteAttachmentClose }
      onConfirm={ onDeleteAttachmentConfirm }
      title={ strings.survey.attachments.dialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.survey.attachments.dialog.text }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders loader
   */
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
    <>
      <Stack
        spacing={ 2 }
        direction="row"
        justifyContent="space-between"
        marginBottom={ 2 }
      >
        <Typography variant="h2">
          { strings.survey.attachments.title }
        </Typography>
        <Box
          display="flex"
          alignItems="stretch"
          { ...getRootProps({ className: "dropzone" })}
        >
          <input { ...getInputProps() }/>
          <SurveyButton
            startIcon={ <Add/> }
            variant="contained"
            color="secondary"
            onClick={ open }
          >
            { strings.survey.attachments.add }
          </SurveyButton>
        </Box>
      </Stack>
      { renderAttachmentList() }
      { renderLoadingAttachmentList() }
      { renderDeleteAttachmentDialog() }
    </>
  );
};

export default AttachmentView;