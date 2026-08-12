export const LOAN_TABLE = Object.freeze({
  3000: { 6: 749, 8: 578, 10: 486, 12: 432 },
  4000: { 6: 991, 8: 760, 10: 646, 12: 573, 14: 514 },
  5000: { 6: 1233, 8: 941, 10: 804, 12: 716, 14: 641, 16: 584 },
  6000: { 8: 1150, 10: 960, 12: 857, 14: 768, 16: 687 },
  7000: { 8: 1274, 10: 1107, 12: 996, 14: 892, 16: 799 },
  8000: { 10: 1260, 12: 1133, 14: 1014, 16: 912, 18: 811 },
  9000: { 10: 1411, 12: 1245, 14: 1134, 16: 1025, 18: 900 },
  10000: { 10: 1558, 12: 1373, 14: 1225, 16: 1137, 18: 981 },
  11000: { 10: 1707, 12: 1508, 14: 1343, 16: 1249, 18: 1071 },
  12000: { 10: 1858, 12: 1638, 14: 1463, 16: 1360, 18: 1165 },
  13000: { 10: 2002, 12: 1772, 14: 1511, 16: 1359, 18: 1255 },
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

function createUtcPaymentDate(year, month, requestedDay) {
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

  // Días 1 al 6:
  // primer pago el día 15 del mismo mes.
  if (day < 7) {
    return createUtcPaymentDate(
      year,
      month,
      15
    );
  }

  // Días 7 al 21:
  // primer pago el día 30 del mismo mes.
  if (day < 22) {
    return createUtcPaymentDate(
      year,
      month,
      30
    );
  }

  // Día 22 en adelante:
  // primer pago el día 15 del siguiente mes.
  return createUtcPaymentDate(
    year,
    month + 1,
    15
  );
}

export function getNextPaymentDate(paymentDate) {
  const current = new Date(paymentDate);

  if (Number.isNaN(current.getTime())) {
    return null;
  }

  const year = current.getUTCFullYear();
  const month = current.getUTCMonth();

  // Después del día 15 corresponde el día 30.
  // Después del día 30 corresponde el 15 siguiente.
  return current.getUTCDate() === 15
    ? createUtcPaymentDate(year, month, 30)
    : createUtcPaymentDate(year, month + 1, 15);
}

export function formatPaymentDate(date, options = {}) {
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