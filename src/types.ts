export type DeployParams = {
  image: string;
};

export type GetPaymentAddressParams = {
  user: string;
};
export type WithdrawParams = {
  user: string;
  asset: string;
  amount: string;
};
