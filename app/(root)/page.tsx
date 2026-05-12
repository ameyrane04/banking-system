import HeaderBox from '@/components/HeaderBox'
import FinancialInsights from '@/components/FinancialInsights';
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async ({ searchParams: { id, page, transfer } }: SearchParamProps) => {
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({ 
    userId: loggedIn.$id 
  })

  if(!accounts) return;
  
  const accountsData = accounts?.data;
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

  const account = await getAccount({ appwriteItemId })

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext="Access and manage your account and transactions efficiently."
          />

          {transfer === "success" && (
            <div className="success-banner">
              <div>
                <p className="text-16 font-semibold text-success-700">
                  Transfer submitted successfully
                </p>
                <p className="text-14 text-success-700">
                  Your Dwolla transfer was created and the Horizon ledger has been updated.
                </p>
              </div>
            </div>
          )}

          <TotalBalanceBox 
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />

          <FinancialInsights
            accounts={accountsData}
            transactions={account?.transactions || []}
          />
        </header>

        <RecentTransactions 
          accounts={accountsData}
          transactions={account?.transactions}
          appwriteItemId={appwriteItemId}
          page={currentPage}
        />
      </div>

      <RightSidebar 
        user={loggedIn}
        transactions={account?.transactions}
        banks={accountsData?.slice(0, 2)}
      />
    </section>
  )
}

export default Home
