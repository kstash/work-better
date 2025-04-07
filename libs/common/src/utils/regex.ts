export const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * 이름 형식 정규식
 * 영문 대소문자, 공백 허용 또는 한글 허용, 공백 불허용
 */
export const nameRegex = `^[a-zA-Z\s]+$|^[가-힣]+$`;
