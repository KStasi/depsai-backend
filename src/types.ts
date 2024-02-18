export type DeployParams = {
  image: string;
  port: string;
  command: string;
  minMemGib?: string;
  minStorageGib?: string;
  minCpuThreads?: string;
  minCpuCores?: string;
  budget?: string;
  envs?: { [key: string]: string };
};

export type GetPaymentAddressParams = {
  user: string;
};
export type WithdrawParams = {
  user: string;
  asset: string;
  amount: string;
};

export type DeployConfig = {
  package: string;
  command: string;
  port: string;
  minMemGib?: string;
  minStorageGib?: string;
  minCpuThreads?: string;
  minCpuCores?: string;
  budget?: string;
};

export type ChildConfig = {
  YAGNA_APPKEY: string;
  PORT: string;
  USER_PORT: string;
  RUN_COMMAND: string;
  PACKAGE: string;
  MIN_MEM_GIB?: string;
  MIN_STORAGE_GIB?: string;
  MIN_CPU_THREADS?: string;
  MIN_CPU_CORES?: string;
  BUDGET?: string;
};
