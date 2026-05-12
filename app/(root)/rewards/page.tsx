import HeaderBox from "@/components/HeaderBox";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { formatAmount } from "@/lib/utils";
import { BadgePercent, Gift, Sparkles, Trophy } from "lucide-react";

const vouchers = [
  {
    title: "Transfer Booster",
    description: "Earn bonus points on your next Horizon transfer.",
    points: 250,
    tag: "Cashback",
  },
  {
    title: "Coffee Credit",
    description: "Redeem a lifestyle voucher from your rewards balance.",
    points: 400,
    tag: "Voucher",
  },
  {
    title: "Priority Support",
    description: "Unlock premium support for your demo banking profile.",
    points: 600,
    tag: "Member perk",
  },
];

const Rewards = async () => {
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({ userId: loggedIn.$id });
  const firstAccountId = accounts?.data?.[0]?.appwriteItemId;
  const account = firstAccountId ? await getAccount({ appwriteItemId: firstAccountId }) : null;
  const transactions: Transaction[] = account?.transactions || [];

  const transferCount = transactions.filter((transaction) => transaction.category === "Transfer").length;
  const linkedAccounts = accounts?.totalBanks || 0;
  const totalBalance = accounts?.totalCurrentBalance || 0;
  const points = linkedAccounts * 150 + transferCount * 75 + Math.max(0, Math.floor(totalBalance / 25));
  const cashbackValue = points * 0.01;
  const nextTierPoints = 1000;
  const progress = Math.min(100, Math.round((points / nextTierPoints) * 100));

  return (
    <section className="rewards">
      <HeaderBox
        title="Rewards"
        subtext="Earn points from linked accounts, transfers, and healthy account activity."
      />

      <div className="rewards-hero">
        <div className="flex flex-col gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/15 text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-16 font-medium text-blue-100">Horizon points</p>
            <h1 className="text-36 font-semibold text-white">{points.toLocaleString()}</h1>
          </div>
          <p className="max-w-xl text-14 text-blue-100">
            Your activity is building a rewards profile. Transfer funds, connect accounts, and keep using Horizon to unlock better perks.
          </p>
        </div>

        <div className="rewards-cashback">
          <p className="text-14 text-blue-100">Estimated cashback value</p>
          <p className="text-30 font-semibold text-white">{formatAmount(cashbackValue)}</p>
          <div className="mt-4 h-2 rounded-full bg-white/20">
            <div className="h-2 rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-12 text-blue-100">{progress}% toward Gold tier</p>
        </div>
      </div>

      <div className="reward-stats">
        <div className="reward-stat">
          <Trophy className="text-amber-600" size={22} />
          <div>
            <p className="text-12 uppercase text-gray-500">Tier</p>
            <p className="text-18 font-semibold text-gray-900">{points >= 1000 ? "Gold" : "Silver"}</p>
          </div>
        </div>
        <div className="reward-stat">
          <BadgePercent className="text-blue-700" size={22} />
          <div>
            <p className="text-12 uppercase text-gray-500">Transfers</p>
            <p className="text-18 font-semibold text-gray-900">{transferCount}</p>
          </div>
        </div>
        <div className="reward-stat">
          <Gift className="text-pink-700" size={22} />
          <div>
            <p className="text-12 uppercase text-gray-500">Available perks</p>
            <p className="text-18 font-semibold text-gray-900">{vouchers.length}</p>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="header-2">Redeemable vouchers</h2>
        <div className="voucher-grid">
          {vouchers.map((voucher) => (
            <article key={voucher.title} className="voucher-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-16 font-semibold text-gray-900">{voucher.title}</p>
                  <p className="mt-1 text-14 text-gray-600">{voucher.description}</p>
                </div>
                <span className="rounded-full bg-blue-25 px-3 py-1 text-12 font-medium text-blue-700">
                  {voucher.tag}
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-14 font-medium text-gray-600">{voucher.points} points</p>
                <button className="rounded-lg border border-gray-300 px-4 py-2 text-14 font-semibold text-gray-700">
                  Redeem
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};

export default Rewards;
