import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

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
    marginBottom:10
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
    textAlign: 'center',
    color: 'grey',
  },
  bottomMargin: {
    marginBottom: 20
  },
});

interface Props {
  order: Order
}

const PdfDocument: React.FC<Props> = ({ order }) => (
  <Document>
    <Page size="A4" style={ styles.page } wrap>
      <Text style={styles.header} fixed>
        JSP-Keittiöt tarjous { new Date().getDate() }.{ new Date().getMonth() + 1 }.{ new Date().getFullYear() }
      </Text>
      <View style={styles.section} wrap={false}>
        <Text style={{ marginBottom: 2 }}>Asiakkaan tiedot:</Text>
        <Text style={styles.information}>{ order.orderInfo.customer }</Text>
        <Text style={styles.information}>{ order.orderInfo.homeAddress }</Text>
        <Text style={styles.information}>{ order.orderInfo.city }</Text>
        <Text style={styles.information}>{ order.orderInfo.phoneNumber }</Text>
        <Text style={styles.information}>{ order.orderInfo.email }</Text>
        <Text style={styles.information}>{ order.orderInfo.socialMediaPermission }</Text>
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={{ marginBottom: 2 }}>Laskutus tiedot:</Text>
        <Text style={styles.information}>{ order.orderInfo.billingAddress }</Text>
        <Text style={styles.information}>{ order.orderInfo.homeAddress }</Text>
        <Text>{ order.orderInfo.city }</Text>
        <Text style={styles.information}>{ order.orderInfo.phoneNumber }</Text>
        <Text style={styles.information}>{ order.orderInfo.email }</Text>
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Kohteen tiedot</Text>
        <Text style={styles.listItemBody}>Huone: { order.orderInfo.room }</Text>
        <Text style={styles.listItemBody}>Toimitusosoite: { order.orderInfo.deliveryAddress }</Text>
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Tasot</Text>
        {order.counterTops.map(counterTop => {
          return (
            <Text style={styles.listItemBody}>
              {counterTop.modelName}, {counterTop.thickness}, {counterTop.type}
            </Text>
          )
        })}
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Välitasot</Text>
        {order.intermediateSpaces.map(intermediateSpace => {
          return (
            <Text style={styles.listItemBody}>
              {intermediateSpace.name}, {intermediateSpace.supplier}
            </Text>
          )
        })}
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Runko</Text>
            <Text style={styles.listItemBody}>
              {order.counterFrame.color}, {order.counterFrame.cornerStripe}, {order.counterFrame.extraSide}, {order.counterFrame.plinth}
            </Text>
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Mekanismit</Text>
        {order.mechanisms.map(mechanism => {
          return (
            <Text style={styles.listItemBody}>
              {mechanism.name}, {mechanism.supplier}
            </Text>
          )
        })}
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Ovet</Text>
        {order.doors.map(door => {
          return (
            <Text style={styles.listItemBody}>
              {door.modelName}, {door.doorColor}, {door.glassColor}, Lasiovi: {door.isGlassDoor ? "Kyllä" : "Ei"} 
            </Text>
          )
        })}
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Vetimet</Text>
        {order.handles.map(handle => {
          return (
            <Text style={styles.listItemBody}>
              {handle.doorModelName}, {handle.color}, Merkitty kuviin: {handle.markedInImages ? "Kyllä" : "Ei"} 
            </Text>
          )
        })}
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Laatikostot (toimitetaan Novahidastimilla)</Text>
        <Text style={styles.listItemBody}>
          {order.drawersInfo.cutleryCompartments}, {order.drawersInfo.trashbins}, Merkitty kuviin: {order.drawersInfo.markedInImages ? "Kyllä" : "Ei"} 
        </Text>
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Kodinkoneet ja tarvikkeet</Text>
        {order.domesticAppliances.map(domesticAppliance => {
          return (
            <Text style={styles.listItemBody}>
              {domesticAppliance.name}, {domesticAppliance.supplier}
            </Text>
          )
        })}
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Muut tuotteet</Text>
        {order.otherProducts.map(otherProduct => {
          return (
            <Text style={styles.listItemBody}>
              {otherProduct.name}, {otherProduct.supplier}
            </Text>
          )
        })}
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Altaat</Text>
        {order.sinks.map(sink => {
          return (
            <Text style={styles.listItemBody}>
              {sink.name}, {sink.supplier}
            </Text>
          )
        })}
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Valot / sähkötarvikkeet</Text>
        {order.electricProducts.map(electricProduct => {
          return (
            <Text style={styles.listItemBody}>
              {electricProduct.name}, {electricProduct.supplier}
            </Text>
          )
        })}
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Asennus</Text>
        <Text style={styles.listItemBody}>
          {order.installation.isCustomerInstallation ? "Asiakas" : "JSP-keittiöt"} 
        </Text>
      </View>
      <View style={styles.section} wrap={false}>
        <Text style={styles.listItemHeader}>Muut huomiot</Text>
        <Text style={styles.listItemBody}>
          {order.otherProductsAdditionalInformation } 
        </Text>
      </View>
      <View style={ styles.section} wrap={false}>
        <Text style={ styles.listItemHeader }>Tarjous</Text>
        <Text style={ styles.listItemBody }>Veroton hinta:</Text>
        <Text style={ styles.listItemBody }>{order.orderInfo.priceTaxFree } €</Text>
        <Text style={ styles.listItemBody }>Yhteensä (alv 24%):</Text>
        <Text style={ styles.listItemBody }>{order.orderInfo.price } €</Text>
      </View>
      <View style={styles.section} wrap={false}>
        <Text>Toimitustiedot ja tarvittaessa kokoamisohjeet toimitetaan myöhemmin</Text>
        <Text></Text>
        <Text>Kiitos tilauksesta!</Text>
      </View>
      <Text style={ styles.bottomMargin } fixed />
    </Page>
  </Document>
);

export default PdfDocument;