import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { SurveySummary } from "../../types/index";
import strings from "localization/strings";

const styles = StyleSheet.create({

  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontSize: 14
  },

  information: {
    fontSize: 12
  },

  section: {
    marginBottom: 10
  },

  listItemHeader: {
    backgroundColor: "#115D8F",
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    padding: 5
  },

  listItemBody: {
    marginLeft: 5,
    backgroundColor: "#E7EFF4",
    padding: 5,
    fontSize: 12
  },

  image: {
    objectFit: "contain",
    marginRight: "70%"
  },

  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey"
  },

  bottomMargin: {
    marginBottom: 20
  }

});

interface Props {
  summary: SurveySummary;
}

/**
 * PDF document
 * 
 * @param props component properties
 * @returns survey report pdf
 */
const PdfDocument: React.FC<Props> = ({ summary }) => {
  const date = `${new Date().getDate()}.${new Date().getMonth() + 1}.${new Date().getFullYear()}`;
  /**
   * Render document info with current date
   */
  const renderDocumentInfo = () => (
    <Text style={ styles.header } fixed>
      { strings.appTitle }
      { date }
    </Text>
  );

  /**
   * Render building info
   */
  const renderBuildingInfo = () => {
    const buildingInfo = summary.building;
    return (
      <View style={styles.section} wrap={false}>
        <Text style={{ marginBottom: 2 }}>Rakennuksen tiedot</Text>
        <Text style={styles.information}>{ buildingInfo?.buildingId }</Text>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={ styles.page } wrap>
        { renderDocumentInfo() }
        { renderBuildingInfo() }
        {/* <View style={ styles.section } wrap={ false }>
          <Text style={ styles.listItemHeader }>
            Tasot
          </Text>
          { order.counterTops.map(counterTop => {
            return (
              <Text style={styles.listItemBody}>
                {counterTop.modelName}, {counterTop.thickness}, {counterTop.type}
              </Text>
            )
          })}
        </View> */}
      </Page>
    </Document>
  );
};

export default PdfDocument;