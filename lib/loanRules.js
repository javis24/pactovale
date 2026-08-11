export const LOAN_TABLE = Object.freeze({
  1000: { 6: 266, 8: 208, 10: 178 },
  1500: { 6: 385, 8: 299, 10: 254 },
  2000: { 6: 504, 8: 389, 10: 329 },
  2500: { 6: 624, 8: 480, 10: 405 },
  3000: { 6: 743, 8: 570, 10: 480 },
  3500: { 6: 862, 8: 661, 10: 556 },
  4000: { 6: 982, 8: 751, 10: 631 },
  4500: { 8: 842, 10: 707 },
  5000: { 8: 932, 10: 782 },
  5500: { 8: 1023, 10: 858 },
  6000: { 8: 1113, 10: 933 },
  6500: { 10: 1009 },
  7000: { 10: 1084 },
  7500: { 10: 1160 },
  8000: { 10: 1235 },
  8500: { 10: 1311 },
  9000: { 10: 1386 },
  9500: { 10: 1462 },
  10000: { 10: 1537 },
});

export const BUSINESS_TIME_ZONE = "America/Monterrey";

export function getLoanPaymentAmount(amount, totalPayments) {
  const normalizedAmount = Number(amount);
  const normalizedTerm = Number(totalPayments);

  const payment =
    LOAN_TABLE[normalizedAmount]?.[normalizedTerm];

  return Number.isFinite(payment) ? payment : null;
}

export function getApprovalAmountOptions(
  requestedAmount,
  totalPayments
) {
  const maximum = Number(requestedAmount);
  const term = Number(totalPayments);

  if (!Number.isFinite(maximum)) {
    return [];
  }

  return Object.keys(LOAN_TABLE)
    .map(Number)
    .filter(
      (amount) =>
        amount <= maximum &&
        getLoanPaymentAmount(amount, term) !== null
    )
    .sort((a, b) => b - a);
}

function createUtcPaymentDate(
  year,
  month,
  requestedDay
) {
  const lastDayOfMonth = new Date(
    Date.UTC(year, month + 1, 0, 12)
  ).getUTCDate();

  return new Date(
    Date.UTC(
      year,
      month,
      Math.min(requestedDay, lastDayOfMonth),
      12
    )
  );
}

function getBusinessDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month) - 1,
    day: Number(values.day),
  };
}

export function getFirstPaymentDate(approvalDate) {
  const approvedAt = new Date(approvalDate);

  if (Number.isNaN(approvedAt.getTime())) {
    return null;
  }

  const { year, month, day } =
    getBusinessDateParts(approvedAt);

  // Si se autoriza antes del día 15,
  // el primer pago será el día 15 del mismo mes.
  //
  // Si se autoriza el día 15 o después,
  // el primer pago será el día 15 del mes siguiente.
  return day < 15
    ? createUtcPaymentDate(year, month, 15)
    : createUtcPaymentDate(year, month + 1, 15);
}

export function getNextPaymentDate(paymentDate) {
  const current = new Date(paymentDate);

  if (Number.isNaN(current.getTime())) {
    return null;
  }

  const year = current.getUTCFullYear();
  const month = current.getUTCMonth();

  // Después del día 15 corresponde el día 30.
  // En febrero se usa el último día del mes.
  //
  // Después del cierre mensual corresponde
  // el día 15 del siguiente mes.
  return current.getUTCDate() === 15
    ? createUtcPaymentDate(year, month, 30)
    : createUtcPaymentDate(year, month + 1, 15);
}

export function formatPaymentDate(
  date,
  options = {}
) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Fecha pendiente";
  }

  return value.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
    ...options,
  });
}

export function buildPaymentSchedule({
  startDate,
  totalPayments,
  paymentsMade = 0,
}) {
  const firstPaymentDate =
    getFirstPaymentDate(startDate);

  const paymentCount = Number(totalPayments);
  const completedPayments = Number(paymentsMade);

  if (
    !firstPaymentDate ||
    !Number.isInteger(paymentCount) ||
    paymentCount <= 0
  ) {
    return [];
  }

  const schedule = [];
  let currentPaymentDate = firstPaymentDate;

  for (
    let index = 1;
    index <= paymentCount;
    index += 1
  ) {
    schedule.push({
      number: index,
      date: new Date(currentPaymentDate),

      dateString: formatPaymentDate(
        currentPaymentDate,
        {
          year: undefined,
          month: "short",
        }
      ),

      status:
        index <= completedPayments
          ? "pagado"
          : "pendiente",
    });

    currentPaymentDate =
      getNextPaymentDate(currentPaymentDate);
  }

  return schedule;
}