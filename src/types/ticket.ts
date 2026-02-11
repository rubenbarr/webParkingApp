export interface IPayment {
  bills: {
    "100": number;
    "20": number;
    "200": number;
    "50": number;
    "500": number;
  };
  coins: {
    "0.5": number;
    "1": number;
    "10": number;
    "2": number;
    "5": number;
  };
}
export interface ITicket {
  amount: number;
  cerrado: boolean;
  change: number;
  cocheDentro: boolean;
  creditUsed: string;
  estado: string;
  fechaCocheHaEntrado: string;
  fechaEntrada: string;
  fechaPago: string;
  fechaSalida: string;
  fecha_pago: false;
  gateLabel: string;
  location: string;
  montoPagado: number;
  paidBy: string;
  paymentData: IPayment;
  ticketId: string;
  total_payment: number;
  tolerancia: boolean;
  tiempo_restante:number;
  totalPayed:number;
  total_time:number;
  repago:boolean;
  nuevaCantidadPago: number;
  message: string
  tiempo_restante_tolerancia?: string;
  total_a_pagar: number
}
