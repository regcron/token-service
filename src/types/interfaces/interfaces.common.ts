// Interface for custom class ApiError
export interface ApiError extends Error {
  success: boolean;
  message: string;
  statusCode: number;
  data: [] | {};
}

export interface Token {
  name: string;
  symbol: string;
  decimals: string;
  address: string;
  owner: string;
  total_supply: string,
}