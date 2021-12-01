import { Paper, useMediaQuery } from "@mui/material";
import Header from "components/layout-components/header";
import React from "react";
import { Content, ContentContainer, Root } from "styled/layouts/side-panel-layout";
import theme from "theme";

/**
 * Component properties
 */
interface Props {
  title: string;
  headerContent?: JSX.Element;
  sidePanelContent: JSX.Element;
  headerControls?: JSX.Element;
  back?: boolean;
}

/**
 * Side panel layout component
 *
 * @param props component properties
 */
const SidePanelLayout: React.FC<Props> = ({
  title,
  headerContent,
  sidePanelContent,
  back,
  headerControls,
  children
}) => {
  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Root>
      <Header
        back={ back }
        title={ title }
        customControls={ headerControls }
      >
        { headerContent }
      </Header>
      <ContentContainer direction="row" spacing={ isMobile ? 0 : 2 }>
        <Paper sx={{ maxWidth: 340, overflow: "auto" }}>
          { sidePanelContent }
        </Paper>
        <Content>
          { children }
        </Content>
      </ContentContainer>
    </Root>
  );
};

export default SidePanelLayout;