class StringUtilService {
  leftZero = (value: any, size: number) => {
    let s = value + '';
    while (s.length < size) s = '0' + s;
    return s;
  };
}

export default new StringUtilService();
