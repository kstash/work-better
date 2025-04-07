export enum RedisTypeEnum {
  SINGLE = 'single',
  CLUSTER = 'cluster',
}

export type RedisType = (typeof RedisTypeEnum)[keyof typeof RedisTypeEnum];
