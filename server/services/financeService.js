/**
 * FinanceService: Backend implementation of the Law of Receipts
 */

export const SPLIT_RATIO = {
    CASH: 1 / 3,
    CHEQUE: 2 / 3
};

export class FinanceService {
    static calculateInvoiceSplit(totalAmount) {
        return {
            cashDebt: Number((totalAmount * SPLIT_RATIO.CASH).toFixed(2)),
            chequeDebt: Number((totalAmount * SPLIT_RATIO.CHEQUE).toFixed(2))
        };
    }

    static applyPayment(debts, payment) {
        let { cash: cashDebt, cheque: chequeDebt } = debts;
        const { amount, method, isException } = payment;

        const isCashFund = method === 'CASH' || isException === true;
        let remainingPayment = amount;

        if (isCashFund) {
            const cashCoverage = Math.min(remainingPayment, cashDebt);
            cashDebt -= cashCoverage;
            remainingPayment -= cashCoverage;

            if (remainingPayment > 0) {
                const chequeCoverage = Math.min(remainingPayment, chequeDebt);
                chequeDebt -= chequeCoverage;
                remainingPayment -= chequeCoverage;
            }
        } else {
            const chequeCoverage = Math.min(remainingPayment, chequeDebt);
            chequeDebt -= chequeCoverage;
            remainingPayment -= chequeCoverage;
        }

        return {
            remainingDebts: {
                cash: Number(cashDebt.toFixed(2)),
                cheque: Number(chequeDebt.toFixed(2))
            },
            surplus: Number(remainingPayment.toFixed(2))
        };
    }

    static getInvoiceStatus(totalAmount, remainingTotal) {
        if (remainingTotal <= 0) return 'PAID';
        if (remainingTotal < totalAmount) return 'PARTIALLY_PAID';
        return 'UNPAID';
    }
}
