import { Add, Delete } from "@mui/icons-material";
import { Box, CircularProgress, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
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
 * Component for hazardous materials
 */
const AttachmentView: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ surveyAttachments, setSurveyAttachments ] = React.useState<Attachment[]>([]);
  const [ loading, setLoading ] = React.useState(false);
  const [ deletingAttachment, setDeletingAttachment ] = React.useState(false);
  const [ attachmentToBeDeleted, setAttachmentToBeDeleted ] = React.useState<Attachment>();

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
   * Fetches survey attachments
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
   * Fetches survey attachments
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
   * Fetches survey attachments
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
   * @parma attachment
   */
  const onDeleteAttachmentClick = (attachment: Attachment) => {
    setAttachmentToBeDeleted(attachment);
    setDeletingAttachment(true);
  };

  /**
   * Handler for delete attachment cloase
   */
  const onDeleteAttachmentClose = async () => {
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
   */
  const onAttachmentDrop = async (addedFiles: File[]) => {
    if (addedFiles.length !== 1 || !keycloak?.token) {
      return;
    }

    const [ addedFile ] = FileUploadUtils.normalizeFileNames([ addedFiles[0] ]);
    const uploadData = await FileUploadUtils.upload(keycloak.token, addedFile);
    const { xhrRequest, uploadUrl, formData, key } = uploadData;
    
    xhrRequest.open("POST", uploadUrl, true);
    xhrRequest.send(formData);
    const fileUrl = `${uploadUrl}/${key}`;

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
   * Renders mobile delete attachment button
   * 
   * @param onClick on click event handler
   */
  const renderMobileDeleteAttachment = (onClick?: React.MouseEventHandler<HTMLButtonElement>) => (
    <IconButton onClick={ onClick }>
      <Delete/>
    </IconButton>
  );

  /**
   * Renders mobile delete attachment button
   * 
   * @param onClick on click event handler
   */
  const renderMobileAttachment = (onClick?: React.MouseEventHandler<HTMLButtonElement>) => (
    <SurveyButton
      variant="text"
      color="primary"
      startIcon={ <Delete/> }
      onClick={ onClick }
    >
      { strings.generic.delete }
    </SurveyButton>
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
            onClick={ () => window.open(attachment.url) }
            rightControl={ isMobile
              ?
              renderMobileDeleteAttachment(() => onDeleteAttachmentClick(attachment))
              :
              renderMobileAttachment(() => onDeleteAttachmentClick(attachment)) }
          />
        ))
      }
    </Stack>
  );

  /**
   * Renders delete hazardous material dialog
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
      { renderDeleteAttachmentDialog() }
    </>
  );
};

export default AttachmentView;