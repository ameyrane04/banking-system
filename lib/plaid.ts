import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const plaidEnvironment = process.env.PLAID_ENV ?? 'sandbox';

const plaidBasePath =
  PlaidEnvironments[plaidEnvironment as keyof typeof PlaidEnvironments];

if (!plaidBasePath) {
  throw new Error(
    'Invalid PLAID_ENV. Use sandbox, development, or production.'
  );
}

const configuration = new Configuration({
  basePath: plaidBasePath,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    }
  }
})

export const plaidClient = new PlaidApi(configuration);
