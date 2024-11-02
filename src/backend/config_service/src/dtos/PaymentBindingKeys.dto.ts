interface PaymentBindingKey {
    ConsumePaymentOrder: string;
    PublishPaymentOrder: string;
}
export const Paymentconfig: PaymentBindingKey = {
    ConsumePaymentOrder: "BDpayment_request",
    PublishPaymentOrder: "payment_main_listener"
};