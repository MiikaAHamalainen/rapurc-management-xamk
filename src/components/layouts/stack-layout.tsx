import Header from "components/layout-components/header";
import React from "react";
import { Content, Root } from "styled/layouts/stack-layout";

interface Props {
  title: string;
  headerContent?: JSX.Element;
  back?: boolean;
}

/**
 * Stack layout component
 *
 * @param props component properties
 */
const StackLayout: React.FC<Props> = ({
  title,
  headerContent,
  back,
  children
}) => {
  return (
    <Root>
      <Header back={ back } title={ title }>
        { headerContent }
      </Header>
      <Content>
        { children }
      </Content>
    </Root>
  );
};

export default StackLayout;