/**
 * The Law of Receipts: Core Financial Logic
 */

export const SPLIT_RATIO = {
    CASH: 1 / 3,
    CHEQUE: 2 / 3
};

/**
 * Calculates the split debt for a new invoice.
 * @param {number} totalAmount 
 * @returns {object} { cashDebt, chequeDebt }
 */
export function calculateInvoiceSplit(totalAmount) {
    return {
        cashDebt: Number((totalAmount * SPLIT_RATIO.CASH).toFixed(2)),
        chequeDebt: Number((totalAmount * SPLIT_RATIO.CHEQUE).toFixed(2))
    };
}

/**
 * Processes a receipt and applies it to debt according to the coverage algorithm.
 * 
 * Step A: Cash Funds cover Cash Debt first.
 * Step B: Cheque Funds cover Cheque Debt only.
 * Step C: Surplus Cash Funds cover remaining Cheque Debt.
 * Rule: Cheque Funds NEVER cover Cash Debt (unless exception).
 * 
 * @param {object} debts { cash, cheque }
 * @param {object} payment { amount, method, isException }
 * @returns {object} Updated debts and payment summary
 */
export function applyPayment(debts, payment) {
    let { cash: cashDebt, cheque: chequeDebt } = debts;
    const { amount, method, isException } = payment;

    const isCashFund = method === 'CASH' || isException === true;
    let remainingPayment = amount;

    if (isCashFund) {
        // Step A: Cash Funds cover Cash Debt first
        const cashCoverage = Math.min(remainingPayment, cashDebt);
        cashDebt -= cashCoverage;
        remainingPayment -= cashCoverage;

        // Step C: Surplus Cash Funds cover Cheque Debt
        if (remainingPayment > 0) {
            const chequeCoverage = Math.min(remainingPayment, chequeDebt);
            chequeDebt -= chequeCoverage;
            remainingPayment -= chequeCoverage;
        }
    } else {
        // Step B: Cheque Funds cover Cheque Debt only
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

/**
 * Calculates current status of an invoice based on total paid vs total amount.
 */
export function getInvoiceStatus(totalAmount, remainingTotal) {
    if (remainingTotal <= 0) return 'PAID';
    if (remainingTotal < totalAmount) return 'PARTIALLY_PAID';
    return 'UNPAID';
}
