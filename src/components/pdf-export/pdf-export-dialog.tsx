import React from "react";
import { AppBar, Button, Dialog, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import strings from "localization/strings";
import CloseIcon from "@mui/icons-material/Close";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import PdfDocument from "./pdf-document";
import { Download } from "@mui/icons-material";
import { SurveySummary } from "types";
import { Survey } from "generated/client";

/**
 * Component properties
 */
interface Props {
  open: boolean;
  onClose(): void;
  survey: Survey | undefined;
  surveySummary: SurveySummary;
}

/**
 * Component for PDF export dialog
 *
 * @param props component properties
 */
const PdfExportDialog: React.FC<Props> = ({
  open,
  onClose,
  surveySummary,
  survey
}) => {
  /**
   * Render PDF document
   */
  const renderPdfDocument = () => (
    <PdfDocument selectedSurvey={ survey } summary={ surveySummary }/>
  );

  return (
    <Dialog fullScreen open={ open } onClose={() => onClose()} >
      <AppBar color="primary" elevation={ 10 }>
        <Toolbar>
          <Stack
            direction="row"
            spacing={ 2 }
            alignItems="center"
          >
            <IconButton
              edge="start"
              color="inherit"
              onClick={ () => onClose() }
              aria-label="close"
            >
              <CloseIcon/>
            </IconButton>
            <Typography>
              Purkujätekartoitus PDF esikatselu
            </Typography>
          </Stack>
          <PDFDownloadLink
            style={{ textDecoration: "none", color: "#fff" }}
            document={ renderPdfDocument() }
          >
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<Download/>}
            >
              { strings.generic.download }
            </Button>
          </PDFDownloadLink>
        </Toolbar>
      </AppBar>
      <PDFViewer height="100%">
        { renderPdfDocument() }
      </PDFViewer>
    </Dialog>
  );
};

export default PdfExportDialog;