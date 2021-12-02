import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import React from "react";
import SurveyTitle from "../../styled/layout-components/survey-item";

/**
 * Component properties
 */
interface Props {
  title: string;
  subtitle: string;
  onClick?(): void;
}

/**
 * Survey item component
 *
 * @param props component properties
 */
const SurveyItem: React.FC<Props> = ({
  title,
  subtitle,
  onClick,
  children
}) => (
  <Accordion disableGutters>
    <AccordionSummary expandIcon={ <ExpandMore/> }>
      <SurveyTitle onClick={ onClick }>
        <Typography>{ title }</Typography>
        <Typography variant="h5" >{ subtitle }</Typography>
      </SurveyTitle>
    </AccordionSummary>
    <AccordionDetails>
      { children }
    </AccordionDetails>
  </Accordion>
);

export default SurveyItem;