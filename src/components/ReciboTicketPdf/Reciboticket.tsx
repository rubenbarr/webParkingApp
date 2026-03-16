import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { ITicket } from "@/types/ticket";
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
  },
  section: {
    marginBottom: 5,
  },
  header: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "column",
    marginBottom: 3,
  },
  label: {
    fontWeight: "bold",
  },
});

interface TicketProps {
  ticket: ITicket;
  locationTitle: string;
}

export const TicketPDF = (props: TicketProps) => {
  const { ticket, locationTitle } = props;
  return (
    <Document>
      <Page size={[155, 300]} style={styles.page}>
        <View style={styles.section}>
          <View style={{display:"flex", width:"100%", alignItems:"center", justifyContent:"center"}}>
            <Text >Recibo de pago</Text>
          </View>
          <Text style={styles.header}>{locationTitle}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de entrada: </Text>
            <Text>{new Date(ticket.fechaEntrada).toLocaleString("es-MX")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de último pago: </Text>
            <Text>
              {new Date(ticket.fecha_ultimo_pago).toLocaleString("es-MX")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Veces que se pagó: </Text>
            <Text>{ticket.dataPayment.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total de tiempo: </Text>
            <Text>{ticket.total_time}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total pagado: </Text>
            <Text>
              {ticket.dataPayment.reduce(
                (acc, payment) => acc + payment.amount,
                0,
              )}{" "}
              MXN
            </Text>
          </View>
          <View style={styles.section}>
            <Text>{"RFC: COTJ92052353"}</Text>
            <Text>
                Gracias por usar nuestro serviio. Vuelva pronto
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default TicketPDF;
