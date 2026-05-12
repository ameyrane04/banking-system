"use client";

import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import TransactionsTable from "@/components/TransactionsTable";
import {
  formatAmount,
  formatDateTime,
  getTransactionStatus,
  removeSpecialCharacters,
} from "@/lib/utils";

const getSignedAmount = (transaction: Transaction) => {
  const amount = Number(transaction.amount) || 0;

  return transaction.type === "debit" || transaction.category === "Transfer"
    ? -Math.abs(amount)
    : amount;
};

const getUniqueValues = (transactions: Transaction[], key: keyof Transaction) => {
  return Array.from(
    new Set(
      transactions
        .map((transaction) => transaction[key])
        .filter(Boolean)
        .map(String)
    )
  );
};

const TransactionHistoryClient = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => getUniqueValues(transactions, "category"),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const transactionStatus = getTransactionStatus(
        new Date(transaction.date),
        transaction.category
      );
      const name = removeSpecialCharacters(transaction.name).toLowerCase();
      const matchesSearch =
        !normalizedQuery ||
        name.includes(normalizedQuery) ||
        transaction.category.toLowerCase().includes(normalizedQuery) ||
        transaction.paymentChannel.toLowerCase().includes(normalizedQuery);

      const matchesStatus = status === "all" || transactionStatus === status;
      const matchesType = type === "all" || transaction.type === type;
      const matchesCategory = category === "all" || transaction.category === category;

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [category, query, status, transactions, type]);

  const summary = useMemo(() => {
    const income = filteredTransactions.reduce((total, transaction) => {
      const amount = getSignedAmount(transaction);
      return amount > 0 ? total + amount : total;
    }, 0);

    const spending = filteredTransactions.reduce((total, transaction) => {
      const amount = getSignedAmount(transaction);
      return amount < 0 ? total + Math.abs(amount) : total;
    }, 0);

    return {
      income,
      spending,
      net: income - spending,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const exportCsv = () => {
    const headers = ["Date", "Name", "Amount", "Status", "Channel", "Category"];
    const rows = filteredTransactions.map((transaction) => {
      const status = getTransactionStatus(new Date(transaction.date), transaction.category);

      return [
        formatDateTime(new Date(transaction.date)).dateTime,
        removeSpecialCharacters(transaction.name),
        getSignedAmount(transaction).toFixed(2),
        status,
        transaction.paymentChannel,
        transaction.category,
      ];
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "horizon-transactions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="transaction-workspace">
      <div className="transaction-metrics">
        <div className="transaction-metric">
          <p className="text-12 font-medium uppercase text-gray-500">Visible ledger</p>
          <p className="text-24 font-semibold text-gray-900">{summary.count}</p>
          <p className="text-12 text-gray-600">transactions</p>
        </div>
        <div className="transaction-metric">
          <p className="text-12 font-medium uppercase text-gray-500">Money in</p>
          <p className="text-24 font-semibold text-success-700">
            {formatAmount(summary.income)}
          </p>
          <p className="text-12 text-gray-600">credits</p>
        </div>
        <div className="transaction-metric">
          <p className="text-12 font-medium uppercase text-gray-500">Money out</p>
          <p className="text-24 font-semibold text-red-700">
            {formatAmount(summary.spending)}
          </p>
          <p className="text-12 text-gray-600">debits</p>
        </div>
        <div className="transaction-metric">
          <p className="text-12 font-medium uppercase text-gray-500">Net</p>
          <p className="text-24 font-semibold text-gray-900">{formatAmount(summary.net)}</p>
          <p className="text-12 text-gray-600">movement</p>
        </div>
      </div>

      <div className="transaction-controls">
        <div className="transaction-search">
          <Search size={18} className="text-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions"
            className="w-full bg-transparent text-14 text-gray-900 outline-none placeholder:text-gray-500"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="transaction-filter"
        >
          <option value="all">All statuses</option>
          <option value="Success">Success</option>
          <option value="Processing">Processing</option>
        </select>

        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="transaction-filter"
        >
          <option value="all">All types</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="transaction-filter"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          onClick={exportCsv}
          disabled={!filteredTransactions.length}
          className="transaction-export"
        >
          <Download size={16} />
          Export
        </Button>
      </div>

      <TransactionsTable transactions={filteredTransactions} />
    </section>
  );
};

export default TransactionHistoryClient;
