class PaymentGateway {
    initiatePayment(amount, currency, callbackUrl) {
        throw new Error("Method not implemented.");
    }

    verifyPayment(paymentReference) {
        throw new Error("Method not implemented.");
    }
}

module.exports = PaymentGateway;
