export enum LeaveTypeEnum {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
}

export enum LeaveStatusEnum {
  PENDING = 'PENDING', // 승인대기중
  APPROVED = 'APPROVED', // 승인완료
  REJECTED = 'REJECTED', // 거절
  CANCELLED = 'CANCELLED', // 취소
}
