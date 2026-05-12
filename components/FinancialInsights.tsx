import { ArrowDownLeft, ArrowUpRight, Landmark, ShieldCheck } from "lucide-react";

import { formatAmount } from "@/lib/utils";

const getAmount = (transaction: Transaction) => Number(transaction.amount) || 0;

const FinancialInsights = ({
  accounts,
  transactions = [],
}: {
  accounts: Account[];
  transactions: Transaction[];
}) => {
  const moneyIn = transactions.reduce((total, transaction) => {
    return transaction.type === "credit" ? total + getAmount(transaction) : total;
  }, 0);

  const moneyOut = transactions.reduce((total, transaction) => {
    const isDebit =
      transaction.type === "debit" ||
      transaction.category === "Transfer" ||
      getAmount(transaction) < 0;

    return isDebit ? total + Math.abs(getAmount(transaction)) : total;
  }, 0);

  const netMovement = moneyIn - moneyOut;
  const connectedAccounts = accounts.length;
  const transferCount = transactions.filter(
    (transaction) => transaction.category === "Transfer"
  ).length;

  const insights = [
    {
      label: "Net movement",
      value: formatAmount(netMovement),
      detail: netMovement >= 0 ? "Positive cash flow" : "Outgoing this period",
      icon: netMovement >= 0 ? ArrowUpRight : ArrowDownLeft,
      tone: netMovement >= 0 ? "text-success-700 bg-success-50" : "text-red-700 bg-red-50",
    },
    {
      label: "Money in",
      value: formatAmount(moneyIn),
      detail: "Credits and deposits",
      icon: ArrowDownLeft,
      tone: "text-blue-700 bg-blue-50",
    },
    {
      label: "Money out",
      value: formatAmount(moneyOut),
      detail: "Transfers and debits",
      icon: ArrowUpRight,
      tone: "text-amber-700 bg-amber-50",
    },
    {
      label: "Linked accounts",
      value: connectedAccounts.toString(),
      detail: `${transferCount} transfer${transferCount === 1 ? "" : "s"} logged`,
      icon: Landmark,
      tone: "text-violet-700 bg-violet-50",
    },
  ];

  return (
    <section className="insights-grid">
      <div className="insight-banner">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-bankGradient shadow-sm">
          <ShieldCheck size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-14 font-semibold text-gray-900">Sandbox banking environment</p>
          <p className="text-12 text-gray-600">
            Appwrite auth, Plaid bank linking, and Dwolla transfer rails are active for demo testing.
          </p>
        </div>
      </div>

      {insights.map((insight) => {
        const Icon = insight.icon;

        return (
          <div key={insight.label} className="insight-card">
            <div className={`flex size-10 items-center justify-center rounded-lg ${insight.tone}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-12 font-medium uppercase text-gray-500">{insight.label}</p>
              <p className="text-20 font-semibold text-gray-900">{insight.value}</p>
              <p className="text-12 text-gray-600">{insight.detail}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default FinancialInsights;
