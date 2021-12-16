import { AppBar, Button, Dialog, IconButton, Toolbar, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { Order } from "../../../generated/client";
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import CloseIcon from '@material-ui/icons/Close';
import PdfDocument from "./pdf-document";
import strings from "../../../localization/strings";
import { styles } from "./pdf-export-dialog.styles";

/**
 * Interface describing component properties
 */
interface Props extends WithStyles<typeof styles> {
  order: Order
  open: boolean
  onClose: () => void
}

/**
 * Interface describing component state
 */
interface State {}

/**
 * Component for PDF export dialog
 */
class PdfExportDialog extends React.Component<Props, State> {

  public render = () => {
    const { order, open, onClose, classes } = this.props;
    return (
      <Dialog fullScreen open={open} onClose={() => onClose()} >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => onClose()} aria-label="close">
              <CloseIcon />
            </IconButton>
            <PDFDownloadLink className={classes.saveButton} document={ <PdfDocument order={order}/> }>
              <Button autoFocus color="inherit">
                { strings.generic.save }
              </Button>
            </PDFDownloadLink>
          </Toolbar>
        </AppBar>
        <PDFViewer className={classes.pdfViewer}>
          <PdfDocument order={order} />
        </PDFViewer>
      </Dialog>
    )
  }
}

export default withStyles(styles)(PdfExportDialog);